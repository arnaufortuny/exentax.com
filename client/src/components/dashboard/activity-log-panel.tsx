import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { ChevronRight, ChevronLeft, Loader2 } from "@/components/icons";
import { getLocale } from "@/lib/utils";

type AuditLog = {
  id: number;
  action: string;
  userId: string | null;
  targetId: string | null;
  ip: string | null;
  userAgent: string | null;
  details: Record<string, any> | null;
  createdAt: string;
};

export function ActivityLogPanel() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery] = useState("");
  const limit = 50;

  const { data, isLoading, isFetching } = useQuery<{
    logs: AuditLog[];
    total: number;
    actions: string[];
  }>({
    queryKey: ["/api/admin/audit-logs", page, actionFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (actionFilter) params.set("action", actionFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(t('errors.fetchFailed'));
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const totalPages = Math.ceil((data?.total || 0) / limit);

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const extractEmail = (log: AuditLog): string | null => {
    if (log.details?.email) return log.details.email;
    if (log.details?.userEmail) return log.details.userEmail;
    if (log.details?.to) return log.details.to;
    return null;
  };

  const extractClientId = (log: AuditLog): string | null => {
    if (log.details?.clientId) return log.details.clientId;
    if (log.userId) return log.userId;
    if (log.targetId) return log.targetId;
    return null;
  };

  const formatExtraDetails = (details: Record<string, any> | null) => {
    if (!details) return null;
    const parts: string[] = [];
    if (details.type) parts.push(details.type);
    if (details.ticketId) parts.push(`#${details.ticketId}`);
    if (details.reason) parts.push(details.reason);
    if (details.step) parts.push(details.step);
    if (details.newStatus) parts.push(details.newStatus);
    if (details.ordersCount) parts.push(`${details.ordersCount} orders`);
    if (details.backedUp !== undefined) parts.push(`${details.backedUp} files`);
    if (details.orderId) parts.push(`Order #${details.orderId}`);
    if (details.changedFields && Array.isArray(details.changedFields)) {
      parts.push(details.changedFields.map((f: any) => typeof f === 'string' ? f : f.field).join(", "));
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  };


  return (
    <div className="space-y-4" data-testid="admin-activity-log">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black">{t('dashboard.admin.activityLog.title')}</h3>
          {data?.total !== undefined && (
            <Badge variant="secondary" className="text-[10px]">{data.total}</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <NativeSelect
          value={actionFilter}
          onValueChange={(val) => { setActionFilter(val); setPage(0); }}
          className="text-xs rounded-full w-full sm:w-48"
          data-testid="select-activity-filter"
        >
          <NativeSelectItem value="">{t('dashboard.admin.activityLog.allActions')}</NativeSelectItem>
          {data?.actions?.map((action) => (
            <NativeSelectItem key={action} value={action}>
              {formatAction(action)}
            </NativeSelectItem>
          ))}
        </NativeSelect>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : (
        <>
          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
            <div className="divide-y">
              {data?.logs?.map((log) => {
                const email = extractEmail(log);
                const clientId = extractClientId(log);
                const extraDetails = formatExtraDetails(log.details);
                return (
                  <div key={log.id} className="p-3 sm:p-4" data-testid={`activity-log-${log.id}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant="default" className="text-[10px] font-bold rounded-full">
                        {formatAction(log.action)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString(getLocale(), {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground font-semibold">IP:</span>
                        <span className="font-mono text-foreground">{log.ip || t('common.na')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground font-semibold">{t('common.email')}:</span>
                        <span className="font-mono text-foreground truncate">{email || t('common.na')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground font-semibold">ID:</span>
                        <span className="font-mono text-foreground">{clientId ? clientId.substring(0, 12) : t('common.na')}</span>
                      </div>
                    </div>
                    {extraDetails && (
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                        {extraDetails}
                      </p>
                    )}
                  </div>
                );
              })}
              {(!data?.logs || data.logs.length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {t('dashboard.admin.activityLog.noLogs')}
                </div>
              )}
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-bold"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                data-testid="button-activity-prev"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                {t('common.previous')}
              </Button>
              <span className="text-xs text-muted-foreground font-bold">
                {page + 1} / {totalPages}
                {isFetching && <Loader2 className="w-3 h-3 animate-spin inline ml-1" />}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-bold"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                data-testid="button-activity-next"
              >
                {t('common.next')}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
