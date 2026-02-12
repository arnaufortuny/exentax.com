import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { getOrderStatusLabel } from "@/components/dashboard/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Edit2, Trash2 } from "@/components/icons";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PaginationControls } from "@/components/dashboard/pagination-controls";

interface AdminOrdersPanelProps {
  filteredAdminOrders: any[];
  adminSearchQuery: string;
  adminUsers: any[];
  paymentAccountsList: any[];
  setAdminSubTab: (sub: string) => void;
  onEditOrder: (order: any) => void;
  onPaymentLink: (order: any) => void;
  onCreateInvoice: (order: any) => void;
  onStatusChange: (orderId: number, status: string) => void;
  onDeleteOrder: (orderId: number) => void;
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
  onPageChange?: (page: number) => void;
}

export function AdminOrdersPanel({
  filteredAdminOrders,
  adminSearchQuery,
  adminUsers,
  paymentAccountsList,
  setAdminSubTab,
  onEditOrder,
  onPaymentLink,
  onCreateInvoice,
  onStatusChange,
  onDeleteOrder,
  pagination,
  onPageChange,
}: AdminOrdersPanelProps) {
  const { t } = useTranslation();
  const [inlineEditOrderId, setInlineEditOrderId] = useState<number | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Record<string, string>>({});

  const inlineEditOrderMutation = useMutation({
    mutationFn: async ({ orderId, data }: { orderId: number; data: Record<string, string> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.amount) payload.amount = parseFloat(data.amount);
      const res = await apiRequest("PATCH", `/api/admin/orders/${orderId}/inline`, payload);
      if (!res.ok) throw new Error(t("dashboard.errors.couldNotUpdateOrder"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setInlineEditOrderId(null);
      setInlineEditData({});
    },
  });

  return (
    <Card className="rounded-2xl shadow-sm p-0 overflow-hidden">
      <div className="divide-y">
        {(!filteredAdminOrders || filteredAdminOrders.length === 0) && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {adminSearchQuery ? t('dashboard.admin.orders.noResults') || 'No se encontraron pedidos' : t('dashboard.admin.orders.noOrders') || 'No hay pedidos registrados'}
          </div>
        )}
        {filteredAdminOrders?.map(order => {
          const app = order.application || order.maintenanceApplication;
          const isMaintenance = !!order.maintenanceApplication && !order.application;
          const orderCode = app?.requestCode || order.invoiceNumber;
          const appStatus = app?.status;
          const isFormComplete = appStatus === 'submitted';
          
          return (
          <div key={order.id} className="p-4 space-y-3" data-testid={`order-card-${order.id}`}>
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-black text-sm">{orderCode}</p>
                  <NativeSelect 
                    value={order.status} 
                    onValueChange={val => onStatusChange(order.id, val)}
                    className="w-28 h-7 rounded-lg text-xs bg-white dark:bg-card border px-2"
                  >
                    <NativeSelectItem value="pending">{t('dashboard.admin.orders.pending')}</NativeSelectItem>
                    <NativeSelectItem value="paid">{t('dashboard.admin.orders.paid')}</NativeSelectItem>
                    <NativeSelectItem value="filed">{t('dashboard.admin.orders.filed')}</NativeSelectItem>
                    <NativeSelectItem value="cancelled">{t('dashboard.admin.orders.cancelled')}</NativeSelectItem>
                  </NativeSelect>
                  <Badge className={`text-[9px] ${isMaintenance ? 'bg-accent/10 text-accent' : 'bg-accent/10 text-accent'}`}>
                    {isMaintenance ? t('dashboard.admin.orders.maintenance') : 'LLC'}
                  </Badge>
                  {!isFormComplete && <Badge className="text-[9px] bg-accent/10 text-accent">{t('dashboard.admin.orders.formIncomplete')}</Badge>}
                </div>
                <p className="text-xs font-semibold">{app?.ownerFullName || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`}</p>
                <p className="text-xs text-muted-foreground">{app?.ownerEmail || order.user?.email}</p>
                {app?.ownerPhone && <p className="text-xs text-muted-foreground">{app.ownerPhone}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>{t('dashboard.admin.orders.company')}:</strong> {app?.companyName || t('dashboard.admin.orders.notSpecified')} • <strong>{t('dashboard.admin.orders.stateLabel')}:</strong> {app?.state || t('common.na')}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>{t('dashboard.admin.orders.product')}:</strong> {order.product?.name} • <strong>{t('dashboard.admin.orders.amount')}:</strong> {(order.amount / 100).toFixed(2)}€
                  {order.discountCode && (
                    <span className="text-accent ml-2">
                      ({t('dashboard.admin.orders.discount')}: {order.discountCode} -{(order.discountAmount / 100).toFixed(2)}€)
                    </span>
                  )}
                </p>
                {app?.businessCategory && <p className="text-xs text-muted-foreground"><strong>{t('dashboard.admin.orders.category')}:</strong> {app.businessCategory}</p>}
                {isMaintenance && app?.ein && <p className="text-xs text-muted-foreground"><strong>EIN:</strong> {app.ein}</p>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full text-xs"
                onClick={() => {
                  if (inlineEditOrderId === order.id) {
                    setInlineEditOrderId(null);
                    setInlineEditData({});
                  } else {
                    setInlineEditOrderId(order.id);
                    setInlineEditData({
                      companyName: app?.companyName || '',
                      state: app?.state || '',
                      ownerFullName: app?.ownerFullName || '',
                      ownerEmail: app?.ownerEmail || '',
                      ownerPhone: app?.ownerPhone || '',
                      businessCategory: app?.businessCategory || '',
                      amount: ((order.amount || 0) / 100).toFixed(2),
                      ...(isMaintenance && app?.ein ? { ein: app.ein } : {}),
                    });
                  }
                }}
                data-testid={`btn-modify-order-${order.id}`}
              >
                <Edit2 className="w-3 h-3 mr-1" /> {t('dashboard.admin.orders.modify')}
              </Button>
              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => window.open(`/api/admin/invoice/${order.id}`, '_blank')} data-testid={`btn-view-invoice-${order.id}`}>
                {t('dashboard.admin.orders.viewInvoice')}
              </Button>
              <Button size="sm" className="rounded-full text-xs bg-accent text-accent-foreground" onClick={() => onCreateInvoice(order)} data-testid={`btn-generate-invoice-${order.id}`}>
                {t('dashboard.admin.orders.generateInvoice')}
              </Button>
              <Button size="sm" variant="outline" className="rounded-full text-xs text-red-600 border-red-200" onClick={() => onDeleteOrder(order.id)} data-testid={`btn-delete-order-${order.id}`}>
                {t('dashboard.admin.orders.deleteBtn')}
              </Button>
            </div>
          {inlineEditOrderId === order.id && (
            <div className="mt-3 p-4 rounded-xl bg-muted/30 border border-border space-y-3" data-testid={`inline-edit-section-${order.id}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t('dashboard.admin.orders.company')}</label>
                  <Input value={inlineEditData.companyName || ''} onChange={e => setInlineEditData(d => ({ ...d, companyName: e.target.value }))} className="rounded-full h-9 text-xs" data-testid={`input-inline-company-${order.id}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t('dashboard.admin.orders.stateLabel')}</label>
                  <NativeSelect value={inlineEditData.state || ''} onValueChange={val => setInlineEditData(d => ({ ...d, state: val }))} className="rounded-full h-9 text-xs bg-white dark:bg-card border px-2 w-full">
                    <NativeSelectItem value="new_mexico">{t('application.states.newMexico')}</NativeSelectItem>
                    <NativeSelectItem value="wyoming">{t('application.states.wyoming')}</NativeSelectItem>
                    <NativeSelectItem value="delaware">{t('application.states.delaware')}</NativeSelectItem>
                  </NativeSelect>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t('dashboard.admin.orders.ownerName')}</label>
                  <Input value={inlineEditData.ownerFullName || ''} onChange={e => setInlineEditData(d => ({ ...d, ownerFullName: e.target.value }))} className="rounded-full h-9 text-xs" data-testid={`input-inline-owner-${order.id}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t('common.email')}</label>
                  <Input value={inlineEditData.ownerEmail || ''} onChange={e => setInlineEditData(d => ({ ...d, ownerEmail: e.target.value }))} className="rounded-full h-9 text-xs" data-testid={`input-inline-email-${order.id}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t('dashboard.admin.orders.phone')}</label>
                  <Input value={inlineEditData.ownerPhone || ''} onChange={e => setInlineEditData(d => ({ ...d, ownerPhone: e.target.value }))} className="rounded-full h-9 text-xs" data-testid={`input-inline-phone-${order.id}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t('dashboard.admin.orders.category')}</label>
                  <Input value={inlineEditData.businessCategory || ''} onChange={e => setInlineEditData(d => ({ ...d, businessCategory: e.target.value }))} className="rounded-full h-9 text-xs" data-testid={`input-inline-category-${order.id}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t('dashboard.admin.orders.amount')} (€)</label>
                  <Input type="number" step="0.01" value={inlineEditData.amount || ''} onChange={e => setInlineEditData(d => ({ ...d, amount: e.target.value }))} className="rounded-full h-9 text-xs" data-testid={`input-inline-amount-${order.id}`} />
                </div>
                {isMaintenance && (
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">EIN</label>
                    <Input value={inlineEditData.ein || ''} onChange={e => setInlineEditData(d => ({ ...d, ein: e.target.value }))} className="rounded-full h-9 text-xs" data-testid={`input-inline-ein-${order.id}`} />
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => { setInlineEditOrderId(null); setInlineEditData({}); }} data-testid={`btn-cancel-inline-${order.id}`}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  size="sm" 
                  className="rounded-full text-xs bg-accent text-accent-foreground"
                  disabled={inlineEditOrderMutation.isPending}
                  onClick={() => inlineEditOrderMutation.mutate({ orderId: order.id, data: inlineEditData })}
                  data-testid={`btn-save-inline-${order.id}`}
                >
                  {inlineEditOrderMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </div>
          )}
          </div>
        )})}
      </div>
      {pagination && onPageChange && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
        />
      )}
    </Card>
  );
}
