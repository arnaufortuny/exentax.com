import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { X, Loader2 } from "@/components/icons";
import { AdminUserData } from "@/components/dashboard";

interface EditUserFormProps {
  editingUser: AdminUserData;
  setEditingUser: (user: AdminUserData | null) => void;
  updateUserMutation: { mutate: (data: any) => void; isPending: boolean };
  currentUserEmail: string | undefined;
  onClose: () => void;
}

export function EditUserForm({ editingUser, setEditingUser, updateUserMutation, currentUserEmail, onClose }: EditUserFormProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.editUser')}</h3>
          <p className="text-sm text-muted-foreground">{t('dashboard.admin.editUserDesc')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.firstName')}</Label>
            <Input value={editingUser.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-firstname" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.lastName')}</Label>
            <Input value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-lastname" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.email')}</Label>
          <Input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-email" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.phone')}</Label>
          <Input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-phone" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.idType')}</Label>
            <NativeSelect 
              value={editingUser.idType || ''} 
              onValueChange={val => setEditingUser({...editingUser, idType: val})}
              placeholder={t('dashboard.admin.select')}
              className="w-full rounded-xl h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card"
            >
              <NativeSelectItem value="dni">DNI</NativeSelectItem>
              <NativeSelectItem value="nie">NIE</NativeSelectItem>
              <NativeSelectItem value="passport">{t('dashboard.admin.passport')}</NativeSelectItem>
            </NativeSelect>
          </div>
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.idNumber')}</Label>
            <Input value={editingUser.idNumber || ''} onChange={e => setEditingUser({...editingUser, idNumber: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-idnumber" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.birthDate')}</Label>
          <Input type="date" value={editingUser.birthDate || ''} onChange={e => setEditingUser({...editingUser, birthDate: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-birthdate" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.businessActivity')}</Label>
          <NativeSelect 
            value={editingUser.businessActivity || ''} 
            onValueChange={val => setEditingUser({...editingUser, businessActivity: val})}
            placeholder={t("common.select")}
            className="rounded-xl h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card"
            data-testid="select-edit-activity"
          >
            <NativeSelectItem value="ecommerce">{t("auth.register.businessActivities.ecommerce")}</NativeSelectItem>
            <NativeSelectItem value="dropshipping">{t("auth.register.businessActivities.dropshipping")}</NativeSelectItem>
            <NativeSelectItem value="consulting">{t("auth.register.businessActivities.consulting")}</NativeSelectItem>
            <NativeSelectItem value="marketing">{t("auth.register.businessActivities.marketing")}</NativeSelectItem>
            <NativeSelectItem value="software">{t("auth.register.businessActivities.software")}</NativeSelectItem>
            <NativeSelectItem value="saas">{t("auth.register.businessActivities.saas")}</NativeSelectItem>
            <NativeSelectItem value="apps">{t("auth.register.businessActivities.apps")}</NativeSelectItem>
            <NativeSelectItem value="ai">{t("auth.register.businessActivities.ai")}</NativeSelectItem>
            <NativeSelectItem value="investments">{t("auth.register.businessActivities.investments")}</NativeSelectItem>
            <NativeSelectItem value="tradingEducation">{t("auth.register.businessActivities.tradingEducation")}</NativeSelectItem>
            <NativeSelectItem value="financial">{t("auth.register.businessActivities.financial")}</NativeSelectItem>
            <NativeSelectItem value="crypto">{t("auth.register.businessActivities.crypto")}</NativeSelectItem>
            <NativeSelectItem value="realestate">{t("auth.register.businessActivities.realestate")}</NativeSelectItem>
            <NativeSelectItem value="import">{t("auth.register.businessActivities.import")}</NativeSelectItem>
            <NativeSelectItem value="coaching">{t("auth.register.businessActivities.coaching")}</NativeSelectItem>
            <NativeSelectItem value="content">{t("auth.register.businessActivities.content")}</NativeSelectItem>
            <NativeSelectItem value="affiliate">{t("auth.register.businessActivities.affiliate")}</NativeSelectItem>
            <NativeSelectItem value="freelance">{t("auth.register.businessActivities.freelance")}</NativeSelectItem>
            <NativeSelectItem value="gaming">{t("auth.register.businessActivities.gaming")}</NativeSelectItem>
            <NativeSelectItem value="digitalProducts">{t("auth.register.businessActivities.digitalProducts")}</NativeSelectItem>
            <NativeSelectItem value="other">{t("auth.register.businessActivities.other")}</NativeSelectItem>
          </NativeSelect>
        </div>
        <div>
          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.address')}</Label>
          <Input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} placeholder={t('dashboard.admin.streetAndNumber')} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-address" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.city')}</Label>
            <Input value={editingUser.city || ''} onChange={e => setEditingUser({...editingUser, city: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-city" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.postalCode')}</Label>
            <Input value={editingUser.postalCode || ''} onChange={e => setEditingUser({...editingUser, postalCode: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-postal" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.province')}</Label>
            <Input value={editingUser.province || ''} onChange={e => setEditingUser({...editingUser, province: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-province" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.country')}</Label>
            <Input value={editingUser.country || ''} onChange={e => setEditingUser({...editingUser, country: e.target.value})} className="rounded-full h-10 px-3 border border-border dark:border-border text-sm bg-white dark:bg-card" data-testid="input-edit-country" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.internalNotes')}</Label>
          <Textarea value={editingUser.internalNotes || ''} onChange={e => setEditingUser({...editingUser, internalNotes: e.target.value})} rows={2} className="rounded-2xl border-border bg-background dark:bg-card text-sm" data-testid="input-edit-notes" />
        </div>
        {currentUserEmail === (import.meta.env.VITE_ADMIN_EMAIL || 'afortuny07@gmail.com') && (
          <>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-purple-700 dark:text-purple-300">{t('dashboard.admin.adminPermissions')}</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400">{t('dashboard.admin.onlyYouCanChange')}</p>
              </div>
              <Switch
                checked={editingUser.isAdmin || false}
                onCheckedChange={(checked) => setEditingUser({...editingUser, isAdmin: checked})}
                data-testid="switch-admin-toggle"
              />
            </div>
          </div>
          <div className="p-3 bg-accent/5 dark:bg-accent/10 rounded-xl border border-accent/20 dark:border-accent/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-accent dark:text-accent">{t('dashboard.admin.supportPermissions')}</p>
                <p className="text-[10px] text-accent dark:text-accent">{t('dashboard.admin.supportPermissionsDesc')}</p>
              </div>
              <Switch
                checked={editingUser.isSupport || false}
                onCheckedChange={(checked) => setEditingUser({...editingUser, isSupport: checked})}
                data-testid="switch-support-toggle"
              />
            </div>
          </div>
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-4">
        <Button type="button" onClick={(e) => { e.preventDefault(); editingUser.id && updateUserMutation.mutate({ id: editingUser.id, ...editingUser }); }} disabled={updateUserMutation.isPending} className="flex-1 bg-accent text-accent-foreground font-black rounded-full" data-testid="button-save-user">
          {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.saveChanges')}
        </Button>
        <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); onClose(); }} className="flex-1 rounded-full">{t('common.cancel')}</Button>
      </div>
    </Card>
  );
}
