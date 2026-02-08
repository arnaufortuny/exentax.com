import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Trash2, Plus, FileDown, ArrowLeft, Loader2 } from "@/components/icons";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  paymentMethod: string;
  bankAccount: string;
  invoiceNumber: string;
  notes: string;
}

const INCOME_CATEGORIES = [
  { value: 'Sales', labelKey: 'tools.csvGenerator.categories.sales' },
  { value: 'Services', labelKey: 'tools.csvGenerator.categories.services' },
  { value: 'Consulting', labelKey: 'tools.csvGenerator.categories.consulting' },
  { value: 'Affiliate income', labelKey: 'tools.csvGenerator.categories.affiliateIncome' },
  { value: 'Digital products', labelKey: 'tools.csvGenerator.categories.digitalProducts' },
  { value: 'Other income', labelKey: 'tools.csvGenerator.categories.otherIncome' },
];

const EXPENSE_CATEGORIES = [
  { value: 'Software / SaaS', labelKey: 'tools.csvGenerator.categories.softwareSaas' },
  { value: 'Advertising / Marketing', labelKey: 'tools.csvGenerator.categories.advertisingMarketing' },
  { value: 'Contractors / Freelancers', labelKey: 'tools.csvGenerator.categories.contractorsFreelancers' },
  { value: 'Banking fees', labelKey: 'tools.csvGenerator.categories.bankingFees' },
  { value: 'Office expenses', labelKey: 'tools.csvGenerator.categories.officeExpenses' },
  { value: 'Travel', labelKey: 'tools.csvGenerator.categories.travel' },
  { value: 'Professional services', labelKey: 'tools.csvGenerator.categories.professionalServices' },
  { value: 'Education', labelKey: 'tools.csvGenerator.categories.education' },
  { value: 'Hosting / Domains', labelKey: 'tools.csvGenerator.categories.hostingDomains' },
  { value: 'Equipment', labelKey: 'tools.csvGenerator.categories.equipment' },
  { value: 'Other', labelKey: 'tools.csvGenerator.categories.other' },
];

const TRANSFER_CATEGORIES = [
  { value: 'Transfer', labelKey: 'tools.csvGenerator.categories.transfer' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MXN'];

const PAYMENT_METHODS = [
  { value: 'Bank Transfer', labelKey: 'tools.csvGenerator.paymentMethods.bankTransfer' },
  { value: 'Credit Card', labelKey: 'tools.csvGenerator.paymentMethods.creditCard' },
  { value: 'Debit Card', labelKey: 'tools.csvGenerator.paymentMethods.debitCard' },
  { value: 'PayPal', labelKey: 'tools.csvGenerator.paymentMethods.paypal' },
  { value: 'Stripe', labelKey: 'tools.csvGenerator.paymentMethods.stripe' },
  { value: 'Wise', labelKey: 'tools.csvGenerator.paymentMethods.wise' },
  { value: 'Mercury', labelKey: 'tools.csvGenerator.paymentMethods.mercury' },
  { value: 'Cash', labelKey: 'tools.csvGenerator.paymentMethods.cash' },
  { value: 'Check', labelKey: 'tools.csvGenerator.paymentMethods.check' },
  { value: 'Crypto', labelKey: 'tools.csvGenerator.paymentMethods.crypto' },
  { value: 'Other', labelKey: 'tools.csvGenerator.paymentMethods.other' },
];

const CATEGORY_LABEL_MAP: Record<string, string> = {};
[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...TRANSFER_CATEGORIES].forEach(cat => {
  CATEGORY_LABEL_MAP[cat.value] = cat.labelKey;
});

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function createEmptyTransaction(): Transaction {
  return {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    currency: 'EUR',
    type: 'income',
    category: 'Sales',
    paymentMethod: 'Bank Transfer',
    bankAccount: '',
    invoiceNumber: '',
    notes: ''
  };
}

const EXPORT_LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "ca", label: "Català" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
];

export default function CsvGenerator() {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([createEmptyTransaction()]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportLang, setExportLang] = useState(i18n.language?.split('-')[0] || 'es');
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">{t("tools.csvGenerator.loginRequired")}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t("tools.csvGenerator.loginDescription")}</p>
          <Button onClick={() => setLocation("/auth/login")} className="bg-accent text-accent-foreground rounded-full px-6">
            {t("auth.login.submit")}
          </Button>
        </div>
      </div>
    );
  }

  const addTransaction = () => {
    setTransactions([...transactions, createEmptyTransaction()]);
  };

  const removeTransaction = (id: string) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const updateTransaction = (id: string, field: keyof Transaction, value: string) => {
    setTransactions(transactions.map(t => {
      if (t.id === id) {
        const updated = { ...t, [field]: value };
        if (field === 'type') {
          if (value === 'income') {
            updated.category = INCOME_CATEGORIES[0].value;
          } else if (value === 'expense') {
            updated.category = EXPENSE_CATEGORIES[0].value;
          } else {
            updated.category = TRANSFER_CATEGORIES[0].value;
          }
        }
        return updated;
      }
      return t;
    }));
  };

  const getCategoriesForType = (type: string) => {
    if (type === 'income') return INCOME_CATEGORIES;
    if (type === 'expense') return EXPENSE_CATEGORIES;
    return TRANSFER_CATEGORIES;
  };

  const downloadCSV = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const tExport = i18n.getFixedT(exportLang);
      const headers = [
        tExport('tools.csvGenerator.csvHeaders.date'),
        tExport('tools.csvGenerator.csvHeaders.description'),
        tExport('tools.csvGenerator.csvHeaders.amount'),
        tExport('tools.csvGenerator.csvHeaders.currency'),
        tExport('tools.csvGenerator.csvHeaders.type'),
        tExport('tools.csvGenerator.csvHeaders.category'),
        tExport('tools.csvGenerator.csvHeaders.paymentMethod'),
        tExport('tools.csvGenerator.csvHeaders.bankAccount'),
        tExport('tools.csvGenerator.csvHeaders.invoiceNumber'),
        tExport('tools.csvGenerator.csvHeaders.notes'),
      ];
      
      const rows = transactions.map(tx => [
        tx.date,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.currency,
        tExport("tools.csvGenerator." + tx.type),
        CATEGORY_LABEL_MAP[tx.category] ? tExport(CATEGORY_LABEL_MAP[tx.category]) : tx.category,
        tx.paymentMethod,
        `"${tx.bankAccount.replace(/"/g, '""')}"`,
        `"${tx.invoiceNumber.replace(/"/g, '""')}"`,
        `"${tx.notes.replace(/"/g, '""')}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsGenerating(false);
    }, 500);
  };

  const hasValidTransactions = transactions.some(t => 
    t.date && t.description.trim() && t.amount && parseFloat(t.amount) > 0
  );

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.amount)
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.amount)
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <Link href="/dashboard?tab=tools">
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground mb-4 -ml-2" data-testid="button-back-tools">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("tools.backToTools")}
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">{t("tools.csvGenerator.title")}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">{t("tools.csvGenerator.subtitle")}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">{t("tools.exportLanguage", "Export language")}:</Label>
                <NativeSelect value={exportLang} onChange={(e) => setExportLang(e.target.value)} data-testid="select-csv-export-lang">
                  {EXPORT_LANGUAGES.map(lang => (
                    <NativeSelectItem key={lang.code} value={lang.code}>{lang.label}</NativeSelectItem>
                  ))}
                </NativeSelect>
              </div>
              <Button 
                onClick={downloadCSV}
                disabled={!hasValidTransactions || isGenerating}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-full px-5"
                data-testid="button-download-csv"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>{t("tools.csvGenerator.generating")}</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    <span>{t("tools.csvGenerator.downloadCsv")}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 rounded-2xl border-0 shadow-sm bg-accent/10 dark:bg-accent/5">
            <p className="text-[10px] md:text-xs text-muted-foreground">{t("tools.csvGenerator.totalIncome")}</p>
            <p className="text-lg md:text-xl font-black text-accent" data-testid="stat-total-income">
              {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} &euro;
            </p>
          </Card>
          <Card className="p-4 rounded-2xl border-0 shadow-sm bg-accent/10 dark:bg-accent/5">
            <p className="text-[10px] md:text-xs text-muted-foreground">{t("tools.csvGenerator.totalExpenses")}</p>
            <p className="text-lg md:text-xl font-black text-accent" data-testid="stat-total-expenses">
              {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} &euro;
            </p>
          </Card>
          <Card className="p-4 rounded-2xl border-0 shadow-sm bg-accent/10 dark:bg-accent/5">
            <p className="text-[10px] md:text-xs text-muted-foreground">{t("tools.csvGenerator.netBalance")}</p>
            <p className="text-lg md:text-xl font-black text-accent" data-testid="stat-net-balance">
              {(totalIncome - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} &euro;
            </p>
          </Card>
          <Card className="p-4 rounded-2xl border-0 shadow-sm bg-accent/10 dark:bg-accent/5">
            <p className="text-[10px] md:text-xs text-muted-foreground">{t("tools.csvGenerator.transactions")}</p>
            <p className="text-lg md:text-xl font-black text-accent" data-testid="stat-transactions-count">
              {transactions.length}
            </p>
          </Card>
        </div>

        <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="font-bold text-foreground">{t("tools.csvGenerator.transactionsTitle")}</h2>
              <Button onClick={addTransaction} size="sm" variant="outline" className="rounded-full font-semibold" data-testid="button-add-transaction">
                <Plus className="w-4 h-4 mr-1" />
                {t("tools.csvGenerator.addTransaction")}
              </Button>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className="p-4 rounded-xl border border-border bg-muted/30 dark:bg-[#1A1A1A]/10"
                  data-testid={`transaction-row-${index}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">#{index + 1}</Badge>
                      <Badge 
                        className={`text-[10px] ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          transaction.type === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {transaction.type === 'income' ? t("tools.csvGenerator.income") : 
                         transaction.type === 'expense' ? t("tools.csvGenerator.expense") : 
                         t("tools.csvGenerator.transfer")}
                      </Badge>
                    </div>
                    {transactions.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        onClick={() => removeTransaction(transaction.id)}
                        data-testid={`button-remove-transaction-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.date")}</Label>
                      <Input
                        type="date"
                        value={transaction.date}
                        onChange={(e) => updateTransaction(transaction.id, 'date', e.target.value)}
                        className="rounded-full text-xs sm:text-sm w-full min-w-0"
                        data-testid={`input-date-${index}`}
                      />
                    </div>
                    
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.description")}</Label>
                      <Input
                        value={transaction.description}
                        onChange={(e) => updateTransaction(transaction.id, 'description', e.target.value)}
                        className="rounded-full text-sm"
                        data-testid={`input-description-${index}`}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.amount")}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={transaction.amount}
                        onChange={(e) => updateTransaction(transaction.id, 'amount', e.target.value)}
                        className="rounded-full text-sm"
                        data-testid={`input-amount-${index}`}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.currency")}</Label>
                      <NativeSelect
                        value={transaction.currency}
                        onChange={(e) => updateTransaction(transaction.id, 'currency', e.target.value)}
                        className="rounded-full text-sm"
                        data-testid={`select-currency-${index}`}
                      >
                        {CURRENCIES.map(c => (
                          <NativeSelectItem key={c} value={c}>{c}</NativeSelectItem>
                        ))}
                      </NativeSelect>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.type")}</Label>
                      <NativeSelect
                        value={transaction.type}
                        onChange={(e) => updateTransaction(transaction.id, 'type', e.target.value as 'income' | 'expense' | 'transfer')}
                        className="rounded-full text-sm"
                        data-testid={`select-type-${index}`}
                      >
                        <NativeSelectItem value="income">{t("tools.csvGenerator.income")}</NativeSelectItem>
                        <NativeSelectItem value="expense">{t("tools.csvGenerator.expense")}</NativeSelectItem>
                        <NativeSelectItem value="transfer">{t("tools.csvGenerator.transfer")}</NativeSelectItem>
                      </NativeSelect>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.category")}</Label>
                      <NativeSelect
                        value={transaction.category}
                        onChange={(e) => updateTransaction(transaction.id, 'category', e.target.value)}
                        className="rounded-full text-sm"
                        data-testid={`select-category-${index}`}
                      >
                        {getCategoriesForType(transaction.type).map(cat => (
                          <NativeSelectItem key={cat.value} value={cat.value}>{t(cat.labelKey)}</NativeSelectItem>
                        ))}
                      </NativeSelect>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.paymentMethod")}</Label>
                      <NativeSelect
                        value={transaction.paymentMethod}
                        onChange={(e) => updateTransaction(transaction.id, 'paymentMethod', e.target.value)}
                        className="rounded-full text-sm"
                        data-testid={`select-payment-method-${index}`}
                      >
                        {PAYMENT_METHODS.map(pm => (
                          <NativeSelectItem key={pm.value} value={pm.value}>{t(pm.labelKey)}</NativeSelectItem>
                        ))}
                      </NativeSelect>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.bankAccount")}</Label>
                      <Input
                        value={transaction.bankAccount}
                        onChange={(e) => updateTransaction(transaction.id, 'bankAccount', e.target.value)}
                        className="rounded-full text-sm"
                        data-testid={`input-bank-account-${index}`}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.invoiceNumber")}</Label>
                      <Input
                        value={transaction.invoiceNumber}
                        onChange={(e) => updateTransaction(transaction.id, 'invoiceNumber', e.target.value)}
                        className="rounded-full text-sm"
                        data-testid={`input-invoice-number-${index}`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.notes")}</Label>
                      <Textarea
                        value={transaction.notes}
                        onChange={(e) => updateTransaction(transaction.id, 'notes', e.target.value)}
                        className="rounded-2xl text-sm resize-none"
                        rows={2}
                        data-testid={`input-notes-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <p>{t("tools.csvGenerator.disclaimer")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl mt-4 sm:hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{t("tools.exportLanguage", "Export language")}:</Label>
              <NativeSelect value={exportLang} onChange={(e) => setExportLang(e.target.value)} data-testid="select-csv-export-lang-mobile">
                {EXPORT_LANGUAGES.map(lang => (
                  <NativeSelectItem key={lang.code} value={lang.code}>{lang.label}</NativeSelectItem>
                ))}
              </NativeSelect>
            </div>
            <Button 
              onClick={downloadCSV}
              disabled={!hasValidTransactions || isGenerating}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-full px-5 w-full"
              data-testid="button-download-csv-mobile"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>{t("tools.csvGenerator.generating")}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  <span>{t("tools.csvGenerator.downloadCsv")}</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
