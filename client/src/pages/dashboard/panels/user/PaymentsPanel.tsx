import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/utils";
import { CreditCard } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface PaymentsPanelProps {
  orders: any[] | undefined;
  clientInvoices: any[] | undefined;
}

export function PaymentsPanel({ orders, clientInvoices }: PaymentsPanelProps) {
  const { t } = useTranslation();

  return (
    <div key="payments" className="space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.payments.title')}</h2>
        <p className="text-base text-muted-foreground mt-1">{t('dashboard.payments.subtitle')}</p>
      </div>

      {clientInvoices && clientInvoices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black tracking-tight">{t('dashboard.payments.invoiceLabel')}</h3>
          {clientInvoices.map((inv: any) => {
            const currencySymbol = inv.currency === 'USD' ? '$' : '€';
            const statusMap: Record<string, { label: string; color: string }> = {
              pending: { label: t('dashboard.payments.pending'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
              paid: { label: t('dashboard.payments.paid'), color: 'bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent' },
              completed: { label: t('dashboard.payments.completed'), color: 'bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent' },
              cancelled: { label: t('dashboard.payments.cancelled'), color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
              refunded: { label: t('dashboard.payments.refunded'), color: 'bg-muted text-foreground dark:bg-card/30 dark:text-muted-foreground' },
            };
            const st = statusMap[inv.status] || statusMap.pending;
            return (
              <Card key={inv.id} className="rounded-2xl shadow-sm bg-white dark:bg-card" data-testid={`invoice-client-${inv.id}`}>
                <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-xs md:text-sm">{inv.invoiceNumber}</span>
                      <Badge className={`text-[10px] no-default-hover-elevate no-default-active-elevate ${st.color}`}>{st.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{inv.concept}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)} | {(inv.amount / 100).toFixed(2)} {currencySymbol}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {inv.fileUrl && (
                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => window.open(`/api/user/invoices/${inv.id}/download`, '_blank')} data-testid={`button-view-client-invoice-${inv.id}`}>
                        {t('dashboard.payments.invoice')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        {(!orders || orders.length === 0) && (!clientInvoices || clientInvoices.length === 0) ? (
          <Card className="rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="widget-payments-empty">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <CreditCard className="w-12 h-12 md:w-16 md:h-16 text-accent" />
              <div>
                <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.payments.empty')}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.payments.emptyDesc')}</p>
              </div>
              <Link href="/servicios#pricing">
                <Button className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-view-services">
                  {t('dashboard.payments.viewServices')}
                </Button>
              </Link>
            </div>
          </Card>
        ) : orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="rounded-2xl shadow-sm p-6 flex justify-between items-center bg-white dark:bg-card">
              <div>
                <p className="font-black text-xs md:text-sm">{t('dashboard.payments.invoiceLabel')} {order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber}</p>
                <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}>{t('dashboard.payments.invoice')}</Button>
              </div>
            </Card>
          ))
        ) : null}
      </div>
    </div>
  );
}
