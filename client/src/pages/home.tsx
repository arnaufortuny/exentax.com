import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import trustpilotLogo from "@assets/trustpilot-logo.png";

import { ChevronDown, ArrowRight } from "lucide-react";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('scroll') === 'servicios') {
      const element = document.getElementById('servicios');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const heroFeatures = [
    t("hero.features.fast"),
    t("hero.features.complete"),
    t("hero.features.noVat"),
    t("hero.features.transparent"),
    t("hero.features.close"),
    t("hero.features.bank"),
    t("hero.features.card")
  ];

  return (
    <div className="min-h-screen font-sans text-left bg-background bg-green-gradient overflow-x-hidden w-full relative animate-page-in">
      <Navbar />
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-16 sm:pt-8 min-h-[400px] sm:min-h-[70vh] w-full"
        showOverlay={false}
        title={
          <div className="flex flex-col items-center w-full">
            <div className="mb-4 sm:hidden flex justify-center mt-6">
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white dark:bg-white px-4 py-2.5 rounded-full shadow-md border-2 border-accent">
                <img src={trustpilotLogo} alt="Trustpilot" className="h-5 w-auto" loading="lazy" />
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#00b67a">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-black text-xs font-black">5/5</span>
              </a>
            </div>

            <h1 
              className="font-black tracking-tighter text-foreground mb-4 sm:mb-4 w-full block [text-wrap:balance] [word-break:keep-all] [overflow-wrap:break-word] text-center" 
              style={{ fontSize: 'clamp(34px, 10vw, 88px)', lineHeight: '0.85' }}
            >
              {t("hero.title")}<br />
              <span className="text-accent">{t("hero.subtitle")}</span>
            </h1>
          </div>
        }
        subtitle={
          <div className="flex flex-col items-center">
            <div className="text-[14px] sm:text-base text-foreground font-medium max-w-3xl mb-12 sm:mb-8 leading-relaxed text-center mx-auto px-2">
              {t("hero.description")} <br />
              <span className="block sm:inline font-black mt-2 text-accent">{t("hero.highlight")}</span>
            </div>
            
            <div className="hidden sm:flex mb-8 justify-center">
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 bg-white dark:bg-white px-6 py-3 rounded-full shadow-md border-2 border-accent">
                <img src={trustpilotLogo} alt="Trustpilot" className="h-7 w-auto" loading="lazy" />
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5" viewBox="0 0 24 24" fill="#00b67a">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-black text-lg font-black">5/5</span>
              </a>
            </div>

            <div className="hidden sm:flex flex-wrap justify-center gap-3 mb-8 px-2">
              {heroFeatures.map((feature, i) => (
                <span key={i} className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
                  {feature}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-4 sm:mb-4 w-full">
              <Button size="lg" onClick={() => {
                setLocation("/llc/formation");
              }} className="bg-accent text-accent-foreground font-black text-sm px-8 border-0 rounded-full w-full sm:w-auto h-12 sm:h-12 shadow-md" data-testid="button-select-pack">
                {t("hero.cta")} →
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/servicios")} className="bg-transparent text-primary border-2 border-primary hover:bg-accent/5 font-black text-sm px-8 rounded-full w-full sm:w-auto h-12 sm:h-12" data-testid="button-services">
                {t("nav.services")} →
              </Button>
            </div>
          </div>
        }
      />

      <PorQueEasyUSLLC />

      <section className="bg-background py-8 sm:py-24 relative" id="ventajas">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-6 sm:mb-20 flex flex-col items-center justify-center relative">
            <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
              {t("benefits.vat.badge", "BENEFITS")}
            </span>
            <h2 className="text-4xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center leading-[1.1] sm:leading-tight">
              {t("benefits.taxes.title", "Tax Benefits")}
            </h2>
          </div>
          
          <BenefitsCards />
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-background">
        <div className="w-full px-5 sm:px-8 text-center">
          <Button 
            size="lg" 
            onClick={() => {
              setLocation("/llc/formation");
            }} 
            className="bg-accent text-accent-foreground font-black text-sm px-8 sm:px-12 py-5 sm:py-6 border-0 rounded-full w-full sm:w-auto shadow-xl shadow-accent/30"
            data-testid="button-cta-bottom"
          >
            {t("hero.cta")} →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function BenefitsCards() {
  const { t } = useTranslation();
  
  const benefits = [
    { 
      badge: t("benefits.vat.badge"), 
      title: t("benefits.vat.title"), 
      text: t("benefits.vat.text"), 
      footer: t("benefits.vat.footer") 
    },
    { 
      badge: t("benefits.taxes.badge"), 
      title: t("benefits.taxes.title"), 
      text: t("benefits.taxes.text"), 
      footer: t("benefits.taxes.footer") 
    },
    { 
      badge: t("benefits.fees.badge"), 
      title: t("benefits.fees.title"), 
      text: t("benefits.fees.text"), 
      footer: t("benefits.fees.footer") 
    },
    { 
      badge: t("benefits.banking.badge"), 
      title: t("benefits.banking.title"), 
      text: t("benefits.banking.text"), 
      footer: t("benefits.banking.footer") 
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {benefits.map((card, i) => (
        <div key={i} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
          <div className="p-6 flex-grow text-left">
            <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-sm mb-4 text-left">{card.badge}</span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground mb-3 leading-tight text-left">{card.title}</h3>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-left">{card.text}</p>
          </div>
          <div className="bg-accent/10 px-6 py-4 border-t border-accent/20 mt-auto text-left">
            <p className="text-sm font-black text-foreground text-left">{card.footer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PorQueEasyUSLLC() {
  const { t } = useTranslation();
  
  const whyUsFeatures = [
    { 
      badge: t("whyUs.transparency.badge"), 
      title: t("whyUs.transparency.title"), 
      text: t("whyUs.transparency.text"),
      image: "/coins.jpg"
    },
    { 
      badge: t("whyUs.specialists.badge"), 
      title: t("whyUs.specialists.title"), 
      text: t("whyUs.specialists.text"),
      image: "/handshake.jpg"
    },
    { 
      badge: t("whyUs.support.badge"), 
      title: t("whyUs.support.title"), 
      text: t("whyUs.support.text"),
      image: "/support.jpg"
    },
  ];

  return (
    <section className="py-8 sm:py-14 bg-background relative">
      <div className="w-full px-5 sm:px-8">
        <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center relative">
          <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
            {t("whyUs.transparency.badge", "VALUES")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center">
            {t("whyUs.transparency.title", "Why Easy US LLC?")}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {whyUsFeatures.map((feature, i) => (
            <div key={i} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
              {feature.image && (
                <div className="w-full h-40 overflow-hidden">
                  <img src={feature.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex-grow text-left">
                <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-sm mb-4 text-left">{feature.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground mb-3 leading-tight text-left">{feature.title}</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-left">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
