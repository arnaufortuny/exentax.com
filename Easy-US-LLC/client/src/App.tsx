import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import ApplicationWizard from "@/pages/application";
import Legal from "@/pages/legal";
import Servicios from "@/pages/servicios";
import Privacidad from "@/pages/privacidad";
import Reembolsos from "@/pages/reembolsos";
import Cookies from "@/pages/cookies";
import Consulta from "@/pages/consulta";
import Contacto from "@/pages/contacto";
import FAQ from "@/pages/faq";
import { Chatbot } from "@/components/chatbot";
import { CookieBanner } from "@/components/cookie-banner";

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
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/application/:id" component={ApplicationWizard} />
      <Route path="/legal" component={Legal} />
      <Route path="/privacidad" component={Privacidad} />
      <Route path="/reembolsos" component={Reembolsos} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/consulta" component={Consulta} />
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
        <Chatbot />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
