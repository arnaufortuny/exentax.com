import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { HelpSection } from "@/components/layout/help-section";
import trustpilotLogo from "@assets/trustpilot-logo.png";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("POST", "/api/orders", { productId });
      return res.json();
    },
    onSuccess: (data) => {
      window.location.href = `/application/${data.application.id}`;
    },
  });

  return (
    <div className="min-h-screen font-sans text-left bg-white">
      <Navbar />
      <HeroSection 
        title={
          <h1 className="font-black uppercase tracking-tighter text-white mb-4 sm:mb-8 w-full block [text-wrap:balance] [word-break:keep-all] [overflow-wrap:break-word] text-left" style={{ fontSize: 'clamp(38px, 9vw, 96px)', lineHeight: '1' }}>
            REDUCIMOS TU CARGA FISCAL<br />
            <span className="text-brand-lime">CON UNA LLC AMERICANA</span>
          </h1>
        }
        subtitle={
          <p className="text-sm sm:text-xl text-white/90 font-medium max-w-3xl mb-6 sm:mb-10 leading-relaxed text-left">
            Profesionales ayudando a profesionales. <span className="block sm:inline">Te entregamos tu LLC en 3 días. Sin IVA. Sin Impuesto de Sociedades. Sin cuota de autónomos.</span>
          </p>
        }
      >
        <div className="flex flex-wrap justify-start gap-1.5 sm:gap-4 mb-6 sm:mb-10 w-full max-w-full overflow-hidden">
          <span className="inline-flex items-center px-2.5 py-1 sm:px-6 sm:py-3 rounded-full bg-brand-lime text-brand-dark font-black text-[9px] sm:text-base shadow-md whitespace-nowrap">
            Apertura Cuenta Mercury & Relay
          </span>
          <span className="inline-flex items-center px-2.5 py-1 sm:px-6 sm:py-3 rounded-full bg-brand-lime text-brand-dark font-black text-[9px] sm:text-base shadow-md whitespace-nowrap">
            Tarjeta Física de Crédito y Débito
          </span>
          <span className="inline-flex items-center px-2.5 py-1 sm:px-6 sm:py-3 rounded-full bg-brand-lime text-brand-dark font-black text-[9px] sm:text-base shadow-md whitespace-nowrap">
            Gestión Documental Completa
          </span>
        </div>
        <div className="mb-6 sm:mb-10 flex justify-start">
          <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 sm:gap-6 bg-white px-3 py-2 sm:px-8 sm:py-5 rounded-full shadow-lg border border-gray-100">
            <img src={trustpilotLogo} alt="Trustpilot" className="h-5 sm:h-10 w-auto" />
            <div className="flex gap-0.5 sm:gap-1">
              {[1,2,3,4,5].map((star) => (
                <svg key={star} className="w-3 h-3 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="#00b67a">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              ))}
            </div>
            <span className="text-brand-dark text-xs sm:text-xl font-black">5/5</span>
          </a>
        </div>
        <div className="flex flex-col sm:flex-row justify-start gap-3 sm:gap-4 mb-8 sm:mb-12 w-full">
          <Button size="lg" onClick={() => setLocation("/servicios")} disabled={createOrderMutation.isPending} className="bg-brand-lime text-brand-dark font-black text-sm sm:text-base px-6 sm:px-10 border-0 rounded-full w-full sm:w-auto h-12 sm:h-14 shadow-lg">
            {createOrderMutation.isPending ? "Procesando..." : "Empieza ahora →"}
          </Button>
          <Button size="lg" onClick={() => setLocation("/servicios")} variant="outline" className="border-white text-white font-black text-sm sm:text-base px-6 sm:px-10 hover:bg-white/10 rounded-full w-full sm:w-auto h-12 sm:h-14">
            Conoce Nuestros Servicios
          </Button>
        </div>
      </HeroSection>
      <section className="bg-white py-20 sm:py-24" id="ventajas">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16 sm:mb-20 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">VENTAJAS</span>
              Ventajas fiscales
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
              (Te ayudamos a optimizar tu estructura)
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { badge: "IVA", title: "Eliminamos el IVA en tus servicios digitales", text: "Trabajamos para que tu LLC no cobre IVA a clientes B2B internacionales.", footer: "Tus servicios están exentos." },
              { badge: "Impuestos", title: "Eliminamos el Impuesto de Sociedades", text: "Te constituimos en New Mexico o Wyoming: 0% impuesto estatal.", footer: "Impuesto de Sociedades al 0%." },
              { badge: "Cuotas", title: "Eliminamos la cuota fija mensual", text: "No existe cuota de autónomos. No pagas nada hasta que generes beneficios.", footer: "Sin cuota de autónomos." },
              { badge: "Banca", title: "Apertura de cuenta Mercury & Relay", text: "Te acompañamos en la apertura de tus cuentas bancarias USA y obtención de tarjeta física de crédito y débito.", footer: "Tarjeta física internacional." },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden border border-brand-dark/5 flex flex-col">
                <div className="p-6 flex-grow">
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-brand-lime text-brand-dark mb-4">{card.badge}</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-brand-dark mb-3 leading-tight">{card.title}</h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{card.text}</p>
                </div>
                <div className="bg-brand-lime/10 px-6 py-4 border-t border-brand-lime/20 mt-auto">
                  <p className="text-sm font-bold text-brand-dark">{card.footer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PorQueEasyUSLLC />

      <section className="py-20 sm:py-32 bg-white">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12 sm:mb-20 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">PROCESO</span>
              Cómo Trabajamos
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">(En 6 simples pasos)</p>
          </div>
          <div className="max-w-3xl mx-auto">
            {[
              { num: "1", title: "Elige en que estado constituir tu LLC", text: "New Mexico, Wyoming o Delaware. Pago seguro." },
              { num: "2", title: "Unas preguntas rapidas y esenciales", text: "5 minutos. Datos básicos de tu LLC." },
              { num: "3", title: "Foto de tu dni o pasaporte", text: "DNI o pasaporte. Foto con móvil." },
              { num: "4", title: "Tramitamos la constitución", text: "Secretario de Estado, EIN, todos los documentos." },
              { num: "5", title: "Recibes tu documentación", text: "En 2-3 días hábiles todo en tu email." },
              { num: "6", title: "Te ayudamos a abrir pasarelas y cuentas bancarias", text: "Acompañamiento en Mercury, Relay y Stripe." },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-10 last:mb-0">
                <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 bg-brand-lime rounded-full flex items-center justify-center text-brand-dark font-black text-lg sm:text-2xl shadow-md">
                  {step.num}
                </div>
                <div className="pt-1 sm:pt-2 text-center">
                  <p className="font-black uppercase tracking-tight text-lg sm:text-2xl text-brand-dark mb-1">{step.title}</p>
                  <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <HelpSection />
      <Footer />
    </div>
  );
}

function PorQueEasyUSLLC() {
  return (
    <section className="py-8 sm:py-14 bg-white">
      <div className="container max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
            <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">VALORES</span>
            ¿Por qué Easy US LLC?
          </h2>
          <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
            (Lo que nos hace diferentes)
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { title: "Rapidez Real", desc: "LLC lista en 2-3 días hábiles. Sin esperas innecesarias." },
            { title: "Transparencia", desc: "Precio cerrado todo incluido. Sin sorpresas ni letra pequeña." },
            { title: "Especialistas", desc: "Somos profesionales ayudando a emprendedores digitales." },
            { title: "Soporte Humano", desc: "Hablamos tu idioma. Atención por WhatsApp y email." },
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-brand-lime/5 rounded-2xl border border-brand-lime/10 hover:bg-brand-lime/10 transition-colors text-center">
              <p className="font-bold text-lg sm:text-xl mb-3 text-brand-dark">{feature.title}</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
