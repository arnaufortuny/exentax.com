import { Instagram, Package, Briefcase, HelpCircle, Share2, ArrowRight, Calculator } from "@/components/icons";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import logoIcon from "@/assets/logo-icon.png";

export default function LinktreePage() {
  const { t, i18n } = useTranslation();
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);

  const links = [
    {
      label: t("linktree.startNow"),
      href: "whatsapp:linktree",
      icon: FaWhatsapp,
      external: true,
      primary: true
    },
    {
      label: t("linktree.viewPrices"),
      href: "https://exentax.com/servicios#pricing",
      icon: Package,
      external: true
    },
    {
      label: t("linktree.ourServices"),
      href: "https://exentax.com/servicios",
      icon: Briefcase,
      external: true
    },
    {
      label: t("linktree.faq"),
      href: "https://exentax.com/faq",
      icon: HelpCircle,
      external: true
    },
    {
      label: t("linktree.taxCalculator"),
      href: "https://exentax.com/start#tax-calculator",
      icon: Calculator,
      external: true
    },
    {
      label: "Instagram",
      href: "https://instagram.com/exentax.global",
      icon: Instagram,
      external: true
    }
  ];

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
      text: t("linktree.shareText"),
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
      setFormMessage({ type: 'success', text: t("linktree.linkCopied") });
    }
  };

  useEffect(() => {
    document.title = t("linktree.pageTitle");
    
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

    setMeta('description', t("linktree.metaDescription"));
    setMeta('keywords', t("linktree.metaKeywords"));
    setMeta('robots', 'index, follow');
    setMeta('author', 'Exentax');

    setMeta('og:title', t("linktree.pageTitle"), true);
    setMeta('og:description', t("linktree.ogDescription"), true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://exentax.com/links', true);
    setMeta('og:site_name', 'Exentax', true);
    setMeta('og:image', 'https://exentax.com/logo-icon.png', true);

    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', t("linktree.twitterTitle"));
    setMeta('twitter:description', t("linktree.ogDescription"));

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
  }, [i18n.language, t]);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #00C48C 0%, #00A876 30%, #00855F 60%, #006B4A 100%)'
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

      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-44 pb-8 sm:pt-52 sm:pb-12">
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
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
                <img 
                  src={logoIcon} 
                  alt="Exentax" 
                  className="w-14 h-14 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-4 text-white drop-shadow-sm max-w-sm mx-auto">
              {t("linktree.heading")}
            </h1>
            
            <p className="text-sm sm:text-base mb-4 leading-relaxed text-white/85 max-w-sm mx-auto">
              {t("linktree.subheading")}
            </p>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href.startsWith("whatsapp:") ? getWhatsAppUrl(link.href.split(":")[1] as any) : link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="block w-full"
                data-testid={`link-linktree-${index}`}
              >
                <Button
                  className="w-full font-bold text-base rounded-full flex items-center justify-center gap-3 shadow-lg bg-white/20 backdrop-blur-sm text-white border-2 border-white/30"
                  variant="outline"
                  size="lg"
                  data-testid={`button-linktree-${index}`}
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
