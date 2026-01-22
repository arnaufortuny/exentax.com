import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Legal from "@/pages/legal";
import Servicios from "@/pages/servicios";
import Privacidad from "@/pages/legal/privacidad";
import Reembolsos from "@/pages/legal/reembolsos";
import Cookies from "@/pages/legal/cookies";
import Contacto from "@/pages/contacto";
import FAQ from "@/pages/faq";
// CookieBanner removed as requested
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/servicios" component={Servicios} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contacto" component={Contacto} />
      <Route path="/legal" component={Legal} />
      <Route path="/privacidad" component={Privacidad} />
      <Route path="/reembolsos" component={Reembolsos} />
      <Route path="/cookies" component={Cookies} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
