import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TaxComparator } from "@/components/tax-comparator";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@/components/icons";

export default function StartPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  usePageTitle(t("start.seo.title"));

  const steps = [
    { num: "1", key: "start.steps.calculate" },
    { num: "2", key: "start.steps.consult" },
    { num: "3", key: "start.steps.launch" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 dark:from-accent/10 dark:via-transparent dark:to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-wider uppercase bg-accent/10 text-accent rounded-full" data-testid="badge-start-hero">
              {t("start.hero.badge")}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 font-[Space_Grotesk] whitespace-pre-line" data-testid="text-start-title">
              {t("start.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto whitespace-pre-line" data-testid="text-start-subtitle">
              {t("start.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  document.getElementById("tax-calculator")?.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="button-start-calculate"
              >
                {t("start.hero.ctaCalculate")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/agendar-consultoria")}
                data-testid="button-start-consult"
              >
                {t("start.hero.ctaConsult")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-[Space_Grotesk] mb-3" data-testid="text-steps-title">
            {t("start.steps.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("start.steps.subtitle")}</p>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white font-bold text-lg mb-4" data-testid={`text-step-number-${s.num}`}>
                  {s.num}
                </div>
                <p className="font-medium text-foreground" data-testid={`text-step-${s.num}`}>{t(s.key)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="tax-calculator" className="py-12 md:py-20 scroll-mt-20">
        <TaxComparator />
      </section>

      <section className="py-16 md:py-24 bg-accent/5 dark:bg-accent/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-foreground font-[Space_Grotesk] mb-4" data-testid="text-cta-title">
              {t("start.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">{t("start.cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/agendar-consultoria")}
                data-testid="button-cta-consult"
              >
                {t("start.cta.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/servicios")}
                data-testid="button-cta-services"
              >
                {t("start.cta.services")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
