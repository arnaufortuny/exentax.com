import { memo, useCallback } from "react";
import { X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tab } from "./types";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/utils";

function translateNotifText(text: string, t: ReturnType<typeof useTranslation>['t']): string {
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
}

interface NotificationsTabProps {
  notifications: any[] | undefined;
  notificationsLoading: boolean;
  user: any;
  markNotificationRead: { mutate: (id: string) => void };
  deleteNotification: { mutate: (id: string) => void; isPending: boolean };
  setActiveTab: (tab: Tab) => void;
}


export const NotificationsTab = memo(function NotificationsTab({ 
  notifications, 
  notificationsLoading,
  user,
  markNotificationRead,
  deleteNotification,
  setActiveTab
}: NotificationsTabProps) {
  const { t } = useTranslation();
  const tn = useCallback((text: string) => translateNotifText(text, t), [t]);
  
  return (
    <div key="notifications" className="space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{t("dashboard.notifications.title")}</h2>
        <p className="text-base text-muted-foreground mt-1">{t("dashboard.notifications.subtitle")}</p>
      </div>
      {notificationsLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Card key={i} className="rounded-2xl shadow-sm">
              <CardContent className="p-2.5 sm:p-3 md:p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded-full animate-pulse w-3/4" />
                    <div className="h-3 bg-muted rounded-full animate-pulse w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications?.length === 0 ? (
        <Card className="rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-accent/30" />
            </span>
            <div>
              <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t("dashboard.notifications.empty")}</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">{t("dashboard.notifications.subtitle")}</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications?.map((notif: any) => (
            <Card 
              key={notif.id} 
              className={`rounded-2xl shadow-sm transition-all ${!notif.isRead ? 'bg-white dark:bg-card ring-1 ring-accent/20' : 'bg-white dark:bg-card'}`}
              onClick={() => { if (!notif.isRead) markNotificationRead.mutate(notif.id); }}
            >
              <CardContent className="p-2.5 sm:p-3 md:p-4">
                <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        <h3 className={`text-xs sm:text-sm ${!notif.isRead ? 'font-black' : 'font-bold text-foreground/80'}`}>{tn(notif.title)}</h3>
                        
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notif.type === 'action_required' && (
                          <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold">
                            {t("dashboard.notifications.actionRequired")}
                          </Badge>
                        )}
                        {notif.type === 'update' && (
                          <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate bg-accent/10 text-accent text-[10px] font-bold">
                            {t("dashboard.notifications.update")}
                          </Badge>
                        )}
                        {notif.type === 'info' && (
                          <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate bg-accent/10 text-accent text-[10px] font-bold">
                            {t("dashboard.notifications.info")}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                          onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(notif.id); }}
                          disabled={deleteNotification.isPending}
                          data-testid={`button-delete-notification-${notif.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-snug">{tn(notif.message)}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {notif.orderCode && (
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {t("dashboard.orders.order")}: {notif.orderCode}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(notif.createdAt)}</span>
                    </div>
                    {notif.type === 'action_required' && user?.accountStatus !== 'deactivated' && (
                      <Button 
                        className="mt-2 bg-accent text-accent-foreground font-black rounded-full text-xs px-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead.mutate(notif.id);
                          setActiveTab('documents');
                        }}
                        data-testid={`button-upload-document-${notif.id}`}
                      >
                        
                        {t("dashboard.documents.upload")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});
