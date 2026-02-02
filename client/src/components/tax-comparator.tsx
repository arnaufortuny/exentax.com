import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, TrendingDown, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { SpainFlag, USAFlag as USFlag } from "@/components/ui/flags";

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
    <section className="py-16 sm:py-24 bg-background" id="comparador">
      <div className="w-full px-4 sm:px-8">
        <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-center leading-tight" style={{ fontWeight: 900 }}>
            <span className="text-accent">{t("taxComparator.title")}</span>
          </h2>
          <p className="text-muted-foreground font-medium text-base sm:text-lg mt-3 text-center max-w-xl">
            {t("taxComparator.subtitle")}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <label className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-accent" />
                  {t("taxComparator.annualIncome")}
                </label>
                <div className="text-3xl sm:text-4xl font-black text-foreground">{formatCurrency(income)}</div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {incomePresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setIncome(preset)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      income === preset
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
                    [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                    [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background
                    [&::-moz-range-thumb]:cursor-pointer"
                  data-testid="slider-income"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{t("taxComparator.minIncome")}</span>
                  <span>{t("taxComparator.maxIncome")}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border bg-muted/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                    <SpainFlag />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{t("taxComparator.spanish.title")}</h3>
                    <p className="text-xs text-muted-foreground">{t("taxComparator.spanish.subtitle")}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.spanish.irpf")}</span>
                    <span className="font-bold text-foreground">-{formatCurrency(spanishTaxes.irpf)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.spanish.socialSecurity")}</span>
                    <span className="font-bold text-foreground">-{formatCurrency(spanishTaxes.socialSecurity)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.spanish.vat")}</span>
                    <span className="font-bold text-foreground">-{formatCurrency(spanishTaxes.vat)}</span>
                  </div>
                  <div className="pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{t("taxComparator.totalTaxes")}</span>
                      <span className="font-black text-foreground text-xl">-{formatCurrency(spanishTaxes.total)}</span>
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium border border-border">
                        {spanishTaxes.effectiveRate}% {t("taxComparator.effectiveRate")}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted rounded-2xl p-4 mt-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{t("taxComparator.netIncome")}</p>
                    <p className="font-black text-foreground text-2xl">{formatCurrency(spanishTaxes.netIncome)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 bg-accent/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                    <USFlag />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{t("taxComparator.usllc.title")}</h3>
                    <p className="text-xs text-muted-foreground">{t("taxComparator.usllc.subtitle")}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 0%
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-accent/20">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.usllc.federalTax")}</span>
                    <span className="font-bold text-accent">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-accent/20">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.usllc.selfEmployment")}</span>
                    <span className="font-bold text-accent">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-accent/20">
                    <span className="text-sm text-muted-foreground">{t("taxComparator.usllc.vat")}</span>
                    <span className="font-bold text-accent">{formatCurrency(0)}</span>
                  </div>
                  <div className="pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{t("taxComparator.totalTaxes")}</span>
                      <span className="font-black text-accent text-xl">{formatCurrency(0)}</span>
                    </div>
                  </div>
                  <div className="bg-accent/10 rounded-2xl p-4 mt-4 border border-accent/20">
                    <p className="text-xs text-muted-foreground mb-1">{t("taxComparator.netIncome")}</p>
                    <p className="font-black text-accent text-2xl">{formatCurrency(usLLCTaxes.netIncome)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 bg-accent/10 border-t border-border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
                    <TrendingDown className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("taxComparator.savings.label")}</p>
                    <p className="font-black text-accent text-3xl sm:text-4xl">{formatCurrency(savings)}</p>
                    <p className="text-sm text-muted-foreground">{t("taxComparator.savings.percentage", { percentage: Math.round(savingsPercentage) })}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation("/llc/formation")}
                  className="bg-accent text-accent-foreground font-bold text-base rounded-full px-8 h-12 w-full md:w-auto"
                  data-testid="button-start-llc-comparator"
                >
                  {t("taxComparator.cta")}
                </Button>
              </div>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors border-t border-border"
              data-testid="button-toggle-details"
            >
              {showDetails ? t("taxComparator.hideDetails") : t("taxComparator.showDetails")}
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showDetails && (
              <div className="p-6 sm:p-8 border-t border-border bg-muted/30">
                <h4 className="font-black text-foreground mb-4">{t("taxComparator.disclaimer.title")}</h4>
                <div className="text-sm text-muted-foreground text-left leading-relaxed space-y-3">
                  <p>{t("taxComparator.disclaimer.point1")}</p>
                  <p>{t("taxComparator.disclaimer.point2")}</p>
                  <p>{t("taxComparator.disclaimer.point3")}</p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>{t("taxComparator.disclaimer.point3a")}</li>
                    <li>{t("taxComparator.disclaimer.point3b")}</li>
                  </ul>
                  <p className="font-medium text-foreground">{t("taxComparator.disclaimer.point4")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
