import { Link, useLocation } from "wouter";
import { NewsletterSection } from "./newsletter-section";
import { useTranslation } from "react-i18next";
import logoIcon from "@/assets/logo-icon.png";
import mercuryLogo from "@/assets/mercury-logo.png";
import relayLogo from "@/assets/relay-logo.png";
import mastercardLogo from "@/assets/mastercard-logo.png";
import visaLogo from "@/assets/visa-logo.png";
import trustpilotLogo from "@/assets/trustpilot-logo.png";

export function Footer() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  const handleHashClick = (href: string) => {
    const sectionId = href.split('#')[1];
    if (!sectionId) return;

    if (location === '/servicios' || location === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    // Redirect to services and scroll to pricing
    setLocation('/servicios#pricing');
    setTimeout(() => {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <NewsletterSection />
      <footer className="bg-zinc-950 text-white py-12 sm:py-20 overflow-hidden font-sans w-full" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full px-5 sm:px-8">
        {/* Mobile: Title centered at top */}
        <div className="flex flex-col items-center mb-10 md:hidden">
          <Link href="/" className="flex flex-col items-center gap-3 mb-6" onClick={() => window.scrollTo(0, 0)}>
            <img src={logoIcon} alt="Easy US LLC" className="h-24 w-auto" />
          </Link>
          <p className="text-white/70 text-base text-center max-w-xs">
            {t("footer.description")}
          </p>
        </div>

        {/* Mobile: 2-column grid for links */}
        <div className="grid grid-cols-2 gap-8 md:hidden text-left mb-10">
          <div className="flex flex-col items-start">
            <h4 className="font-black text-base tracking-wider mb-5 border-b border-white/20 pb-1 w-full">{t("footer.links")}</h4>
            <nav className="flex flex-col gap-3 text-base text-white/70">
              <Link href="/" className="hover:text-white transition-colors py-1 block w-full" data-testid="link-footer-home">{t("footer.home")}</Link>
              <Link href="/servicios" className="hover:text-white transition-colors py-1 block w-full" data-testid="link-footer-services">{t("footer.services")}</Link>
              <button onClick={() => handleHashClick('/servicios#pricing')} className="hover:text-white transition-colors py-1 block w-full text-left" data-testid="button-footer-pricing">{t("footer.pricing")}</button>
              <Link href="/faq" className="hover:text-white transition-colors py-1 block w-full text-left" data-testid="link-footer-faq">{t("footer.faq")}</Link>
            </nav>
          </div>
          
          <div className="flex flex-col items-start">
            <h4 className="font-black text-base tracking-wider mb-5 border-b border-white/20 pb-1 w-full">{t("footer.legal")}</h4>
            <nav className="flex flex-col gap-3 text-base text-white/70">
              <Link href="/legal/terminos" className="hover:text-white transition-colors py-1 block w-full" data-testid="link-footer-terms">{t("footer.termsShort")}</Link>
              <Link href="/legal/privacidad" className="hover:text-white transition-colors py-1 block w-full" data-testid="link-footer-privacy">{t("footer.privacyShort")}</Link>
              <Link href="/legal/reembolsos" className="hover:text-white transition-colors py-1 block w-full" data-testid="link-footer-refunds">{t("footer.refundsShort")}</Link>
              <Link href="/legal/cookies" className="hover:text-white transition-colors py-1 block w-full" data-testid="link-footer-cookies">{t("footer.cookiesShort")}</Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-col items-start md:hidden mb-12">
          <h4 className="font-black text-base tracking-wider mb-6 border-b border-white/20 pb-1 w-full">{t("footer.contact")}</h4>
          <div className="flex flex-col gap-3 text-base text-white/70 text-left">
            <a href="https://wa.me/34614916910?text=Hola!%20Os%20escribo%20desde%20vuestra%20web.%20Me%20interesa%20saber%20m%C3%A1s%20sobre%20c%C3%B3mo%20crear%20una%20LLC%20en%20Estados%20Unidos.%20%C2%BFPodemos%20hablar%3F" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              +34 614 91 69 10
            </a>
            <a href="mailto:hola@easyusllc.com" className="hover:text-white transition-colors">hola@easyusllc.com</a>
            <a href="https://instagram.com/easyusllc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              @easyusllc
            </a>
            <p>{t("footer.location")}</p>
          </div>
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-10 text-left">
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-6" onClick={() => window.scrollTo(0, 0)}>
              <img src={logoIcon} alt="Easy US LLC" className="h-24 w-auto" />
            </Link>
            <p className="text-white/70 text-base max-w-xs">
              {t("footer.description")}
            </p>
          </div>
          
          <div className="flex flex-col items-start">
            <h4 className="font-black text-base tracking-wider mb-5">{t("footer.links")}</h4>
            <nav className="flex flex-col gap-3 text-base text-white/70">
              <Link href="/" className="hover:text-white transition-colors" data-testid="link-footer-desktop-home">{t("footer.home")}</Link>
              <Link href="/servicios" className="hover:text-white transition-colors" data-testid="link-footer-desktop-services">{t("footer.services")}</Link>
              <button onClick={() => handleHashClick('/servicios#pricing')} className="hover:text-white transition-colors text-left" data-testid="button-footer-desktop-pricing">{t("footer.pricing")}</button>
              <Link href="/faq" className="hover:text-white transition-colors text-left" data-testid="link-footer-desktop-faq">{t("footer.faq")}</Link>
            </nav>
          </div>
          
          <div className="flex flex-col items-start">
            <h4 className="font-black text-base tracking-wider mb-5">{t("footer.legal")}</h4>
            <nav className="flex flex-col gap-3 text-base text-white/70">
              <Link href="/legal/terminos" className="hover:text-white transition-colors" data-testid="link-footer-desktop-terms">{t("footer.terms")}</Link>
              <Link href="/legal/privacidad" className="hover:text-white transition-colors" data-testid="link-footer-desktop-privacy">{t("footer.privacy")}</Link>
              <Link href="/legal/reembolsos" className="hover:text-white transition-colors" data-testid="link-footer-desktop-refunds">{t("footer.refunds")}</Link>
              <Link href="/legal/cookies" className="hover:text-white transition-colors" data-testid="link-footer-desktop-cookies">{t("footer.cookies")}</Link>
            </nav>
          </div>
          
          <div className="flex flex-col items-start">
            <h4 className="font-black text-base tracking-wider mb-6">{t("footer.contact")}</h4>
            <div className="flex flex-col gap-3 text-base text-white/70">
              <a href="https://wa.me/34614916910?text=Hola!%20Os%20escribo%20desde%20vuestra%20web.%20Me%20interesa%20saber%20m%C3%A1s%20sobre%20c%C3%B3mo%20crear%20una%20LLC%20en%20Estados%20Unidos.%20%C2%BFPodemos%20hablar%3F" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                +34 614 91 69 10
              </a>
              <a href="mailto:hola@easyusllc.com" className="hover:text-white transition-colors">hola@easyusllc.com</a>
              <a href="https://instagram.com/easyusllc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                @easyusllc
              </a>
              <p>{t("footer.location")}</p>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="mt-10 sm:mt-12 pt-8 border-t border-white/20">
          <h4 className="font-black text-base tracking-wider mb-6 text-center text-white/90">{t("footer.partners")}</h4>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            <a href="https://mercury.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" data-testid="link-partner-mercury">
              <img src={mercuryLogo} alt="Mercury" className="h-6 sm:h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            </a>
            <a href="https://relayfi.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" data-testid="link-partner-relay">
              <img src={relayLogo} alt="Relay" className="h-8 sm:h-10 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            </a>
            <a href="https://mastercard.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" data-testid="link-partner-mastercard">
              <img src={mastercardLogo} alt="Mastercard" className="h-8 sm:h-10 w-auto" />
            </a>
            <a href="https://visa.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" data-testid="link-partner-visa">
              <img src={visaLogo} alt="Visa" className="h-8 sm:h-10 w-auto" />
            </a>
            <a href="https://trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" data-testid="link-partner-trustpilot">
              <img src={trustpilotLogo} alt="Trustpilot" className="h-10 sm:h-14 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            </a>
          </div>
        </div>
        
        {/* Legal Disclaimer */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-white/20">
          <p className="text-white/40 text-[10px] leading-relaxed text-center max-w-4xl mx-auto">
            {t("footer.disclaimer")} <Link href="/legal/terminos" className="underline hover:text-white">{t("footer.terms")}</Link> & <Link href="/legal/privacidad" className="underline hover:text-white">{t("footer.privacy")}</Link>.
          </p>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-sm sm:text-base">
          <p className="text-center md:text-left">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p className="font-medium">{t("footer.delivery")}</p>
        </div>
      </div>
    </footer>
    </>
  );
}
