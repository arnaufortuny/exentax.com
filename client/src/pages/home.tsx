import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import type { Product } from "@shared/schema";
import howWeWorkImage from "@assets/how-we-work-process.png";

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
        className="flex flex-col items-center justify-center text-center pt-20 sm:pt-8 min-h-[400px] sm:min-h-[70vh] w-full"
        showOverlay={false}
        title={
          <div className="flex flex-col items-center w-full">
            <div className="mb-4 sm:hidden flex justify-center mt-6">
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white dark:bg-white px-4 py-2.5 rounded-full shadow-md border-2 border-accent">
                <span className="text-black text-xs font-black flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#00b67a"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  Trustpilot
                </span>
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
                <span className="text-black text-base font-black flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00b67a"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  Trustpilot
                </span>
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

      <section className="bg-background py-16 sm:py-20 relative" id="ventajas">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]" 
              style={{ fontWeight: 900 }} 
              dangerouslySetInnerHTML={{ __html: t("benefits.sectionTitle") }}
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
          
          <BenefitsCards />
        </div>
      </section>

      <HowWeWorkSection />

      <section className="py-10 sm:py-16 bg-background">
        <div className="w-full max-w-lg mx-auto px-5 sm:px-8">
          <div className="bg-background rounded-2xl shadow-md overflow-hidden border-2 border-accent">
            <div className="p-6 text-center flex flex-col items-center justify-center">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2 text-center">{t("ctaSection.title")}</h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-6">{t("ctaSection.subtitle")}</p>
              <a 
                href="https://wa.me/34614916910?text=Hola!%20Quiero%20formar%20mi%20LLC%20en%20Estados%20Unidos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-block"
              >
                <Button 
                  size="lg" 
                  className="bg-accent text-accent-foreground font-black text-sm px-8 sm:px-12 py-5 sm:py-6 border-0 rounded-full w-full sm:w-auto shadow-xl shadow-accent/30 flex items-center justify-center gap-2"
                  data-testid="button-cta-bottom"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {t("ctaSection.button")}
                </Button>
              </a>
            </div>
          </div>
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
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
          <motion.div 
            className="w-24 h-1 bg-foreground mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        
        <div className="mb-10 sm:mb-14">
          <img 
            src={howWeWorkImage} 
            alt="How we work process" 
            className="w-full max-w-2xl mx-auto"
            loading="lazy"
          />
        </div>
        
        <div className="space-y-6">
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
      <div className="w-full px-5 sm:px-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
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
                  <div className="w-full h-44 overflow-hidden bg-accent/10">
                    <img 
                      src={feature.image} 
                      alt="" 
                      className="w-full h-44 object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
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
