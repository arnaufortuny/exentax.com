import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { X } from "lucide-react";

export function HelpSection() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-background py-8 md:py-20 border-t border-accent/10 w-full flex justify-center items-center font-sans">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-4 right-4 z-[200] w-[280px] sm:w-[320px] bg-white rounded-3xl shadow-2xl border border-accent/20 overflow-hidden"
          >
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 p-1 hover:bg-accent/10 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4 text-primary/40" />
            </button>
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/5 rounded-2xl flex items-center justify-center p-2 border border-accent/10">
                  <img src={logoIcon} alt="Easy US LLC" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base uppercase tracking-tight leading-none text-primary">Easy US LLC</h3>
                  <p className="text-[10px] sm:text-[11px] font-bold text-accent uppercase tracking-widest mt-1">Soporte Premium</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-black text-base sm:text-lg leading-tight text-primary">
                  ¿Quieres el mantenimiento de tu LLC?
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Nos encargamos de toda la burocracia anual para que tú te centres en tu negocio.
                </p>
                <div className="pt-2">
                  <Link href="/servicios">
                    <Button 
                      className="w-full bg-accent text-accent-foreground font-black text-xs sm:text-sm h-10 sm:h-11 rounded-full shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform"
                      onClick={() => setShowPopup(false)}
                    >
                      Ver Planes de Mantenimiento →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container max-w-4xl mx-auto px-5 relative z-10 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 md:space-y-8 w-full flex flex-col items-center"
        >
          <div className="space-y-2 md:space-y-4 w-full text-center">
            <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter text-foreground leading-none text-center">
              ¿ALGUNA <span className="text-foreground bg-accent px-2 inline-block">CONSULTA</span>?
            </h2>
            <p className="text-muted-foreground text-xs md:text-lg font-medium max-w-2xl mx-auto leading-relaxed text-center px-2">
              Estamos disponibles para ayudarte. Escríbenos y te respondemos en menos de 24h.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 w-full max-w-lg mx-auto">
            <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer" className="w-full">
              <Button 
                className="bg-accent text-accent-foreground font-black text-xs md:text-base px-8 border-0 w-full rounded-full h-10 md:h-14 shadow-lg hover:bg-accent/90 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 hover:scale-105 shadow-accent/20"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Envíanos un whatsapp
              </Button>
            </a>
            <Link href="/faq" className="w-full">
              <Button 
                variant="outline" 
                className="border-primary text-primary font-black text-xs md:text-base px-8 w-full rounded-full h-10 md:h-14 hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all tracking-tight"
              >
                FAQ
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
