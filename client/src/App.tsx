import { Switch, Route, useLocation } from "wouter";
import { queryClient, setStoredAuthToken } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useEffect, Suspense, lazy, Component, memo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import { LoadingScreen } from "@/components/loading-screen";
import { AccountStatusGuard } from "@/components/account-status-guard";

function lazyRetry<T extends { default: React.ComponentType<unknown> }>(
  importFn: () => Promise<T>,
  retries = 2,
  interval = 800
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attemptImport = (remainingRetries: number) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (remainingRetries <= 0) {
            reject(error);
            return;
          }
          setTimeout(() => {
            attemptImport(remainingRetries - 1);
          }, interval);
        });
    };
    attemptImport(retries);
  });
}

const Home = lazy(() => lazyRetry(() => import("@/pages/home")));
const Legal = lazy(() => lazyRetry(() => import("@/pages/legal/terminos")));
const Servicios = lazy(() => lazyRetry(() => import("@/pages/servicios")));
const Privacidad = lazy(() => lazyRetry(() => import("@/pages/legal/privacidad")));
const Reembolsos = lazy(() => lazyRetry(() => import("@/pages/legal/reembolsos")));
const Cookies = lazy(() => lazyRetry(() => import("@/pages/legal/cookies")));
const Contacto = lazy(() => lazyRetry(() => import("@/pages/contacto")));
const FAQ = lazy(() => lazyRetry(() => import("@/pages/faq")));
const MaintenancePage = lazy(() => lazyRetry(() => import("@/pages/maintenance")));
const LlcFormation = lazy(() => lazyRetry(() => import("@/pages/llc-formation")));
const Dashboard = lazy(() => lazyRetry(() => import("@/pages/dashboard")));

const Login = lazy(() => lazyRetry(() => import("@/pages/auth/login.tsx")));
const Register = lazy(() => lazyRetry(() => import("@/pages/auth/register.tsx")));
const ForgotPassword = lazy(() => lazyRetry(() => import("@/pages/auth/forgot-password.tsx")));
const InvoiceGenerator = lazy(() => lazyRetry(() => import("@/pages/invoice-generator")));
const PriceCalculator = lazy(() => lazyRetry(() => import("@/pages/price-calculator")));
const CsvGenerator = lazy(() => lazyRetry(() => import("@/pages/csv-generator")));
const OperatingAgreement = lazy(() => lazyRetry(() => import("@/pages/operating-agreement")));
const LinktreePage = lazy(() => lazyRetry(() => import("@/pages/linktree")));
const AgendarConsultoria = lazy(() => lazyRetry(() => import("@/pages/agendar-consultoria")));
const StartPage = lazy(() => lazyRetry(() => import("@/pages/start")));

interface ErrorBoundaryState {
  hasError: boolean;
  errorCount: number;
  lastError: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  resetKey?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private prevResetKey: string | undefined;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorCount: 0, lastError: '' };
    this.prevResetKey = props.resetKey;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, lastError: error.message };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, errorCount: 0, lastError: '' });
    }
  }

  componentDidCatch(error: Error): void {
    console.error('Page load error:', error);
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorCount: 0, lastError: '' });
  };

  handleReload = (): void => {
    sessionStorage.clear();
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{i18n.t("common.errorLoading")}</h2>
            <p className="text-muted-foreground">{i18n.t("common.errorLoadingDescription")}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-muted text-foreground rounded-md font-medium"
                data-testid="button-retry"
              >
                {i18n.t("common.retry")}
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-accent text-white rounded-md font-medium"
                data-testid="button-reload"
              >
                {i18n.t("common.reloadPage")}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [location]);
  
  return null;
}


function GuardedRoute({ component: Comp, allowPending = false }: { component: React.ComponentType; allowPending?: boolean }) {
  return (
    <AccountStatusGuard allowPending={allowPending}>
      <Comp />
    </AccountStatusGuard>
  );
}

function MainRouter() {
  const [location] = useLocation();
  
  return (
    <ErrorBoundary resetKey={location}>
      <Suspense fallback={<LoadingScreen />}>
        <div className="min-h-screen bg-background">
          <Switch>
            {/* Public routes - accessible to everyone */}
            <Route path="/" component={Home} />
            <Route path="/servicios" component={Servicios} />
            <Route path="/faq" component={FAQ} />
            <Route path="/legal/terminos" component={Legal} />
            <Route path="/legal/privacidad" component={Privacidad} />
            <Route path="/legal/reembolsos" component={Reembolsos} />
            <Route path="/legal/cookies" component={Cookies} />
            <Route path="/agendar-consultoria" component={AgendarConsultoria} />
            <Route path="/start" component={StartPage} />
            <Route path="/links" component={LinktreePage} />
            <Route path="/auth/login" component={Login} />
            <Route path="/auth/register" component={Register} />
            <Route path="/auth/forgot-password" component={ForgotPassword} />

            {/* Protected routes - blocked for deactivated/pending accounts */}
            <Route path="/contacto">{() => <GuardedRoute component={Contacto} />}</Route>
            <Route path="/llc/maintenance">{() => <GuardedRoute component={MaintenancePage} />}</Route>
            <Route path="/llc/formation">{() => <GuardedRoute component={LlcFormation} />}</Route>
            <Route path="/dashboard">{() => <GuardedRoute component={Dashboard} allowPending />}</Route>
            <Route path="/tools/invoice">{() => <GuardedRoute component={InvoiceGenerator} />}</Route>
            <Route path="/tools/price-calculator">{() => <GuardedRoute component={PriceCalculator} />}</Route>
            <Route path="/tools/operating-agreement">{() => <GuardedRoute component={OperatingAgreement} />}</Route>
            <Route path="/tools/csv-generator">{() => <GuardedRoute component={CsvGenerator} />}</Route>
            <Route component={NotFound} />
          </Switch>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

// Prefetch critical routes after initial load
function usePrefetchCriticalRoutes() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Prefetch most visited routes after 1s idle for faster navigation
      const criticalRoutes = [
        () => import("@/pages/servicios"),
        () => import("@/pages/home"),
        () => import("@/pages/start"),
        () => import("@/pages/faq"),
        () => import("@/pages/auth/login.tsx"),
        () => import("@/pages/dashboard"),
      ];
      criticalRoutes.forEach(route => route().catch(() => {}));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
}

function useOAuthTokenCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("authCode");
    if (authCode) {
      params.delete("authCode");
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
      window.history.replaceState({}, "", newUrl);

      fetch("/api/auth/exchange-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
        credentials: "include",
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.token) {
            setStoredAuthToken(data.token);
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          }
        })
        .catch(() => {});
    }
  }, []);
}

function App() {
  usePrefetchCriticalRoutes();
  useOAuthTokenCapture();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="exentax-theme">
        <TooltipProvider>
          <ScrollToTop />
          <MainRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
