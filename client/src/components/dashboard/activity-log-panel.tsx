import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { ChevronRight, ChevronLeft, Loader2, Clock, Shield, Mail, FileText, CreditCard, Package, UserCheck, MessageSquare, Calendar, Upload, Key, Globe, Bell, Users, Eye, Search, Download, X, Filter } from "@/components/icons";
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
  userName: string | null;
  userEmail: string | null;
  targetName: string | null;
  targetEmail: string | null;
};

const ACTION_ICONS: Record<string, typeof Shield> = {
  user_login: Key,
  user_logout: Key,
  user_register: Users,
  password_change: Key,
  password_reset: Key,
  admin_password_reset: Key,
  email_verified: Mail,
  send_verification_otp: Mail,
  otp_sent: Mail,
  order_created: Package,
  order_status_change: Package,
  order_completed: Package,
  order_updated: Package,
  payment_received: CreditCard,
  payment_link_update: CreditCard,
  document_upload: FileText,
  document_request: FileText,
  identity_doc_uploaded: Upload,
  identity_verification_requested: UserCheck,
  identity_verification_approved: UserCheck,
  identity_verification_rejected: UserCheck,
  account_locked: Shield,
  account_unlocked: Shield,
  account_status_change: Shield,
  account_flagged_for_review: Shield,
  account_review: Shield,
  admin_user_update: Users,
  admin_order_update: Package,
  admin_send_email: Mail,
  admin_documents_download: Eye,
  admin_create_maintenance_order: Package,
  admin_create_custom_order: Package,
  consultation_booked: Calendar,
  consultation_cancelled: Calendar,
  consultation_type_created: Calendar,
  consultation_updated: Calendar,
  consultation_rescheduled: Calendar,
  accounting_transaction_created: CreditCard,
  accounting_transaction_updated: CreditCard,
  accounting_transaction_deleted: CreditCard,
  backup_completed: Globe,
  backup_failed: Globe,
  security_otp_required: Shield,
  ip_order_blocked: Shield,
  password_reset_name_mismatch: Shield,
  password_reset_blocked_name: Shield,
};

const ACTION_COLORS: Record<string, string> = {
  user_login: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  user_logout: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  user_register: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  password_change: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  password_reset: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  email_verified: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  send_verification_otp: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  otp_sent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  order_created: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  order_status_change: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  order_completed: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  order_updated: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  payment_received: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  payment_link_update: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
  document_upload: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  document_request: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  identity_doc_uploaded: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  identity_verification_requested: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  identity_verification_approved: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  identity_verification_rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  account_locked: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  account_unlocked: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  account_status_change: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  account_flagged_for_review: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  admin_send_email: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  admin_user_update: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  consultation_booked: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
  consultation_cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  ip_order_blocked: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  backup_completed: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
  backup_failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  password_reset_name_mismatch: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  password_reset_blocked_name: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function ActivityLogPanel() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 50;

  const { data, isLoading, isFetching } = useQuery<{
    logs: AuditLog[];
    total: number;
    actions: string[];
  }>({
    queryKey: ["/api/admin/audit-logs", page, actionFilter, activeSearch, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (actionFilter) params.set("action", actionFilter);
      if (activeSearch) params.set("search", activeSearch);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(t('errors.fetchFailed'));
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const totalPages = Math.ceil((data?.total || 0) / limit);

  const handleSearch = useCallback(() => {
    setActiveSearch(searchQuery);
    setPage(0);
  }, [searchQuery]);

  const handleExportCSV = useCallback(async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("format", "csv");
      if (actionFilter) params.set("action", actionFilter);
      if (activeSearch) params.set("search", activeSearch);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    } finally {
      setIsExporting(false);
    }
  }, [actionFilter, activeSearch, dateFrom, dateTo]);

  const clearFilters = useCallback(() => {
    setActionFilter("");
    setSearchQuery("");
    setActiveSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  }, []);

  const hasActiveFilters = actionFilter || activeSearch || dateFrom || dateTo;

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const getActionIcon = (action: string) => {
    const Icon = ACTION_ICONS[action] || Bell;
    return <Icon className="w-3 h-3 shrink-0" />;
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
  };

  const getEmail = (log: AuditLog): string => {
    if (log.details?.email) return log.details.email;
    if (log.details?.userEmail) return log.details.userEmail;
    if (log.details?.to) return log.details.to;
    if (log.userEmail) return log.userEmail;
    if (log.targetEmail) return log.targetEmail;
    return "";
  };

  const getUserName = (log: AuditLog): string => {
    if (log.userName && log.userName.trim()) return log.userName.trim();
    if (log.details?.firstName) return `${log.details.firstName} ${log.details.lastName || ''}`.trim();
    return "";
  };

  const getTargetName = (log: AuditLog): string => {
    if (log.targetName && log.targetName.trim()) return log.targetName.trim();
    return "";
  };

  const buildDetailRows = (log: AuditLog): { label: string; value: string }[] => {
    const rows: { label: string; value: string }[] = [];
    const d = log.details || {};

    if (d.orderId) rows.push({ label: t("dashboard.admin.activity.orderId"), value: String(d.orderId) });
    if (d.orderCode) rows.push({ label: t("dashboard.admin.activity.orderCode"), value: d.orderCode });
    if (d.ticketId) rows.push({ label: t("dashboard.admin.activity.ticket"), value: d.ticketId });
    if (d.type) rows.push({ label: t("dashboard.admin.activity.type"), value: d.type });
    if (d.newStatus) rows.push({ label: t("dashboard.admin.activity.status"), value: d.newStatus });
    if (d.previousStatus) rows.push({ label: t("dashboard.admin.activity.previousStatus"), value: d.previousStatus });
    if (d.step) rows.push({ label: t("dashboard.admin.activity.step"), value: d.step });
    if (d.state) rows.push({ label: t("dashboard.admin.activity.stateUS"), value: d.state });
    if (d.companyName) rows.push({ label: t("dashboard.admin.activity.company"), value: d.companyName });
    if (d.amount !== undefined) rows.push({ label: t("dashboard.admin.activity.amount"), value: typeof d.amount === 'number' ? `${(d.amount / 100).toFixed(2)}€` : String(d.amount) });
    if (d.currency) rows.push({ label: t("dashboard.admin.activity.currency"), value: d.currency });
    if (d.paymentMethod) rows.push({ label: t("dashboard.admin.activity.paymentMethod"), value: d.paymentMethod });
    if (d.paymentLink) rows.push({ label: t("dashboard.admin.activity.paymentLink"), value: d.paymentLink });
    if (d.concept) rows.push({ label: t("dashboard.admin.activity.concept"), value: d.concept });
    if (d.invoiceNumber) rows.push({ label: t("dashboard.admin.activity.invoice"), value: d.invoiceNumber });
    if (d.fileName) rows.push({ label: t("dashboard.admin.activity.file"), value: d.fileName });
    if (d.fileHash) rows.push({ label: t("dashboard.admin.activity.hash"), value: d.fileHash.substring(0, 16) + '...' });
    if (d.docType) rows.push({ label: t("dashboard.admin.activity.docType"), value: d.docType });
    if (d.documentId) rows.push({ label: t("dashboard.admin.activity.docId"), value: String(d.documentId) });
    if (d.notes) rows.push({ label: t("dashboard.admin.activity.notes"), value: d.notes });
    if (d.reason) rows.push({ label: t("dashboard.admin.activity.reason"), value: d.reason });
    if (d.subject) rows.push({ label: t("dashboard.admin.activity.subject"), value: d.subject });
    if (d.emailType) rows.push({ label: t("dashboard.admin.activity.emailType"), value: d.emailType });
    if (d.recipientCount) rows.push({ label: t("dashboard.admin.activity.recipients"), value: String(d.recipientCount) });
    if (d.consultationType) rows.push({ label: t("dashboard.admin.activity.consultationType"), value: d.consultationType });
    if (d.consultationDate) rows.push({ label: t("dashboard.admin.activity.consultationDate"), value: d.consultationDate });
    if (d.consultationId) rows.push({ label: t("dashboard.admin.activity.consultationId"), value: String(d.consultationId) });
    if (d.description) rows.push({ label: t("dashboard.admin.activity.description"), value: d.description });
    if (d.category) rows.push({ label: t("dashboard.admin.activity.category"), value: d.category });
    if (d.transactionId) rows.push({ label: t("dashboard.admin.activity.transactionId"), value: String(d.transactionId) });
    if (d.ordersCount !== undefined) rows.push({ label: t("dashboard.admin.activity.orders"), value: String(d.ordersCount) });
    if (d.backedUp !== undefined) rows.push({ label: t("dashboard.admin.activity.backupFiles"), value: String(d.backedUp) });
    if (d.discountCode) rows.push({ label: t("dashboard.admin.activity.discountCode"), value: d.discountCode });
    if (d.discountAmount !== undefined) rows.push({ label: t("dashboard.admin.activity.discount"), value: typeof d.discountAmount === 'number' ? `${(d.discountAmount / 100).toFixed(2)}€` : String(d.discountAmount) });
    if (d.changedFields && Array.isArray(d.changedFields)) {
      const fields = d.changedFields.map((f: any) => typeof f === 'string' ? f : `${f.field}: ${f.from} → ${f.to}`).join(", ");
      rows.push({ label: t("dashboard.admin.activity.fields"), value: fields });
    }
    if (d.messageId) rows.push({ label: t("dashboard.admin.activity.messageId"), value: String(d.messageId) });
    if (d.clientId) rows.push({ label: t("dashboard.admin.activity.clientId"), value: d.clientId });
    if (d.accountStatus) rows.push({ label: t("dashboard.admin.activity.accountStatus"), value: d.accountStatus });
    if (d.role) rows.push({ label: t("dashboard.admin.activity.role"), value: d.role });
    if (d.failedAttempts) rows.push({ label: t("dashboard.admin.activity.failedAttempts"), value: String(d.failedAttempts) });

    return rows;
  };

  return (
    <div className="space-y-3" data-testid="admin-activity-log">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-black text-lg whitespace-nowrap">{t('dashboard.admin.activityLog.title')}</h3>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {data?.total !== undefined && (
            <Badge variant="secondary" className="text-[10px]">{data.total}</Badge>
          )}
          {isFetching && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs font-bold gap-1"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-3 h-3" />
            {t('dashboard.admin.activityLog.filters')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-bold gap-1"
            onClick={handleExportCSV}
            disabled={isExporting}
            data-testid="button-export-csv"
          >
            {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder={t('dashboard.admin.activityLog.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-8 text-xs h-9"
                  data-testid="input-activity-search"
                />
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="rounded-full text-xs font-bold"
              onClick={handleSearch}
              data-testid="button-activity-search"
            >
              <Search className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <NativeSelect
              value={actionFilter}
              onValueChange={(val) => { setActionFilter(val); setPage(0); }}
              className="text-xs rounded-full flex-1 min-w-[160px]"
              data-testid="select-activity-filter"
            >
              <NativeSelectItem value="">{t('dashboard.admin.activityLog.allActions')}</NativeSelectItem>
              {data?.actions?.map((action) => (
                <NativeSelectItem key={action} value={action}>
                  {formatAction(action)}
                </NativeSelectItem>
              ))}
            </NativeSelect>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-semibold shrink-0">{t('dashboard.admin.activityLog.from')}:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                className="text-xs h-9 w-[140px]"
                data-testid="input-date-from"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-semibold shrink-0">{t('dashboard.admin.activityLog.to')}:</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                className="text-xs h-9 w-[140px]"
                data-testid="input-date-to"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-xs font-bold gap-1 text-red-500"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="w-3 h-3" />
                {t('dashboard.admin.activityLog.clearFilters')}
              </Button>
            )}
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="rounded-2xl shadow-sm overflow-hidden">
          <div className="space-y-3 p-4" data-testid="skeleton-activity-log">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <>
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y">
              {data?.logs?.map((log) => {
                const email = getEmail(log);
                const userName = getUserName(log);
                const targetName = getTargetName(log);
                const detailRows = buildDetailRows(log);
                const isExpanded = expandedLog === log.id;

                return (
                  <div
                    key={log.id}
                    className="p-3 sm:p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    data-testid={`activity-log-${log.id}`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <Badge className={`text-[10px] font-bold rounded-full gap-1 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {formatAction(log.action)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(log.createdAt).toLocaleString(getLocale(), {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">#{log.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-muted-foreground font-semibold shrink-0">IP:</span>
                        <span className="font-mono text-foreground truncate">{log.ip || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-muted-foreground font-semibold shrink-0">{t("dashboard.admin.activity.user")}:</span>
                        <span className="text-foreground truncate font-medium">{userName || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-muted-foreground font-semibold shrink-0">Email:</span>
                        <span className="font-mono text-foreground truncate">{email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-muted-foreground font-semibold shrink-0">ID:</span>
                        <span className="font-mono text-foreground truncate">{log.userId ? log.userId.substring(0, 12) + '...' : '—'}</span>
                      </div>
                    </div>

                    {log.targetId && (
                      <div className="mt-1 text-[11px] flex items-center gap-1.5">
                        <span className="text-muted-foreground font-semibold">{t("dashboard.admin.activity.target")}:</span>
                        <span className="text-foreground font-medium">{targetName || '—'}</span>
                        {log.targetEmail && <span className="font-mono text-muted-foreground">({log.targetEmail})</span>}
                        <span className="font-mono text-muted-foreground">ID: {log.targetId.substring(0, 12)}...</span>
                      </div>
                    )}

                    {detailRows.length > 0 && !isExpanded && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">
                        {detailRows.slice(0, 4).map(r => `${r.label}: ${r.value}`).join(" · ")}
                        {detailRows.length > 4 && ` (+${detailRows.length - 4} ${t("dashboard.admin.activity.more")})`}
                      </p>
                    )}

                    {isExpanded && detailRows.length > 0 && (
                      <div className="mt-2 p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1" onClick={e => e.stopPropagation()}>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t("dashboard.admin.activity.fullDetails")}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                          {detailRows.map((row, idx) => (
                            <div key={idx} className="flex gap-2 text-[11px]">
                              <span className="text-muted-foreground font-semibold shrink-0 min-w-[90px]">{row.label}:</span>
                              <span className="text-foreground break-all">{row.value}</span>
                            </div>
                          ))}
                        </div>
                        {log.userAgent && (
                          <div className="mt-2 pt-2 border-t border-border/30">
                            <span className="text-[10px] text-muted-foreground font-semibold">User Agent: </span>
                            <span className="text-[10px] text-muted-foreground break-all">{log.userAgent}</span>
                          </div>
                        )}
                      </div>
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
