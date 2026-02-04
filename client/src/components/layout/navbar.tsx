import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu as MenuIcon, X as XIcon, User as UserIcon, LogOut } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useAuth } from "@/hooks/use-auth";
import { usePrefetch } from "@/hooks/use-prefetch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslation } from "react-i18next";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { prefetchOnHover, cancelPrefetch } = usePrefetch();
  const { t } = useTranslation();

  const resetScrollLock = () => {
    const scrollY = document.body.style.top;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY) * -1);
    }
  };

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    resetScrollLock();
    if (location === '/servicios') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setLocation('/servicios');
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
    resetScrollLock();
    
    const hasHash = href.includes('#');
    const [path, hash] = hasHash ? href.split('#') : [href, null];
    
    setTimeout(() => {
      if (!hasHash) {
        window.scrollTo(0, 0);
      }
      setLocation(path || href);
      
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }, 10);
  };

  return (
    <header className="sticky top-0 z-[100] bg-background border-b border-border shadow-sm transition-shadow h-20 sm:h-24 flex items-center w-full" data-mobile-menu-open={isOpen}>
      <div className="w-full px-5 sm:px-8">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-3 shrink-0 relative z-[110]" onClick={() => { setIsOpen(false); resetScrollLock(); window.scrollTo(0, 0); }}>
            <img src={logoIcon} alt="Easy US LLC" className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm" loading="eager" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 bg-accent/10 dark:bg-accent/20 rounded-full px-2 lg:px-3 h-11 border border-accent/30">
            <button onClick={() => handleNavClick("/")} onMouseEnter={() => prefetchOnHover("/")} onMouseLeave={cancelPrefetch} className="text-xs lg:text-sm font-black text-foreground hover:text-accent transition-colors whitespace-nowrap px-2 py-1 h-full flex items-center">{t("nav.home")}</button>
            <button onClick={() => handleNavClick("/servicios")} onMouseEnter={() => prefetchOnHover("/servicios")} onMouseLeave={cancelPrefetch} className="text-xs lg:text-sm font-black text-foreground hover:text-accent transition-colors whitespace-nowrap px-2 py-1 h-full flex items-center">{t("nav.services")}</button>
            <button onClick={() => handleNavClick("/servicios#pricing")} onMouseEnter={() => prefetchOnHover("/servicios")} onMouseLeave={cancelPrefetch} className="text-xs lg:text-sm font-black text-foreground hover:text-accent transition-colors whitespace-nowrap px-2 py-1 h-full flex items-center">{t("nav.pricing")}</button>
            <button onClick={() => handleNavClick("/servicios#comparador")} onMouseEnter={() => prefetchOnHover("/servicios")} onMouseLeave={cancelPrefetch} className="text-xs lg:text-sm font-black text-foreground hover:text-accent transition-colors whitespace-nowrap px-2 py-1 h-full flex items-center">{t("nav.savings")}</button>
            <button onClick={() => handleNavClick("/faq")} onMouseEnter={() => prefetchOnHover("/faq")} onMouseLeave={cancelPrefetch} className="text-xs lg:text-sm font-black text-foreground hover:text-accent transition-colors whitespace-nowrap px-2 py-1 h-full flex items-center">{t("nav.faq")}</button>
            <button 
              onClick={() => handleNavClick("/contacto")} 
              onMouseEnter={() => prefetchOnHover("/contacto")} 
              onMouseLeave={cancelPrefetch}
              className="text-xs lg:text-sm font-black text-foreground hover:text-accent transition-colors whitespace-nowrap px-2 py-1 h-full flex items-center"
            >
              {t("nav.contact")}
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {authLoading ? (
              <Button 
                variant="outline"
                className="rounded-full border-2 border-accent text-foreground font-black text-sm h-11 px-5 flex items-center gap-2 opacity-50"
                disabled
              >
                <UserIcon className="w-4 h-4" /> {t("nav.login")}
              </Button>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button 
                    variant="outline"
                    className="rounded-full border-2 border-accent text-foreground font-black text-sm h-11 px-5 flex items-center gap-2"
                    data-testid="button-desktop-dashboard"
                  >
                    <UserIcon className="w-4 h-4" /> {t("nav.myArea")}
                  </Button>
                </Link>
                <Button 
                  onClick={() => logout()} 
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-destructive"
                  data-testid="button-desktop-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setLocation("/auth/login")}
                variant="outline"
                className="rounded-full border-2 border-accent text-foreground font-black text-base h-12 px-6 flex items-center gap-2"
                data-testid="button-desktop-login"
              >
                <UserIcon className="w-5 h-5" /> {t("nav.login")}
              </Button>
            )}
            {!authLoading && !isAuthenticated && (
              <Button 
                onClick={() => setLocation("/llc/formation")} 
                className="bg-accent text-accent-foreground font-black text-sm border-0 rounded-full h-11 px-5 shadow-lg"
                variant="default"
              >
                {t("nav.register")}
              </Button>
            )}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          <div className="md:hidden flex items-center gap-1.5 relative z-[110]">
            {isOpen && (
              <div className="flex items-center gap-1.5">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            )}
            <Link href={isAuthenticated ? "/dashboard" : "/auth/login"}>
              <Button 
                variant="outline"
                className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-white dark:bg-zinc-800 dark:text-accent dark:border-accent rounded-full px-4 h-10 text-sm font-black flex items-center gap-2"
                data-testid={isAuthenticated ? "link-mobile-dashboard" : "button-mobile-login"}
              >
                <UserIcon className="w-4 h-4" />
                <span>{isAuthenticated ? t("nav.myArea") : t("nav.login")}</span>
              </Button>
            </Link>
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <button 
                className="p-2 text-foreground"
                onClick={() => {
                  const newIsOpen = !isOpen;
                  setIsOpen(newIsOpen);
                  if (newIsOpen) {
                    document.body.style.overflow = 'hidden';
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    document.body.style.top = `-${window.scrollY}px`;
                  } else {
                    const scrollY = document.body.style.top;
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.width = '';
                    document.body.style.top = '';
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                  }
                }}
                aria-label={isOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                data-testid="button-mobile-menu"
              >
                {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-[60] flex flex-col pt-20 overflow-hidden">
          <div className="flex flex-col bg-background p-6 justify-between items-stretch overflow-y-auto overscroll-contain flex-1" style={{ maxHeight: 'calc(100dvh - 5rem)' }}>
              <div className="flex flex-col gap-0.5 items-stretch text-left">
                <button
                  onClick={() => handleNavClick("/")}
                  className="text-left px-3 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors font-black text-xl tracking-tighter border border-transparent hover:border-accent/20"
                >
                  {t("nav.home")}
                </button>
              <button
                onClick={() => handleNavClick("/servicios")}
                className="text-left px-3 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors font-black text-xl tracking-tighter border border-transparent hover:border-accent/20"
              >
                {t("nav.services")}
              </button>
              <button
                onClick={() => handleNavClick("/servicios#pricing")}
                className="text-left px-3 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors font-black text-xl tracking-tighter border border-transparent hover:border-accent/20"
              >
                {t("nav.pricing")}
              </button>
              <button
                onClick={() => handleNavClick("/servicios#comparador")}
                className="text-left px-3 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors font-black text-xl tracking-tighter border border-transparent hover:border-accent/20"
              >
                {t("nav.savings")}
              </button>
              <button
                onClick={() => handleNavClick("/faq")}
                className="text-left px-3 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors font-black text-xl tracking-tighter border border-transparent hover:border-accent/20"
              >
                {t("nav.faq")}
              </button>
              <button
                onClick={() => handleNavClick("/contacto")}
                className="text-left px-3 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors font-black text-xl tracking-tighter border border-transparent hover:border-accent/20 mb-4"
              >
                {t("nav.contact")}
              </button>
              
              {/* Client Area - Always in same position regardless of auth state */}
              <div className="px-3 py-4 mb-4 bg-accent/5 rounded-2xl border border-accent/20 text-left">
                <p className="text-sm font-black text-accent tracking-tighter mb-2 text-left" style={{ fontFamily: 'var(--font-display)' }}>{t("mobile.clientArea")}</p>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        resetScrollLock();
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left py-2 text-foreground font-black text-xl tracking-tighter flex items-center justify-start gap-2"
                      data-testid="button-mobile-logout-menu"
                    >
                      <LogOut className="w-5 h-5" /> {t("mobile.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavClick("/auth/login")}
                      className="w-full text-left py-2 text-foreground font-black text-xl tracking-tighter flex items-center justify-start gap-2"
                      data-testid="button-mobile-login-menu"
                    >
                      <UserIcon className="w-5 h-5" /> {t("mobile.myAccount")}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 px-3 flex flex-col gap-3">
                {!isAuthenticated && (
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      document.body.style.overflow = '';
                      setLocation("/llc/formation");
                    }}
                    className="w-full bg-accent text-accent-foreground font-black text-sm h-12 shadow-lg flex items-center justify-center gap-2"
                  >
                    {t("nav.register")} →
                  </Button>
                )}
                <a 
                  href="https://wa.me/34614916910?text=Hola!%20Estoy%20interesado%2Fa%20en%20formar%20una%20LLC%20en%20Estados%20Unidos%20y%20me%20gustar%C3%ADa%20que%20me%20asesorarais.%20%C2%BFPodemos%20hablar%3F" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button 
                    className="w-full bg-secondary text-foreground font-black text-sm h-12 shadow-lg flex items-center justify-center gap-2 border-2 border-accent"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {t("mobile.whatsapp")}
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
