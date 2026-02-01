import { Instagram, Package, Briefcase, PiggyBank, HelpCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
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
  useEffect(() => {
    document.title = "Creamos tu LLC | Tu empresa en Estados Unidos";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Optimiza tus impuestos con una LLC en EE. UU. Te ayudamos a estructurar tu negocio. Sin letra pequeña. Sin consultorías interminables.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Optimiza tus impuestos con una LLC en EE. UU. Te ayudamos a estructurar tu negocio. Sin letra pequeña. Sin consultorías interminables.';
      document.head.appendChild(meta);
    }

    const ogTags = [
      { property: 'og:title', content: 'Creamos tu LLC | Tu empresa en Estados Unidos' },
      { property: 'og:description', content: 'Optimiza tus impuestos con una LLC en EE. UU. Sin letra pequeña. Sin consultorías interminables.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://creamostullc.com' },
      { property: 'og:site_name', content: 'Creamos tu LLC' }
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
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
          con una LLC en EE. UU.<br />
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
                className="w-full h-14 bg-[#6EDC8A] hover:bg-[#5cd67a] text-[#0E1215] font-semibold text-base rounded-full shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-3"
                variant="default"
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
