import { useTranslation } from "react-i18next";
import { formatDateCompact } from "@/lib/utils";
import { Link } from "wouter";
import { Building2, FileText, Clock, UserCheck, Newspaper, Calendar, XCircle, CheckCircle, AlertCircle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CalendarPanelProps {
  orders: any[];
}

export function CalendarPanel({ orders }: CalendarPanelProps) {
  const { t } = useTranslation();

  return (
    <div key="calendar" className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.calendar.title')}</h2>
          <p className="text-base text-muted-foreground mt-1">{t('dashboard.calendar.subtitle')}</p>
        </div>
      </div>
      {orders && orders.length > 0 ? (
        <div className="space-y-4 md:space-y-6">
          {orders.map((order: any) => {
            const app = order.application;
            if (!app) return null;
            const isCancelled = order.status === 'cancelled';
            const isInReview = ['pending', 'paid', 'processing'].includes(order.status);
            const stateHasAnnualReport = ['Wyoming', 'Delaware', 'WY', 'DE'].includes(app.state);
            const dates = [
              { label: t('dashboard.calendar.creation'), fullLabel: t('dashboard.calendar.creationFull'), date: app.llcCreatedDate, icon: Building2, bgColor: 'bg-accent/10', textColor: 'text-accent', borderColor: 'border-accent/20' },
              { label: t('dashboard.calendar.agent'), fullLabel: t('dashboard.calendar.agentFull'), date: app.agentRenewalDate, icon: UserCheck, bgColor: 'bg-accent/5 dark:bg-accent/10', textColor: 'text-accent dark:text-accent', borderColor: 'border-accent/20 dark:border-accent/30' },
              { label: 'IRS 1120', fullLabel: t('dashboard.calendar.irs1120'), date: app.irs1120DueDate, icon: FileText, bgColor: 'bg-accent/5 dark:bg-accent/10', textColor: 'text-accent dark:text-accent', borderColor: 'border-accent/30 dark:border-accent/30' },
              { label: 'IRS 5472', fullLabel: t('dashboard.calendar.irs5472'), date: app.irs5472DueDate, icon: FileText, bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-600 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-800' },
              ...(stateHasAnnualReport ? [{ label: t('dashboard.calendar.annual'), fullLabel: `${t('dashboard.calendar.annualFull')} ${app.state}`, date: app.annualReportDueDate, icon: Newspaper, bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-800' }] : []),
            ];
            const hasDates = dates.some(d => d.date);
            const sortedDates = dates.filter(d => d.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const nextDeadline = sortedDates.find(d => new Date(d.date) > new Date());
            
            return (
              <Card key={order.id} className={`rounded-xl md:rounded-2xl border shadow-sm bg-white dark:bg-card overflow-hidden ${isCancelled ? 'opacity-50' : ''}`}>
                <CardHeader className="p-3 md:p-4 pb-2 md:pb-3 border-b bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-sm md:text-base font-black flex items-center gap-2 flex-wrap">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base">{app.companyName || t('dashboard.llcStatus.inProcess')}</span>
                        <span className="text-[10px] md:text-xs font-normal text-muted-foreground">{app.state}</span>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCancelled && <Badge variant="destructive" className="text-[9px] md:text-[10px]">{t('dashboard.calendar.cancelled')}</Badge>}
                      {isInReview && <Badge className="text-[9px] md:text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{t('dashboard.calendar.inReview')}</Badge>}
                      {!isCancelled && !isInReview && nextDeadline && (
                        <Badge className={`text-[9px] md:text-[10px] ${nextDeadline.bgColor} ${nextDeadline.textColor}`}>
                          {t('dashboard.calendar.next')}: {nextDeadline.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4">
                  {isCancelled ? (
                    <div className="text-center py-6 md:py-8">
                      <XCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto text-red-300 mb-2 md:mb-3" />
                      <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.llcStatus.cancelled')}</p>
                    </div>
                  ) : isInReview ? (
                    <div className="text-center py-6 md:py-8">
                      <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto text-yellow-400 mb-2 md:mb-3" />
                      <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.llcStatus.inProcess')}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{t('dashboard.llcStatus.datesWillAppear')}</p>
                    </div>
                  ) : hasDates ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                      {sortedDates.map((item, idx) => {
                        const date = new Date(item.date);
                        const now = new Date();
                        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const isPast = date < now;
                        const isUrgent = !isPast && daysUntil <= 30;
                        const isWarning = !isPast && daysUntil <= 60 && daysUntil > 30;
                        const IconComponent = item.icon;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border ${item.borderColor} ${item.bgColor} transition-all hover:shadow-md`}
                          >
                            <div className={`flex items-center gap-1.5 md:gap-2 mb-2 ${item.textColor}`}>
                              <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span className="font-bold text-[10px] md:text-xs truncate">{item.label}</span>
                            </div>
                            <div className="font-black text-xs md:text-sm text-foreground">
                              {formatDateCompact(date)}
                            </div>
                            <div className="text-[9px] md:text-[10px] text-muted-foreground">
                              {date.getFullYear()}
                            </div>
                            {isPast ? (
                              <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-accent" />
                                <span className="text-[9px] md:text-[10px] text-accent dark:text-accent font-medium">{t('dashboard.calendar.completed')}</span>
                              </div>
                            ) : isUrgent ? (
                              <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-red-500" />
                                <span className="text-[9px] md:text-[10px] text-red-600 dark:text-red-400 font-bold">{daysUntil} {t('dashboard.calendar.days')}</span>
                              </div>
                            ) : isWarning ? (
                              <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-accent" />
                                <span className="text-[9px] md:text-[10px] text-accent dark:text-accent font-medium">{daysUntil} {t('dashboard.calendar.days')}</span>
                              </div>
                            ) : (
                              <div className="mt-1.5 md:mt-2">
                                <span className="text-[9px] md:text-[10px] text-muted-foreground">{daysUntil} {t('dashboard.calendar.days')}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8">
                      <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto opacity-30 mb-2 md:mb-3 text-muted-foreground" />
                      <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.calendar.pendingDates')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="widget-calendar-empty">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <Calendar className="w-12 h-12 md:w-16 md:h-16 text-accent" />
            <div>
              <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.calendar.title')}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.calendar.emptyDescription')}</p>
            </div>
            <Link href="/servicios#pricing">
              <Button className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-start-llc-calendar">
                {t('dashboard.calendar.createLlc')}
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}