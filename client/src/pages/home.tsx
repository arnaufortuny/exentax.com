import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import trustpilotLogo from "@assets/trustpilot-logo.png";

import { ChevronDown, ArrowRight } from "lucide-react";

export default function Home() {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('scroll') === 'servicios') {
      const element = document.getElementById('servicios');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen font-sans text-left bg-background bg-green-gradient overflow-x-hidden w-full relative">
      <Navbar />
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-16 sm:pt-8 min-h-[400px] sm:min-h-[70vh] w-full"
        showOverlay={false}
        title={
          <div className="flex flex-col items-center w-full">
            <div className="mb-4 sm:hidden flex justify-center mt-6">
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white dark:bg-white px-4 py-2.5 rounded-full shadow-md border-2 border-accent">
                <img src={trustpilotLogo} alt="Trustpilot" className="h-5 w-auto" loading="lazy" />
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#00b67a">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-black text-xs font-black">5/5</span>
              </a>
            </div>

            <h1 
              className="font-black tracking-tighter text-foreground mb-4 sm:mb-4 w-full block [text-wrap:balance] [word-break:keep-all] [overflow-wrap:break-word] text-center" 
              style={{ fontSize: 'clamp(34px, 10vw, 88px)', lineHeight: '0.85' }}
            >
              OPTIMIZA LA ESTRUCTURA FISCAL DE TU NEGOCIO DIGITAL<br />
              <span className="text-accent">CON UNA LLC AMERICANA</span>
            </h1>
          </div>
        }
        subtitle={
          <div className="flex flex-col items-center">
            <div className="text-[14px] sm:text-base text-foreground font-medium max-w-3xl mb-12 sm:mb-8 leading-relaxed text-center mx-auto px-2">
              Para freelancers y emprendedores digitales que trabajan online y venden a nivel internacional. <br />
              <span className="block sm:inline font-black mt-2 text-accent">Te entregamos tu LLC en 2 días. Sin IVA. Sin Impuesto de Sociedades. Sin cuota de autónomos.</span>
            </div>
            
            <div className="hidden sm:flex mb-8 justify-center">
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 bg-white dark:bg-white px-6 py-3 rounded-full shadow-md border-2 border-accent">
                <img src={trustpilotLogo} alt="Trustpilot" className="h-7 w-auto" loading="lazy" />
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5" viewBox="0 0 24 24" fill="#00b67a">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-black text-lg font-black">5/5</span>
              </a>
            </div>

            <div className="hidden sm:flex flex-wrap justify-center gap-3 mb-8 px-2">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
                Tu LLC en 2 días
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
                Pack Todo Incluido
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
                Sin IVA
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
                Precios Transparentes
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
                Trato Cercano
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
                Apertura Cuenta Mercury & Relay
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
                Tarjeta Física de Crédito y Débito
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-4 sm:mb-4 w-full">
              <Button size="lg" onClick={() => {
                setLocation("/servicios#pricing");
              }} className="bg-accent text-accent-foreground font-black text-sm px-8 border-0 rounded-full w-full sm:w-auto h-12 sm:h-12 shadow-md" data-testid="button-select-pack">
                ¿Estás listo? Selecciona tu pack →
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/servicios")} className="bg-transparent text-primary border-2 border-primary hover:bg-accent/5 font-black text-sm px-8 rounded-full w-full sm:w-auto h-12 sm:h-12" data-testid="button-services">
                Conoce nuestros servicios →
              </Button>
            </div>
          </div>
        }
      />

      <PorQueEasyUSLLC />

      <section className="bg-background py-8 sm:py-24 relative" id="ventajas">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-6 sm:mb-20 flex flex-col items-center justify-center relative">
            <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
              VENTAJAS
            </span>
            <h2 className="text-4xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center leading-[1.1] sm:leading-tight">
              Ventajas<br className="sm:hidden" /> fiscales
            </h2>
            <p className="text-accent font-black tracking-wide text-lg sm:text-lg mt-1 sm:mt-2 text-center">(Te ayudamos a optimizar tu estructura)</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { badge: "IVA", title: "Sin IVA en la LLC", text: "La LLC no aplica IVA en la facturación de servicios digitales, tanto a clientes finales como a clientes B2B internacionales. Estructuramos la actividad para que la facturación se realice correctamente desde la empresa americana, sin IVA, conforme a la normativa aplicable y al tipo de operación.", footer: "Tus servicios están exentos." },
              { badge: "Impuestos", title: "0% Impuesto de Sociedades", text: "En estados como New Mexico o Wyoming, la LLC no está sujeta a impuesto de sociedades estatal. La empresa no tributa como sociedad en Estados Unidos, sino que los beneficios se atribuyen directamente al propietario, según la estructura fiscal de la LLC.", footer: "Impuesto de Sociedades al 0%." },
              { badge: "Cuotas", title: "Sin cuota fija", text: "En Estados Unidos no existe una cuota mensual de autónomos asociada a la LLC. No hay pagos periódicos obligatorios por el simple hecho de tener la empresa activa, independientemente de que exista o no actividad. La estructura mantiene costes fijos reducidos y una gestión más ligera.", footer: "Sin cuota de autónomos." },
              { badge: "Banca", title: "Banca internacional", text: "Te acompañamos en el proceso de apertura de cuentas bancarias en Mercury y Relay. Accede a una cuenta empresarial en USD, con capacidad para recibir y enviar transferencias internacionales y disponer de tarjeta física de débito y crédito para operar a nivel global.", footer: "Tarjeta física internacional." },
            ].map((card, i) => (
              <div key={i} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
                <div className="p-6 flex-grow text-left">
                  <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-sm mb-4 text-left">{card.badge}</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground mb-3 leading-tight text-left">{card.title}</h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-left">{card.text}</p>
                </div>
                <div className="bg-accent/10 px-6 py-4 border-t border-accent/20 mt-auto text-left">
                  <p className="text-sm font-black text-foreground text-left">{card.footer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-8 sm:py-24 relative" id="ventajas">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-6 sm:mb-20 flex flex-col items-center justify-center relative">
            <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
              VENTAJAS
            </span>
            <h2 className="text-4xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center leading-[1.1] sm:leading-tight">
              Ventajas<br className="sm:hidden" /> fiscales
            </h2>
            <p className="text-accent font-black tracking-wide text-lg sm:text-lg mt-1 sm:mt-2 text-center">(Te ayudamos a optimizar tu estructura)</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { badge: "IVA", title: "Sin IVA en la LLC", text: "La LLC no aplica IVA en la facturación de servicios digitales, tanto a clientes finales como a clientes B2B internacionales. Estructuramos la actividad para que la facturación se realice correctamente desde la empresa americana, sin IVA, conforme a la normativa aplicable y al tipo de operación.", footer: "Tus servicios están exentos." },
              { badge: "Impuestos", title: "0% Impuesto de Sociedades", text: "En estados como New Mexico o Wyoming, la LLC no está sujeta a impuesto de sociedades estatal. La empresa no tributa como sociedad en Estados Unidos, sino que los beneficios se atribuyen directamente al propietario, según la estructura fiscal de la LLC.", footer: "Impuesto de Sociedades al 0%." },
              { badge: "Cuotas", title: "Sin cuota fija", text: "En Estados Unidos no existe una cuota mensual de autónomos asociada a la LLC. No hay pagos periódicos obligatorios por el simple hecho de tener la empresa activa, independientemente de que exista o no actividad. La estructura mantiene costes fijos reducidos y una gestión más ligera.", footer: "Sin cuota de autónomos." },
              { badge: "Banca", title: "Banca internacional", text: "Te acompañamos en el proceso de apertura de cuentas bancarias en Mercury y Relay. Accede a una cuenta empresarial en USD, con capacidad para recibir y enviar transferencias internacionales y disponer de tarjeta física de débito y crédito para operar a nivel global.", footer: "Tarjeta física internacional." },
            ].map((card, i) => (
              <div key={i} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
                <div className="p-6 flex-grow text-left">
                  <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-sm mb-4 text-left">{card.badge}</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground mb-3 leading-tight text-left">{card.title}</h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-left">{card.text}</p>
                </div>
                <div className="bg-accent/10 px-6 py-4 border-t border-accent/20 mt-auto text-left">
                  <p className="text-sm font-black text-foreground text-left">{card.footer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PorQueEasyUSLLC />

      <section className="py-20 bg-background">
        <div className="w-full px-5 sm:px-8 text-center">
          <Button 
            size="lg" 
            onClick={() => {
              setLocation("/servicios#pricing");
            }} 
            className="bg-accent text-accent-foreground font-black text-sm px-8 sm:px-12 py-6 sm:py-8 border-0 rounded-full w-full sm:w-auto shadow-xl shadow-accent/30"
            data-testid="button-cta-bottom"
          >
            Comenzamos? Selecciona tu pack →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PorQueEasyUSLLC() {
  return (
    <section className="py-8 sm:py-14 bg-background relative">
      <div className="w-full px-5 sm:px-8">
        <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center relative">
          <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
            VALORES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center">
            ¿Por qué Easy US LLC?
          </h2>
          <p className="text-accent font-black tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
            (Lo que nos hace diferentes)
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {[
            { badge: "RAPIDEZ REAL", title: "Tu LLC lista en 2–3 días hábiles", text: "Trabajamos con un proceso ágil, probado y bien organizado desde el primer momento. Sin esperas innecesarias ni pasos confusos. Sabes qué está pasando en cada fase y cuándo tendrás tu empresa operativa." },
            { badge: "TRANSPARENCIA", title: "Precio claro desde el inicio", text: "Todo está incluido desde el primer momento, sin costes ocultos ni sorpresas posteriores. Lo que ves es lo que pagas. Creemos que la confianza empieza por la claridad y la honestidad en los números." },
            { badge: "ESPECIALISTAS", title: "Especialistas en negocios", text: "No somos intermediarios genéricos. Trabajamos a diario con freelancers y negocios internacionales, entendiendo sus necesidades reales y anticipando problemas para ponértelo fácil desde el primer día." },
            { badge: "SOPORTE HUMANO", title: "Atención cercana, en tu idioma", text: "Hablamos contigo de persona a persona, por WhatsApp y email, cuando lo necesites. Sin tickets eternos ni respuestas automáticas. Estamos para acompañarte antes, durante y después del proceso." },
          ].map((feature, i) => (
            <div key={i} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
              <div className="p-6 flex-grow text-left">
                <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-sm mb-4 text-left">{feature.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground mb-3 leading-tight text-left">{feature.title}</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-left">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
