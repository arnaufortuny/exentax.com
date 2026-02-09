import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import i18n from "@/lib/i18n";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "/auth/login";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const languageSynced = useRef(false);

  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (user?.preferredLanguage && !languageSynced.current) {
      i18n.changeLanguage(user.preferredLanguage);
      localStorage.removeItem("i18n_nav_override");
      languageSynced.current = true;
    }
    if (!user) {
      languageSynced.current = false;
    }
  }, [user]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refetch,
  };
}
