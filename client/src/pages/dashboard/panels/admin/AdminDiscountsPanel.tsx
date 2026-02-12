import { useTranslation } from "react-i18next";
import { Plus, Edit, XCircle, CheckCircle, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { DiscountCode } from "@/components/dashboard";

interface AdminDiscountsPanelProps {
  discountCodes: DiscountCode[] | undefined;
  refetchDiscountCodes: () => void;
  setFormMessage: (msg: { type: 'error' | 'success' | 'info'; text: string } | null) => void;
  setNewDiscountCode: (val: any) => void;
  setDiscountCodeDialog: (val: { open: boolean; code: DiscountCode | null }) => void;
  showConfirm: (opts: { title: string; description: string; onConfirm: () => Promise<void> }) => void;
}

export function AdminDiscountsPanel({
  discountCodes,
  refetchDiscountCodes,
  setFormMessage,
  setNewDiscountCode,
  setDiscountCodeDialog,
  showConfirm,
}: AdminDiscountsPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg">{t('dashboard.admin.discountsSection.title')}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full text-xs font-black"
          onClick={() => {
            setNewDiscountCode({
              code: '',
              discountType: 'percentage',
              discountValue: '',
              minOrderAmount: '',
              maxUses: '',
              validFrom: '',
              validUntil: '',
              isActive: true
            });
            setDiscountCodeDialog({ open: true, code: null });
          }}
          data-testid="button-create-discount-code"
        >
          <Plus className="w-3 h-3 mr-1" /> {t('dashboard.admin.discountsSection.newCode')}
        </Button>
      </div>
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y">
          {discountCodes?.map((dc) => (
            <div key={dc.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`discount-code-${dc.code}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm">{dc.code}</span>
                  <Badge variant={dc.isActive ? "default" : "secondary"} className="text-[10px]">
                    {dc.isActive ? t('dashboard.admin.discountsSection.activeStatus') : t('dashboard.admin.discountsSection.inactiveStatus')}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {dc.discountType === 'percentage' ? `${dc.discountValue}%` : `${(dc.discountValue / 100).toFixed(2)}€`}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.admin.discountsSection.used')}: {dc.usedCount}{dc.maxUses ? `/${dc.maxUses}` : ''} {t('dashboard.admin.discountsSection.times')}
                  {dc.minOrderAmount && ` | ${t('dashboard.admin.discountsSection.min')}: ${(dc.minOrderAmount / 100).toFixed(2)}€`}
                </p>
                {(dc.validFrom || dc.validUntil) && (
                  <p className="text-[9px] md:text-[10px] text-muted-foreground">
                    {dc.validFrom && formatDate(dc.validFrom)}
                    {dc.validFrom && dc.validUntil && ' → '}
                    {dc.validUntil && formatDate(dc.validUntil)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-xs h-8 w-8 p-0"
                  onClick={() => {
                    setNewDiscountCode({
                      code: dc.code,
                      discountType: dc.discountType,
                      discountValue: dc.discountValue.toString(),
                      minOrderAmount: dc.minOrderAmount ? (dc.minOrderAmount / 100).toString() : '',
                      maxUses: dc.maxUses?.toString() || '',
                      validFrom: dc.validFrom ? dc.validFrom.split('T')[0] : '',
                      validUntil: dc.validUntil ? dc.validUntil.split('T')[0] : '',
                      isActive: dc.isActive
                    });
                    setDiscountCodeDialog({ open: true, code: dc });
                  }}
                  data-testid={`button-edit-discount-${dc.code}`}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`rounded-full text-xs h-8 w-8 p-0 ${dc.isActive ? 'text-red-600' : 'text-accent'}`}
                  onClick={async () => {
                    try {
                      await apiRequest("PATCH", `/api/admin/discount-codes/${dc.id}`, { isActive: !dc.isActive });
                      refetchDiscountCodes();
                      setFormMessage({ type: 'success', text: dc.isActive ? t("dashboard.toasts.discountCodeDeactivated") : t("dashboard.toasts.discountCodeActivated") });
                    } catch (e) {
                      setFormMessage({ type: 'error', text: t("common.error") });
                    }
                  }}
                  data-testid={`button-toggle-discount-${dc.code}`}
                >
                  {dc.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-xs h-8 w-8 p-0 text-red-600 border-red-200"
                  onClick={() => {
                    showConfirm({
                      title: t('common.confirmAction'),
                      description: `${t('dashboard.admin.discountsSection.confirmDeleteCode')} ${dc.code}?`,
                      onConfirm: async () => {
                        try {
                          await apiRequest("DELETE", `/api/admin/discount-codes/${dc.id}`);
                          refetchDiscountCodes();
                          setFormMessage({ type: 'success', text: t("dashboard.toasts.discountCodeDeleted") });
                        } catch (e) {
                          setFormMessage({ type: 'error', text: t("common.error") });
                        }
                      },
                    });
                  }}
                  data-testid={`button-delete-discount-${dc.code}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {(!discountCodes || discountCodes.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">{t('dashboard.admin.discountsSection.noDiscountCodes')}</div>
          )}
        </div>
      </Card>
    </div>
  );
}
