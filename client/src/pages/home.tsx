import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { usePageTitle } from "@/hooks/use-page-title";
import { fadeInUp, lineExpand, viewportOnce, easing } from "@/lib/animations";
import { ArrowRight } from "@/components/icons";
import type { Product } from "@shared/schema";
import trustpilotLogo from "@/assets/trustpilot-logo.png";
import llcFormationImg from "@assets/D69A3B61-5493-4DA9-B0CC-F8C4513AA081_1770477081267.png";
import einIncludedImg from "@assets/8B61DA68-3163-4478-ACA9-8358D58D5022_1770477081267.png";
import bankAccountImg from "@assets/88401DF0-F1AD-4E9F-9F63-E6145588D90B_1770477081267.jpg";

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

  return (
    <div className="min-h-screen font-sans text-left bg-background w-full relative animate-page-in">
      <Navbar />
      <HeroSection 
        className="flex flex-col items-center justify-center text-center min-h-[400px] sm:min-h-[70vh] w-full"
        mobilePaddingTop="pt-20 sm:pt-16 lg:pt-20"
        showOverlay={false}
        title={
          <div className="flex flex-col items-center w-full">
            <div className="mb-4 sm:hidden flex justify-center mt-1">
              <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white dark:bg-white px-4 py-2.5 rounded-full shadow-md border-2 border-accent">
                <img src={trustpilotLogo} alt="Trustpilot" className="h-6 w-auto" />
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#FFD700">
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
                    <svg key={star} className="w-5 h-5" viewBox="0 0 24 24" fill="#FFD700">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-black text-lg font-black">5/5</span>
              </a>
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

      <PorQueEasyUSLLC />

      <HowWeWorkSection />

      <HomeFAQ />

      <Footer />
    </div>
  );
}

function BenefitsCards() {
  const { t } = useTranslation();
  
  const benefits = [
    { 
      key: "vat",
      badge: t("benefits.vat.badge"), 
      title: t("benefits.vat.title"), 
      text: t("benefits.vat.text"), 
      footer: t("benefits.vat.footer"),
      image: "/benefits-no-vat.png",
      buttonLabel: t("benefits.vat.button"),
      buttonHref: "/faq#taxes-0"
    },
    { 
      key: "taxes",
      badge: t("benefits.taxes.badge"), 
      title: t("benefits.taxes.title"), 
      text: t("benefits.taxes.text"), 
      footer: t("benefits.taxes.footer"),
      image: "/benefits-no-tax.png",
      buttonLabel: t("benefits.taxes.button"),
      buttonHref: "/faq#taxes-5"
    },
    { 
      key: "banking",
      badge: t("benefits.banking.badge"), 
      title: t("benefits.banking.title"), 
      text: t("benefits.banking.text"), 
      footer: t("benefits.banking.footer"),
      image: "/benefits-banking.png",
      buttonLabel: t("benefits.banking.button"),
      buttonHref: "/servicios#bancos"
    },
    { 
      key: "fees",
      badge: t("benefits.fees.badge"), 
      title: t("benefits.fees.title"), 
      text: t("benefits.fees.text"), 
      footer: t("benefits.fees.footer"),
      image: "/benefits-no-fees.png",
      buttonLabel: t("benefits.fees.button"),
      buttonHref: "/faq#taxes-5"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
      {benefits.map((card, i) => (
        <div key={i} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
          {card.image && (
            <div className="w-full aspect-[16/9] overflow-hidden bg-accent/10">
              <img 
                src={card.image} 
                alt="" 
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
          <div className="p-4 lg:p-5 flex-grow text-left">
            <span className="inline-block px-3 py-1.5 rounded-full bg-accent text-accent-foreground font-black text-xs shadow-sm mb-3 text-left">{card.badge}</span>
            <h3 className="text-lg lg:text-base xl:text-lg font-black tracking-tighter text-foreground mb-2 leading-tight text-left">{card.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed text-left mb-4">{card.text}</p>
            <Link
              href={card.buttonHref}
              className="inline-flex items-center gap-2 text-accent font-bold text-sm hover:underline"
              data-testid={`button-benefit-${card.key}`}
            >
              {card.buttonLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-accent/10 px-4 lg:px-5 py-3 border-t border-accent/20 mt-auto text-left">
            <p className="text-xs font-black text-foreground text-left">{card.footer}</p>
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
    { key: "growth" },
  ];

  return (
    <>
      <section className="py-16 sm:py-20 bg-background">
        <div className="w-full max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]" 
              style={{ fontWeight: 900 }} 
              dangerouslySetInnerHTML={{ __html: t("howWeWork.title") }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.p
              className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            >
              {t("howWeWork.subtitle")}
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          
          <div className="space-y-6 md:hidden">
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

          <div className="hidden md:grid md:grid-cols-2 gap-x-10 gap-y-6">
            {steps.map((step) => (
              <div 
                key={step.key} 
                className="flex gap-5"
              >
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-black text-lg">
                    {t(`howWeWork.steps.${step.key}.number`)}
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-lg text-foreground mb-1.5">
                    {t(`howWeWork.steps.${step.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
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
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.div 
              className="w-24 h-1 bg-foreground mt-6 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background rounded-2xl shadow-sm border border-border flex flex-col text-left overflow-hidden">
              <div className="w-full aspect-[16/9] overflow-hidden">
                <img src={llcFormationImg} alt="LLC Formation" className="w-full h-full object-cover" loading="eager" decoding="async" />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black mb-3 text-left">{t("timing.steps.step1.title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-left">{t("timing.steps.step1.text")}</p>
              </div>
            </div>

            <div className="bg-background rounded-2xl shadow-sm border border-border flex flex-col text-left overflow-hidden">
              <div className="w-full aspect-[16/9] overflow-hidden">
                <img src={einIncludedImg} alt="EIN Included" className="w-full h-full object-cover" loading="eager" decoding="async" />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black mb-3 text-left">{t("timing.steps.step2.title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-left mb-4">{t("timing.steps.step2.text")}</p>
                <Link
                  href="/faq#keyConcepts-0"
                  className="inline-flex items-center gap-2 text-accent font-bold text-sm hover:underline"
                  data-testid="button-timing-ein"
                >
                  {t("timing.steps.step2.button")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-background rounded-2xl shadow-sm border border-border flex flex-col text-left overflow-hidden">
              <div className="w-full aspect-[16/9] overflow-hidden">
                <img src={bankAccountImg} alt="Bank Account" className="w-full h-full object-cover" loading="eager" decoding="async" />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black mb-3 text-left">{t("timing.steps.step3.title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-left">{t("timing.steps.step3.text")}</p>
              </div>
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
      key: "transparency",
      badge: t("whyUs.transparency.badge"), 
      title: t("whyUs.transparency.title"), 
      text: t("whyUs.transparency.text"),
      image: "/clear-pricing.png",
      buttonLabel: t("whyUs.transparency.button"),
      buttonHref: "/servicios#pricing"
    },
    { 
      key: "specialists",
      badge: t("whyUs.specialists.badge"), 
      title: t("whyUs.specialists.title"), 
      text: t("whyUs.specialists.text"),
      image: "/business-specialists.png",
      buttonLabel: t("whyUs.specialists.button"),
      buttonHref: "/servicios"
    },
    { 
      key: "support",
      badge: t("whyUs.support.badge"), 
      title: t("whyUs.support.title"), 
      text: t("whyUs.support.text"),
      image: "/personal-support.png",
      buttonLabel: t("whyUs.support.button"),
      buttonHref: getWhatsAppUrl("whyUsSupport"),
      isExternal: true
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
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div 
            className="w-24 h-1 bg-accent mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {whyUsFeatures.map((feature) => (
            <div key={feature.key} className="bg-background rounded-2xl shadow-md overflow-hidden border border-foreground/5 sm:border-foreground/5 border-accent/20 flex flex-col text-left">
              {feature.image && (
                <div className="w-full aspect-[16/9] overflow-hidden bg-accent/10">
                  <img 
                    src={feature.image} 
                    alt="" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              )}
              <div className="p-6 flex-grow text-left">
                <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-sm mb-4 text-left">{feature.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground mb-3 leading-tight text-left">{feature.title}</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-left mb-4">{feature.text}</p>
                {feature.isExternal ? (
                  <a
                    href={feature.buttonHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-accent font-bold text-sm hover:underline"
                    data-testid={`button-whyus-${feature.key}`}
                  >
                    {feature.buttonLabel}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={feature.buttonHref}
                    className="inline-flex items-center gap-2 text-accent font-bold text-sm hover:underline"
                    data-testid={`button-whyus-${feature.key}`}
                  >
                    {feature.buttonLabel}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeFAQ() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqKeys = ["legal", "taxes", "travel", "timeline", "after", "businesses", "contact"];

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="w-full max-w-3xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center">
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1] max-w-3xl uppercase"
            style={{ fontWeight: 900 }}
          >
            <span className="text-foreground">{t("homeFaq.titlePart1")}</span><br/>
            <span className="text-accent">{t("homeFaq.titlePart2")}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 text-center max-w-2xl">
            {t("homeFaq.subtitle")}
          </p>
          <div className="w-24 h-1 bg-accent mt-6 rounded-full" />
        </div>

        <div className="grid gap-2 sm:gap-3">
          {faqKeys.map((key, index) => (
            <div
              key={key}
              className={`group transition-all duration-200 border-2 rounded-2xl sm:rounded-3xl overflow-hidden ${
                openIndex === index
                  ? "border-accent bg-accent/[0.03]"
                  : "border-primary/5 hover:border-accent/30 bg-white dark:bg-card"
              }`}
              data-testid={`faq-item-home-${key}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 sm:px-6 py-4 sm:py-6 text-left flex items-center justify-between gap-3 sm:gap-4 touch-manipulation"
                data-testid={`button-faq-${key}`}
              >
                <span className="font-black text-foreground text-sm sm:text-lg leading-tight tracking-tighter">
                  {t(`homeFaq.items.${key}.question`)}
                </span>
                <span className={`text-xl sm:text-2xl transition-transform duration-200 shrink-0 ${
                  openIndex === index ? "rotate-45 text-[#6EDC8A]" : "text-primary/30"
                }`}>
                  +
                </span>
              </button>
              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-muted-foreground text-sm sm:text-base leading-relaxed border-t border-accent/20 pt-3 sm:pt-4 animate-in fade-in slide-in-from-top-2 font-medium bg-accent/5">
                  {t(`homeFaq.items.${key}.answer`)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center flex flex-col items-center">
          <p className="text-lg sm:text-xl font-black mb-5 uppercase">
            <span className="text-accent">{t("homeFaq.ctaPart1")}</span>{" "}
            <span className="text-foreground">{t("homeFaq.ctaPart2")}</span>{" "}
            <span className="text-accent">{t("homeFaq.ctaPart3")}</span>{" "}
            <span className="text-foreground">{t("homeFaq.ctaPart4")}</span>
          </p>
          <Button
            size="lg"
            asChild
            className="bg-[#25D366] hover:bg-[#25D366]/90 text-white font-black text-sm px-8 border-0 rounded-full h-12 shadow-lg"
            data-testid="button-faq-cta"
          >
            <a
              href={getWhatsAppUrl("homeFaq")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <SiWhatsapp className="w-5 h-5" />
              {t("homeFaq.ctaButton")} →
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
