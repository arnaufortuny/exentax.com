import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { CheckCircle2, Trash2, Mail } from "lucide-react";
import { NewsletterToggle } from "./";
import { SocialLogin } from "@/components/auth/social-login";
import type { User, ProfileData } from "./types";
import { queryClient } from "@/lib/queryClient";
import type { UseMutationResult } from "@tanstack/react-query";

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
}: ProfileTabProps) {
  return (
    <div key="profile" className="space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Mi Perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">Tus datos personales y configuración de cuenta</p>
      </div>
      <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 bg-white dark:bg-zinc-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Datos Personales</h3>
          {canEdit && (
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setIsEditing(!isEditing)} data-testid="button-toggle-edit">{isEditing ? 'Cancelar' : 'Editar'}</Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-6">Esta información nos permite acompañarte mejor y cumplir con los requisitos legales cuando sea necesario.</p>
        {!canEdit && (
          <div className={`mb-4 p-3 rounded-lg ${user?.accountStatus === 'pending' ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${user?.accountStatus === 'pending' ? 'text-orange-700' : 'text-red-700'}`}>
              {user?.accountStatus === 'pending' 
                ? 'Tu cuenta está en revisión. No puedes modificar tu perfil hasta que sea verificada.' 
                : 'Tu cuenta ha sido desactivada. No puedes modificar tu perfil ni enviar solicitudes.'}
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">ID Cliente</p>
              <p className="text-lg font-black font-mono">{user?.clientId || user?.id?.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Estado</p>
              <p className={`text-lg font-black ${user?.accountStatus === 'active' ? 'text-green-600' : user?.accountStatus === 'pending' ? 'text-orange-500' : user?.accountStatus === 'deactivated' ? 'text-red-600' : user?.accountStatus === 'vip' ? 'text-yellow-600' : 'text-green-600'}`}>
                {user?.accountStatus === 'active' ? 'Verificado' : user?.accountStatus === 'pending' ? 'En revisión' : user?.accountStatus === 'deactivated' ? 'Desactivada' : user?.accountStatus === 'vip' ? 'VIP' : 'Verificado'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Nombre</Label>
              {isEditing && canEdit ? <Input value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} placeholder="Tu nombre real" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-firstname" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.firstName || '-'}</div>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Apellidos</Label>
              {isEditing && canEdit ? <Input value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} placeholder="Tal y como aparecen en tu documento" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-lastname" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.lastName || '-'}</div>}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg flex justify-between items-center text-sm">
              <span>{user?.email}</span>
              {user?.emailVerified ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="text-accent p-0 h-auto text-xs font-black"
                  onClick={() => setShowEmailVerification(true)}
                  data-testid="button-verify-email"
                >
                  Verificar email
                </Button>
              )}
            </div>
            {!user?.emailVerified && (
              <p className="text-xs text-orange-600 mt-1">Tu cuenta está en revisión hasta que verifiques tu email.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground">Teléfono</Label>
            {isEditing && canEdit ? <Input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} placeholder="Para contactarte si es necesario" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-phone" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.phone || 'No proporcionado'}</div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Tipo de documento</Label>
              {isEditing && canEdit ? (
                <NativeSelect 
                  value={profileData.idType} 
                  onValueChange={val => setProfileData({...profileData, idType: val})}
                  placeholder="DNI · NIE · Pasaporte"
                  className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  data-testid="select-idtype"
                >
                  <NativeSelectItem value="dni">DNI</NativeSelectItem>
                  <NativeSelectItem value="nie">NIE</NativeSelectItem>
                  <NativeSelectItem value="passport">Pasaporte</NativeSelectItem>
                </NativeSelect>
              ) : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.idType === 'dni' ? 'DNI' : user?.idType === 'nie' ? 'NIE' : user?.idType === 'passport' ? 'Pasaporte' : 'No proporcionado'}</div>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Número de documento</Label>
              {isEditing && canEdit ? <Input value={profileData.idNumber} onChange={e => setProfileData({...profileData, idNumber: e.target.value})} placeholder="Documento de identificación" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-idnumber" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.idNumber || 'No proporcionado'}</div>}
            </div>
          </div>
          <div className="space-y-1 max-w-[200px]">
            <Label className="text-xs font-bold text-muted-foreground">Fecha de nacimiento</Label>
            {isEditing && canEdit ? <Input type="date" value={profileData.birthDate} onChange={e => setProfileData({...profileData, birthDate: e.target.value})} className="rounded-full h-10 px-4 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-sm" data-testid="input-birthdate" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.birthDate || 'No proporcionado'}</div>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground">Actividad profesional</Label>
            {isEditing && canEdit ? (
              <NativeSelect 
                value={profileData.businessActivity} 
                onValueChange={val => setProfileData({...profileData, businessActivity: val})}
                placeholder="A qué te dedicas"
                className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                data-testid="select-activity"
              >
                <NativeSelectItem value="ecommerce">E-commerce</NativeSelectItem>
                <NativeSelectItem value="dropshipping">Dropshipping</NativeSelectItem>
                <NativeSelectItem value="consulting">Consultoría</NativeSelectItem>
                <NativeSelectItem value="marketing">Marketing Digital</NativeSelectItem>
                <NativeSelectItem value="software">Desarrollo de Software</NativeSelectItem>
                <NativeSelectItem value="trading">Trading / Inversiones</NativeSelectItem>
                <NativeSelectItem value="freelance">Freelance</NativeSelectItem>
                <NativeSelectItem value="other">Otra</NativeSelectItem>
              </NativeSelect>
            ) : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.businessActivity || 'No proporcionado'}</div>}
          </div>
          <div className="pt-4 border-t border-border">
            <h4 className="font-bold text-sm mb-3">Dirección de residencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">Tipo de vía</Label>
                {isEditing && canEdit ? (
                  <NativeSelect 
                    value={profileData.streetType} 
                    onValueChange={val => setProfileData({...profileData, streetType: val})}
                    placeholder="Calle · Avenida · Paseo · Plaza"
                    className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    data-testid="select-street-type"
                  >
                    <NativeSelectItem value="calle">Calle</NativeSelectItem>
                    <NativeSelectItem value="avenida">Avenida</NativeSelectItem>
                    <NativeSelectItem value="paseo">Paseo</NativeSelectItem>
                    <NativeSelectItem value="plaza">Plaza</NativeSelectItem>
                  </NativeSelect>
                ) : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.streetType || '-'}</div>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">Dirección</Label>
                {isEditing && canEdit ? <Input value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder="Calle y número" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.address || '-'}</div>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">Ciudad</Label>
                {isEditing && canEdit ? <Input value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} placeholder="Ciudad de residencia" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.city || '-'}</div>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">Provincia</Label>
                {isEditing && canEdit ? <Input value={profileData.province} onChange={e => setProfileData({...profileData, province: e.target.value})} placeholder="Provincia o región" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.province || '-'}</div>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">C.P.</Label>
                {isEditing && canEdit ? <Input value={profileData.postalCode} onChange={e => setProfileData({...profileData, postalCode: e.target.value})} placeholder="Código postal" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.postalCode || '-'}</div>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground">País</Label>
                {isEditing && canEdit ? <Input value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} placeholder="País de residencia" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.country || '-'}</div>}
              </div>
            </div>
          </div>
          {isEditing && canEdit && (
            <div className="mt-6 space-y-3">
              <Button onClick={() => { updateProfile.mutate(profileData); setIsEditing(false); }} className="w-full bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all" disabled={updateProfile.isPending} data-testid="button-save-profile">Guardar cambios</Button>
              <p className="text-xs text-center text-muted-foreground">Nuestro equipo revisará cualquier cambio antes de avanzar para asegurarnos de que todo esté correcto.</p>
            </div>
          )}
        </div>
        <div className="mt-8 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">Suscripción Newsletter</h4>
              <p className="text-xs text-muted-foreground">Recibe noticias y consejos para tu LLC.</p>
            </div>
            <NewsletterToggle />
          </div>
        </div>
        <div className="mt-8 pt-8 border-t">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-foreground">Cambiar Contraseña</h4>
              <p className="text-xs text-muted-foreground">Actualiza tu contraseña de acceso.</p>
            </div>
            {!showPasswordForm && (
              <Button variant="outline" className="rounded-full" onClick={() => setShowPasswordForm(true)} data-testid="button-show-password-form">
                Cambiar
              </Button>
            )}
          </div>
          {showPasswordForm && (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
              {passwordStep === 'form' && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Contraseña actual</Label>
                    <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} data-testid="input-current-password" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Nueva contraseña</Label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} data-testid="input-new-password" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Confirmar nueva contraseña</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} data-testid="input-confirm-password" />
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="rounded-full flex-1" onClick={() => { setShowPasswordForm(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}>Cancelar</Button>
                    <Button 
                      className="bg-accent text-accent-foreground font-semibold rounded-full flex-1"
                      onClick={() => requestPasswordOtpMutation.mutate()}
                      disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8 || requestPasswordOtpMutation.isPending}
                      data-testid="button-request-otp"
                    >
                      {requestPasswordOtpMutation.isPending ? 'Enviando...' : 'Enviar código'}
                    </Button>
                  </div>
                </>
              )}
              {passwordStep === 'otp' && (
                <>
                  <div className="text-center pb-2">
                    <Mail className="w-8 h-8 mx-auto text-accent mb-2" />
                    <p className="text-sm text-muted-foreground">Ingresa el código de 6 dígitos enviado a tu email</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Código de verificación</Label>
                    <Input 
                      type="text" 
                      value={passwordOtp} 
                      onChange={e => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      className="text-center text-2xl tracking-[0.5em] font-mono"
                      maxLength={6}
                      inputMode="numeric"
                      data-testid="input-password-otp" 
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="rounded-full flex-1" onClick={() => { setPasswordStep('form'); setPasswordOtp(""); }}>Volver</Button>
                    <Button 
                      className="bg-accent text-accent-foreground font-semibold rounded-full flex-1"
                      onClick={() => changePasswordMutation.mutate({ currentPassword, newPassword, otp: passwordOtp })}
                      disabled={passwordOtp.length !== 6 || changePasswordMutation.isPending}
                      data-testid="button-save-password"
                    >
                      {changePasswordMutation.isPending ? 'Guardando...' : 'Confirmar'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="mt-8 pt-8 border-t">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-foreground">Cuentas Conectadas</h4>
              <p className="text-xs text-muted-foreground">Vincula tus cuentas sociales para iniciar sesion mas rapido.</p>
            </div>
          </div>
          <SocialLogin 
            mode="connect" 
            googleConnected={!!(user as any)?.googleId}
            onSuccess={() => queryClient.refetchQueries({ queryKey: ["/api/auth/user"] })}
          />
        </div>
        {canEdit && (
          <div className="mt-8 pt-8 border-t">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-red-600 text-sm">Eliminar Cuenta</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">Esta acción es irreversible. Se eliminarán todos tus datos.</p>
              </div>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 rounded-full shrink-0" onClick={() => setDeleteOwnAccountDialog(true)} data-testid="button-delete-own-account">
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
