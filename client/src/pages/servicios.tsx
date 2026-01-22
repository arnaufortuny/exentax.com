import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { HelpSection } from "@/components/layout/help-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import type { Product } from "@shared/schema";

export default function Servicios() {
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
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setLocation(`/application/${data.application.id}`);
    },
  });

  const handleSelectProduct = (productId: number) => {
    if (createOrderMutation.isPending) return;
    createOrderMutation.mutate(productId);
  };

  const nmProduct = products?.find(p => p.name.includes("New Mexico"));
  const wyProduct = products?.find(p => p.name.includes("Wyoming"));
  const deProduct = products?.find(p => p.name.includes("Delaware"));

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

  const faqCategories = [
    {
      title: "Sobre el Servicio",
      questions: [
        {
          q: "¿Qué incluye exactamente el precio?",
          a: "Todo lo necesario para operar: tasas estatales, Registered Agent 12 meses, Articles of Organization, Operating Agreement, EIN del IRS, BOI Report ante FinCEN, y soporte durante 12 meses. Sin costes ocultos."
        },
        {
          q: "¿Cuánto tiempo tarda el proceso?",
          a: "Entre 2 y 3 días hábiles desde que recibimos toda tu documentación completa. Te mantenemos informado en cada paso del proceso."
        },
        {
          q: "¿Necesito viajar a Estados Unidos?",
          a: "No. Todo el proceso se realiza 100% online. No necesitas visa, no necesitas presencia física. Gestionamos todo de forma remota."
        },
        {
          q: "¿Qué documentos necesito enviar?",
          a: "Solo una foto de tu DNI o pasaporte en vigor. La foto puede ser tomada con tu móvil, siempre que sea legible. No necesitas apostillar ni legalizar nada."
        },
      ]
    },
    {
      title: "Estados y Paquetes",
      questions: [
        {
          q: "¿Cuál es la diferencia entre los estados?",
          a: "New Mexico (639€) es el más económico. Wyoming (799€) ofrece mayor prestigio y privacidad. Delaware (999€) es el estándar para startups que buscan inversión."
        },
        {
          q: "¿Buscabas otro estado? Contactanos!",
          a: "Si necesitas constituir en un estado diferente, contáctanos y te daremos presupuesto personalizado."
        },
      ]
    },
    {
      title: "Banca y Cuentas",
      questions: [
        {
          q: "¿Con qué bancos trabajáis?",
          a: "Somos especialistas en apertura de cuenta Mercury y cuenta Relay Financial. Son los neobancos líderes para LLCs en USA, ofreciendo cuentas bancarias completas, tarjeta física de débito y crédito, y transferencias internacionales sin complicaciones."
        },
        {
          q: "¿Tendré tarjeta física?",
          a: "Sí, al abrir tu cuenta en Mercury o Relay obtendrás tarjetas físicas de débito y crédito que enviamos a tu domicilio. Perfectas para gestionar los gastos de tu negocio y retirar fondos."
        },
      ]
    },
    {
      title: "Aspectos Legales y Fiscales",
      questions: [
        {
          q: "¿Qué obligaciones fiscales tiene una LLC?",
          a: "Debe presentar declaraciones al IRS (Forms 1120/5472), mantener el Registered Agent activo, y presentar Annual Report según el estado. El primer año las declaraciones no se presentan."
        },
        {
          q: "¿Qué es el BOI Report?",
          a: "El Beneficial Ownership Information Report es una declaración obligatoria ante FinCEN que identifica a los propietarios reales de la LLC. Lo preparamos nosotros."
        },
      ]
    },
  ];

  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});

  const toggleItem = (category: string, index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [category]: prev[category] === index ? null : index
    }));
  };

  const maintenanceFeatures = [
    "Presentación Form 1120 ante el IRS",
    "Presentación Form 5472 ante el IRS",
    "Renovación Registered Agent (12 meses)",
    "Presentación y Gestión Annual Report",
    "Soporte Ilimitado (12 meses)",
    "Renovación de BOI Report (si fuera necesario)",
    "1 Actualización de Articles of Organization"
  ];

  return (
    <div className="min-h-screen font-sans bg-white text-center">
      <Navbar />
      
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-12 sm:pt-16 lg:pt-20"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-brand-dark uppercase tracking-tight leading-[1.1] text-center">
            Constituimos tu LLC en Estados Unidos de <span className="text-brand-lime">forma simple, rápida y transparente.</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl lg:text-2xl text-brand-dark font-medium leading-relaxed max-w-2xl text-center mb-12 sm:mb-20 mx-auto">
            Todo lo que necesitas saber sobre tu LLC: estructura, impuestos, bancos y cómo trabajamos.
          </p>
        }
      />

      {/* 1. Servicios Constitución */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="servicios">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-6 sm:mb-10 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">SERVICIOS</span>
              Constitución de LLC
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">(Lo que hacemos por ti)</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-7xl mx-auto">
            {[
              { title: "Constitución oficial de tu LLC", desc: "Preparamos y presentamos tu empresa ante el Secretary of State, gestionando todo el proceso de forma ágil y sin que tengas que preocuparte por trámites." },
              { title: "Obtención del EIN", desc: "Solicitamos tu Employer Identification Number directamente ante el IRS para que tu LLC quede correctamente identificada a nivel fiscal." },
              { title: "Cuentas bancarias en EE. UU.", desc: "Te acompañamos en la apertura de cuentas en Mercury y Relay, con acceso a banca en USD y tarjetas físicas de débito y crédito." },
              { title: "BOI Report ante FinCEN", desc: "Preparamos y presentamos tu Beneficial Ownership Information Report, cumpliendo con la obligación federal vigente desde 2024." },
              { title: "Registered Agent incluido", desc: "Incluimos tu Registered Agent oficial durante el primer año completo, con dirección legal en Estados Unidos para tu empresa." },
              { title: "Tarjetas físicas", desc: "Gestionamos la obtención de tarjetas físicas de débito y crédito, enviadas a tu domicilio para que puedas operar con total control." },
            ].map((service, i) => (
              <div key={i} className="rounded-xl bg-brand-lime/5 border border-brand-lime/10 p-4 sm:p-6 text-center">
                <p className="font-display font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-1 sm:mb-3 leading-tight">{service.title}</p>
                <p className="text-[10px] sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Nuestros Packs */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="pricing">
        <div className="w-full px-4 sm:px-8">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">PACKS</span>
              Nuestros Packs
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
              (Elige el plan que mejor se adapte a ti)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* New Mexico */}
            <div className="border-[2px] border-brand-lime rounded-2xl overflow-hidden relative bg-white shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group">
              <div className="p-4 sm:p-6 flex-grow text-center">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <h3 className="text-lg sm:text-xl font-black text-brand-dark uppercase tracking-tight">New Mexico</h3>
                  <span className="bg-brand-lime/20 text-brand-dark text-[8px] sm:text-[11px] font-black px-2 py-1 rounded-full uppercase">Popular | 2-3 días</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <p className="text-3xl sm:text-4xl font-black text-brand-dark">639€</p>
                  <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-3 sm:mb-4 flex items-center justify-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-base mb-3 sm:mb-4 border-t border-brand-lime/10 pt-3 sm:pt-4">
                  {packFeatures.map((f) => (
                    <p key={f} className="flex items-center justify-start gap-1.5 sm:gap-2 text-brand-dark/80 font-medium text-left leading-tight">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span>{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(nmProduct?.id || 1)}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-brand-lime text-brand-dark font-black rounded-full py-3 sm:py-4 text-sm sm:text-base border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-9 sm:h-11"
                >
                  {createOrderMutation.isPending && createOrderMutation.variables === (nmProduct?.id || 1) ? "Procesando..." : "Elegir New Mexico"}
                </Button>
              </div>
              <div className="bg-brand-cream/30 px-4 py-2 sm:px-5 sm:py-3 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[7px] sm:text-[9px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 349€</p>
              </div>
            </div>

            {/* Wyoming */}
            <div className="border-[2px] border-brand-lime rounded-2xl overflow-hidden relative bg-white shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group">
              <div className="p-4 sm:p-6 flex-grow text-center">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <h3 className="text-lg sm:text-xl font-black text-brand-dark uppercase tracking-tight">Wyoming</h3>
                  <span className="bg-brand-dark text-white text-[8px] sm:text-[11px] font-black px-2 py-1 rounded-full uppercase">Premium | 2-3 días</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <p className="text-3xl sm:text-4xl font-black text-brand-dark">799€</p>
                  <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-3 sm:mb-4 flex items-center justify-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-base mb-3 sm:mb-4 border-t border-brand-lime/10 pt-3 sm:pt-4">
                  {packFeatures.map((f) => (
                    <p key={f} className="flex items-center justify-start gap-1.5 sm:gap-2 text-brand-dark/80 font-medium text-left leading-tight">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span>{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(wyProduct?.id || 2)}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-brand-lime text-brand-dark font-black rounded-full py-3 sm:py-4 text-sm sm:text-base border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-9 sm:h-11"
                >
                  {createOrderMutation.isPending && createOrderMutation.variables === (wyProduct?.id || 2) ? "Procesando..." : "Elegir Wyoming"}
                </Button>
              </div>
              <div className="bg-brand-cream/30 px-4 py-2 sm:px-5 sm:py-3 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[7px] sm:text-[9px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 499€</p>
              </div>
            </div>

            {/* Delaware */}
            <div className="border-[2px] border-brand-lime rounded-2xl overflow-hidden relative bg-white shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group">
              <div className="p-4 sm:p-6 flex-grow text-center">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <h3 className="text-lg sm:text-xl font-black text-brand-dark uppercase tracking-tight">Delaware</h3>
                  <span className="bg-brand-lime text-brand-dark text-[8px] sm:text-[11px] font-black px-2 py-1 rounded-full uppercase">Startups | 2-5 días</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <p className="text-3xl sm:text-4xl font-black text-brand-dark">999€</p>
                  <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-3 sm:mb-4 flex items-center justify-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-base mb-3 sm:mb-4 border-t border-brand-lime/10 pt-3 sm:pt-4">
                  {packFeatures.map((f) => (
                    <p key={f} className="flex items-center justify-start gap-1.5 sm:gap-2 text-brand-dark/80 font-medium text-left leading-tight">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span>{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(deProduct?.id || 3)}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-brand-lime text-brand-dark font-black rounded-full py-3 sm:py-4 text-sm sm:text-base border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-9 sm:h-11"
                >
                  {createOrderMutation.isPending && createOrderMutation.variables === (deProduct?.id || 3) ? "Procesando..." : "Elegir Delaware"}
                </Button>
              </div>
              <div className="bg-brand-cream/30 px-4 py-2 sm:px-5 sm:py-3 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[7px] sm:text-[9px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 599€</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Banca & Mantenimiento (Unified Section) */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="bancos">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">BANCOS</span>
              Asistencia Bancaria
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
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
              <div key={i} className="rounded-xl bg-brand-lime/5 border border-brand-lime/10 p-4 sm:p-5 text-center">
                <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-2">{service.title}</p>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm sm:text-lg text-brand-dark font-medium italic mb-12">Incluido en tu paquete inicial.</p>

          <div className="border-t border-brand-dark/5 w-full max-w-7xl mx-auto mb-12" />

          <div className="text-center mb-6 sm:mb-10 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">MANTENIMIENTO</span>
              Precios Mantenimiento
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">(Todo incluido anualmente)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              { state: "New Mexico", price: "349€", annual: true },
              { state: "Wyoming", price: "499€", annual: true },
              { state: "Delaware", price: "599€", annual: true }
            ].map((item, i) => (
              <div key={i} className="border-[2px] border-brand-lime rounded-2xl overflow-hidden relative bg-white shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group text-center">
                <div className="p-4 sm:p-6 flex-grow text-center">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h3 className="text-lg sm:text-xl font-black text-brand-dark uppercase tracking-tight">{item.state}</h3>
                    <span className="bg-brand-lime/20 text-brand-dark text-[8px] sm:text-[11px] font-black px-2 py-1 rounded-full uppercase">Mantenimiento</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <p className="text-3xl sm:text-4xl font-black text-brand-dark">{item.price}</p>
                    <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">/año</span>
                  </div>
                  <p className="text-muted-foreground text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-3 sm:mb-4 flex items-center justify-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-brand-lime" />
                    Tasas estatales incluidas
                  </p>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-base mb-3 sm:mb-4 border-t border-brand-lime/10 pt-3 sm:pt-4">
                    {maintenanceFeatures.map((f) => (
                      <p key={f} className="flex items-center justify-start gap-1.5 sm:gap-2 text-brand-dark/80 font-medium text-left leading-tight">
                        <span className="text-brand-lime font-black">✓</span> 
                        <span>{f}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="p-4 sm:p-6 pt-0">
                  <Button className="w-full bg-brand-lime text-brand-dark font-black rounded-full py-3 sm:py-4 text-sm sm:text-base border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-9 sm:h-11">
                    Contratar Mantenimiento
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Servicios Extras */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="extras">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-6 sm:mb-10 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">EXTRAS</span>
              Servicios Adicionales
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">(Servicios a medida para tu LLC)</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 max-w-4xl mx-auto">
            {[
              { title: "Disolución de LLC", desc: "Gestionamos el cierre oficial y ordenado de tu LLC en Estados Unidos, asegurando que la estructura quede correctamente disuelta y sin obligaciones futuras." },
              { title: "Enmiendas de la LLC", desc: "Tramitamos modificaciones oficiales como cambio de nombre, actualización de datos o ajustes estructurales, manteniendo tu empresa siempre en regla." },
              { title: "Agente Registrado", desc: "Gestión y renovación del Registered Agent para garantizar que tu LLC disponga de dirección legal válida y cumpla con los requisitos estatales." },
              { title: "PRESENTACIÓN FISCAL", desc: "Preparamos y presentamos los formularios 1120 y 5472 ante el IRS, cumpliendo con las obligaciones informativas federales aplicables a LLCs de propietarios no residentes." },
            ].map((service, i) => (
              <div key={i} className="rounded-xl bg-brand-lime/5 border border-brand-lime/10 p-4 sm:p-6 text-center">
                <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-2">{service.title}</p>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Soporte Section */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="soporte">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-6 sm:mb-10 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">SOPORTE</span>
              Soporte Ilimitado
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
              Incluido durante 12 meses
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-8 max-w-6xl mx-auto">
            {[
              { title: "Email y WhatsApp", desc: "Atención directa y personalizada para resolver tus dudas operativas cuando lo necesites." },
              { title: "Guía de bienvenida", desc: "Manual claro y práctico para entender cómo funciona tu LLC y cómo mantenerla correctamente." },
              { title: "Alertas de plazos", desc: "Te avisamos con antelación de las obligaciones y fechas clave para que no se te pase nada." },
            ].map((service, i) => (
              <div key={i} className="rounded-xl bg-white border border-brand-lime/10 p-6 shadow-sm text-center">
                <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-3">{service.title}</p>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center">
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">FAQ</span>
              Preguntas Frecuentes
            </h2>
            <p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">
              (Resolvemos tus dudas de inmediato)
            </p>
          </div>
          <div className="space-y-4 text-left">
            {faqCategories.map((category) => (
              <div key={category.title} className="space-y-4">
                <h3 className="text-lg font-black text-brand-dark uppercase tracking-tighter flex items-center gap-2 mt-8 mb-4">
                  <span className="w-1.5 h-6 bg-brand-lime rounded-full" />
                  {category.title}
                </h3>
                <div className="space-y-3 pt-6 border-t-2 border-brand-dark/10">
                  {category.questions.map((item, i) => (
                    <div 
                      key={i} 
                      className={`group transition-all duration-200 border-2 rounded-xl sm:rounded-2xl overflow-hidden ${
                        openItems[category.title] === i 
                          ? "border-brand-lime bg-brand-lime/[0.03]" 
                          : "border-brand-dark/5 hover:border-brand-lime/30 bg-white"
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(category.title, i)}
                        className="w-full px-5 py-5 text-left flex items-center justify-between gap-4 touch-manipulation"
                      >
                        <span className="font-bold text-brand-dark text-sm sm:text-base leading-tight tracking-tight">
                          {item.q}
                        </span>
                        <span className={`text-xl transition-transform duration-200 shrink-0 ${
                          openItems[category.title] === i ? "rotate-45 text-brand-lime" : "text-brand-dark/30"
                        }`}>
                          +
                        </span>
                      </button>
                      {openItems[category.title] === i && (
                        <div className="px-5 pb-5 text-brand-dark/80 text-xs sm:text-sm leading-relaxed border-t border-brand-lime/10 pt-4 animate-in fade-in slide-in-from-top-2 font-medium bg-brand-lime/5">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/faq">
              <Button 
                className="group bg-brand-lime text-brand-dark font-black text-sm sm:text-base px-8 py-6 rounded-full hover:bg-brand-lime/90 transition-all flex items-center gap-3 mx-auto shadow-xl active:scale-95 border-0"
              >
                Consulta nuestro FAQ completo
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <HelpSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
