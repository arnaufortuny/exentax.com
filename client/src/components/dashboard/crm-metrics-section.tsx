import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, DollarSign, BarChart3 } from "@/components/icons";
import { getLocale } from "@/lib/utils";

type MonthlyRevenue = {
  month: string;
  revenue: string;
  pending_revenue: string;
  total_orders: string;
  completed_orders: string;
  pending_orders: string;
  processing_orders: string;
  cancelled_orders: string;
};

type MonthlyUsers = {
  month: string;
  new_users: string;
};

type FunnelData = {
  visitors: number;
  registered: number;
  startedOrder: number;
  completedOrder: number;
  totalPaidOrders: number;
  repeatClients: number;
  vipClients: number;
};

type TopClient = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  account_status: string;
  client_id: string | null;
  order_count: string;
  total_spent: string;
};

type LifecycleData = {
  statusBreakdown: { account_status: string; count: string; verified: string; subscribers: string }[];
  topClients: TopClient[];
  recentActivity: { day: string; logins: string; orders_created: string; orders_completed: string; registrations: string }[];
};

export function CrmMetricsSection() {
  const { t } = useTranslation();

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<{
    revenue: MonthlyRevenue[];
    orders: any[];
    users: MonthlyUsers[];
  }>({
    queryKey: ["/api/admin/metrics/monthly"],
    staleTime: 1000 * 60 * 5,
  });

  const { data: funnelData, isLoading: funnelLoading } = useQuery<FunnelData>({
    queryKey: ["/api/admin/metrics/funnel"],
    staleTime: 1000 * 60 * 5,
  });

  const { data: lifecycleData, isLoading: lifecycleLoading } = useQuery<LifecycleData>({
    queryKey: ["/api/admin/metrics/lifecycle"],
    staleTime: 1000 * 60 * 5,
  });

  const formatCurrency = (cents: number) =>
    (cents / 100).toLocaleString(getLocale(), { style: 'currency', currency: 'EUR' });

  const maxRevenue = Math.max(
    ...(monthlyData?.revenue?.map(r => Number(r.revenue)) || [1])
  );

  const maxActivity = Math.max(
    ...(lifecycleData?.recentActivity?.map(d =>
      Number(d.logins) + Number(d.orders_created) + Number(d.registrations)
    ) || [1])
  );

  return (
    <div className="space-y-5 md:space-y-7" data-testid="crm-metrics-section">
      <div data-testid="section-revenue-trend">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="font-black text-lg tracking-tight">{t('dashboard.admin.crm.monthlyRevenue')}</h3>
        </div>
        {monthlyLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          </div>
        ) : (
          <Card className="p-4 rounded-2xl shadow-sm">
            {monthlyData?.revenue && monthlyData.revenue.length > 0 ? (
              <div className="space-y-2">
                {monthlyData.revenue.map((row) => {
                  const rev = Number(row.revenue);
                  const pct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
                  return (
                    <div key={row.month} className="flex items-center gap-3" data-testid={`revenue-row-${row.month}`}>
                      <span className="text-[11px] font-mono text-muted-foreground w-16 shrink-0">{row.month}</span>
                      <div className="flex-1 h-6 bg-muted/30 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-accent/20 dark:bg-accent/30 rounded-md transition-all"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                        <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-foreground">
                          {formatCurrency(rev)}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground w-12 text-right shrink-0">{row.completed_orders} ord.</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">{t('dashboard.admin.crm.noData')}</p>
            )}
          </Card>
        )}
      </div>

      <div data-testid="section-funnel">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <BarChart3 className="w-4 h-4 text-accent" />
          <h3 className="font-black text-lg tracking-tight">{t('dashboard.admin.crm.conversionFunnel')}</h3>
        </div>
        {funnelLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          </div>
        ) : funnelData ? (
          <Card className="p-4 rounded-2xl shadow-sm">
            <div className="space-y-2">
              {[
                { label: t('dashboard.admin.crm.funnelSubscribers'), value: funnelData.visitors, color: 'bg-blue-400 dark:bg-blue-500' },
                { label: t('dashboard.admin.crm.funnelRegistered'), value: funnelData.registered, color: 'bg-teal-400 dark:bg-teal-500' },
                { label: t('dashboard.admin.crm.funnelStartedOrder'), value: funnelData.startedOrder, color: 'bg-accent' },
                { label: t('dashboard.admin.crm.funnelCompletedOrder'), value: funnelData.completedOrder, color: 'bg-emerald-500 dark:bg-emerald-400' },
                { label: t('dashboard.admin.crm.funnelRepeat'), value: funnelData.repeatClients, color: 'bg-lime-500 dark:bg-lime-400' },
                { label: 'VIP', value: funnelData.vipClients, color: 'bg-yellow-500 dark:bg-yellow-400' },
              ].map((step, idx) => {
                const maxVal = Math.max(funnelData.visitors, funnelData.registered, 1);
                const pct = (step.value / maxVal) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3" data-testid={`funnel-step-${idx}`}>
                    <span className="text-[11px] font-semibold text-muted-foreground w-28 shrink-0 truncate">{step.label}</span>
                    <div className="flex-1 h-7 bg-muted/30 rounded-md overflow-hidden relative">
                      <div
                        className={`h-full ${step.color} opacity-30 rounded-md transition-all`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-xs font-black text-foreground">
                        {step.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : null}
      </div>

      <div data-testid="section-top-clients">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <DollarSign className="w-4 h-4 text-accent" />
          <h3 className="font-black text-lg tracking-tight">{t('dashboard.admin.crm.topClients')}</h3>
        </div>
        {lifecycleLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          </div>
        ) : lifecycleData?.topClients && lifecycleData.topClients.length > 0 ? (
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y max-h-96 overflow-y-auto">
              {lifecycleData.topClients.map((client, idx) => (
                <div key={client.id} className="px-4 py-3 flex items-center gap-3" data-testid={`top-client-${idx}`}>
                  <span className="text-[11px] font-black text-muted-foreground w-6 text-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold truncate">
                        {client.first_name || ''} {client.last_name || ''}
                      </p>
                      {client.account_status === 'vip' && (
                        <Badge className="text-[8px] bg-gradient-to-r from-lime-400 to-emerald-500 text-white">VIP</Badge>
                      )}
                      {client.client_id && (
                        <span className="text-[9px] font-mono text-muted-foreground">#{client.client_id}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{client.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-accent">{formatCurrency(Number(client.total_spent))}</p>
                    <p className="text-[10px] text-muted-foreground">{client.order_count} {t('dashboard.admin.crm.orders')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-muted-foreground text-center">{t('dashboard.admin.crm.noData')}</p>
          </Card>
        )}
      </div>

      <div data-testid="section-daily-activity">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Users className="w-4 h-4 text-accent" />
          <h3 className="font-black text-lg tracking-tight">{t('dashboard.admin.crm.dailyActivity')}</h3>
        </div>
        {lifecycleLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          </div>
        ) : lifecycleData?.recentActivity && lifecycleData.recentActivity.length > 0 ? (
          <Card className="p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] text-muted-foreground">{t('dashboard.admin.crm.logins')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[10px] text-muted-foreground">{t('dashboard.admin.crm.newOrders')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime-400" />
                <span className="text-[10px] text-muted-foreground">{t('dashboard.admin.crm.registrations')}</span>
              </div>
            </div>
            <div className="space-y-1">
              {lifecycleData.recentActivity.slice(-14).map((day) => {
                const logins = Number(day.logins);
                const orders = Number(day.orders_created);
                const regs = Number(day.registrations);
                const total = logins + orders + regs;
                const pct = maxActivity > 0 ? (total / maxActivity) * 100 : 0;
                const dayLabel = new Date(day.day).toLocaleDateString(getLocale(), { day: '2-digit', month: 'short' });
                return (
                  <div key={day.day} className="flex items-center gap-2" data-testid={`activity-day-${day.day}`}>
                    <span className="text-[10px] font-mono text-muted-foreground w-14 shrink-0">{dayLabel}</span>
                    <div className="flex-1 h-5 bg-muted/20 rounded-sm overflow-hidden flex">
                      {logins > 0 && (
                        <div className="h-full bg-accent/40" style={{ width: `${(logins / Math.max(total, 1)) * Math.max(pct, 3)}%` }} />
                      )}
                      {orders > 0 && (
                        <div className="h-full bg-blue-400/40" style={{ width: `${(orders / Math.max(total, 1)) * Math.max(pct, 3)}%` }} />
                      )}
                      {regs > 0 && (
                        <div className="h-full bg-lime-400/40" style={{ width: `${(regs / Math.max(total, 1)) * Math.max(pct, 3)}%` }} />
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground w-16 text-right shrink-0 font-mono">{logins}/{orders}/{regs}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-muted-foreground text-center">{t('dashboard.admin.crm.noData')}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
