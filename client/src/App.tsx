import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useEffect, Suspense, lazy, Component, memo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import logoIcon from "@/assets/logo-icon.png";

function lazyRetry<T extends { default: React.ComponentType<unknown> }>(
  importFn: () => Promise<T>,
  retries = 5,
  interval = 500
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attemptImport = (remainingRetries: number) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (remainingRetries <= 0) {
            console.error('Failed to load module after retries:', error);
            reject(error);
            return;
          }
          const delay = interval * (6 - remainingRetries);
          setTimeout(() => {
            attemptImport(remainingRetries - 1);
          }, delay);
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
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorCount: 0, lastError: '' };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, lastError: error.message };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    if (state.hasError) {
      return { hasError: false, errorCount: 0, lastError: '' };
    }
    return null;
  }

  componentDidCatch(error: Error): void {
    console.error('Page load error:', error);
    const newCount = this.state.errorCount + 1;
    this.setState({ errorCount: newCount });
    
    if (newCount < 5) {
      const delay = Math.min(300 * newCount, 1000);
      this.retryTimeout = setTimeout(() => {
        this.setState({ hasError: false });
      }, delay);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
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
      if (this.state.errorCount < 5) {
        return (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">{i18n.t("common.loading")}</p>
            </div>
          </div>
        );
      }
      
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

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gpu-accelerated">
      <img 
        src={logoIcon} 
        alt="Easy US LLC" 
        className="w-16 h-16 mb-6 opacity-90"
      />
      <div className="w-[280px] h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#6EDC8A] to-[#4FCF70] rounded-full loading-bar-animation" />
      </div>
    </div>
  );
}

function MainRouter() {
  const [location] = useLocation();
  
  return (
    <ErrorBoundary>
      <Suspense key={location} fallback={<LoadingScreen />}>
        <div className="animate-page-in min-h-screen bg-background">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/servicios" component={Servicios} />
            <Route path="/faq" component={FAQ} />
            <Route path="/contacto" component={Contacto} />
            <Route path="/legal/terminos" component={Legal} />
            <Route path="/legal/privacidad" component={Privacidad} />
            <Route path="/legal/reembolsos" component={Reembolsos} />
            <Route path="/legal/cookies" component={Cookies} />
            <Route path="/llc/maintenance" component={MaintenancePage} />
            <Route path="/llc/formation" component={LlcFormation} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/auth/login" component={Login} />
            <Route path="/auth/register" component={Register} />
            <Route path="/auth/forgot-password" component={ForgotPassword} />
            <Route path="/tools/invoice" component={InvoiceGenerator} />
            <Route path="/tools/price-calculator" component={PriceCalculator} />
            <Route path="/tools/operating-agreement" component={OperatingAgreement} />
            <Route path="/tools/csv-generator" component={CsvGenerator} />
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
        () => import("@/pages/faq"),
        () => import("@/pages/auth/login.tsx"),
        () => import("@/pages/dashboard"),
      ];
      criticalRoutes.forEach(route => route().catch(() => {}));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
}

function App() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  
  usePrefetchCriticalRoutes();
  
  const isLinktreeDomain = hostname === 'creamostullc.com' || hostname === 'www.creamostullc.com';

  // creamostullc.com - Solo Linktree (completamente aislado, sin i18n)
  if (isLinktreeDomain) {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <LinktreePage />
          </Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    );
  }

  // easyusllc.com - Main website (everything: info, services, FAQ, legal, dashboard, forms)
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="easyusllc-theme">
        <TooltipProvider>
          <ScrollToTop />
          <MainRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
