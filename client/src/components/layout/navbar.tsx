import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    if (location === '/servicios') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setLocation('/servicios');
      // Aumentamos el tiempo para asegurar que la página cargue en móvil antes de hacer scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    window.scrollTo(0, 0);
    setLocation(href);
  };

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-brand-lime/10 shadow-sm transition-shadow h-20 sm:h-24 flex items-center" data-mobile-menu-open={isOpen}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-black text-brand-lime tracking-tighter shrink-0 relative z-[110]" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }} data-testid="link-logo">
            EASY US LLC
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => handleNavClick("/")} className="text-base font-bold text-brand-dark hover:text-brand-lime transition-colors" data-testid="nav-inicio">Inicio</button>
            <button onClick={() => handleNavClick("/servicios")} className="text-base font-bold text-brand-dark hover:text-brand-lime transition-colors" data-testid="nav-servicios">Nuestros Servicios</button>
            <button onClick={() => scrollToSection("pricing")} className="text-base font-bold text-brand-dark hover:text-brand-lime transition-colors" data-testid="nav-precios">Precios</button>
            <button onClick={() => handleNavClick("/faq")} className="text-base font-bold text-brand-dark hover:text-brand-lime transition-colors" data-testid="nav-faq">FAQ</button>
            <button onClick={() => handleNavClick("/contacto")} className="text-base font-bold text-brand-dark hover:text-brand-lime transition-colors" data-testid="nav-contacto">Contáctanos</button>
          </nav>

          <Button 
            onClick={() => handleNavClick("/servicios")} 
            className="hidden md:inline-flex bg-brand-lime text-brand-dark font-bold border-0 rounded-full h-12 px-6 hover:bg-brand-lime/90"
            data-testid="button-nav-cta"
          >
            Constituye ahora tu LLC
          </Button>

          <button 
            className="md:hidden p-2 text-brand-lime relative z-[70]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            data-testid="button-mobile-menu"
          >
            <span className="text-2xl font-bold">{isOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-[60] overflow-y-auto flex flex-col pt-16 sm:pt-24">
          <div className="flex flex-col flex-grow bg-white p-6 justify-start pt-8">
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleNavClick("/")}
                className="text-left px-3 py-3 rounded-xl text-brand-dark hover:bg-brand-cream transition-colors font-black text-xl uppercase tracking-tighter border border-transparent hover:border-brand-lime/20"
                data-testid="mobile-nav-inicio"
              >
                Inicio
              </button>
              <button
                onClick={() => handleNavClick("/servicios")}
                className="text-left px-3 py-3 rounded-xl text-brand-dark hover:bg-brand-cream transition-colors font-black text-xl uppercase tracking-tighter border border-transparent hover:border-brand-lime/20"
                data-testid="mobile-nav-servicios"
              >
                Nuestros Servicios
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-left px-3 py-3 rounded-xl text-brand-dark hover:bg-brand-cream transition-colors font-black text-xl uppercase tracking-tighter border border-transparent hover:border-brand-lime/20"
                data-testid="mobile-nav-precios"
              >
                Precios
              </button>
              <button
                onClick={() => handleNavClick("/faq")}
                className="text-left px-3 py-3 rounded-xl text-brand-dark hover:bg-brand-cream transition-colors font-black text-xl uppercase tracking-tighter border border-transparent hover:border-brand-lime/20"
                data-testid="mobile-nav-faq"
              >
                FAQ
              </button>
              <button
                onClick={() => handleNavClick("/contacto")}
                className="text-left px-3 py-3 rounded-xl text-brand-dark hover:bg-brand-cream transition-colors font-black text-xl uppercase tracking-tighter border border-transparent hover:border-brand-lime/20 mb-4"
                data-testid="mobile-nav-contacto"
              >
                Contáctanos
              </button>
              <div className="mt-8 px-3 flex flex-col gap-3">
                <Button 
                  onClick={() => handleNavClick("/servicios")}
                  className="w-full bg-brand-lime text-brand-dark font-black border-0 rounded-full h-12 text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                  data-testid="mobile-button-cta"
                >
                  Constituye ahora tu LLC →
                </Button>
                <a 
                  href="https://wa.me/34614916910" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button 
                    className="w-full bg-brand-lime text-brand-dark font-black border-0 rounded-full h-12 text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    data-testid="mobile-button-whatsapp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Envíanos un WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
