import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { TaxComparator } from "@/components/tax-comparator";
import type { Product } from "@shared/schema";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Servicios() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (window.location.hash === '#pricing') {
      const element = document.getElementById('pricing');
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
    { key: "formation" },
    { key: "ein" },
    { key: "banking" },
    { key: "boi" },
    { key: "agent" },
    { key: "support" }
  ];

  const bankItems = [
    { key: "mercury" },
    { key: "relay" },
    { key: "strategy" },
    { key: "continuous" }
  ];

  return (
    <div className="min-h-screen font-sans bg-background bg-green-gradient text-center overflow-x-hidden w-full relative animate-page-in">
      <Navbar />
      
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-32 sm:pt-24 min-h-[450px] sm:min-h-[auto] w-full"
        showOverlay={false}
        title={
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.1] text-center uppercase"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t("services.heroTitle")} <span className="text-accent">{t("services.heroTitleHighlight")}</span>
          </motion.h1>
        }
        subtitle={
            <div className="flex flex-col items-center justify-center w-full mt-6 sm:mt-8">
              <motion.div 
                className="text-[13px] sm:text-xl lg:text-2xl text-foreground font-medium leading-relaxed max-w-2xl text-center mb-8 sm:mb-12 mx-auto px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {t("services.heroSubtitle")}
              </motion.div>
              
              <motion.div 
                className="hidden sm:flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl px-4 mb-12"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {heroFeatures.map((text, i) => (
                  <div 
                    key={i} 
                    className="bg-white dark:bg-zinc-900 text-primary font-black text-sm px-4 py-2 rounded-full border border-primary shadow-sm"
                  >
                    {text}
                  </div>
                ))}
              </motion.div>
            </div>
        }
      />

      <section className="py-16 sm:py-20 bg-background relative" id="que-hacemos">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]" 
              style={{ fontWeight: 900 }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="text-accent">{t("services.whatWeDo.title")}</span>
            </motion.h2>
            <motion.div 
              className="w-24 h-1 bg-foreground mt-6 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {whatWeDoItems.map((item, i) => (
              <motion.div 
                key={i} 
                className="p-6 bg-accent/5 rounded-2xl border border-accent/10 sm:border-accent/10 border-accent/30 hover:bg-accent/10 text-left transition-colors"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-sm mb-4">
                  {t(`services.whatWeDo.items.${item.key}.title`)}
                </span>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-left">{t(`services.whatWeDo.items.${item.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TaxComparator />

      <section className="py-16 sm:py-20 bg-background" id="pricing">
        <div className="w-full px-4 sm:px-8">
          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]" 
              style={{ fontWeight: 900 }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="text-foreground">{t("packsTitle.packs")}</span>{" "}
              <span className="text-accent">{t("packsTitle.formation")}</span>
            </motion.h2>
            <motion.div 
              className="w-24 h-1 bg-accent mt-6 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0">
            {/* New Mexico */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full sm:max-w-none">
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center justify-center mb-4 sm:mb-4 gap-2">
                  <h3 className="text-xl sm:text-xl font-black text-primary  tracking-tight">New Mexico</h3>
                  <span className="bg-accent/20 text-primary text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full ">{t("services.formation.popular")}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">739€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">{t("services.formation.year1")}</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black  tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {t("services.formation.stateFeesIncluded")}
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {nmWyFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-2 sm:gap-2 text-primary/80 font-medium text-left leading-tight">
                      <Check className="text-accent w-5 h-5 mt-0.5 flex-shrink-0" /> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("New Mexico")}
                  className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                >
                  {t("services.formation.choose")} New Mexico
                </Button>
              </div>
                  <div className="bg-accent/5 px-5 py-3 sm:px-5 sm:py-3 border-t border-accent/10 mt-auto text-center">
                    <Button 
                      variant="link"
                      onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento New Mexico")}`)}
                      className="font-black text-[10px] sm:text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                      data-testid="button-maintenance-nm"
                    >
                      {t("services.formation.maintenanceYear2")}: 539€
                    </Button>
                  </div>
            </div>

            {/* Wyoming */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full sm:max-w-none">
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center justify-center mb-4 sm:mb-4 gap-2">
                  <h3 className="text-xl sm:text-xl font-black text-primary  tracking-tight">Wyoming</h3>
                  <span className="bg-accent text-primary-foreground text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full ">{t("services.formation.premium")}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">899€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">{t("services.formation.year1")}</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black  tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {t("services.formation.stateFeesIncluded")}
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {nmWyFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-2 sm:gap-2 text-primary/80 font-medium text-left leading-tight">
                      <Check className="text-accent w-5 h-5 mt-0.5 flex-shrink-0" /> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("Wyoming")}
                  className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                >
                  {t("services.formation.choose")} Wyoming
                </Button>
              </div>
                  <div className="bg-accent/5 px-5 py-3 sm:px-5 sm:py-3 border-t border-accent/10 mt-auto text-center">
                    <Button 
                      variant="link"
                      onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento Wyoming")}`)}
                      className="font-black text-[10px] sm:text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                      data-testid="button-maintenance-wy"
                    >
                      {t("services.formation.maintenanceYear2")}: 699€
                    </Button>
                  </div>
            </div>

            {/* Delaware */}
            <div className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full sm:max-w-none">
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex flex-col items-center justify-center mb-4 sm:mb-4 gap-2">
                  <h3 className="text-xl sm:text-xl font-black text-primary  tracking-tight">Delaware</h3>
                  <span className="bg-accent text-primary text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full ">{t("services.formation.startups")}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-primary">1399€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">{t("services.formation.year1")}</span>
                </div>
                <div className="text-muted-foreground text-[10px] sm:text-[9px] font-black  tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {t("services.formation.stateFeesIncluded")}
                </div>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-accent/10 pt-4 sm:pt-4">
                  {deFeatures.map((f) => (
                    <div key={f} className="flex items-start justify-start gap-2 sm:gap-2 text-primary/80 font-medium text-left leading-tight">
                      <Check className="text-accent w-5 h-5 mt-0.5 flex-shrink-0" /> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct("Delaware")}
                  className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                >
                  {t("services.formation.choose")} Delaware
                </Button>
              </div>
                  <div className="bg-accent/5 px-5 py-3 sm:px-5 sm:py-3 border-t border-accent/10 mt-auto text-center">
                    <Button 
                      variant="link"
                      onClick={() => setLocation(`/contacto?subject=${encodeURIComponent("Mantenimiento Delaware")}`)}
                      className="font-black text-[10px] sm:text-[9px] tracking-widest text-primary/70 p-0 h-auto"
                      data-testid="button-maintenance-de"
                    >
                      {t("services.formation.maintenanceYear2")}: 999€
                    </Button>
                  </div>
            </div>
          </div>
          
          <div className="mt-12 sm:mt-16 flex justify-center">
            <Button 
              onClick={() => {
                window.open("https://wa.me/34614916910?text=" + encodeURIComponent("Hola, me interesa crear una LLC en Estados Unidos"), "_blank");
              }}
              className="group bg-accent text-primary font-black text-sm rounded-full px-8 py-6 h-14 shadow-md hover:bg-accent/90 transition-all transform hover:scale-105 active:scale-95 shadow-accent/20"
            >
              {t("services.questions")} →
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-background relative" id="bancos">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-center" 
              style={{ fontWeight: 900 }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="text-foreground">{t("services.banks.sectionTitle")}</span>{" "}
              <span className="text-accent">{t("services.banks.sectionTitleHighlight")}</span>
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-base sm:text-lg mt-2 sm:mt-3 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {t("services.banks.subtitle")}
            </motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6 max-w-4xl mx-auto">
            {bankItems.map((item, i) => (
              <motion.div 
                key={i} 
                className="p-6 bg-accent/5 rounded-2xl border border-accent/10 sm:border-accent/10 border-accent/30 hover:bg-accent/10 transition-colors text-center"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-primary font-black text-sm shadow-sm mb-4">
                  {t(`services.banks.${item.key}.title`)}
                </span>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t(`services.banks.${item.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 mb-12 flex justify-center">
            <div className="bg-accent px-8 py-3 rounded-full shadow-lg transform -rotate-1">
              <p className="text-primary font-sans font-black  tracking-[0.2em] text-sm sm:text-base">
                {t("services.banks.included")}
              </p>
            </div>
          </div>

          <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]" 
              style={{ fontWeight: 900 }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="text-foreground">{t("packsTitle.maintenance.packs")}</span>{" "}
              <span className="text-accent">{t("packsTitle.maintenance.name")}</span>
            </motion.h2>
            <motion.div 
              className="w-24 h-1 bg-foreground mt-6 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0 mb-12">
            {[
              { state: "New Mexico", price: "539€", annual: true },
              { state: "Wyoming", price: "699€", annual: true },
              { state: "Delaware", price: "999€", annual: true }
            ].map((item, i) => (
              <div key={i} className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group text-center mx-auto w-full sm:max-w-none">
                <div className="p-5 sm:p-6 flex-grow text-center">
                  <div className="flex flex-col items-center justify-center mb-4 sm:mb-4 gap-2">
                    <h3 className="text-xl sm:text-xl font-black text-primary  tracking-tight">{item.state}</h3>
                    <span className="bg-accent/20 text-primary text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full ">{t("services.maintenance.title")}</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <p className="text-4xl sm:text-4xl font-black text-primary">{item.price}</p>
                    <span className="text-muted-foreground text-xs sm:text-xs font-medium">{t("services.formation.year")}</span>
                  </div>
                  <div className="space-y-2 text-left mt-4 border-t border-accent/10 pt-4">
                    {maintenanceFeatures.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-primary/80 font-medium leading-tight text-left">
                        <Check className="text-accent w-5 h-5 mt-0.5 flex-shrink-0" /> 
                        <span className="text-[11px] sm:text-xs">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 sm:p-6 pt-0 mt-auto">
                  <Button 
                    onClick={() => handleSelectMaintenance(item.state)}
                    className="w-full bg-accent text-primary font-black text-sm rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-accent/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-accent/20"
                  >
                    {t("services.maintenancePack.choosePack")} {item.state}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-background relative" id="proceso">
        <div className="w-full px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-16 flex flex-col items-center justify-center relative">
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-center" 
              style={{ fontWeight: 900 }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="text-foreground">{t("services.process.title")}</span>{" "}
              <span className="text-accent">{t("services.process.titleHighlight")}</span>
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-base sm:text-lg mt-2 sm:mt-3 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {t("services.management.subtitle")}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {["fiscal", "agent", "annual", "boi", "support", "updates"].map((key, i) => (
              <motion.div 
                key={i} 
                className="p-6 bg-accent/5 rounded-2xl border border-accent/10 sm:border-accent/10 border-accent/30 hover:bg-accent/10 transition-colors text-left"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-primary font-black text-sm shadow-sm mb-4">
                  {t(`services.maintenancePack.details.${key}.title`)}
                </span>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-left">{t(`services.maintenancePack.details.${key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
