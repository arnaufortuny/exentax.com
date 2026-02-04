import { Check, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { fadeInUp, viewportOnce, transitions } from "@/lib/animations";
import { getFormationPriceFormatted, getMaintenancePriceFormatted } from "@shared/config/pricing";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface StateConfig {
  key: "newMexico" | "wyoming" | "delaware";
  name: string;
  badge: string;
  badgeStyle: string;
  formationPrice: string;
  maintenancePrice: string;
  processingTime: string;
}

export function StateComparison() {
  const { t } = useTranslation();

  const states: StateConfig[] = [
    {
      key: "newMexico",
      name: "New Mexico",
      badge: t("stateComparison.popular"),
      badgeStyle: "bg-accent/20 text-accent",
      formationPrice: getFormationPriceFormatted("newMexico"),
      maintenancePrice: getMaintenancePriceFormatted("newMexico"),
      processingTime: "2-3 " + t("stateComparison.days"),
    },
    {
      key: "wyoming",
      name: "Wyoming",
      badge: t("stateComparison.premium"),
      badgeStyle: "bg-accent text-primary-foreground",
      formationPrice: getFormationPriceFormatted("wyoming"),
      maintenancePrice: getMaintenancePriceFormatted("wyoming"),
      processingTime: "2-3 " + t("stateComparison.days"),
    },
    {
      key: "delaware",
      name: "Delaware",
      badge: t("stateComparison.startups"),
      badgeStyle: "bg-accent/20 text-accent",
      formationPrice: getFormationPriceFormatted("delaware"),
      maintenancePrice: getMaintenancePriceFormatted("delaware"),
      processingTime: "3-5 " + t("stateComparison.days"),
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-muted/30" id="comparador">
      <div className="w-full px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 flex flex-col items-center justify-center">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-center leading-[1.1]"
            style={{ fontWeight: 900 }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <span className="text-foreground">{t("stateComparison.title")}</span>{" "}
            <span className="text-accent">{t("stateComparison.titleHighlight")}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {states.map((state, index) => {
            const pros = t(`stateComparison.${state.key}.pros`, { returnObjects: true }) as string[];
            const cons = t(`stateComparison.${state.key}.cons`, { returnObjects: true }) as string[];
            const idealIf = t(`stateComparison.${state.key}.idealIf`);
            const tagline = t(`stateComparison.${state.key}.tagline`);

            return (
              <motion.div
                key={state.name}
                className="bg-background rounded-3xl border-2 border-border p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all flex flex-col"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground">{state.name}</h3>
                  <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${state.badgeStyle}`}>
                    {state.badge}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 bg-muted/50 rounded-xl p-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t("stateComparison.features.formationPrice")}</p>
                    <p className="text-lg font-black text-accent">{state.formationPrice}</p>
                  </div>
                  <div className="text-center border-x border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">{t("stateComparison.features.maintenancePrice")}</p>
                    <p className="text-lg font-black text-foreground">{state.maintenancePrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t("stateComparison.features.processingTime")}</p>
                    <p className="text-lg font-bold text-foreground">{state.processingTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-5 h-5 text-accent" />
                      <h4 className="font-black text-base text-foreground">{t("stateComparison.pros")}</h4>
                    </div>
                    <ul className="space-y-2">
                      {pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <h4 className="font-black text-base text-foreground">{t("stateComparison.cons")}</h4>
                    </div>
                    <ul className="space-y-2">
                      {cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="w-4 h-4 text-orange-500/70 flex-shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="bg-accent/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      <h4 className="font-black text-sm text-foreground">{t("stateComparison.idealIf")}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed text-left">{idealIf}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-base font-black text-accent">{tagline}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-12 sm:mt-16 bg-background rounded-2xl border border-border p-6 sm:p-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl sm:text-3xl font-black text-foreground text-center mb-6">
            {t("stateComparison.quickGuide.title")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl">
              <div className="w-3 h-3 bg-accent rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stateComparison.quickGuide.easy")}</p>
                <p className="font-black text-foreground">New Mexico</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl">
              <div className="w-3 h-3 bg-accent rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stateComparison.quickGuide.protection")}</p>
                <p className="font-black text-foreground">Wyoming</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl">
              <div className="w-3 h-3 bg-accent rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stateComparison.quickGuide.growth")}</p>
                <p className="font-black text-foreground">Delaware</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-lg sm:text-xl text-muted-foreground mt-10 max-w-3xl mx-auto font-medium italic"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ delay: 0.4 }}
        >
          "{t("stateComparison.humanMessage")}"
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
          <Link href="/servicios#comparador">
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
