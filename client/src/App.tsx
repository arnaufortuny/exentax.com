import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useEffect, Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/home"));
const Legal = lazy(() => import("@/pages/legal/terminos"));
const Servicios = lazy(() => import("@/pages/servicios"));
const Privacidad = lazy(() => import("@/pages/legal/privacidad"));
const Reembolsos = lazy(() => import("@/pages/legal/reembolsos"));
const Cookies = lazy(() => import("@/pages/legal/cookies"));
const Contacto = lazy(() => import("@/pages/contacto"));
const FAQ = lazy(() => import("@/pages/faq"));
const MaintenancePage = lazy(() => import("@/pages/maintenance"));
const LlcFormation = lazy(() => import("@/pages/llc-formation"));
const Dashboard = lazy(() => import("@/pages/dashboard"));

const Login = lazy(() => import("@/pages/auth/login.tsx"));
const Register = lazy(() => import("@/pages/auth/register.tsx"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password.tsx"));
const Sales = lazy(() => import("@/pages/funnel"));
const InvoiceGenerator = lazy(() => import("@/pages/invoice-generator"));
const LinktreePage = lazy(() => import("@/pages/linktree"));

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full animate-loading-bar"
          style={{ backgroundColor: '#6EDC8A' }}
        />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/servicios" component={Servicios} />
        <Route path="/precios" component={Servicios} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contacto" component={Contacto} />
        <Route path="/llc/maintenance" component={MaintenancePage} />
        <Route path="/llc/formation" component={LlcFormation} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/forgot-password" component={ForgotPassword} />
        <Route path="/legal/terminos" component={Legal} />
        <Route path="/legal/privacidad" component={Privacidad} />
        <Route path="/legal/reembolsos" component={Reembolsos} />
        <Route path="/legal/cookies" component={Cookies} />
        <Route path="/tools/invoice" component={InvoiceGenerator} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isLinktreeDomain = hostname === 'creamostullc.com' || hostname === 'www.creamostullc.com';

  if (isLinktreeDomain) {
    if (pathname === '/tu-llc' || pathname === '/tu-llc/') {
      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="easyusllc-theme">
            <TooltipProvider>
              <Suspense fallback={<LoadingScreen />}>
                <Sales />
              </Suspense>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      );
    }
    return (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingScreen />}>
          <LinktreePage />
        </Suspense>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="easyusllc-theme">
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
