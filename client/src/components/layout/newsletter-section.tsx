import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
        toast({ title: "¡Suscrito!", description: "Revisa tu bandeja de entrada." });
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
    <section className="py-8 md:py-20 bg-brand-lime relative overflow-hidden font-sans border-t border-brand-dark/5 w-full flex justify-center items-center">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('/hero-bg.png')] bg-repeat" />
      
      <div className="container max-w-4xl mx-auto px-5 relative z-10 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 md:space-y-8 w-full flex flex-col items-center"
        >
          <div className="space-y-2 md:space-y-4 w-full text-center">
            <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter text-brand-dark leading-none text-center">
              Únete a nuestra <span className="text-white bg-brand-dark px-2 inline-block">Newsletter</span>
            </h2>
            <p className="text-brand-dark/70 text-xs md:text-lg font-medium max-w-2xl mx-auto leading-relaxed text-center px-2">
              Consejos exclusivos sobre fiscalidad en USA.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-lg w-full mx-auto relative group flex flex-col items-center text-center">
            <div className="relative w-full">
              <Input 
                type="email" 
                inputMode="email"
                placeholder="Tu email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 md:h-14 pl-4 pr-12 rounded-full border-2 border-brand-dark/10 bg-brand-dark/5 text-brand-dark placeholder:text-brand-dark/30 text-xs md:text-base font-bold focus:border-brand-dark focus:ring-0 transition-all shadow-xl w-full text-center"
                required
              />
              <Button 
                type="submit"
                disabled={loading}
                className="absolute right-1 top-1 h-8 w-8 md:h-12 md:w-12 rounded-full bg-white text-brand-dark p-0 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center border border-brand-dark/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5">
                  <path d="m9 18 6-6-6-6"/>
                  <path d="M5 12h14"/>
                </svg>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
