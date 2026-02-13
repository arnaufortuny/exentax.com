import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import i18n from "@/lib/i18n";
import { getStoredAuthToken, setStoredAuthToken } from "@/lib/queryClient";

async function fetchUser(): Promise<User | null> {
  const headers: Record<string, string> = {};
  const token = getStoredAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/auth/user", {
    credentials: "include",
    headers: Object.keys(headers).length > 0 ? headers : undefined,
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
  const headers: Record<string, string> = {};
  const token = getStoredAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
  setStoredAuthToken(null);
  window.location.href = "/auth/login";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const languageSynced = useRef(false);

  const { data: user, isLoading: queryIsLoading, isFetching, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const isLoading = queryIsLoading && user === undefined;

  useEffect(() => {
    if (user?.preferredLanguage && !languageSynced.current) {
      const navOverride = localStorage.getItem("i18n_nav_override");
      if (navOverride) {
        i18n.changeLanguage(navOverride);
      } else {
        i18n.changeLanguage(user.preferredLanguage);
      }
      languageSynced.current = true;
    }
    if (!user) {
      languageSynced.current = false;
    }
  }, [user]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("i18n_nav_override");
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refetch,
  };
}
