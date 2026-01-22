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
    <section className="py-12 md:py-20 bg-brand-dark relative overflow-hidden font-sans border-t border-white/5 w-full flex justify-center items-center">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/hero-bg.png')] bg-repeat" />
      
      <div className="container max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-8 w-full flex flex-col items-center"
        >
          <div className="space-y-4 w-full text-center">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white leading-none text-center">
              Únete a nuestra <span className="text-brand-dark bg-brand-lime px-2 inline-block">Newsletter</span>
            </h2>
            <p className="text-white/60 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed text-center px-2">
              Consejos exclusivos sobre fiscalidad y banca en USA.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-md w-full mx-auto relative group flex flex-col items-center text-center">
            <div className="relative w-full">
              <Input 
                type="email" 
                inputMode="email"
                placeholder="Tu correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 md:h-14 pl-6 pr-14 rounded-full border-2 border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm md:text-base font-bold focus:border-brand-lime focus:ring-0 transition-all shadow-2xl w-full text-center"
                required
              />
              <Button 
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 h-9 w-9 md:h-11 md:w-11 rounded-full bg-brand-lime text-brand-dark p-0 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
