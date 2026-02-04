import { Instagram, Package, Briefcase, HelpCircle, Share2, ArrowRight, Clock, Check, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";
import { getFormationPriceFormatted } from "@shared/config/pricing";

const SpainFlag = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5 rounded-full shadow-sm">
    <rect y="0" width="512" height="170.67" fill="#c60b1e"/>
    <rect y="170.67" width="512" height="170.67" fill="#ffc400"/>
    <rect y="341.33" width="512" height="170.67" fill="#c60b1e"/>
  </svg>
);

const USFlag = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5 rounded-full shadow-sm">
    <rect width="512" height="512" fill="#bf0a30"/>
    <rect y="39.4" width="512" height="39.4" fill="#fff"/>
    <rect y="118.2" width="512" height="39.4" fill="#fff"/>
    <rect y="197" width="512" height="39.4" fill="#fff"/>
    <rect y="275.8" width="512" height="39.4" fill="#fff"/>
    <rect y="354.6" width="512" height="39.4" fill="#fff"/>
    <rect y="433.4" width="512" height="39.4" fill="#fff"/>
    <rect width="204.8" height="275.8" fill="#002868"/>
  </svg>
);

interface TaxBreakdown {
  irpf: number;
  socialSecurity: number;
  vat: number;
  total: number;
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
  const effectiveRate = grossIncome > 0 ? (total / grossIncome) * 100 : 0;
  
  return {
    irpf: Math.round(irpf),
    socialSecurity: Math.round(socialSecurity),
    vat: Math.round(vat),
    total: Math.round(total),
    effectiveRate: Math.round(effectiveRate * 10) / 10
  };
}

const WHATSAPP_NUMBER = "34614916910";
const WHATSAPP_MESSAGE = encodeURIComponent("Hola! Os contacto desde vuestro Linktree. Quiero crear mi LLC en Estados Unidos y me gustaría que me asesoréis. ¿Podemos hablar?");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const links = [
  {
    label: "Empezar ahora",
    href: WHATSAPP_URL,
    icon: FaWhatsapp,
    external: true,
    primary: true
  },
  {
    label: "Ver precios",
    href: "https://easyusllc.com/servicios#pricing",
    icon: Package,
    external: true
  },
  {
    label: "Nuestros servicios",
    href: "https://easyusllc.com/servicios",
    icon: Briefcase,
    external: true
  },
  {
    label: "Preguntas frecuentes",
    href: "https://easyusllc.com/faq",
    icon: HelpCircle,
    external: true
  },
  {
    label: "Instagram",
    href: "https://instagram.com/easyusllc",
    icon: Instagram,
    external: true
  }
];

export default function LinktreePage() {
  const { toast } = useToast();
  const [income, setIncome] = useState(50000);
  const [showDetails, setShowDetails] = useState(false);
  
  const spanishTaxes = useMemo(() => calculateSpanishTaxes(income), [income]);
  const savings = spanishTaxes.total;
  const savingsPercentage = income > 0 ? (savings / income) * 100 : 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const incomePresets = [30000, 50000, 75000, 100000];

  const handleShare = async () => {
    const shareData = {
      title: 'Creamos tu LLC',
      text: 'Optimiza tus impuestos con una LLC en EE. UU.',
      url: 'https://creamostullc.com'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText('https://creamostullc.com');
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      });
    }
  };

  useEffect(() => {
    document.title = "Creamos tu LLC | Optimiza tus impuestos con una LLC en EEUU";
    
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

    setMeta('description', `Optimiza tus impuestos con una LLC en EE. UU. Formacion desde ${getFormationPriceFormatted("newMexico")}. Te ayudamos a estructurar tu negocio. Sin letra pequena. Sin consultorias interminables.`);
    setMeta('keywords', 'LLC Estados Unidos, crear LLC, empresa USA, optimizar impuestos, LLC para autonomos, LLC emprendedores, abrir empresa EEUU');
    setMeta('robots', 'index, follow');
    setMeta('author', 'Creamos tu LLC');

    setMeta('og:title', 'Creamos tu LLC | Optimiza tus impuestos con una LLC en EEUU', true);
    setMeta('og:description', `Formacion LLC desde ${getFormationPriceFormatted("newMexico")}. Sin letra pequena. Sin consultorias interminables.`, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://creamostullc.com', true);
    setMeta('og:site_name', 'Creamos tu LLC', true);
    setMeta('og:image', 'https://easyusllc.com/logo-icon.png', true);

    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', 'Creamos tu LLC | LLC en EEUU');
    setMeta('twitter:description', `Optimiza tus impuestos con una LLC. Desde ${getFormationPriceFormatted("newMexico")}.`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://creamostullc.com');

    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', 'https://easyusllc.com/logo-icon.png');
    favicon.setAttribute('type', 'image/png');
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)'
      }}
    >
      <Button
        onClick={handleShare}
        size="icon"
        variant="ghost"
        className="fixed top-4 right-4 z-50 rounded-full bg-white/20 backdrop-blur-sm text-white"
        data-testid="button-share"
      >
        <Share2 className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 sm:py-12 sm:justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
                <img 
                  src={logoIcon} 
                  alt="Creamos tu LLC" 
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3 text-white drop-shadow-sm">
              Tu LLC en Estados Unidos
            </h1>
            
            <p className="text-base sm:text-lg mb-5 leading-relaxed text-white/90">
              Formacion desde <span className="font-bold text-white">{getFormationPriceFormatted("newMexico")}</span>
              <br />
              <span className="text-white/80">Todo incluido. Sin sorpresas.</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/90 mb-6">
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                <Clock className="w-3 h-3 mr-1" />
                48-72h
              </Badge>
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                <Check className="w-3 h-3 mr-1" />
                EIN incluido
              </Badge>
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                <Check className="w-3 h-3 mr-1" />
                100% online
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="block w-full"
                data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-').replace(/[?¿]/g, '')}`}
              >
                <Button
                  className={`w-full font-bold text-base rounded-full flex items-center justify-center gap-3 shadow-lg ${
                    link.primary 
                      ? 'bg-white text-green-600' 
                      : 'bg-white/20 backdrop-blur-sm text-white border-2 border-white/30'
                  }`}
                  variant={link.primary ? "secondary" : "outline"}
                  size="lg"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                  {link.primary && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </a>
            ))}
          </div>

          <Card className="mt-8 bg-white rounded-3xl shadow-2xl overflow-hidden border-0">
            <div className="p-5 text-center">
              <Badge className="mb-3 bg-green-100 text-green-600 border-0">
                Calculadora
              </Badge>
              <h3 className="text-lg font-bold mb-3 text-gray-900">
                ¿Cuanto te ahorras?
              </h3>
              
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                {incomePresets.map((preset) => (
                  <Button
                    key={preset}
                    onClick={() => setIncome(preset)}
                    variant={income === preset ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full ${
                      income === preset
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 border-0'
                    }`}
                    data-testid={`button-preset-${preset}`}
                  >
                    {formatCurrency(preset)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 px-5 pb-3">
              <div className="p-4 rounded-2xl text-center bg-red-50">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <SpainFlag />
                  <span className="text-xs font-semibold text-gray-900">Autonomo</span>
                </div>
                <p className="text-xl font-black text-red-500" data-testid="text-spain-total">{formatCurrency(spanishTaxes.total)}</p>
                <p className="text-xs text-gray-400">impuestos</p>
              </div>
              
              <div className="p-4 rounded-2xl text-center bg-green-50">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <USFlag />
                  <span className="text-xs font-semibold text-gray-900">LLC USA</span>
                </div>
                <p className="text-xl font-black text-green-500" data-testid="text-usa-total">{formatCurrency(0)}</p>
                <p className="text-xs text-gray-400">impuestos</p>
              </div>
            </div>
            
            <div className="px-5 pb-5">
              <div className="p-5 rounded-2xl text-center bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-gray-600">Tu ahorro</span>
                </div>
                <p className="text-3xl font-black text-green-500" data-testid="text-savings-amount">{formatCurrency(savings)}</p>
                <p className="text-xs text-gray-500">
                  {Math.round(savingsPercentage)}% de tus ingresos
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              className="w-full rounded-none border-t border-gray-100 text-gray-500"
              data-testid="button-toggle-details"
            >
              {showDetails ? 'Ocultar' : 'Ver desglose'}
              {showDetails ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </Button>
            
            {showDetails && (
              <div className="p-5 border-t border-gray-100 bg-gray-50 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>IRPF</span>
                    <span className="font-semibold" data-testid="text-irpf">{formatCurrency(spanishTaxes.irpf)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Seg. Social</span>
                    <span className="font-semibold" data-testid="text-social-security">{formatCurrency(spanishTaxes.socialSecurity)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>IVA (21%)</span>
                    <span className="font-semibold" data-testid="text-vat">{formatCurrency(spanishTaxes.vat)}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-gray-400">
                  LLC USA sin presencia fisica = 0% impuestos. Consulta tu caso.
                </p>
              </div>
            )}
          </Card>

          <div className="mt-8 text-center text-xs text-white/60">
            © {new Date().getFullYear()} Easy US LLC
          </div>
        </div>
      </div>
    </div>
  );
}
