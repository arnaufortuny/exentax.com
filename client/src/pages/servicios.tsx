import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import type { Product } from "@shared/schema";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";



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
    setLocation(`/llc/formation?state=${encodeURIComponent(stateName)}`);
  };

  const handleSelectMaintenance = (stateName: string) => {
    setLocation(`/llc/maintenance?state=${encodeURIComponent(stateName)}`);
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

  const nmWyFeatures = [
    ...packFeatures.slice(0, -1),
    "2-3 días hábiles"
  ];

  const deFeatures = [
    ...packFeatures.slice(0, -1),
    "3-5 días hábiles"
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
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.1] text-center uppercase">
            CONSTITUIMOS TU LLC EN ESTADOS UNIDOS DE <span className="text-accent">FORMA SIMPLE, RÁPIDA Y TRANSPARENTE.</span>
          </h1>
        }
        subtitle={
            <div className="flex flex-col items-center justify-center w-full">
              <div className="text-[13px] sm:text-xl lg:text-2xl text-foreground font-medium leading-relaxed max-w-2xl text-center mb-8 sm:mb-12 mx-auto px-2">
                Todo lo que necesitas saber sobre tu LLC: estructura, impuestos, bancos y cómo trabajamos.
              </div>
              
              <div className="hidden sm:flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl px-4 mb-12">
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
                    className="bg-white dark:bg-zinc-900 text-primary font-black text-sm px-4 py-2 rounded-full border border-primary shadow-sm"
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
        }
      />

      <section className="py-12 sm:py-20 bg-background border-t border-primary/5" id="pricing">
        <div className="w-full px-4 sm:px-8">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center relative">
            <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
              PACKS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center">
              NUESTROS PACKS
            </h2>
            <p className="text-accent font-black tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
              (Elige el plan que mejor se adapte a ti)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0">
            {/* New Mexico */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full sm:max-w-none">
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center justify-center mb-4 sm:mb-4 gap-2">
                  <h3 className="text-xl sm:text-xl font-black text-primary  tracking-tight">New Mexico</h3>
                  <span className="bg-accent/20 text-primary text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full ">Popular</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">739€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black  tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Tasas estatales incluidas
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {nmWyFeatures.map((f) => (
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
                    <Button 
                      variant="link"
                      onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento New Mexico")}`)}
                      className="font-black text-[10px] sm:text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                      data-testid="button-maintenance-nm"
                    >
                      Mantenimiento Año 2: 539€
                    </Button>
                  </div>
            </div>

            {/* Wyoming */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full sm:max-w-none">
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center justify-center mb-4 sm:mb-4 gap-2">
                  <h3 className="text-xl sm:text-xl font-black text-primary  tracking-tight">Wyoming</h3>
                  <span className="bg-accent text-primary-foreground text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full ">Premium</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">899€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black  tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Tasas estatales incluidas
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {nmWyFeatures.map((f) => (
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
                    <Button 
                      variant="link"
                      onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento Wyoming")}`)}
                      className="font-black text-[10px] sm:text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                      data-testid="button-maintenance-wy"
                    >
                      Mantenimiento Año 2: 699€
                    </Button>
                  </div>
            </div>

            {/* Delaware */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full sm:max-w-none">
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center justify-center mb-4 sm:mb-4 gap-2">
                  <h3 className="text-xl sm:text-xl font-black text-primary  tracking-tight">Delaware</h3>
                  <span className="bg-accent text-primary text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full ">Startups</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">1199€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black  tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Tasas estatales incluidas
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {deFeatures.map((f) => (
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
                    <Button 
                      variant="link"
                      onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento Delaware")}`)}
                      className="font-black text-[10px] sm:text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                      data-testid="button-maintenance-de"
                    >
                      Mantenimiento Año 2: 899€
                    </Button>
                  </div>
            </div>
          </div>
          
          <div className="mt-12 sm:mt-16 flex justify-center">
            <Button 
              onClick={() => {
                window.open("https://wa.me/34624322421", "_blank");
              }}
              className="group bg-accent text-primary font-black text-sm rounded-full px-8 py-6 h-14 shadow-md hover:bg-accent/90 transition-all transform hover:scale-105 active:scale-95 shadow-accent/20"
            >
              Alguna duda? Hablemos →
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-background border-t border-primary/5 relative" id="bancos">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center relative">
            <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
              BANCOS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center">
              Asistencia Bancaria
            </h2>
            <p className="text-accent font-black tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
              (Ayudamos a abrir cuentas en fintech y bancos, si el cliente lo requiere)
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6 max-w-4xl mx-auto">
            {[
              { title: "Mercury", desc: "Te acompañamos en todo el proceso de solicitud de cuenta en Mercury, ayudándote a presentar correctamente la información de tu LLC." },
              { title: "Relay", desc: "Asistencia en la apertura de cuenta en Relay, una alternativa bancaria sólida para la operativa diaria de tu empresa." },
              { title: "Estrategia bancaria", desc: "Te orientamos sobre la opción bancaria más adecuada según tu tipo de negocio y forma de operar." },
              { title: "Acompañamiento continuo", desc: "Te acompañamos durante el proceso y resolvemos tus dudas hasta que la solicitud queda resuelta." },
            ].map((service, i) => (
              <div key={i} className="p-6 bg-accent/5 rounded-2xl border border-accent/10 sm:border-accent/10 border-accent/30 hover:bg-accent/10 transition-colors text-center">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-primary font-black text-sm shadow-sm mb-4">
                  {service.title}
                </span>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 mb-12 flex justify-center">
            <div className="bg-accent px-8 py-3 rounded-full shadow-lg transform -rotate-1">
              <p className="text-primary font-sans font-black  tracking-[0.2em] text-sm sm:text-base">
                Incluido en tu paquete inicial
              </p>
            </div>
          </div>

          <div className="border-t border-primary/5 w-full max-w-7xl mx-auto mb-12" />

          <div className="text-center mb-6 sm:mb-10 flex flex-col items-center justify-center relative">
            <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
              MANTENIMIENTO
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center">
              Packs Mantenimiento
            </h2>
            <p className="text-accent font-black tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">(Lo que incluye tu servicio anual)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0 mb-12">
            {[
              { state: "New Mexico", price: "539€", annual: true },
              { state: "Wyoming", price: "699€", annual: true },
              { state: "Delaware", price: "899€", annual: true }
            ].map((item, i) => (
              <div key={i} className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group text-center mx-auto w-full sm:max-w-none">
                <div className="p-5 sm:p-6 flex-grow text-center">
                  <div className="flex flex-col items-center justify-center mb-4 sm:mb-4 gap-2">
                    <h3 className="text-xl sm:text-xl font-black text-primary  tracking-tight">{item.state}</h3>
                    <span className="bg-accent/20 text-primary text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full ">Mantenimiento</span>
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
                    onClick={() => handleSelectMaintenance(item.state)}
                    className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                  >
                    Elegir Pack {item.state}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-background border-t border-accent/5 relative" id="proceso">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-16 flex flex-col items-center justify-center relative">
            <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
              GESTIÓN
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center">
              Proceso de Mantenimiento
            </h2>
            <p className="text-accent font-black tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
              (Cómo trabajamos para que tu LLC esté siempre al día)
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {maintenanceProcess.map((step, i) => (
              <div key={i} className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-accent/20 shadow-lg hover:shadow-xl transition-all group flex flex-col items-center text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-accent text-primary rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-md">
                  {i + 1}
                </div>
                <h3 className="text-xl font-black text-primary  mb-3 mt-2">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-background relative" id="faq">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center relative">
            <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
              AYUDA
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center">
              Centro de Ayuda
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                q: "¿Qué necesito para empezar?",
                a: "Muy poco. Solo tu documento de identidad y algunos datos básicos sobre ti y tu actividad. No necesitas saber de trámites ni preparar nada complicado. Nosotros te guiamos desde el primer momento y revisamos todo antes de avanzar."
              },
              {
                q: "¿Cuánto tarda realmente el proceso?",
                a: "Una vez tenemos la información completa, el proceso suele tardar entre 2 y 3 días hábiles. Nos movemos rápido, pero sin correr riesgos. Preferimos hacerlo bien desde el inicio para que tu LLC quede lista y sin problemas."
              },
              {
                q: "¿El precio es final?",
                a: "Sí. El precio es claro y cerrado desde el primer momento. Todo lo necesario para constituir tu LLC está incluido, sin costes ocultos ni sorpresas después. Lo que ves es lo que pagas."
              },
              {
                q: "¿Pagaré impuestos en Estados Unidos?",
                a: "Depende de tu caso y de cómo operes, pero no te preocupes: te lo explicamos de forma sencilla y honesta antes de empezar. Nuestro objetivo es que entiendas tu situación y tomes decisiones con tranquilidad."
              },
              {
                q: "¿Puedo abrir cuenta bancaria y Stripe?",
                a: "Sí. Te acompañamos en la apertura de cuentas bancarias como Mercury o Relay y en plataformas de pago como Stripe. No estás solo en el proceso: te indicamos cómo hacerlo y qué tener en cuenta en cada paso."
              },
              {
                q: "¿Para quién no es una LLC?",
                a: "Si solo trabajas a nivel local, no vendes online o no tienes actividad internacional, quizá una LLC no sea la mejor opción. Si ese es tu caso, también te lo diremos con total transparencia."
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`group transition-all duration-200 border-2 rounded-xl sm:rounded-2xl overflow-hidden ${
                  openFaq === i 
                    ? "border-accent bg-accent/[0.03]" 
                    : "border-primary/5 hover:border-accent/30 bg-white dark:bg-zinc-900"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-6 text-left flex items-center justify-between gap-3 sm:gap-4 touch-manipulation"
                >
                  <span className="font-black text-primary text-sm sm:text-lg leading-tight tracking-tight">
                    {item.q}
                  </span>
                  <span className={`text-xl sm:text-2xl transition-transform duration-200 shrink-0 ${
                    openFaq === i ? "rotate-45 text-accent" : "text-primary/30"
                  }`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-primary/90 text-xs sm:text-base leading-relaxed border-t border-accent/20 pt-3 sm:pt-4 animate-in fade-in slide-in-from-top-2 font-medium bg-accent/5">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="w-full mt-12 sm:mt-20 flex flex-col items-center">
            <div className="text-center w-full max-w-md px-4">
              <p className="text-primary font-black text-lg sm:text-xl mb-6">¿No encuentras lo que buscas?</p>
              <Button 
                variant="outline"
                onClick={() => setLocation("/faq")}
                className="w-full sm:w-auto rounded-full border-2 border-accent text-primary font-black px-12 h-14 hover:bg-accent hover:text-primary transition-all shadow-md active:scale-95 shadow-accent/20"
              >
                Visita nuestro FAQ →
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
