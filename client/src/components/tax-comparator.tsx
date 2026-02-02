import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const SpainFlag = () => (
  <svg viewBox="0 0 512 512" className="w-8 h-8 rounded-full shadow-sm">
    <rect y="0" width="512" height="170.67" fill="#c60b1e"/>
    <rect y="170.67" width="512" height="170.67" fill="#ffc400"/>
    <rect y="341.33" width="512" height="170.67" fill="#c60b1e"/>
  </svg>
);

const USFlag = () => (
  <svg viewBox="0 0 512 512" className="w-8 h-8 rounded-full shadow-sm">
    <rect width="512" height="512" fill="#bf0a30"/>
    <rect y="39.4" width="512" height="39.4" fill="#fff"/>
    <rect y="118.2" width="512" height="39.4" fill="#fff"/>
    <rect y="197" width="512" height="39.4" fill="#fff"/>
    <rect y="275.8" width="512" height="39.4" fill="#fff"/>
    <rect y="354.6" width="512" height="39.4" fill="#fff"/>
    <rect y="433.4" width="512" height="39.4" fill="#fff"/>
    <rect width="204.8" height="275.8" fill="#002868"/>
  </svg>
);

interface TaxBreakdown {
  income: number;
  irpf: number;
  socialSecurity: number;
  vat: number;
  corporateTax: number;
  total: number;
  netIncome: number;
  effectiveRate: number;
}

function calculateSpanishTaxes(grossIncome: number): TaxBreakdown {
  const socialSecurity = Math.min(Math.max(grossIncome * 0.30, 3600), 16000);
  
  const taxableIncome = grossIncome - socialSecurity;
  
  let irpf = 0;
  const brackets = [
    { limit: 12450, rate: 0.19 },
    { limit: 20200, rate: 0.24 },
    { limit: 35200, rate: 0.30 },
    { limit: 60000, rate: 0.37 },
    { limit: 300000, rate: 0.45 },
    { limit: Infinity, rate: 0.47 }
  ];
  
  let remainingIncome = Math.max(taxableIncome, 0);
  let previousLimit = 0;
  
  for (const bracket of brackets) {
    const taxableInBracket = Math.min(remainingIncome, bracket.limit - previousLimit);
    if (taxableInBracket > 0) {
      irpf += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
    previousLimit = bracket.limit;
    if (remainingIncome <= 0) break;
  }
  
  // IVA 21% - se calcula sobre los ingresos brutos
  const vat = grossIncome * 0.21;
  
  const total = irpf + socialSecurity + vat;
  const netIncome = grossIncome - total;
  const effectiveRate = grossIncome > 0 ? (total / grossIncome) * 100 : 0;
  
  return {
    income: grossIncome,
    irpf: Math.round(irpf),
    socialSecurity: Math.round(socialSecurity),
    vat: Math.round(vat),
    corporateTax: 0,
    total: Math.round(total),
    netIncome: Math.round(netIncome),
    effectiveRate: Math.round(effectiveRate * 10) / 10
  };
}

function calculateUSLLCTaxes(grossIncome: number): TaxBreakdown {
  const netIncome = grossIncome;
  const effectiveRate = 0;
  
  return {
    income: grossIncome,
    irpf: 0,
    socialSecurity: 0,
    vat: 0,
    corporateTax: 0,
    total: 0,
    netIncome: Math.round(netIncome),
    effectiveRate
  };
}

export function TaxComparator() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [income, setIncome] = useState(50000);
  const [showDetails, setShowDetails] = useState(false);
  
  const spanishTaxes = useMemo(() => calculateSpanishTaxes(income), [income]);
  const usLLCTaxes = useMemo(() => calculateUSLLCTaxes(income), [income]);
  const savings = spanishTaxes.total - usLLCTaxes.total;
  const savingsPercentage = spanishTaxes.income > 0 ? (savings / spanishTaxes.income) * 100 : 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const incomePresets = [30000, 50000, 75000, 100000, 150000];
  
  return (
    <section className="py-12 sm:py-20 bg-accent/5 border-t border-accent/10" id="comparador">
      <div className="w-full px-4 sm:px-8">
        <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center">
          <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent text-accent-foreground font-black text-xs sm:text-sm tracking-widest shadow-md mb-4">
            <Calculator className="w-4 h-4 mr-2" />
            {t("taxComparator.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-center leading-tight">
            {t("taxComparator.title")}
          </h2>
          <p className="text-accent font-black tracking-wide text-base sm:text-lg mt-2 text-center max-w-2xl">
            {t("taxComparator.subtitle")}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-2xl border-2 border-accent/20 shadow-xl overflow-hidden">
            <div className="p-5 sm:p-8 border-b border-accent/10">
              <label className="block text-sm font-black text-foreground mb-4">
                {t("taxComparator.annualIncome")}
              </label>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {incomePresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setIncome(preset)}
                    className={`px-4 py-2 rounded-full text-sm font-black transition-all ${
                      income === preset
                        ? 'bg-accent text-accent-foreground shadow-md'
                        : 'bg-accent/10 text-foreground hover:bg-accent/20'
                    }`}
                    data-testid={`button-preset-${preset}`}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="20000"
                  max="200000"
                  step="5000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer bg-accent/20 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white
                    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full 
                    [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white
                    [&::-moz-range-thumb]:cursor-pointer"
                  data-testid="slider-income"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{t("taxComparator.minIncome")}</span>
                  <span className="font-black text-accent text-lg">{formatCurrency(income)}</span>
                  <span>{t("taxComparator.maxIncome")}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-accent/10">
              <div className="p-5 sm:p-8 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center overflow-hidden">
                    <SpainFlag />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-lg">{t("taxComparator.spanish.title")}</h3>
                    <p className="text-xs text-muted-foreground">{t("taxComparator.spanish.subtitle")}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.spanish.irpf")}</span>
                    <span className="font-black text-red-600 dark:text-red-400">{formatCurrency(spanishTaxes.irpf)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.spanish.socialSecurity")}</span>
                    <span className="font-black text-red-600 dark:text-red-400">{formatCurrency(spanishTaxes.socialSecurity)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.spanish.vat")}</span>
                    <span className="font-black text-red-600 dark:text-red-400">{formatCurrency(spanishTaxes.vat)}</span>
                  </div>
                  <div className="border-t border-red-200 dark:border-red-800 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground">{t("taxComparator.totalTaxes")}</span>
                      <span className="font-black text-red-600 dark:text-red-400 text-xl">{formatCurrency(spanishTaxes.total)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">{t("taxComparator.effectiveRate")}</span>
                      <span className="font-black text-red-600 dark:text-red-400">{spanishTaxes.effectiveRate}%</span>
                    </div>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/50 rounded-xl p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-red-900 dark:text-red-100">{t("taxComparator.netIncome")}</span>
                      <span className="font-black text-red-900 dark:text-red-100 text-xl">{formatCurrency(spanishTaxes.netIncome)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 sm:p-8 bg-accent/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
                    <USFlag />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-lg">{t("taxComparator.usllc.title")}</h3>
                    <p className="text-xs text-muted-foreground">{t("taxComparator.usllc.subtitle")}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.usllc.federalTax")}</span>
                    <span className="font-black text-accent">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.usllc.selfEmployment")}</span>
                    <span className="font-black text-accent">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.usllc.vat")}</span>
                    <span className="font-black text-accent">{formatCurrency(0)}</span>
                  </div>
                  <div className="border-t border-accent/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground">{t("taxComparator.totalTaxes")}</span>
                      <span className="font-black text-accent text-xl">{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">{t("taxComparator.effectiveRate")}</span>
                      <span className="font-black text-accent">0%</span>
                    </div>
                  </div>
                  <div className="bg-accent/20 rounded-xl p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground">{t("taxComparator.netIncome")}</span>
                      <span className="font-black text-accent text-xl">{formatCurrency(usLLCTaxes.netIncome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 sm:p-8 bg-accent/10 border-t border-accent/20">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg">
                    <TrendingDown className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{t("taxComparator.savings.label")}</p>
                  <p className="font-black text-accent text-3xl sm:text-4xl">{formatCurrency(savings)}</p>
                  <p className="text-sm text-muted-foreground">{t("taxComparator.savings.percentage", { percentage: Math.round(savingsPercentage) })}</p>
                </div>
                <Button
                  onClick={() => setLocation("/llc/formation")}
                  className="bg-accent text-accent-foreground font-black text-sm rounded-full px-8 py-6 h-14 shadow-md hover:bg-accent/90 transition-all transform hover:scale-105 active:scale-95 shadow-accent/20 w-full sm:w-auto mt-2"
                  data-testid="button-start-llc-comparator"
                >
                  {t("taxComparator.cta")} →
                </Button>
              </div>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 flex items-center justify-center gap-2 text-sm font-black text-muted-foreground hover:text-foreground transition-colors border-t border-accent/10"
              data-testid="button-toggle-details"
            >
              {showDetails ? t("taxComparator.hideDetails") : t("taxComparator.showDetails")}
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showDetails && (
              <div className="p-5 sm:p-8 border-t border-accent/10 bg-muted/30">
                <h4 className="font-black text-foreground mb-4">{t("taxComparator.disclaimer.title")}</h4>
                <p className="text-sm text-muted-foreground text-left leading-relaxed">
                  {t("taxComparator.disclaimer.point1")} {t("taxComparator.disclaimer.point2")} {t("taxComparator.disclaimer.point3")} {t("taxComparator.disclaimer.point4")}
                </p>
                <p className="mt-4 text-xs text-muted-foreground italic text-left">
                  {t("taxComparator.disclaimer.note")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
