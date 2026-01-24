import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import type { Product } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Servicios() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (window.location.hash === '#pricing') {
      const element = document.getElementById('pricing');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleSelectProduct = (stateName: string) => {
    window.location.href = `/application?state=${encodeURIComponent(stateName)}`;
  };

  const packFeatures = [
    "Tasas del estado pagadas",
    "Registered Agent (12 meses)",
    "Articles of Organization",
    "Operating Agreement",
    "EIN del IRS",
    "BOI Report presentado",
    "Dirección nuestra",
    "Asistencia con bancos",
    "Soporte completo 12 meses",
    "Servicio Express"
  ];

  const maintenanceFeatures = [
    "Presentación Form 1120 ante el IRS",
    "Presentación Form 5472 ante el IRS",
    "Renovación Registered Agent (12 meses)",
    "Presentación y Gestión Annual Report",
    "Soporte Ilimitado (12 meses)",
    "Renovación de BOI Report (si fuera necesario)",
    "1 Actualización de Articles of Organization"
  ];

  const maintenanceProcess = [
    { title: "Gestión Fiscal", desc: "Preparación y presentación de los formularios 1120 y 5472 ante el IRS, asegurando el cumplimiento tributario anual de tu LLC." },
    { title: "Registered Agent", desc: "Renovación del servicio de Agente Registrado por un año más, manteniendo tu dirección legal y la recepción de notificaciones oficiales." },
    { title: "Annual Report", desc: "Gestión y presentación del Informe Anual ante el Secretario de Estado correspondiente, incluyendo el pago de las tasas estatales obligatorias." },
    { title: "BOI Report", desc: "Actualización y mantenimiento del Beneficial Ownership Information Report ante FinCEN para reflejar cualquier cambio en la estructura." },
    { title: "Soporte Continuo", desc: "Acceso ilimitado a nuestro equipo de soporte para resolver dudas sobre la operativa, impuestos y mantenimiento de tu empresa." },
    { title: "Actualizaciones", desc: "Incluye una actualización anual de tus Articles of Organization en caso de cambios menores en la estructura de la empresa." },
  ];

  return (
    <div className="min-h-screen font-sans bg-background text-center overflow-x-hidden w-full relative">
      <Navbar />
      
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-32 sm:pt-16 min-h-[450px] sm:min-h-[auto] w-full"
        showOverlay={false}
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-primary uppercase tracking-tight leading-[1.1] text-center">
            Constituimos tu LLC en Estados Unidos de <span className="text-accent">forma simple, rápida y transparente.</span>
          </h1>
        }
        subtitle={
            <motion.div 
              className="flex flex-col items-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
            <motion.div className="text-[13px] sm:text-xl lg:text-2xl text-primary font-medium leading-relaxed max-w-2xl text-center mb-8 sm:mb-12 mx-auto px-2" variants={fadeIn}>
                Todo lo que necesitas saber sobre tu LLC: estructura, impuestos, bancos y cómo trabajamos.
            </motion.div>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl px-4 mb-12"
                variants={fadeIn}
              >
                {[
                  "Tu LLC en 2 días",
                  "Pack Todo Incluido",
                  "Sin IVA",
                  "Precios Transparentes",
                  "Trato Cercano",
                  "Apertura Cuenta Mercury & Relay",
                  "Tarjeta Física de Crédito y Débito"
                ].map((text, i) => (
                  <div 
                    key={i} 
                    className="bg-white text-primary font-black text-sm px-4 py-2 rounded-full border border-primary shadow-sm"
                  >
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
        }
      />

      <section className="py-12 sm:py-20 bg-background border-t border-primary/5" id="pricing">
        <div className="w-full px-4 sm:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-accent uppercase tracking-widest text-sm font-black block mb-2 text-center">PACKS</span>
              NUESTROS PACKS
            </motion.h2>
            <motion.p className="text-accent font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>
              (Elige el plan que mejor se adapte a ti)
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* New Mexico */}
            <motion.div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full max-w-[280px] sm:max-w-none" variants={fadeIn}>
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center gap-3 mb-3 sm:mb-3">
                  <h3 className="text-xl sm:text-xl font-black text-primary uppercase tracking-tight">New Mexico</h3>
                  <span className="bg-accent/20 text-primary text-[10px] sm:text-[11px] font-black px-4 py-1.5 rounded-full uppercase">Popular</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">639€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black uppercase tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Tasas estatales incluidas
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {packFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-2 sm:gap-2 text-primary/80 font-medium text-left leading-tight">
                      <Check className="text-accent w-5 h-5 mt-0.5 flex-shrink-0" /> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("New Mexico")}
                  className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                >
                  Elegir New Mexico
                </Button>
              </div>
                  <div className="bg-accent/5 px-5 py-3 sm:px-5 sm:py-3 border-t border-accent/10 mt-auto text-center">
                    <button 
                      onClick={() => {
                        const subject = encodeURIComponent("Mantenimiento New Mexico");
                        window.location.href = `/contacto?subject=${subject}`;
                      }}
                      className="font-black text-[10px] sm:text-[9px] uppercase tracking-widest text-primary/70 hover:text-accent transition-colors"
                    >
                      Mantenimiento Año 2: 349€
                    </button>
                  </div>
            </motion.div>

            {/* Wyoming */}
            <motion.div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full max-w-[280px] sm:max-w-none" variants={fadeIn}>
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center gap-3 mb-3 sm:mb-3">
                  <h3 className="text-xl sm:text-xl font-black text-primary uppercase tracking-tight">Wyoming</h3>
                  <span className="bg-primary text-primary-foreground text-[10px] sm:text-[11px] font-black px-4 py-1.5 rounded-full uppercase">Premium</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">799€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black uppercase tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Tasas estatales incluidas
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {packFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-2 sm:gap-2 text-primary/80 font-medium text-left leading-tight">
                      <Check className="text-accent w-5 h-5 mt-0.5 flex-shrink-0" /> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("Wyoming")}
                  className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                >
                  Elegir Wyoming
                </Button>
              </div>
                  <div className="bg-accent/5 px-5 py-3 sm:px-5 sm:py-3 border-t border-accent/10 mt-auto text-center">
                    <button 
                      onClick={() => {
                        const subject = encodeURIComponent("Mantenimiento Wyoming");
                        window.location.href = `/contacto?subject=${subject}`;
                      }}
                      className="font-black text-[10px] sm:text-[9px] uppercase tracking-widest text-primary/70 hover:text-accent transition-colors"
                    >
                      Mantenimiento Año 2: 499€
                    </button>
                  </div>
            </motion.div>

            {/* Delaware */}
            <motion.div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full max-w-[280px] sm:max-w-none" variants={fadeIn}>
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center gap-3 mb-3 sm:mb-3">
                  <h3 className="text-xl sm:text-xl font-black text-primary uppercase tracking-tight">Delaware</h3>
                  <span className="bg-accent text-primary text-[10px] sm:text-[11px] font-black px-4 py-1.5 rounded-full uppercase">Startups</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">999€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black uppercase tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Tasas estatales incluidas
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {packFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-2 sm:gap-2 text-primary/80 font-medium text-left leading-tight">
                      <Check className="text-accent w-5 h-5 mt-0.5 flex-shrink-0" /> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("Delaware")}
                  className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                >
                  Elegir Delaware
                </Button>
              </div>
                  <div className="bg-accent/5 px-5 py-3 sm:px-5 sm:py-3 border-t border-accent/10 mt-auto text-center">
                    <button 
                      onClick={() => {
                        const subject = encodeURIComponent("Mantenimiento Delaware");
                        window.location.href = `/contacto?subject=${subject}`;
                      }}
                      className="font-black text-[10px] sm:text-[9px] uppercase tracking-widest text-primary/70 hover:text-accent transition-colors"
                    >
                      Mantenimiento Año 2: 599€
                    </button>
                  </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mt-12 sm:mt-16 flex justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Button 
              onClick={() => {
                const element = document.getElementById('pricing');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group bg-accent text-primary font-black text-sm rounded-full px-8 py-6 h-14 shadow-md hover:bg-accent/90 transition-all transform hover:scale-105 active:scale-95 shadow-accent/20"
            >
              ¿Estás listo? Selecciona tu pack →
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-background border-t border-primary/5" id="bancos">
        <div className="w-full px-5 sm:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-accent uppercase tracking-widest text-sm font-black block mb-2 text-center">BANCOS</span>
              Asistencia Bancaria
            </motion.h2>
            <motion.p className="text-accent font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>
              (Ayudamos a abrir cuentas en fintech y bancos, si el cliente lo requiere)
            </motion.p>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6 max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { title: "Mercury", desc: "Te acompañamos en todo el proceso de solicitud de cuenta en Mercury, ayudándote a presentar correctamente la información de tu LLC." },
              { title: "Relay", desc: "Asistencia en la apertura de cuenta en Relay, una alternativa bancaria sólida para la operativa diaria de tu empresa." },
              { title: "Estrategia bancaria", desc: "Te orientamos sobre la opción bancaria más adecuada según tu tipo de negocio y forma de operar." },
              { title: "Acompañamiento continuo", desc: "Te acompañamos durante el proceso y resolvemos tus dudas hasta que la solicitud queda resuelta." },
            ].map((service, i) => (
              <motion.div key={i} className="p-6 bg-accent/5 rounded-2xl border border-accent/10 sm:border-accent/10 border-accent/30 hover:bg-accent/10 transition-colors text-center" variants={fadeIn}>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-primary font-black text-sm shadow-sm mb-4">
                  {service.title}
                </span>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-8 mb-12 flex justify-center">
            <div className="bg-accent px-8 py-3 rounded-full shadow-lg transform -rotate-1">
              <p className="text-primary font-sans font-black uppercase tracking-[0.2em] text-sm sm:text-base">
                Incluido en tu paquete inicial
              </p>
            </div>
          </div>

          <div className="border-t border-primary/5 w-full max-w-7xl mx-auto mb-12" />

          <motion.div 
            className="text-center mb-6 sm:mb-10 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-accent uppercase tracking-widest text-sm font-black block mb-2 text-center">MANTENIMIENTO</span>
              Packs Mantenimiento
            </motion.h2>
            <motion.p className="text-accent font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>(Lo que incluye tu servicio anual)</motion.p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0 mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { state: "New Mexico", price: "349€", annual: true },
              { state: "Wyoming", price: "499€", annual: true },
              { state: "Delaware", price: "599€", annual: true }
            ].map((item, i) => (
              <motion.div key={i} className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group text-center mx-auto w-full max-w-[280px] sm:max-w-none" variants={fadeIn}>
                <div className="p-5 sm:p-6 flex-grow text-center">
                  <div className="flex flex-col items-center gap-3 mb-3 sm:mb-3">
                    <h3 className="text-xl sm:text-xl font-black text-primary uppercase tracking-tight">{item.state}</h3>
                    <span className="bg-accent/20 text-primary text-[10px] sm:text-[11px] font-black px-4 py-1.5 rounded-full uppercase">Mantenimiento</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <p className="text-4xl sm:text-4xl font-black text-primary">{item.price}</p>
                    <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año</span>
                  </div>
                  <div className="space-y-2 text-left mt-4 border-t border-accent/10 pt-4">
                    {maintenanceFeatures.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-primary/80 font-medium leading-tight text-left">
                        <Check className="text-accent w-5 h-5 mt-0.5 flex-shrink-0" /> 
                        <span className="text-[11px] sm:text-xs">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 sm:p-6 pt-0 mt-auto">
                  <Button 
                    onClick={() => {
                      const subject = encodeURIComponent(`Consulta Mantenimiento ${item.state}`);
                      window.location.href = `/contacto?subject=${subject}`;
                    }}
                    className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                  >
                    Elegir Pack {item.state}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-white border-t border-accent/5" id="proceso">
        <div className="w-full px-5 sm:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-16 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-accent uppercase tracking-widest text-sm font-black block mb-2 text-center">GESTIÓN</span>
              Proceso de Mantenimiento
            </motion.h2>
            <motion.p className="text-accent font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>
              (Cómo trabajamos para que tu LLC esté siempre al día)
            </motion.p>
          </motion.div>
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {maintenanceProcess.map((step, i) => (
              <motion.div key={i} className="relative p-6 sm:p-8 rounded-3xl bg-white border border-accent/20 shadow-lg hover:shadow-xl transition-all group flex flex-col items-center text-center" variants={fadeIn}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-accent text-primary rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-md">
                  {i + 1}
                </div>
                <h3 className="text-xl font-black text-primary uppercase mb-3 mt-2">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-accent/5 border-t border-primary/5" id="faq">
        <div className="w-full px-5 sm:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-accent uppercase tracking-widest text-sm font-black block mb-2 text-center">AYUDA</span>
              Centro de Ayuda
            </motion.h2>
            <motion.p className="text-accent font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>
              (Todo lo que necesitas saber)
            </motion.p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {[
              {
                q: "¿Qué documentos necesito para empezar?",
                a: "Solo tu pasaporte vigente. No necesitas visa, ni viajar a USA, ni ser residente."
              },
              {
                q: "¿Cuánto tiempo tarda el proceso?",
                a: "La constitución suele tardar entre 2 y 5 días hábiles según el estado. El EIN puede tardar de 5 a 15 días adicionales."
              },
              {
                q: "¿Tengo que pagar impuestos en USA?",
                a: "Si eres un emprendedor digital que no reside en USA y no tiene empleados ni oficinas físicas allí, lo más probable es que tu LLC sea 'Tax Transparent' y no pagues impuestos corporativos en USA."
              },
              {
                q: "¿Qué bancos puedo elegir?",
                a: "Principalmente trabajamos con Mercury y Relay, que son las mejores opciones para no residentes. Te ayudamos con todo el proceso."
              },
              {
                q: "¿El precio es final?",
                a: "Sí, todos nuestros precios incluyen las tasas estatales del primer año, el EIN, el Agente Registrado y el BOI Report. No hay sorpresas."
              },
              {
                q: "¿Puedo abrir una cuenta de Stripe?",
                a: "Sí, con tu LLC y tu EIN podrás abrir una cuenta de Stripe para procesar pagos de tus clientes en todo el mundo de forma profesional."
              }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-accent/20 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 sm:py-5 flex items-center justify-between text-left group"
                >
                  <span className="font-black text-sm sm:text-base text-primary uppercase tracking-tight leading-tight pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-accent transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 sm:pb-6 text-sm sm:text-base text-muted-foreground border-t border-accent/10 pt-4 leading-relaxed text-left">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="w-full mt-12 sm:mt-20">
            <div className="border-t border-primary/5 w-full" />
          </div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
