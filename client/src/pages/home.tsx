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
import { NewsletterSection } from "@/components/layout/newsletter-section";
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
        className="flex flex-col items-center justify-center text-center pt-24 sm:pt-32"
        title={
          <h1 className="font-black uppercase tracking-tighter text-brand-dark mb-2 sm:mb-4 w-full block [text-wrap:balance] [word-break:keep-all] [overflow-wrap:break-word] text-center" style={{ fontSize: 'clamp(28px, 6vw, 64px)', lineHeight: '0.95' }}>
            Optimiza la estructura fiscal de tu negocio digital<br />
            <span className="text-brand-lime">con una LLC Americana</span>
          </h1>
        }
        subtitle={
          <p className="text-xs sm:text-base text-brand-dark font-medium max-w-3xl mb-3 sm:mb-4 leading-relaxed text-center mx-auto">
            Para freelancers, emprendedores digitales, ecommerce y negocios de servicios online. <span className="block sm:inline font-bold">Te entregamos tu LLC en 2 días. Sin IVA. Sin Impuesto de Sociedades. Sin cuota de autónomos.</span>
          </p>
        }
      >
        <div className="flex flex-wrap justify-center gap-1 sm:gap-3 mb-3 sm:mb-4 w-full max-w-full overflow-hidden">
          <span className="inline-flex items-center px-2 py-0.5 sm:px-4 sm:py-2 rounded-full bg-brand-lime text-brand-dark font-black text-[8px] sm:text-sm shadow-sm whitespace-nowrap">
            Tu LLC en 2 días
          </span>
          <span className="inline-flex items-center px-2 py-0.5 sm:px-4 sm:py-2 rounded-full bg-brand-lime text-brand-dark font-black text-[8px] sm:text-sm shadow-sm whitespace-nowrap">
            Pack Todo Incluido
          </span>
          <span className="inline-flex items-center px-2 py-0.5 sm:px-4 sm:py-2 rounded-full bg-brand-lime text-brand-dark font-black text-[8px] sm:text-sm shadow-sm whitespace-nowrap">
            Sin IVA
          </span>
          <span className="inline-flex items-center px-2 py-0.5 sm:px-4 sm:py-2 rounded-full bg-brand-lime text-brand-dark font-black text-[8px] sm:text-sm shadow-sm whitespace-nowrap">
            Precios Transparentes, Trato Cercano
          </span>
          <span className="inline-flex items-center px-2 py-0.5 sm:px-4 sm:py-2 rounded-full bg-brand-lime text-brand-dark font-black text-[8px] sm:text-sm shadow-sm whitespace-nowrap">
            Apertura Cuenta Mercury & Relay
          </span>
          <span className="inline-flex items-center px-2 py-0.5 sm:px-4 sm:py-2 rounded-full bg-brand-lime text-brand-dark font-black text-[8px] sm:text-sm shadow-sm whitespace-nowrap">
            Tarjeta Física de Crédito y Débito
          </span>
        </div>
        <div className="mb-3 sm:mb-4 flex justify-center">
          <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 sm:gap-4 bg-white px-2 py-1.5 sm:px-6 sm:py-3 rounded-full shadow-md border border-gray-100">
            <img src={trustpilotLogo} alt="Trustpilot" className="h-4 sm:h-7 w-auto" />
            <div className="flex gap-0.5 sm:gap-1">
              {[1,2,3,4,5].map((star) => (
                <svg key={star} className="w-2.5 h-2.5 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="#00b67a">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              ))}
            </div>
            <span className="text-brand-dark text-[10px] sm:text-lg font-black">5/5</span>
          </a>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-2 sm:mb-4 w-full">
          <Button size="lg" onClick={() => setLocation("/servicios")} disabled={createOrderMutation.isPending} className="bg-brand-lime text-brand-dark font-black text-xs sm:text-sm px-4 sm:px-8 border-0 rounded-full w-full sm:w-auto h-10 sm:h-12 shadow-md">
            {createOrderMutation.isPending ? "Procesando..." : "Empieza ahora →"}
          </Button>
          <Button size="lg" onClick={() => setLocation("/servicios")} variant="outline" className="border-brand-dark text-brand-dark font-black text-xs sm:text-sm px-4 sm:px-8 hover:bg-brand-dark/5 rounded-full w-full sm:w-auto h-10 sm:h-12">
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
              { badge: "IVA", title: "Sin IVA en la LLC", text: "La LLC no aplica IVA en la facturación de servicios digitales, tanto a clientes finales como a clientes B2B internacionales. Estructuramos la actividad para que la facturación se realice correctamente desde la empresa americana, sin IVA, conforme a la normativa aplicable y al tipo de operación.", footer: "Tus servicios están exentos." },
              { badge: "Impuestos", title: "0% Impuesto de Sociedades", text: "En estados como New Mexico o Wyoming, la LLC no está sujeta a impuesto de sociedades estatal. La empresa no tributa como sociedad en Estados Unidos, sino que los beneficios se atribuyen directamente al propietario, según la estructura fiscal de la LLC.", footer: "Impuesto de Sociedades al 0%." },
              { badge: "Cuotas", title: "Sin cuota fija", text: "En Estados Unidos no existe una cuota mensual de autónomos asociada a la LLC. No hay pagos periódicos obligatorios por el simple hecho de tener la empresa activa, independientemente de que exista o no actividad. La estructura mantiene costes fijos reducidos y una gestión más ligera.", footer: "Sin cuota de autónomos." },
              { badge: "Banca", title: "Banca internacional", text: "Te acompañamos en el proceso de apertura de cuentas bancarias en Mercury y Relay. Accede a una cuenta empresarial en USD, con capacidad para recibir y enviar transferencias internacionales y disponer de tarjeta física de débito y crédito para operar a nivel global.", footer: "Tarjeta física internacional." },
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
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">(En 6 pasos sencillos)</p>
          </div>
          <div className="max-w-3xl mx-auto">
            {[
              { num: "1", title: "Elige el estado", text: "New Mexico, Wyoming o Delaware. Te asesoramos para elegir la mejor opción." },
              { num: "2", title: "Información básica", text: "Un formulario breve de 5 minutos con los datos esenciales de tu LLC." },
              { num: "3", title: "Verificación de identidad", text: "DNI o pasaporte. Una foto rápida y segura desde tu móvil." },
              { num: "4", title: "Constitución de la LLC", text: "Gestionamos todo el proceso: registro oficial, EIN y documentación completa." },
              { num: "5", title: "Documentación en tu email", text: "En 2–3 días hábiles, recibes toda la información lista para usar." },
              { num: "6", title: "Banca y pasarelas", text: "Te acompañamos en la apertura de cuentas y plataformas como Mercury, Relay y Stripe." },
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
      <NewsletterSection />
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
            { title: "Rapidez real", desc: "Tu LLC lista en 2–3 días hábiles, con un proceso ágil y bien organizado desde el primer momento." },
            { title: "Transparencia", desc: "Precio claro y cerrado desde el inicio. Todo incluido, sin costes ocultos ni sorpresas." },
            { title: "Especialistas", desc: "Equipo con experiencia real en negocios digitales e internacionales, enfocados en hacerlo fácil para ti." },
            { title: "Soporte humano", desc: "Atención directa y cercana en tu idioma, por WhatsApp y email, siempre que lo necesites." },
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
