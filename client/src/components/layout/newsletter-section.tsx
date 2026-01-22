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
    <section className="py-16 bg-brand-dark relative overflow-hidden font-sans border-t border-white/5">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/hero-bg.png')] bg-repeat" />
      
      <div className="container max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none">
              Únete a nuestra <span className="text-brand-dark bg-brand-lime px-2">Newsletter</span>
            </h2>
            <p className="text-white/60 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
              Recibe consejos exclusivos sobre fiscalidad, banca en USA y estrategias para escalar tu negocio internacional.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto relative group">
            <div className="relative">
              <Input 
                type="email" 
                placeholder="Tu correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-6 pr-14 rounded-full border-2 border-white/10 bg-white/5 text-white placeholder:text-white/30 text-base font-bold focus:border-brand-lime focus:ring-0 transition-all shadow-xl"
                required
              />
              <Button 
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 h-11 w-11 rounded-full bg-brand-lime text-brand-dark p-0 hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <Send size={20} />
              </Button>
            </div>
            <p className="mt-4 text-[10px] text-white/20 font-black uppercase tracking-widest">
              Sin spam. Solo valor real para tu negocio.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
