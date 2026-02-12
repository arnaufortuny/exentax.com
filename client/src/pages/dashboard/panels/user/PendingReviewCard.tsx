import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Mail, Loader2, ShieldCheck, FileText, X, Upload, Shield } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PendingReviewCard({ user }: { user: any }) {
  const { t } = useTranslation();
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [idvUploadFile, setIdvUploadFile] = useState<File | null>(null);
  const [isUploadingIdv, setIsUploadingIdv] = useState(false);

  return (
    <div className="space-y-4">
      {formMsg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${formMsg.type === 'success' ? 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/30 dark:border-accent/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`} data-testid="text-pending-form-message">
          {formMsg.text}
        </div>
      )}
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
                onChange={(e: any) => setEmailVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="rounded-full text-center text-xl font-black border-accent/30 focus:border-accent tracking-[0.4em] h-12 mb-3"
                maxLength={6}
                inputMode="numeric"
                data-testid="input-pending-verification-code"
              />
              <Button onClick={async () => {
                  if (!emailVerificationCode || emailVerificationCode.length < 6) {
                    setFormMsg({ type: 'error', text: t("dashboard.pendingAccount.enter6DigitCode") });
                    return;
                  }
                  setIsVerifyingEmail(true);
                  try {
                    const res = await apiRequest("POST", "/api/auth/verify-email", { code: emailVerificationCode });
                    const result = await res.json();
                    if (result.success) {
                      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
                      setFormMsg({ type: 'success', text: t("dashboard.pendingAccount.emailVerified") });
                      setEmailVerificationCode("");
                    }
                  } catch {
                    setFormMsg({ type: 'error', text: t("application.messages.incorrectCode") });
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
                    setFormMsg({ type: 'success', text: t("application.messages.codeSent") });
                  } catch {
                    setFormMsg({ type: 'error', text: t("common.error") });
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
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" id="idv-upload-input-dashboard"
                          className="hidden"
                          onChange={(e) => setIdvUploadFile(e.target.files?.[0] || null)}
                          data-testid="input-idv-file-dashboard"
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
                          <Button variant="outline" className="w-full rounded-full" onClick={() => document.getElementById('idv-upload-input-dashboard')?.click()} data-testid="button-idv-select-file-dashboard">
                            <Upload className="w-4 h-4 mr-2" />
                            {t("dashboard.pendingAccount.idvSelectFile")}
                          </Button>
                        )}
                        {idvUploadFile && (
                          <Button disabled={isUploadingIdv}
                            onClick={async () => {
                              if (!idvUploadFile) return;
                              if (idvUploadFile.size > 5 * 1024 * 1024) {
                                setFormMsg({ type: 'error', text: t("dashboard.pendingAccount.idvFileTooLarge") });
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
                                  setFormMsg({ type: 'success', text: t("dashboard.pendingAccount.idvUploadSuccess") });
                                  setIdvUploadFile(null);
                                  queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                                } else {
                                  const data = await res.json().catch(() => ({}));
                                  setFormMsg({ type: 'error', text: data.message || t("common.error") });
                                }
                              } catch {
                                setFormMsg({ type: 'error', text: t("common.error") });
                              } finally {
                                setIsUploadingIdv(false);
                              }
                            }}
                            className="w-full bg-accent text-accent-foreground font-black rounded-full h-11 mt-3"
                            data-testid="button-idv-upload-dashboard"
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
    </div>
  );
}

export function translateI18nText(text: string, t: (key: string, params?: Record<string, string>) => string): string {
  if (!text || !text.startsWith('i18n:')) return text;
  const rest = text.substring(5);
  const sepIdx = rest.indexOf('::');
  if (sepIdx > -1) {
    const key = rest.substring(0, sepIdx);
    try {
      const params = JSON.parse(rest.substring(sepIdx + 2));
      const result = t(key, params);
      return typeof result === 'string' && result !== key ? result : text;
    } catch {
      const result = t(key);
      return typeof result === 'string' && result !== key ? result : text;
    }
  }
  const result = t(rest);
  return typeof result === 'string' && result !== rest ? result : text;
}
