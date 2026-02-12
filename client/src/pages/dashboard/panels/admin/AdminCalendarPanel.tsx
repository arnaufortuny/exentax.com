import { useTranslation } from "react-i18next";
import { Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AdminCalendarPanelProps {
  adminOrders: any[];
  updateLlcDatesMutation: { mutate: (params: { appId: number; field: string; value: string | null }) => void };
  setFormMessage: (msg: { type: 'error' | 'success' | 'info'; text: string } | null) => void;
  showConfirm: (opts: { title: string; description: string; onConfirm: () => Promise<void> }) => void;
}

export function AdminCalendarPanel({ adminOrders, updateLlcDatesMutation, setFormMessage, showConfirm }: AdminCalendarPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h4 className="font-black text-lg">
        {t('dashboard.admin.calendar.title')}
      </h4>
    <Card className="rounded-2xl shadow-sm p-4 md:p-6 overflow-hidden">
      <div className="space-y-4 md:space-y-6">
        {adminOrders?.map((order: any) => {
          const app = order.application;
          if (!app) return null;
          const fiscalOrderCode = app?.requestCode || order.invoiceNumber;
          return (
            <div key={order.id} className="border-2 rounded-2xl p-4 md:p-5 bg-muted/50 dark:bg-card/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <p className="font-black text-base md:text-lg">{app.companyName || t('dashboard.admin.calendar.llcPending')}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{order.user?.firstName} {order.user?.lastName} • {app.state}</p>
                </div>
                <Badge variant="outline" className="text-xs w-fit">{fiscalOrderCode}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">{t('dashboard.admin.calendar.llcCreation')}</Label>
                  <Input 
                    type="date" 
                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                    defaultValue={app.llcCreatedDate ? new Date(app.llcCreatedDate).toISOString().split('T')[0] : ''}
                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'llcCreatedDate', value: e.target.value })}
                    data-testid={`input-llc-created-${app.id}`}
                  />
                </div>
                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">{t('dashboard.admin.calendar.agentRenewal')}</Label>
                  <Input 
                    type="date" 
                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                    defaultValue={app.agentRenewalDate ? new Date(app.agentRenewalDate).toISOString().split('T')[0] : ''}
                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'agentRenewalDate', value: e.target.value })}
                    data-testid={`input-agent-renewal-${app.id}`}
                  />
                </div>
                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">IRS 1120</Label>
                  <Input 
                    type="date" 
                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                    defaultValue={app.irs1120DueDate ? new Date(app.irs1120DueDate).toISOString().split('T')[0] : ''}
                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs1120DueDate', value: e.target.value })}
                    data-testid={`input-irs1120-${app.id}`}
                  />
                </div>
                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">IRS 5472</Label>
                  <Input 
                    type="date" 
                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                    defaultValue={app.irs5472DueDate ? new Date(app.irs5472DueDate).toISOString().split('T')[0] : ''}
                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs5472DueDate', value: e.target.value })}
                    data-testid={`input-irs5472-${app.id}`}
                  />
                </div>
                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border col-span-2">
                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">{t('dashboard.admin.calendar.annualReport')}</Label>
                  <Input 
                    type="date" 
                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                    defaultValue={app.annualReportDueDate ? new Date(app.annualReportDueDate).toISOString().split('T')[0] : ''}
                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'annualReportDueDate', value: e.target.value })}
                    data-testid={`input-annual-report-${app.id}`}
                  />
                </div>
              </div>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block">EIN (Employer Identification Number)</Label>
                  <Input 
                    type="text" 
                    placeholder="XX-XXXXXXX"
                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 font-mono rounded-full"
                    defaultValue={app.ein || ''}
                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'ein', value: e.target.value })}
                    data-testid={`input-ein-${app.id}`}
                  />
                </div>
              </div>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t flex items-center justify-between">
                <div>
                  <Label className="text-xs md:text-sm font-bold text-foreground">{t("dashboard.calendar.taxExtension.label")}</Label>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {app.hasTaxExtension 
                      ? t("dashboard.calendar.taxExtension.datesOctober") 
                      : t("dashboard.calendar.taxExtension.datesApril")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={app.hasTaxExtension ? "default" : "outline"}
                  className={`rounded-full text-xs ${app.hasTaxExtension ? "bg-accent text-primary" : ""}`}
                  onClick={async () => {
                    try {
                      const res = await apiRequest("PATCH", `/api/admin/llc/${app.id}/tax-extension`, {
                        hasTaxExtension: !app.hasTaxExtension
                      });
                      if (res.ok) {
                        queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                        setFormMessage({ type: 'success', text: (!app.hasTaxExtension ? t("dashboard.calendar.taxExtension.activated") : t("dashboard.calendar.taxExtension.deactivated")) + ". " + !app.hasTaxExtension 
                            ? t("dashboard.calendar.taxExtension.movedToOctober")
                            : t("dashboard.calendar.taxExtension.movedToApril") });
                      }
                    } catch {
                      setFormMessage({ type: 'error', text: t("common.error") });
                    }
                  }}
                  data-testid={`button-tax-extension-${app.id}`}
                >
                  {app.hasTaxExtension ? t("dashboard.calendar.taxExtension.active") : t("dashboard.calendar.taxExtension.inactive")}
                </Button>
              </div>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t flex items-center justify-between">
                <div>
                  <Label className="text-xs md:text-sm font-bold text-foreground text-red-600">{t('dashboard.calendar.clearCalendar')}</Label>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {t('dashboard.calendar.clearCalendarDesc')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs text-red-600 border-red-200"
                  onClick={() => {
                    showConfirm({
                      title: t('common.confirmAction'),
                      description: t('dashboard.calendar.clearCalendarConfirm'),
                      onConfirm: async () => {
                        try {
                          await Promise.all([
                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'llcCreatedDate', value: null }),
                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'agentRenewalDate', value: null }),
                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'irs1120DueDate', value: null }),
                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'irs5472DueDate', value: null }),
                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'annualReportDueDate', value: null }),
                          ]);
                          queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                          setFormMessage({ type: 'success', text: t("dashboard.toasts.calendarCleared") + ". " + t("dashboard.toasts.calendarClearedDesc") });
                        } catch {
                          setFormMessage({ type: 'error', text: t("common.error") });
                        }
                      },
                    });
                  }}
                  data-testid={`button-clear-calendar-${app.id}`}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> {t('dashboard.calendar.clear')}
                </Button>
              </div>
            </div>
          );
        })}
        {(!adminOrders || adminOrders.length === 0) && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('dashboard.admin.calendar.noOrders')}
          </div>
        )}
      </div>
    </Card>
    </div>
  );
}
