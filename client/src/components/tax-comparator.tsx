import { useState, useMemo, ComponentType, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, TrendingUp, Calculator } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { getLocale } from "@/lib/utils";
import { validateEmail } from "@/lib/validation";
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
type ActivityType = "ecommerce" | "dropshipping" | "consulting" | "marketing" | "software" | "saas" | "apps" | "ai" | "investments" | "tradingEducation" | "financial" | "crypto" | "realestate" | "import" | "coaching" | "content" | "affiliate" | "freelance" | "gaming" | "digitalProducts" | "other";
type StructureType = "autonomo" | "company";

interface CountryInfo {
  id: Country;
  name: string;
  FlagComponent: ComponentType<{ className?: string }>;
  vatRate: number;
  corporateTaxRate: number;
}

const countryData: Omit<CountryInfo, 'name'>[] = [
  { id: "spain", FlagComponent: SpainFlag, vatRate: 21, corporateTaxRate: 25 },
  { id: "uk", FlagComponent: UKFlag, vatRate: 20, corporateTaxRate: 25 },
  { id: "germany", FlagComponent: GermanyFlag, vatRate: 19, corporateTaxRate: 30 },
  { id: "france", FlagComponent: FranceFlag, vatRate: 20, corporateTaxRate: 25 },
  { id: "bulgaria", FlagComponent: BulgariaFlag, vatRate: 20, corporateTaxRate: 10 },
];

function getDeductibleExpenses(grossIncome: number, activity: ActivityType): number {
  const rates: Record<ActivityType, number> = {
    ecommerce: 0.35,
    dropshipping: 0.40,
    consulting: 0.10,
    marketing: 0.18,
    software: 0.15,
    saas: 0.20,
    apps: 0.22,
    ai: 0.20,
    investments: 0.05,
    tradingEducation: 0.12,
    financial: 0.08,
    crypto: 0.05,
    realestate: 0.25,
    import: 0.45,
    coaching: 0.12,
    content: 0.15,
    affiliate: 0.08,
    freelance: 0.10,
    gaming: 0.25,
    digitalProducts: 0.15,
    other: 0.15,
  };
  return grossIncome * (rates[activity] || 0.15);
}

function calculateTaxesAutonomo(grossIncome: number, country: Country, activity: ActivityType): TaxBreakdown {
  let incomeTax = 0;
  let socialSecurity = 0;
  let vatRate = 0;

  const expenses = getDeductibleExpenses(grossIncome, activity);
  const taxableIncome = Math.max(grossIncome - expenses, 0);

  switch (country) {
    case "spain": {
      const monthlyIncome = taxableIncome / 12;
      let monthlyQuota: number;
      if (monthlyIncome <= 670) monthlyQuota = 230;
      else if (monthlyIncome <= 900) monthlyQuota = 260;
      else if (monthlyIncome <= 1166.70) monthlyQuota = 275;
      else if (monthlyIncome <= 1300) monthlyQuota = 291;
      else if (monthlyIncome <= 1500) monthlyQuota = 294;
      else if (monthlyIncome <= 1700) monthlyQuota = 294;
      else if (monthlyIncome <= 1850) monthlyQuota = 310;
      else if (monthlyIncome <= 2030) monthlyQuota = 315;
      else if (monthlyIncome <= 2330) monthlyQuota = 320;
      else if (monthlyIncome <= 2760) monthlyQuota = 330;
      else if (monthlyIncome <= 3190) monthlyQuota = 350;
      else if (monthlyIncome <= 3620) monthlyQuota = 370;
      else if (monthlyIncome <= 4050) monthlyQuota = 390;
      else if (monthlyIncome <= 6000) monthlyQuota = 400;
      else monthlyQuota = 530;
      socialSecurity = monthlyQuota * 12;

      const base = Math.max(taxableIncome - socialSecurity, 0);
      let irpf = 0;
      let rest = base;
      if (rest > 0) { const t1 = Math.min(rest, 12450); irpf += t1 * 0.19; rest -= t1; }
      if (rest > 0) { const t2 = Math.min(rest, 7750); irpf += t2 * 0.24; rest -= t2; }
      if (rest > 0) { const t3 = Math.min(rest, 15000); irpf += t3 * 0.30; rest -= t3; }
      if (rest > 0) { const t4 = Math.min(rest, 24800); irpf += t4 * 0.37; rest -= t4; }
      if (rest > 0) { const t5 = Math.min(rest, 240000); irpf += t5 * 0.45; rest -= t5; }
      if (rest > 0) { irpf += rest * 0.47; }
      incomeTax = irpf;
      vatRate = 0.21;
      break;
    }
    case "uk": {
      const class2NI = 3.45 * 52;
      const profitsForNI = Math.max(Math.min(taxableIncome, 50270) - 12570, 0);
      const class4NI = profitsForNI * 0.06;
      const upperNI = Math.max(taxableIncome - 50270, 0) * 0.02;
      socialSecurity = class2NI + class4NI + upperNI;

      let tax = 0;
      let rest = Math.max(taxableIncome - 12570, 0);
      if (rest > 0) { const b = Math.min(rest, 37700); tax += b * 0.20; rest -= b; }
      if (rest > 0) { const h = Math.min(rest, 87440); tax += h * 0.40; rest -= h; }
      if (rest > 0) { tax += rest * 0.45; }
      incomeTax = tax;
      vatRate = 0.20;
      break;
    }
    case "germany": {
      const beitragsBemessungsgrenze = 90600;
      const healthInsBase = Math.min(taxableIncome, 62100);
      const pensionBase = Math.min(taxableIncome, beitragsBemessungsgrenze);
      const healthIns = healthInsBase * 0.146 * 0.5 + healthInsBase * 0.017;
      const pensionIns = pensionBase * 0.186 * 0.5;
      const unemploymentIns = Math.min(taxableIncome, beitragsBemessungsgrenze) * 0.026 * 0.5;
      socialSecurity = healthIns + pensionIns + unemploymentIns;

      let tax = 0;
      const zvE = Math.max(taxableIncome - socialSecurity, 0);
      if (zvE <= 11604) { tax = 0; }
      else if (zvE <= 17005) { const y = (zvE - 11604) / 10000; tax = (922.98 * y + 1400) * y; }
      else if (zvE <= 66760) { const z = (zvE - 17005) / 10000; tax = (181.19 * z + 2397) * z + 1025.38; }
      else if (zvE <= 277825) { tax = zvE * 0.42 - 10602.13; }
      else { tax = zvE * 0.45 - 18936.88; }
      tax += tax * 0.055;
      incomeTax = Math.max(tax, 0);
      vatRate = 0.19;
      break;
    }
    case "france": {
      const csgsNonDeductible = taxableIncome * 0.024;
      const csgDeductible = taxableIncome * 0.068;
      const crds = taxableIncome * 0.005;
      const maladie = taxableIncome * 0.065;
      const retraiteBase = Math.min(taxableIncome, 46368) * 0.1775;
      const retraiteCompl = taxableIncome * 0.07;
      const allocFamiliales = taxableIncome > 46368 ? taxableIncome * 0.031 : 0;
      const formationPro = taxableIncome * 0.0025;
      socialSecurity = csgsNonDeductible + csgDeductible + crds + maladie + retraiteBase + retraiteCompl + allocFamiliales + formationPro;

      const baseImposable = Math.max(taxableIncome - socialSecurity, 0);
      let tax = 0;
      let rest = baseImposable;
      if (rest > 0) { const t1 = Math.min(rest, 11294); tax += t1 * 0; rest -= t1; }
      if (rest > 0) { const t2 = Math.min(rest, 17468); tax += t2 * 0.11; rest -= t2; }
      if (rest > 0) { const t3 = Math.min(rest, 52818); tax += t3 * 0.30; rest -= t3; }
      if (rest > 0) { const t4 = Math.min(rest, 96420); tax += t4 * 0.41; rest -= t4; }
      if (rest > 0) { tax += rest * 0.45; }
      incomeTax = tax;
      vatRate = 0.20;
      break;
    }
    case "bulgaria": {
      const maxSSBase = 3750 * 12;
      const minSSBase = 933 * 12;
      const ssIncome = Math.min(Math.max(taxableIncome, minSSBase), maxSSBase);
      const pension = ssIncome * 0.1958;
      const health = ssIncome * 0.032;
      const unemployment = ssIncome * 0.004;
      socialSecurity = pension + health + unemployment;

      incomeTax = Math.max(taxableIncome - socialSecurity, 0) * 0.10;
      vatRate = 0.20;
      break;
    }
  }

  const vat = grossIncome * vatRate;
  const total = incomeTax + socialSecurity;
  const netIncome = grossIncome - total;
  const effectiveRate = grossIncome > 0 ? (total / grossIncome) * 100 : 0;

  return {
    income: grossIncome,
    corporateTax: 0,
    incomeTax: Math.round(incomeTax),
    socialSecurity: Math.round(socialSecurity),
    vat: Math.round(vat),
    total: Math.round(total),
    netIncome: Math.round(netIncome),
    effectiveRate: Math.round(effectiveRate * 10) / 10
  };
}

function calculateTaxes(grossIncome: number, country: Country, activity: ActivityType): TaxBreakdown {
  let corporateTax = 0;
  let incomeTax = 0;
  let socialSecurity = 0;
  let vatRate = 0;

  const expenses = getDeductibleExpenses(grossIncome, activity);
  const taxableIncome = Math.max(grossIncome - expenses, 0);

  switch (country) {
    case "spain": {
      const monthlyIncome = taxableIncome / 12;
      let monthlyQuota: number;
      if (monthlyIncome <= 670) monthlyQuota = 230;
      else if (monthlyIncome <= 900) monthlyQuota = 260;
      else if (monthlyIncome <= 1166.70) monthlyQuota = 275;
      else if (monthlyIncome <= 1300) monthlyQuota = 291;
      else if (monthlyIncome <= 1500) monthlyQuota = 294;
      else if (monthlyIncome <= 1700) monthlyQuota = 294;
      else if (monthlyIncome <= 1850) monthlyQuota = 310;
      else if (monthlyIncome <= 2030) monthlyQuota = 315;
      else if (monthlyIncome <= 2330) monthlyQuota = 320;
      else if (monthlyIncome <= 2760) monthlyQuota = 330;
      else if (monthlyIncome <= 3190) monthlyQuota = 350;
      else if (monthlyIncome <= 3620) monthlyQuota = 370;
      else if (monthlyIncome <= 4050) monthlyQuota = 390;
      else if (monthlyIncome <= 6000) monthlyQuota = 400;
      else monthlyQuota = 530;
      socialSecurity = monthlyQuota * 12;

      const beneficioBruto = Math.max(taxableIncome - socialSecurity, 0);
      if (beneficioBruto <= 50000) {
        corporateTax = beneficioBruto * 0.23;
      } else {
        corporateTax = 50000 * 0.23 + (beneficioBruto - 50000) * 0.25;
      }

      const beneficioNeto = Math.max(beneficioBruto - corporateTax, 0);
      const dividendos = beneficioNeto * 0.8;
      let irpfDividendos = 0;
      let restante = dividendos;
      if (restante > 0) { const t1 = Math.min(restante, 6000); irpfDividendos += t1 * 0.19; restante -= t1; }
      if (restante > 0) { const t2 = Math.min(restante, 44000); irpfDividendos += t2 * 0.21; restante -= t2; }
      if (restante > 0) { const t3 = Math.min(restante, 150000); irpfDividendos += t3 * 0.23; restante -= t3; }
      if (restante > 0) { const t4 = Math.min(restante, 100000); irpfDividendos += t4 * 0.27; restante -= t4; }
      if (restante > 0) { irpfDividendos += restante * 0.28; }
      incomeTax = irpfDividendos;
      vatRate = 0.21;
      break;
    }

    case "uk": {
      const class2NI = 3.45 * 52;
      const profitsForNI = Math.max(Math.min(taxableIncome, 50270) - 12570, 0);
      const class4NI = profitsForNI * 0.06;
      const upperNI = Math.max(taxableIncome - 50270, 0) * 0.02;
      socialSecurity = class2NI + class4NI + upperNI;

      if (taxableIncome <= 50000) {
        corporateTax = taxableIncome * 0.19;
      } else if (taxableIncome >= 250000) {
        corporateTax = taxableIncome * 0.25;
      } else {
        const marginalRelief = (250000 - taxableIncome) * 1.5 / 100;
        corporateTax = taxableIncome * 0.25 - marginalRelief;
      }

      const netProfit = Math.max(taxableIncome - corporateTax - socialSecurity, 0);
      const dividends = netProfit * 0.8;
      const taxableDividends = Math.max(dividends - 500, 0);
      let dividendTax = 0;
      let rem = taxableDividends;
      const basicBand = Math.max(37700 - 12570, 0);
      if (rem > 0) { const b = Math.min(rem, basicBand); dividendTax += b * 0.0875; rem -= b; }
      if (rem > 0) { const h = Math.min(rem, 87440); dividendTax += h * 0.3375; rem -= h; }
      if (rem > 0) { dividendTax += rem * 0.3935; }
      incomeTax = dividendTax;
      vatRate = 0.20;
      break;
    }

    case "germany": {
      const beitragsBemessungsgrenze = 90600;
      const healthInsBase = Math.min(taxableIncome, 62100);
      const pensionBase = Math.min(taxableIncome, beitragsBemessungsgrenze);
      const healthIns = healthInsBase * 0.146 * 0.5 + healthInsBase * 0.017;
      const pensionIns = pensionBase * 0.186 * 0.5;
      const unemploymentIns = Math.min(taxableIncome, beitragsBemessungsgrenze) * 0.026 * 0.5;
      socialSecurity = healthIns + pensionIns + unemploymentIns;

      const koerperschaftsteuer = taxableIncome * 0.1583;
      const gewerbesteuer = taxableIncome * 0.14;
      corporateTax = koerperschaftsteuer + gewerbesteuer;

      const netProfit = Math.max(taxableIncome - corporateTax - socialSecurity, 0);
      const dividends = netProfit * 0.8;
      incomeTax = dividends * 0.26375;
      vatRate = 0.19;
      break;
    }

    case "france": {
      const remuneration = taxableIncome * 0.5;
      const csgsNonDeductible = remuneration * 0.024;
      const csgDeductible = remuneration * 0.068;
      const crds = remuneration * 0.005;
      const maladie = remuneration * 0.065;
      const retraiteBase = Math.min(remuneration, 46368) * 0.1775;
      const retraiteCompl = remuneration * 0.07;
      const allocFamiliales = remuneration > 46368 ? remuneration * 0.031 : 0;
      const formationPro = remuneration * 0.0025;
      socialSecurity = csgsNonDeductible + csgDeductible + crds + maladie + retraiteBase + retraiteCompl + allocFamiliales + formationPro;

      const benefice = taxableIncome - remuneration;
      if (benefice <= 42500) {
        corporateTax = benefice * 0.15;
      } else {
        corporateTax = 42500 * 0.15 + (benefice - 42500) * 0.25;
      }

      const netProfit = Math.max(benefice - corporateTax, 0);
      const dividends = netProfit * 0.8;
      const flatTax = dividends * 0.128;
      const socialLevy = dividends * 0.172;
      incomeTax = flatTax + socialLevy;
      vatRate = 0.20;
      break;
    }

    case "bulgaria": {
      const maxSSBase = 3750 * 12;
      const minSSBase = 933 * 12;
      const ssIncome = Math.min(Math.max(taxableIncome, minSSBase), maxSSBase);
      const pension = ssIncome * 0.1958;
      const health = ssIncome * 0.032;
      const unemployment = ssIncome * 0.004;
      socialSecurity = pension + health + unemployment;

      corporateTax = taxableIncome * 0.10;

      const netProfit = Math.max(taxableIncome - corporateTax - socialSecurity, 0);
      const dividends = netProfit * 0.8;
      incomeTax = dividends * 0.05;
      vatRate = 0.20;
      break;
    }
  }

  const vat = grossIncome * vatRate;
  const total = corporateTax + incomeTax + socialSecurity;
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

function calculateUSLLCTaxes(grossIncome: number, activity: ActivityType): TaxBreakdown {
  const expenses = getDeductibleExpenses(grossIncome, activity);
  const accountingCost = 1500;
  const agentFee = 150;
  const totalCosts = accountingCost + agentFee;

  return {
    income: grossIncome,
    corporateTax: 0,
    incomeTax: 0,
    socialSecurity: 0,
    vat: 0,
    total: Math.round(totalCosts),
    netIncome: Math.round(grossIncome - totalCosts),
    effectiveRate: grossIncome > 0 ? Math.round((totalCosts / grossIncome) * 1000) / 10 : 0
  };
}

interface TaxComparatorProps {
  titleOverride?: { part1: string; part2: string; part3: string; part4: string };
  subtitleOverride?: string;
}

export function TaxComparator({ titleOverride, subtitleOverride }: TaxComparatorProps = {}) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [income, setIncome] = useState(50000);
  const [selectedCountry, setSelectedCountry] = useState<Country>("spain");
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>("ecommerce");
  const [selectedStructure, setSelectedStructure] = useState<StructureType>("autonomo");
  const [showDetails, setShowDetails] = useState(false);
  const [email, setEmail] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  const countries: CountryInfo[] = useMemo(() => 
    countryData.map(c => ({ ...c, name: t(`taxComparator.countries.${c.id}.title`) })),
    [t]
  );
  
  const countryTaxes = useMemo(() => 
    selectedStructure === "autonomo" 
      ? calculateTaxesAutonomo(income, selectedCountry, selectedActivity)
      : calculateTaxes(income, selectedCountry, selectedActivity), 
    [income, selectedCountry, selectedActivity, selectedStructure]
  );
  const usLLCTaxes = useMemo(() => calculateUSLLCTaxes(income, selectedActivity), [income, selectedActivity]);
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
        activity: selectedActivity,
        structure: selectedStructure,
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
  
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIncome(parseInt(e.target.value));
  };

  const activityTypes: ActivityType[] = ["ecommerce", "dropshipping", "consulting", "marketing", "software", "saas", "apps", "ai", "investments", "tradingEducation", "financial", "crypto", "realestate", "import", "coaching", "content", "affiliate", "freelance", "gaming", "digitalProducts", "other"];
  
  const formatInputCurrency = (value: number) => {
    return value.toLocaleString(getLocale());
  };
  
  return (
    <section className="py-16 sm:py-24 lg:py-16 bg-background relative overflow-hidden" id="comparador">
      <div className="w-full px-4 sm:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-14 lg:mb-10 flex flex-col items-center justify-center">
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]"
            style={{ fontWeight: 900 }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <span className="text-foreground">{titleOverride?.part1 ?? t("taxComparator.titlePart1")}</span><br/>
            <span className="text-foreground">{titleOverride?.part2 ?? t("taxComparator.titlePart2")}</span><br/>
            <span className="text-accent">{titleOverride?.part3 ?? t("taxComparator.titlePart3")}</span><br/>
            <span className="text-accent">{titleOverride?.part4 ?? t("taxComparator.titlePart4")}</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-base sm:text-lg lg:text-sm mt-4 text-center max-w-2xl lg:max-w-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {subtitleOverride ?? t("taxComparator.subtitle")}
          </motion.p>
          <motion.div 
            className="w-24 h-1 bg-accent mt-6 lg:mt-4 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        
        <motion.div 
          className="max-w-4xl lg:max-w-xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="bg-background rounded-3xl border-2 border-accent/20 shadow-2xl shadow-accent/10 overflow-hidden">
            {/* Country Selection */}
            <div className="p-6 sm:p-8 lg:p-5 border-b border-accent/10">
              <h3 className="text-xl sm:text-2xl lg:text-lg font-black text-foreground mb-4 lg:mb-3 text-center">
                {t("taxComparator.selectCountry")}
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {countries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                      selectedCountry === country.id
                        ? 'bg-accent text-accent-foreground shadow-md shadow-accent/30'
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
            
            {/* Business Structure Selection */}
            <div className="p-6 sm:p-8 lg:p-5 border-b border-accent/10">
              <h3 className="text-xl sm:text-2xl lg:text-lg font-black text-foreground mb-4 lg:mb-3 text-center uppercase">
                {t("taxComparator.selectStructure")}
              </h3>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setSelectedStructure("autonomo")}
                  className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-black transition-colors ${
                    selectedStructure === "autonomo"
                      ? 'bg-accent text-accent-foreground shadow-md shadow-accent/30'
                      : 'bg-background text-foreground border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/5'
                  }`}
                  data-testid="button-structure-autonomo"
                >
                  {t(`taxComparator.structures.${selectedCountry}.autonomo`)}
                </button>
                <button
                  onClick={() => setSelectedStructure("company")}
                  className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-black transition-colors ${
                    selectedStructure === "company"
                      ? 'bg-accent text-accent-foreground shadow-md shadow-accent/30'
                      : 'bg-background text-foreground border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/5'
                  }`}
                  data-testid="button-structure-company"
                >
                  {t(`taxComparator.structures.${selectedCountry}.company`)}
                </button>
              </div>
            </div>

            {/* Income Selection */}
            <div className="p-6 sm:p-8 lg:p-5 bg-background">
              <div className="flex flex-col items-center gap-3 lg:gap-2">
                <div className="flex items-center gap-3 lg:gap-2">
                  <img src={moneyIcon} alt="" className="w-8 h-8 lg:w-7 lg:h-7" />
                  <label className="text-base lg:text-sm font-black text-foreground">
                    {t("taxComparator.annualIncome")}
                  </label>
                </div>
                <div className="relative w-full max-w-xs sm:max-w-md">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatInputCurrency(income)}
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    className="w-full px-6 py-2 lg:px-4 lg:py-1.5 text-xl sm:text-2xl lg:text-lg font-black text-accent text-center bg-white dark:bg-card border-2 border-accent/30 rounded-full focus:border-accent outline-none transition-colors"
                    data-testid="input-income"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-black text-accent/60">€</span>
                </div>
                <div className="w-full max-w-xs sm:max-w-md px-2">
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={income}
                    onChange={handleSliderChange}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-accent/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0"
                    data-testid="slider-income"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-bold mt-1">
                    <span>10.000 €</span>
                    <span>500.000 €</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity Type Selection */}
            <div className="p-6 sm:p-8 lg:p-5 bg-background border-t border-accent/10">
              <div className="flex flex-col items-center gap-3">
                <label className="text-base lg:text-sm font-black text-foreground">
                  {t("taxComparator.activityType")}
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value as ActivityType)}
                  className="w-full max-w-xs sm:max-w-md px-5 py-3 lg:px-4 lg:py-2 text-sm font-bold bg-white dark:bg-card border-2 border-accent/30 rounded-full focus:border-accent outline-none transition-colors text-foreground text-center appearance-none cursor-pointer"
                  data-testid="select-activity-type"
                >
                  {activityTypes.map((act) => (
                    <option key={act} value={act}>
                      {t(`taxComparator.activities.${act}`)}
                    </option>
                  ))}
                </select>
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
                  className="p-6 sm:p-8 lg:p-5 bg-background flex items-center justify-center min-h-[280px] lg:min-h-[220px] w-full"
                >
                  <div className="max-w-md sm:max-w-lg w-full mx-auto text-center flex flex-col items-center">
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
                          } bg-white dark:bg-card text-foreground font-medium text-left outline-none transition-colors`}
                          data-testid="input-email-calculator"
                        />
                        {emailError && (
                          <p className="text-destructive text-xs font-bold mt-1">{emailError}</p>
                        )}
                      </div>
                      <Button
                        onClick={handleCalculate}
                        className="w-full bg-accent text-accent-foreground font-black text-sm rounded-full h-11 shadow-lg shadow-accent/30 transition-all"
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
                  className="p-12 sm:p-16 bg-background flex flex-col items-center justify-center"
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
                  className=""
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
                        <p className="text-sm text-accent-foreground/80 mb-1 font-black">{t("taxComparator.netIncome")}</p>
                        <p className="font-black text-accent-foreground text-3xl">{formatCurrency(usLLCTaxes.netIncome)}</p>
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
                            <p className="text-sm text-muted-foreground font-bold">{t(`taxComparator.structures.${selectedCountry}.${selectedStructure}`)}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-destructive/15 border border-destructive/30 shrink-0">
                          <span className="text-destructive text-xs font-black whitespace-nowrap">
                            {countryTaxes.effectiveRate}% {t("taxComparator.effectiveRate")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedStructure === "company" ? (
                          <>
                            <div className="flex justify-between items-center py-3 border-b border-border/50">
                              <span className="text-sm text-muted-foreground font-black">{t("taxComparator.corporateTax")} ({selectedCountryInfo.corporateTaxRate}%)</span>
                              <span className="font-black text-destructive text-lg">-{formatCurrency(countryTaxes.corporateTax)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-border/50">
                              <span className="text-sm text-muted-foreground font-black">{t("taxComparator.dividendTax")}</span>
                              <span className="font-black text-destructive text-lg">-{formatCurrency(countryTaxes.incomeTax)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center py-3 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-black">{t("taxComparator.incomeTaxLabel")}</span>
                            <span className="font-black text-destructive text-lg">-{formatCurrency(countryTaxes.incomeTax)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-3 border-b border-border/50">
                          <span className="text-sm text-muted-foreground font-black">{t("taxComparator.socialSecurity")}</span>
                          <span className="font-black text-destructive text-lg">-{formatCurrency(countryTaxes.socialSecurity)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-border/50">
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground font-black">{t("taxComparator.vat")} ({selectedCountryInfo.vatRate}%)</span>
                            <span className="text-[10px] text-muted-foreground/70 font-medium">{t("taxComparator.vatNote")}</span>
                          </div>
                          <span className="font-black text-muted-foreground text-lg">{formatCurrency(countryTaxes.vat)}</span>
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
                        className="bg-accent text-accent-foreground font-black text-base rounded-full px-10 h-14 w-full md:w-auto shadow-xl shadow-accent/30 transition-colors"
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
