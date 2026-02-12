import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { AdminAccountingPanel } from "@/components/dashboard/admin-accounting-panel";
import { formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, Trash2, Plus, Edit, XCircle, CheckCircle2, X } from "@/components/icons";

type BillingSubTab = 'invoices' | 'accounting' | 'payment-methods';

interface AdminBillingPanelProps {
  billingSubTab: BillingSubTab;
  setBillingSubTab: (sub: BillingSubTab) => void;
  adminInvoices: any[];
  paymentAccountsList: any[];
  refetchPaymentAccounts: () => void;
  setFormMessage: (msg: { type: 'error' | 'success' | 'info'; text: string }) => void;
  showConfirm: (opts: { title: string; description: string; onConfirm: () => Promise<void> }) => void;
}

export function AdminBillingPanel({
  billingSubTab,
  setBillingSubTab,
  adminInvoices,
  paymentAccountsList,
  refetchPaymentAccounts,
  setFormMessage,
  showConfirm,
}: AdminBillingPanelProps) {
  const { t } = useTranslation();

  const [paymentAccountDialog, setPaymentAccountDialog] = useState<{ open: boolean; account: any | null }>({ open: false, account: null });
  const [paymentAccountForm, setPaymentAccountForm] = useState({
    label: '', holder: '', bankName: '', accountType: 'checking',
    accountNumber: '', routingNumber: '', iban: '', swift: '', address: '', isActive: true, sortOrder: 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          variant={billingSubTab === 'invoices' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-full text-xs font-black ${billingSubTab === 'invoices' ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setBillingSubTab('invoices')}
          data-testid="button-billing-subtab-invoices"
        >
          {t('dashboard.admin.tabs.invoices')}
        </Button>
        <Button
          variant={billingSubTab === 'accounting' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-full text-xs font-black ${billingSubTab === 'accounting' ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setBillingSubTab('accounting')}
          data-testid="button-billing-subtab-accounting"
        >
          {t('dashboard.admin.tabs.accounting')}
        </Button>
        <Button
          variant={billingSubTab === 'payment-methods' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-full text-xs font-black ${billingSubTab === 'payment-methods' ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setBillingSubTab('payment-methods')}
          data-testid="button-billing-subtab-payment-methods"
        >
          {t('dashboard.admin.tabs.paymentAccounts')}
        </Button>
      </div>
      {billingSubTab === 'invoices' && (
        <div className="space-y-4" data-testid="admin-facturas-section">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg">{t('dashboard.admin.invoicesSection.title')}</h3>
          </div>
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y max-h-[60vh] overflow-y-auto">
              {adminInvoices?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">{t('dashboard.admin.invoicesSection.noInvoices')}</div>
              )}
              {adminInvoices?.map((inv: any) => {
                const currencySymbol = inv.currency === 'USD' ? '$' : '€';
                return (
                <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`invoice-row-${inv.id}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm">{inv.invoiceNumber}</span>
                      <Badge variant={inv.status === 'paid' || inv.status === 'completed' ? "default" : "secondary"} className="text-[10px]">
                        {inv.status === 'paid' ? t('dashboard.admin.invoicesSection.paid') : inv.status === 'completed' ? t('dashboard.admin.invoicesSection.completedStatus') : inv.status === 'pending' ? t('dashboard.admin.invoicesSection.pendingStatus') : inv.status === 'cancelled' ? t('dashboard.admin.invoicesSection.cancelledStatus') : inv.status === 'refunded' ? t('dashboard.admin.invoicesSection.refundedStatus') : inv.status || t('common.na')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">{inv.concept}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.user?.firstName} {inv.user?.lastName} ({inv.user?.email})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('dashboard.admin.invoicesSection.amountLabel')}: {(inv.amount / 100).toFixed(2)} {currencySymbol} | 
                      {t('dashboard.admin.invoicesSection.date')}: {inv.createdAt ? formatDate(inv.createdAt) : t('common.na')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <NativeSelect
                      value={inv.status || 'pending'}
                      onValueChange={async (newStatus) => {
                        try {
                          await apiRequest("PATCH", `/api/admin/invoices/${inv.id}/status`, { status: newStatus });
                          queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
                          setFormMessage({ type: 'success', text: t("dashboard.toasts.statusUpdated") });
                        } catch {
                          setFormMessage({ type: 'error', text: t("common.error") });
                        }
                      }}
                      className="h-8 text-[10px] rounded-full px-2 min-w-[90px]"
                    >
                      <option value="pending">{t('dashboard.admin.invoicesSection.pendingStatus')}</option>
                      <option value="paid">{t('dashboard.admin.invoicesSection.paid')}</option>
                      <option value="completed">{t('dashboard.admin.invoicesSection.completedStatus')}</option>
                      <option value="cancelled">{t('dashboard.admin.invoicesSection.cancelledStatus')}</option>
                      <option value="refunded">{t('dashboard.admin.invoicesSection.refundedStatus')}</option>
                    </NativeSelect>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs"
                      onClick={() => window.open(`/api/admin/invoices/${inv.id}/download`, '_blank')}
                      data-testid={`button-view-invoice-${inv.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" /> {t('dashboard.admin.invoicesSection.view')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs text-red-600 border-red-200"
                      onClick={() => {
                        showConfirm({
                          title: t('common.confirmAction'),
                          description: t('dashboard.admin.invoicesSection.confirmDeleteInvoice'),
                          onConfirm: async () => {
                            try {
                              await apiRequest("DELETE", `/api/admin/invoices/${inv.id}`);
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
                              setFormMessage({ type: 'success', text: t("dashboard.toasts.invoiceDeleted") });
                            } catch {
                              setFormMessage({ type: 'error', text: t("common.error") });
                            }
                          },
                        });
                      }}
                      data-testid={`button-delete-invoice-${inv.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
      {billingSubTab === 'accounting' && (
        <AdminAccountingPanel />
      )}
      {billingSubTab === 'payment-methods' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-black text-lg">{t('dashboard.admin.tabs.paymentAccounts')}</h3>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs font-black"
              onClick={() => {
                setPaymentAccountForm({
                  label: '', holder: 'Fortuny Consulting LLC', bankName: '', accountType: 'checking',
                  accountNumber: '', routingNumber: '', iban: '', swift: '', address: '', isActive: true, sortOrder: 0,
                });
                setPaymentAccountDialog({ open: true, account: null });
              }}
              data-testid="button-create-payment-account-billing"
            >
              <Plus className="w-3 h-3 mr-1" /> {t('dashboard.admin.paymentAccounts.newAccount')}
            </Button>
          </div>
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y">
              {paymentAccountsList?.map((acct: any) => (
                <div key={acct.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`billing-payment-account-${acct.id}`}>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm">{acct.label}</span>
                      <Badge variant={acct.isActive ? "default" : "secondary"} className="text-[10px]">
                        {acct.isActive ? t('dashboard.admin.paymentAccounts.active') : t('dashboard.admin.paymentAccounts.inactive')}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{acct.accountType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{acct.bankName} — {acct.holder}</p>
                    {acct.accountNumber && <p className="text-[10px] text-muted-foreground">{t('dashboard.admin.paymentAccounts.accountLabel')}: ****{acct.accountNumber.slice(-4)}</p>}
                    {acct.iban && <p className="text-[10px] text-muted-foreground">IBAN: ****{acct.iban.slice(-4)}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-lg"
                      onClick={() => {
                        setPaymentAccountForm({
                          label: acct.label, holder: acct.holder, bankName: acct.bankName,
                          accountType: acct.accountType, accountNumber: acct.accountNumber || '',
                          routingNumber: acct.routingNumber || '', iban: acct.iban || '',
                          swift: acct.swift || '', address: acct.address || '',
                          isActive: acct.isActive, sortOrder: acct.sortOrder || 0,
                        });
                        setPaymentAccountDialog({ open: true, account: acct });
                      }}
                      data-testid={`button-edit-payment-billing-${acct.id}`}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-lg ${acct.isActive ? 'text-red-600' : 'text-accent'}`}
                      onClick={async () => {
                        try {
                          await apiRequest("PATCH", `/api/admin/payment-accounts/${acct.id}`, { isActive: !acct.isActive });
                          refetchPaymentAccounts();
                          setFormMessage({ type: 'success', text: acct.isActive ? t('dashboard.admin.paymentAccounts.accountDeactivated') : t('dashboard.admin.paymentAccounts.accountActivated') });
                        } catch (e) {
                          setFormMessage({ type: 'error', text: t("common.error") });
                        }
                      }}
                      data-testid={`button-toggle-payment-billing-${acct.id}`}
                    >
                      {acct.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              ))}
              {(!paymentAccountsList || paymentAccountsList.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">{t('dashboard.admin.paymentAccounts.noAccounts')}</div>
              )}
            </div>
          </Card>

          {paymentAccountDialog.open && (
            <Card className="rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black">{paymentAccountDialog.account ? t('dashboard.admin.paymentAccounts.editAccount') : t('dashboard.admin.paymentAccounts.newBankAccount')}</h4>
                <Button variant="ghost" size="icon" onClick={() => setPaymentAccountDialog({ open: false, account: null })} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.label')} *</label>
                  <Input value={paymentAccountForm.label} onChange={e => setPaymentAccountForm(f => ({...f, label: e.target.value}))} className="rounded-full text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.holder')} *</label>
                  <Input value={paymentAccountForm.holder} onChange={e => setPaymentAccountForm(f => ({...f, holder: e.target.value}))} className="rounded-full text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.bank')} *</label>
                  <Input value={paymentAccountForm.bankName} onChange={e => setPaymentAccountForm(f => ({...f, bankName: e.target.value}))} className="rounded-full text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.accountType')}</label>
                  <NativeSelect value={paymentAccountForm.accountType} onValueChange={v => setPaymentAccountForm(f => ({...f, accountType: v}))}>
                    <option value="checking">{t('dashboard.admin.paymentAccounts.checkingType')}</option>
                    <option value="savings">{t('dashboard.admin.paymentAccounts.savingsType')}</option>
                    <option value="iban">IBAN</option>
                  </NativeSelect>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.accountNumber')}</label>
                  <Input value={paymentAccountForm.accountNumber} onChange={e => setPaymentAccountForm(f => ({...f, accountNumber: e.target.value}))} className="rounded-full text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.routingNumber')}</label>
                  <Input value={paymentAccountForm.routingNumber} onChange={e => setPaymentAccountForm(f => ({...f, routingNumber: e.target.value}))} className="rounded-full text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">IBAN</label>
                  <Input value={paymentAccountForm.iban} onChange={e => setPaymentAccountForm(f => ({...f, iban: e.target.value}))} className="rounded-full text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.swiftBic')}</label>
                  <Input value={paymentAccountForm.swift} onChange={e => setPaymentAccountForm(f => ({...f, swift: e.target.value}))} className="rounded-full text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.address')}</label>
                  <Input value={paymentAccountForm.address} onChange={e => setPaymentAccountForm(f => ({...f, address: e.target.value}))} className="rounded-full text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.sortOrder')}</label>
                  <Input type="number" value={paymentAccountForm.sortOrder} onChange={e => setPaymentAccountForm(f => ({...f, sortOrder: parseInt(e.target.value) || 0}))} className="rounded-full text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPaymentAccountDialog({ open: false, account: null })}>
                  {t('common.cancel')}
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={!paymentAccountForm.label || !paymentAccountForm.holder || !paymentAccountForm.bankName}
                  onClick={async () => {
                    try {
                      const body = { ...paymentAccountForm };
                      if (paymentAccountDialog.account) {
                        await apiRequest("PATCH", `/api/admin/payment-accounts/${paymentAccountDialog.account.id}`, body);
                        setFormMessage({ type: 'success', text: t('dashboard.admin.paymentAccounts.accountUpdated') });
                      } else {
                        await apiRequest("POST", "/api/admin/payment-accounts", body);
                        setFormMessage({ type: 'success', text: t('dashboard.admin.paymentAccounts.accountCreated') });
                      }
                      refetchPaymentAccounts();
                      setPaymentAccountDialog({ open: false, account: null });
                    } catch (e) {
                      setFormMessage({ type: 'error', text: t("common.error") });
                    }
                  }}
                  data-testid="button-save-payment-account-billing"
                >
                  {paymentAccountDialog.account ? t('common.save') : t('dashboard.admin.paymentAccounts.createAccount')}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
