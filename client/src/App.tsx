import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useState, useEffect, Suspense, lazy, Component, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import NotFound from "@/pages/not-found";

function lazyRetry<T extends { default: React.ComponentType<unknown> }>(
  importFn: () => Promise<T>,
  retries = 3,
  interval = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retries === 0) {
          reject(error);
          return;
        }
        setTimeout(() => {
          lazyRetry(importFn, retries - 1, interval).then(resolve, reject);
        }, interval);
      });
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
const Sales = lazy(() => lazyRetry(() => import("@/pages/funnel")));
const InvoiceGenerator = lazy(() => lazyRetry(() => import("@/pages/invoice-generator")));
const LinktreePage = lazy(() => lazyRetry(() => import("@/pages/linktree")));

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('Page load error:', error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Error al cargar</h2>
            <p className="text-muted-foreground">Hubo un problema al cargar la página.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white rounded-md font-medium"
            >
              Recargar página
            </button>
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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);
  
  return null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background" />
  );
}

function MainRouter() {
  const [location] = useLocation();
  
  return (
    <ErrorBoundary>
      <Suspense key={location} fallback={<LoadingScreen />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/servicios" component={Servicios} />
          <Route path="/precios" component={Servicios} />
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
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function AppRouter() {
  const [location] = useLocation();
  
  return (
    <ErrorBoundary>
      <Suspense key={location} fallback={<LoadingScreen />}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/auth/forgot-password" component={ForgotPassword} />
          <Route path="/llc/maintenance" component={MaintenancePage} />
          <Route path="/llc/formation" component={LlcFormation} />
          <Route path="/tools/invoice" component={InvoiceGenerator} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  
  const isLinktreeDomain = hostname === 'creamostullc.com' || hostname === 'www.creamostullc.com';
  const isAppDomain = hostname === 'app.easyusllc.com';

  // creamostullc.com - Standalone landing pages (completely isolated)
  if (isLinktreeDomain) {
    if (pathname === '/tu-llc' || pathname === '/tu-llc/') {
      return (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Sales />
              </Suspense>
            </ErrorBoundary>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      );
    }
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <LinktreePage />
          </Suspense>
        </ErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    );
  }

  // app.easyusllc.com - Application portal (login, dashboard, admin, forms)
  if (isAppDomain) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="easyusllc-theme">
          <TooltipProvider>
            <ScrollToTop />
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  // easyusllc.com - Main website (info, services, FAQ, legal)
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="easyusllc-theme">
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <MainRouter />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
