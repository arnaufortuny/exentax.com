import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { ClipboardList, Search, ChevronRight, ChevronLeft, Loader2, Globe, Shield, UserCheck, Package, Mail, Key, Eye, FileText, Calculator, AlertCircle } from "@/components/icons";

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

const ACTION_ICONS: Record<string, typeof Shield> = {
  user_register: UserCheck,
  order_created: Package,
  password_change: Key,
  password_reset: Key,
  account_flagged_for_review: Shield,
  account_status_change: Shield,
  login_attempt: Globe,
  email_sent: Mail,
  document_uploaded: FileText,
  backup_completed: ClipboardList,
  ip_order_blocked: AlertCircle,
};

const ACTION_COLORS: Record<string, string> = {
  user_register: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  order_created: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  password_change: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  password_reset: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  account_flagged_for_review: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  account_status_change: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  ip_order_blocked: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  backup_completed: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400",
};

export function ActivityLogPanel() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
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
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const totalPages = Math.ceil((data?.total || 0) / limit);

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDetails = (details: Record<string, any> | null) => {
    if (!details) return null;
    const parts: string[] = [];
    if (details.email) parts.push(details.email);
    if (details.clientId) parts.push(`ID: ${details.clientId}`);
    if (details.type) parts.push(details.type);
    if (details.ticketId) parts.push(`#${details.ticketId}`);
    if (details.reason) parts.push(details.reason);
    if (details.step) parts.push(details.step);
    if (details.ordersCount) parts.push(`${details.ordersCount} orders`);
    if (details.backedUp !== undefined) parts.push(`${details.backedUp} files`);
    if (details.changedFields && Array.isArray(details.changedFields)) {
      parts.push(details.changedFields.map((f: any) => typeof f === 'string' ? f : f.field).join(", "));
    }
    return parts.length > 0 ? parts.join(" · ") : JSON.stringify(details).substring(0, 100);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  return (
    <div className="space-y-4" data-testid="admin-activity-log">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-black">{t('dashboard.admin.activityLog.title', 'Activity Log')}</h3>
          {data?.total !== undefined && (
            <Badge variant="secondary" className="text-[10px]">{data.total}</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('dashboard.admin.activityLog.searchPlaceholder', 'Search IP, user, details...')}
            className="text-xs rounded-full"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            data-testid="input-activity-search"
          />
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shrink-0"
            onClick={handleSearch}
            data-testid="button-activity-search"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <NativeSelect
          value={actionFilter}
          onValueChange={(val) => { setActionFilter(val); setPage(0); }}
          className="text-xs rounded-full w-full sm:w-48"
          data-testid="select-activity-filter"
        >
          <NativeSelectItem value="">{t('dashboard.admin.activityLog.allActions', 'All actions')}</NativeSelectItem>
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
                const IconComp = ACTION_ICONS[log.action] || Eye;
                const colorClass = ACTION_COLORS[log.action] || "bg-muted text-muted-foreground";
                return (
                  <div key={log.id} className="p-3 sm:p-4 flex items-start gap-3" data-testid={`activity-log-${log.id}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass.split(' ').filter(c => c.startsWith('bg-')).join(' ')}`}>
                      <IconComp className={`w-4 h-4 ${colorClass.split(' ').filter(c => c.startsWith('text-') || c.startsWith('dark:')).join(' ')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {formatAction(log.action)}
                        </Badge>
                        {log.ip && (
                          <span className="text-[10px] text-muted-foreground font-mono">{log.ip}</span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                          {formatDetails(log.details)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </span>
                        {log.userId && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {t('dashboard.admin.activityLog.user', 'User')}: {log.userId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!data?.logs || data.logs.length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {t('dashboard.admin.activityLog.noLogs', 'No activity logs found')}
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
                {t('common.previous', 'Previous')}
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
                {t('common.next', 'Next')}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
