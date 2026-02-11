import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "@/components/icons";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface SocialLoginProps {
  mode?: "login" | "connect";
  onSuccess?: () => void;
  googleConnected?: boolean;
  hideSeparator?: boolean;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SocialLogin({ mode = "login", onSuccess, googleConnected, hideSeparator = false }: SocialLoginProps) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const handleGoogleLogin = () => {
    setIsLoadingGoogle(true);
    const endpoint = mode === "connect" ? "/api/auth/google?connect=true" : "/api/auth/google";
    window.location.href = endpoint;
  };

  const handleDisconnect = async () => {
    setFormMessage(null);
    setIsLoadingGoogle(true);
    try {
      await apiRequest("POST", "/api/auth/disconnect/google");
      setFormMessage({ type: 'success', text: `${t("toast.success")}. ${t("auth.google.disconnected")}` });
      onSuccess?.();
    } catch (err: any) {
      setFormMessage({ type: 'error', text: `${t("toast.error")}. ${err.message || t("errors.generic")}` });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const messageBlock = formMessage && (
    <div className={`mb-4 p-3 rounded-xl text-center text-sm font-medium ${
      formMessage.type === 'error' 
        ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
        : formMessage.type === 'success'
        ? 'bg-accent/10 border border-accent/20 text-accent'
        : 'bg-accent/5 dark:bg-accent/10 border border-accent/20 dark:border-accent/30 text-accent dark:text-accent'
    }`} data-testid="form-message">
      {formMessage.text}
    </div>
  );

  if (mode === "connect") {
    return (
      <div className="space-y-3">
        {messageBlock}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <GoogleIcon className="w-5 h-5" />
            <span className="font-medium text-sm">Google</span>
          </div>
          {googleConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={isLoadingGoogle}
              className="text-destructive border-destructive/50"
              data-testid="button-disconnect-google"
            >
              {isLoadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.google.disconnect")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle}
              data-testid="button-connect-google"
            >
              {isLoadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.google.connect")}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messageBlock}
      {!hideSeparator && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-card px-3 text-muted-foreground">— {t("auth.continueQuickly")} —</span>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isLoadingGoogle}
        className="w-full h-12 font-medium flex items-center justify-center gap-3 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-zinc-800 border-gray-300 dark:border-border transition-all shadow-sm"
        data-testid="button-google-login"
      >
        {isLoadingGoogle ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <GoogleIcon className="w-5 h-5" />
            <span className="text-gray-700 dark:text-gray-200">{t("auth.google.signIn")}</span>
          </>
        )}
      </Button>
    </div>
  );
}
