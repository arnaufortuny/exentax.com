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
const ApplicationWizard = lazy(() => import("@/pages/application"));
const MaintenancePage = lazy(() => import("@/pages/maintenance"));
const LlcFormation = lazy(() => import("@/pages/llc-formation"));
const Dashboard = lazy(() => import("@/pages/dashboard"));

const Login = lazy(() => import("@/pages/auth/login"));
const Register = lazy(() => import("@/pages/auth/register"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"));

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center transition-opacity duration-300">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/servicios" component={Servicios} />
        <Route path="/precios" component={Servicios} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contacto" component={Contacto} />
        <Route path="/application" component={ApplicationWizard} />
        <Route path="/maintenance" component={MaintenancePage} />
        <Route path="/llc/formation" component={LlcFormation} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ForgotPassword} />
        <Route path="/legal/terminos" component={Legal} />
        <Route path="/legal/privacidad" component={Privacidad} />
        <Route path="/legal/reembolsos" component={Reembolsos} />
        <Route path="/legal/cookies" component={Cookies} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
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
