import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Trash2, Plus, ArrowLeft } from "@/components/icons";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

interface CostItem {
  id: string;
  name: string;
  cost: number;
  type: 'fixed' | 'variable';
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function PriceCalculator() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [productName, setProductName] = useState("");
  const [baseCost, setBaseCost] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [marginPercent, setMarginPercent] = useState<number>(30);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [additionalCosts, setAdditionalCosts] = useState<CostItem[]>([]);
  
  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">{t("tools.priceCalculator.loginRequired")}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t("tools.priceCalculator.loginDescription")}</p>
          <Button onClick={() => setLocation("/auth/login")} className="bg-accent text-accent-foreground rounded-full px-6">
            {t("auth.login.submit")}
          </Button>
        </div>
      </div>
    );
  }

  const addCost = () => {
    setAdditionalCosts([...additionalCosts, { id: generateId(), name: "", cost: 0, type: 'fixed' }]);
  };

  const removeCost = (id: string) => {
    setAdditionalCosts(additionalCosts.filter(c => c.id !== id));
  };

  const updateCost = (id: string, field: keyof CostItem, value: string | number) => {
    setAdditionalCosts(additionalCosts.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const currencySymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";

  const calculations = useMemo(() => {
    const baseTotal = baseCost * quantity;
    
    const fixedCosts = additionalCosts
      .filter(c => c.type === 'fixed')
      .reduce((sum, c) => sum + c.cost, 0);
    
    const variableCosts = additionalCosts
      .filter(c => c.type === 'variable')
      .reduce((sum, c) => sum + (c.cost * quantity), 0);
    
    const totalCosts = baseTotal + fixedCosts + variableCosts;
    const marginAmount = totalCosts * (marginPercent / 100);
    const subtotalWithMargin = totalCosts + marginAmount;
    const taxAmount = subtotalWithMargin * (taxPercent / 100);
    const finalPrice = subtotalWithMargin + taxAmount;
    const pricePerUnit = quantity > 0 ? finalPrice / quantity : 0;
    const profitPerUnit = quantity > 0 ? marginAmount / quantity : 0;
    
    return {
      baseTotal,
      fixedCosts,
      variableCosts,
      totalCosts,
      marginAmount,
      subtotalWithMargin,
      taxAmount,
      finalPrice,
      pricePerUnit,
      profitPerUnit
    };
  }, [baseCost, quantity, additionalCosts, marginPercent, taxPercent]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 md:py-6">
        <div className="mb-4">
          <Link href="/dashboard?tab=tools">
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground mb-2 -ml-2" data-testid="button-back-tools">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('tools.backToTools')}
            </Button>
          </Link>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{t('tools.priceCalculator.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('tools.priceCalculator.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h2 className="font-bold text-foreground mb-5">{t('tools.priceCalculator.productSection')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">{t('tools.priceCalculator.productName')}</Label>
                    <Input 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder={t('tools.priceCalculator.productPlaceholder')}
                      className="h-11 rounded-full"
                      data-testid="input-product-name"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">{t('tools.priceCalculator.baseCost')}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={baseCost || ""}
                        onChange={(e) => setBaseCost(parseFloat(e.target.value) || 0)}
                        className="h-11 rounded-full pl-8"
                        placeholder="0.00"
                        data-testid="input-base-cost"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">{t('tools.priceCalculator.quantity')}</Label>
                    <Input 
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="h-11 rounded-full"
                      data-testid="input-quantity"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">{t('tools.priceCalculator.currency')}</Label>
                    <NativeSelect
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-11 rounded-full"
                      data-testid="select-currency"
                    >
                      <option value="USD">USD - Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - Pound</option>
                    </NativeSelect>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-foreground">{t('tools.priceCalculator.additionalCosts')}</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addCost}
                    className="rounded-full text-xs"
                    data-testid="button-add-cost"
                  >
                    <Plus className="w-3 h-3 mr-1" /> {t('tools.priceCalculator.addCost')}
                  </Button>
                </div>
                
                {additionalCosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>{t('tools.priceCalculator.noCosts')}</p>
                    <p className="text-xs mt-1">{t('tools.priceCalculator.noCostsHint')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {additionalCosts.map((cost, index) => (
                      <div key={cost.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input 
                            value={cost.name}
                            onChange={(e) => updateCost(cost.id, 'name', e.target.value)}
                            placeholder={t('tools.priceCalculator.costName')}
                            className="h-9 rounded-full text-sm"
                            data-testid={`input-cost-name-${index}`}
                          />
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={cost.cost || ""}
                              onChange={(e) => updateCost(cost.id, 'cost', parseFloat(e.target.value) || 0)}
                              className="h-9 rounded-full pl-6 text-sm"
                              placeholder="0.00"
                              data-testid={`input-cost-amount-${index}`}
                            />
                          </div>
                          <NativeSelect
                            value={cost.type}
                            onChange={(e) => updateCost(cost.id, 'type', e.target.value as 'fixed' | 'variable')}
                            className="h-9 rounded-full text-sm"
                            data-testid={`select-cost-type-${index}`}
                          >
                            <option value="fixed">{t('tools.priceCalculator.fixed')}</option>
                            <option value="variable">{t('tools.priceCalculator.perUnit')}</option>
                          </NativeSelect>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeCost(cost.id)}
                          className="h-9 w-9 text-muted-foreground hover:text-red-500 shrink-0"
                          data-testid={`button-remove-cost-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h2 className="font-bold text-foreground mb-5">{t('tools.priceCalculator.marginTax')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">{t('tools.priceCalculator.profitMargin')}</Label>
                    <div className="relative">
                      <Input 
                        type="number"
                        min="0"
                        max="500"
                        value={marginPercent}
                        onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                        className="h-11 rounded-full pr-8"
                        data-testid="input-margin"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('tools.priceCalculator.marginHint')}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">{t('tools.priceCalculator.taxes')}</Label>
                    <div className="relative">
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                        className="h-11 rounded-full pr-8"
                        data-testid="input-tax"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('tools.priceCalculator.taxHint')}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-accent/10 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground font-medium">{t('tools.priceCalculator.commonMargins')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[15, 25, 30, 40, 50, 100].map((m) => (
                      <Button
                        key={m}
                        variant={marginPercent === m ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMarginPercent(m)}
                        className={`rounded-full text-xs h-7 ${marginPercent === m ? 'bg-accent text-accent-foreground' : ''}`}
                        data-testid={`button-preset-margin-${m}`}
                      >
                        {m}%
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-accent to-green-600 text-white overflow-hidden">
                <CardContent className="p-5 md:p-6">
                  <h2 className="font-bold mb-4">{t('tools.priceCalculator.recommendedPrice')}</h2>
                  
                  <div className="text-center py-4">
                    <p className="text-white/70 text-sm mb-1">{t('tools.priceCalculator.finalPrice')}</p>
                    <p className="text-4xl md:text-5xl font-bold">
                      {currencySymbol}{formatNumber(calculations.finalPrice)}
                    </p>
                    {quantity > 1 && (
                      <p className="text-white/80 text-sm mt-2">
                        {currencySymbol}{formatNumber(calculations.pricePerUnit)} {t('tools.priceCalculator.perUnitLabel')}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/70">{t('tools.priceCalculator.margin')}:</span>
                      <span className="font-bold">{currencySymbol}{formatNumber(calculations.marginAmount)}</span>
                    </div>
                    {quantity > 1 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{t('tools.priceCalculator.profitPerUnit')}:</span>
                        <span className="font-bold">{currencySymbol}{formatNumber(calculations.profitPerUnit)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-5 md:p-6">
                  <h2 className="font-bold text-foreground text-sm mb-4">{t('tools.priceCalculator.breakdown')}</h2>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('tools.priceCalculator.baseCostTotal')} ({quantity})</span>
                      <span className="font-medium">{currencySymbol}{formatNumber(calculations.baseTotal)}</span>
                    </div>
                    
                    {calculations.fixedCosts > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('tools.priceCalculator.fixedCostsTotal')}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(calculations.fixedCosts)}</span>
                      </div>
                    )}
                    
                    {calculations.variableCosts > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('tools.priceCalculator.variableCostsTotal')}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(calculations.variableCosts)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-foreground font-medium">{t('tools.priceCalculator.totalCosts')}</span>
                      <span className="font-bold">{currencySymbol}{formatNumber(calculations.totalCosts)}</span>
                    </div>
                    
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>+ {t('tools.priceCalculator.margin')} ({marginPercent}%)</span>
                      <span className="font-medium">{currencySymbol}{formatNumber(calculations.marginAmount)}</span>
                    </div>
                    
                    {taxPercent > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>+ {t('tools.priceCalculator.taxAmount')} ({taxPercent}%)</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(calculations.taxAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-2 border-t border-accent/30 bg-accent/5 -mx-5 px-5 py-2 rounded-xl mt-2">
                      <span className="font-bold text-foreground">{t('tools.priceCalculator.finalPrice')}</span>
                      <span className="font-bold text-accent">{currencySymbol}{formatNumber(calculations.finalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
