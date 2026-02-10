import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { LogOut } from "@/components/icons";

interface AccountStatusGuardProps {
  children: ReactNode;
  allowPending?: boolean;
}

export function AccountStatusGuard({ children, allowPending = false }: AccountStatusGuardProps) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.accountStatus === 'pending' && !allowPending) {
      setLocation("/dashboard");
    }
  }, [authLoading, isAuthenticated, user?.accountStatus, allowPending, setLocation]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  if (user.accountStatus === 'deactivated') {
    return <DeactivatedPage />;
  }

  if (user.accountStatus === 'pending' && !allowPending) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function DeactivatedPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
              <circle cx="60" cy="60" r="50" fill="#DBEAFE" stroke="#2C5F8A" strokeWidth="4"/>
              <path d="M60 35V65" stroke="#2C5F8A" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="60" cy="80" r="5" fill="#2C5F8A"/>
            </svg>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight" data-testid="text-deactivated-title">
              {t("auth.accountDeactivated.title")}
            </h1>
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">
              {t("auth.accountDeactivated.description")}
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full sm:w-auto px-8 font-black rounded-full shadow-lg"
            size="lg"
            onClick={() => apiRequest("POST", "/api/auth/logout").then(() => window.location.href = "/")}
            data-testid="button-deactivated-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("nav.logout")}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

