import { Instagram, Package, Briefcase, PiggyBank, HelpCircle, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";

const links = [
  {
    label: "Instagram",
    href: "https://instagram.com/easyusllc",
    icon: Instagram,
    external: true
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/34612345678",
    icon: FaWhatsapp,
    external: true
  },
  {
    label: "Ver nuestros paquetes",
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
    label: "Ventajas fiscales",
    href: "https://easyusllc.com/#ventajas",
    icon: PiggyBank,
    external: true
  },
  {
    label: "¿Tienes dudas? FAQ",
    href: "https://easyusllc.com/faq",
    icon: HelpCircle,
    external: true
  }
];

export default function LinktreePage() {
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12 relative">
      <Button
        onClick={handleShare}
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 w-10 h-10 rounded-full !bg-[#6EDC8A] hover:!bg-[#5cd67a] !text-[#0E1215] !border-0"
        data-testid="button-share"
      >
        <Share2 className="w-5 h-5" />
      </Button>

      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="mb-8">
          <img 
            src={logoIcon} 
            alt="Creamos tu LLC" 
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0E1215] mb-4 text-center tracking-tight leading-snug">
          <span className="block">OPTIMIZA TUS IMPUESTOS</span>
          <span className="block">CON UNA LLC EN EEUU</span>
        </h1>
        <p className="text-base sm:text-lg text-[#0E1215] mb-10 text-center max-w-sm leading-relaxed font-medium">
          Te ayudamos a estructurar tu negocio<br />
          Con una LLC en EE. UU.<br />
          <span className="block mt-1">Sin letra pequeña. Sin consultorías interminables.</span>
        </p>

        <div className="w-full space-y-3">
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
                className="w-full h-14 !bg-[#6EDC8A] hover:!bg-[#5cd67a] !text-[#0E1215] font-semibold text-base rounded-full shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 !border-0"
                variant="ghost"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Button>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-[#6B7280]/60">
            © {new Date().getFullYear()} Easy US LLC
          </p>
        </div>
      </div>
    </div>
  );
}
