import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { CheckCircle2, Trash2, Mail, Copy, Check, Globe, ShieldCheck, RotateCcw, X } from "@/components/icons";
import { useState, useEffect } from "react";
import { NewsletterToggle } from "./";
import { SocialLogin } from "@/components/auth/social-login";
import type { User, ProfileData } from "./types";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { UseMutationResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { SpainFlag, USAFlag, CatalanFlag, FranceFlag, GermanyFlag, ItalyFlag, PortugalFlag } from "@/components/ui/flags";

interface ProfileTabProps {
  user: User | null;
  canEdit: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  updateProfile: UseMutationResult<any, Error, ProfileData>;
  showPasswordForm: boolean;
  setShowPasswordForm: (show: boolean) => void;
  passwordStep: 'form' | 'otp';
  setPasswordStep: (step: 'form' | 'otp') => void;
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  passwordOtp: string;
  setPasswordOtp: (otp: string) => void;
  requestPasswordOtpMutation: UseMutationResult<any, Error, void>;
  changePasswordMutation: UseMutationResult<any, Error, { currentPassword: string; newPassword: string; otp: string }>;
  setShowEmailVerification: (show: boolean) => void;
  setDeleteOwnAccountDialog: (show: boolean) => void;
  profileOtpStep: 'idle' | 'otp';
  setProfileOtpStep: (step: 'idle' | 'otp') => void;
  profileOtp: string;
  setProfileOtp: (otp: string) => void;
  confirmProfileWithOtp: UseMutationResult<any, Error, void>;
  cancelPendingChanges: UseMutationResult<any, Error, void>;
  resendProfileOtp: UseMutationResult<any, Error, void>;
}

export function ProfileTab({
  user,
  canEdit,
  isEditing,
  setIsEditing,
  profileData,
  setProfileData,
  updateProfile,
  showPasswordForm,
  setShowPasswordForm,
  passwordStep,
  setPasswordStep,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordOtp,
  setPasswordOtp,
  requestPasswordOtpMutation,
  changePasswordMutation,
  setShowEmailVerification,
  setDeleteOwnAccountDialog,
  profileOtpStep,
  setProfileOtpStep,
  profileOtp,
  setProfileOtp,
  confirmProfileWithOtp,
  cancelPendingChanges,
  resendProfileOtp,
}: ProfileTabProps) {
  const [copiedId, setCopiedId] = useState(false);
  const { t, i18n } = useTranslation();
  
  const languages = [
    { code: 'es', label: 'Español', Flag: SpainFlag },
    { code: 'en', label: 'English', Flag: USAFlag },
    { code: 'ca', label: 'Català', Flag: CatalanFlag },
    { code: 'fr', label: 'Français', Flag: FranceFlag },
    { code: 'de', label: 'Deutsch', Flag: GermanyFlag },
    { code: 'it', label: 'Italiano', Flag: ItalyFlag },
    { code: 'pt', label: 'Português', Flag: PortugalFlag },
  ];
  
  const currentLangCode = i18n.language?.split('-')[0] || 'es';

  const handleLanguageChange = async (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    try {
      await apiRequest("PATCH", "/api/user/language", { preferredLanguage: langCode });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };
  
  const hasPendingChanges = !!(user as any)?.pendingProfileChanges;
  const pendingChangesData = (user as any)?.pendingProfileChanges as { fields: Record<string, any>; changedFields: { field: string; oldValue: any; newValue: any }[] } | null;
  const pendingExpiresAt = (user as any)?.pendingChangesExpiresAt;
  
  useEffect(() => {
    if (hasPendingChanges && profileOtpStep === 'idle') {
      setProfileOtpStep('otp');
    }
  }, [hasPendingChanges]);
  
  const copyIdToClipboard = () => {
    const clientId = user?.clientId || user?.id?.slice(0, 8).toUpperCase() || '';
    navigator.clipboard.writeText(clientId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const inputClass = "rounded-full h-11 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-muted transition-colors font-medium text-foreground text-sm";
  const selectClass = "rounded-full h-11 px-5 border-2 border-gray-200 dark:border-border bg-white dark:bg-muted";
  const readOnlyClass = "p-2.5 px-5 bg-gray-50 dark:bg-muted rounded-full text-sm h-11 flex items-center";

  return (
    <div key="profile" className="space-y-4">
      <div className="mb-2 md:mb-4">
        <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">{t('profile.title')}</h2>
        <p className="text-base text-muted-foreground mt-1">{t('profile.subtitle')}</p>
      </div>

      {(profileOtpStep === 'otp' || hasPendingChanges) && (
        <Card className="rounded-2xl border-accent/30 dark:border-accent shadow-md p-5 md:p-6 bg-accent/5 dark:bg-accent/10" data-testid="card-profile-otp">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <h3 className="font-black text-foreground">{t('profile.otpSentTitle')}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t('profile.otpRequiredDesc')}</p>
              <p className="text-xs font-bold text-accent dark:text-accent mt-1">{t('profile.actionRequired')}</p>
            </div>
          </div>
          
          {pendingChangesData?.changedFields && (
            <div className="mb-4 p-3 bg-white/60 dark:bg-card/60 rounded-xl border border-accent/30 dark:border-accent/30">
              <p className="text-xs font-bold text-muted-foreground mb-2">{t('profile.pendingChanges')}:</p>
              <div className="space-y-1">
                {pendingChangesData.changedFields.map((change, i) => {
                  const fieldLabels: Record<string, string> = {
                    firstName: t('profile.fields.firstName'),
                    lastName: t('profile.fields.lastName'),
                    idNumber: t('profile.fields.idNumber'),
                    idType: t('profile.fields.idType'),
                    phone: t('profile.fields.phone'),
                  };
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-foreground">{fieldLabels[change.field] || change.field}:</span>
                      <span className="text-muted-foreground line-through">{change.oldValue}</span>
                      <span className="text-foreground">→</span>
                      <span className="font-bold text-accent dark:text-accent">{change.newValue}</span>
                    </div>
                  );
                })}
              </div>
              {pendingExpiresAt && (
                <p className="text-[10px] text-muted-foreground mt-2">{t('profile.expiresIn')}: {new Date(pendingExpiresAt).toLocaleString()}</p>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.profile.verificationCode')}</Label>
              <Input type="text" 
                value={profileOtp} 
                onChange={e => setProfileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                className="rounded-full text-center text-lg tracking-[0.3em] font-mono bg-white dark:bg-card"
                maxLength={6}
                inputMode="numeric"
                autoFocus
                data-testid="input-profile-otp" 
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="rounded-full flex-1" 
                onClick={() => cancelPendingChanges.mutate()}
                disabled={cancelPendingChanges.isPending}
                data-testid="button-cancel-profile-otp"
              >
                {cancelPendingChanges.isPending ? '...' : t('profile.cancelChanges')}
              </Button>
              <Button 
                className="bg-accent text-accent-foreground font-black rounded-full flex-1"
                onClick={() => confirmProfileWithOtp.mutate()}
                disabled={profileOtp.length !== 6 || confirmProfileWithOtp.isPending}
                data-testid="button-confirm-profile-otp"
              >
                {confirmProfileWithOtp.isPending ? t('common.saving') : t('profile.confirmChanges')}
              </Button>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs text-muted-foreground rounded-full"
                onClick={() => resendProfileOtp.mutate()}
                disabled={resendProfileOtp.isPending}
                data-testid="button-resend-profile-otp"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                {resendProfileOtp.isPending ? t('common.sending') : t('profile.resendCode')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className={`rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-5 md:p-6 bg-white dark:bg-card transition-opacity duration-200 ${(profileOtpStep === 'otp' || hasPendingChanges) ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base md:text-lg font-black text-foreground">{t('profile.personalData')}</h3>
          {canEdit && !(profileOtpStep === 'otp' || hasPendingChanges) && (
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => { setIsEditing(!isEditing); if (isEditing) setProfileOtpStep('idle'); }} data-testid="button-toggle-edit">{isEditing ? t('common.cancel') : t('common.edit')}</Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t('profile.infoDescription')}</p>
        {!canEdit && (
          <div className={`mb-4 p-3 rounded-lg ${user?.accountStatus === 'pending' ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <p className={`text-sm ${user?.accountStatus === 'pending' ? 'text-orange-700 dark:text-orange-400' : 'text-red-700 dark:text-red-400'}`}>
              {user?.accountStatus === 'pending' 
                ? t('dashboard.accountStatus.pendingReview.message')
                : t('dashboard.accountStatus.deactivated.message')}
            </p>
          </div>
        )}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5">{t('profile.clientId')}</p>
              <div className="flex items-center gap-2">
                <p className="text-base font-black font-mono">{user?.clientId || user?.id?.slice(0, 8).toUpperCase()}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-full" 
                  onClick={copyIdToClipboard}
                  data-testid="button-copy-client-id"
                  title={t('common.copy')}
                >
                  {copiedId ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5">{t('profile.status')}</p>
              <p className={`text-base font-black ${user?.accountStatus === 'active' ? 'text-accent' : user?.accountStatus === 'pending' ? 'text-orange-500' : user?.accountStatus === 'deactivated' ? 'text-red-600' : user?.accountStatus === 'vip' ? 'text-yellow-600' : 'text-accent'}`}>
                {user?.accountStatus === 'active' ? t('profile.statusValues.verified') : user?.accountStatus === 'pending' ? t('profile.statusValues.pending') : user?.accountStatus === 'deactivated' ? t('profile.statusValues.deactivated') : user?.accountStatus === 'vip' ? t('profile.statusValues.vip') : t('profile.statusValues.verified')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.firstName')}</Label>
              {isEditing && canEdit ? <Input value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} placeholder={t('profile.placeholders.firstName')} className={inputClass} data-testid="input-firstname" /> : <div className={readOnlyClass}>{user?.firstName || '-'}</div>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.lastName')}</Label>
              {isEditing && canEdit ? <Input value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} placeholder={t('profile.placeholders.lastName')} className={inputClass} data-testid="input-lastname" /> : <div className={readOnlyClass}>{user?.lastName || '-'}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Email</Label>
              <div className="p-2.5 px-5 bg-gray-50 dark:bg-muted rounded-full flex justify-between items-center text-sm h-11">
                <span className="truncate">{user?.email}</span>
                {user?.emailVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-accent p-0 h-auto text-xs font-black shrink-0 rounded-full"
                    onClick={() => setShowEmailVerification(true)}
                    data-testid="button-verify-email"
                  >
                    {t('profile.verifyEmail')}
                  </Button>
                )}
              </div>
              {!user?.emailVerified && (
                <p className="text-[10px] text-orange-600 dark:text-orange-400">{t('dashboard.accountStatus.pendingReview.description')}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">{t('profile.changeEmailContact')}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.phone')}</Label>
              {isEditing && canEdit ? <Input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} placeholder={t('profile.placeholders.phone')} className={inputClass} data-testid="input-phone" /> : <div className={readOnlyClass}>{user?.phone || t('profile.notProvided')}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.idType')}</Label>
              {isEditing && canEdit ? (
                <NativeSelect 
                  value={profileData.idType} 
                  onValueChange={val => setProfileData({...profileData, idType: val})}
                  placeholder={t('profile.placeholders.idType')}
                  className={selectClass}
                  data-testid="select-idtype"
                >
                  <NativeSelectItem value="dni">DNI</NativeSelectItem>
                  <NativeSelectItem value="nie">NIE</NativeSelectItem>
                  <NativeSelectItem value="passport">{t('profile.idTypes.passport')}</NativeSelectItem>
                </NativeSelect>
              ) : <div className={readOnlyClass}>{user?.idType === 'dni' ? 'DNI' : user?.idType === 'nie' ? 'NIE' : user?.idType === 'passport' ? t('profile.idTypes.passport') : t('profile.notProvided')}</div>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.idNumber')}</Label>
              {isEditing && canEdit ? <Input value={profileData.idNumber} onChange={e => setProfileData({...profileData, idNumber: e.target.value})} placeholder={t('profile.placeholders.idNumber')} className={inputClass} data-testid="input-idnumber" /> : <div className={readOnlyClass}>{user?.idNumber || t('profile.notProvided')}</div>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.birthDate')}</Label>
              {isEditing && canEdit ? <Input type="date" value={profileData.birthDate} onChange={e => setProfileData({...profileData, birthDate: e.target.value})} className={`${inputClass} text-xs sm:text-sm`} data-testid="input-birthdate" /> : <div className={readOnlyClass}>{user?.birthDate || t('profile.notProvided')}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.businessActivity')}</Label>
              {isEditing && canEdit ? (
                <NativeSelect 
                  value={profileData.businessActivity} 
                  onValueChange={val => setProfileData({...profileData, businessActivity: val})}
                  placeholder={t('profile.placeholders.businessActivity')}
                  className={selectClass}
                  data-testid="select-activity"
                >
                  <NativeSelectItem value="ecommerce">{t('auth.register.businessActivities.ecommerce')}</NativeSelectItem>
                  <NativeSelectItem value="dropshipping">{t('auth.register.businessActivities.dropshipping')}</NativeSelectItem>
                  <NativeSelectItem value="consulting">{t('auth.register.businessActivities.consulting')}</NativeSelectItem>
                  <NativeSelectItem value="marketing">{t('auth.register.businessActivities.marketing')}</NativeSelectItem>
                  <NativeSelectItem value="software">{t('auth.register.businessActivities.software')}</NativeSelectItem>
                  <NativeSelectItem value="trading">{t('auth.register.businessActivities.investments')}</NativeSelectItem>
                  <NativeSelectItem value="freelance">{t('auth.register.businessActivities.freelance')}</NativeSelectItem>
                  <NativeSelectItem value="other">{t('auth.register.businessActivities.other')}</NativeSelectItem>
                </NativeSelect>
              ) : <div className={readOnlyClass}>{user?.businessActivity || t('profile.notProvided')}</div>}
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <h4 className="font-black text-sm mb-2">{t('profile.sections.residenceAddress')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.streetType')}</Label>
                {isEditing && canEdit ? (
                  <NativeSelect 
                    value={profileData.streetType} 
                    onValueChange={val => setProfileData({...profileData, streetType: val})}
                    placeholder={t('profile.placeholders.streetType')}
                    className={selectClass}
                    data-testid="select-street-type"
                  >
                    <NativeSelectItem value="calle">{t('profile.streetTypes.street')}</NativeSelectItem>
                    <NativeSelectItem value="avenida">{t('profile.streetTypes.avenue')}</NativeSelectItem>
                    <NativeSelectItem value="paseo">{t('profile.streetTypes.promenade')}</NativeSelectItem>
                    <NativeSelectItem value="plaza">{t('profile.streetTypes.square')}</NativeSelectItem>
                  </NativeSelect>
                ) : <div className={readOnlyClass}>{user?.streetType || '-'}</div>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.address')}</Label>
                {isEditing && canEdit ? <Input value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder={t('profile.placeholders.address')} className={inputClass} /> : <div className={readOnlyClass}>{user?.address || '-'}</div>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.city')}</Label>
                {isEditing && canEdit ? <Input value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} placeholder={t('profile.placeholders.city')} className={inputClass} /> : <div className={readOnlyClass}>{user?.city || '-'}</div>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.province')}</Label>
                {isEditing && canEdit ? <Input value={profileData.province} onChange={e => setProfileData({...profileData, province: e.target.value})} placeholder={t('profile.placeholders.province')} className={inputClass} /> : <div className={readOnlyClass}>{user?.province || '-'}</div>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.postalCode')}</Label>
                {isEditing && canEdit ? <Input value={profileData.postalCode} onChange={e => setProfileData({...profileData, postalCode: e.target.value})} placeholder={t('profile.placeholders.postalCode')} className={inputClass} /> : <div className={readOnlyClass}>{user?.postalCode || '-'}</div>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">{t('profile.fields.country')}</Label>
                {isEditing && canEdit ? <Input value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} placeholder={t('profile.placeholders.country')} className={inputClass} /> : <div className={readOnlyClass}>{user?.country || '-'}</div>}
              </div>
            </div>
          </div>
          {isEditing && canEdit && (
            <div className="mt-4 space-y-2">
              <Button onClick={() => updateProfile.mutate(profileData)} className="w-full bg-accent hover:bg-accent/90 text-black font-black rounded-full h-11 transition-colors" disabled={updateProfile.isPending} data-testid="button-save-profile">{updateProfile.isPending ? t('common.saving') : t('profile.saveChanges')}</Button>
            </div>
          )}
        </div>
      </Card>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200 ${(profileOtpStep === 'otp' || hasPendingChanges) ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <Card className="rounded-2xl border-0 shadow-sm p-5 bg-white dark:bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-sm text-foreground">{t('profile.newsletter.title')}</h4>
              <p className="text-[10px] text-muted-foreground">{t('profile.newsletter.description')}</p>
            </div>
            <NewsletterToggle />
          </div>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm p-5 bg-white dark:bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="font-black text-sm text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {t('profile.language.title')}
              </h4>
              <p className="text-[10px] text-muted-foreground">{t('profile.language.description')}</p>
            </div>
            <NativeSelect
              value={currentLangCode}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-48 rounded-full"
              data-testid="select-language"
            >
              {languages.map((lang) => (
                <NativeSelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </NativeSelectItem>
              ))}
            </NativeSelect>
          </div>
        </Card>
      </div>

      <Card className={`rounded-2xl border-0 shadow-sm p-5 bg-white dark:bg-card transition-opacity duration-200 ${(profileOtpStep === 'otp' || hasPendingChanges) ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-black text-sm text-foreground">{t('profile.changePassword.title')}</h4>
            <p className="text-[10px] text-muted-foreground">{t('profile.changePassword.description')}</p>
          </div>
          {!showPasswordForm && (
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowPasswordForm(true)} data-testid="button-show-password-form">
              {t('common.change')}
            </Button>
          )}
        </div>
        {showPasswordForm && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-muted rounded-xl">
            {passwordStep === 'form' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('profile.currentPassword')}</Label>
                    <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="rounded-full" data-testid="input-current-password" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('profile.newPassword')}</Label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-full" data-testid="input-new-password" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('profile.confirmNewPassword')}</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="rounded-full" data-testid="input-confirm-password" />
                  </div>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">{t('profile.passwordMismatch')}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="rounded-full flex-1" onClick={() => { setShowPasswordForm(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}>{t('common.cancel')}</Button>
                  <Button 
                    className="bg-accent text-accent-foreground font-black rounded-full flex-1"
                    onClick={() => requestPasswordOtpMutation.mutate()}
                    disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8 || requestPasswordOtpMutation.isPending}
                    data-testid="button-request-otp"
                  >
                    {requestPasswordOtpMutation.isPending ? t('common.sending') : t('profile.sendCode')}
                  </Button>
                </div>
              </>
            )}
            {passwordStep === 'otp' && (
              <>
                <div className="text-center pb-2">
                  <Mail className="w-8 h-8 mx-auto text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">{t('profile.enterCode')}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('dashboard.profile.verificationCode')}</Label>
                  <Input type="text" 
                    value={passwordOtp} 
                    onChange={e => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                    className="rounded-full text-center text-lg tracking-[0.3em] font-mono"
                    maxLength={6}
                    inputMode="numeric"
                    data-testid="input-password-otp" 
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="rounded-full flex-1" onClick={() => { setPasswordStep('form'); setPasswordOtp(""); }}>{t('common.back')}</Button>
                  <Button 
                    className="bg-accent text-accent-foreground font-black rounded-full flex-1"
                    onClick={() => changePasswordMutation.mutate({ currentPassword, newPassword, otp: passwordOtp })}
                    disabled={passwordOtp.length !== 6 || changePasswordMutation.isPending}
                    data-testid="button-save-password"
                  >
                    {changePasswordMutation.isPending ? t('common.saving') : t('common.confirm')}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      <Card className={`rounded-2xl border-0 shadow-sm p-5 bg-white dark:bg-card transition-opacity duration-200 ${(profileOtpStep === 'otp' || hasPendingChanges) ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="mb-3">
          <h4 className="font-black text-sm text-foreground">{t('profile.connectedAccounts.title')}</h4>
          <p className="text-[10px] text-muted-foreground">{t('profile.connectedAccounts.description')}</p>
        </div>
        <SocialLogin 
          mode="connect" 
          googleConnected={!!(user as any)?.googleId}
          onSuccess={() => queryClient.refetchQueries({ queryKey: ["/api/auth/user"] })}
        />
      </Card>

      {canEdit && (
        <Card className="rounded-2xl border-0 shadow-sm p-5 bg-white dark:bg-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-black text-sm text-red-600 dark:text-red-400">{t('dashboard.profile.deleteAccount')}</h4>
              <p className="text-[10px] text-muted-foreground">{t('profile.deleteAccountDesc')}</p>
            </div>
            <Button size="sm" variant="destructive" className="font-bold rounded-full text-xs shrink-0" onClick={() => setDeleteOwnAccountDialog(true)} data-testid="button-delete-own-account">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> {t('dashboard.profile.deleteAccount')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
