import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getOrderStatusLabel } from "@/components/dashboard/types";
import { translateI18nText } from "./PendingReviewCard";
import {
  AlertCircle,
  Clock,
  UserCheck,
  FileUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  ClipboardList,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RightSidebarContentProps {
  user: any;
  orders: any[];
  selectedOrderEvents: any[];
  notifications: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function RightSidebarContent({
  user,
  orders,
  selectedOrderEvents,
  notifications,
  activeTab,
  setActiveTab,
}: RightSidebarContentProps) {
  const { t } = useTranslation();

  const tn = useCallback((text: string) => {
    if (!text || !text.startsWith('i18n:')) return text;
    const rest = text.substring(5);
    const sepIdx = rest.indexOf('::');
    if (sepIdx > -1) {
      const key = rest.substring(0, sepIdx);
      try {
        const params = JSON.parse(rest.substring(sepIdx + 2));
        const resolvedParams: Record<string, string> = {};
        for (const [k, v] of Object.entries(params)) {
          if (typeof v === 'string' && v.startsWith('@')) {
            const nestedKey = v.substring(1);
            const translated = t(nestedKey);
            resolvedParams[k] = typeof translated === 'string' && translated !== nestedKey ? translated : v.substring(1);
          } else {
            resolvedParams[k] = String(v);
          }
        }
        const result = t(key, resolvedParams);
        return typeof result === 'string' && result !== key ? result : text;
      } catch {
        const result = t(key);
        return typeof result === 'string' && result !== key ? result : text;
      }
    }
    const result = t(rest);
    return typeof result === 'string' && result !== rest ? result : text;
  }, [t]);

  if (user?.isAdmin) return null;

  const hasActionItems =
    notifications?.some((n: any) => n.type === 'action_required' && !(n.title || '').includes('accountDeactivated') && !(n.message || '').includes('accountDeactivated')) ||
    notifications?.some((n: any) => n.type === 'info' && (n.title || '').includes('docInReview')) ||
    !!(user as any)?.pendingProfileChanges ||
    orders?.some((o: any) => o.application?.fiscalYearEnd && new Date(o.application.fiscalYearEnd) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) ||
    orders?.some((o: any) => o.status === 'pending_payment' || o.status === 'payment_failed');

  return (
    <>
      {hasActionItems && (
        <Card className="rounded-2xl border-2 border-red-300 dark:border-red-800 shadow-sm bg-red-50 dark:bg-red-950/30 p-6 md:p-8" data-testid="section-action-required-global">
          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-black tracking-tight text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" /> {t('dashboard.actionRequired.title')}
            </h3>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">{t('dashboard.actionRequired.subtitle')}</p>
          </div>
          <div className="space-y-3">
            {!!(user as any)?.pendingProfileChanges && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 p-3" data-testid="action-item-profile-pending">
                <UserCheck className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{t('dashboard.actionRequired.profilePending')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('dashboard.actionRequired.profilePendingDesc')}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => setActiveTab('profile')}
                  data-testid="button-action-profile-pending"
                >
                  {t('dashboard.actionRequired.verify')}
                </Button>
              </div>
            )}
            {notifications?.filter((n: any) => n.type === 'action_required' && !(n.title || '').includes('accountDeactivated') && !(n.message || '').includes('accountDeactivated')).map((n: any) => (
              <div key={n.id} className="flex items-start gap-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 p-3" data-testid={`action-item-document-${n.id}`}>
                <FileUp className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{t('dashboard.actionRequired.documentRequest')}</p>
                  <p className="text-[10px] text-muted-foreground">{tn(n.message)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => setActiveTab('documents')}
                  data-testid={`button-action-document-${n.id}`}
                >
                  {t('dashboard.actionRequired.viewDocuments')}
                </Button>
              </div>
            ))}
            {notifications?.filter((n: any) => n.type === 'info' && (n.title || '').includes('docInReview')).map((n: any) => (
              <div key={n.id} className="flex items-start gap-3 rounded-xl bg-accent/5 dark:bg-accent/10 p-3" data-testid={`action-item-doc-review-${n.id}`}>
                <Clock className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{t('dashboard.documents.underReview')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('dashboard.documents.underReviewDesc')}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => setActiveTab('documents')}
                  data-testid={`button-action-doc-review-${n.id}`}
                >
                  {t('dashboard.actionRequired.viewDocuments')}
                </Button>
              </div>
            ))}
            {orders?.filter((o: any) => o.status === 'pending_payment' || o.status === 'payment_failed').map((o: any) => (
              <div key={o.id} className="flex items-start gap-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 p-3" data-testid={`action-item-payment-${o.id}`}>
                <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{t('dashboard.actionRequired.paymentPending')}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{o.application?.companyName || o.maintenanceApplication?.requestCode || o.invoiceNumber}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => setActiveTab('payments')}
                  data-testid={`button-action-payment-${o.id}`}
                >
                  {t('dashboard.actionRequired.payNow')}
                </Button>
              </div>
            ))}
            {orders?.filter((o: any) => o.application?.fiscalYearEnd && new Date(o.application.fiscalYearEnd) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).map((o: any) => (
              <div key={`fiscal-${o.id}`} className="flex items-start gap-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 p-3" data-testid={`action-item-fiscal-${o.id}`}>
                <Calendar className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{t('dashboard.actionRequired.fiscalDeadline')}</p>
                  <p className="text-[10px] text-muted-foreground">{o.application?.companyName} - {formatDate(o.application.fiscalYearEnd)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => setActiveTab('calendar')}
                  data-testid={`button-action-fiscal-${o.id}`}
                >
                  {t('dashboard.actionRequired.viewCalendar')}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className={`rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 ${activeTab !== 'services' ? 'hidden xl:block' : ''}`}>
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-black tracking-tight text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" /> {t('dashboard.tracking.title')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{t('dashboard.tracking.subtitle')}</p>
        </div>
        <div className="space-y-5">
          {orders && orders.length > 0 ? (
            <>
              <div className="rounded-xl bg-muted dark:bg-card p-3 mb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-accent uppercase tracking-wider mb-0.5">{t('dashboard.tracking.order')}: {orders[0]?.application?.requestCode || orders[0]?.maintenanceApplication?.requestCode || orders[0]?.invoiceNumber || orders[0]?.id}</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {orders[0]?.maintenanceApplication
                        ? `${t('dashboard.services.maintenance')} ${orders[0]?.maintenanceApplication?.state || ''}`
                        : orders[0]?.application?.companyName
                          ? `${orders[0]?.application?.companyName} LLC`
                          : orders[0]?.product?.name || 'LLC'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{orders[0]?.application?.state || orders[0]?.maintenanceApplication?.state || ''}</p>
                  </div>
                  <Badge className={`${getOrderStatusLabel(orders[0]?.status || '', t).className} font-bold text-[9px] shrink-0`}>
                    {getOrderStatusLabel(orders[0]?.status || '', t).label}
                  </Badge>
                </div>
                <p className="text-[9px] text-muted-foreground mt-2">{t('dashboard.tracking.created')}: {orders[0]?.createdAt ? formatDate(orders[0].createdAt) : '-'}</p>
              </div>
              {selectedOrderEvents && selectedOrderEvents.length > 0 ? (
                selectedOrderEvents.map((event: any, idx: number) => (
                  <div key={event.id} className="flex gap-4 relative">
                    {idx < selectedOrderEvents.length - 1 && <div className="absolute left-3 top-6 w-0.5 h-8 bg-muted" />}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 bg-accent text-primary"><CheckCircle2 className="w-3 h-3" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs md:text-sm font-semibold text-foreground truncate">{translateI18nText(event.eventType, t)}</p>
                        {event.createdAt && (
                          <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                            {formatDate(event.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{translateI18nText(event.description, t)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div><p className="text-xs font-black">{t('dashboard.tracking.orderReceived')}</p></div>
                  <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-muted" /><p className="text-xs text-muted-foreground">{t('dashboard.tracking.dataVerification')}</p></div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 md:gap-4 text-center py-4">
              <ClipboardList className="w-12 h-12 md:w-16 md:h-16 text-accent" />
              <div>
                <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.tracking.empty')}</h3>
                <p className="text-xs md:text-sm text-muted-foreground text-center">{t('dashboard.tracking.emptyDescription')}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 mb-16 md:mb-12 text-center" data-testid="card-support-help">
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <div>
            <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.support.haveQuestion')}</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.support.hereToHelp')}</p>
          </div>
          <a href={getWhatsAppUrl("dashboardLlc")} target="_blank" rel="noopener noreferrer">
            <Button className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-talk-to-support">{t('dashboard.support.talkToSupport')}</Button>
          </a>
        </div>
      </Card>
    </>
  );
}
