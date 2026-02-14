import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu as MenuIcon, X as XIcon, User as UserIcon, LogOut, ChevronRight } from "@/components/icons";
import logoIcon from "@/assets/logo-icon.png";
import { useAuth } from "@/hooks/use-auth";
import { usePrefetch } from "@/hooks/use-prefetch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslation } from "react-i18next";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
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

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    resetScrollLock();
    
    const hasHash = href.includes('#');
    const [path, hash] = hasHash ? href.split('#') : [href, null];
    
    setTimeout(() => {
      setLocation(path || href);
      
      if (hash) {
        const scrollToHash = (attempts = 0) => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (attempts < 5) {
            setTimeout(() => scrollToHash(attempts + 1), 200);
          }
        };
        if (location === path) {
          scrollToHash();
        } else {
          setTimeout(() => scrollToHash(), 400);
        }
      } else {
        window.scrollTo(0, 0);
      }
    }, 10);
  };

  return (
    <>
    <div className="h-20 sm:h-24 w-full shrink-0" aria-hidden="true" />
    <header className="fixed top-0 left-0 right-0 z-[110] bg-background border-b border-border shadow-sm transition-shadow h-20 sm:h-24 flex items-center w-full" data-mobile-menu-open={isOpen}>
      <div className="w-full px-5 sm:px-8">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-3 shrink-0 relative z-[110]" onClick={() => { setIsOpen(false); resetScrollLock(); window.scrollTo(0, 0); }}>
            <img src={logoIcon} alt="Exentax" className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm" loading="eager" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1.5 bg-accent/5 dark:bg-accent/10 rounded-full px-2 lg:px-3 h-11 border border-accent/20">
            <button onClick={() => handleNavClick("/")} onMouseEnter={() => prefetchOnHover("/")} onMouseLeave={cancelPrefetch} className="text-[11px] lg:text-sm font-bold text-foreground hover:text-accent transition-colors duration-150 whitespace-nowrap px-1.5 lg:px-2 py-1 h-full flex items-center">{t("nav.home")}</button>
            <button onClick={() => handleNavClick("/servicios")} onMouseEnter={() => prefetchOnHover("/servicios")} onMouseLeave={cancelPrefetch} className="text-[11px] lg:text-sm font-bold text-foreground hover:text-accent transition-colors duration-150 whitespace-nowrap px-1.5 lg:px-2 py-1 h-full flex items-center">{t("nav.services")}</button>
            <span className="text-muted-foreground/40">|</span>
            <button onClick={() => handleNavClick("/servicios#pricing")} onMouseEnter={() => prefetchOnHover("/servicios")} onMouseLeave={cancelPrefetch} className="text-[11px] lg:text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-150 whitespace-nowrap px-1 lg:px-1.5 py-1 h-full flex items-center">{t("nav.pricing")}</button>
            <button onClick={() => handleNavClick("/servicios#comparador")} onMouseEnter={() => prefetchOnHover("/servicios")} onMouseLeave={cancelPrefetch} className="text-[11px] lg:text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-150 whitespace-nowrap px-1 lg:px-1.5 py-1 h-full flex items-center">{t("nav.savings")}</button>
            <span className="text-muted-foreground/40">|</span>
            <button onClick={() => handleNavClick("/faq")} onMouseEnter={() => prefetchOnHover("/faq")} onMouseLeave={cancelPrefetch} className="text-[11px] lg:text-sm font-bold text-foreground hover:text-accent transition-colors duration-150 whitespace-nowrap px-1.5 lg:px-2 py-1 h-full flex items-center">{t("nav.faq")}</button>
            <button 
              onClick={() => handleNavClick("/contacto")} 
              onMouseEnter={() => prefetchOnHover("/contacto")} 
              onMouseLeave={cancelPrefetch}
              className="text-[11px] lg:text-sm font-bold text-foreground hover:text-accent transition-colors duration-150 whitespace-nowrap px-1.5 lg:px-2 py-1 h-full flex items-center"
            >
              {t("nav.contact")}
            </button>
            <button 
              onClick={() => handleNavClick("/agendar-consultoria")} 
              onMouseEnter={() => prefetchOnHover("/agendar-consultoria")} 
              onMouseLeave={cancelPrefetch}
              className="text-[11px] lg:text-sm font-bold text-accent hover:text-accent/80 transition-colors duration-150 whitespace-nowrap px-1.5 lg:px-2 py-1 h-full flex items-center"
              data-testid="link-free-consultation"
            >
              {t("nav.freeConsultation")}
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-1.5 lg:gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button 
                    variant="outline"
                    className="rounded-full border-2 border-accent text-foreground font-semibold text-xs lg:text-sm h-11 px-3 lg:px-5 flex items-center gap-2"
                    data-testid="button-desktop-dashboard"
                  >
                    <UserIcon className="w-4 h-4" /> {t("nav.myArea")}
                  </Button>
                </Link>
                <Button 
                  onClick={() => logout()} 
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-red-500 dark:text-red-400"
                  data-testid="button-desktop-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  onClick={() => setLocation("/auth/login")}
                  variant="outline"
                  className="rounded-full border-2 border-accent text-foreground font-semibold text-xs lg:text-sm h-11 px-3 lg:px-5 flex items-center gap-2"
                  data-testid="button-desktop-login"
                >
                  <UserIcon className="w-4 h-4" /> {t("nav.login")}
                </Button>
                <Button 
                  onClick={() => setLocation("/llc/formation")} 
                  variant="cta"
                  className="font-semibold text-xs lg:text-sm border-0 rounded-full h-11 px-4 lg:px-6"
                  data-testid="button-desktop-register"
                >
                  {t("nav.register")}
                </Button>
              </>
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
            {isAuthenticated && location.startsWith("/dashboard") ? (
              <Button 
                variant="outline"
                className="border-2 border-red-500 text-red-500 bg-card dark:text-red-400 dark:border-red-400 rounded-full px-3 text-sm flex items-center gap-1.5"
                size="sm"
                onClick={() => { setIsOpen(false); resetScrollLock(); logout(); }}
                data-testid="button-mobile-logout-header"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t("mobile.logout")}</span>
              </Button>
            ) : (
              <Link href={isAuthenticated ? "/dashboard" : "/auth/login"} onClick={() => { setIsOpen(false); resetScrollLock(); }}>
                <Button 
                  variant="outline"
                  className="border-2 border-accent text-accent bg-card rounded-full px-3 text-sm flex items-center gap-1.5"
                  size="sm"
                  data-testid={isAuthenticated ? "link-mobile-dashboard" : "button-mobile-login"}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{isAuthenticated ? t("nav.myArea") : t("nav.login")}</span>
                </Button>
              </Link>
            )}
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <button 
                className="w-11 h-11 flex items-center justify-center text-foreground"
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

    </header>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-[105] flex flex-col pt-28" data-testid="mobile-menu-overlay">
          <div className="flex flex-col bg-transparent px-4 py-5 justify-between items-stretch overflow-y-auto overscroll-contain flex-1" style={{ maxHeight: 'calc(100dvh - 7rem)', WebkitOverflowScrolling: 'touch' }}>
              <div className="flex flex-col gap-0 items-stretch text-left">
                <button
                  onClick={() => handleNavClick("/")}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-semibold text-lg tracking-tight outline-none focus:outline-none"
                  data-testid="link-mobile-home"
                >
                  <span>{t("nav.home")}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleNavClick("/servicios")}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-semibold text-lg tracking-tight outline-none focus:outline-none"
                  data-testid="link-mobile-services"
                >
                  <span>{t("nav.services")}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleNavClick("/servicios#pricing")}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-semibold text-lg tracking-tight outline-none focus:outline-none"
                  data-testid="link-mobile-pricing"
                >
                  <span>{t("nav.pricing")}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleNavClick("/servicios#comparador")}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-semibold text-lg tracking-tight outline-none focus:outline-none"
                  data-testid="link-mobile-savings"
                >
                  <span>{t("nav.savings")}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleNavClick("/faq")}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-semibold text-lg tracking-tight outline-none focus:outline-none"
                  data-testid="link-mobile-faq"
                >
                  <span>{t("nav.faq")}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleNavClick("/contacto")}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-foreground hover:bg-primary/10 transition-colors font-semibold text-lg tracking-tight outline-none focus:outline-none"
                  data-testid="link-mobile-contact"
                >
                  <span>{t("nav.contact")}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleNavClick("/agendar-consultoria")}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-accent hover:bg-primary/10 transition-colors font-semibold text-lg tracking-tight outline-none focus:outline-none"
                  data-testid="link-free-consultation-mobile"
                >
                  <span>{t("nav.freeConsultation")}</span>
                  <ChevronRight className="w-4 h-4 text-accent/60" />
                </button>

              <div className="mt-8 px-1 flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      resetScrollLock();
                      setLocation("/dashboard");
                    }}
                    variant="outline"
                    className="w-full font-semibold text-sm h-11 flex items-center justify-center gap-2 border-2 border-accent rounded-full"
                    data-testid="button-mobile-my-account"
                  >
                    <UserIcon className="w-4 h-4" />
                    {t("nav.myArea")}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      resetScrollLock();
                      setLocation("/llc/formation");
                    }}
                    variant="cta"
                    className="w-full font-semibold text-sm h-11 flex items-center justify-center gap-2 rounded-full"
                  >
                    {t("nav.register")} →
                  </Button>
                )}
                <a 
                  href={getWhatsAppUrl("navbar")} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button 
                    variant="outline"
                    className="w-full font-semibold text-sm h-11 flex items-center justify-center gap-2 border-2 border-primary rounded-full"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {t("mobile.whatsapp")}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
