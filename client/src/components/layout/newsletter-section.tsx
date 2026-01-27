import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export function NewsletterSection() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Hide newsletter for logged-in users
  if (isAuthenticated) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ 
          title: "¡Suscrito!", 
          description: "Revisa tu bandeja de entrada.",
          variant: "success"
        });
        setEmail("");
      } else {
        toast({ title: "Error", description: data.message || "No se pudo completar la suscripción.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Error de conexión.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-[#F7F7F5] relative overflow-hidden font-sans border-t border-primary/5 w-full">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('/hero-bg.png')] bg-repeat" />
      
      <div className="w-full px-5 sm:px-8 relative z-10 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 md:space-y-8 w-full flex flex-col items-center"
        >
          <div className="space-y-2 md:space-y-4 w-full text-center">
            <h2 className="text-xl md:text-4xl font-black tracking-tighter text-black leading-none text-center">
              Únete a nuestra <span className="text-black bg-accent px-2 inline-block">Newsletter</span>
            </h2>
            <p className="text-black/70 text-xs md:text-sm font-medium max-w-lg mx-auto leading-relaxed text-center px-2">
              Consejos claros sobre fiscalidad en USA.
              <span className="block mt-1">Novedades que realmente importan para tu negocio.</span>
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-lg w-full mx-auto relative group flex flex-col items-center text-center">
            <div className="relative w-full">
              <Input 
                type="email" 
                inputMode="email"
                placeholder="Indícanos tu email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 md:h-14 pl-4 pr-12 rounded-full border-2 border-primary/10 bg-white text-primary placeholder:text-primary/40 text-xs md:text-base font-black focus:border-[#6EDC8A] focus:bg-white focus:ring-0 transition-all shadow-inner w-full text-left"
                required
              />
              <Button 
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 h-7 w-7 md:h-11 md:w-11 rounded-full bg-[#6EDC8A] text-primary p-0 hover:scale-110 active:scale-90 transition-all shadow-lg flex items-center justify-center border-0"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-5 md:h-5 transform group-hover:translate-x-0.5 transition-transform">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
