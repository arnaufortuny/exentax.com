import { Upload, X, Bell } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{t("dashboard.notifications.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("dashboard.tracking.subtitle")}</p>
      </div>
      {notificationsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : notifications?.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <Bell className="w-12 h-12 md:w-16 md:h-16 text-accent" />
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2 text-center">{t("dashboard.notifications.empty")}</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">{t("dashboard.tracking.subtitle")}</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications?.map((notif: any) => (
            <Card 
              key={notif.id} 
              className={`rounded-2xl border-0 shadow-sm transition-all hover:shadow-md ${!notif.isRead ? 'bg-accent/5 border-l-4 border-l-accent' : ''}`}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {notif.orderCode && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-black">{t("dashboard.orders.order")}: {notif.orderCode}</span>
                      )}
                      {notif.type === 'action_required' && (
                        <span className="text-[10px] bg-accent/20 text-primary px-2 py-1 rounded-full font-black">{t("dashboard.notifications.actionRequired")}</span>
                      )}
                      {notif.type === 'update' && (
                        <span className="text-[10px] bg-accent/20 text-primary px-2 py-1 rounded-full font-black">{t("dashboard.notifications.update")}</span>
                      )}
                      {notif.type === 'info' && (
                        <span className="text-[10px] bg-gray-100 dark:bg-muted text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-black">{t("dashboard.notifications.info")}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-black text-sm md:text-base">{notif.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    {notif.type === 'action_required' && user?.accountStatus !== 'deactivated' && (
                      <Button 
                        className="mt-3 bg-accent text-accent-foreground font-semibold rounded-full text-xs px-4 gap-2"
                        onClick={() => {
                          markNotificationRead.mutate(notif.id);
                          setActiveTab('documents');
                        }}
                        data-testid={`button-upload-document-${notif.id}`}
                      >
                        <Upload className="w-3 h-3" />
                        {t("dashboard.documents.upload")}
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    onClick={() => deleteNotification.mutate(notif.id)}
                    disabled={deleteNotification.isPending}
                    data-testid={`button-delete-notification-${notif.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
