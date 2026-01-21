import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { UpdateLlcApplicationRequest } from "@shared/schema";

export function useLlcApplication(id: number) {
  return useQuery({
    queryKey: [api.llc.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.llc.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Application not found");
      if (!res.ok) throw new Error("Failed to fetch application");
      return api.llc.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useUpdateLlcApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateLlcApplicationRequest }) => {
      const url = buildUrl(api.llc.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update application");
      }
      
      return api.llc.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.llc.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}
