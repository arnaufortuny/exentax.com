import { Upload, X, Bell, AlertCircle, CheckCircle, Info } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tab } from "./types";
import { useTranslation } from "react-i18next";

interface NotificationsTabProps {
  notifications: any[] | undefined;
  notificationsLoading: boolean;
  user: any;
  markNotificationRead: { mutate: (id: string) => void };
  deleteNotification: { mutate: (id: string) => void; isPending: boolean };
  setActiveTab: (tab: Tab) => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'action_required':
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    case 'update':
      return <CheckCircle className="w-5 h-5 text-accent" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
}

function getNotificationIconBg(type: string) {
  switch (type) {
    case 'action_required':
      return 'bg-orange-50 dark:bg-orange-900/20';
    case 'update':
      return 'bg-accent/10';
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20';
    default:
      return 'bg-muted';
  }
}

export function NotificationsTab({ 
  notifications, 
  notificationsLoading,
  user,
  markNotificationRead,
  deleteNotification,
  setActiveTab
}: NotificationsTabProps) {
  const { t } = useTranslation();
  
  return (
    <div key="notifications" className="space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{t("dashboard.notifications.title")}</h2>
        <p className="text-base text-muted-foreground mt-1">{t("dashboard.tracking.subtitle")}</p>
      </div>
      {notificationsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4 md:p-5">
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
        <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <Bell className="w-12 h-12 md:w-16 md:h-16 text-accent" />
            <div>
              <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t("dashboard.notifications.empty")}</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">{t("dashboard.tracking.subtitle")}</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications?.map((notif: any) => (
            <Card 
              key={notif.id} 
              className={`rounded-2xl border-0 shadow-sm transition-all ${!notif.isRead ? 'bg-white dark:bg-card ring-1 ring-accent/20' : 'bg-white dark:bg-card'}`}
              onClick={() => { if (!notif.isRead) markNotificationRead.mutate(notif.id); }}
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${getNotificationIconBg(notif.type)}`}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h3 className={`text-sm md:text-base truncate ${!notif.isRead ? 'font-black' : 'font-bold text-foreground/80'}`}>{notif.title}</h3>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                        )}
                      </div>
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
                    <p className="text-sm text-muted-foreground leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {notif.type === 'action_required' && (
                        <Badge variant="secondary" className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                          {t("dashboard.notifications.actionRequired")}
                        </Badge>
                      )}
                      {notif.type === 'update' && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent text-[10px] font-bold">
                          {t("dashboard.notifications.update")}
                        </Badge>
                      )}
                      {notif.type === 'info' && (
                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          {t("dashboard.notifications.info")}
                        </Badge>
                      )}
                      {notif.orderCode && (
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {t("dashboard.orders.order")}: {notif.orderCode}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    {notif.type === 'action_required' && user?.accountStatus !== 'deactivated' && (
                      <Button 
                        className="mt-3 bg-accent text-accent-foreground font-black rounded-full text-xs px-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead.mutate(notif.id);
                          setActiveTab('documents');
                        }}
                        data-testid={`button-upload-document-${notif.id}`}
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
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
}
