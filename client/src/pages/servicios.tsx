import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { TaxComparator } from "@/components/tax-comparator";
import { StateComparison } from "@/components/state-comparison";
import type { Product } from "@shared/schema";
import { getFormationPriceFormatted, getMaintenancePriceFormatted } from "@shared/config/pricing";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, Check, ArrowRight } from "@/components/icons";
import { usePageTitle } from "@/hooks/use-page-title";
import { fadeInUp, lineExpand, cardVariants, heroTitle, heroSubtitle, viewportOnce, transitions } from "@/lib/animations";
import trustpilotLogo from "@/assets/trustpilot-logo.png";

const FormationIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3h7l5 5v13H7z"/>
    <path d="M14 3v5h5"/>
    <path d="M9 13h6M9 17h6"/>
  </svg>
);

const EinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M8 9h8M8 13h5"/>
    <circle cx="18" cy="17" r="2"/>
  </svg>
);

const BankingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <path d="M2 10h20"/>
    <circle cx="16" cy="14" r="1"/>
  </svg>
);

const BoiIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h9l5 5v15H6z"/>
    <path d="M14 2v5h5"/>
    <path d="M9 13l2 2 4-4"/>
  </svg>
);

const AgentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3"/>
    <path d="M5 19C5 15.8 7.8 14 12 14C16.2 14 19 15.8 19 19"/>
    <path d="M12 14V18"/>
    <path d="M18.5 5.5H16.5C15.95 5.5 15.5 5.95 15.5 6.5V8.5C15.5 9.05 15.95 9.5 16.5 9.5H18.5C19.05 9.5 19.5 9.05 19.5 8.5V6.5C19.5 5.95 19.05 5.5 18.5 5.5Z" strokeWidth="1.4"/>
  </svg>
);

const SupportIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
    <path d="M9 10h6M9 14h4"/>
  </svg>
);

const MercuryIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 3v18"/>
    <path d="M3 12h18"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
);

const RelayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" strokeWidth="0" fill="none"/>
    <path d="M7 12h10"/>
    <path d="M7 8h10"/>
    <path d="M7 16h6"/>
    <circle cx="4" cy="8" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="16" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);

const StrategyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

const ContinuousIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="M12 6v6l4 2"/>
    <path d="M16 16l2 2"/>
  </svg>
);

export default function Servicios() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  usePageTitle();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#pricing' || hash === '#comparador' || hash === '#state-comparison') {
      const elementId = hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleSelectProduct = (stateName: string) => {
    setLocation(`/llc/formation?state=${encodeURIComponent(stateName)}`);
  };

  const handleSelectMaintenance = (stateName: string) => {
    setLocation(`/llc/maintenance?state=${encodeURIComponent(stateName)}`);
  };

  const packFeatures = t("services.formation.includes", { returnObjects: true }) as string[];
  const nmWyFeatures = [...packFeatures.slice(0, -1), t("services.formation.nmWy")];
  const deFeatures = [...packFeatures.slice(0, -1), t("services.formation.de")];
  const maintenanceFeatures = t("services.maintenancePack.includes", { returnObjects: true }) as string[];

  const heroFeatures = [
    t("hero.features.fast"),
    t("hero.features.complete"),
    t("hero.features.noVat"),
    t("hero.features.transparent"),
    t("hero.features.close"),
    t("hero.features.bank"),
    t("hero.features.card")
  ];

  const whatWeDoItems = [
    { key: "formation", icon: FormationIcon },
    { key: "ein", icon: EinIcon },
    { key: "banking", icon: BankingIcon },
    { key: "boi", icon: BoiIcon },
    { key: "agent", icon: AgentIcon },
    { key: "support", icon: SupportIcon }
  ];

  const bankItems = [
    { key: "mercury", icon: MercuryIcon },
    { key: "relay", icon: RelayIcon },
    { key: "strategy", icon: StrategyIcon },
    { key: "continuous", icon: ContinuousIcon }
  ];

  return (
    <div className="min-h-screen font-sans bg-background text-center w-full relative animate-page-in">
      <Navbar />
      
      <HeroSection 
        className="flex flex-col items-center justify-center text-center min-h-[450px] sm:min-h-[auto] w-full"
        mobilePaddingTop="pt-24 sm:pt-20 lg:pt-24"
        showGradient={false}
        title={
          <>
            <motion.h1 
              className="font-black text-foreground tracking-tighter text-center uppercase will-change-[transform,opacity] [text-wrap:balance]"
              style={{ fontSize: 'clamp(34px, 10vw, 88px)', lineHeight: '0.85' }}
              variants={heroTitle}
              initial="hidden"
              animate="visible"
            >
              {t("services.heroTitleLine1")}<br/>
              {t("services.heroTitleLine2")}<br/>
              {t("services.heroTitleLine3")}<br/>
              <span className="text-accent">{t("services.heroTitleHighlight")}</span>
            </motion.h1>
          </>
        }
        subtitle={
            <div className="flex flex-col items-center justify-center w-full mt-6 sm:mt-8">
              <motion.div 
                className="text-[13px] sm:text-xl lg:text-2xl text-foreground font-medium leading-relaxed max-w-2xl text-center mb-8 sm:mb-12 mx-auto px-2 will-change-opacity"
                variants={heroSubtitle}
                initial="hidden"
                animate="visible"
              >
                {t("services.heroSubtitle")}
              </motion.div>
              
              <motion.div 
                className="hidden sm:flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl px-4 mb-8 will-change-[transform,opacity]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitions.normal}
              >
                {heroFeatures.map((text, i) => (
                  <div 
                    key={i} 
                    className="bg-white dark:bg-card text-primary font-black text-sm px-4 py-2 rounded-full border border-primary shadow-sm"
                  >
                    {text}
                  </div>
                ))}
              </motion.div>
              
              {/* Trustpilot Section */}
              <motion.div
                className="flex flex-col items-center justify-center gap-3 mt-4 mb-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transitions.normal, delay: 0.2 }}
              >
                <p className="text-foreground font-bold text-sm sm:text-base">{t("services.trustpilotTitle")}</p>
                <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white dark:bg-white px-5 py-3 rounded-full shadow-md border-2 border-accent hover:shadow-lg transition-shadow">
                  <img src={trustpilotLogo} alt="Trustpilot" className="h-6 w-auto" />
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} className="w-5 h-5" viewBox="0 0 24 24" fill="#FBBF24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-black text-sm font-black">5/5</span>
                </a>
              </motion.div>
            </div>
        }
      />

      <section className="py-16 sm:py-20 bg-background relative" id="que-hacemos">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1] will-change-[transform,opacity]" 
              style={{ fontWeight: 900 }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              dangerouslySetInnerHTML={{ __html: t("services.whatWeDo.title") }}
            />
            
            <motion.p
              className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {t("services.whatWeDo.subtitle")}
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full will-change-transform"
              variants={lineExpand}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {whatWeDoItems.map((item, i) => {
              const IconComponent = item.icon;
              return (
                <motion.div 
                  key={i} 
                  className="group p-5 sm:p-6 bg-card rounded-2xl border border-border hover:border-accent/40 text-left transition-all duration-200 will-change-[transform,opacity] hover:shadow-lg"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <IconComponent className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-accent" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 leading-tight">
                    {t(`services.whatWeDo.items.${item.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`services.whatWeDo.items.${item.key}.desc`)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <TaxComparator />

      <section className="py-16 sm:py-20 bg-background" id="pricing">
        <div className="w-full px-4 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1] will-change-[transform,opacity]" 
              style={{ fontWeight: 900 }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <span className="text-foreground">{t("packsTitle.packs")}</span><br/>
              <span className="text-accent">{t("packsTitle.formation")}</span><br/>
              <span className="text-foreground">{t("packsTitle.packsLine1")}</span><br/>
              <span className="text-accent">{t("packsTitle.packsLine2")}</span>
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {t("packsTitle.subtitle")}
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full will-change-transform"
              variants={lineExpand}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-6 sm:px-0">
            {/* New Mexico */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full group mx-auto w-full sm:max-w-none">
              <div className="p-4 sm:p-5 flex-grow text-center">
                <div className="flex items-center justify-between mb-3 gap-2 sm:flex-col sm:items-center sm:justify-center">
                  <h3 className="text-lg sm:text-xl font-black text-primary tracking-tight">New Mexico</h3>
                  <span className="bg-accent/20 text-primary text-[10px] font-black px-2.5 py-0.5 rounded-full">{t("services.formation.popular")}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <p className="text-3xl font-black text-primary">{getFormationPriceFormatted("newMexico")}</p>
                  <span className="text-muted-foreground text-[10px] font-medium">{t("services.formation.year1")}</span>
                </div>
                <div className="text-muted-foreground text-[9px] font-black tracking-widest mb-3 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {t("services.formation.stateFeesIncluded")}
                </div>
                <div className="space-y-1.5 text-sm mb-3 border-t border-accent/10 pt-3">
                  {nmWyFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-1.5 text-primary/80 font-bold text-left leading-tight">
                      <Check className="text-accent w-4 h-4 mt-0.5 flex-shrink-0" /> 
                      <span className="text-[11px] sm:text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-5 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("New Mexico")}
                  className="w-full bg-accent text-primary font-black text-xs rounded-full py-2.5 border-0 shadow-md hover:bg-accent/90 transition-colors h-9"
                >
                  {t("services.formation.choose")} New Mexico
                </Button>
              </div>
              <div className="bg-accent/5 px-4 py-2 border-t border-accent/10 mt-auto text-center">
                <Button 
                  variant="link"
                  onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento New Mexico")}`)}
                  className="font-black text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                  data-testid="button-maintenance-nm"
                >
                  {t("services.formation.maintenanceYear2")}: {getMaintenancePriceFormatted("newMexico")}
                </Button>
              </div>
            </div>

            {/* Wyoming */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full group mx-auto w-full sm:max-w-none">
              <div className="p-4 sm:p-5 flex-grow text-center">
                <div className="flex items-center justify-between mb-3 gap-2 sm:flex-col sm:items-center sm:justify-center">
                  <h3 className="text-lg sm:text-xl font-black text-primary tracking-tight">Wyoming</h3>
                  <span className="bg-accent text-primary-foreground text-[10px] font-black px-2.5 py-0.5 rounded-full">{t("services.formation.premium")}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <p className="text-3xl font-black text-primary">{getFormationPriceFormatted("wyoming")}</p>
                  <span className="text-muted-foreground text-[10px] font-medium">{t("services.formation.year1")}</span>
                </div>
                <div className="text-muted-foreground text-[9px] font-black tracking-widest mb-3 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {t("services.formation.stateFeesIncluded")}
                </div>
                <div className="space-y-1.5 text-sm mb-3 border-t border-accent/10 pt-3">
                  {nmWyFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-1.5 text-primary/80 font-bold text-left leading-tight">
                      <Check className="text-accent w-4 h-4 mt-0.5 flex-shrink-0" /> 
                      <span className="text-[11px] sm:text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-5 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("Wyoming")}
                  className="w-full bg-accent text-primary font-black text-xs rounded-full py-2.5 border-0 shadow-md hover:bg-accent/90 transition-colors h-9"
                >
                  {t("services.formation.choose")} Wyoming
                </Button>
              </div>
              <div className="bg-accent/5 px-4 py-2 border-t border-accent/10 mt-auto text-center">
                <Button 
                  variant="link"
                  onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento Wyoming")}`)}
                  className="font-black text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                  data-testid="button-maintenance-wy"
                >
                  {t("services.formation.maintenanceYear2")}: {getMaintenancePriceFormatted("wyoming")}
                </Button>
              </div>
            </div>

            {/* Delaware */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full group mx-auto w-full sm:max-w-none">
              <div className="p-4 sm:p-5 flex-grow text-center">
                <div className="flex items-center justify-between mb-3 gap-2 sm:flex-col sm:items-center sm:justify-center">
                  <h3 className="text-lg sm:text-xl font-black text-primary tracking-tight">Delaware</h3>
                  <span className="bg-accent text-primary text-[10px] font-black px-2.5 py-0.5 rounded-full">{t("services.formation.startups")}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <p className="text-3xl font-black text-primary">{getFormationPriceFormatted("delaware")}</p>
                  <span className="text-muted-foreground text-[10px] font-medium">{t("services.formation.year1")}</span>
                </div>
                <div className="text-muted-foreground text-[9px] font-black tracking-widest mb-3 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {t("services.formation.stateFeesIncluded")}
                </div>
                <div className="space-y-1.5 text-sm mb-3 border-t border-accent/10 pt-3">
                  {deFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-1.5 text-primary/80 font-bold text-left leading-tight">
                      <Check className="text-accent w-4 h-4 mt-0.5 flex-shrink-0" /> 
                      <span className="text-[11px] sm:text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 sm:p-5 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("Delaware")}
                  className="w-full bg-accent text-primary font-black text-xs rounded-full py-2.5 border-0 shadow-md hover:bg-accent/90 transition-colors h-9"
                >
                  {t("services.formation.choose")} Delaware
                </Button>
              </div>
              <div className="bg-accent/5 px-4 py-2 border-t border-accent/10 mt-auto text-center">
                <Button 
                  variant="link"
                  onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento Delaware")}`)}
                  className="font-black text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                  data-testid="button-maintenance-de"
                >
                  {t("services.formation.maintenanceYear2")}: {getMaintenancePriceFormatted("delaware")}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 sm:mt-16 flex justify-center">
            <Button 
              onClick={() => {
                window.open("https://wa.me/34614916910?text=" + encodeURIComponent("Hola! He revisado vuestros servicios y precios. Me gustaría resolver algunas dudas antes de decidirme. ¿Podemos hablar?"), "_blank");
              }}
              className="group bg-accent text-primary font-black text-sm rounded-full px-8 py-6 h-14 shadow-md hover:bg-accent/90 transition-colors"
            >
              {t("services.questions")} →
            </Button>
          </div>
        </div>
      </section>

      <StateComparison />

      <section className="py-12 sm:py-20 bg-background relative" id="bancos">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1] will-change-[transform,opacity]" 
              style={{ fontWeight: 900 }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <span className="text-foreground">{t("services.banks.sectionTitle")}</span><br/>
              <span className="text-foreground">{t("services.banks.sectionTitleLine2")}</span><br/>
              <span className="text-foreground">{t("services.banks.sectionTitleLine3")}</span><br/>
              <span className="text-accent">{t("services.banks.sectionTitleHighlight")}</span><br/>
              <span className="text-accent">{t("services.banks.sectionTitleLine5")}</span>
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-base sm:text-lg mt-4 text-center max-w-2xl will-change-opacity"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewportOnce}
              transition={transitions.fast}
            >
              {t("services.banks.subtitle")}
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full will-change-transform"
              variants={lineExpand}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 mb-6 sm:mb-8 max-w-4xl mx-auto">
            {bankItems.map((item, i) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={i} 
                  className="bg-card rounded-2xl border border-border p-6 sm:p-8 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/10 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2">
                        {t(`services.banks.${item.key}.title`)}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {t(`services.banks.${item.key}.desc`)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Maintenance Section Header */}
          <div className="text-center mb-8 sm:mb-10 flex flex-col items-center justify-center relative" id="mantenimiento">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1] will-change-[transform,opacity]" 
              style={{ fontWeight: 900 }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <span className="text-foreground">{t("services.maintenancePack.sectionTitle")}</span><br/>
              <span className="text-foreground">{t("services.maintenancePack.sectionTitleLine2")}</span><br/>
              <span className="text-accent">{t("services.maintenancePack.sectionTitleHighlight")}</span><br/>
              <span className="text-accent">{t("services.maintenancePack.sectionTitleLine4")}</span>
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg text-muted-foreground mt-4 max-w-3xl"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {t("services.maintenancePack.sectionSubtitle")}
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full will-change-transform"
              variants={lineExpand}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            />
          </div>

          {/* Trust Text Block */}
          <motion.div 
            className="max-w-4xl mx-auto mb-10 px-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className="bg-accent/5 rounded-2xl p-6 sm:p-8 border border-accent/10">
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                {t("services.maintenancePack.trustText")}
              </p>
              <p className="text-foreground font-bold text-sm sm:text-base">
                {t("services.maintenancePack.trustGoal")}
              </p>
            </div>
          </motion.div>

          {/* Emotional Block */}
          <motion.div 
            className="max-w-4xl mx-auto mb-10 px-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className="bg-accent/10 rounded-2xl p-6 sm:p-8 text-left">
              <h4 className="text-xl sm:text-2xl font-black text-foreground mb-4">
                {t("services.maintenancePack.emotionalTitle")}
              </h4>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
                {t("services.maintenancePack.emotionalText")}
              </p>
            </div>
          </motion.div>

          {/* Benefits List */}
          <motion.div 
            className="max-w-3xl mx-auto mb-10 px-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className="flex flex-wrap justify-start gap-x-6 gap-y-3 text-left">
              {(t("services.maintenancePack.benefits", { returnObjects: true }) as string[]).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-foreground">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm font-bold">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Final Text */}
          <motion.div 
            className="text-center mb-12 px-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <p className="text-foreground font-bold text-base sm:text-lg max-w-2xl mx-auto mb-2">
              {t("services.maintenancePack.finalText")}
            </p>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              {t("services.maintenancePack.helpText")}
            </p>
          </motion.div>

          {/* Maintenance Packs Title */}
          <div className="text-center mb-10 flex flex-col items-center justify-center">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]"
              style={{ fontWeight: 900 }}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <span className="text-foreground">{t("packsTitle.maintenance.packs")}</span><br/>
              <span className="text-foreground">{t("packsTitle.maintenance.packsLine2")}</span><br/>
              <span className="text-accent">{t("packsTitle.maintenance.name")}</span><br/>
              <span className="text-accent">{t("packsTitle.maintenance.nameLine2")}</span>
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {t("packsTitle.maintenance.subtitle")}
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full will-change-transform"
              variants={lineExpand}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto px-4 sm:px-0 mb-12">
            {[
              { state: "New Mexico", price: getMaintenancePriceFormatted("newMexico"), annual: true },
              { state: "Wyoming", price: getMaintenancePriceFormatted("wyoming"), annual: true },
              { state: "Delaware", price: getMaintenancePriceFormatted("delaware"), annual: true }
            ].map((item, i) => (
              <div key={i} className="border-[2px] border-accent rounded-xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full group text-center mx-auto w-full sm:max-w-none">
                <div className="p-4 sm:p-5 flex-grow text-center">
                  <div className="flex flex-col items-center justify-center mb-3 gap-1">
                    <h3 className="text-lg sm:text-xl font-black text-primary tracking-tight">{item.state}</h3>
                    <span className="bg-accent/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">{t("services.maintenance.title")}</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <p className="text-2xl sm:text-3xl font-black text-primary">{item.price}</p>
                    <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">{t("services.formation.year")}</span>
                  </div>
                  <div className="space-y-1.5 text-left mt-3 border-t border-accent/10 pt-3">
                    {maintenanceFeatures.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-primary/80 font-bold leading-tight text-left">
                        <Check className="text-accent w-4 h-4 mt-0.5 flex-shrink-0" /> 
                        <span className="text-[10px] sm:text-[11px]">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 sm:p-5 pt-0 mt-auto">
                  <Button 
                    onClick={() => handleSelectMaintenance(item.state)}
                    className="w-full bg-accent text-primary font-black text-xs sm:text-sm rounded-full border-0 shadow-md hover:bg-accent/90 transition-colors h-9 sm:h-10"
                  >
                    {t("services.maintenancePack.choosePack")} {item.state}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
