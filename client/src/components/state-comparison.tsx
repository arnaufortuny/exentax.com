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
    <section className="py-16 sm:py-24 bg-background" id="state-comparison">
      <div className="w-full px-4 sm:px-8 max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {states.map((state, index) => {
            const pros = t(`stateComparison.${state.key}.pros`, { returnObjects: true }) as string[];
            const cons = t(`stateComparison.${state.key}.cons`, { returnObjects: true }) as string[];
            const idealIf = t(`stateComparison.${state.key}.idealIf`);
            const tagline = t(`stateComparison.${state.key}.tagline`);

            const isWyoming = state.key === "wyoming";
            const isDelaware = state.key === "delaware";
            const isNewMexico = state.key === "newMexico";
            
            const cardBg = isWyoming 
              ? "bg-gradient-to-br from-accent/90 to-[#3CB365]"
              : isDelaware
                ? "bg-gradient-to-br from-[#1a1a2e] to-[#16213e] dark:from-[#0d1117] dark:to-[#161b22]"
                : "bg-gradient-to-br from-[#1a1a2e] to-[#16213e] dark:from-[#0d1117] dark:to-[#161b22]";
            
            const textPrimary = isWyoming ? "text-[#0A0A0A]" : "text-white";
            const textSecondary = isWyoming ? "text-[#0A0A0A]/70" : "text-white/70";
            const textMuted = isWyoming ? "text-[#0A0A0A]/60" : "text-white/60";
            const borderColor = isWyoming ? "border-[#0A0A0A]/10" : "border-white/10";
            const bgOverlay = isWyoming ? "bg-[#0A0A0A]/10" : "bg-white/5";
            const accentColor = isDelaware ? "text-purple-400" : isWyoming ? "text-[#0A0A0A]" : "text-accent";
            const iconBg = isDelaware ? "bg-purple-500/20" : isWyoming ? "bg-[#0A0A0A]/20" : "bg-accent/20";
            const checkColor = isDelaware ? "text-purple-400" : isWyoming ? "text-[#0A0A0A]" : "text-accent";

            return (
              <motion.div
                key={state.name}
                className={`relative rounded-3xl overflow-hidden ${cardBg} shadow-2xl flex flex-col ${isWyoming ? 'lg:-mt-4 lg:mb-4' : ''}`}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ delay: index * 0.1 }}
              >
                {!isWyoming && (
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${isDelaware ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' : 'bg-gradient-to-r from-accent via-[#52D882] to-accent'}`} />
                )}
                {isWyoming && (
                  <div className="bg-[#0A0A0A] text-accent text-[10px] font-black uppercase tracking-widest py-2 text-center">
                    {state.badge}
                  </div>
                )}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                
                <div className="p-6 sm:p-7 flex-grow relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center`}>
                      {isNewMexico && (
                        <svg className={`w-5 h-5 ${checkColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v20M8 6v12M16 8v10M4 10v6M20 12v4" />
                        </svg>
                      )}
                      {isWyoming && (
                        <svg className="w-5 h-5 text-[#0A0A0A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 8l-5-6-5 6" />
                          <path d="M3 14h18" />
                          <path d="M6 14v4a2 2 0 002 2h8a2 2 0 002-2v-4" />
                          <circle cx="8" cy="10" r="1" fill="currentColor" />
                          <circle cx="16" cy="10" r="1" fill="currentColor" />
                        </svg>
                      )}
                      {isDelaware && (
                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
                          <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
                          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-black ${textPrimary} tracking-tight`}>{state.name}</h3>
                      {!isWyoming && (
                        <span className={`${accentColor} text-xs font-bold`}>{state.badge}</span>
                      )}
                    </div>
                  </div>

                  <div className={`${bgOverlay} backdrop-blur-sm rounded-2xl p-4 mb-5 border ${borderColor}`}>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className={`text-[10px] ${textMuted} mb-1 uppercase tracking-wider font-semibold`}>{t("stateComparison.features.formationPrice")}</p>
                        <p className={`text-lg font-black ${accentColor}`}>{state.formationPrice}</p>
                      </div>
                      <div className={`text-center border-x ${borderColor}`}>
                        <p className={`text-[10px] ${textMuted} mb-1 uppercase tracking-wider font-semibold`}>{t("stateComparison.features.maintenancePrice")}</p>
                        <p className={`text-lg font-black ${textPrimary}`}>{state.maintenancePrice}</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] ${textMuted} mb-1 uppercase tracking-wider font-semibold`}>{t("stateComparison.features.processingTime")}</p>
                        <p className={`text-lg font-bold ${textPrimary}`}>{state.processingTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-5 h-5 rounded-full ${iconBg} flex items-center justify-center`}>
                          <Check className={`w-3 h-3 ${checkColor}`} />
                        </div>
                        <h4 className={`font-black text-sm ${textPrimary}`}>{t("stateComparison.pros")}</h4>
                      </div>
                      <ul className="space-y-2">
                        {pros.map((pro, idx) => (
                          <li key={idx} className={`flex items-start gap-2 text-xs ${textSecondary}`}>
                            <Check className={`w-3.5 h-3.5 ${checkColor} flex-shrink-0 mt-0.5`} />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <AlertCircle className="w-3 h-3 text-orange-400" />
                        </div>
                        <h4 className={`font-black text-sm ${textPrimary}`}>{t("stateComparison.cons")}</h4>
                      </div>
                      <ul className="space-y-2">
                        {cons.map((con, idx) => (
                          <li key={idx} className={`flex items-start gap-2 text-xs ${textSecondary}`}>
                            <AlertCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className={`${bgOverlay} backdrop-blur-sm rounded-xl p-4 mb-4 border ${borderColor}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className={`w-4 h-4 ${accentColor}`} />
                        <h4 className={`font-black text-xs ${textPrimary}`}>{t("stateComparison.idealIf")}</h4>
                      </div>
                      <p className={`text-xs ${textSecondary} leading-relaxed text-left`}>{idealIf}</p>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-black ${accentColor}`}>{tagline}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-12 sm:mt-16 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] dark:from-[#0d1117] dark:to-[#161b22] rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          <h3 className="text-xl sm:text-2xl font-black text-white text-center mb-6 relative z-10">
            {t("stateComparison.quickGuide.title")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl text-left border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M8 6v12M16 8v10M4 10v6M20 12v4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/60">{t("stateComparison.quickGuide.easy")}</p>
                <p className="font-black text-white">New Mexico</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent/20 backdrop-blur-sm rounded-2xl text-left border border-accent/30">
              <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#0A0A0A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8l-5-6-5 6" />
                  <path d="M3 14h18" />
                  <path d="M6 14v4a2 2 0 002 2h8a2 2 0 002-2v-4" />
                  <circle cx="8" cy="10" r="1" fill="currentColor" />
                  <circle cx="16" cy="10" r="1" fill="currentColor" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/60">{t("stateComparison.quickGuide.protection")}</p>
                <p className="font-black text-accent">Wyoming</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl text-left border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
                  <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/60">{t("stateComparison.quickGuide.growth")}</p>
                <p className="font-black text-purple-400">Delaware</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-lg sm:text-xl text-foreground mt-10 max-w-3xl mx-auto font-semibold"
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
