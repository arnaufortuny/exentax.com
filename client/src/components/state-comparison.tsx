import { useState } from "react";
import { Check, AlertCircle, Lightbulb, ArrowRight } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, viewportOnce, transitions } from "@/lib/animations";
import { getFormationPriceFormatted, getMaintenancePriceFormatted } from "@shared/config/pricing";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface StateConfig {
  key: "newMexico" | "wyoming" | "delaware";
  name: string;
  badge: string;
  formationPrice: string;
  maintenancePrice: string;
  processingTime: string;
}

export function StateComparison() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const states: StateConfig[] = [
    {
      key: "newMexico",
      name: "New Mexico",
      badge: t("stateComparison.popular"),
      formationPrice: getFormationPriceFormatted("newMexico"),
      maintenancePrice: getMaintenancePriceFormatted("newMexico"),
      processingTime: "2-3 " + t("stateComparison.days"),
    },
    {
      key: "wyoming",
      name: "Wyoming",
      badge: t("stateComparison.premium"),
      formationPrice: getFormationPriceFormatted("wyoming"),
      maintenancePrice: getMaintenancePriceFormatted("wyoming"),
      processingTime: "2-3 " + t("stateComparison.days"),
    },
    {
      key: "delaware",
      name: "Delaware",
      badge: t("stateComparison.startups"),
      formationPrice: getFormationPriceFormatted("delaware"),
      maintenancePrice: getMaintenancePriceFormatted("delaware"),
      processingTime: "3-5 " + t("stateComparison.days"),
    },
  ];

  const active = states[activeIndex];
  const pros = t(`stateComparison.${active.key}.pros`, { returnObjects: true }) as string[];
  const cons = t(`stateComparison.${active.key}.cons`, { returnObjects: true }) as string[];
  const idealIf = t(`stateComparison.${active.key}.idealIf`);
  const tagline = t(`stateComparison.${active.key}.tagline`);

  return (
    <section className="py-16 sm:py-24 bg-background" id="state-comparison">
      <div className="w-full px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 flex flex-col items-center justify-center">
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]"
            style={{ fontWeight: 900 }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <span className="text-foreground">{t("stateComparison.title")}</span><br/>
            <span className="text-foreground">{t("stateComparison.titleLine2")}</span><br/>
            <span className="text-accent">{t("stateComparison.titleHighlight")}</span><br/>
            <span className="text-accent">{t("stateComparison.titleHighlight2")}</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-base sm:text-lg mt-4 text-center max-w-2xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={viewportOnce}
            transition={transitions.fast}
          >
            {t("stateComparison.subtitle")}
          </motion.p>
          <motion.div 
            className="w-24 h-1 bg-accent mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="flex flex-row items-center gap-2 p-1.5 bg-accent/8 dark:bg-accent/10 border border-accent/20 rounded-full mb-8 sm:mb-10 max-w-xl mx-auto" data-testid="state-selector-tabs">
            {states.map((state, index) => (
              <button
                key={state.key}
                onClick={() => setActiveIndex(index)}
                className={`relative flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-black tracking-tight transition-all duration-200 whitespace-nowrap ${
                  activeIndex === index
                    ? "bg-accent text-white shadow-md shadow-accent/25"
                    : "text-muted-foreground"
                }`}
                data-testid={`button-select-${state.key}`}
              >
                <span>{state.name}</span>
                <span className={`hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeIndex === index
                    ? "bg-white/20 text-white"
                    : "bg-transparent text-muted-foreground/60"
                }`}>
                  {state.badge}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                <div className="border border-accent/15 rounded-2xl p-5 text-left" data-testid={`card-advantages-${active.key}`}>
                  <h4 className="font-black text-base text-foreground tracking-tight mb-3">{t("stateComparison.pros")}</h4>
                  <ul className="space-y-2.5">
                    {pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground" data-testid={`text-advantage-${active.key}-${idx}`}>
                        <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-orange-200 dark:border-orange-800/30 rounded-2xl p-5 text-left" data-testid={`card-considerations-${active.key}`}>
                  <h4 className="font-black text-base text-foreground tracking-tight mb-3">{t("stateComparison.cons")}</h4>
                  <ul className="space-y-2.5">
                    {cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground" data-testid={`text-consideration-${active.key}-${idx}`}>
                        <AlertCircle className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-2xl p-5 text-left" data-testid={`card-ideal-${active.key}`}>
                <h4 className="font-black text-base text-foreground tracking-tight mb-2">{t("stateComparison.idealIf")}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{idealIf}</p>
                <p className="text-sm sm:text-base font-black text-accent mt-2 tracking-tight">{tagline}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.p
          className="text-center text-lg sm:text-xl text-foreground mt-10 max-w-3xl mx-auto font-black tracking-tight"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ delay: 0.4 }}
        >
          {t("stateComparison.humanMessage")}
        </motion.p>

        <motion.div 
          className="flex flex-row items-center justify-center gap-3 sm:gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ delay: 0.5 }}
        >
          <Link href="/llc/formation">
            <Button 
              className="bg-accent hover:bg-accent/90 text-primary font-black text-sm sm:text-base rounded-full px-5 sm:px-8 h-10 sm:h-11 shadow-lg shadow-accent/20 transition-all transform active:scale-95"
              data-testid="button-im-ready"
            >
              {t("stateComparison.imReady")}
              <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
            </Button>
          </Link>
          <Link href="/servicios#state-comparison">
            <Button 
              variant="outline"
              className="font-black text-sm sm:text-base rounded-full px-5 sm:px-8 h-10 sm:h-11 border-2 transition-all transform active:scale-95"
              data-testid="button-need-help"
            >
              {t("stateComparison.needHelp")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
