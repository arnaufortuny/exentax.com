import { Instagram, Package, Briefcase, HelpCircle, Share2, ArrowRight, Clock, Check, Star } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";
import trustpilotLogo from "@assets/trustpilot-logo.png";

const WHATSAPP_NUMBER = "34614916910";
const WHATSAPP_MESSAGE = encodeURIComponent("Hola, me interesa crear una LLC en Estados Unidos");
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

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeMediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    setTimeout(() => setIsLoading(false), 300);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
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

    setMeta('description', 'Optimiza tus impuestos con una LLC en EE. UU. Formación desde 739€. Te ayudamos a estructurar tu negocio. Sin letra pequeña. Sin consultorías interminables.');
    setMeta('keywords', 'LLC Estados Unidos, crear LLC, empresa USA, optimizar impuestos, LLC para autonomos, LLC emprendedores, abrir empresa EEUU');
    setMeta('robots', 'index, follow');
    setMeta('author', 'Creamos tu LLC');

    setMeta('og:title', 'Creamos tu LLC | Optimiza tus impuestos con una LLC en EEUU', true);
    setMeta('og:description', 'Formación LLC desde 739€. Sin letra pequeña. Sin consultorías interminables.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://creamostullc.com', true);
    setMeta('og:site_name', 'Creamos tu LLC', true);
    setMeta('og:image', 'https://easyusllc.com/logo-icon.png', true);

    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', 'Creamos tu LLC | LLC en EEUU');
    setMeta('twitter:description', 'Optimiza tus impuestos con una LLC. Desde 739€.');

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
        <div className="w-48 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full animate-loading-bar"
            style={{ backgroundColor: '#6EDC8A' }}
          />
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
              Formación desde <span className="font-bold" style={{ color: '#6EDC8A' }}>739€</span>
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

            <a 
              href="https://www.trustpilot.com/review/easyusllc.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}
              data-testid="link-trustpilot"
            >
              <img src={trustpilotLogo} alt="Trustpilot" className="h-4" />
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-green-500 text-green-500" />
                ))}
              </div>
              <span className="font-bold">5/5</span>
            </a>
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
                  className={`w-full font-bold text-base rounded-xl flex items-center justify-center gap-3 ${
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

          <div className={`mt-10 text-center text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            © {new Date().getFullYear()} Easy US LLC
          </div>
        </div>
      </div>
    </div>
  );
}
