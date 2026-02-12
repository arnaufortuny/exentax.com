import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLocale } from "@/lib/utils";

interface AdminIncompletePanelProps {
  incompleteApps: { llc: any[]; maintenance: any[] } | undefined;
  onDelete: (params: { type: string; id: number }) => void;
  isDeleting?: boolean;
}

export function AdminIncompletePanel({ incompleteApps, onDelete, isDeleting }: AdminIncompletePanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm p-0 overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/15">
        <h3 className="font-black text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          {t('dashboard.admin.incomplete.title')} ({(incompleteApps?.llc?.length || 0) + (incompleteApps?.maintenance?.length || 0)})
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{t('dashboard.admin.incomplete.autoDeleteNotice')}</p>
      </div>
      <div className="divide-y">
        {[...(incompleteApps?.llc || []), ...(incompleteApps?.maintenance || [])].map((app: any) => {
          const hoursRemaining = app.abandonedAt 
            ? Math.max(0, Math.round(48 - ((Date.now() - new Date(app.abandonedAt).getTime()) / 3600000))) 
            : null;
          return (
            <div key={`${app.type}-${app.id}`} className="p-4 space-y-2" data-testid={`incomplete-app-${app.type}-${app.id}`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`text-[9px] ${app.type === 'maintenance' ? 'bg-accent/10 text-accent' : 'bg-accent/10 text-accent'}`}>
                      {app.type === 'maintenance' ? t('dashboard.admin.orders.maintenance') : 'LLC'}
                    </Badge>
                    <Badge className="text-[9px] bg-accent/10 text-accent">{t('dashboard.admin.incomplete.incomplete')}</Badge>
                    {hoursRemaining !== null && (
                      <Badge className="text-[9px] bg-red-100 text-red-700">
                        {hoursRemaining > 0 ? t('dashboard.admin.incomplete.deleteInHours', { hours: hoursRemaining }) : t('dashboard.admin.incomplete.deletionPending')}
                      </Badge>
                    )}
                  </div>
                  {app.ownerFullName && <p className="text-sm font-bold">{app.ownerFullName}</p>}
                  {app.ownerEmail && <p className="text-xs text-muted-foreground">{app.ownerEmail}</p>}
                  {app.ownerPhone && <p className="text-xs text-muted-foreground">{app.ownerPhone}</p>}
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    {app.companyName && <p><strong>{t('dashboard.admin.orders.company')}:</strong> {app.companyName}</p>}
                    {app.state && <p><strong>{t('dashboard.admin.orders.stateLabel')}:</strong> {app.state}</p>}
                    {app.remindersSent > 0 && <p><strong>{t('dashboard.admin.incomplete.reminders')}:</strong> {app.remindersSent}/3 {t('dashboard.admin.incomplete.sent')}</p>}
                    {app.lastUpdated && <p><strong>{t('dashboard.admin.incomplete.lastActivity')}:</strong> {new Date(app.lastUpdated).toLocaleString(getLocale())}</p>}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full text-xs text-red-600 border-red-200"
                  onClick={() => onDelete({ type: app.type, id: app.id })}
                  disabled={isDeleting}
                  data-testid={`btn-delete-incomplete-${app.type}-${app.id}`}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {t('dashboard.admin.delete')}
                </Button>
              </div>
            </div>
          );
        })}
        {(!incompleteApps?.llc?.length && !incompleteApps?.maintenance?.length) && (
          <div className="p-8 text-center text-muted-foreground">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-sm font-medium">{t('dashboard.admin.incomplete.noIncomplete')}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
