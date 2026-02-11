import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";

export function NewsletterToggle() {
  const { t } = useTranslation();
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);
  const { data: status, isLoading } = useQuery<{ isSubscribed: boolean }>({
    queryKey: ["/api/newsletter/status"],
  });

  const mutation = useMutation({
    mutationFn: async (subscribe: boolean) => {
      setFormMessage(null);
      const endpoint = subscribe ? "/api/newsletter/subscribe" : "/api/newsletter/unsubscribe";
      await apiRequest("POST", endpoint, subscribe ? { email: undefined } : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/status"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.preferencesUpdated") + ". " + t("dashboard.toasts.preferencesUpdatedDesc") });
    }
  });

  if (isLoading) return <div className="w-10 h-6 bg-gray-100 dark:bg-muted animate-pulse rounded-full" />;

  return (
    <div className="flex items-center gap-3">
      <Switch 
        checked={status?.isSubscribed} 
        onCheckedChange={(val) => mutation.mutate(val)}
        disabled={mutation.isPending}
      />
      {formMessage && (
        <div className={`p-2 rounded-xl text-center text-xs font-medium ${
          formMessage.type === 'error' 
            ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
            : formMessage.type === 'success'
            ? 'bg-accent/10 border border-accent/20 text-accent'
            : 'bg-accent/5 dark:bg-accent/10 border border-accent/20 dark:border-accent/30 text-accent dark:text-accent'
        }`} data-testid="form-message">
          {formMessage.text}
        </div>
      )}
    </div>
  );
}
