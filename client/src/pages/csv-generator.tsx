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
import { Footer } from "@/components/layout/footer";
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
  'Sales',
  'Services',
  'Consulting',
  'Affiliate income',
  'Digital products',
  'Other income'
];

const EXPENSE_CATEGORIES = [
  'Software / SaaS',
  'Advertising / Marketing',
  'Contractors / Freelancers',
  'Banking fees',
  'Office expenses',
  'Travel',
  'Professional services',
  'Education',
  'Hosting / Domains',
  'Equipment',
  'Other'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MXN'];

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Stripe',
  'Wise',
  'Mercury',
  'Cash',
  'Check',
  'Crypto',
  'Other'
];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function createEmptyTransaction(): Transaction {
  return {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    currency: 'USD',
    type: 'income',
    category: 'Sales',
    paymentMethod: 'Bank Transfer',
    bankAccount: '',
    invoiceNumber: '',
    notes: ''
  };
}

export default function CsvGenerator() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([createEmptyTransaction()]);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
            updated.category = INCOME_CATEGORIES[0];
          } else if (value === 'expense') {
            updated.category = EXPENSE_CATEGORIES[0];
          } else {
            updated.category = 'Transfer';
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
    return ['Transfer'];
  };

  const downloadCSV = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const headers = ['Date', 'Description', 'Amount', 'Currency', 'Type', 'Category', 'Payment Method', 'Bank Account', 'Invoice Number', 'Notes'];
      
      const rows = transactions.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        t.currency,
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.category,
        t.paymentMethod,
        `"${t.bankAccount.replace(/"/g, '""')}"`,
        `"${t.invoiceNumber.replace(/"/g, '""')}"`,
        `"${t.notes.replace(/"/g, '""')}"`
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
        <div className="mb-6">
          <Link href="/dashboard?tab=tools">
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground mb-4 -ml-2" data-testid="button-back-tools">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("tools.backToTools")}
            </Button>
          </Link>
          
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{t("tools.csvGenerator.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("tools.csvGenerator.subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
            <p className="text-[10px] md:text-xs text-muted-foreground">{t("tools.csvGenerator.totalIncome")}</p>
            <p className="text-lg md:text-xl font-black text-green-600 dark:text-green-500" data-testid="stat-total-income">
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background">
            <p className="text-[10px] md:text-xs text-muted-foreground">{t("tools.csvGenerator.totalExpenses")}</p>
            <p className="text-lg md:text-xl font-black text-red-600 dark:text-red-500" data-testid="stat-total-expenses">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
            <p className="text-[10px] md:text-xs text-muted-foreground">{t("tools.csvGenerator.netBalance")}</p>
            <p className={`text-lg md:text-xl font-black ${(totalIncome - totalExpenses) >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-red-600 dark:text-red-500'}`} data-testid="stat-net-balance">
              ${(totalIncome - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
            <p className="text-[10px] md:text-xs text-muted-foreground">{t("tools.csvGenerator.transactions")}</p>
            <p className="text-lg md:text-xl font-black text-purple-600 dark:text-purple-500" data-testid="stat-transactions-count">
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
                        className="rounded-full text-sm"
                        data-testid={`input-date-${index}`}
                      />
                    </div>
                    
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.description")}</Label>
                      <Input
                        value={transaction.description}
                        onChange={(e) => updateTransaction(transaction.id, 'description', e.target.value)}
                        placeholder={t("tools.csvGenerator.descriptionPlaceholder")}
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
                        placeholder="0.00"
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
                          <NativeSelectItem key={cat} value={cat}>{cat}</NativeSelectItem>
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
                          <NativeSelectItem key={pm} value={pm}>{pm}</NativeSelectItem>
                        ))}
                      </NativeSelect>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.bankAccount")}</Label>
                      <Input
                        value={transaction.bankAccount}
                        onChange={(e) => updateTransaction(transaction.id, 'bankAccount', e.target.value)}
                        placeholder={t("tools.csvGenerator.bankAccountPlaceholder")}
                        className="rounded-full text-sm"
                        data-testid={`input-bank-account-${index}`}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.invoiceNumber")}</Label>
                      <Input
                        value={transaction.invoiceNumber}
                        onChange={(e) => updateTransaction(transaction.id, 'invoiceNumber', e.target.value)}
                        placeholder={t("tools.csvGenerator.invoiceNumberPlaceholder")}
                        className="rounded-full text-sm"
                        data-testid={`input-invoice-number-${index}`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("tools.csvGenerator.notes")}</Label>
                      <Textarea
                        value={transaction.notes}
                        onChange={(e) => updateTransaction(transaction.id, 'notes', e.target.value)}
                        placeholder={t("tools.csvGenerator.notesPlaceholder")}
                        className="rounded-lg text-sm resize-none"
                        rows={2}
                        data-testid={`input-notes-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <p>{t("tools.csvGenerator.disclaimer")}</p>
                </div>
                <Button 
                  onClick={downloadCSV}
                  disabled={!hasValidTransactions || isGenerating}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-6"
                  data-testid="button-download-csv"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("tools.csvGenerator.generating")}
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 mr-2" />
                      {t("tools.csvGenerator.downloadCsv")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
