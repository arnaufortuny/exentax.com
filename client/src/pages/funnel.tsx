import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@assets/logo-icon.png";
import trustpilotLogo from "@assets/trustpilot-logo.png";
import { 
  Check, 
  Clock, 
  Shield, 
  Users, 
  Zap, 
  Globe, 
  CreditCard,
  Building2,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  Sparkles,
  Star
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_NUMBER = "34614916910";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quiero%20información%20sobre%20crear%20una%20LLC`;

export default function SalesPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeMediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    setTimeout(() => setIsLoading(false), 300);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.title = "Crea tu LLC en Estados Unidos | Desde 739€ todo incluido";
    
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(isProperty ? 'property' : 'name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('description', 'Constituye tu LLC en Estados Unidos desde 739€. Todo incluido: EIN, documentación, área de cliente y 12 meses de acompañamiento. 48-72 horas.');
    setMeta('robots', 'index, follow');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.name) {
      try {
        const leads = JSON.parse(localStorage.getItem('funnel_leads') || '[]');
        leads.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem('funnel_leads', JSON.stringify(leads));
      } catch {
        // Silent fail for localStorage
      }
      setFormSubmitted(true);
      toast({
        title: "Datos guardados",
        description: "Te redirigimos a WhatsApp..."
      });
      setTimeout(() => {
        window.open(WHATSAPP_URL, '_blank');
      }, 1000);
    }
  };

  const faqs = [
    { q: "¿Es legal desde España?", a: "Sí, totalmente legal. Te acompañamos para hacerlo correctamente." },
    { q: "¿Tengo que viajar a EE.UU.?", a: "No. Todo el proceso es 100% online." },
    { q: "¿El EIN está incluido?", a: "Sí, siempre incluido en el precio." },
    { q: "¿Seguís después de crear la LLC?", a: "Sí. Te acompañamos durante 12 meses completos." }
  ];

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className={`w-48 h-1 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <div 
            className="h-full rounded-full animate-loading-bar"
            style={{ backgroundColor: '#6EDC8A' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="relative max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={logoIcon} 
              alt="Easy US LLC" 
              className="w-16 h-16 md:w-20 md:h-20"
            />
          </div>

          <Badge 
            className="mb-6 border-0 px-4 py-2 text-sm font-bold"
            style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Tu LLC en 48-72h
          </Badge>
          
          <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-5 uppercase leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Constituimos
            <br />
            <span style={{ color: '#6EDC8A' }}>tu LLC</span>
            <br />
            en Estados Unidos
          </h1>
          
          <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Simple. Clara. Sin rodeos.
            <span className={`block mt-2 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
              Un precio, todo incluido, personas reales.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button 
              size="lg" 
              className="gap-2 shadow-lg shadow-green-500/30 font-bold text-base px-8"
              style={{ backgroundColor: '#6EDC8A', color: '#0E1215' }}
              onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-ver-planes"
            >
              Ver planes
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              className={`gap-2 font-bold text-base px-8 ${isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-zinc-900 border-zinc-200'}`}
              variant="outline"
              asChild
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-testid="link-whatsapp-hero">
                <SiWhatsapp className="w-5 h-5 text-green-500" />
                WhatsApp
              </a>
            </Button>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-5 text-sm font-medium mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Sin IVA
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Sin autónomos
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              100% online
            </span>
          </div>

          <a 
            href="https://www.trustpilot.com/review/easyusllc.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-3 rounded-full px-6 py-3 shadow-lg mx-auto ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100'} border`}
            data-testid="link-trustpilot"
          >
            <img src={trustpilotLogo} alt="Trustpilot" className="h-5" />
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-green-500 fill-green-500" />
              ))}
            </div>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>5/5</span>
          </a>
        </div>
      </section>

      {/* Planes Section */}
      <section id="planes" className={`px-5 py-16 md:py-20 ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
        <div className="max-w-lg mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Elige tu LLC
          </h2>
          <p className={`text-center mb-10 text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Todo incluido. Sin sorpresas.
          </p>

          <div className="space-y-5">
            {/* New Mexico LLC */}
            <Card className={`p-6 relative overflow-hidden shadow-xl ${isDark ? 'bg-zinc-900 border-green-600' : 'bg-white border-green-400'} border-2`}>
              <div className="absolute top-0 right-0 text-white text-sm font-bold px-4 py-1.5 rounded-bl-xl" style={{ backgroundColor: '#6EDC8A', color: '#0E1215' }}>
                Popular
              </div>
              
              <div className="mb-4">
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>New Mexico LLC</h3>
                <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Ideal para negocios digitales</p>
              </div>

              <div className="mb-5">
                <span className={`text-5xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>739€</span>
                <span className={`ml-2 text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>todo incluido</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {[
                  "Constitución de tu LLC",
                  "EIN incluido",
                  "Documentación oficial completa",
                  "Área privada de cliente",
                  "Acompañamiento 12 meses",
                  "Ayuda con banca y pagos"
                ].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className={`flex items-center gap-2 mb-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Clock className="w-5 h-5" />
                48-72 horas hábiles
              </div>

              <Button 
                className="w-full gap-2 shadow-lg shadow-green-500/30 font-bold text-base"
                style={{ backgroundColor: '#6EDC8A', color: '#0E1215' }}
                size="lg"
                asChild
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-testid="button-empezar-nm">
                  Empezar ahora
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </Card>

            {/* Wyoming LLC */}
            <Card className={`p-6 shadow-lg ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200'} border-2`}>
              <div className="mb-4">
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Wyoming LLC</h3>
                <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Estructura más sólida</p>
              </div>

              <div className="mb-5">
                <span className={`text-5xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>899€</span>
                <span className={`ml-2 text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>todo incluido</span>
              </div>

              <ul className="space-y-2.5 mb-5">
                {[
                  "Constitución de tu LLC",
                  "EIN incluido",
                  "Documentación completa",
                  "Área privada de cliente",
                  "Acompañamiento 12 meses",
                  "Apoyo en banca y cumplimiento"
                ].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className={`flex items-center gap-2 mb-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Clock className="w-5 h-5" />
                48-72 horas hábiles
              </div>

              <Button 
                className="w-full gap-2 shadow-lg shadow-green-500/30 font-bold text-base"
                style={{ backgroundColor: '#6EDC8A', color: '#0E1215' }}
                size="lg"
                asChild
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-testid="button-empezar-wy">
                  Empezar ahora
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`px-5 py-16 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className="max-w-lg mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            ¿Por qué Easy US LLC?
          </h2>
          <p className={`text-center mb-10 text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Lo que nos diferencia
          </p>

          <div className="grid gap-4">
            {[
              { icon: CreditCard, title: "Precio claro", desc: "Un solo precio. Todo incluido. Sin sorpresas." },
              { icon: Users, title: "Personas reales", desc: "Aquí no hablas con bots. Te atendemos paso a paso." },
              { icon: Globe, title: "Para negocios online", desc: "Freelancers, ecommerce, agencias y startups." },
              { icon: Zap, title: "Menos papeleo", desc: "Nos ocupamos de lo legal. Tú céntrate en tu negocio." }
            ].map((item, i) => (
              <Card key={i} className={`p-5 flex items-start gap-4 shadow-md ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(110, 220, 138, 0.15)' : 'rgba(110, 220, 138, 0.1)' }}>
                  <item.icon className="w-6 h-6" style={{ color: '#6EDC8A' }} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.title}</h3>
                  <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className={`px-5 py-16 ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
        <div className="max-w-lg mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Ventajas de una LLC
          </h2>
          <p className={`text-center mb-10 text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            en Estados Unidos
          </p>

          <Card className="p-6 md:p-8 border-0 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
            <div className="space-y-4">
              {[
                { icon: Shield, text: "Sin cuota de autónomos en España" },
                { icon: Building2, text: "Sin IVA en servicios internacionales" },
                { icon: CreditCard, text: "Acceso a banca y pagos internacionales" },
                { icon: Globe, text: "Marco legal sólido y reconocido" },
                { icon: Zap, text: "Posibilidad de tarjeta física" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-base md:text-lg text-white/95 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className={`px-5 py-16 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className="max-w-lg mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            ¿Cómo empezamos?
          </h2>
          <p className={`text-center mb-10 text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Todo 100% online y acompañado
          </p>

          <div className="space-y-5">
            {[
              { step: "1", title: "Nos escribes", desc: "Por WhatsApp o formulario" },
              { step: "2", title: "Revisamos tu caso", desc: "Analizamos tu situación contigo" },
              { step: "3", title: "Inicias el trámite", desc: "Con toda la información clara" },
              { step: "4", title: "Creamos tu LLC y EIN", desc: "En 48-72 horas hábiles" },
              { step: "5", title: "Te acompañamos", desc: "Durante 12 meses completos" }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg" style={{ backgroundColor: '#6EDC8A', color: '#0E1215' }}>
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.title}</h3>
                  <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`px-5 py-16 ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
        <div className="max-w-lg mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Preguntas frecuentes
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card 
                key={i} 
                className={`overflow-hidden cursor-pointer shadow-md ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                data-testid={`faq-item-${i}`}
              >
                <div className="p-5 flex items-center justify-between">
                  <span className={`font-semibold text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isDark ? 'text-zinc-500' : 'text-zinc-400'} ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && (
                  <div className={`px-5 pb-5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contacto" className="px-5 py-16" style={{ backgroundColor: '#0E1215' }}>
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-white">
            Empezamos cuando quieras
          </h2>
          <p className="text-center text-zinc-400 mb-8 text-lg">
            Escríbenos por WhatsApp o déjanos tus datos
          </p>

          <Card className="p-6 md:p-8 bg-zinc-800 border-zinc-700 shadow-2xl">
            {!formSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                  data-testid="input-name"
                />
                <Input
                  type="email"
                  placeholder="Tu email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                  data-testid="input-email"
                />
                <Input
                  type="tel"
                  placeholder="Tu teléfono (opcional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                  data-testid="input-phone"
                />
                <Button 
                  type="submit" 
                  className="w-full gap-2 font-bold text-base shadow-lg shadow-green-500/30"
                  style={{ backgroundColor: '#6EDC8A', color: '#0E1215' }}
                  size="lg"
                  data-testid="button-submit-lead"
                >
                  Quiero información
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(110, 220, 138, 0.2)' }}>
                  <Check className="w-8 h-8" style={{ color: '#6EDC8A' }} />
                </div>
                <p className="text-white font-bold text-xl mb-2">Datos guardados</p>
                <p className="text-zinc-400">Continúa por WhatsApp para hablar con nosotros</p>
              </div>
            )}

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-zinc-700" />
              <span className="text-zinc-500 text-sm">o directamente</span>
              <div className="flex-1 h-px bg-zinc-700" />
            </div>

            <Button 
              className="w-full gap-2 font-bold text-base shadow-lg shadow-green-500/30"
              style={{ backgroundColor: '#6EDC8A', color: '#0E1215' }}
              size="lg"
              asChild
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-testid="link-whatsapp-form">
                <SiWhatsapp className="w-5 h-5" />
                Hablar por WhatsApp
              </a>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 text-center" style={{ backgroundColor: '#0a0c0e' }}>
        <p className="text-zinc-500 text-sm">
          © 2026 EASY US LLC. Todos los derechos reservados.
        </p>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href={WHATSAPP_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 z-50"
        data-testid="button-whatsapp-float"
      >
        <SiWhatsapp className="w-7 h-7 text-white" />
      </a>
    </div>
  );
}
