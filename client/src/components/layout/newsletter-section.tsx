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
    <section className="py-8 md:py-16 bg-brand-lime relative overflow-hidden font-sans border-t border-brand-dark/5 w-full flex justify-center items-center">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('/hero-bg.png')] bg-repeat" />
      
      <div className="container max-w-2xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 md:space-y-6 w-full flex flex-col items-center"
        >
          <div className="space-y-2 md:space-y-3 w-full text-center">
            <h2 className="text-lg md:text-3xl font-black uppercase tracking-tighter text-brand-dark leading-none text-center">
              Únete a nuestra <span className="text-white bg-brand-dark px-2 inline-block">Newsletter</span>
            </h2>
            <p className="text-brand-dark/70 text-[10px] md:text-base font-medium max-w-lg mx-auto leading-relaxed text-center px-2">
              Consejos exclusivos sobre fiscalidad en USA.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-xs md:max-w-sm w-full mx-auto relative group flex flex-col items-center text-center">
            <div className="relative w-full">
              <Input 
                type="email" 
                inputMode="email"
                placeholder="Tu email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 md:h-12 pl-4 pr-10 rounded-full border-2 border-brand-dark/10 bg-brand-dark/5 text-brand-dark placeholder:text-brand-dark/30 text-[10px] md:text-sm font-bold focus:border-brand-dark focus:ring-0 transition-all shadow-xl w-full text-center"
                required
              />
              <Button 
                type="submit"
                disabled={loading}
                className="absolute right-1 top-1 h-7 w-7 md:h-10 md:w-10 rounded-full bg-white text-brand-dark p-0 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center border border-brand-dark/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 md:w-4 md:h-4">
                  <path d="m5 12 7 7 7-7"/>
                  <path d="M12 19V5"/>
                </svg>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
