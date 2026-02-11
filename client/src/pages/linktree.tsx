import { Instagram, Package, Briefcase, HelpCircle, Share2, ArrowRight, Calculator } from "@/components/icons";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { useEffect, useState } from "react";
import logoIcon from "@/assets/logo-icon.png";

const links = [
  {
    label: "Empezar ahora",
    href: "whatsapp:linktree",
    icon: FaWhatsapp,
    external: true,
    primary: true
  },
  {
    label: "Ver precios",
    href: "https://exentax.com/servicios#pricing",
    icon: Package,
    external: true
  },
  {
    label: "Nuestros servicios",
    href: "https://exentax.com/servicios",
    icon: Briefcase,
    external: true
  },
  {
    label: "Preguntas frecuentes",
    href: "https://exentax.com/faq",
    icon: HelpCircle,
    external: true
  },
  {
    label: "Calculadora fiscal",
    href: "https://exentax.com/start#tax-calculator",
    icon: Calculator,
    external: true
  },
  {
    label: "Instagram",
    href: "https://instagram.com/exentax",
    icon: Instagram,
    external: true
  }
];

export default function LinktreePage() {
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const handleShare = async () => {
    setFormMessage(null);
    const shareData = {
      title: 'Exentax',
      text: 'Optimiza tus impuestos con una LLC en EE. UU.',
      url: 'https://exentax.com/links'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText('https://exentax.com/links');
      setFormMessage({ type: 'success', text: 'Enlace copiado. El enlace ha sido copiado al portapapeles' });
    }
  };

  useEffect(() => {
    document.title = "Exentax | Optimiza tus impuestos con una LLC en EEUU";
    
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

    setMeta('description', 'Si tu negocio es digital, probablemente estés pagando más impuestos de los necesarios. Creamos estructuras internacionales legales adaptadas a tu actividad.');
    setMeta('keywords', 'LLC Estados Unidos, crear LLC, empresa USA, optimizar impuestos, LLC para autonomos, LLC emprendedores, abrir empresa EEUU');
    setMeta('robots', 'index, follow');
    setMeta('author', 'Exentax');

    setMeta('og:title', 'Exentax | Optimiza tus impuestos con una LLC en EEUU', true);
    setMeta('og:description', 'Si tu negocio es digital, probablemente estés pagando más impuestos de los necesarios.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://exentax.com/links', true);
    setMeta('og:site_name', 'Exentax', true);
    setMeta('og:image', 'https://exentax.com/logo-icon.png', true);

    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', 'Exentax | LLC en EEUU');
    setMeta('twitter:description', 'Si tu negocio es digital, probablemente estés pagando más impuestos de los necesarios.');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://exentax.com/links');

    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', 'https://exentax.com/logo-icon.png');
    favicon.setAttribute('type', 'image/png');
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #00C48C 0%, #00855F 50%, #00855F 100%)'
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

      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-24 pb-8 sm:pt-28 sm:pb-12 sm:justify-center">
        <div className="w-full max-w-md mx-auto">
          {formMessage && (
            <div className={`mb-4 p-3 rounded-xl text-center text-sm font-medium ${
              formMessage.type === 'error' 
                ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
                : formMessage.type === 'success'
                ? 'bg-accent/10 border border-accent/20 text-accent'
                : 'bg-accent/5 dark:bg-accent/10 border border-accent/20 dark:border-accent/30 text-accent dark:text-accent'
            }`} data-testid="form-message">
              {formMessage.text}
            </div>
          )}
          <div className="text-center mb-10">
            <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-4 text-white drop-shadow-sm max-w-sm mx-auto">
              Si tu negocio es digital, probablemente estés pagando más impuestos de los necesarios.
            </h1>
            
            <p className="text-sm sm:text-base mb-8 leading-relaxed text-white/85 max-w-sm mx-auto">
              Creamos estructuras internacionales legales adaptadas a tu actividad y te guiamos en todo el proceso. Reserva tu asesoría gratuita y descúbrelo en 15 minutos.
            </p>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
                <img 
                  src={logoIcon} 
                  alt="Exentax" 
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href.startsWith("whatsapp:") ? getWhatsAppUrl(link.href.split(":")[1] as any) : link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="block w-full"
                data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-').replace(/[?¿]/g, '')}`}
              >
                <Button
                  className={`w-full font-bold text-base rounded-full flex items-center justify-center gap-3 shadow-lg ${
                    link.primary 
                      ? 'bg-white text-accent' 
                      : 'bg-white/20 backdrop-blur-sm text-white border-2 border-white/30'
                  }`}
                  variant={link.primary ? "secondary" : "outline"}
                  size="lg"
                  data-testid={`button-${link.label.toLowerCase().replace(/\s+/g, '-').replace(/[?¿]/g, '')}`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                  {link.primary && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </a>
            ))}
          </div>

          <div className="mt-8 text-center space-y-1">
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} Exentax · hola@exentax.com
            </p>
            <p className="text-xs text-white/50">
              Exentax Holdings LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
