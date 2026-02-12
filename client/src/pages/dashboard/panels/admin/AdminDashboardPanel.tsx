import { useTranslation } from "react-i18next";
import { getLocale, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "@/components/icons";
import { CrmMetricsSection } from "@/components/dashboard/crm-metrics-section";
import { apiRequest } from "@/lib/queryClient";

interface AdminDashboardPanelProps {
  adminStats: any;
  adminOrders: any[];
  adminUsers: any[];
  adminMessages: any[];
  adminDocuments: any[];
  guestVisitors: any;
  setAdminSubTab: (sub: string) => void;
  refetchGuests: () => void;
  showConfirm: (opts: { title: string; description: string; onConfirm: () => Promise<void> }) => void;
  setFormMessage: (msg: { type: 'error' | 'success' | 'info'; text: string } | null) => void;
}

export function AdminDashboardPanel({
  adminStats,
  adminOrders,
  adminUsers,
  adminMessages,
  adminDocuments,
  guestVisitors,
  setAdminSubTab,
  refetchGuests,
  showConfirm,
  setFormMessage,
}: AdminDashboardPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 md:space-y-7" data-testid="admin-dashboard-metrics">
      <div data-testid="section-sales">
        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-sales">{t('dashboard.admin.metrics.sales')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold leading-tight mb-2">{t('dashboard.admin.metrics.totalSales')}</p>
            <p className="text-lg md:text-2xl font-black text-accent dark:text-accent truncate" data-testid="stat-total-sales">{((adminStats?.totalSales || 0) / 100).toLocaleString(getLocale(), { style: 'currency', currency: 'EUR' })}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold leading-tight mb-2">{t('dashboard.admin.metrics.pendingCollection')}</p>
            <p className="text-lg md:text-2xl font-black text-accent dark:text-accent truncate" data-testid="stat-pending-sales">{((adminStats?.pendingSales || 0) / 100).toLocaleString(getLocale(), { style: 'currency', currency: 'EUR' })}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold leading-tight mb-2">{t('dashboard.admin.metrics.totalOrders')}</p>
            <p className="text-lg md:text-2xl font-black text-accent dark:text-accent" data-testid="stat-total-orders">{adminStats?.orderCount || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold leading-tight mb-2">{t('dashboard.admin.metrics.conversion')}</p>
            <p className="text-lg md:text-2xl font-black text-accent dark:text-accent" data-testid="stat-conversion">{adminStats?.conversionRate || 0}%</p>
          </Card>
        </div>
      </div>

      <div data-testid="section-orders">
        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-orders">{t('dashboard.admin.metrics.orderStatus')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">{t('dashboard.admin.metrics.pending')}</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-pending-orders">{adminStats?.pendingOrders || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">{t('dashboard.admin.metrics.inProcess')}</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-processing-orders">{adminStats?.processingOrders || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">{t('dashboard.admin.metrics.completed')}</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-completed-orders">{adminStats?.completedOrders || 0}</p>
          </Card>
        </div>
      </div>

      <div data-testid="section-crm">
        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-crm">{t('dashboard.admin.metrics.clients')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold mb-2">{t('dashboard.admin.metrics.totalUsers')}</p>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-total-users">{adminStats?.userCount || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">{t('dashboard.admin.metrics.active')}</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-active-users">{adminStats?.activeAccounts || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">VIP</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-vip-users">{adminStats?.vipAccounts || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">{t('dashboard.admin.metrics.inReview')}</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-pending-accounts">{adminStats?.pendingAccounts || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">{t('dashboard.admin.metrics.deactivated')}</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-deactivated-users">{adminStats?.deactivatedAccounts || 0}</p>
          </Card>
        </div>
      </div>

      <div data-testid="section-guests">
        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-guests">{t('dashboard.admin.guestSection.guests')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold mb-2">{t('dashboard.admin.guestSection.totalVisitors')}</p>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-total-guests">{(guestVisitors as any[])?.length || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold mb-2">{t('dashboard.admin.guestSection.withEmail')}</p>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-guests-with-email">{(guestVisitors as any[])?.filter((g: any) => g.email)?.length || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold mb-2">{t('dashboard.admin.guestSection.calculator')}</p>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-calculator-guests">{(guestVisitors as any[])?.filter((g: any) => g.source === 'calculator')?.length || 0}</p>
          </Card>
        </div>
        <Card className="rounded-xl border border-border/50 shadow-sm mt-3 p-0 overflow-hidden">
          <div className="divide-y max-h-80 overflow-y-auto">
            {(guestVisitors as any[])?.slice(0, 30)?.map((guest: any) => {
              let meta: any = null;
              try {
                if (guest.metadata) {
                  meta = typeof guest.metadata === 'string' ? JSON.parse(guest.metadata) : guest.metadata;
                }
              } catch {}
              return (
              <div key={guest.id} className="px-4 py-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold truncate">{guest.email || '-'}</p>
                    {guest.source === 'calculator' && (
                      <Badge className="text-[8px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{t('dashboard.admin.guestSection.calculator')}</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {guest.source !== 'calculator' && <>{t(`dashboard.admin.guestSection.${guest.source}`, guest.source)} · </>}{guest.page || '-'} · {guest.createdAt ? formatDate(guest.createdAt) : ''}
                  </p>
                  {meta && guest.source === 'calculator' && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {meta.income && (
                        <span className="text-[9px] bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent px-1.5 py-0.5 rounded-full font-medium">
                          ${Number(meta.income).toLocaleString('en-US')}
                        </span>
                      )}
                      {meta.country && (
                        <span className="text-[9px] bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent px-1.5 py-0.5 rounded-full font-medium">
                          {meta.country}
                        </span>
                      )}
                      {meta.activity && (
                        <span className="text-[9px] bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent px-1.5 py-0.5 rounded-full font-medium">
                          {meta.activity}
                        </span>
                      )}
                      {meta.savings !== undefined && meta.savings !== 0 && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${meta.savings > 0 ? 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                          {meta.savings > 0 ? '+' : ''}{t('dashboard.admin.guestSection.savingsLabel')}: ${Math.abs(meta.savings).toLocaleString('en-US')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive shrink-0"
                  onClick={() => {
                    showConfirm({
                      title: t('common.confirmAction'),
                      description: t('dashboard.admin.guestSection.confirmDelete'),
                      onConfirm: async () => {
                        try {
                          await apiRequest("DELETE", `/api/admin/guests/${guest.id}`);
                          refetchGuests();
                        } catch (e) {
                          setFormMessage({ type: 'error', text: t("common.error") });
                        }
                      },
                    });
                  }}
                  data-testid={`button-delete-guest-${guest.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );})}
            {(!guestVisitors || (guestVisitors as any[]).length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center">{t('dashboard.admin.guestSection.noGuests')}</p>
            )}
          </div>
        </Card>
      </div>

      <div data-testid="section-communications">
        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-communications">{t('dashboard.admin.metrics.communications')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold mb-2">{t('dashboard.admin.metrics.newsletterSubs')}</p>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-subscribers">{adminStats?.subscriberCount || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold mb-2">{t('dashboard.admin.metrics.totalMessages')}</p>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-total-messages">{adminStats?.totalMessages || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">{t('dashboard.admin.metrics.pendingMessages')}</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-pending-messages">{adminStats?.pendingMessages || 0}</p>
          </Card>
          <Card className="p-4 rounded-2xl border border-accent/20 dark:border-accent/20 shadow-sm bg-accent/5 dark:bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-accent dark:text-accent font-semibold">{t('dashboard.admin.metrics.pendingDocs')}</p>
            </div>
            <p className="text-xl md:text-3xl font-black text-accent dark:text-accent" data-testid="stat-pending-docs">{adminStats?.pendingDocs || 0}</p>
          </Card>
        </div>
      </div>

      <CrmMetricsSection />

    </div>
  );
}