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
import { motion } from "framer-motion";

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
    <div className="min-h-screen font-sans text-left bg-white overflow-x-hidden">
      <Navbar />
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-32 sm:pt-16 min-h-[550px] sm:min-h-[85vh]"
        showOverlay={false}
        title={
          <motion.div 
            className="flex flex-col items-center w-full"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Trustpilot above title for mobile, hidden on PC */}
            <motion.div className="mb-6 sm:hidden flex justify-center" variants={fadeIn}>
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-md border border-gray-100">
                <img src={trustpilotLogo} alt="Trustpilot" className="h-5 w-auto" />
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#00b67a">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-brand-dark text-xs font-black">5/5</span>
              </a>
            </motion.div>

            <motion.h1 
              className="font-black uppercase tracking-tighter text-brand-dark mb-6 sm:mb-4 w-full block [text-wrap:balance] [word-break:keep-all] [overflow-wrap:break-word] text-center" 
              style={{ fontSize: 'clamp(32px, 10vw, 76px)', lineHeight: '0.9' }}
              variants={fadeIn}
            >
              Optimiza la estructura fiscal de tu negocio digital<br />
              <span className="text-brand-lime">con una LLC Americana</span>
            </motion.h1>
          </motion.div>
        }
        subtitle={
          <motion.div 
            className="flex flex-col items-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.p 
              className="text-[13px] sm:text-base text-brand-dark font-medium max-w-3xl mb-12 sm:mb-8 leading-relaxed text-center mx-auto px-2"
              variants={fadeIn}
            >
              Para freelancers, emprendedores digitales, ecommerce y negocios de servicios online. <span className="block sm:inline font-bold mt-2">Te entregamos tu LLC en 2 días. Sin IVA. Sin Impuesto de Sociedades. Sin cuota de autónomos.</span>
            </motion.p>
            
            {/* Trustpilot below description for PC, hidden on mobile */}
            <motion.div className="hidden sm:flex mb-8 justify-center" variants={fadeIn}>
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-md border border-gray-100">
                <img src={trustpilotLogo} alt="Trustpilot" className="h-7 w-auto" />
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5" viewBox="0 0 24 24" fill="#00b67a">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-brand-dark text-lg font-black">5/5</span>
              </a>
            </motion.div>

            {/* Badges below description for PC */}
            <motion.div className="hidden sm:flex flex-wrap justify-center gap-3 mb-8 px-2" variants={fadeIn}>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-lime text-brand-dark font-black text-sm shadow-sm whitespace-nowrap">
                Tu LLC en 2 días
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-lime text-brand-dark font-black text-sm shadow-sm whitespace-nowrap">
                Pack Todo Incluido
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-lime text-brand-dark font-black text-sm shadow-sm whitespace-nowrap">
                Sin IVA
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-lime text-brand-dark font-black text-sm shadow-sm whitespace-nowrap">
                Precios Transparentes
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-lime text-brand-dark font-black text-sm shadow-sm whitespace-nowrap">
                Trato Cercano
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-lime text-brand-dark font-black text-sm shadow-sm whitespace-nowrap">
                Apertura Cuenta Mercury & Relay
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-lime text-brand-dark font-black text-sm shadow-sm whitespace-nowrap">
                Tarjeta Física de Crédito y Débito
              </span>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-4 sm:mb-4 w-full" variants={fadeIn}>
              <Button size="lg" onClick={() => setLocation("/servicios")} disabled={createOrderMutation.isPending} className="bg-brand-lime text-brand-dark font-black text-sm sm:text-sm px-8 border-0 rounded-full w-full sm:w-auto h-12 sm:h-12 shadow-md">
                {createOrderMutation.isPending ? "Procesando..." : "Empieza ahora →"}
              </Button>
              <Button size="lg" onClick={() => setLocation("/servicios")} variant="outline" className="border-brand-dark text-brand-dark font-black text-sm sm:text-sm px-8 hover:bg-brand-dark/5 rounded-full w-full sm:w-auto h-12 sm:h-12">
                Conoce Nuestros Servicios
              </Button>
            </motion.div>
          </motion.div>
        }
      />

      <section className="bg-white py-20 sm:py-24 border-t border-brand-dark/5" id="ventajas">
        <div className="w-full px-5 sm:px-8">
          <motion.div 
            className="text-center mb-16 sm:mb-20 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">VENTAJAS</span>
              Ventajas fiscales
            </motion.h2>
            <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>
              (Te ayudamos a optimizar tu estructura)
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { badge: "IVA", title: "Sin IVA en la LLC", text: "La LLC no aplica IVA en la facturación de servicios digitales, tanto a clientes finales como a clientes B2B internacionales. Estructuramos la actividad para que la facturación se realice correctamente desde la empresa americana, sin IVA, conforme a la normativa aplicable y al tipo de operación.", footer: "Tus servicios están exentos." },
              { badge: "Impuestos", title: "0% Impuesto de Sociedades", text: "En estados como New Mexico o Wyoming, la LLC no está sujeta a impuesto de sociedades estatal. La empresa no tributa como sociedad en Estados Unidos, sino que los beneficios se atribuyen directamente al propietario, según la estructura fiscal de la LLC.", footer: "Impuesto de Sociedades al 0%." },
              { badge: "Cuotas", title: "Sin cuota fija", text: "En Estados Unidos no existe una cuota mensual de autónomos asociada a la LLC. No hay pagos periódicos obligatorios por el simple hecho de tener la empresa activa, independientemente de que exista o no actividad. La estructura mantiene costes fijos reducidos y una gestión más ligera.", footer: "Sin cuota de autónomos." },
              { badge: "Banca", title: "Banca internacional", text: "Te acompañamos en el proceso de apertura de cuentas bancarias en Mercury y Relay. Accede a una cuenta empresarial en USD, con capacidad para recibir y enviar transferencias internacionales y disponer de tarjeta física de débito y crédito para operar a nivel global.", footer: "Tarjeta física internacional." },
            ].map((card, i) => (
              <motion.div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden border border-brand-dark/5 sm:border-brand-dark/5 border-brand-lime/20 flex flex-col" variants={fadeIn}>
                <div className="p-6 flex-grow">
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-brand-lime text-brand-dark mb-4">{card.badge}</span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-brand-dark mb-3 leading-tight">{card.title}</h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{card.text}</p>
                </div>
                <div className="bg-brand-lime/10 px-6 py-4 border-t border-brand-lime/20 mt-auto">
                  <p className="text-sm font-bold text-brand-dark">{card.footer}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <PorQueEasyUSLLC />

      <div className="container max-w-7xl mx-auto px-5 sm:px-8">
        <div className="border-t border-brand-dark/5 w-full" />
      </div>

      <section className="py-20 sm:py-32 bg-white">
        <div className="w-full px-5 sm:px-8">
          <motion.div 
            className="mb-12 sm:mb-20 text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight mb-4 text-center" variants={fadeIn}>
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">PROCESO</span>
              Cómo Trabajamos
            </motion.h2>
            <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>(En 6 pasos sencillos)</motion.p>
          </motion.div>
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { num: "1", title: "Elige el estado", text: "New Mexico, Wyoming o Delaware. Te asesoramos para elegir la mejor opción." },
              { num: "2", title: "Información básica", text: "Un formulario breve de 5 minutos con los datos esenciales de tu LLC." },
              { num: "3", title: "Verificación de identidad", text: "DNI o pasaporte. Una foto rápida y segura desde tu móvil." },
              { num: "4", title: "Constitución de la LLC", text: "Gestionamos todo el proceso: registro oficial, EIN y documentación completa." },
              { num: "5", title: "Documentación en tu email", text: "En 2–3 días hábiles, recibes toda la información lista para usar." },
              { num: "6", title: "Banca y pasarelas", text: "Te acompañamos en la apertura de cuentas y plataformas como Mercury, Relay y Stripe." },
            ].map((step, i) => (
              <motion.div key={i} className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-10 last:mb-0" variants={fadeIn}>
                <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 bg-brand-lime rounded-full flex items-center justify-center text-brand-dark font-black text-lg sm:text-2xl shadow-md">
                  {step.num}
                </div>
                <div className="pt-1 sm:pt-2 text-center">
                  <p className="font-black uppercase tracking-tight text-lg sm:text-2xl text-brand-dark mb-1">{step.title}</p>
                  <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
    <section className="py-8 sm:py-14 bg-white border-t border-brand-dark/5">
      <div className="w-full px-5 sm:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
            <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">VALORES</span>
            ¿Por qué Easy US LLC?
          </motion.h2>
          <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>
            (Lo que nos hace diferentes)
          </motion.p>
        </motion.div>
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {[
            { title: "RAPIDEZ REAL", desc: "Tu LLC lista en 2–3 días hábiles, con un proceso ágil y bien organizado desde el primer momento." },
            { title: "TRANSPARENCIA", desc: "Precio claro y cerrado desde el inicio. Todo incluido, sin costes ocultos ni sorpresas." },
            { title: "ESPECIALISTAS", desc: "Equipo con experiencia real en negocios digitales e internacionales, enfocados en hacerlo fácil para ti." },
            { title: "SOPORTE HUMANO", desc: "Atención directa y cercana en tu idioma, por WhatsApp y email, siempre que lo necesites." },
          ].map((feature, i) => (
            <motion.div key={i} className="p-6 bg-brand-lime/5 rounded-2xl border border-brand-lime/10 sm:border-brand-lime/10 border-brand-lime/30 hover:bg-brand-lime/10 transition-colors text-center" variants={fadeIn}>
              <p className="font-display font-black uppercase tracking-tighter text-lg sm:text-xl mb-3 text-brand-dark">{feature.title}</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
