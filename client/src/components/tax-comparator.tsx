import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, TrendingUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { USAFlag as USFlag } from "@/components/ui/flags";
import moneyIcon from "@/assets/images/money-icon.png";

interface TaxBreakdown {
  income: number;
  incomeTax: number;
  socialSecurity: number;
  vat: number;
  total: number;
  netIncome: number;
  effectiveRate: number;
}

type Country = "spain" | "uk" | "germany" | "france" | "lithuania" | "bulgaria";

interface CountryInfo {
  id: Country;
  name: string;
  flag: string;
  vatRate: number;
}

const countries: CountryInfo[] = [
  { id: "spain", name: "España", flag: "🇪🇸", vatRate: 21 },
  { id: "uk", name: "Reino Unido", flag: "🇬🇧", vatRate: 20 },
  { id: "germany", name: "Alemania", flag: "🇩🇪", vatRate: 19 },
  { id: "france", name: "Francia", flag: "🇫🇷", vatRate: 20 },
  { id: "lithuania", name: "Lituania", flag: "🇱🇹", vatRate: 21 },
  { id: "bulgaria", name: "Bulgaria", flag: "🇧🇬", vatRate: 20 },
];

function calculateTaxes(grossIncome: number, country: Country): TaxBreakdown {
  let incomeTax = 0;
  let socialSecurity = 0;
  let vatRate = 0;

  switch (country) {
    case "spain":
      // Spain: Progressive IRPF + Social Security (30% capped) + 21% VAT
      socialSecurity = Math.min(Math.max(grossIncome * 0.30, 3600), 16000);
      const taxableSpain = grossIncome - socialSecurity;
      const bracketsSpain = [
        { limit: 12450, rate: 0.19 },
        { limit: 20200, rate: 0.24 },
        { limit: 35200, rate: 0.30 },
        { limit: 60000, rate: 0.37 },
        { limit: 300000, rate: 0.45 },
        { limit: Infinity, rate: 0.47 }
      ];
      let remainingSpain = Math.max(taxableSpain, 0);
      let prevLimitSpain = 0;
      for (const b of bracketsSpain) {
        const taxable = Math.min(remainingSpain, b.limit - prevLimitSpain);
        if (taxable > 0) incomeTax += taxable * b.rate;
        remainingSpain -= taxable;
        prevLimitSpain = b.limit;
        if (remainingSpain <= 0) break;
      }
      vatRate = 0.21;
      break;

    case "uk":
      // UK: Progressive Income Tax + National Insurance (12%) + 20% VAT
      socialSecurity = grossIncome * 0.12;
      const bracketsUK = [
        { limit: 12570, rate: 0 },
        { limit: 50270, rate: 0.20 },
        { limit: 125140, rate: 0.40 },
        { limit: Infinity, rate: 0.45 }
      ];
      let remainingUK = grossIncome;
      let prevLimitUK = 0;
      for (const b of bracketsUK) {
        const taxable = Math.min(remainingUK, b.limit - prevLimitUK);
        if (taxable > 0) incomeTax += taxable * b.rate;
        remainingUK -= taxable;
        prevLimitUK = b.limit;
        if (remainingUK <= 0) break;
      }
      vatRate = 0.20;
      break;

    case "germany":
      // Germany: Progressive (14-45%) + Social Security (~20%) + 19% VAT
      socialSecurity = grossIncome * 0.20;
      const bracketsGermany = [
        { limit: 10908, rate: 0 },
        { limit: 62810, rate: 0.30 },
        { limit: 277826, rate: 0.42 },
        { limit: Infinity, rate: 0.45 }
      ];
      let remainingDE = grossIncome;
      let prevLimitDE = 0;
      for (const b of bracketsGermany) {
        const taxable = Math.min(remainingDE, b.limit - prevLimitDE);
        if (taxable > 0) incomeTax += taxable * b.rate;
        remainingDE -= taxable;
        prevLimitDE = b.limit;
        if (remainingDE <= 0) break;
      }
      vatRate = 0.19;
      break;

    case "france":
      // France: Progressive (0-45%) + Social Security (~22%) + 20% VAT
      socialSecurity = grossIncome * 0.22;
      const bracketsFR = [
        { limit: 10777, rate: 0 },
        { limit: 27478, rate: 0.11 },
        { limit: 78570, rate: 0.30 },
        { limit: 168994, rate: 0.41 },
        { limit: Infinity, rate: 0.45 }
      ];
      let remainingFR = grossIncome;
      let prevLimitFR = 0;
      for (const b of bracketsFR) {
        const taxable = Math.min(remainingFR, b.limit - prevLimitFR);
        if (taxable > 0) incomeTax += taxable * b.rate;
        remainingFR -= taxable;
        prevLimitFR = b.limit;
        if (remainingFR <= 0) break;
      }
      vatRate = 0.20;
      break;

    case "lithuania":
      // Lithuania: Flat 20% income tax + Social Security (~19.5%) + 21% VAT
      incomeTax = grossIncome * 0.20;
      socialSecurity = grossIncome * 0.195;
      vatRate = 0.21;
      break;

    case "bulgaria":
      // Bulgaria: Flat 10% income tax + Social Security (~13%) + 20% VAT
      incomeTax = grossIncome * 0.10;
      socialSecurity = grossIncome * 0.13;
      vatRate = 0.20;
      break;
  }

  const vat = grossIncome * vatRate;
  const total = incomeTax + socialSecurity + vat;
  const netIncome = grossIncome - total;
  const effectiveRate = grossIncome > 0 ? (total / grossIncome) * 100 : 0;

  return {
    income: grossIncome,
    incomeTax: Math.round(incomeTax),
    socialSecurity: Math.round(socialSecurity),
    vat: Math.round(vat),
    total: Math.round(total),
    netIncome: Math.round(netIncome),
    effectiveRate: Math.round(effectiveRate * 10) / 10
  };
}

function calculateUSLLCTaxes(grossIncome: number): TaxBreakdown {
  return {
    income: grossIncome,
    incomeTax: 0,
    socialSecurity: 0,
    vat: 0,
    total: 0,
    netIncome: Math.round(grossIncome),
    effectiveRate: 0
  };
}

export function TaxComparator() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [income, setIncome] = useState(50000);
  const [selectedCountry, setSelectedCountry] = useState<Country>("spain");
  const [showDetails, setShowDetails] = useState(false);
  
  const countryTaxes = useMemo(() => calculateTaxes(income, selectedCountry), [income, selectedCountry]);
  const usLLCTaxes = useMemo(() => calculateUSLLCTaxes(income), [income]);
  const savings = countryTaxes.total - usLLCTaxes.total;
  const savingsPercentage = countryTaxes.income > 0 ? (savings / countryTaxes.income) * 100 : 0;
  
  const selectedCountryInfo = countries.find(c => c.id === selectedCountry)!;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const incomePresets = [30000, 50000, 75000, 100000, 150000];
  const sliderProgress = ((income - 20000) / (200000 - 20000)) * 100;
  
  return (
    <section className="py-16 sm:py-24 bg-accent/5 relative overflow-hidden" id="comparador">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full px-4 sm:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-black text-sm mb-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Calculator className="w-4 h-4" />
            {t("taxComparator.badge")}
          </motion.div>
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-center leading-tight"
            style={{ fontWeight: 900 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-foreground">{t("taxComparator.titlePart1")}</span>{" "}
            <span className="text-accent">{t("taxComparator.titlePart2")}</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground font-bold text-base sm:text-lg mt-4 text-center max-w-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t("taxComparator.subtitle")}
          </motion.p>
        </div>
        
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="bg-background rounded-3xl border-2 border-accent/20 shadow-2xl shadow-accent/10 overflow-hidden">
            {/* Country Selection */}
            <div className="p-6 sm:p-8 border-b border-accent/10">
              <h3 className="text-lg sm:text-xl font-black text-foreground mb-4 text-center">
                {t("taxComparator.selectCountry")}
              </h3>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {countries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country.id)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-black transition-all transform active:scale-95 flex items-center gap-2 ${
                      selectedCountry === country.id
                        ? 'bg-accent text-primary shadow-lg shadow-accent/30'
                        : 'bg-background text-foreground border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/5'
                    }`}
                    data-testid={`button-country-${country.id}`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="hidden sm:inline">{country.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Income Selection */}
            <div className="p-6 sm:p-8 bg-background">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center p-2">
                    <img src={moneyIcon} alt="" className="w-8 h-8 object-contain" />
                  </div>
                  <label className="text-base font-black text-foreground">
                    {t("taxComparator.annualIncome")}
                  </label>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-accent tracking-tight">{formatCurrency(income)}</div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {incomePresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setIncome(preset)}
                    className={`px-5 py-2.5 rounded-full text-sm font-black transition-all transform active:scale-95 ${
                      income === preset
                        ? 'bg-accent text-primary shadow-lg shadow-accent/30'
                        : 'bg-background text-foreground border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/5'
                    }`}
                    data-testid={`button-preset-${preset}`}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-200"
                    style={{ width: `${sliderProgress}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="20000"
                  max="200000"
                  step="5000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
                  data-testid="slider-income"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-accent rounded-full border-4 border-background shadow-lg shadow-accent/40 transition-all duration-200 pointer-events-none"
                  style={{ left: `calc(${sliderProgress}% - 12px)` }}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-4 font-black">
                  <span>{t("taxComparator.minIncome")}</span>
                  <span>{t("taxComparator.maxIncome")}</span>
                </div>
              </div>
            </div>
            
            {/* Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* US LLC */}
              <div className="p-6 sm:p-8 bg-accent/10 border-b md:border-b-0 md:border-r border-accent/20 relative">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 rounded-full bg-accent text-primary text-xs font-black flex items-center gap-1.5 shadow-lg shadow-accent/30">
                    <TrendingUp className="w-3.5 h-3.5" /> 0% {t("taxComparator.taxes")}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center border-2 border-accent/30 shadow-lg">
                    <USFlag />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-xl">{t("taxComparator.usllc.title")}</h3>
                    <p className="text-sm text-muted-foreground font-bold">{t("taxComparator.usllc.subtitle")}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-accent/20">
                    <span className="text-sm text-muted-foreground font-black">{t("taxComparator.usllc.federalTax")}</span>
                    <span className="font-black text-accent text-lg">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-accent/20">
                    <span className="text-sm text-muted-foreground font-black">{t("taxComparator.usllc.selfEmployment")}</span>
                    <span className="font-black text-accent text-lg">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-accent/20">
                    <span className="text-sm text-muted-foreground font-black">{t("taxComparator.usllc.vat")}</span>
                    <span className="font-black text-accent text-lg">{formatCurrency(0)}</span>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground text-lg">{t("taxComparator.totalTaxes")}</span>
                      <span className="font-black text-accent text-2xl">{formatCurrency(0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-accent rounded-2xl p-5 mt-6 shadow-lg shadow-accent/20">
                  <p className="text-sm text-primary/80 mb-1 font-black">{t("taxComparator.netIncome")}</p>
                  <p className="font-black text-primary text-3xl">{formatCurrency(usLLCTaxes.netIncome)}</p>
                </div>
              </div>
              
              {/* Selected Country */}
              <div className="p-6 sm:p-8 bg-muted/50 relative">
                <div className="flex items-start justify-between gap-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center border-2 border-border shadow-lg text-3xl shrink-0">
                      {selectedCountryInfo.flag}
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-foreground text-xl">{t(`taxComparator.countries.${selectedCountry}.title`)}</h3>
                      <p className="text-sm text-muted-foreground font-bold">{t(`taxComparator.countries.${selectedCountry}.subtitle`)}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-destructive/15 border border-destructive/30 shrink-0">
                    <span className="text-destructive text-xs font-black whitespace-nowrap">
                      {countryTaxes.effectiveRate}% {t("taxComparator.effectiveRate")}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground font-black">{t("taxComparator.incomeTax")}</span>
                    <span className="font-black text-destructive text-lg">-{formatCurrency(countryTaxes.incomeTax)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground font-black">{t("taxComparator.socialSecurity")}</span>
                    <span className="font-black text-destructive text-lg">-{formatCurrency(countryTaxes.socialSecurity)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground font-black">{t("taxComparator.vat")} ({selectedCountryInfo.vatRate}%)</span>
                    <span className="font-black text-destructive text-lg">-{formatCurrency(countryTaxes.vat)}</span>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground text-lg">{t("taxComparator.totalTaxes")}</span>
                      <span className="font-black text-destructive text-2xl">-{formatCurrency(countryTaxes.total)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted rounded-2xl p-5 mt-6 border border-border">
                  <p className="text-sm text-muted-foreground mb-1 font-black">{t("taxComparator.netIncome")}</p>
                  <p className="font-black text-foreground text-3xl">{formatCurrency(countryTaxes.netIncome)}</p>
                </div>
              </div>
            </div>
            
            {/* Savings */}
            <div className="p-6 sm:p-8 bg-background relative overflow-hidden border-t border-accent/10">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent rounded-full blur-2xl" />
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center md:text-left">
                  <p className="text-sm text-accent/70 font-black">{t("taxComparator.savings.label")}</p>
                  <p className="font-black text-accent text-4xl sm:text-5xl">{formatCurrency(savings)}</p>
                  <p className="text-sm text-accent/80 font-black mt-1">
                    {t("taxComparator.savings.percentage", { percentage: Math.round(savingsPercentage) })}
                  </p>
                </div>
                <Button
                  onClick={() => setLocation("/llc/formation")}
                  className="bg-accent text-primary font-black text-base rounded-full px-10 h-14 w-full md:w-auto shadow-xl shadow-accent/30 hover:bg-accent/90 transition-all transform hover:scale-105 active:scale-95"
                  data-testid="button-start-llc-comparator"
                >
                  {t("taxComparator.cta")} →
                </Button>
              </div>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 flex items-center justify-center gap-2 text-sm font-black text-muted-foreground hover:text-foreground transition-colors bg-muted/30 hover:bg-muted/50"
              data-testid="button-toggle-details"
            >
              {showDetails ? t("taxComparator.hideDetails") : t("taxComparator.showDetails")}
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showDetails && (
              <motion.div 
                className="p-6 sm:p-8 border-t border-border bg-muted/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-black text-foreground mb-4 text-lg">{t("taxComparator.disclaimer.title")}</h4>
                <div className="text-sm text-muted-foreground text-left leading-relaxed space-y-3 font-medium">
                  <p>{t("taxComparator.disclaimer.point1")}</p>
                  <p>{t("taxComparator.disclaimer.point2")}</p>
                  <p>{t("taxComparator.disclaimer.point3")}</p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>{t("taxComparator.disclaimer.point3a")}</li>
                    <li>{t("taxComparator.disclaimer.point3b")}</li>
                  </ul>
                  <p className="font-black text-foreground">{t("taxComparator.disclaimer.point4")}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
