import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          data-testid="cookie-banner"
        >
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-brand-dark/20 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-primary text-base sm:text-lg mb-1">
                  Usamos cookies
                </p>
                <p className="text-sm text-muted-foreground">
                  Utilizamos cookies esenciales para el funcionamiento del sitio y cookies de análisis para mejorar tu experiencia.{" "}
                  <Link href="/cookies" className="text-brand-dark hover:underline">
                    Más información
                  </Link>
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1 sm:flex-none rounded-full border-gray-300"
                  data-testid="button-reject-cookies"
                >
                  Rechazar
                </Button>
                <Button
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none rounded-full bg-brand-dark hover:bg-black text-white"
                  data-testid="button-accept-cookies"
                >
                  Aceptar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
