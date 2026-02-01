import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export function NewsletterToggle() {
  const { toast } = useToast();
  const { data: status, isLoading } = useQuery<{ isSubscribed: boolean }>({
    queryKey: ["/api/newsletter/status"],
  });

  const mutation = useMutation({
    mutationFn: async (subscribe: boolean) => {
      const endpoint = subscribe ? "/api/newsletter/subscribe" : "/api/newsletter/unsubscribe";
      await apiRequest("POST", endpoint, subscribe ? { email: undefined } : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/status"] });
      toast({ title: "Preferencias actualizadas", description: "Gracias por quedarte con nosotros" });
    }
  });

  if (isLoading) return <div className="w-10 h-6 bg-gray-100 dark:bg-zinc-700 animate-pulse rounded-full" />;

  return (
    <Switch 
      checked={status?.isSubscribed} 
      onCheckedChange={(val) => mutation.mutate(val)}
      disabled={mutation.isPending}
      data-testid="switch-newsletter-toggle"
    />
  );
}
