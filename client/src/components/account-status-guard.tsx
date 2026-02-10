import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/loading-screen";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  LogOut, Mail, Clock, Shield, ShieldCheck, Bell, BellRing, Loader2,
  Upload, FileText, X
} from "@/components/icons";


function formatDateCompact(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "Hace un momento";
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString();
}

function translateNotification(text: string | null | undefined): string {
  if (!text) return "";
  return text;
}

interface AccountStatusGuardProps {
  children: ReactNode;
}

export function AccountStatusGuard({ children }: AccountStatusGuardProps) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  if (user.accountStatus === 'deactivated') {
    return <DeactivatedPage />;
  }

  if (user.accountStatus === 'pending') {
    return <PendingReviewPage />;
  }

  return <>{children}</>;
}

function DeactivatedPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
              <circle cx="60" cy="60" r="50" fill="#DBEAFE" stroke="#2C5F8A" strokeWidth="4"/>
              <path d="M60 35V65" stroke="#2C5F8A" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="60" cy="80" r="5" fill="#2C5F8A"/>
            </svg>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight" data-testid="text-deactivated-title">
              {t("auth.accountDeactivated.title")}
            </h1>
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">
              {t("auth.accountDeactivated.description")}
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full sm:w-auto px-8 font-black rounded-full shadow-lg"
            size="lg"
            onClick={() => apiRequest("POST", "/api/auth/logout").then(() => window.location.href = "/")}
            data-testid="button-deactivated-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("nav.logout")}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PendingReviewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [idvUploadFile, setIdvUploadFile] = useState<File | null>(null);
  const [isUploadingIdv, setIsUploadingIdv] = useState(false);
  const tn = translateNotification;

  const { data: notifications, isLoading: notificationsLoading } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });

  const markNotificationRead = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-y-auto">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full overflow-y-auto">
        <header className="mb-6 md:mb-8">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight" data-testid="text-pending-hello">
            {t("dashboard.pendingAccount.hello", { name: (user?.firstName || t('dashboard.defaultName')).charAt(0).toUpperCase() + (user?.firstName || t('dashboard.defaultName')).slice(1).toLowerCase() })}
          </h1>
        </header>

        {formMessage && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${formMessage.type === 'success' ? 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/30 dark:border-accent/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`} data-testid="text-form-message">
            {formMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white dark:bg-card">
            <div className="h-1.5 w-full bg-accent" />
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-900/10 dark:border-accent/30">
                <div className="flex items-center justify-center shrink-0">
                  <div className="w-16 h-16 rounded-full bg-accent/10 dark:bg-accent/15 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div>
                  <h2 className="font-black text-lg text-foreground">
                    {!user?.emailVerified ? t("dashboard.pendingAccount.title") : t("dashboard.pendingAccount.adminReviewTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {!user?.emailVerified ? t("dashboard.pendingAccount.subtitle") : t("dashboard.pendingAccount.adminReviewSubtitle")}
                  </p>
                </div>
              </div>

              {!user?.emailVerified ? (
                <div className="bg-accent/5 dark:bg-accent/10 border border-accent/30 dark:border-accent/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-accent" />
                    <span className="font-black text-sm text-accent dark:text-accent">{t("dashboard.pendingAccount.verifyEmailStep")}</span>
                  </div>
                  <p className="text-xs text-accent dark:text-accent mb-3">
                    {t("dashboard.pendingAccount.codeSentTo")} <strong>{user?.email}</strong>
                  </p>
                  <Input value={emailVerificationCode}
                    onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="rounded-full text-center text-xl font-black border-accent/30 focus:border-accent tracking-[0.4em] h-12 mb-3"
                    maxLength={6}
                    inputMode="numeric"
                    data-testid="input-pending-verification-code"
                  />
                  <Button onClick={async () => {
                      if (!emailVerificationCode || emailVerificationCode.length < 6) {
                        setFormMessage({ type: 'error', text: t("dashboard.pendingAccount.enter6DigitCode") });
                        return;
                      }
                      setIsVerifyingEmail(true);
                      try {
                        const res = await apiRequest("POST", "/api/auth/verify-email", { code: emailVerificationCode });
                        const result = await res.json();
                        if (result.success) {
                          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
                          setFormMessage({ type: 'success', text: t("dashboard.pendingAccount.emailVerified") });
                          setEmailVerificationCode("");
                        }
                      } catch {
                        setFormMessage({ type: 'error', text: t("llc.messages.incorrectCode") });
                      } finally {
                        setIsVerifyingEmail(false);
                      }
                    }}
                    disabled={isVerifyingEmail || emailVerificationCode.length < 6}
                    className="w-full bg-accent text-accent-foreground font-black rounded-full h-11"
                    data-testid="button-pending-verify"
                  >
                    {isVerifyingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : t("dashboard.pendingAccount.verifyButton")}
                  </Button>
                  <Button variant="link"
                    onClick={async () => {
                      setIsResendingCode(true);
                      try {
                        await apiRequest("POST", "/api/auth/resend-verification");
                        setFormMessage({ type: 'success', text: t("llc.messages.codeSent") });
                      } catch {
                        setFormMessage({ type: 'error', text: t("common.error") });
                      } finally {
                        setIsResendingCode(false);
                      }
                    }}
                    disabled={isResendingCode}
                    className="text-accent p-0 h-auto text-xs mt-2 rounded-full"
                    data-testid="button-pending-resend"
                  >
                    {isResendingCode ? t("common.sending") : t("dashboard.pendingAccount.resendCode")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {((user as any).identityVerificationStatus === 'requested' || (user as any).identityVerificationStatus === 'rejected') ? (
                    <div className="space-y-4">
                      <div className={`border rounded-xl p-4 ${(user as any).identityVerificationStatus === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-accent/5 dark:bg-accent/10 border-accent/30 dark:border-accent/30'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className={`w-5 h-5 ${(user as any).identityVerificationStatus === 'rejected' ? 'text-red-600' : 'text-accent'}`} />
                          <span className="font-black text-sm text-foreground">
                            {(user as any).identityVerificationStatus === 'rejected' ? t("dashboard.pendingAccount.idvRejectedTitle") : t("dashboard.pendingAccount.idvRequestedTitle")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {(user as any).identityVerificationStatus === 'rejected' ? t("dashboard.pendingAccount.idvRejectedDesc") : t("dashboard.pendingAccount.idvRequestedDesc")}
                        </p>
                        {(user as any).identityVerificationNotes && (
                          <div className="bg-white dark:bg-card border border-border rounded-lg p-3 mb-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">{t("dashboard.pendingAccount.idvAdminNotes")}</p>
                            <p className="text-sm text-foreground">{(user as any).identityVerificationNotes}</p>
                          </div>
                        )}
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-foreground">{t("dashboard.pendingAccount.idvAcceptedFormats")}</p>
                          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                            <li>{t("dashboard.pendingAccount.idvDoc1")}</li>
                            <li>{t("dashboard.pendingAccount.idvDoc2")}</li>
                            <li>{t("dashboard.pendingAccount.idvDoc3")}</li>
                          </ul>
                          <div className="pt-2">
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" id="idv-upload-input"
                              className="hidden"
                              onChange={(e) => setIdvUploadFile(e.target.files?.[0] || null)}
                              data-testid="input-idv-file"
                            />
                            {idvUploadFile ? (
                              <div className="flex items-center gap-2 bg-white dark:bg-card border border-border rounded-full px-4 py-2 mb-3">
                                <FileText className="w-4 h-4 text-accent shrink-0" />
                                <span className="text-sm text-foreground truncate flex-1">{idvUploadFile.name}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIdvUploadFile(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button variant="outline" className="w-full rounded-full" onClick={() => document.getElementById('idv-upload-input')?.click()} data-testid="button-idv-select-file">
                                <Upload className="w-4 h-4 mr-2" />
                                {t("dashboard.pendingAccount.idvSelectFile")}
                              </Button>
                            )}
                            {idvUploadFile && (
                              <Button disabled={isUploadingIdv}
                                onClick={async () => {
                                  if (!idvUploadFile) return;
                                  if (idvUploadFile.size > 5 * 1024 * 1024) {
                                    setFormMessage({ type: 'error', text: t("dashboard.pendingAccount.idvFileTooLarge") });
                                    return;
                                  }
                                  setIsUploadingIdv(true);
                                  try {
                                    const formData = new FormData();
                                    formData.append('file', idvUploadFile);
                                    const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '';
                                    const res = await fetch('/api/user/identity-verification/upload', {
                                      method: 'POST',
                                      headers: { 'X-CSRF-Token': csrfToken },
                                      body: formData,
                                      credentials: 'include'
                                    });
                                    if (res.ok) {
                                      setFormMessage({ type: 'success', text: t("dashboard.pendingAccount.idvUploadSuccess") });
                                      setIdvUploadFile(null);
                                      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                                    } else {
                                      const data = await res.json().catch(() => ({}));
                                      setFormMessage({ type: 'error', text: data.message || t("common.error") });
                                    }
                                  } catch {
                                    setFormMessage({ type: 'error', text: t("common.error") });
                                  } finally {
                                    setIsUploadingIdv(false);
                                  }
                                }}
                                className="w-full bg-accent text-accent-foreground font-black rounded-full h-11 mt-3"
                                data-testid="button-idv-upload"
                              >
                                {isUploadingIdv ? <Loader2 className="w-5 h-5 animate-spin" /> : t("dashboard.pendingAccount.idvUploadButton")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (user as any).identityVerificationStatus === 'uploaded' ? (
                    <div className="bg-accent/5 dark:bg-accent/10 border border-accent/30 dark:border-accent/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-accent" />
                        <span className="font-black text-sm text-accent dark:text-accent">{t("dashboard.pendingAccount.idvUploadedTitle")}</span>
                      </div>
                      <p className="text-xs text-accent dark:text-accent leading-relaxed">
                        {t("dashboard.pendingAccount.idvUploadedDesc")}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-accent/5 dark:bg-accent/10 border border-accent/30 dark:border-accent/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-accent" />
                        <span className="font-black text-sm text-accent dark:text-accent">{t("dashboard.pendingAccount.adminReviewTitle")}</span>
                      </div>
                      <p className="text-xs text-accent dark:text-accent leading-relaxed">
                        {t("dashboard.pendingAccount.adminReviewMessage")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white dark:bg-card">
            <div className="bg-accent h-1.5 w-full" />
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 pb-4 border-b border-zinc-900/10 dark:border-accent/30">
                <div className="flex items-center gap-3">
                  <BellRing className="w-5 h-5 text-accent" />
                  <h2 className="font-black text-lg text-foreground">{t("dashboard.notifications.title")}</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1 ml-8">{t("dashboard.notifications.subtitle")}</p>
              </div>

              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {notifications.slice(0, 5).map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border ${notif.isRead ? 'bg-muted/50 border-border' : 'bg-accent/5 border-accent/20'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm text-foreground">{tn(notif.title)}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{tn(notif.message)}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDateCompact(notif.createdAt)}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs rounded-full"
                            onClick={() => markNotificationRead.mutate(notif.id)}
                          >
                            {t("dashboard.notifications.read")}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("dashboard.notifications.empty")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <span
            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => apiRequest("POST", "/api/auth/logout").then(() => window.location.href = "/")}
            data-testid="button-pending-logout"
          >
            {t("common.exit")}
          </span>
        </div>
      </main>
    </div>
  );
}
