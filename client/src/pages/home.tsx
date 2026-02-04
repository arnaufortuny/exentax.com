import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { usePageTitle } from "@/hooks/use-page-title";
import { fadeInUp, lineExpand, viewportOnce, easing } from "@/lib/animations";
import type { Product } from "@shared/schema";
import trustpilotLogo from "@/assets/trustpilot-logo.png";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  usePageTitle();
  
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
    <div className="min-h-screen font-sans text-left bg-background w-full relative animate-page-in">
      <Navbar />
      <HeroSection 
        className="flex flex-col items-center justify-center text-center min-h-[400px] sm:min-h-[70vh] w-full"
        mobilePaddingTop="pt-20 sm:pt-36 lg:pt-40"
        showOverlay={false}
        title={
          <div className="flex flex-col items-center w-full">
            <div className="mb-4 sm:hidden flex justify-center mt-6">
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white dark:bg-white px-4 py-2.5 rounded-full shadow-md border-2 border-accent">
                <img src={trustpilotLogo} alt="Trustpilot" className="h-6 w-auto" />
                <div className="flex gap-0.5">
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
                <img src={trustpilotLogo} alt="Trustpilot" className="h-7 w-auto" />
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
                <span key={i} className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-card text-primary font-black text-sm border border-primary shadow-sm whitespace-nowrap">
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

      <section className="bg-background py-16 sm:py-20 relative" id="ventajas">
        <div className="w-full px-6 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1] will-change-[transform,opacity]" 
              style={{ fontWeight: 900 }} 
              dangerouslySetInnerHTML={{ __html: t("benefits.sectionTitle") }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            />
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full will-change-transform"
              variants={lineExpand}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            />
          </div>
          
          <BenefitsCards />
        </div>
      </section>

      <HowWeWorkSection />

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
      footer: t("benefits.vat.footer"),
      image: "/benefits-no-vat.png"
    },
    { 
      badge: t("benefits.taxes.badge"), 
      title: t("benefits.taxes.title"), 
      text: t("benefits.taxes.text"), 
      footer: t("benefits.taxes.footer"),
      image: "/benefits-no-tax.png"
    },
    { 
      badge: t("benefits.fees.badge"), 
      title: t("benefits.fees.title"), 
      text: t("benefits.fees.text"), 
      footer: t("benefits.fees.footer"),
      image: "/benefits-no-fees.png"
    },
    { 
      badge: t("benefits.banking.badge"), 
      title: t("benefits.banking.title"), 
      text: t("benefits.banking.text"), 
      footer: t("benefits.banking.footer"),
      image: "/benefits-banking.png"
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {benefits.map((card, i) => (
        <div key={i} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
          {card.image && (
            <div className="w-full h-44 overflow-hidden bg-accent/10">
              <img 
                src={card.image} 
                alt="" 
                className="w-full h-44 object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
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

function HowWeWorkSection() {
  const { t } = useTranslation();
  
  const steps = [
    { key: "listen" },
    { key: "collect" },
    { key: "form" },
    { key: "docs" },
    { key: "banking" },
    { key: "compliance" },
    { key: "followup" },
  ];

  return (
    <>
      <section className="py-16 sm:py-20 bg-background">
        <div className="w-full max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]" 
              style={{ fontWeight: 900 }} 
              dangerouslySetInnerHTML={{ __html: t("howWeWork.title") }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            />
            <motion.p
              className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {t("howWeWork.subtitle")}
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          
          <div className="space-y-6 md:max-w-lg md:mx-auto">
            {steps.map((step, i) => (
              <div 
                key={step.key} 
                className="flex gap-4 sm:gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-black text-lg sm:text-xl shrink-0">
                    {t(`howWeWork.steps.${step.key}.number`)}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-accent/20 mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="font-black text-lg sm:text-xl text-foreground mb-2">
                    {t(`howWeWork.steps.${step.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {t(`howWeWork.steps.${step.key}.text`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-background">
        <div className="w-full max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]" 
              style={{ fontWeight: 900 }} 
              dangerouslySetInnerHTML={{ __html: t("timing.title") }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            />
            <motion.div 
              className="w-24 h-1 bg-foreground mt-6 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center text-center">
              <div className="mb-6">
                <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 sm:w-24 sm:h-24">
                  <rect x="18" y="20" width="60" height="70" rx="10" fill="#E8F7EE"/>
                  <rect x="24" y="30" width="48" height="6" rx="3" fill="#34C759"/>
                  <rect x="24" y="44" width="36" height="6" rx="3" fill="#34C759" opacity="0.6"/>
                  <rect x="24" y="58" width="28" height="6" rx="3" fill="#34C759" opacity="0.4"/>
                  <circle cx="85" cy="40" r="16" fill="#34C759"/>
                  <path d="M78 40 L84 46 L92 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="78" y="58" width="20" height="14" rx="2" fill="#34C759"/>
                  <rect x="78" y="58" width="10" height="7" fill="#1F2933"/>
                </svg>
              </div>
              <h3 className="text-xl font-black mb-3">{t("timing.steps.step1.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("timing.steps.step1.text")}</p>
            </div>

            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center text-center relative md:scale-105 z-10">
              <div className="mb-6">
                <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 sm:w-24 sm:h-24">
                  <rect x="25" y="30" width="70" height="55" rx="12" fill="#E8F7EE"/>
                  <rect x="35" y="45" width="50" height="8" rx="4" fill="#34C759"/>
                  <rect x="35" y="60" width="35" height="8" rx="4" fill="#34C759" opacity="0.6"/>
                  <path d="M60 20 L75 28 L75 45 C75 55 67 63 60 66 C53 63 45 55 45 45 L45 28 Z" fill="#34C759"/>
                  <path d="M54 42 L59 47 L67 35" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-black mb-3">{t("timing.steps.step2.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("timing.steps.step2.text")}</p>
            </div>

            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center text-center">
              <div className="mb-6">
                <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 sm:w-24 sm:h-24">
                  <rect x="30" y="40" width="60" height="40" rx="8" fill="#E8F7EE"/>
                  <rect x="36" y="48" width="48" height="20" rx="4" fill="#34C759"/>
                  <rect x="40" y="52" width="22" height="4" rx="2" fill="white"/>
                  <rect x="40" y="60" width="30" height="4" rx="2" fill="white" opacity="0.7"/>
                  <circle cx="90" cy="75" r="12" fill="#34C759"/>
                  <text x="86" y="79" fontSize="12" fill="white" fontFamily="Arial">$</text>
                  <polygon points="25,40 60,20 95,40" fill="#34C759"/>
                </svg>
              </div>
              <h3 className="text-xl font-black mb-3">{t("timing.steps.step3.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("timing.steps.step3.text")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PorQueEasyUSLLC() {
  const { t } = useTranslation();
  
  const whyUsFeatures = [
    { 
      badge: t("whyUs.transparency.badge"), 
      title: t("whyUs.transparency.title"), 
      text: t("whyUs.transparency.text"),
      image: "/clear-pricing.png",
      link: "/servicios#pricing"
    },
    { 
      badge: t("whyUs.specialists.badge"), 
      title: t("whyUs.specialists.title"), 
      text: t("whyUs.specialists.text"),
      image: "/business-specialists.png"
    },
    { 
      badge: t("whyUs.support.badge"), 
      title: t("whyUs.support.title"), 
      text: t("whyUs.support.text"),
      image: "/personal-support.png"
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-background relative">
      <div className="w-full px-6 sm:px-8">
        <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center relative">
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]" 
            style={{ fontWeight: 900 }} 
            dangerouslySetInnerHTML={{ __html: t("whyUs.sectionTitle") }}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          />
          <motion.div 
            className="w-24 h-1 bg-accent mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {whyUsFeatures.map((feature, i) => {
            const CardWrapper = ({ children }: { children: React.ReactNode }) => {
              if ('link' in feature && feature.link) {
                return (
                  <a href={feature.link} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left hover:shadow-lg transition-shadow cursor-pointer">
                    {children}
                  </a>
                );
              }
              return (
                <div className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
                  {children}
                </div>
              );
            };
            
            return (
              <CardWrapper key={i}>
                {'image' in feature && feature.image && (
                  <img 
                    src={feature.image} 
                    alt="" 
                    className="w-full h-44 object-cover"
                    loading="eager"
                    decoding="async"
                  />
                )}
                <div className="p-6 flex-grow text-left">
                  <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-sm mb-4 text-left">{feature.badge}</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground mb-3 leading-tight text-left">{feature.title}</h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-left">{feature.text}</p>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
