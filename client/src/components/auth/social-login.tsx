import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SocialLoginProps {
  mode?: "login" | "connect";
  onSuccess?: () => void;
  googleConnected?: boolean;
}

export function SocialLogin({ mode = "login", onSuccess, googleConnected }: SocialLoginProps) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = () => {
    setIsLoadingGoogle(true);
    const endpoint = mode === "connect" ? "/api/auth/google?connect=true" : "/api/auth/google";
    window.location.href = endpoint;
  };

  const handleDisconnect = async () => {
    setIsLoadingGoogle(true);
    try {
      await apiRequest("POST", "/api/auth/disconnect/google");
      toast({ title: "Exito", description: "Cuenta de Google desvinculada" });
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al desvincular Google",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  if (mode === "connect") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <SiGoogle className="w-5 h-5 text-red-500" />
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
              {isLoadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : "Desvincular"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle}
              data-testid="button-connect-google"
            >
              {isLoadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vincular"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-zinc-900 px-2 text-muted-foreground">O continuar con</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isLoadingGoogle}
        className="w-full rounded-full h-11 font-medium flex items-center justify-center gap-2"
        data-testid="button-google-login"
      >
        {isLoadingGoogle ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <SiGoogle className="w-5 h-5 text-red-500" />
            Continuar con Google
          </>
        )}
      </Button>
    </div>
  );
}
