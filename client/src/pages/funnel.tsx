import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@assets/logo-icon.png";
import { getFormationPriceFormatted, PRICING } from "@shared/config/pricing";
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
  Star,
  TrendingDown
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_NUMBER = "34614916910";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola!%20Os%20contacto%20desde%20vuestra%20landing%20page.%20Quiero%20crear%20mi%20LLC%20y%20me%20gustar%C3%ADa%20que%20me%20asesor%C3%A9is.%20%C2%BFPodemos%20hablar%3F`;

const SpainFlag = () => (
  <svg viewBox="0 0 36 36" className="w-8 h-8">
    <defs>
      <clipPath id="spainCircleFunnel">
        <circle cx="18" cy="18" r="18"/>
      </clipPath>
    </defs>
    <g clipPath="url(#spainCircleFunnel)">
      <rect fill="#C60A1D" width="36" height="36"/>
      <rect fill="#FFC400" y="9" width="36" height="18"/>
    </g>
  </svg>
);

const USFlag = () => (
  <svg viewBox="0 0 36 36" className="w-8 h-8">
    <defs>
      <clipPath id="usaCircleFunnel">
        <circle cx="18" cy="18" r="18"/>
      </clipPath>
    </defs>
    <g clipPath="url(#usaCircleFunnel)">
      <rect fill="#B22234" width="36" height="36"/>
      <rect fill="#FFFFFF" y="2.77" width="36" height="2.77"/>
      <rect fill="#FFFFFF" y="8.31" width="36" height="2.77"/>
      <rect fill="#FFFFFF" y="13.85" width="36" height="2.77"/>
      <rect fill="#FFFFFF" y="19.39" width="36" height="2.77"/>
      <rect fill="#FFFFFF" y="24.93" width="36" height="2.77"/>
      <rect fill="#FFFFFF" y="30.47" width="36" height="2.77"/>
      <rect fill="#3C3B6E" width="14.4" height="19.39"/>
    </g>
  </svg>
);

interface TaxBreakdown {
  income: number;
  irpf: number;
  socialSecurity: number;
  vat: number;
  total: number;
  netIncome: number;
  effectiveRate: number;
}

function calculateSpanishTaxes(grossIncome: number): TaxBreakdown {
  const socialSecurity = Math.min(Math.max(grossIncome * 0.30, 3600), 16000);
  const taxableIncome = grossIncome - socialSecurity;
  
  let irpf = 0;
  const brackets = [
    { limit: 12450, rate: 0.19 },
    { limit: 20200, rate: 0.24 },
    { limit: 35200, rate: 0.30 },
    { limit: 60000, rate: 0.37 },
    { limit: 300000, rate: 0.45 },
    { limit: Infinity, rate: 0.47 }
  ];
  
  let remainingIncome = Math.max(taxableIncome, 0);
  let previousLimit = 0;
  
  for (const bracket of brackets) {
    const taxableInBracket = Math.min(remainingIncome, bracket.limit - previousLimit);
    if (taxableInBracket > 0) {
      irpf += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
    previousLimit = bracket.limit;
    if (remainingIncome <= 0) break;
  }
  
  const vat = grossIncome * 0.21;
  const total = irpf + socialSecurity + vat;
  const netIncome = grossIncome - total;
  const effectiveRate = grossIncome > 0 ? (total / grossIncome) * 100 : 0;
  
  return {
    income: grossIncome,
    irpf: Math.round(irpf),
    socialSecurity: Math.round(socialSecurity),
    vat: Math.round(vat),
    total: Math.round(total),
    netIncome: Math.round(netIncome),
    effectiveRate: Math.round(effectiveRate * 10) / 10
  };
}

function calculateUSLLCTaxes(grossIncome: number): TaxBreakdown {
  return {
    income: grossIncome,
    irpf: 0,
    socialSecurity: 0,
    vat: 0,
    total: 0,
    netIncome: Math.round(grossIncome),
    effectiveRate: 0
  };
}

function TaxComparatorSection({ whatsappUrl }: { whatsappUrl: string }) {
  const [income, setIncome] = useState(50000);
  
  const spanishTaxes = useMemo(() => calculateSpanishTaxes(income), [income]);
  const usLLCTaxes = useMemo(() => calculateUSLLCTaxes(income), [income]);
  const savings = spanishTaxes.total - usLLCTaxes.total;
  const savingsPercentage = spanishTaxes.income > 0 ? (savings / spanishTaxes.income) * 100 : 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const incomePresets = [30000, 50000, 75000, 100000, 150000];
  
  return (
    <section className="px-5 py-16 sm:py-20 bg-background" id="comparador">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10 sm:mb-14 flex flex-col items-center">
          <Badge className="mb-4 bg-accent/15 text-accent border-0 px-4 py-2 text-sm font-bold">
            Calcula tu ahorro
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            <span className="text-foreground">¿Cuánto</span>{" "}
            <span className="text-accent">te ahorras?</span>
          </h2>
          <div className="w-24 h-1 bg-accent mt-6 rounded-full" />
        </div>
        
        <Card className="overflow-hidden shadow-xl border-2 border-accent/20">
          <div className="p-6">
            <label className="block text-sm font-semibold mb-3 text-foreground">
              Ingresos anuales brutos
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {incomePresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setIncome(preset)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all hover-elevate active-elevate-2 ${
                    income === preset
                      ? 'bg-accent text-accent-foreground shadow-md'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  data-testid={`button-preset-${preset}`}
                >
                  {formatCurrency(preset)}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="20000"
              max="200000"
              step="5000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-accent"
              style={{ 
                background: `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${((income - 20000) / 180000) * 100}%, hsl(var(--muted)) ${((income - 20000) / 180000) * 100}%, hsl(var(--muted)) 100%)`
              }}
              data-testid="input-income-slider"
            />
            <div className="text-center mt-3 text-2xl font-bold text-foreground">
              {formatCurrency(income)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-6 bg-muted/30">
            <div className="p-4 rounded-xl bg-destructive/10 dark:bg-destructive/20">
              <div className="flex items-center gap-2 mb-3">
                <SpainFlag />
                <span className="font-bold text-foreground">Autónomo</span>
              </div>
              <p className="text-xs mb-1 text-muted-foreground">Impuestos totales</p>
              <p className="text-xl font-black text-destructive">{formatCurrency(spanishTaxes.total)}</p>
              <p className="text-xs mt-1 text-muted-foreground">
                ({spanishTaxes.effectiveRate}% efectivo)
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-accent/10">
              <div className="flex items-center gap-2 mb-3">
                <USFlag />
                <span className="font-bold text-foreground">LLC USA</span>
              </div>
              <p className="text-xs mb-1 text-muted-foreground">Impuestos totales</p>
              <p className="text-xl font-black text-accent">{formatCurrency(usLLCTaxes.total)}</p>
              <p className="text-xs mt-1 text-muted-foreground">
                (0% IVA)
              </p>
            </div>
          </div>
          
          <div className="p-6 text-center bg-accent/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-6 h-6 text-accent" />
              <span className="text-sm font-semibold text-muted-foreground">Tu ahorro anual</span>
            </div>
            <p className="text-4xl font-black mb-1 text-accent">{formatCurrency(savings)}</p>
            <p className="text-sm text-muted-foreground">
              Ahorras el {Math.round(savingsPercentage)}% de tus ingresos
            </p>
            
            <Button 
              className="w-full mt-5 gap-2 shadow-lg shadow-accent/30 font-bold text-base bg-accent text-accent-foreground"
              size="lg"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-testid="link-whatsapp-calculator">
                Empezar ahora
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function SalesPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        setTimeout(() => setIsLoading(false), 50);
      }
      setLoadingProgress(currentProgress);
    }, 50);

    const forceComplete = setTimeout(() => {
      clearInterval(timer);
      setLoadingProgress(100);
      setIsLoading(false);
    }, 400);
    
    return () => {
      clearInterval(timer);
      clearTimeout(forceComplete);
    };
  }, []);

  useEffect(() => {
    document.title = `Crea tu LLC en Estados Unidos | Desde ${getFormationPriceFormatted("newMexico")} todo incluido`;
    
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

    setMeta('description', `Constituye tu LLC en Estados Unidos desde ${getFormationPriceFormatted("newMexico")}. Todo incluido: EIN, documentación, área de cliente y 12 meses de acompañamiento. 48-72 horas.`);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-64 space-y-4 flex flex-col items-center">
          <img src={logoIcon} alt="Easy US LLC" className="w-16 h-16 mb-4" />
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border">
            <div 
              className="h-full rounded-full transition-all duration-75 ease-out bg-accent"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="relative max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={logoIcon} 
              alt="Easy US LLC" 
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>

          <Badge className="mb-6 bg-accent/15 text-accent border-0 px-4 py-2 text-sm font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Tu LLC en 48-72h
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 uppercase leading-[1.1]">
            <span className="text-foreground">Constituimos</span>
            <br />
            <span className="text-accent">tu LLC</span>
            <br />
            <span className="text-foreground">en Estados Unidos</span>
          </h1>
          <div className="w-24 h-1 bg-foreground mt-4 mb-6 rounded-full mx-auto" />
          
          <p className="text-lg mb-2 leading-relaxed text-muted-foreground">
            Simple. Clara. Sin rodeos.
          </p>
          <p className="text-base mb-8 font-semibold text-foreground">
            Un precio, todo incluido, personas reales.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button 
              size="lg" 
              className="gap-2 shadow-lg shadow-accent/30 font-bold text-base px-8 bg-accent text-accent-foreground"
              onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-ver-planes"
            >
              Ver planes
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              className="gap-2 font-bold text-base px-8"
              variant="outline"
              asChild
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-testid="link-whatsapp-hero">
                <SiWhatsapp className="w-5 h-5 text-accent" />
                WhatsApp
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium mb-8 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-accent" />
              Sin IVA
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-accent" />
              Sin autónomos
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-accent" />
              100% online
            </span>
          </div>

        </div>
      </section>

      {/* Planes Section */}
      <section id="planes" className="px-5 py-16 sm:py-20 bg-muted/30">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="text-foreground">Elige</span>{" "}
              <span className="text-accent">tu LLC</span>
            </h2>
            <div className="w-24 h-1 bg-accent mt-6 rounded-full" />
            <p className="mt-4 text-lg text-muted-foreground">
              Todo incluido. Sin sorpresas.
            </p>
          </div>

          <div className="space-y-5">
            {/* New Mexico LLC */}
            <Card className="p-6 relative overflow-hidden shadow-xl border-2 border-accent">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-sm font-bold px-4 py-1.5 rounded-bl-xl">
                Popular
              </div>
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-foreground">New Mexico LLC</h3>
                <p className="text-muted-foreground">Ideal para negocios digitales</p>
              </div>

              <div className="mb-5">
                <span className="text-5xl font-black text-foreground">{getFormationPriceFormatted("newMexico")}</span>
                <span className="ml-2 text-lg text-muted-foreground">todo incluido</span>
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
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 mb-5 text-muted-foreground">
                <Clock className="w-5 h-5" />
                48-72 horas hábiles
              </div>

              <Button 
                className="w-full gap-2 shadow-lg shadow-accent/30 font-bold text-base bg-accent text-accent-foreground"
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
            <Card className="p-6 shadow-lg border-2 border-border">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-foreground">Wyoming LLC</h3>
                <p className="text-muted-foreground">Estructura más sólida</p>
              </div>

              <div className="mb-5">
                <span className="text-5xl font-black text-foreground">{getFormationPriceFormatted("wyoming")}</span>
                <span className="ml-2 text-lg text-muted-foreground">todo incluido</span>
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
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 mb-5 text-muted-foreground">
                <Clock className="w-5 h-5" />
                48-72 horas hábiles
              </div>

              <Button 
                className="w-full gap-2 shadow-lg shadow-accent/30 font-bold text-base bg-accent text-accent-foreground"
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
      <section className="px-5 py-16 sm:py-20 bg-background">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="text-foreground">¿Por qué</span>{" "}
              <span className="text-accent">Easy US LLC?</span>
            </h2>
            <div className="w-24 h-1 bg-foreground mt-6 rounded-full" />
          </div>

          <div className="grid gap-4">
            {[
              { icon: CreditCard, title: "Precio claro", desc: "Un solo precio. Todo incluido. Sin sorpresas." },
              { icon: Users, title: "Personas reales", desc: "Aquí no hablas con bots. Te atendemos paso a paso." },
              { icon: Globe, title: "Para negocios online", desc: "Freelancers, ecommerce, agencias y startups." },
              { icon: Zap, title: "Menos papeleo", desc: "Nos ocupamos de lo legal. Tú céntrate en tu negocio." }
            ].map((item, i) => (
              <Card key={i} className="p-5 flex items-start gap-4 shadow-md border border-border">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent/10">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="px-5 py-16 sm:py-20 bg-muted/30">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="text-accent">Ventajas</span>{" "}
              <span className="text-foreground">de una LLC</span>
            </h2>
            <div className="w-24 h-1 bg-accent mt-6 rounded-full" />
          </div>

          <Card className="p-6 sm:p-8 border-0 text-white shadow-2xl bg-gradient-to-br from-accent to-accent/80">
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
                  <span className="text-base sm:text-lg text-white/95 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Tax Comparator Section */}
      <TaxComparatorSection whatsappUrl={WHATSAPP_URL} />

      {/* How It Works */}
      <section className="px-5 py-16 sm:py-20 bg-muted/30">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="text-foreground">¿Cómo</span>{" "}
              <span className="text-accent">empezamos?</span>
            </h2>
            <div className="w-24 h-1 bg-foreground mt-6 rounded-full" />
          </div>

          <div className="space-y-5">
            {[
              { step: "1", title: "Nos escribes", desc: "Por WhatsApp o formulario" },
              { step: "2", title: "Revisamos tu caso", desc: "Analizamos tu situación contigo" },
              { step: "3", title: "Inicias el trámite", desc: "Con toda la información clara" },
              { step: "4", title: "Creamos tu LLC y EIN", desc: "En 48-72 horas hábiles" },
              { step: "5", title: "Te acompañamos", desc: "Durante 12 meses completos" }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg bg-accent text-accent-foreground">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-5 py-16 sm:py-20 bg-background">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="text-accent">Preguntas</span>{" "}
              <span className="text-foreground">frecuentes</span>
            </h2>
            <div className="w-24 h-1 bg-accent mt-6 rounded-full" />
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card 
                key={i} 
                className="overflow-hidden cursor-pointer shadow-md border border-border"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                data-testid={`faq-item-${i}`}
              >
                <div className="p-5 flex items-center justify-between">
                  <span className="font-semibold text-base text-foreground">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform text-muted-foreground ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contacto" className="px-5 py-16 sm:py-20 bg-foreground">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10 flex flex-col items-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-background">
              Empezamos cuando quieras
            </h2>
            <div className="w-24 h-1 bg-accent mt-6 rounded-full" />
            <p className="mt-4 text-lg text-background/70">
              Escríbenos por WhatsApp o déjanos tus datos
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-background/10 border-background/20 shadow-2xl">
            {!formSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                  data-testid="input-name"
                />
                <Input
                  type="email"
                  placeholder="Tu email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                  data-testid="input-email"
                />
                <Input
                  type="tel"
                  placeholder="Tu teléfono (opcional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                  data-testid="input-phone"
                />
                <Button 
                  type="submit" 
                  className="w-full gap-2 font-bold text-base shadow-lg shadow-accent/30 bg-accent text-accent-foreground"
                  size="lg"
                  data-testid="button-submit-lead"
                >
                  Quiero información
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-accent/20">
                  <Check className="w-8 h-8 text-accent" />
                </div>
                <p className="text-background font-bold text-xl mb-2">Datos guardados</p>
                <p className="text-background/70">Continúa por WhatsApp para hablar con nosotros</p>
              </div>
            )}

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-background/20" />
              <span className="text-background/50 text-sm">o directamente</span>
              <div className="flex-1 h-px bg-background/20" />
            </div>

            <Button 
              className="w-full gap-2 font-bold text-base shadow-lg shadow-accent/30 bg-accent text-accent-foreground"
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
      <footer className="px-5 py-8 text-center bg-foreground border-t border-background/10">
        <p className="text-background/50 text-sm">
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
