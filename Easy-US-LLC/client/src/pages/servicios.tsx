import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

  return (
    <div className="min-h-screen font-sans bg-white text-left">
      <Navbar />
      
      <HeroSection 
        className="pt-24 sm:pt-32 lg:pt-40"
        title={<h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[1.1]">Nuestros <span className="text-brand-lime">Servicios</span></h1>}
        subtitle={
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl">
            Constituimos tu LLC en Estados Unidos de forma simple, rápida y transparente.
          </p>
        }
      />

      <section className="py-8 sm:py-14 bg-white" id="servicios">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight">
            <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">SERVICIOS</span>
            Constitución de LLC
          </h2>
          <p className="text-center text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 mb-6 sm:mb-10">(Lo que hacemos por ti)</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-12">
            {[
              { title: "Tramitación completa ante el gobierno", desc: "Preparamos y presentamos electrónicamente tus Articles of Organization ante el Secretary of State. Gestionamos todo el proceso oficial." },
              { title: "Obtención de EIN ante el IRS", desc: "Solicitamos y obtenemos tu Employer Identification Number (número fiscal) directamente ante el Internal Revenue Service." },
              { title: "Operating Agreement profesional", desc: "Redactamos tu contrato interno completo que regula funcionamiento de tu LLC. Documento legal imprescindible para bancos." },
              { title: "Presentación BOI Report ante FinCEN", desc: "Preparamos y presentamos tu Beneficial Ownership Information Report ante Financial Crimes Enforcement Network. Obligatorio federal desde 2024." },
              { title: "Registered Agent 12 meses", desc: "Contratamos y pagamos tu Registered Agent oficial en el estado durante el primer año completo. Tu dirección legal en USA." },
              { title: "Soporte y Orientación", desc: "Te ayudamos con bancos, procesadores y dudas durante todo el proceso de constitución." },
            ].map((service, i) => (
              <div key={i} className="rounded-xl bg-brand-lime/5 border border-brand-lime/10 p-4 sm:p-6 transition-transform active:scale-[0.98]">
                <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-1 sm:mb-3 leading-tight">{service.title}</p>
                <p className="text-[10px] sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20" id="pricing">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight mb-8 sm:mb-12">
            <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">MANTENIMIENTO / PACKS</span>
            Nuestros Packs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* New Mexico */}
            <div className="border-[3px] border-brand-lime rounded-3xl overflow-hidden relative bg-white shadow-xl flex flex-col h-full transform transition-all hover:scale-[1.02] hover:shadow-2xl group">
              <div className="p-5 sm:p-8 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tight">New Mexico</h3>
                  <span className="bg-brand-lime/20 text-brand-dark text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-full uppercase">Popular</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <p className="text-4xl sm:text-5xl font-black text-brand-dark">639€</p>
                  <span className="text-muted-foreground text-xs sm:text-sm font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-1.5">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm mb-8 sm:mb-10 border-t border-brand-lime/10 pt-4 sm:pt-6">
                  {[
                    "Tasas del estado pagadas",
                    "Registered Agent (12 meses)",
                    "Articles of Organization oficiales",
                    "Operating Agreement profesional",
                    "EIN del IRS",
                    "BOI Report presentado",
                    "Soporte completo 12 meses y Servicio Express"
                  ].map((f) => (
                    <p key={f} className="flex items-center gap-2 sm:gap-3 text-brand-dark/80 font-medium text-left">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span>{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-8 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(nmProduct?.id || 1)}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-brand-dark text-white font-black rounded-full py-5 sm:py-7 text-base sm:text-lg border-0 shadow-lg hover:bg-brand-lime hover:text-brand-dark transition-all transform active:scale-95 h-12 sm:h-14"
                >
                  {createOrderMutation.isPending && createOrderMutation.variables === (nmProduct?.id || 1) ? "Procesando..." : "Elegir New Mexico"}
                </Button>
              </div>
              <div className="bg-brand-cream/50 px-5 py-3 sm:px-6 sm:py-4 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 349€</p>
              </div>
            </div>

            {/* Wyoming */}
            <div className="border-[3px] border-brand-lime rounded-3xl overflow-hidden relative bg-white shadow-xl flex flex-col h-full transform transition-all hover:scale-[1.02] hover:shadow-2xl group">
              <div className="p-5 sm:p-8 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tight">Wyoming</h3>
                  <span className="bg-brand-dark text-white text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-full uppercase">Premium</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <p className="text-4xl sm:text-5xl font-black text-brand-dark">799€</p>
                  <span className="text-muted-foreground text-xs sm:text-sm font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-1.5">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm mb-8 sm:mb-10 border-t border-brand-lime/10 pt-4 sm:pt-6">
                  {[
                    "Tasas del estado pagadas",
                    "Registered Agent (12 meses)",
                    "Articles of Organization oficiales",
                    "Operating Agreement profesional",
                    "EIN del IRS",
                    "BOI Report presentado",
                    "Soporte completo 12 meses y Servicio Express"
                  ].map((f) => (
                    <p key={f} className="flex items-center gap-2 sm:gap-3 text-brand-dark/80 font-medium text-left">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span>{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-8 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(wyProduct?.id || 2)}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-brand-dark text-white font-black rounded-full py-5 sm:py-7 text-base sm:text-lg border-0 shadow-lg hover:bg-brand-lime hover:text-brand-dark transition-all transform active:scale-95 h-12 sm:h-14"
                >
                  {createOrderMutation.isPending && createOrderMutation.variables === (wyProduct?.id || 2) ? "Procesando..." : "Elegir Wyoming"}
                </Button>
              </div>
              <div className="bg-brand-cream/50 px-5 py-3 sm:px-6 sm:py-4 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 499€</p>
              </div>
            </div>

            {/* Delaware */}
            <div className="border-[3px] border-brand-lime rounded-3xl overflow-hidden relative bg-white shadow-xl flex flex-col h-full transform transition-all hover:scale-[1.02] hover:shadow-2xl group">
              <div className="p-5 sm:p-8 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tight">Delaware</h3>
                  <span className="bg-brand-lime text-brand-dark text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-full uppercase">Startups</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <p className="text-4xl sm:text-5xl font-black text-brand-dark">999€</p>
                  <span className="text-muted-foreground text-xs sm:text-sm font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-1.5">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm mb-8 sm:mb-10 border-t border-brand-lime/10 pt-4 sm:pt-6">
                  {[
                    "Tasas del estado pagadas",
                    "Registered Agent (12 meses)",
                    "Articles of Organization oficiales",
                    "Operating Agreement profesional",
                    "EIN del IRS",
                    "BOI Report presentado",
                    "Soporte completo 12 meses y Servicio Express"
                  ].map((f) => (
                    <p key={f} className="flex items-center gap-2 sm:gap-3 text-brand-dark/80 font-medium text-left">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span>{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-8 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(deProduct?.id || 3)}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-brand-dark text-white font-black rounded-full py-5 sm:py-7 text-base sm:text-lg border-0 shadow-lg hover:bg-brand-lime hover:text-brand-dark transition-all transform active:scale-95 h-12 sm:h-14"
                >
                  {createOrderMutation.isPending && createOrderMutation.variables === (deProduct?.id || 3) ? "Procesando..." : "Elegir Delaware"}
                </Button>
              </div>
              <div className="bg-brand-cream/50 px-5 py-3 sm:px-6 sm:py-4 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 599€</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-14 bg-white">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight">
            <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">MANTENIMIENTO</span>
            Precios Mantenimiento
          </h2>
          <p className="text-center text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 mb-6 sm:mb-10">(Todo incluido anualmente)</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {[
              { title: "Renovación Registered Agent", desc: "Gestionamos renovación automática de tu Registered Agent cada año. Nunca pierdes tu dirección oficial en el estado." },
              { title: "Declaraciones fiscales anuales", desc: "Preparamos y presentamos Forms 1120 y 5472 ante el IRS cada año antes del deadline." },
              { title: "Annual Report (WY/DE)", desc: "Presentamos el Annual Report obligatorio ante el estado cada año para mantener tu LLC activa." },
              { title: "Recordatorios y alertas", desc: "Te avisamos con antelación de deadlines importantes y renovaciones pendientes." },
              { title: "Soporte continuado", desc: "Email y WhatsApp para consultas sobre obligaciones, uso de LLC y renovaciones." },
            ].map((service, i) => (
              <div key={i} className="rounded-xl bg-white border border-brand-lime/10 p-4 sm:p-6">
                <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-2 sm:mb-3">{service.title}</p>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-brand-lime/20 shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-brand-lime/10">
                {[
                  { state: "New Mexico", price: "349€" },
                  { state: "Wyoming", price: "499€" },
                  { state: "Delaware", price: "599€" }
                ].map((item, i) => (
                  <div key={i} className="p-8 text-center bg-brand-lime/5">
                    <p className="text-brand-dark/60 font-bold text-xs uppercase tracking-widest mb-2">{item.state}</p>
                    <p className="text-3xl font-black text-brand-dark mb-1">{item.price}</p>
                    <p className="text-brand-dark/40 text-xs font-medium uppercase">Anuales todo incluido</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-white border-t border-brand-lime/10">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center mb-12 uppercase tracking-tight">
            <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">FAQ</span>
            Preguntas Frecuentes de Nuestros Servicios
          </h2>
          <div className="space-y-4">
            {faqCategories.map((category) => (
              <div key={category.title} className="space-y-4">
                <h3 className="text-lg font-black text-brand-dark uppercase tracking-tighter flex items-center gap-2 mt-8 mb-4">
                  <span className="w-1.5 h-6 bg-brand-lime rounded-full" />
                  {category.title}
                </h3>
                <div className="space-y-3">
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

      <AsistenciaBancaria />
      <AsistenciaProcesadores />
      <ServiciosAdicionales />
      <Soporte />
      <ComoTrabajamos />
      <PorQueEasyUSLLC />

      <section className="bg-white py-16 sm:py-24 border-t border-brand-lime/10">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark mb-4 uppercase tracking-tight">
              ¿NECESITAS AYUDA?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl text-center mx-auto">
              Estamos aquí para resolver todas tus dudas. Contáctanos sin compromiso o consulta nuestro asistente virtual.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
              <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="bg-brand-lime text-brand-dark font-black text-base px-8 border-0 w-full rounded-full h-14 shadow-lg hover:bg-brand-lime/90 active:bg-brand-lime transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Envíanos un WhatsApp
                </Button>
              </a>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => {
                  const event = new CustomEvent('open-chatbot');
                  window.dispatchEvent(event);
                }}
                className="border-brand-dark text-brand-dark font-black text-base px-8 w-full sm:w-auto rounded-full h-14 hover:bg-brand-dark hover:text-white transition-colors"
              >
                Nuestro Asistente 24/7
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function AsistenciaBancaria() {
  return (
    <section className="py-8 sm:py-14 bg-white">
      <div className="container max-w-7xl mx-auto px-5 sm:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight">
          <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">BANCOS</span>
          Asistencia Bancaria
        </h2>
        <p className="text-center text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 mb-6 sm:mb-10">(Ayudamos a abrir cuentas en fintech y bancos, si el cliente lo requiere)</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6">
          {[
            { title: "Mercury", desc: "Te ayudamos paso a paso con tu solicitud de cuenta Mercury." },
            { title: "Relay", desc: "Apertura de cuenta en relayfi.com para tu LLC." },
            { title: "Soporte Fintech", desc: "Orientación sobre otras opciones bancarias digitales." },
            { title: "Revisión de solicitud", desc: "Revisamos tu aplicación antes de enviar." },
            { title: "Soporte durante proceso", desc: "Respondemos dudas hasta que cuenta esté aprobada." },
          ].map((service, i) => (
            <div key={i} className="rounded-xl bg-brand-lime/5 border border-brand-lime/10 p-4 sm:p-5">
              <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-2">{service.title}</p>
              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm sm:text-lg text-brand-dark font-medium italic">Incluido en tu paquete inicial.</p>
      </div>
    </section>
  );
}

function AsistenciaProcesadores() {
  return (
    <section className="py-8 sm:py-14">
      <div className="container max-w-7xl mx-auto px-5 sm:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight">
          <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">PAGOS</span>
          Asistencia con Procesadores
        </h2>
        <p className="text-center text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 mb-6 sm:mb-10">(Te orientamos en activación)</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { title: "Stripe", desc: "Cómo crear cuenta Stripe conectada a tu LLC." },
            { title: "Revolut Business", desc: "Proceso de solicitud y vinculación de tu LLC." },
            { title: "Orientación general", desc: "Explicamos qué procesador es mejor para tu negocio." },
          ].map((service, i) => (
            <div key={i} className="rounded-xl bg-white border border-brand-lime/10 p-4 sm:p-6 text-center">
              <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-2 sm:mb-3">{service.title}</p>
              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiciosAdicionales() {
  return (
    <section className="py-8 sm:py-14 bg-white">
      <div className="container max-w-7xl mx-auto px-5 sm:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight">
          <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">EXTRAS</span>
          Servicios Adicionales
        </h2>
        <p className="text-center text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 mb-6 sm:mb-10">(Servicios a medida para tu LLC)</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {[
            { title: "Apostilla de documentos", desc: "Gestión de apostilla de la Haya para validez internacional." },
            { title: "Certificado de Good Standing", desc: "Documento oficial que acredita que tu LLC cumple sus obligaciones." },
            { title: "Enmiendas a la LLC", desc: "Cambio de nombre, adición de miembros o actualización de datos." },
            { title: "Disolución de LLC", desc: "Cierre oficial y ordenado de tu estructura americana." },
          ].map((service, i) => (
            <div key={i} className="rounded-xl bg-brand-lime/5 border border-brand-lime/10 p-4 sm:p-6">
              <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-2">{service.title}</p>
              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Soporte() {
  return (
    <section className="py-8 sm:py-14">
      <div className="container max-w-7xl mx-auto px-5 sm:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight">
          <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">SOPORTE</span>
          Soporte Ilimitado
        </h2>
        <p className="text-center text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 mb-6 sm:mb-10">(Durante 12 meses incluido)</p>
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {[
            { title: "Email y WhatsApp", desc: "Atención personalizada para tus dudas operativas." },
            { title: "Guía de bienvenida", desc: "Manual completo sobre cómo usar y mantener tu LLC." },
            { title: "Alertas de plazos", desc: "Te avisamos de todas las obligaciones para que no olvides nada." },
          ].map((service, i) => (
            <div key={i} className="rounded-xl bg-white border border-brand-lime/10 p-6 shadow-sm">
              <p className="font-black uppercase tracking-tight text-sm sm:text-lg text-brand-dark mb-3">{service.title}</p>
              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComoTrabajamos() {
  return (
    <section className="py-20 sm:py-32 bg-white">
      <div className="container max-w-7xl mx-auto px-5 sm:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight">
          <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">PROCESO</span>
          Cómo Trabajamos
        </h2>
        <p className="text-center text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 mb-12 sm:mb-20">(En 5 simples pasos)</p>
        <div className="max-w-3xl mx-auto">
          {[
            { num: "1", title: "Eliges estado y pagas", text: "New Mexico, Wyoming o Delaware. Pago seguro." },
            { num: "2", title: "Formulario rápido", text: "5 minutos. Datos básicos de tu LLC." },
            { num: "3", title: "Envías foto ID", text: "DNI o pasaporte. Foto con móvil." },
            { num: "4", title: "Tramitamos todo", text: "Gobierno, EIN, documentos, BOI Report." },
            { num: "5", title: "Recibes tu LLC", text: "En 2-3 días hábiles todo en tu email." },
          ].map((step, i) => (
            <div key={i} className="flex gap-4 sm:gap-6 mb-6 sm:mb-10 last:mb-0">
              <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 bg-brand-lime rounded-full flex items-center justify-center text-brand-dark font-black text-lg sm:text-2xl shadow-md">
                {step.num}
              </div>
              <div className="pt-1 sm:pt-2 text-left">
                <p className="font-black uppercase tracking-tight text-lg sm:text-2xl text-brand-dark mb-1">{step.title}</p>
                <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PorQueEasyUSLLC() {
  return (
    <section className="py-8 sm:py-14 bg-white">
      <div className="container max-w-7xl mx-auto px-5 sm:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight mb-8 sm:mb-12">
          <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2">VALORES</span>
          ¿Por qué Easy US LLC?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { title: "Rapidez Real", desc: "LLC lista en 2-3 días hábiles. Sin esperas innecesarias." },
            { title: "Transparencia", desc: "Precio cerrado todo incluido. Sin sorpresas ni letra pequeña." },
            { title: "Especialistas", desc: "Somos profesionales ayudando a emprendedores digitales." },
            { title: "Soporte Humano", desc: "Hablamos tu idioma. Atención por WhatsApp y email." },
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-brand-lime/5 rounded-2xl border border-brand-lime/10 hover:bg-brand-lime/10 transition-colors">
              <p className="font-bold text-lg sm:text-xl mb-3 text-brand-dark">{feature.title}</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
