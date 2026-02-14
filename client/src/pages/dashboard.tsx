import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, setStoredAuthToken } from "@/lib/queryClient";
import { FileText, Clock, User as UserIcon, Package, CreditCard, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, ShieldCheck, Users, Edit, FileUp, Loader2, Receipt, Plus, Calendar, DollarSign, BarChart3, UserCheck, Upload, Tag, X, Calculator, Search, ClipboardList } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useMemo, useCallback, useRef, lazy, Suspense } from "react";

import { Link, useLocation, useSearch } from "wouter";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { DashboardTour } from "@/components/dashboard-tour";
import { 
  Tab, 
  AdminUserData, 
  DiscountCode, 
  getOrderStatusLabel
} from "@/components/dashboard";
import { ServicesTab } from "@/components/dashboard/services-tab";
const CrmMetricsSection = lazy(() => import("@/components/dashboard/crm-metrics-section").then(m => ({ default: m.CrmMetricsSection })));
import { NotificationsTab } from "@/components/dashboard/notifications-tab";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { ConsultationsTab } from "@/components/dashboard/consultations-tab";
const AdminConsultationsPanel = lazy(() => import("@/components/dashboard/admin-consultations-panel").then(m => ({ default: m.AdminConsultationsPanel })));
const AdminDashboardPanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminDashboardPanel").then(m => ({ default: m.AdminDashboardPanel })));
const AdminOrdersPanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminOrdersPanel").then(m => ({ default: m.AdminOrdersPanel })));
const AdminUsersPanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminUsersPanel").then(m => ({ default: m.AdminUsersPanel })));
const CreateUserForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/CreateUserForm").then(m => ({ default: m.CreateUserForm })));
const CreateOrderForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/CreateOrderForm").then(m => ({ default: m.CreateOrderForm })));
const SendNoteForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/SendNoteForm").then(m => ({ default: m.SendNoteForm })));
const EditUserForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/EditUserForm").then(m => ({ default: m.EditUserForm })));
const DeleteUserConfirm = lazy(() => import("@/pages/dashboard/panels/admin/forms/DeleteUserConfirm").then(m => ({ default: m.DeleteUserConfirm })));
const DeleteOrderConfirm = lazy(() => import("@/pages/dashboard/panels/admin/forms/DeleteOrderConfirm").then(m => ({ default: m.DeleteOrderConfirm })));
const GenerateInvoiceForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/GenerateInvoiceForm").then(m => ({ default: m.GenerateInvoiceForm })));
const RequestDocumentsForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/RequestDocumentsForm").then(m => ({ default: m.RequestDocumentsForm })));
const CreateInvoiceForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/CreateInvoiceForm").then(m => ({ default: m.CreateInvoiceForm })));
const DiscountCodeForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/DiscountCodeForm").then(m => ({ default: m.DiscountCodeForm })));
const AdminCommsPanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminCommsPanel").then(m => ({ default: m.AdminCommsPanel })));
const AdminAccountingPanel = lazy(() => import("@/components/dashboard/admin-accounting-panel").then(m => ({ default: m.AdminAccountingPanel })));
const AdminBillingPanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminBillingPanel").then(m => ({ default: m.AdminBillingPanel })));
import { DocumentsPanel } from "@/pages/dashboard/panels/user/DocumentsPanel";
import { PaymentsPanel } from "@/pages/dashboard/panels/user/PaymentsPanel";
import { CalendarPanel } from "@/pages/dashboard/panels/user/CalendarPanel";
import { ToolsPanel } from "@/pages/dashboard/panels/user/ToolsPanel";
const AdminCalendarPanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminCalendarPanel").then(m => ({ default: m.AdminCalendarPanel })));
const AdminDocsPanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminDocsPanel").then(m => ({ default: m.AdminDocsPanel })));
const AdminIncompletePanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminIncompletePanel").then(m => ({ default: m.AdminIncompletePanel })));
const AdminDiscountsPanel = lazy(() => import("@/pages/dashboard/panels/admin/AdminDiscountsPanel").then(m => ({ default: m.AdminDiscountsPanel })));
const PaymentLinkForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/PaymentLinkForm").then(m => ({ default: m.PaymentLinkForm })));
const AdminDocUploadForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/AdminDocUploadForm").then(m => ({ default: m.AdminDocUploadForm })));
const ResetPasswordForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/ResetPasswordForm").then(m => ({ default: m.ResetPasswordForm })));
const IdvRequestForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/IdvRequestForm").then(m => ({ default: m.IdvRequestForm })));
const IdvRejectForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/IdvRejectForm").then(m => ({ default: m.IdvRejectForm })));
const DocRejectForm = lazy(() => import("@/pages/dashboard/panels/admin/forms/DocRejectForm").then(m => ({ default: m.DocRejectForm })));
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingScreen } from "@/components/loading-screen";
import { PanelErrorBoundary } from "@/components/dashboard/panel-error-boundary";
import { useUserProfileState } from "./dashboard/hooks/useUserProfileState";
import { useAdminState } from "./dashboard/hooks/useAdminState";
import { DashboardSidebar } from "./dashboard/components/DashboardSidebar";


function PendingReviewCard({ user }: { user: any }) {
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

function translateI18nText(text: string, t: (key: string, params?: Record<string, string>) => string): string {
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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { user, isAuthenticated, isLoading: authLoading, error: authError, refetch: refetchAuth } = useAuth();
  const { t, i18n } = useTranslation();
  usePageTitle();
  const urlParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const tabFromUrl = urlParams.get('tab') as Tab | null;
  const subTabFromUrl = urlParams.get('subtab');
  const [activeTab, setActiveTabRaw] = useState<Tab>(tabFromUrl || (user?.isAdmin ? 'admin' : 'services'));
  const initialTabApplied = useRef(false);

  const syncTabToUrl = useCallback((tab: Tab, subtab?: string) => {
    const p = new URLSearchParams();
    p.set('tab', tab);
    if (tab === 'admin' && subtab) p.set('subtab', subtab);
    window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
  }, []);

  const setActiveTab = useCallback((tab: Tab) => {
    setActiveTabRaw(tab);
    syncTabToUrl(tab, tab === 'admin' ? (subTabFromUrl || 'dashboard') : undefined);
  }, [syncTabToUrl, subTabFromUrl]);

  useEffect(() => {
    if (tabFromUrl && !initialTabApplied.current) {
      setActiveTabRaw(tabFromUrl);
      initialTabApplied.current = true;
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (initialTabApplied.current && subTabFromUrl && activeTab === 'admin') {
      setAdminSubTabRaw(subTabFromUrl);
    }
  }, [subTabFromUrl, activeTab]);

  useEffect(() => {
    if (user?.accountStatus === 'pending' && !['services', 'notifications', 'profile'].includes(activeTab)) {
      setActiveTab('services');
    }
  }, [user?.accountStatus, activeTab, setActiveTab]);
  const [showTrustpilotCard, setShowTrustpilotCard] = useState(() => {
    return localStorage.getItem('trustpilot_review_dismissed') !== 'true';
  });
  const { confirm: showConfirm, dialogProps: confirmDialogProps } = useConfirmDialog();

  const tn = useCallback((text: string) => {
    if (!text || !text.startsWith('i18n:')) return text;
    const rest = text.substring(5);
    const sepIdx = rest.indexOf('::');
    if (sepIdx > -1) {
      const key = rest.substring(0, sepIdx);
      try {
        const params = JSON.parse(rest.substring(sepIdx + 2));
        const resolvedParams: Record<string, string> = {};
        for (const [k, v] of Object.entries(params)) {
          if (typeof v === 'string' && v.startsWith('@')) {
            const nestedKey = v.substring(1);
            const translated = t(nestedKey);
            resolvedParams[k] = typeof translated === 'string' && translated !== nestedKey ? translated : v.substring(1);
          } else {
            resolvedParams[k] = String(v);
          }
        }
        const result = t(key, resolvedParams);
        return typeof result === 'string' && result !== key ? result : text;
      } catch {
        const result = t(key);
        return typeof result === 'string' && result !== key ? result : text;
      }
    }
    const result = t(rest);
    return typeof result === 'string' && result !== rest ? result : text;
  }, [t]);

  useEffect(() => {
    if (user?.isAdmin && activeTab !== 'admin') {
      setActiveTab('admin' as Tab);
      setAdminSubTab('dashboard');
    }
  }, [user?.isAdmin]);
  
  const isPendingAccount = user?.accountStatus === 'pending';
  const canEdit = user?.accountStatus === 'active' || user?.accountStatus === 'vip';

  const {
    isEditing, setIsEditing,
    profileData, setProfileData,
    formMessage, setFormMessage,
    deleteOwnAccountDialog, setDeleteOwnAccountDialog,
    uploadDialog, setUploadDialog,
    uploadDocType, setUploadDocType,
    uploadNotes, setUploadNotes,
    showPasswordForm, setShowPasswordForm,
    passwordStep, setPasswordStep,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    passwordOtp, setPasswordOtp,
    profileOtpStep, setProfileOtpStep,
    profileOtp, setProfileOtp,
    pendingProfileData, setPendingProfileData,
    showEmailVerification, setShowEmailVerification,
    emailVerificationCode, setEmailVerificationCode,
    isVerifyingEmail, setIsVerifyingEmail,
    isResendingCode, setIsResendingCode,
    updateProfile,
    confirmProfileWithOtp,
    cancelPendingChanges,
    resendProfileOtp,
    deleteOwnAccountMutation,
    requestPasswordOtpMutation,
    changePasswordMutation,
  } = useUserProfileState(user, t, canEdit);

  const [isTabFocused, setIsTabFocused] = useState(() => typeof document !== 'undefined' ? document.hasFocus() : true);
  useEffect(() => {
    const onFocus = () => setIsTabFocused(true);
    const onBlur = () => setIsTabFocused(false);
    const onVisChange = () => setIsTabFocused(!document.hidden);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);
    
  const adminState = useAdminState({
    user, t, setFormMessage, isAuthenticated, isTabFocused, activeTab, syncTabToUrl, subTabFromUrl,
  });
  const {
    editingUser, setEditingUser,
    paymentDialog, setPaymentDialog,
    paymentLink, setPaymentLink,
    paymentAmount, setPaymentAmount,
    paymentMessage, setPaymentMessage,
    docDialog, setDocDialog,
    docType, setDocType,
    docMessage, setDocMessage,
    docRejectDialog, setDocRejectDialog,
    docRejectReason, setDocRejectReason,
    noteDialog, setNoteDialog,
    noteTitle, setNoteTitle,
    noteMessage, setNoteMessage,
    noteType, setNoteType,
    invoiceDialog, setInvoiceDialog,
    invoiceConcept, setInvoiceConcept,
    invoiceAmount, setInvoiceAmount,
    invoiceCurrency, setInvoiceCurrency,
    invoiceDate, setInvoiceDate,
    invoicePaymentAccountIds, setInvoicePaymentAccountIds,
    adminSubTab, setAdminSubTabRaw, setAdminSubTab,
    commSubTab, setCommSubTab,
    usersSubTab, setUsersSubTab,
    billingSubTab, setBillingSubTab,
    adminSearchQuery, setAdminSearchQuery,
    adminSearchFilter, setAdminSearchFilter,
    ordersPage, setOrdersPage,
    usersPage, setUsersPage,
    messagesPage, setMessagesPage,
    adminPageSize,
    createUserDialog, setCreateUserDialog,
    newUserData, setNewUserData,
    createOrderDialog, setCreateOrderDialog,
    newOrderData, setNewOrderData,
    deleteConfirm, setDeleteConfirm,
    discountCodeDialog, setDiscountCodeDialog,
    paymentLinkDialog, setPaymentLinkDialog,
    paymentLinkUrl, setPaymentLinkUrl,
    paymentLinkAmount, setPaymentLinkAmount,
    paymentLinkMessage, setPaymentLinkMessage,
    isSendingPaymentLink, setIsSendingPaymentLink,
    isGeneratingInvoice, setIsGeneratingInvoice,
    adminDocUploadDialog, setAdminDocUploadDialog,
    adminDocType, setAdminDocType,
    adminDocFile, setAdminDocFile,
    isUploadingAdminDoc, setIsUploadingAdminDoc,
    resetPasswordDialog, setResetPasswordDialog,
    newAdminPassword, setNewAdminPassword,
    isResettingPassword, setIsResettingPassword,
    idvRequestDialog, setIdvRequestDialog,
    idvRequestNotes, setIdvRequestNotes,
    isSendingIdvRequest, setIsSendingIdvRequest,
    idvRejectDialog, setIdvRejectDialog,
    idvRejectReason, setIdvRejectReason,
    isSendingIdvReject, setIsSendingIdvReject,
    isApprovingIdv, setIsApprovingIdv,
    idvUploadFile, setIdvUploadFile,
    isUploadingIdv, setIsUploadingIdv,
    newDiscountCode, setNewDiscountCode,
    broadcastSubject, setBroadcastSubject,
    broadcastMessage, setBroadcastMessage,
    deleteOrderConfirm, setDeleteOrderConfirm,
    generateInvoiceDialog, setGenerateInvoiceDialog,
    orderInvoiceAmount, setOrderInvoiceAmount,
    orderInvoiceCurrency, setOrderInvoiceCurrency,
    isAdminTab, isStaffUser,
    adminOrders, ordersPagination,
    incompleteApps,
    adminUsers, usersPagination,
    adminNewsletterSubs, refetchNewsletterSubs,
    adminDocuments,
    adminInvoices,
    adminStats,
    adminMessages, messagesPagination,
    discountCodes, refetchDiscountCodes,
    guestVisitors, refetchGuests,
    paymentAccountsList, refetchPaymentAccounts,
    deleteIncompleteAppMutation,
    broadcastMutation,
    uploadDocMutation,
    updateStatusMutation,
    updateLlcDatesMutation,
    sendNoteMutation,
    updateUserMutation,
    deleteUserMutation,
    deleteOrderMutation,
    createInvoiceMutation,
    createUserMutation,
    createOrderMutation,
    deleteDocMutation,
    matchesFilter,
    filteredAdminOrders,
    filteredAdminUsers,
    filteredAdminMessages,
    filteredAdminDocuments,
  } = adminState;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: orders, isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const { data: clientInvoices } = useQuery<any[]>({
    queryKey: ["/api/user/invoices"],
    enabled: isAuthenticated && !user?.isAdmin,
    refetchInterval: isTabFocused && activeTab === 'payments' ? 30000 : false,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");

  const selectedOrderId = orders?.[0]?.id;
  const { data: selectedOrderEvents } = useQuery<any[]>({
    queryKey: ["/api/orders", selectedOrderId, "events"],
    enabled: !!selectedOrderId,
    staleTime: 1000 * 60 * 2,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async (messageId: number) => {
      setFormMessage(null);
      const res = await apiRequest("POST", `/api/messages/${messageId}/reply`, { content: replyContent });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t("dashboard.toasts.couldNotSend"));
      }
      return res.json();
    },
    onSuccess: () => {
      setReplyContent("");
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      const isStaffUser = user?.isAdmin || user?.isSupport;
      setFormMessage({ type: 'success', text: (isStaffUser ? t("dashboard.toasts.messageReplied") : t("dashboard.toasts.messageSent")) + ". " + (isStaffUser ? t("dashboard.toasts.messageRepliedDesc") : t("dashboard.toasts.messageSentDesc")) });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotSend")) });
    }
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/notifications"],
    enabled: isAuthenticated,
    refetchInterval: isTabFocused && activeTab === 'notifications' ? 30000 : false,
  });

  const markNotificationRead = useMutation({
    mutationFn: async (id: string) => {
      setFormMessage(null);
      const res = await apiRequest("PATCH", `/api/user/notifications/${id}/read`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotMarkNotification"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
    },
    onError: () => {}
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      setFormMessage(null);
      const res = await apiRequest("DELETE", `/api/user/notifications/${id}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotDelete") });
    }
  });

  const { data: userDocuments } = useQuery<any[]>({
    queryKey: ["/api/user/documents"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const isAdmin = user?.isAdmin;
  const isSupport = user?.isSupport;
  const isStaff = isAdmin || isSupport;

  const draftOrders = useMemo(() => 
    orders?.filter(o => o.status === 'draft' || o.application?.status === 'draft' || o.maintenanceApplication?.status === 'draft') || [],
    [orders]
  );
  
  const activeOrders = useMemo(() => 
    orders?.filter(o => o.status !== 'cancelled' && o.status !== 'completed').slice(0, 4) || [],
    [orders]
  );

  const userMenuItems = useMemo(() => [
    { id: 'services', label: t('dashboard.tabs.services'), icon: Package, mobileLabel: t('dashboard.tabs.servicesMobile'), tour: 'orders' },
    { id: 'consultations', label: t('dashboard.tabs.consultations'), icon: MessageSquare, mobileLabel: t('dashboard.tabs.consultationsMobile') },
    { id: 'notifications', label: t('dashboard.tabs.notifications'), icon: BellRing, mobileLabel: t('dashboard.tabs.notificationsMobile') },
    { id: 'messages', label: t('dashboard.tabs.messages'), icon: Mail, mobileLabel: t('dashboard.tabs.messagesMobile'), tour: 'messages' },
    { id: 'documents', label: t('dashboard.tabs.documents'), icon: FileText, mobileLabel: t('dashboard.tabs.documentsMobile') },
    { id: 'payments', label: t('dashboard.tabs.payments'), icon: CreditCard, mobileLabel: t('dashboard.tabs.paymentsMobile') },
    { id: 'calendar', label: t('dashboard.tabs.calendar'), icon: Calendar, mobileLabel: t('dashboard.tabs.calendarMobile'), tour: 'calendar' },
    { id: 'tools', label: t('dashboard.tabs.tools'), icon: Calculator, mobileLabel: t('dashboard.tabs.toolsMobile') },
    { id: 'profile', label: t('dashboard.tabs.profile'), icon: UserIcon, mobileLabel: t('dashboard.tabs.profileMobile'), tour: 'profile' },
  ], [t]);

  const adminMenuItems = useMemo(() => {
    const allItems = [
      { id: 'admin-dashboard', subTab: 'dashboard', label: t('dashboard.admin.tabs.metrics'), icon: BarChart3, mobileLabel: t('dashboard.admin.tabs.metrics'), adminOnly: true },
      { id: 'admin-orders', subTab: 'orders', label: t('dashboard.admin.tabs.orders'), icon: Package, mobileLabel: t('dashboard.admin.tabs.orders'), adminOnly: false },
      { id: 'admin-comms', subTab: 'communications', label: t('dashboard.admin.tabs.communications'), icon: MessageSquare, mobileLabel: t('dashboard.admin.tabs.communications'), adminOnly: false },
      { id: 'admin-incomplete', subTab: 'incomplete', label: t('dashboard.admin.tabs.incomplete'), icon: AlertCircle, mobileLabel: t('dashboard.admin.tabs.incomplete'), adminOnly: true },
      { id: 'admin-users', subTab: 'users', label: t('dashboard.admin.tabs.clients'), icon: Users, mobileLabel: t('dashboard.admin.tabs.clients'), adminOnly: true },
      { id: 'admin-billing', subTab: 'billing', label: t('dashboard.admin.tabs.billing'), icon: Receipt, mobileLabel: t('dashboard.admin.tabs.billing'), adminOnly: true },
      { id: 'admin-calendar', subTab: 'calendar', label: t('dashboard.calendar.dates'), icon: Calendar, mobileLabel: t('dashboard.calendar.dates'), adminOnly: false },
      { id: 'admin-docs', subTab: 'docs', label: t('dashboard.admin.tabs.docs'), icon: FileText, mobileLabel: t('dashboard.admin.tabs.docs'), adminOnly: false },
      { id: 'admin-discounts', subTab: 'descuentos', label: t('dashboard.admin.tabs.discounts'), icon: Tag, mobileLabel: t('dashboard.admin.tabs.discounts'), adminOnly: true },
    ];
    return allItems.filter(item => isAdmin || !item.adminOnly);
  }, [t, isAdmin]);

  const pendingAllowedTabs = ['services', 'notifications', 'profile'];
  const menuItems = isAdmin ? adminMenuItems : (isPendingAccount ? userMenuItems.filter(item => pendingAllowedTabs.includes(item.id)) : userMenuItems);
  const sidebarMainItems = useMemo(() => {
    if (isAdmin) return adminMenuItems;
    const items = userMenuItems.filter(item => item.id !== 'profile');
    if (isPendingAccount) return items.filter(item => pendingAllowedTabs.includes(item.id));
    return items;
  }, [isAdmin, adminMenuItems, userMenuItems, isPendingAccount]);
  
  const handleLogout = useCallback(() => {
    setStoredAuthToken(null);
    apiRequest("POST", "/api/auth/logout").then(() => window.location.href = "/");
  }, []);


  if (authLoading) {
    return <LoadingScreen />;
  }

  if (authError && !user) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground" data-testid="text-dashboard-error">
                {t("dashboard.errors.connectionError")}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {t("errors.network", "Could not load your session.")}
              </p>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <Button
                onClick={() => refetchAuth()}
                className="w-full sm:w-auto px-8 font-bold rounded-full"
                data-testid="button-retry-dashboard"
              >
                {t("common.retry", "Retry")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation("/auth/login")}
                className="w-full sm:w-auto px-8 font-bold rounded-full"
                data-testid="button-back-login"
              >
                {t("auth.login.title", "Log in")}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-dvh bg-background font-sans animate-page-in flex flex-col overflow-hidden max-w-[100vw]">
      <Navbar />
      {!isAdmin && <DashboardTour />}

      <div className="flex flex-1 relative min-h-0">
      <DashboardSidebar
        isAdmin={isAdmin}
        isSupport={isSupport}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminSubTab={adminSubTab}
        setAdminSubTab={setAdminSubTab}
        sidebarMainItems={sidebarMainItems}
        adminMenuItems={adminMenuItems}
        userMenuItems={userMenuItems}
        user={user}
        handleLogout={handleLogout}
      />

        {/* Main content wrapper - vertical flex for mobile tabs + scroll area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Mobile Navigation - Fixed above scroll area, never hides on scroll */}
        <div className="flex flex-col lg:hidden bg-background pt-3 pb-2 shrink-0 z-[60]">
          <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar mobile-tab-bar pl-4 pr-4 sm:pl-5 sm:pr-5">
            {isAdmin ? (
              adminMenuItems.map((item: any) => {
                const isActive = activeTab === 'admin' && adminSubTab === item.subTab;
                return (
                  <Button key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => { setActiveTab('admin' as Tab); setAdminSubTab(item.subTab); }}
                    className={`flex items-center gap-1.5 rounded-full font-bold text-xs tracking-normal whitespace-nowrap shrink-0 min-h-9 px-4 transition-colors ${
                      isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-muted/60 text-muted-foreground'
                    }`}
                    data-testid={`button-tab-${item.id}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })
            ) : (
              <>
                {userMenuItems.map((item) => (
                  <Button key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`flex items-center gap-1.5 rounded-full font-bold text-xs tracking-normal whitespace-nowrap shrink-0 min-h-9 px-4 transition-colors ${
                      activeTab === item.id 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-muted/60 text-muted-foreground'
                    }`}
                    data-testid={`button-tab-${item.id}`}
                    {...('tour' in item && item.tour ? { 'data-tour': item.tour } : {})}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </>
            )}
          </div>
          {isSupport && !isAdmin && (
            <div className="flex -mx-4 px-4">
              <Button variant={activeTab === 'admin' ? "default" : "ghost"}
                onClick={() => setActiveTab('admin' as Tab)}
                size="sm"
                className={`flex items-center gap-1.5 rounded-full font-black text-[11px] sm:text-xs tracking-normal whitespace-nowrap shrink-0 h-10 px-4 transition-colors ${
                  activeTab === 'admin' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-accent/10 dark:bg-accent/20 text-accent'
                }`}
                data-testid="button-tab-admin-mobile"
              >
                <Shield className="w-4 h-4" />
                <span>{t('dashboard.menu.support')}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      <main className={`pt-6 sm:pt-10 pb-20 !min-h-0 ${isAdmin ? 'px-3 md:px-4 lg:px-4 xl:px-5' : 'px-5 md:px-8 max-w-7xl mx-auto lg:mx-0 lg:max-w-none lg:px-10'}`}>

        <header className="mb-2 md:mb-4 animate-fade-in-up">
          {!user?.emailVerified && (
            <Card className="mt-4 p-4 rounded-2xl border-2 border-accent/30 bg-accent/5 dark:bg-accent/10 dark:border-accent/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/15 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-accent dark:text-accent">{t('dashboard.emailVerification.title')}</p>
                  <p className="text-xs text-accent dark:text-accent">{t('dashboard.emailVerification.description')}</p>
                </div>
                <Button size="sm"
                  onClick={() => setShowEmailVerification(true)}
                  className="shrink-0 bg-accent text-white font-black rounded-full px-4"
                  data-testid="button-verify-email-header"
                >
                  {t('dashboard.emailVerification.button')}
                </Button>
              </div>
            </Card>
          )}
        </header>

        {/* Main Content Area */}
        <div className="transition-opacity duration-100 ease-out">
            {formMessage && (
              <div className={`mb-4 p-3 rounded-xl text-center text-sm font-medium ${
                formMessage.type === 'error' 
                  ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
                  : formMessage.type === 'success'
                  ? 'bg-accent/10 border border-accent/20 text-accent'
                  : 'bg-accent/5 dark:bg-accent/10 border border-accent/20 dark:border-accent/30 text-accent dark:text-accent'
              }`} data-testid="form-message">
                {formMessage.text}
              </div>
            )}
            <div className={`flex flex-col ${isAdmin ? '' : 'xl:grid xl:grid-cols-3'} gap-6 lg:gap-8`}>
              <div className={`${isAdmin ? '' : 'xl:col-span-2'} space-y-6 ${isAdmin ? '' : 'order-1 xl:order-1'}`}>
            
              {activeTab === 'services' && (
                <>
                {isPendingAccount ? (
                  <PendingReviewCard user={user} />
                ) : (
                <PanelErrorBoundary panelName="services">
                  <ServicesTab 
                    orders={orders} 
                    draftOrders={draftOrders} 
                    activeOrders={activeOrders}
                    userName={user?.firstName || ''}
                  />
                </PanelErrorBoundary>
                )}
                {showTrustpilotCard && !isPendingAccount && (
                  <Card className="rounded-2xl border border-accent/20 shadow-sm p-5 pr-10 bg-white dark:bg-card mt-4 relative" data-testid="card-trustpilot-review">
                    <button 
                      onClick={() => {
                        setShowTrustpilotCard(false);
                        localStorage.setItem('trustpilot_review_dismissed', 'true');
                      }}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-dismiss-trustpilot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-1 text-center sm:text-left">
                        <p className="font-black text-foreground text-sm tracking-tight">{t('dashboard.trustpilot.title')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.trustpilot.subtitle')}</p>
                      </div>
                      <a href="https://es.trustpilot.com/review/exentax.com" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-accent text-accent-foreground font-black rounded-full whitespace-nowrap" size="sm" data-testid="button-trustpilot-review">
                          {t('dashboard.trustpilot.button')}
                        </Button>
                      </a>
                    </div>
                  </Card>
                )}
                </>
              )}

              {activeTab === 'notifications' && (
                <PanelErrorBoundary panelName="notifications">
                  <NotificationsTab
                    notifications={notifications}
                    notificationsLoading={notificationsLoading}
                    user={user}
                    markNotificationRead={markNotificationRead}
                    deleteNotification={deleteNotification}
                    setActiveTab={setActiveTab}
                  />
                </PanelErrorBoundary>
              )}

              {activeTab === 'consultations' && !isPendingAccount && (
                <PanelErrorBoundary panelName="consultations">
                  <ConsultationsTab setActiveTab={setActiveTab} />
                </PanelErrorBoundary>
              )}

              {activeTab === 'messages' && !isPendingAccount && (
                <PanelErrorBoundary panelName="messages">
                  <MessagesTab
                    messagesData={messagesData}
                    selectedMessage={selectedMessage}
                    setSelectedMessage={setSelectedMessage}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    sendReplyMutation={sendReplyMutation}
                    user={user}
                    setFormMessage={setFormMessage}
                  />
                </PanelErrorBoundary>
              )}

              {activeTab === 'documents' && !isPendingAccount && (
                <PanelErrorBoundary panelName="documents">
                  <DocumentsPanel
                    user={user}
                    notifications={notifications || []}
                    userDocuments={userDocuments || []}
                    canEdit={canEdit}
                    setFormMessage={setFormMessage}
                    tn={tn}
                    formatDate={formatDate}
                  />
                </PanelErrorBoundary>
              )}


              {activeTab === 'payments' && !isPendingAccount && (
                <PanelErrorBoundary panelName="payments">
                  <PaymentsPanel orders={orders} clientInvoices={clientInvoices} />
                </PanelErrorBoundary>
              )}

              {activeTab === 'calendar' && !isPendingAccount && (
                <PanelErrorBoundary panelName="calendar">
                  <CalendarPanel orders={orders || []} />
                </PanelErrorBoundary>
              )}

              {activeTab === 'tools' && !isPendingAccount && (
                <PanelErrorBoundary panelName="tools">
                  <ToolsPanel />
                </PanelErrorBoundary>
              )}

              {activeTab === 'profile' && (
                <>
                <PanelErrorBoundary panelName="profile">
                  <ProfileTab
                    user={user ?? null}
                    canEdit={canEdit}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    profileData={profileData}
                    setProfileData={setProfileData}
                    updateProfile={updateProfile}
                    showPasswordForm={showPasswordForm}
                    setShowPasswordForm={setShowPasswordForm}
                    passwordStep={passwordStep}
                    setPasswordStep={setPasswordStep}
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    passwordOtp={passwordOtp}
                    setPasswordOtp={setPasswordOtp}
                    requestPasswordOtpMutation={requestPasswordOtpMutation}
                    changePasswordMutation={changePasswordMutation}
                    setShowEmailVerification={setShowEmailVerification}
                    setDeleteOwnAccountDialog={setDeleteOwnAccountDialog}
                    profileOtpStep={profileOtpStep}
                    setProfileOtpStep={setProfileOtpStep}
                    profileOtp={profileOtp}
                    setProfileOtp={setProfileOtp}
                    confirmProfileWithOtp={confirmProfileWithOtp}
                    cancelPendingChanges={cancelPendingChanges}
                    resendProfileOtp={resendProfileOtp}
                  />
                </PanelErrorBoundary>
                
                {/* Inline Email Verification Panel */}
                {showEmailVerification && (
                  <Card className="mt-6 rounded-2xl border-accent/30 shadow-lg animate-in slide-in-from-top-2 duration-300">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground">{t('dashboard.profile.verifyEmail')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.profile.verifyEmailDesc')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setShowEmailVerification(false); setEmailVerificationCode(""); }} className="rounded-full" data-testid="button-close-email-verification">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.profile.verificationCode')}</Label>
                          <Input value={emailVerificationCode}
                            onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, ""))}
                            className="rounded-xl text-center text-2xl font-black border-border bg-background dark:bg-card h-14 tracking-[0.5em]"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            data-testid="input-email-verification-code"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button onClick={async () => {
                              if (!emailVerificationCode || emailVerificationCode.length < 6) {
                                setFormMessage({ type: 'error', text: t("dashboard.toasts.enter6DigitCode") });
                                return;
                              }
                              setIsVerifyingEmail(true);
                              try {
                                const res = await apiRequest("POST", "/api/auth/verify-email", { code: emailVerificationCode });
                                const result = await res.json();
                                if (result.success) {
                                  await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
                                  setFormMessage({ type: 'success', text: t("dashboard.toasts.emailVerified") });
                                  setShowEmailVerification(false);
                                  setEmailVerificationCode("");
                                }
                              } catch (err: any) {
                                setFormMessage({ type: 'error', text: t("dashboard.toasts.incorrectCode") + ". " + (err.message || t("dashboard.toasts.incorrectCodeDesc")) });
                              } finally {
                                setIsVerifyingEmail(false);
                              }
                            }}
                            disabled={isVerifyingEmail || emailVerificationCode.length < 6}
                            className="flex-1 bg-accent text-accent-foreground font-black rounded-full"
                            data-testid="button-verify-email-code"
                          >
                            {isVerifyingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.profile.verifyEmail')}
                          </Button>
                          <Button variant="outline"
                            onClick={async () => {
                              setIsResendingCode(true);
                              try {
                                await apiRequest("POST", "/api/auth/resend-verification");
                                setFormMessage({ type: 'success', text: t("dashboard.toasts.codeSent") + ". " + t("dashboard.toasts.codeSentDesc") });
                              } catch {
                                setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotSend") });
                              } finally {
                                setIsResendingCode(false);
                              }
                            }}
                            disabled={isResendingCode}
                            className="rounded-full"
                            data-testid="button-resend-verification-code"
                          >
                            {isResendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.profile.resendCode')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Inline Delete Own Account Panel */}
                {deleteOwnAccountDialog && (
                  <Card className="mt-6 rounded-2xl border-red-500/30 shadow-lg animate-in slide-in-from-top-2 duration-300">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-red-600">{t('dashboard.profile.deleteAccount')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.profile.deleteAccountWarning')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteOwnAccountDialog(false)} className="rounded-full" data-testid="button-close-delete-account">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
                        <p className="text-sm text-red-600 dark:text-red-400">{t('dashboard.profile.deleteAccountConfirm')}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="destructive" 
                          onClick={() => deleteOwnAccountMutation.mutate()} 
                          disabled={deleteOwnAccountMutation.isPending} 
                          className="flex-1 rounded-full font-black" 
                          data-testid="button-confirm-delete-account"
                        >
                          {deleteOwnAccountMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.profile.deleteAccount')}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteOwnAccountDialog(false)} className="rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                </>
              )}

              {activeTab === 'admin' && isStaff && (
                <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>}>
                <div key="admin" className="space-y-4">
                  {!isAdmin && (
                  <div className="flex overflow-x-auto pb-3 gap-2 mb-2 md:mb-3 no-scrollbar -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {[
                      { id: 'orders', label: t('dashboard.admin.tabs.orders'), icon: Package, adminOnly: false },
                      { id: 'communications', label: t('dashboard.admin.tabs.communications'), icon: MessageSquare, adminOnly: false },
                      { id: 'calendar', label: t('dashboard.calendar.dates'), icon: Calendar, adminOnly: false },
                      { id: 'docs', label: t('dashboard.admin.tabs.docs'), icon: FileText, adminOnly: false },
                    ].map((item) => (
                      <Button key={item.id}
                        variant={adminSubTab === item.id ? "default" : "outline"}
                        onClick={() => setAdminSubTab(item.id)}
                        size="sm"
                        className={`flex items-center justify-center gap-1.5 rounded-full font-black text-[10px] sm:text-xs h-9 px-3 shrink-0 whitespace-nowrap ${
                          adminSubTab === item.id 
                          ? 'bg-accent text-accent-foreground shadow-md border-accent' 
                          : 'bg-card text-muted-foreground border border-border/60'
                        }`}
                        data-testid={`button-admin-tab-${item.id}`}
                      >
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </Button>
                    ))}
                  </div>
                  )}
                  <div className="space-y-3 mb-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                      <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input placeholder={t('dashboard.admin.searchPlaceholder')}
                          value={adminSearchQuery}
                          onChange={(e) => { setAdminSearchQuery(e.target.value); setOrdersPage(1); setUsersPage(1); setMessagesPage(1); }}
                          className="pl-10 pr-12 h-11 rounded-full text-sm bg-white dark:bg-card border-border w-full"
                          data-testid="input-admin-search"
                        />
                        {adminSearchQuery && (
                          <button
                            onClick={() => setAdminSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            data-testid="button-clear-search"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 flex-1 sm:flex-none sm:w-32">
                          <NativeSelect
                            value={adminSearchFilter}
                            onValueChange={(val) => setAdminSearchFilter(val as typeof adminSearchFilter)}
                            className="rounded-full h-11 text-sm border-border bg-white dark:bg-card"
                            data-testid="select-admin-search-filter"
                          >
                            <option value="all">{t('dashboard.admin.searchFilters.all')}</option>
                            <option value="name">{t('dashboard.admin.searchFilters.name')}</option>
                            <option value="email">{t('dashboard.admin.searchFilters.email')}</option>
                            <option value="date">{t('dashboard.admin.searchFilters.date')}</option>
                            <option value="invoiceId">{t('dashboard.admin.searchFilters.invoiceId')}</option>
                          </NativeSelect>
                        </div>
                        <Button
                          className="h-11 rounded-full bg-accent text-primary font-black shrink-0 px-5"
                          data-testid="button-admin-search"
                        >
                          <Search className="w-4 h-4 mr-1" />
                          {t('dashboard.admin.search')}
                        </Button>
                      </div>
                    </div>
                    {isAdmin && (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" className={`rounded-full text-xs font-black shadow-sm border ${createUserDialog ? 'bg-accent text-accent-foreground border-accent' : 'bg-white dark:bg-card border-accent/50'}`} onClick={() => setCreateUserDialog(!createUserDialog)} data-testid="button-create-user">
                        <Plus className="w-3 h-3 mr-1" />
                        {t('dashboard.admin.newClient')}
                      </Button>
                      <Button variant="ghost" size="sm" className={`rounded-full text-xs font-black shadow-sm border ${createOrderDialog ? 'bg-accent text-accent-foreground border-accent' : 'bg-white dark:bg-card border-accent/50'}`} onClick={() => setCreateOrderDialog(!createOrderDialog)} data-testid="button-create-order">
                        <Plus className="w-3 h-3 mr-1" />
                        {t('dashboard.admin.newOrder')}
                      </Button>
                    </div>
                    )}
                  </div>

                  {/* Inline Admin Panels - Replace Sheets */}
                  {createUserDialog && (
                    <CreateUserForm
                      newUserData={newUserData}
                      setNewUserData={setNewUserData}
                      createUserMutation={createUserMutation}
                      onClose={() => setCreateUserDialog(false)}
                    />
                  )}

                  {createOrderDialog && (
                    <CreateOrderForm
                      newOrderData={newOrderData}
                      setNewOrderData={setNewOrderData}
                      adminUsers={adminUsers || []}
                      createOrderMutation={createOrderMutation}
                      onClose={() => setCreateOrderDialog(false)}
                    />
                  )}

                  {/* Inline Panel: Send Note to Client */}
                  {noteDialog.open && noteDialog.user && (
                    <SendNoteForm
                      noteDialog={noteDialog}
                      noteTitle={noteTitle}
                      setNoteTitle={setNoteTitle}
                      noteMessage={noteMessage}
                      setNoteMessage={setNoteMessage}
                      noteType={noteType}
                      sendNoteMutation={sendNoteMutation}
                      onClose={() => setNoteDialog({ open: false, user: null })}
                    />
                  )}

                  {/* Inline Panel: Edit User */}
                  {editingUser && (
                    <EditUserForm
                      editingUser={editingUser}
                      setEditingUser={setEditingUser}
                      updateUserMutation={updateUserMutation}
                      currentUserEmail={user?.email ?? undefined}
                      onClose={() => setEditingUser(null)}
                    />
                  )}

                  {/* Inline Panel: Delete User Confirmation */}
                  {deleteConfirm.open && deleteConfirm.user && (
                    <DeleteUserConfirm
                      deleteConfirm={deleteConfirm}
                      deleteUserMutation={deleteUserMutation}
                      onClose={() => setDeleteConfirm({ open: false, user: null })}
                    />
                  )}

                  {/* Inline Panel: Delete Order Confirmation */}
                  {deleteOrderConfirm.open && deleteOrderConfirm.order && (
                    <DeleteOrderConfirm
                      deleteOrderConfirm={deleteOrderConfirm}
                      deleteOrderMutation={deleteOrderMutation}
                      onClose={() => setDeleteOrderConfirm({ open: false, order: null })}
                    />
                  )}

                  {/* Inline Panel: Generate Invoice */}
                  {generateInvoiceDialog.open && generateInvoiceDialog.order && (
                    <GenerateInvoiceForm
                      generateInvoiceDialog={generateInvoiceDialog}
                      orderInvoiceAmount={orderInvoiceAmount}
                      setOrderInvoiceAmount={setOrderInvoiceAmount}
                      orderInvoiceCurrency={orderInvoiceCurrency}
                      setOrderInvoiceCurrency={setOrderInvoiceCurrency}
                      isGeneratingInvoice={isGeneratingInvoice}
                      setIsGeneratingInvoice={setIsGeneratingInvoice}
                      setFormMessage={setFormMessage}
                      onClose={() => setGenerateInvoiceDialog({ open: false, order: null })}
                    />
                  )}

                  {/* Inline Panel: Request Documents */}
                  {docDialog.open && docDialog.user && (
                    <RequestDocumentsForm
                      docDialog={docDialog}
                      docType={docType}
                      setDocType={setDocType}
                      docMessage={docMessage}
                      setDocMessage={setDocMessage}
                      sendNoteMutation={sendNoteMutation}
                      onClose={() => setDocDialog({ open: false, user: null })}
                    />
                  )}

                  {/* Inline Panel: Create Invoice */}
                  {invoiceDialog.open && invoiceDialog.user && (
                    <CreateInvoiceForm
                      invoiceDialog={invoiceDialog}
                      invoiceConcept={invoiceConcept}
                      setInvoiceConcept={setInvoiceConcept}
                      invoiceAmount={invoiceAmount}
                      setInvoiceAmount={setInvoiceAmount}
                      invoiceCurrency={invoiceCurrency}
                      setInvoiceCurrency={setInvoiceCurrency}
                      invoiceDate={invoiceDate}
                      setInvoiceDate={setInvoiceDate}
                      invoicePaymentAccountIds={invoicePaymentAccountIds}
                      setInvoicePaymentAccountIds={setInvoicePaymentAccountIds}
                      paymentAccountsList={paymentAccountsList || []}
                      createInvoiceMutation={createInvoiceMutation}
                      onClose={() => setInvoiceDialog({ open: false, user: null })}
                    />
                  )}

                  {/* Inline Panel: Discount Code */}
                  {discountCodeDialog.open && (
                    <DiscountCodeForm
                      discountCodeDialog={discountCodeDialog}
                      newDiscountCode={newDiscountCode}
                      setNewDiscountCode={setNewDiscountCode}
                      refetchDiscountCodes={refetchDiscountCodes}
                      setFormMessage={setFormMessage}
                      onClose={() => setDiscountCodeDialog({ open: false, code: null })}
                    />
                  )}

                  {/* Inline Panel: Payment Link */}
                  {paymentLinkDialog.open && paymentLinkDialog.user && (
                    <PaymentLinkForm
                      paymentLinkDialog={paymentLinkDialog}
                      paymentLinkUrl={paymentLinkUrl}
                      setPaymentLinkUrl={setPaymentLinkUrl}
                      paymentLinkAmount={paymentLinkAmount}
                      setPaymentLinkAmount={setPaymentLinkAmount}
                      paymentLinkMessage={paymentLinkMessage}
                      setPaymentLinkMessage={setPaymentLinkMessage}
                      isSendingPaymentLink={isSendingPaymentLink}
                      setIsSendingPaymentLink={setIsSendingPaymentLink}
                      setPaymentLinkDialog={setPaymentLinkDialog}
                      setFormMessage={setFormMessage}
                      onClose={() => { setPaymentLinkDialog({ open: false, user: null }); setPaymentLinkUrl(""); setPaymentLinkAmount(""); setPaymentLinkMessage(""); }}
                    />
                  )}

                  {/* Inline Panel: Admin Document Upload */}
                  {adminDocUploadDialog.open && adminDocUploadDialog.order && (
                    <AdminDocUploadForm
                      adminDocUploadDialog={adminDocUploadDialog}
                      adminDocType={adminDocType}
                      setAdminDocType={setAdminDocType}
                      adminDocFile={adminDocFile}
                      setAdminDocFile={setAdminDocFile}
                      isUploadingAdminDoc={isUploadingAdminDoc}
                      setIsUploadingAdminDoc={setIsUploadingAdminDoc}
                      setAdminDocUploadDialog={setAdminDocUploadDialog}
                      setFormMessage={setFormMessage}
                      onClose={() => { setAdminDocUploadDialog({ open: false, order: null }); setAdminDocFile(null); setAdminDocType("articles_of_organization"); }}
                    />
                  )}

                  {/* Inline Panel: Reset Password */}
                  {resetPasswordDialog.open && resetPasswordDialog.user && (
                    <ResetPasswordForm
                      resetPasswordDialog={resetPasswordDialog}
                      newAdminPassword={newAdminPassword}
                      setNewAdminPassword={setNewAdminPassword}
                      isResettingPassword={isResettingPassword}
                      setIsResettingPassword={setIsResettingPassword}
                      setResetPasswordDialog={setResetPasswordDialog}
                      setFormMessage={setFormMessage}
                      onClose={() => { setResetPasswordDialog({ open: false, user: null }); setNewAdminPassword(""); }}
                    />
                  )}

                  {idvRequestDialog.open && idvRequestDialog.user && (
                    <IdvRequestForm
                      idvRequestDialog={idvRequestDialog}
                      idvRequestNotes={idvRequestNotes}
                      setIdvRequestNotes={setIdvRequestNotes}
                      isSendingIdvRequest={isSendingIdvRequest}
                      setIsSendingIdvRequest={setIsSendingIdvRequest}
                      setIdvRequestDialog={setIdvRequestDialog}
                      setFormMessage={setFormMessage}
                      onClose={() => { setIdvRequestDialog({ open: false, user: null }); setIdvRequestNotes(""); }}
                    />
                  )}

                  {idvRejectDialog.open && idvRejectDialog.user && (
                    <IdvRejectForm
                      idvRejectDialog={idvRejectDialog}
                      idvRejectReason={idvRejectReason}
                      setIdvRejectReason={setIdvRejectReason}
                      isSendingIdvReject={isSendingIdvReject}
                      setIsSendingIdvReject={setIsSendingIdvReject}
                      setIdvRejectDialog={setIdvRejectDialog}
                      setFormMessage={setFormMessage}
                      onClose={() => { setIdvRejectDialog({ open: false, user: null }); setIdvRejectReason(""); }}
                    />
                  )}
                  
                  {docRejectDialog.open && docRejectDialog.docId && (
                    <DocRejectForm
                      docRejectDialog={docRejectDialog}
                      docRejectReason={docRejectReason}
                      setDocRejectReason={setDocRejectReason}
                      setDocRejectDialog={setDocRejectDialog}
                      setFormMessage={setFormMessage}
                      onClose={() => { setDocRejectDialog({ open: false, docId: null }); setDocRejectReason(""); }}
                    />
                  )}

                  {adminSubTab === 'dashboard' && (
                    <PanelErrorBoundary panelName="admin-dashboard">
                      <AdminDashboardPanel
                        adminStats={adminStats}
                        adminOrders={adminOrders || []}
                        adminUsers={adminUsers || []}
                        adminMessages={adminMessages || []}
                        adminDocuments={adminDocuments || []}
                        guestVisitors={guestVisitors}
                        setAdminSubTab={setAdminSubTab}
                        refetchGuests={refetchGuests}
                        showConfirm={showConfirm}
                        setFormMessage={setFormMessage}
                      />
                    </PanelErrorBoundary>
                  )}
                  
                  {adminSubTab === 'orders' && (
                    <PanelErrorBoundary panelName="admin-orders">
                      <AdminOrdersPanel
                        filteredAdminOrders={filteredAdminOrders || []}
                        adminSearchQuery={adminSearchQuery}
                        adminUsers={adminUsers || []}
                        paymentAccountsList={paymentAccountsList || []}
                        setAdminSubTab={setAdminSubTab}
                        onEditOrder={() => {}}
                        onPaymentLink={(order) => {
                          setPaymentLinkDialog({ open: true, user: order.user });
                        }}
                        onCreateInvoice={(order) => {
                          setOrderInvoiceAmount(((order.amount || 0) / 100).toFixed(2));
                          setOrderInvoiceCurrency("EUR");
                          setGenerateInvoiceDialog({ open: true, order });
                        }}
                        onStatusChange={(orderId, status) => updateStatusMutation.mutate({ id: orderId, status })}
                        onDeleteOrder={(orderId) => {
                          const order = filteredAdminOrders?.find((o: any) => o.id === orderId);
                          if (order) setDeleteOrderConfirm({ open: true, order });
                        }}
                        pagination={ordersPagination}
                        onPageChange={setOrdersPage}
                      />
                    </PanelErrorBoundary>
                  )}
                  {adminSubTab === 'communications' && (
                    <PanelErrorBoundary panelName="admin-comms">
                      <AdminCommsPanel
                        commSubTab={commSubTab}
                        setCommSubTab={setCommSubTab}
                        filteredAdminMessages={filteredAdminMessages || []}
                        adminSearchQuery={adminSearchQuery}
                        onSelectMessage={(msg) => setSelectedMessage(msg)}
                        onDeleteMessage={(msgId) => {}}
                        onToggleRead={(msgId, isRead) => {}}
                        pagination={messagesPagination}
                        onPageChange={setMessagesPage}
                      />
                    </PanelErrorBoundary>
                  )}
                  {adminSubTab === 'incomplete' && (
                    <PanelErrorBoundary panelName="admin-incomplete">
                      <AdminIncompletePanel
                        incompleteApps={incompleteApps}
                        onDelete={(params) => deleteIncompleteAppMutation.mutate(params)}
                        isDeleting={deleteIncompleteAppMutation.isPending}
                      />
                    </PanelErrorBoundary>
                  )}
                  {adminSubTab === 'users' && (
                    <PanelErrorBoundary panelName="admin-users">
                      <AdminUsersPanel
                        filteredAdminUsers={filteredAdminUsers || []}
                        adminSearchQuery={adminSearchQuery}
                        usersSubTab={usersSubTab}
                        setUsersSubTab={setUsersSubTab}
                        adminNewsletterSubs={adminNewsletterSubs || []}
                        onEditUser={(u) => setEditingUser(u)}
                        onViewOrders={(userId) => { setAdminSubTab('orders'); }}
                        onResetPassword={(userId) => { const u = adminUsers?.find((x: any) => x.id === userId); if (u) setResetPasswordDialog({ open: true, user: u }); }}
                        onToggleActive={(userId, isActive) => updateUserMutation.mutate({ id: userId, accountStatus: isActive ? 'active' : 'deactivated' })}
                        onDeleteUser={(userId) => { const u = adminUsers?.find((x: any) => x.id === userId); if (u) setDeleteConfirm({ open: true, user: u }); }}
                        onIdvAction={(userId, action) => {
                          const u = adminUsers?.find((x: any) => x.id === userId);
                          if (!u) return;
                          if (action === 'request') { setIdvRequestDialog({ open: true, user: u }); setIdvRequestNotes(""); }
                          else if (action === 'reject') { setIdvRejectDialog({ open: true, user: u }); setIdvRejectReason(""); }
                        }}
                        onStatusChange={(userId, status) => updateUserMutation.mutate({ id: userId, accountStatus: status as any })}
                        onRequestIdv={(u) => { setIdvRequestDialog({ open: true, user: u }); setIdvRequestNotes(""); }}
                        onRejectIdv={(u) => { setIdvRejectDialog({ open: true, user: u }); setIdvRejectReason(""); }}
                        onSendNote={(u) => setNoteDialog({ open: true, user: u })}
                        onRequestDoc={(u) => setDocDialog({ open: true, user: u })}
                        onCreateInvoice={(u) => setInvoiceDialog({ open: true, user: u })}
                        onPaymentLink={(u) => setPaymentLinkDialog({ open: true, user: u })}
                        broadcastSubject={broadcastSubject}
                        setBroadcastSubject={setBroadcastSubject}
                        broadcastMessage={broadcastMessage}
                        setBroadcastMessage={setBroadcastMessage}
                        broadcastMutationIsPending={broadcastMutation.isPending}
                        onSendBroadcast={(data) => broadcastMutation.mutate(data)}
                        onDeleteSubscriber={(sub) => {
                          showConfirm({
                            title: t('common.confirmAction'),
                            description: t('dashboard.admin.newsletterSection.confirmDelete') + ` ${sub.email}?`,
                            onConfirm: async () => {
                              try {
                                await apiRequest("DELETE", `/api/admin/newsletter/${sub.id}`);
                                refetchNewsletterSubs();
                                setFormMessage({ type: 'success', text: t("dashboard.toasts.subscriberDeleted") });
                              } catch (e) {
                                setFormMessage({ type: 'error', text: t("common.error") });
                              }
                            },
                          });
                        }}
                        isApprovingIdv={isApprovingIdv}
                        onApproveIdv={async (userId) => {
                          setIsApprovingIdv(true);
                          try {
                            await apiRequest("POST", `/api/admin/users/${userId}/approve-identity-verification`);
                            setFormMessage({ type: 'success', text: t('dashboard.admin.users.idvApproved') });
                            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
                          } catch { setFormMessage({ type: 'error', text: t('common.error') }); }
                          finally { setIsApprovingIdv(false); }
                        }}
                        pagination={usersPagination}
                        onPageChange={setUsersPage}
                      />
                    </PanelErrorBoundary>
                  )}
                  {adminSubTab === 'calendar' && (
                    <PanelErrorBoundary panelName="admin-calendar">
                      <AdminCalendarPanel
                        adminOrders={adminOrders || []}
                        updateLlcDatesMutation={updateLlcDatesMutation}
                        setFormMessage={setFormMessage}
                        showConfirm={showConfirm}
                      />
                    </PanelErrorBoundary>
                  )}
                  {adminSubTab === 'docs' && (
                    <PanelErrorBoundary panelName="admin-docs">
                      <AdminDocsPanel
                        filteredAdminDocuments={filteredAdminDocuments}
                        adminSearchQuery={adminSearchQuery}
                        adminOrders={adminOrders}
                        adminUsers={adminUsers}
                        setFormMessage={setFormMessage}
                        setDocRejectDialog={setDocRejectDialog}
                        setDocRejectReason={setDocRejectReason}
                        setNoteDialog={setNoteDialog}
                        setAdminDocUploadDialog={setAdminDocUploadDialog}
                        setAdminDocType={setAdminDocType}
                        setAdminDocFile={setAdminDocFile}
                        showConfirm={showConfirm}
                      />
                    </PanelErrorBoundary>
                  )}
                  {adminSubTab === 'billing' && (
                    <PanelErrorBoundary panelName="admin-billing">
                      <AdminBillingPanel
                        billingSubTab={billingSubTab}
                        setBillingSubTab={setBillingSubTab}
                        adminInvoices={adminInvoices || []}
                        paymentAccountsList={paymentAccountsList || []}
                        refetchPaymentAccounts={refetchPaymentAccounts}
                        setFormMessage={setFormMessage}
                        showConfirm={showConfirm}
                      />
                    </PanelErrorBoundary>
                  )}



                  {adminSubTab === 'descuentos' && (
                    <PanelErrorBoundary panelName="admin-discounts">
                      <AdminDiscountsPanel
                        discountCodes={discountCodes}
                        refetchDiscountCodes={refetchDiscountCodes}
                        setFormMessage={setFormMessage}
                        setNewDiscountCode={setNewDiscountCode}
                        setDiscountCodeDialog={setDiscountCodeDialog}
                        showConfirm={showConfirm}
                      />
                    </PanelErrorBoundary>
                  )}
                </div>
                </Suspense>
              )}
            </div>

          <div className="space-y-6 order-2 xl:order-2 self-start">
            {/* Consolidated Action Required Card */}
            {!user?.isAdmin && (notifications?.some((n: any) => n.type === 'action_required' && !(n.title || '').includes('accountDeactivated') && !(n.message || '').includes('accountDeactivated')) || 
              notifications?.some((n: any) => n.type === 'info' && (n.title || '').includes('docInReview')) ||
              !!(user as any)?.pendingProfileChanges ||
              (orders?.some((o: any) => o.application?.fiscalYearEnd && new Date(o.application.fiscalYearEnd) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))) ||
              (orders?.some((o: any) => o.status === 'pending_payment' || o.status === 'payment_failed'))) && (
              <Card className="rounded-2xl border-2 border-red-300 dark:border-red-800 shadow-sm bg-red-50 dark:bg-red-950/30 p-6 md:p-8" data-testid="section-action-required-global">
                <div className="mb-6">
                  <h3 className="text-lg md:text-xl font-black tracking-tight text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" /> {t('dashboard.actionRequired.title')}
                  </h3>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">{t('dashboard.actionRequired.subtitle')}</p>
                </div>
                <div className="space-y-3">
                  {!!(user as any)?.pendingProfileChanges && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 p-3" data-testid="action-item-profile-pending">
                      <UserCheck className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">{t('dashboard.actionRequired.profilePending')}</p>
                        <p className="text-[10px] text-muted-foreground">{t('dashboard.actionRequired.profilePendingDesc')}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs"
                        onClick={() => setActiveTab('profile')}
                        data-testid="button-action-profile-pending"
                      >
                        {t('dashboard.actionRequired.verify')}
                      </Button>
                    </div>
                  )}
                  {notifications?.filter((n: any) => n.type === 'action_required' && !(n.title || '').includes('accountDeactivated') && !(n.message || '').includes('accountDeactivated')).map((n: any) => (
                    <div key={n.id} className="flex items-start gap-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 p-3" data-testid={`action-item-document-${n.id}`}>
                      <FileUp className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">{t('dashboard.actionRequired.documentRequest')}</p>
                        <p className="text-[10px] text-muted-foreground">{tn(n.message)}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs"
                        onClick={() => setActiveTab('documents')}
                        data-testid={`button-action-document-${n.id}`}
                      >
                        {t('dashboard.actionRequired.viewDocuments')}
                      </Button>
                    </div>
                  ))}
                  {notifications?.filter((n: any) => n.type === 'info' && (n.title || '').includes('docInReview')).map((n: any) => (
                    <div key={n.id} className="flex items-start gap-3 rounded-xl bg-accent/5 dark:bg-accent/10 p-3" data-testid={`action-item-doc-review-${n.id}`}>
                      <Clock className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">{t('dashboard.documents.underReview')}</p>
                        <p className="text-[10px] text-muted-foreground">{t('dashboard.documents.underReviewDesc')}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs"
                        onClick={() => setActiveTab('documents')}
                        data-testid={`button-action-doc-review-${n.id}`}
                      >
                        {t('dashboard.actionRequired.viewDocuments')}
                      </Button>
                    </div>
                  ))}
                  {orders?.filter((o: any) => o.status === 'pending_payment' || o.status === 'payment_failed').map((o: any) => (
                    <div key={o.id} className="flex items-start gap-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 p-3" data-testid={`action-item-payment-${o.id}`}>
                      <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">{t('dashboard.actionRequired.paymentPending')}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{o.application?.companyName || o.maintenanceApplication?.requestCode || o.invoiceNumber}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs"
                        onClick={() => setActiveTab('payments')}
                        data-testid={`button-action-payment-${o.id}`}
                      >
                        {t('dashboard.actionRequired.payNow')}
                      </Button>
                    </div>
                  ))}
                  {orders?.filter((o: any) => o.application?.fiscalYearEnd && new Date(o.application.fiscalYearEnd) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).map((o: any) => (
                    <div key={`fiscal-${o.id}`} className="flex items-start gap-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 p-3" data-testid={`action-item-fiscal-${o.id}`}>
                      <Calendar className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">{t('dashboard.actionRequired.fiscalDeadline')}</p>
                        <p className="text-[10px] text-muted-foreground">{o.application?.companyName} - {formatDate(o.application.fiscalYearEnd)}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs"
                        onClick={() => setActiveTab('calendar')}
                        data-testid={`button-action-fiscal-${o.id}`}
                      >
                        {t('dashboard.actionRequired.viewCalendar')}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!user?.isAdmin && (
            <Card className={`rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 ${activeTab !== 'services' ? 'hidden xl:block' : ''}`}>
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-black tracking-tight text-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" /> {t('dashboard.tracking.title')}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.tracking.subtitle')}</p>
              </div>
              <div className="space-y-5">
                {orders && orders.length > 0 ? (
                  <>
                    <div className="rounded-xl bg-muted dark:bg-card p-3 mb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold text-accent uppercase tracking-wider mb-0.5">{t('dashboard.tracking.order')}: {orders[0]?.application?.requestCode || orders[0]?.maintenanceApplication?.requestCode || orders[0]?.invoiceNumber || orders[0]?.id}</p>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {orders[0]?.maintenanceApplication 
                              ? `${t('dashboard.services.maintenance')} ${orders[0]?.maintenanceApplication?.state || ''}`
                              : orders[0]?.application?.companyName 
                                ? (orders[0]?.application?.companyName.trim().toUpperCase().endsWith('LLC') ? orders[0]?.application?.companyName : `${orders[0]?.application?.companyName} LLC`)
                                : orders[0]?.product?.name || 'LLC'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{orders[0]?.application?.state || orders[0]?.maintenanceApplication?.state || ''}</p>
                        </div>
                        <Badge className={`${getOrderStatusLabel(orders[0]?.status || '', t).className} font-bold text-[9px] shrink-0`}>
                          {getOrderStatusLabel(orders[0]?.status || '', t).label}
                        </Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-2">{t('dashboard.tracking.created')}: {orders[0]?.createdAt ? formatDate(orders[0].createdAt) : '-'}</p>
                    </div>
                    {selectedOrderEvents && selectedOrderEvents.length > 0 ? (
                    selectedOrderEvents.map((event: any, idx: number) => (
                      <div key={event.id} className="flex gap-4 relative">
                        {idx < selectedOrderEvents.length - 1 && <div className="absolute left-3 top-6 w-0.5 h-8 bg-muted" />}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 bg-accent text-primary"><CheckCircle2 className="w-3 h-3" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs md:text-sm font-semibold text-foreground truncate">{translateI18nText(event.eventType, t)}</p>
                            {event.createdAt && (
                              <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                {formatDate(event.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{translateI18nText(event.description, t)}</p>
                        </div>
                      </div>
                    ))
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div><p className="text-xs font-black">{t('dashboard.tracking.orderReceived')}</p></div>
                        <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-muted" /><p className="text-xs text-muted-foreground">{t('dashboard.tracking.dataVerification')}</p></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 md:gap-4 text-center py-4">
                    <ClipboardList className="w-12 h-12 md:w-16 md:h-16 text-accent" />
                    <div>
                      <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.tracking.empty')}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground text-center">{t('dashboard.tracking.emptyDescription')}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            )}

            {!user?.isAdmin && (
            <Card className="rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 mb-16 md:mb-12 text-center" data-testid="card-support-help">
              <div className="flex flex-col items-center gap-3 md:gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.support.haveQuestion')}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.support.hereToHelp')}</p>
                </div>
                <a href={getWhatsAppUrl("dashboardLlc")} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-talk-to-support">{t('dashboard.support.talkToSupport')}</Button>
                </a>
              </div>
            </Card>
            )}
          </div>
        </div>
        </div>
      </main>
      </div>
      </div>
      </div>
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
