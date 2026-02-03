import { Instagram, Package, Briefcase, HelpCircle, Share2, ArrowRight, Clock, Check, Star, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";
import { getFormationPriceFormatted } from "@shared/config/pricing";

const SpainFlag = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full shadow-sm">
    <rect y="0" width="512" height="170.67" fill="#c60b1e"/>
    <rect y="170.67" width="512" height="170.67" fill="#ffc400"/>
    <rect y="341.33" width="512" height="170.67" fill="#c60b1e"/>
  </svg>
);

const USFlag = () => (
  <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full shadow-sm">
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
const WHATSAPP_MESSAGE = encodeURIComponent("Hola! Quiero formar mi LLC en Estados Unidos");
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
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
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

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeMediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += Math.random() * 15 + 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        setTimeout(() => setIsLoading(false), 100);
      }
      setLoadingProgress(currentProgress);
    }, 80);

    const forceComplete = setTimeout(() => {
      clearInterval(timer);
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 100);
    }, 1200);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
      clearInterval(timer);
      clearTimeout(forceComplete);
    };
  }, []);

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

    setMeta('description', `Optimiza tus impuestos con una LLC en EE. UU. Formación desde ${getFormationPriceFormatted("newMexico")}. Te ayudamos a estructurar tu negocio. Sin letra pequeña. Sin consultorías interminables.`);
    setMeta('keywords', 'LLC Estados Unidos, crear LLC, empresa USA, optimizar impuestos, LLC para autonomos, LLC emprendedores, abrir empresa EEUU');
    setMeta('robots', 'index, follow');
    setMeta('author', 'Creamos tu LLC');

    setMeta('og:title', 'Creamos tu LLC | Optimiza tus impuestos con una LLC en EEUU', true);
    setMeta('og:description', `Formación LLC desde ${getFormationPriceFormatted("newMexico")}. Sin letra pequeña. Sin consultorías interminables.`, true);
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

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className="w-64 space-y-4 flex flex-col items-center">
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
            <div 
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{ 
                width: `${Math.min(loadingProgress, 100)}%`,
                backgroundColor: '#6EDC8A',
                boxShadow: '0 0 10px rgba(110, 220, 138, 0.5)'
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tabular-nums" style={{ color: '#6EDC8A' }}>{Math.min(Math.round(loadingProgress), 100)}%</span>
            <span className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Cargando</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
      <Button
        onClick={handleShare}
        size="icon"
        variant="ghost"
        className={`fixed top-4 right-4 rounded-full z-50 ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}
        data-testid="button-share"
      >
        <Share2 className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <img 
                src={logoIcon} 
                alt="Creamos tu LLC" 
                className="w-20 h-20 object-contain"
              />
            </div>

            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Tu LLC en Estados Unidos
            </h1>
            
            <p className={`text-base sm:text-lg mb-6 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Formación desde <span className="font-bold" style={{ color: '#6EDC8A' }}>{getFormationPriceFormatted("newMexico")}</span>
              <br />
              Todo incluido. Sin sorpresas.
            </p>

            <div className={`flex flex-wrap items-center justify-center gap-4 text-sm font-medium mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" style={{ color: '#6EDC8A' }} />
                48-72h
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" style={{ color: '#6EDC8A' }} />
                EIN incluido
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" style={{ color: '#6EDC8A' }} />
                100% online
              </span>
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
                  className={`w-full font-bold text-base rounded-full flex items-center justify-center gap-3 ${
                    link.primary 
                      ? 'shadow-lg shadow-green-500/30' 
                      : isDark 
                        ? 'bg-zinc-800 text-white border border-zinc-700' 
                        : 'bg-white text-zinc-900 border border-zinc-200'
                  }`}
                  style={link.primary ? { backgroundColor: '#6EDC8A', color: '#0E1215' } : undefined}
                  variant={link.primary ? "default" : "outline"}
                  size="lg"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                  {link.primary && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </a>
            ))}
          </div>

          {/* Tax Comparator */}
          <div className="mt-10">
            <Card className={`overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <div className="p-5 text-center">
                <Badge 
                  className="mb-3 border-0 px-3 py-1 text-xs font-bold"
                  style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
                >
                  Calculadora
                </Badge>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  ¿Cuánto te ahorras?
                </h3>
                
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  {incomePresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setIncome(preset)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        income === preset
                          ? 'text-white shadow-sm'
                          : isDark 
                            ? 'bg-zinc-800 text-zinc-300' 
                            : 'bg-zinc-100 text-zinc-700'
                      }`}
                      style={income === preset ? { backgroundColor: '#6EDC8A', color: '#0E1215' } : {}}
                      data-testid={`button-preset-${preset}`}
                    >
                      {formatCurrency(preset)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={`grid grid-cols-2 gap-3 px-5 pb-3`}>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <SpainFlag />
                    <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Autónomo</span>
                  </div>
                  <p className="text-lg font-black text-red-500" data-testid="text-spain-total">{formatCurrency(spanishTaxes.total)}</p>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>impuestos</p>
                </div>
                
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <USFlag />
                    <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>LLC USA</span>
                  </div>
                  <p className="text-lg font-black text-green-500" data-testid="text-usa-total">{formatCurrency(0)}</p>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>impuestos</p>
                </div>
              </div>
              
              <div className="px-5 pb-5">
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: isDark ? 'rgba(110, 220, 138, 0.1)' : 'rgba(110, 220, 138, 0.08)' }}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <TrendingDown className="w-4 h-4" style={{ color: '#6EDC8A' }} />
                    <span className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>Tu ahorro</span>
                  </div>
                  <p className="text-2xl font-black" style={{ color: '#6EDC8A' }} data-testid="text-savings-amount">{formatCurrency(savings)}</p>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {Math.round(savingsPercentage)}% de tus ingresos
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`w-full p-3 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors border-t ${
                  isDark ? 'text-zinc-400 hover:text-zinc-200 border-zinc-800' : 'text-zinc-500 hover:text-zinc-700 border-zinc-200'
                }`}
                data-testid="button-toggle-details"
              >
                {showDetails ? 'Ocultar' : 'Ver desglose'}
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              
              {showDetails && (
                <div className={`p-4 border-t text-xs ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="space-y-1.5">
                    <div className={`flex justify-between ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      <span>IRPF</span>
                      <span className="font-semibold" data-testid="text-irpf">{formatCurrency(spanishTaxes.irpf)}</span>
                    </div>
                    <div className={`flex justify-between ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      <span>Seg. Social</span>
                      <span className="font-semibold" data-testid="text-social-security">{formatCurrency(spanishTaxes.socialSecurity)}</span>
                    </div>
                    <div className={`flex justify-between ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      <span>IVA (21%)</span>
                      <span className="font-semibold" data-testid="text-vat">{formatCurrency(spanishTaxes.vat)}</span>
                    </div>
                  </div>
                  <p className={`mt-3 text-xs leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    LLC USA sin presencia física = 0% impuestos. Consulta tu caso.
                  </p>
                </div>
              )}
            </Card>
          </div>

          <div className={`mt-10 text-center text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            © {new Date().getFullYear()} Easy US LLC
          </div>
        </div>
      </div>
    </div>
  );
}
