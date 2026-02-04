import { useState, useMemo, ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, TrendingUp, Calculator } from "lucide-react";
import { GrowthChartIcon } from "@/components/ui/flags";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import moneyIcon from "@/assets/icons/money-icon.svg";
import { SpainFlag, UKFlag, GermanyFlag, FranceFlag, BulgariaFlag, USAFlag } from "@/components/ui/flags";

interface TaxBreakdown {
  income: number;
  corporateTax: number;
  incomeTax: number;
  socialSecurity: number;
  vat: number;
  total: number;
  netIncome: number;
  effectiveRate: number;
}

type Country = "spain" | "uk" | "germany" | "france" | "bulgaria";

interface CountryInfo {
  id: Country;
  name: string;
  FlagComponent: ComponentType<{ className?: string }>;
  vatRate: number;
  corporateTaxRate: number;
}

const countries: CountryInfo[] = [
  { id: "spain", name: "España", FlagComponent: SpainFlag, vatRate: 21, corporateTaxRate: 25 },
  { id: "uk", name: "Reino Unido", FlagComponent: UKFlag, vatRate: 20, corporateTaxRate: 25 },
  { id: "germany", name: "Alemania", FlagComponent: GermanyFlag, vatRate: 19, corporateTaxRate: 30 },
  { id: "france", name: "Francia", FlagComponent: FranceFlag, vatRate: 20, corporateTaxRate: 25 },
  { id: "bulgaria", name: "Bulgaria", FlagComponent: BulgariaFlag, vatRate: 20, corporateTaxRate: 10 },
];

function calculateTaxes(grossIncome: number, country: Country): TaxBreakdown {
  let corporateTax = 0;
  let incomeTax = 0;
  let socialSecurity = 0;
  let vatRate = 0;

  switch (country) {
    case "spain": {
      // Spain SL (Sociedad Limitada): IS 25% + Cuota autónomos + IRPF dividendos + IVA 21%
      // Cuota autónomos 2024: Base mínima ~300€/mes, máxima ~1,300€/mes
      const monthlyQuota = Math.min(Math.max(grossIncome / 12 * 0.306, 300), 1300);
      socialSecurity = monthlyQuota * 12;
      
      // Impuesto de Sociedades 25% (15% primeros 2 años para nuevas empresas)
      const beneficioBruto = grossIncome - socialSecurity;
      corporateTax = Math.max(beneficioBruto * 0.25, 0);
      
      // Si el socio extrae dividendos: IRPF 19-26% sobre dividendos
      const beneficioNeto = beneficioBruto - corporateTax;
      const dividendos = beneficioNeto * 0.8; // Asumimos 80% se reparte
      // Tramos dividendos: hasta 6000€ (19%), 6000-50000€ (21%), 50000-200000€ (23%), +200000€ (27%)
      let irpfDividendos = 0;
      let restante = dividendos;
      if (restante > 0) {
        const tramo1 = Math.min(restante, 6000);
        irpfDividendos += tramo1 * 0.19;
        restante -= tramo1;
      }
      if (restante > 0) {
        const tramo2 = Math.min(restante, 44000);
        irpfDividendos += tramo2 * 0.21;
        restante -= tramo2;
      }
      if (restante > 0) {
        const tramo3 = Math.min(restante, 150000);
        irpfDividendos += tramo3 * 0.23;
        restante -= tramo3;
      }
      if (restante > 0) {
        irpfDividendos += restante * 0.27;
      }
      incomeTax = irpfDividendos;
      vatRate = 0.21;
      break;
    }

    case "uk": {
      // UK Ltd: Corporation Tax 25% (19% for profits under £50k) + NI + Dividend Tax + VAT 20%
      // Class 2 NI: £3.45/week, Class 4 NI: 9% on profits £12,570-£50,270
      const class2NI = 3.45 * 52;
      const profitsForNI = Math.max(Math.min(grossIncome, 50270) - 12570, 0);
      const class4NI = profitsForNI * 0.09;
      socialSecurity = class2NI + class4NI;
      
      // Corporation Tax: 19% up to £50k, 25% over £250k, marginal between
      if (grossIncome <= 50000) {
        corporateTax = grossIncome * 0.19;
      } else if (grossIncome >= 250000) {
        corporateTax = grossIncome * 0.25;
      } else {
        corporateTax = grossIncome * 0.25 - ((250000 - grossIncome) * 0.015);
      }
      
      // Dividend tax: 8.75% basic, 33.75% higher, 39.35% additional
      const netProfit = grossIncome - corporateTax - socialSecurity;
      const dividends = netProfit * 0.8;
      const taxableDividends = Math.max(dividends - 1000, 0); // £1000 allowance
      incomeTax = taxableDividends * 0.0875;
      vatRate = 0.20;
      break;
    }

    case "germany": {
      // Germany GmbH: Körperschaftsteuer 15% + Solidaritätszuschlag 5.5% + Gewerbesteuer ~14% + Sozialversicherung
      // Total corporate: ~30%
      // Geschäftsführer (director) must pay social security: ~20% employer + ~20% employee
      socialSecurity = Math.min(grossIncome * 0.20, 15000); // Capped at Beitragsbemessungsgrenze
      
      corporateTax = grossIncome * 0.30; // Combined corporate tax rate
      
      // Dividends: Abgeltungssteuer 25% + Soli
      const netProfit = grossIncome - corporateTax - socialSecurity;
      const dividends = netProfit * 0.8;
      incomeTax = dividends * 0.26375; // 25% + 5.5% Soli
      vatRate = 0.19;
      break;
    }

    case "france": {
      // France SARL/SAS: IS 25% (15% up to €42,500) + Cotisations sociales + IR dividendes + TVA 20%
      // Cotisations sociales gérant: ~45% on remuneration
      const remuneration = grossIncome * 0.5; // Assume 50% as salary
      socialSecurity = remuneration * 0.45;
      
      // Impôt sur les sociétés
      const benefice = grossIncome - remuneration;
      if (benefice <= 42500) {
        corporateTax = benefice * 0.15;
      } else {
        corporateTax = 42500 * 0.15 + (benefice - 42500) * 0.25;
      }
      
      // Prélèvement Forfaitaire Unique (PFU) on dividends: 30% (12.8% IR + 17.2% prélèvements sociaux)
      const netProfit = benefice - corporateTax;
      const dividends = netProfit * 0.8;
      incomeTax = dividends * 0.30;
      vatRate = 0.20;
      break;
    }

    case "bulgaria": {
      // Bulgaria EOOD: Corporate tax 10% + Social security ~32% + Dividend tax 5% + VAT 20%
      // Very competitive tax regime
      socialSecurity = Math.min(grossIncome * 0.32, 12000); // Capped
      
      corporateTax = grossIncome * 0.10;
      
      // Dividend tax: flat 5%
      const netProfit = grossIncome - corporateTax - socialSecurity;
      const dividends = netProfit * 0.8;
      incomeTax = dividends * 0.05;
      vatRate = 0.20;
      break;
    }
  }

  const vat = grossIncome * vatRate;
  const total = corporateTax + incomeTax + socialSecurity + vat;
  const netIncome = grossIncome - total;
  const effectiveRate = grossIncome > 0 ? (total / grossIncome) * 100 : 0;

  return {
    income: grossIncome,
    corporateTax: Math.round(corporateTax),
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
    corporateTax: 0,
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
  const [email, setEmail] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [emailError, setEmailError] = useState("");
  
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
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleCalculate = async () => {
    if (!email.trim()) {
      setEmailError(t("taxComparator.emailRequired"));
      return;
    }
    if (!validateEmail(email)) {
      setEmailError(t("taxComparator.emailInvalid"));
      return;
    }
    if (income < 1000) {
      return;
    }
    
    setEmailError("");
    setIsCalculating(true);
    
    // Save consultation to database
    try {
      await apiRequest("POST", "/api/calculator/consultation", {
        email,
        income,
        country: selectedCountry,
        savings: countryTaxes.total - usLLCTaxes.total
      });
    } catch (error) {
      console.error("Error saving consultation:", error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsCalculating(false);
    setShowResults(true);
  };
  
  const handleIncomeChange = (value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    setIncome(Math.min(Math.max(numValue, 0), 500000));
  };
  
  const formatInputCurrency = (value: number) => {
    return value.toLocaleString('es-ES');
  };
  
  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden" id="comparador">
      <div className="w-full px-4 sm:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center">
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1] will-change-transform"
            style={{ fontWeight: 900 }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <span className="text-foreground">{t("taxComparator.titlePart1")}</span><br/>
            <span className="text-foreground">{t("taxComparator.titlePart2")}</span><br/>
            <span className="text-accent">{t("taxComparator.titlePart3")}</span><br/>
            <span className="text-accent">{t("taxComparator.titlePart4")}</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-base sm:text-lg mt-4 text-center max-w-2xl will-change-transform"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {t("taxComparator.subtitle")}
          </motion.p>
          <motion.div 
            className="w-24 h-1 bg-accent mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        
        <motion.div 
          className="max-w-4xl mx-auto will-change-transform"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
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
                    <country.FlagComponent className="w-5 h-5" data-testid={`icon-country-flag-${country.id}`} />
                    <span className="hidden sm:inline" data-testid={`text-country-name-${country.id}`}>{country.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Income Selection */}
            <div className="p-6 sm:p-8 bg-background">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <img src={moneyIcon} alt="" className="w-10 h-10" />
                  <label className="text-base font-black text-foreground">
                    {t("taxComparator.annualIncome")}
                  </label>
                </div>
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatInputCurrency(income)}
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    placeholder="50.000"
                    className="w-full px-6 py-3 text-2xl sm:text-3xl font-black text-accent text-center bg-white dark:bg-[#1A1A1A] border-2 border-accent/30 rounded-full focus:border-accent outline-none transition-colors"
                    data-testid="input-income"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-accent/60">€</span>
                </div>
                <p className="text-xs text-muted-foreground font-bold">{t("taxComparator.enterIncome")}</p>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {!showResults && !isCalculating && (
                <motion.div
                  key="email-input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="p-6 sm:p-8 bg-background will-change-transform flex items-center justify-center min-h-[280px] w-full"
                >
                  <div className="max-w-sm w-full mx-auto text-center flex flex-col items-center">
                    <GrowthChartIcon className="w-16 h-16 mb-4" />
                    <h3 className="text-lg sm:text-xl font-black text-foreground mb-1 text-center w-full">
                      {t("taxComparator.emailTitle")}
                    </h3>
                    <p className="text-muted-foreground font-medium text-sm mb-4">
                      {t("taxComparator.emailSubtitle")}
                    </p>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError("");
                          }}
                          placeholder={t("taxComparator.emailPlaceholder")}
                          className={`w-full px-5 py-3 rounded-full border-2 text-sm ${
                            emailError 
                              ? 'border-destructive focus:border-destructive' 
                              : 'border-accent/30 focus:border-accent'
                          } bg-white dark:bg-[#1A1A1A] text-foreground font-medium text-center outline-none transition-colors`}
                          data-testid="input-email-calculator"
                        />
                        {emailError && (
                          <p className="text-destructive text-xs font-bold mt-1">{emailError}</p>
                        )}
                      </div>
                      <Button
                        onClick={handleCalculate}
                        className="w-full bg-accent text-primary font-black text-sm rounded-full h-11 shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all transform active:scale-95"
                        data-testid="button-calculate"
                      >
                        {t("taxComparator.calculateButton")} →
                      </Button>
                      <p className="text-[10px] text-muted-foreground">
                        {t("taxComparator.emailPrivacy")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {isCalculating && (
                <motion.div
                  key="calculating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="p-12 sm:p-16 bg-background flex flex-col items-center justify-center will-change-transform"
                >
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calculator className="w-10 h-10 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                    {t("taxComparator.calculating")}
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    {t("taxComparator.calculatingSubtitle")}
                  </p>
                  <div className="flex gap-1 mt-6">
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-accent"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-accent"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-accent"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
              
              {showResults && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="will-change-transform"
                >
                  {/* Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* US LLC */}
                    <div className="p-6 sm:p-8 bg-accent/10 border-b md:border-b-0 md:border-r border-accent/20 relative">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center border-2 border-accent/30 shadow-lg">
                          <USAFlag className="w-8 h-8" />
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
                          <span className="text-sm text-muted-foreground font-black">{t("taxComparator.usllc.corporateTax")}</span>
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
                          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center border-2 border-border shadow-lg shrink-0" data-testid="container-selected-country-flag">
                            <selectedCountryInfo.FlagComponent className="w-8 h-8" data-testid={`icon-selected-flag-${selectedCountry}`} />
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
                          <span className="text-sm text-muted-foreground font-black">{t("taxComparator.corporateTax")} ({selectedCountryInfo.corporateTaxRate}%)</span>
                          <span className="font-black text-destructive text-lg">-{formatCurrency(countryTaxes.corporateTax)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-border/50">
                          <span className="text-sm text-muted-foreground font-black">{t("taxComparator.dividendTax")}</span>
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
                </motion.div>
              )}
            </AnimatePresence>
            
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
