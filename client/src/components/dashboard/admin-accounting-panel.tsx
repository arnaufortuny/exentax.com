import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { formatDate, getLocale } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Download, Edit, Trash2, Loader2, X, DollarSign, TrendingUp, TrendingDown } from "@/components/icons";
import type { AccountingTransaction } from "@shared/schema";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";

const INCOME_CATEGORIES = ['llc_formation', 'maintenance', 'consultation', 'other_income'];
const EXPENSE_CATEGORIES = ['state_fees', 'registered_agent', 'bank_fees', 'marketing', 'software', 'other_expense'];

export function AdminAccountingPanel() {
  const { t } = useTranslation();
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const { confirm: showConfirm, dialogProps: confirmDialogProps } = useConfirmDialog();

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const [periodFilter, setPeriodFilter] = useState<'month' | 'year' | 'all'>('month');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<AccountingTransaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    reference: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const { data: transactions = [], isLoading: txLoading, refetch: refetchTransactions } = useQuery<AccountingTransaction[]>({
    queryKey: ["/api/admin/accounting/transactions", typeFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await apiRequest("GET", `/api/admin/accounting/transactions?${params.toString()}`);
      return res.json();
    }
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    categoryBreakdown: { category: string; type: string; total: number }[];
  }>({
    queryKey: ["/api/admin/accounting/summary", periodFilter],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/accounting/summary?period=${periodFilter}`);
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/admin/accounting/transactions", data);
      if (!res.ok) throw new Error("Transaction creation failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/summary"] });
      setFormMessage({ type: 'success', text: t('dashboard.admin.transactionCreated') });
      setFormOpen(false);
      setEditingTransaction(null);
      resetForm();
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t('common.error') });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/admin/accounting/transactions/${id}`, data);
      if (!res.ok) throw new Error("Transaction update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/summary"] });
      setFormMessage({ type: 'success', text: t('dashboard.admin.transactionUpdated') });
      setFormOpen(false);
      setEditingTransaction(null);
      resetForm();
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t('common.error') });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/accounting/transactions/${id}`);
      if (!res.ok) throw new Error("Transaction deletion failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/summary"] });
      setFormMessage({ type: 'success', text: t('dashboard.admin.transactionDeleted') });
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t('common.error') });
    }
  });

  const resetForm = () => {
    setFormData({
      type: 'income',
      category: '',
      amount: '',
      description: '',
      reference: '',
      transactionDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const openEditForm = (tx: AccountingTransaction) => {
    setFormData({
      type: tx.type as 'income' | 'expense',
      category: tx.category,
      amount: (Math.abs(tx.amount) / 100).toString(),
      description: tx.description || '',
      reference: tx.reference || '',
      transactionDate: tx.transactionDate ? new Date(tx.transactionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: tx.notes || ''
    });
    setEditingTransaction(tx);
    setFormOpen(true);
  };

  const handleSubmit = () => {
    setFormMessage(null);
    if (!formData.category || !formData.amount) {
      setFormMessage({ type: 'error', text: t('common.requiredFields') });
      return;
    }
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleExportCSV = async () => {
    setFormMessage(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await apiRequest("GET", `/api/admin/accounting/export-csv?${params.toString()}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transacciones_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setFormMessage({ type: 'success', text: t('dashboard.admin.exportCSV') });
    } catch (err) {
      setFormMessage({ type: 'error', text: t('common.error') });
    }
  };

  const getCategoryLabel = (category: string) => {
    return t(`dashboard.admin.categories.${category}`) || category;
  };

  const formatAmount = (cents: number) => {
    return (cents / 100).toLocaleString(getLocale(), { style: 'currency', currency: 'EUR' });
  };

  return (
    <div className="space-y-6">
      {formMessage && (
        <div className={`mb-4 p-3 rounded-xl text-center text-sm font-medium ${
          formMessage.type === 'error' 
            ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
            : formMessage.type === 'success'
            ? 'bg-accent/10 border border-accent/20 text-accent'
            : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
        }`} data-testid="form-message">
          {formMessage.text}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-0 shadow-sm border-l-4 border-l-green-500/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('dashboard.admin.totalIncome')}</p>
            <p className="text-xl font-black text-green-600">
              {summaryLoading ? '...' : formatAmount(summary?.totalIncome || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 shadow-sm border-l-4 border-l-red-500/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('dashboard.admin.totalExpenses')}</p>
            <p className="text-xl font-black text-red-600">
              {summaryLoading ? '...' : formatAmount(summary?.totalExpenses || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 shadow-sm border-l-4 border-l-blue-500/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('dashboard.admin.netBalance')}</p>
            <p className={`text-xl font-black ${(summary?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summaryLoading ? '...' : formatAmount(summary?.netBalance || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          {(['month', 'year', 'all'] as const).map(p => (
            <Button
              key={p}
              variant={periodFilter === p ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setPeriodFilter(p)}
            >
              {p === 'month' ? t('dashboard.admin.thisMonth') : p === 'year' ? t('dashboard.admin.thisYear') : t('dashboard.admin.allTime')}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs"
            onClick={handleExportCSV}
          >
            <Download className="w-3 h-3 mr-1" /> {t('dashboard.admin.exportCSV')}
          </Button>
          <Button
            size="sm"
            className="rounded-full text-xs bg-accent text-accent-foreground"
            onClick={() => {
              resetForm();
              setEditingTransaction(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-3 h-3 mr-1" /> {t('dashboard.admin.addTransaction')}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <NativeSelect
          value={typeFilter}
          onValueChange={setTypeFilter}
          className="rounded-xl h-9 text-xs w-32"
        >
          <NativeSelectItem value="">{t('common.all')}</NativeSelectItem>
          <NativeSelectItem value="income">{t('dashboard.admin.income')}</NativeSelectItem>
          <NativeSelectItem value="expense">{t('dashboard.admin.expenses')}</NativeSelectItem>
        </NativeSelect>
        <NativeSelect
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          className="rounded-xl h-9 text-xs w-40"
        >
          <NativeSelectItem value="">{t('dashboard.admin.allCategories')}</NativeSelectItem>
          {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(cat => (
            <NativeSelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</NativeSelectItem>
          ))}
        </NativeSelect>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
        <div className="divide-y">
          {txLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('dashboard.admin.noTransactions')}</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {tx.type === 'income' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-black text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : ''}{formatAmount(tx.amount)}
                      </span>
                      <Badge variant="outline" className="text-[9px]">{getCategoryLabel(tx.category)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tx.description || '-'}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {tx.transactionDate && formatDate(tx.transactionDate)}
                      {tx.reference && ` | ${tx.reference}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => openEditForm(tx)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full text-red-600"
                    onClick={() => {
                      showConfirm({
                        title: t('common.confirmAction', 'Confirmar'),
                        description: t('dashboard.admin.deleteTransaction') + '?',
                        onConfirm: () => {
                          deleteMutation.mutate(tx.id);
                        },
                      });
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Collapsible open={formOpen} onOpenChange={setFormOpen}>
        <CollapsibleContent>
          <Card className="rounded-2xl border-0 shadow-sm mt-4">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-foreground">
                  {editingTransaction ? t('dashboard.admin.editTransaction') : t('dashboard.admin.addTransaction')}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => { setFormOpen(false); setEditingTransaction(null); }}
                  aria-label={t('common.cancel')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {editingTransaction ? t('dashboard.admin.editTransaction') : t('dashboard.admin.addTransaction')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t('dashboard.admin.transactionType')}</Label>
                  <NativeSelect
                    value={formData.type}
                    onValueChange={(val) => setFormData(p => ({ ...p, type: val as 'income' | 'expense', category: '' }))}
                    className="w-full rounded-xl h-11"
                  >
                    <NativeSelectItem value="income">{t('dashboard.admin.income')}</NativeSelectItem>
                    <NativeSelectItem value="expense">{t('dashboard.admin.expenses')}</NativeSelectItem>
                  </NativeSelect>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t('dashboard.admin.category')}</Label>
                  <NativeSelect
                    value={formData.category}
                    onValueChange={(val) => setFormData(p => ({ ...p, category: val }))}
                    className="w-full rounded-xl h-11"
                  >
                    <NativeSelectItem value="">{t('dashboard.admin.selectCategory')}</NativeSelectItem>
                    {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                      <NativeSelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</NativeSelectItem>
                    ))}
                  </NativeSelect>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t('dashboard.admin.amount')} (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                    className="rounded-xl h-11"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t('dashboard.admin.transactionDate')}</Label>
                  <Input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData(p => ({ ...p, transactionDate: e.target.value }))}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-semibold mb-2 block">{t('dashboard.admin.description')}</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    className="rounded-xl h-11"
                    placeholder={t('dashboard.admin.description')}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t('dashboard.admin.transactionDescription')}</Label>
                  <Input
                    value={formData.reference}
                    onChange={(e) => setFormData(p => ({ ...p, reference: e.target.value }))}
                    className="rounded-xl h-11"
                    placeholder={t('dashboard.admin.transactionDescription')}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t('dashboard.admin.internalNotes')}</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="rounded-xl resize-none"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-accent text-accent-foreground font-black rounded-full px-6"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.saveChanges')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setFormOpen(false); setEditingTransaction(null); }}
                  className="rounded-full"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
