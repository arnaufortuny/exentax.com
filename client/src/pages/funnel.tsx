import { useState } from "react";
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
  MapPin,
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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 md:pt-24 md:pb-28">
                
        <div className="relative max-w-lg mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={logoIcon} 
              alt="Easy US LLC" 
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>

          <Badge className="mb-8 bg-green-200 text-green-800 dark:bg-green-900/60 dark:text-green-300 border-0 px-5 py-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Tu LLC en 48-72h
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 text-center uppercase">
            <span className="block">Constituimos</span>
            <span className="block">tu LLC</span>
            <span className="block text-green-500 dark:text-green-400">en Estados Unidos</span>
          </h1>
          
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed">
            Simple. Clara. Sin rodeos.
            <span className="block mt-3 font-semibold text-zinc-800 dark:text-zinc-200">
              Un precio, todo incluido, personas reales.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button 
              size="lg" 
              className="bg-white text-green-600 border-2 border-green-500 gap-2 shadow-xl text-lg font-bold px-10"
              onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-ver-planes"
            >
              Ver planes
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-green-600 border-2 border-green-500 gap-2 shadow-xl text-lg font-bold px-10"
              asChild
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-testid="link-whatsapp-hero">
                <SiWhatsapp className="w-5 h-5" />
                WhatsApp
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-8">
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Sin IVA
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Sin autónomos
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              100% online
            </span>
          </div>

          {/* Trustpilot */}
          <a 
            href="https://www.trustpilot.com/review/easyusllc.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-white rounded-full px-8 py-4 shadow-xl border border-zinc-100 mx-auto w-fit hover-elevate"
            data-testid="link-trustpilot"
          >
            <img src={trustpilotLogo} alt="Trustpilot" className="h-6" />
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-green-500 fill-green-500" />
              <Star className="w-5 h-5 text-green-500 fill-green-500" />
              <Star className="w-5 h-5 text-green-500 fill-green-500" />
              <Star className="w-5 h-5 text-green-500 fill-green-500" />
              <Star className="w-5 h-5 text-green-500 fill-green-500" />
            </div>
            <span className="font-bold text-zinc-900">5/5</span>
          </a>
        </div>
      </section>

      {/* Planes Section */}
      <section id="planes" className="px-4 py-20 md:py-24">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-zinc-900 dark:text-white">
            Elige tu LLC
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 text-lg">
            Todo incluido. Sin sorpresas.
          </p>

          <div className="space-y-6">
            {/* New Mexico LLC */}
            <Card className="p-6 border-2 border-green-300 dark:border-green-700 bg-white dark:bg-zinc-900 relative overflow-hidden shadow-xl shadow-green-100 dark:shadow-green-900/20">
              <div className="absolute top-0 right-0 bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-bl-xl">
                Popular
              </div>
              
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">New Mexico LLC</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Ideal para negocios digitales</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-zinc-900 dark:text-white">739€</span>
                <span className="text-zinc-500 dark:text-zinc-400 ml-2 text-lg">todo incluido</span>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  "Constitución de tu LLC",
                  "EIN incluido",
                  "Documentación oficial completa",
                  "Área privada de cliente",
                  "Acompañamiento 12 meses",
                  "Ayuda con banca y pagos"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-6">
                <Clock className="w-5 h-5" />
                48-72 horas hábiles
              </div>

              <Button 
                className="w-full bg-green-500 text-white gap-2 shadow-xl shadow-green-500/40 font-bold text-lg"
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
            <Card className="p-6 border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Wyoming LLC</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Estructura más sólida</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-zinc-900 dark:text-white">899€</span>
                <span className="text-zinc-500 dark:text-zinc-400 ml-2 text-lg">todo incluido</span>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  "Constitución de tu LLC",
                  "EIN incluido",
                  "Documentación completa",
                  "Área privada de cliente",
                  "Acompañamiento 12 meses",
                  "Apoyo en banca y cumplimiento"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                    <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-6">
                <Clock className="w-5 h-5" />
                48-72 horas hábiles
              </div>

              <Button 
                className="w-full bg-green-500 text-white gap-2 shadow-xl shadow-green-500/40 font-bold text-lg"
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
      <section className="px-4 py-20 bg-green-50 dark:bg-zinc-900/50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-zinc-900 dark:text-white">
            ¿Por qué Easy US LLC?
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 text-lg">
            Lo que nos diferencia
          </p>

          <div className="grid gap-4">
            {[
              { icon: CreditCard, title: "Precio claro", desc: "Un solo precio. Todo incluido. Sin sorpresas." },
              { icon: Users, title: "Personas reales", desc: "Aquí no hablas con bots. Te atendemos paso a paso." },
              { icon: Globe, title: "Para negocios online", desc: "Freelancers, ecommerce, agencias y startups." },
              { icon: Zap, title: "Menos papeleo", desc: "Nos ocupamos de lo legal. Tú céntrate en tu negocio." }
            ].map((item, i) => (
              <Card key={i} className="p-5 flex items-start gap-4 bg-white dark:bg-zinc-900 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="px-4 py-20">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-zinc-900 dark:text-white">
            Ventajas de una LLC
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 text-lg">
            en Estados Unidos
          </p>

          <Card className="p-8 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 border-0 text-white shadow-2xl shadow-green-600/30">
            <div className="space-y-5">
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
                  <span className="text-lg text-white/95 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 bg-green-50 dark:bg-zinc-900/50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-zinc-900 dark:text-white">
            ¿Cómo empezamos?
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 text-lg">
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
              <div key={i} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg shadow-green-600/30">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{item.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-20">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-zinc-900 dark:text-white">
            Preguntas frecuentes
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card 
                key={i} 
                className="overflow-hidden bg-white dark:bg-zinc-900 cursor-pointer shadow-md hover-elevate"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                data-testid={`faq-item-${i}`}
              >
                <div className="p-5 flex items-center justify-between">
                  <span className="font-semibold text-lg text-zinc-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`w-6 h-6 text-zinc-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-zinc-600 dark:text-zinc-400">
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contacto" className="px-4 py-20 bg-zinc-900 dark:bg-zinc-950">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            Empezamos cuando quieras
          </h2>
          <p className="text-center text-zinc-400 mb-10 text-lg">
            Escríbenos por WhatsApp o déjanos tus datos
          </p>

          <Card className="p-8 bg-zinc-800 border-zinc-700 shadow-2xl">
            {!formSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Input
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Tu email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Tu teléfono (opcional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                    data-testid="input-phone"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-500 text-white gap-2 font-bold text-lg shadow-xl shadow-green-500/40"
                  size="lg"
                  data-testid="button-submit-lead"
                >
                  Quiero información
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-5">
                  <Check className="w-10 h-10 text-green-400" />
                </div>
                <p className="text-white font-bold text-xl mb-2">Datos guardados</p>
                <p className="text-zinc-400 mb-4">Continúa por WhatsApp para hablar con nosotros</p>
              </div>
            )}

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-zinc-700" />
              <span className="text-zinc-500">o directamente</span>
              <div className="flex-1 h-px bg-zinc-700" />
            </div>

            <Button 
              className="w-full bg-green-500 text-white gap-2 font-bold text-lg shadow-xl shadow-green-500/40"
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
      <footer className="px-4 py-10 bg-zinc-950 text-center">
        <p className="text-zinc-500">
          © 2026 EASY US LLC. Todos los derechos reservados.
        </p>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href={WHATSAPP_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 transition-transform z-50 hover-elevate"
        data-testid="button-whatsapp-float"
      >
        <SiWhatsapp className="w-8 h-8 text-white" />
      </a>
    </div>
  );
}
