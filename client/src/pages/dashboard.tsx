import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { formatDate, formatDateShort } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getCsrfToken } from "@/lib/queryClient";
import { FileText, Clock, User as UserIcon, Package, CreditCard, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, ShieldCheck, Users, Edit, FileUp, Loader2, Receipt, Plus, Calendar, DollarSign, BarChart3, UserCheck, Upload, Tag, X, Calculator, Key, Search, LogOut, ClipboardList } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { DashboardTour } from "@/components/dashboard-tour";
import { 
  Tab, 
  AdminUserData, 
  DiscountCode, 
  getOrderStatusLabel
} from "@/components/dashboard";
import { PRICING, getFormationPriceFormatted, getMaintenancePriceFormatted } from "@shared/config/pricing";
import { ServicesTab } from "@/components/dashboard/services-tab";
import { ActivityLogPanel } from "@/components/dashboard/activity-log-panel";
import { CrmMetricsSection } from "@/components/dashboard/crm-metrics-section";
import AdminRolesPanel from "@/components/dashboard/admin-roles-panel";
import { NotificationsTab } from "@/components/dashboard/notifications-tab";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { ConsultationsTab } from "@/components/dashboard/consultations-tab";
import { AdminConsultationsPanel } from "@/components/dashboard/admin-consultations-panel";
import { AdminDashboardPanel } from "@/pages/dashboard/panels/admin/AdminDashboardPanel";
import { AdminOrdersPanel } from "@/pages/dashboard/panels/admin/AdminOrdersPanel";
import { AdminUsersPanel } from "@/pages/dashboard/panels/admin/AdminUsersPanel";
import { AdminCommsPanel } from "@/pages/dashboard/panels/admin/AdminCommsPanel";
import { AdminAccountingPanel } from "@/components/dashboard/admin-accounting-panel";
import { AdminBillingPanel } from "@/pages/dashboard/panels/admin/AdminBillingPanel";
import { DocumentsPanel } from "@/pages/dashboard/panels/user/DocumentsPanel";
import { PaymentsPanel } from "@/pages/dashboard/panels/user/PaymentsPanel";
import { CalendarPanel } from "@/pages/dashboard/panels/user/CalendarPanel";
import { ToolsPanel } from "@/pages/dashboard/panels/user/ToolsPanel";
import { AdminCalendarPanel } from "@/pages/dashboard/panels/admin/AdminCalendarPanel";
import { AdminDocsPanel } from "@/pages/dashboard/panels/admin/AdminDocsPanel";
import { AdminIncompletePanel } from "@/pages/dashboard/panels/admin/AdminIncompletePanel";
import { AdminDiscountsPanel } from "@/pages/dashboard/panels/admin/AdminDiscountsPanel";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingScreen } from "@/components/loading-screen";


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
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    businessActivity: '',
    address: '',
    streetType: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    idNumber: '',
    idType: '',
    birthDate: ''
  });
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
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
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  useEffect(() => {
    if (user?.isAdmin && activeTab !== 'admin') {
      setActiveTab('admin' as Tab);
      setAdminSubTab('dashboard');
    }
  }, [user?.isAdmin]);
  
  const isPendingAccount = user?.accountStatus === 'pending';
  const canEdit = user?.accountStatus === 'active' || user?.accountStatus === 'vip';
    
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [paymentLink, setPaymentLink] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [docDialog, setDocDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [docType, setDocType] = useState("");
  const [docMessage, setDocMessage] = useState("");
  const [docRejectDialog, setDocRejectDialog] = useState<{ open: boolean; docId: number | null }>({ open: false, docId: null });
  const [docRejectReason, setDocRejectReason] = useState("");
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [noteTitle, setNoteTitle] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [noteType, setNoteType] = useState("info");
  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [invoiceConcept, setInvoiceConcept] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceCurrency, setInvoiceCurrency] = useState("EUR");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoicePaymentAccountIds, setInvoicePaymentAccountIds] = useState<number[]>([]);
  const [adminSubTab, setAdminSubTabRaw] = useState(subTabFromUrl || (user?.isSupport && !user?.isAdmin ? "orders" : "dashboard"));

  const setAdminSubTab = useCallback((sub: string) => {
    setAdminSubTabRaw(sub);
    syncTabToUrl('admin', sub);
    setOrdersPage(1);
    setUsersPage(1);
    setMessagesPage(1);
    setAdminSearchQuery('');
  }, [syncTabToUrl]);
  const [commSubTab, setCommSubTab] = useState<'inbox' | 'agenda'>('inbox');
  const [usersSubTab, setUsersSubTab] = useState<'users' | 'newsletter'>('users');
  const [billingSubTab, setBillingSubTab] = useState<'invoices' | 'accounting' | 'payment-methods'>('invoices');
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminSearchFilter, setAdminSearchFilter] = useState<'all' | 'name' | 'email' | 'date' | 'invoiceId'>('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);
  const adminPageSize = 50;
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [createOrderDialog, setCreateOrderDialog] = useState(false);
  const [newOrderData, setNewOrderData] = useState({ userId: '', productId: '1', amount: '', state: 'New Mexico', orderType: 'llc' as 'llc' | 'maintenance' | 'custom', concept: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [deleteOwnAccountDialog, setDeleteOwnAccountDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; file: File | null }>({ open: false, file: null });
  const [uploadDocType, setUploadDocType] = useState("passport");
  const [uploadNotes, setUploadNotes] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'form' | 'otp'>('form');
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [profileOtpStep, setProfileOtpStep] = useState<'idle' | 'otp'>('idle');
  const [profileOtp, setProfileOtp] = useState("");
  const [pendingProfileData, setPendingProfileData] = useState<Record<string, any> | null>(null);
  const [discountCodeDialog, setDiscountCodeDialog] = useState<{ open: boolean; code: DiscountCode | null }>({ open: false, code: null });
  const [paymentLinkDialog, setPaymentLinkDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [paymentLinkUrl, setPaymentLinkUrl] = useState("");
  const [paymentLinkAmount, setPaymentLinkAmount] = useState("");
  const [paymentLinkMessage, setPaymentLinkMessage] = useState("");
  const [isSendingPaymentLink, setIsSendingPaymentLink] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [adminDocUploadDialog, setAdminDocUploadDialog] = useState<{ open: boolean; order: any }>({ open: false, order: null });
  const [adminDocType, setAdminDocType] = useState("articles_of_organization");
  const [adminDocFile, setAdminDocFile] = useState<File | null>(null);
  const [isUploadingAdminDoc, setIsUploadingAdminDoc] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [idvRequestDialog, setIdvRequestDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [idvRequestNotes, setIdvRequestNotes] = useState("");
  const [isSendingIdvRequest, setIsSendingIdvRequest] = useState(false);
  const [idvRejectDialog, setIdvRejectDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [idvRejectReason, setIdvRejectReason] = useState("");
  const [isSendingIdvReject, setIsSendingIdvReject] = useState(false);
  const [isApprovingIdv, setIsApprovingIdv] = useState(false);
  const [idvUploadFile, setIdvUploadFile] = useState<File | null>(null);
  const [isUploadingIdv, setIsUploadingIdv] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        businessActivity: user.businessActivity || '',
        address: user.address || '',
        streetType: user.streetType || '',
        city: user.city || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        idNumber: user.idNumber || '',
        idType: user.idType || '',
        birthDate: user.birthDate || ''
      });
    }
  }, [user]);

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

  const updateProfile = useMutation({
    retry: false,
    mutationFn: async (data: typeof profileData) => {
      setFormMessage(null);
      if (!canEdit) {
        throw new Error(t("dashboard.toasts.cannotModifyAccountState"));
      }
      if (data.idNumber && data.idNumber.trim()) {
        const digits = data.idNumber.replace(/\D/g, '');
        if (digits.length > 0 && digits.length < 7) {
          throw new Error(t("validation.idNumberMinDigits"));
        }
      }
      if (data.birthDate) {
        const birthDate = new Date(data.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          throw new Error(t("validation.ageMinimum"));
        }
      }
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["X-CSRF-Token"] = token;
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === "OTP_REQUIRED") {
          setPendingProfileData(err.pendingChanges || {});
          setProfileOtpStep('otp');
          setIsEditing(false);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          setFormMessage({ type: 'success', text: t("profile.otpSentTitle") + ". " + t("profile.otpSentDesc") });
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
          throw new Error("OTP_REQUIRED_SILENT");
        }
        throw new Error(err.message || t("dashboard.toasts.couldNotSave"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      setFormMessage({ type: 'success', text: t("dashboard.toasts.changesSaved") + ". " + t("dashboard.toasts.changesSavedDesc") });
    },
    onError: (error: any) => {
      if (error.message === "OTP_REQUIRED_SILENT") return;
      setFormMessage({ type: 'error', text: t("common.error") + ". " + error.message });
    }
  });

  const confirmProfileWithOtp = useMutation({
    mutationFn: async () => {
      setFormMessage(null);
      if (!profileOtp || profileOtp.length !== 6) throw new Error(t("dashboard.errors.invalidOtp"));
      const res = await apiRequest("POST", "/api/user/profile/confirm-otp", { otpCode: profileOtp });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === "ACCOUNT_UNDER_REVIEW") {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          setProfileOtpStep('idle');
          setProfileOtp("");
          setPendingProfileData(null);
        }
        const attemptsMsg = err.attemptsRemaining !== undefined && err.attemptsRemaining > 0
          ? ` (${err.attemptsRemaining} ${t('profile.attemptsRemaining')})`
          : '';
        throw new Error((err.message || t("dashboard.toasts.couldNotSave")) + attemptsMsg);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      setProfileOtpStep('idle');
      setProfileOtp("");
      setPendingProfileData(null);
      setFormMessage({ type: 'success', text: t("dashboard.toasts.changesSaved") + ". " + t("dashboard.toasts.changesSavedDesc") });
    },
    onError: (error: any) => {
      setProfileOtp("");
      setFormMessage({ type: 'error', text: error.message });
    }
  });

  const cancelPendingChanges = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/profile/cancel-pending");
      if (!res.ok) throw new Error(t("dashboard.errors.failedToCancel"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setProfileOtpStep('idle');
      setProfileOtp("");
      setPendingProfileData(null);
      setFormMessage(null);
    }
  });

  const resendProfileOtp = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/profile/resend-otp");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("common.error"));
      }
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("profile.otpResent") });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: error.message });
    }
  });

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

  const isAdminTab = activeTab === 'admin';
  const isStaffUser = !!user?.isAdmin || !!user?.isSupport;

  const adminOrdersSearchParam = adminSubTab === 'orders' ? adminSearchQuery : '';
  const { data: adminOrdersResponse } = useQuery<{ data: any[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>({
    queryKey: ["/api/admin/orders", { page: ordersPage, pageSize: adminPageSize, search: adminOrdersSearchParam }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(ordersPage), pageSize: String(adminPageSize) });
      if (adminOrdersSearchParam) params.set('search', adminOrdersSearchParam);
      const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: isStaffUser && (isAdminTab && (adminSubTab === 'orders' || adminSubTab === 'dashboard' || adminSubTab === 'calendar')),
    staleTime: 1000 * 60 * 2,
  });
  const adminOrders = adminOrdersResponse?.data;
  const ordersPagination = adminOrdersResponse?.pagination;

  const { data: incompleteApps } = useQuery<{ llc: any[]; maintenance: any[] }>({
    queryKey: ["/api/admin/incomplete-applications"],
    enabled: !!user?.isAdmin && isAdminTab && adminSubTab === 'incomplete',
    staleTime: 1000 * 60 * 2,
  });

  const deleteIncompleteAppMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      setFormMessage(null);
      const res = await apiRequest("DELETE", `/api/admin/incomplete-applications/${type}/${id}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/incomplete-applications"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.incompleteDeleted") + ". " + t("dashboard.toasts.incompleteDeletedDesc") });
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotDelete") });
    }
  });

  const adminUsersSearchParam = adminSubTab === 'users' ? adminSearchQuery : '';
  const { data: adminUsersResponse } = useQuery<{ data: any[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>({
    queryKey: ["/api/admin/users", { page: usersPage, pageSize: adminPageSize, search: adminUsersSearchParam }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(usersPage), pageSize: String(adminPageSize) });
      if (adminUsersSearchParam) params.set('search', adminUsersSearchParam);
      const res = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: !!user?.isAdmin && isAdminTab && (adminSubTab === 'users' || adminSubTab === 'dashboard' || adminSubTab === 'orders'),
    staleTime: 1000 * 60 * 3,
  });
  const adminUsers = adminUsersResponse?.data;
  const usersPagination = adminUsersResponse?.pagination;

  const { data: adminNewsletterSubs, refetch: refetchNewsletterSubs } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletter"],
    enabled: !!user?.isAdmin && isAdminTab && adminSubTab === 'communications',
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminDocuments } = useQuery<any[]>({
    queryKey: ["/api/admin/documents"],
    enabled: isStaffUser && isAdminTab && (adminSubTab === 'docs' || adminSubTab === 'dashboard'),
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminInvoices } = useQuery<any[]>({
    queryKey: ["/api/admin/invoices"],
    enabled: !!user?.isAdmin && isAdminTab && (adminSubTab === 'billing' || adminSubTab === 'orders'),
    refetchInterval: isTabFocused && adminSubTab === 'billing' ? 30000 : false,
  });

  const { data: adminStats } = useQuery<{
    totalSales: number;
    pendingSales: number;
    orderCount: number;
    pendingOrders: number;
    completedOrders: number;
    processingOrders: number;
    userCount: number;
    pendingAccounts: number;
    activeAccounts: number;
    vipAccounts: number;
    deactivatedAccounts: number;
    subscriberCount: number;
    totalMessages: number;
    pendingMessages: number;
    totalDocs: number;
    pendingDocs: number;
    conversionRate: number;
  }>({
    queryKey: ["/api/admin/system-stats"],
    enabled: !!user?.isAdmin && isAdminTab && adminSubTab === 'dashboard',
    staleTime: 1000 * 60 * 2,
  });

  const adminMessagesSearchParam = adminSubTab === 'communications' ? adminSearchQuery : '';
  const { data: adminMessagesResponse } = useQuery<{ data: any[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>({
    queryKey: ["/api/admin/messages", { page: messagesPage, pageSize: adminPageSize, search: adminMessagesSearchParam }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(messagesPage), pageSize: String(adminPageSize) });
      if (adminMessagesSearchParam) params.set('search', adminMessagesSearchParam);
      const res = await fetch(`/api/admin/messages?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: isStaffUser && isAdminTab && (adminSubTab === 'communications' || adminSubTab === 'dashboard'),
    staleTime: 1000 * 60 * 2,
  });
  const adminMessages = adminMessagesResponse?.data;
  const messagesPagination = adminMessagesResponse?.pagination;

  const { data: discountCodes, refetch: refetchDiscountCodes } = useQuery<DiscountCode[]>({
    queryKey: ["/api/admin/discount-codes"],
    enabled: !!user?.isAdmin && isAdminTab && adminSubTab === 'descuentos',
    staleTime: 1000 * 60 * 2,
  });

  const { data: guestVisitors, refetch: refetchGuests } = useQuery({
    queryKey: ["/api/admin/guests"],
    enabled: !!user?.isAdmin && isAdminTab && adminSubTab === 'dashboard',
    staleTime: 1000 * 60 * 2,
  });

  const { data: paymentAccountsList, refetch: refetchPaymentAccounts } = useQuery<any[]>({
    queryKey: ["/api/admin/payment-accounts"],
    enabled: !!user?.isAdmin && isAdminTab && (adminSubTab === 'billing' || adminSubTab === 'orders'),
    staleTime: 1000 * 60 * 2,
  });

  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const broadcastMutation = useMutation({
    mutationFn: async ({ subject, message }: { subject: string, message: string }) => {
      setFormMessage(null);
      const res = await apiRequest("POST", "/api/admin/newsletter/broadcast", { subject, message });
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotSend"));
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("dashboard.toasts.emailsSent") + ". " + t("dashboard.toasts.emailsSentDesc") });
      setBroadcastSubject("");
      setBroadcastMessage("");
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotSend") });
    }
  });

  const { data: userDocuments } = useQuery<any[]>({
    queryKey: ["/api/user/documents"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const uploadDocMutation = useMutation({
    mutationFn: async (data: any) => {
      setFormMessage(null);
      const res = await apiRequest("POST", "/api/admin/documents", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("dashboard.toasts.couldNotUpload"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.documentUploaded") + ". " + t("dashboard.toasts.documentUploadedDesc") });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotUpload")) });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      setFormMessage(null);
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotUpdate"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.statusUpdated") });
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotUpdate") });
    }
  });

  const updateLlcDatesMutation = useMutation({
    mutationFn: async ({ appId, field, value }: { appId: number, field: string, value: string | null }) => {
      setFormMessage(null);
      const res = await apiRequest("PATCH", `/api/admin/llc/${appId}/dates`, { field, value });
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotUpdate"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.dateUpdated") });
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotUpdate") });
    }
  });

  const sendNoteMutation = useMutation({
    mutationFn: async ({ userId, title, message, type }: { userId: string, title: string, message: string, type: string }) => {
      setFormMessage(null);
      const res = await apiRequest("POST", "/api/admin/send-note", { userId, title, message, type });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t("dashboard.toasts.couldNotSend"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.notesSent") + ". " + t("dashboard.toasts.notesSentDesc") });
      setNoteDialog({ open: false, user: null });
      setNoteTitle("");
      setNoteMessage("");
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotSend")) });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<AdminUserData> & { id: string }) => {
      setFormMessage(null);
      const { id, createdAt, ...rest } = data;
      const validIdTypes = ['dni', 'nie', 'passport'];
      const validStatuses = ['active', 'pending', 'deactivated', 'vip'];
      const updateData: Record<string, any> = {};
      if (rest.firstName !== undefined) updateData.firstName = rest.firstName || undefined;
      if (rest.lastName !== undefined) updateData.lastName = rest.lastName || undefined;
      if (rest.email !== undefined) updateData.email = rest.email || undefined;
      if (rest.phone !== undefined) updateData.phone = rest.phone || null;
      if (rest.address !== undefined) updateData.address = rest.address || null;
      if (rest.streetType !== undefined) updateData.streetType = rest.streetType || null;
      if (rest.city !== undefined) updateData.city = rest.city || null;
      if (rest.province !== undefined) updateData.province = rest.province || null;
      if (rest.postalCode !== undefined) updateData.postalCode = rest.postalCode || null;
      if (rest.country !== undefined) updateData.country = rest.country || null;
      if (rest.idNumber !== undefined) updateData.idNumber = rest.idNumber || null;
      if (rest.idType !== undefined) updateData.idType = validIdTypes.includes(rest.idType || '') ? rest.idType : null;
      if (rest.birthDate !== undefined) updateData.birthDate = rest.birthDate || null;
      if (rest.businessActivity !== undefined) updateData.businessActivity = rest.businessActivity || null;
      if (rest.isActive !== undefined) updateData.isActive = rest.isActive;
      if (rest.isAdmin !== undefined) updateData.isAdmin = rest.isAdmin;
      if (rest.isSupport !== undefined) updateData.isSupport = rest.isSupport;
      if (rest.accountStatus !== undefined && validStatuses.includes(rest.accountStatus)) updateData.accountStatus = rest.accountStatus;
      if (rest.internalNotes !== undefined) updateData.internalNotes = rest.internalNotes || null;
      const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, cleanData);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("dashboard.toasts.couldNotUpdate"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.userUpdated") });
      setEditingUser(null);
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotUpdate")) });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      setFormMessage(null);
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.userDeleted") });
      setDeleteConfirm({ open: false, user: null });
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotDelete") });
    }
  });
  
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<{ open: boolean; order: any }>({ open: false, order: null });
  const [generateInvoiceDialog, setGenerateInvoiceDialog] = useState<{ open: boolean; order: any }>({ open: false, order: null });
  const [orderInvoiceAmount, setOrderInvoiceAmount] = useState("");
  const [orderInvoiceCurrency, setOrderInvoiceCurrency] = useState("EUR");

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      setFormMessage(null);
      const res = await apiRequest("DELETE", `/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.orderDeleted") + ". " + t("dashboard.toasts.orderDeletedDesc") });
      setDeleteOrderConfirm({ open: false, order: null });
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotDelete") });
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async ({ userId, concept, amount, currency, invoiceDate, paymentAccountIds }: { userId: string, concept: string, amount: number, currency: string, invoiceDate?: string, paymentAccountIds?: number[] }) => {
      setFormMessage(null);
      if (!amount || isNaN(amount) || amount < 1) {
        throw new Error(t("dashboard.toasts.invalidAmount"));
      }
      const res = await apiRequest("POST", "/api/admin/invoices/create", { userId, concept, amount, currency, invoiceDate, paymentAccountIds });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t("dashboard.toasts.couldNotCreate"));
      }
      return res.json();
    },
    onSuccess: (data) => {
      setFormMessage({ type: 'success', text: t("dashboard.toasts.invoiceCreated") + ". " + (t("dashboard.toasts.invoiceCreatedDesc", { number: data?.invoiceNumber || '' })) });
      setInvoiceDialog({ open: false, user: null });
      setInvoiceConcept("");
      setInvoiceAmount("");
      setInvoiceCurrency("EUR");
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setInvoicePaymentAccountIds([]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/transactions"] });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotCreate")) });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUserData) => {
      setFormMessage(null);
      const res = await apiRequest("POST", "/api/admin/users/create", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.userCreated") + ". " + t("dashboard.toasts.userCreatedDesc") });
      setCreateUserDialog(false);
      setNewUserData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotCreate") });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: typeof newOrderData) => {
      setFormMessage(null);
      const { userId, amount, orderType } = data;
      if (!userId || !amount) {
        throw new Error(t("dashboard.toasts.missingRequiredData"));
      }
      if (orderType === 'custom') {
        if (!data.concept) throw new Error(t("dashboard.toasts.missingRequiredData"));
        const res = await apiRequest("POST", "/api/admin/orders/create-custom", { userId, concept: data.concept, amount });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || t("dashboard.toasts.couldNotCreate"));
        }
        return res.json();
      }
      const { state } = data;
      if (!state) throw new Error(t("dashboard.toasts.missingRequiredData"));
      const endpoint = orderType === 'maintenance' ? "/api/admin/orders/create-maintenance" : "/api/admin/orders/create";
      const res = await apiRequest("POST", endpoint, { userId, state, amount });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || t("dashboard.toasts.couldNotCreate"));
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/transactions"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.orderCreated") + ". " + (t("dashboard.toasts.orderCreatedDesc", { number: data?.invoiceNumber || '' })) });
      setCreateOrderDialog(false);
      setNewOrderData({ userId: '', productId: '1', amount: '', state: 'New Mexico', orderType: 'llc', concept: '' });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotCreate")) });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: number) => {
      setFormMessage(null);
      const endpoint = user?.isAdmin ? `/api/admin/documents/${docId}` : `/api/user/documents/${docId}`;
      const res = await apiRequest("DELETE", endpoint);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.documentDeleted") });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error?.message || t("dashboard.toasts.couldNotDelete")) });
    }
  });

  const deleteOwnAccountMutation = useMutation({
    mutationFn: async () => {
      setFormMessage(null);
      const res = await apiRequest("DELETE", "/api/user/account");
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("dashboard.toasts.accountDeleted") + ". " + t("dashboard.toasts.accountDeletedDesc") });
      window.location.href = "/";
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotDelete") });
    }
  });

  const requestPasswordOtpMutation = useMutation({
    mutationFn: async () => {
      setFormMessage(null);
      const res = await apiRequest("POST", "/api/user/request-password-otp");
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotSend"));
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("dashboard.toasts.codeSent") + ". " + t("dashboard.toasts.codeSentDesc") });
      setPasswordStep('otp');
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotSend")) });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; otp: string }) => {
      setFormMessage(null);
      const res = await apiRequest("POST", "/api/user/change-password", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("dashboard.toasts.couldNotUpdate"));
      }
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("dashboard.toasts.passwordUpdated") + ". " + t("dashboard.toasts.passwordUpdatedDesc") });
      setShowPasswordForm(false);
      setPasswordStep('form');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOtp("");
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotUpdate")) });
    }
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
      { id: 'admin-activity', subTab: 'activity', label: t('dashboard.admin.tabs.activity'), icon: ClipboardList, mobileLabel: t('dashboard.admin.tabs.activity'), adminOnly: true },
      { id: 'admin-roles', subTab: 'roles', label: t('dashboard.admin.tabs.roles') || 'Roles', icon: Key, mobileLabel: t('dashboard.admin.tabs.roles') || 'Roles', adminOnly: true },
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
    apiRequest("POST", "/api/auth/logout").then(() => window.location.href = "/");
  }, []);

  const matchesFilter = (fields: Record<string, string>, query: string, filter: typeof adminSearchFilter) => {
    if (filter === 'all') return Object.values(fields).some(v => v.includes(query));
    if (filter === 'name') return (fields.name || '').includes(query);
    if (filter === 'email') return (fields.email || '').includes(query);
    if (filter === 'date') return (fields.date || '').includes(query) || (fields.dateLong || '').includes(query);
    if (filter === 'invoiceId') return (fields.invoiceId || '').includes(query) || (fields.orderId || '').includes(query);
    return false;
  };

  const filteredAdminOrders = adminOrders;
  const filteredAdminUsers = adminUsers;
  const filteredAdminMessages = adminMessages;

  const filteredAdminDocuments = useMemo(() => {
    if (!adminSearchQuery.trim() || !adminDocuments) return adminDocuments;
    const query = adminSearchQuery.toLowerCase().trim();
    return adminDocuments.filter((doc: any) => {
      const fields: Record<string, string> = {
        name: ((doc.user?.firstName || '') + ' ' + (doc.user?.lastName || '')).toLowerCase(),
        email: (doc.user?.email || '').toLowerCase(),
        date: doc.uploadedAt ? formatDateShort(doc.uploadedAt) : '',
        invoiceId: (doc.fileName || '').toLowerCase(),
        orderId: (doc.id?.toString() || ''),
        companyName: (doc.application?.companyName || '').toLowerCase(),
      };
      return matchesFilter(fields, query, adminSearchFilter);
    });
  }, [adminDocuments, adminSearchQuery, adminSearchFilter]);

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
    <div className="h-screen bg-background font-sans animate-page-in flex flex-col overflow-hidden max-w-[100vw]">
      <Navbar />
      {!isAdmin && <DashboardTour />}

      <div className="flex flex-1 relative min-h-0">
      {/* Desktop Sidebar - Fixed position */}
      <aside className="hidden lg:flex lg:flex-col h-full w-64 shrink-0 border-r border-border/50 bg-card z-40">
          <div className="flex flex-col h-full">
            {/* Main navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {isAdmin ? (
                <>
                  {sidebarMainItems.map((item: any) => {
                    const isActive = activeTab === 'admin' && adminSubTab === item.subTab;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab('admin' as Tab); setAdminSubTab(item.subTab); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          isActive 
                          ? 'bg-accent text-accent-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }`}
                        data-testid={`button-sidebar-${item.id}`}
                      >
                        <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent-foreground' : 'text-accent'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  {sidebarMainItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as Tab)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        activeTab === item.id 
                        ? 'bg-accent text-accent-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      data-testid={`button-sidebar-${item.id}`}
                      {...('tour' in item && item.tour ? { 'data-tour': item.tour } : {})}
                    >
                      <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-accent-foreground' : 'text-accent'}`} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  
                  {isSupport && (
                    <>
                      <div className="pt-2 pb-1 px-4">
                        <div className="border-t border-border/30" />
                      </div>
                      <button
                        onClick={() => setActiveTab('admin' as Tab)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          activeTab === 'admin' 
                          ? 'bg-accent text-accent-foreground shadow-sm' 
                          : 'text-accent hover:bg-accent/10'
                        }`}
                        data-testid="button-sidebar-admin"
                      >
                        <Shield className={`w-5 h-5 shrink-0 ${activeTab === 'admin' ? 'text-accent-foreground' : 'text-accent'}`} />
                        <span>{t('dashboard.menu.support')}</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Bottom section: Profile + Settings + Logout */}
            <div className="border-t border-border/30 px-3 py-3 space-y-1">
              <button
                onClick={() => setActiveTab('profile' as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  activeTab === 'profile' 
                  ? 'bg-accent text-accent-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                data-testid="button-sidebar-profile"
                data-tour="profile"
              >
                <UserIcon className={`w-5 h-5 shrink-0 ${activeTab === 'profile' ? 'text-accent-foreground' : 'text-accent'}`} />
                <span>{t('dashboard.tabs.profile')}</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 dark:text-red-400 hover-elevate transition-colors"
                data-testid="button-sidebar-logout"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>{t("nav.logout")}</span>
              </button>

              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 mt-1 rounded-xl bg-secondary/30">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-accent font-black text-sm">
                    {(user?.firstName || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content wrapper - vertical flex for mobile tabs + scroll area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Mobile Navigation - Fixed above scroll area, never hides on scroll */}
        <div className="flex flex-col gap-2 lg:hidden bg-background pt-3 pb-2 shadow-sm shrink-0 z-50 border-b border-border/30">
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar mobile-tab-bar pl-3 pr-3 sm:pl-5 sm:pr-5">
            {isAdmin ? (
              adminMenuItems.map((item: any) => {
                const isActive = activeTab === 'admin' && adminSubTab === item.subTab;
                return (
                  <Button key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => { setActiveTab('admin' as Tab); setAdminSubTab(item.subTab); }}
                    className={`flex items-center gap-1.5 rounded-full font-bold text-xs tracking-normal whitespace-nowrap shrink-0 min-h-9 px-4 transition-all duration-200 animate-press ${
                      isActive 
                      ? 'bg-accent text-accent-foreground shadow-md scale-[1.02]' 
                      : 'bg-card text-muted-foreground'
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
                    className={`flex items-center gap-1.5 rounded-full font-bold text-xs tracking-normal whitespace-nowrap shrink-0 min-h-9 px-4 transition-all duration-200 animate-press ${
                      activeTab === item.id 
                      ? 'bg-accent text-accent-foreground shadow-md scale-[1.02]' 
                      : 'bg-card text-muted-foreground'
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
                  ? 'bg-accent text-accent-foreground shadow-md' 
                  : 'bg-accent/10 dark:bg-accent/20 text-accent hover:bg-accent/20 dark:hover:bg-accent/30'
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
        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
      <main className={`pt-6 sm:pt-10 pb-20 ${isAdmin ? 'px-3 md:px-4 lg:px-4 xl:px-5' : 'px-5 md:px-8 max-w-7xl mx-auto lg:mx-0 lg:max-w-none lg:px-10'}`}>

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
              <div className={`${isAdmin ? '' : 'xl:col-span-2'} space-y-6 ${isAdmin ? '' : 'order-2 xl:order-1'}`}>
            
              {activeTab === 'services' && (
                <>
                {isPendingAccount ? (
                  <PendingReviewCard user={user} />
                ) : (
                <ServicesTab 
                  orders={orders} 
                  draftOrders={draftOrders} 
                  activeOrders={activeOrders}
                  userName={user?.firstName || ''}
                />
                )}
                {showTrustpilotCard && (
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
                <NotificationsTab
                  notifications={notifications}
                  notificationsLoading={notificationsLoading}
                  user={user}
                  markNotificationRead={markNotificationRead}
                  deleteNotification={deleteNotification}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'consultations' && (
                <ConsultationsTab setActiveTab={setActiveTab} />
              )}

              {activeTab === 'messages' && (
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
              )}

              {activeTab === 'documents' && (
                <DocumentsPanel
                  user={user}
                  notifications={notifications || []}
                  userDocuments={userDocuments || []}
                  canEdit={canEdit}
                  setFormMessage={setFormMessage}
                  tn={tn}
                  formatDate={formatDate}
                />
              )}


              {activeTab === 'payments' && (
                <PaymentsPanel orders={orders} clientInvoices={clientInvoices} />
              )}

              {activeTab === 'calendar' && (
                <CalendarPanel orders={orders || []} />
              )}

              {activeTab === 'tools' && (
                <ToolsPanel />
              )}

              {activeTab === 'profile' && (
                <>
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
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.newClient')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.configureOrder')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setCreateUserDialog(false)} className="rounded-full" data-testid="button-close-create-user">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.firstName')}</Label>
                            <Input value={newUserData.firstName} onChange={e => setNewUserData(p => ({ ...p, firstName: e.target.value }))} placeholder={t('dashboard.admin.firstName')} className="rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" data-testid="input-create-user-firstname" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.lastName')}</Label>
                            <Input value={newUserData.lastName} onChange={e => setNewUserData(p => ({ ...p, lastName: e.target.value }))} placeholder={t('dashboard.admin.lastName')} className="rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" data-testid="input-create-user-lastname" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.email')}</Label>
                          <Input type="email" value={newUserData.email} onChange={e => setNewUserData(p => ({ ...p, email: e.target.value }))} placeholder={t('dashboard.admin.email')} className="rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" data-testid="input-create-user-email" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.phone')}</Label>
                          <Input value={newUserData.phone} onChange={e => setNewUserData(p => ({ ...p, phone: e.target.value }))} placeholder="+34 600 000 000" className="rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" data-testid="input-create-user-phone" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.password')}</Label>
                          <Input type="password" value={newUserData.password} onChange={e => setNewUserData(p => ({ ...p, password: e.target.value }))} placeholder={t('dashboard.admin.minChars')} className="rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" data-testid="input-create-user-password" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => createUserMutation.mutate(newUserData)} disabled={createUserMutation.isPending || !newUserData.email || !newUserData.password} className="flex-1 bg-accent text-accent-foreground font-black rounded-full" data-testid="button-confirm-create-user">
                          {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.createClient')}
                        </Button>
                        <Button variant="outline" onClick={() => setCreateUserDialog(false)} className="flex-1 rounded-full" data-testid="button-cancel-create-user">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {createOrderDialog && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.createOrder')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.configureOrder')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setCreateOrderDialog(false)} className="rounded-full" data-testid="button-close-create-order">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.orderType')}</Label>
                          <NativeSelect 
                            value={newOrderData.orderType} 
                            onValueChange={val => {
                              const type = val as 'llc' | 'maintenance' | 'custom';
                              if (type === 'custom') {
                                setNewOrderData(p => ({ ...p, orderType: type, amount: '', concept: '' }));
                              } else {
                                const stateKey = newOrderData.state === 'Wyoming' ? 'wyoming' : newOrderData.state === 'Delaware' ? 'delaware' : 'newMexico';
                                const defaultAmount = type === 'maintenance' 
                                  ? String(PRICING.maintenance[stateKey as keyof typeof PRICING.maintenance].price)
                                  : String(PRICING.formation[stateKey as keyof typeof PRICING.formation].price);
                                setNewOrderData(p => ({ ...p, orderType: type, amount: defaultAmount, concept: '' }));
                              }
                            }}
                            placeholder={t('dashboard.admin.selectOrderType')}
                            className="w-full rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                            data-testid="select-order-type"
                          >
                            <NativeSelectItem value="llc">{t('dashboard.admin.llcCreation')}</NativeSelectItem>
                            <NativeSelectItem value="maintenance">{t('dashboard.admin.maintenanceService')}</NativeSelectItem>
                            <NativeSelectItem value="custom">{t('dashboard.admin.customOrder')}</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.client')}</Label>
                          <NativeSelect 
                            value={newOrderData.userId} 
                            onValueChange={val => setNewOrderData(p => ({ ...p, userId: val }))}
                            placeholder={t('dashboard.admin.selectClient')}
                            className="w-full rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                            data-testid="select-order-user"
                          >
                            {adminUsers?.map((u: any) => (
                              <NativeSelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</NativeSelectItem>
                            ))}
                          </NativeSelect>
                        </div>
                        {newOrderData.orderType === 'custom' ? (
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.concept')}</Label>
                            <Input value={newOrderData.concept} 
                              onChange={e => setNewOrderData(p => ({ ...p, concept: e.target.value }))} 
                              placeholder={t('dashboard.admin.conceptPlaceholder')} 
                              className="rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" 
                              data-testid="input-order-concept" 
                            />
                          </div>
                        ) : (
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.state')}</Label>
                            <NativeSelect 
                              value={newOrderData.state} 
                              onValueChange={val => {
                                const sk = val === 'Wyoming' ? 'wyoming' : val === 'Delaware' ? 'delaware' : 'newMexico';
                                const priceConfig = newOrderData.orderType === 'maintenance' ? PRICING.maintenance : PRICING.formation;
                                const amount = String(priceConfig[sk as keyof typeof priceConfig].price);
                                setNewOrderData(p => ({ ...p, state: val, amount }));
                              }}
                              placeholder={t('dashboard.admin.selectState')}
                              className="w-full rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                              data-testid="select-order-state"
                            >
                              {newOrderData.orderType === 'maintenance' ? (
                                <>
                                  <NativeSelectItem value="New Mexico">{t('application.states.newMexico')} - {getMaintenancePriceFormatted("newMexico")}</NativeSelectItem>
                                  <NativeSelectItem value="Wyoming">{t('application.states.wyoming')} - {getMaintenancePriceFormatted("wyoming")}</NativeSelectItem>
                                  <NativeSelectItem value="Delaware">{t('application.states.delaware')} - {getMaintenancePriceFormatted("delaware")}</NativeSelectItem>
                                </>
                              ) : (
                                <>
                                  <NativeSelectItem value="New Mexico">{t('application.states.newMexico')} - {getFormationPriceFormatted("newMexico")}</NativeSelectItem>
                                  <NativeSelectItem value="Wyoming">{t('application.states.wyoming')} - {getFormationPriceFormatted("wyoming")}</NativeSelectItem>
                                  <NativeSelectItem value="Delaware">{t('application.states.delaware')} - {getFormationPriceFormatted("delaware")}</NativeSelectItem>
                                </>
                              )}
                            </NativeSelect>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.amount')} (€)</Label>
                          <Input type="number" value={newOrderData.amount} onChange={e => setNewOrderData(p => ({ ...p, amount: e.target.value }))} placeholder="899" className="rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" data-testid="input-order-amount" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => createOrderMutation.mutate(newOrderData)} disabled={createOrderMutation.isPending || !newOrderData.userId || !newOrderData.amount || (newOrderData.orderType === 'custom' && !newOrderData.concept)} className="flex-1 bg-accent text-accent-foreground font-black rounded-full" data-testid="button-confirm-create-order">
                          {createOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.createOrderBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => setCreateOrderDialog(false)} className="flex-1 rounded-full" data-testid="button-cancel-create-order">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Send Note to Client */}
                  {noteDialog.open && noteDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.sendMessageTitle')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.clientNotification')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setNoteDialog({ open: false, user: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.messageTitle')}</Label>
                          <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder={t('dashboard.admin.messageTitlePlaceholder')} className="w-full rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" data-testid="input-note-title" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.message')}</Label>
                          <Textarea value={noteMessage} onChange={e => setNoteMessage(e.target.value)} placeholder={t('dashboard.admin.messagePlaceholder')} rows={4} className="w-full rounded-2xl border-border bg-background dark:bg-card" data-testid="input-note-message" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => noteDialog.user?.id && sendNoteMutation.mutate({ userId: noteDialog.user.id, title: noteTitle, message: noteMessage, type: noteType })} disabled={!noteTitle || !noteMessage || sendNoteMutation.isPending} className="flex-1 bg-accent text-accent-foreground font-black rounded-full" data-testid="button-send-note">
                          {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.sendMessage')}
                        </Button>
                        <Button variant="outline" onClick={() => setNoteDialog({ open: false, user: null })} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Edit User */}
                  {editingUser && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.editUser')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.editUserDesc')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setEditingUser(null)} className="rounded-full">
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
                        {user?.email === 'afortuny07@gmail.com' && (
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
                        <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); setEditingUser(null); }} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Delete User Confirmation */}
                  {deleteConfirm.open && deleteConfirm.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-red-300 dark:border-red-800 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-red-600">{t('dashboard.admin.deleteUser')}</h3>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ open: false, user: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">{t('dashboard.admin.deleteUserConfirm')} <strong>{deleteConfirm.user?.firstName} {deleteConfirm.user?.lastName}</strong>?</p>
                        <p className="text-xs text-red-500 mt-2">{t('dashboard.admin.actionIrreversible')}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button variant="destructive" onClick={() => deleteConfirm.user?.id && deleteUserMutation.mutate(deleteConfirm.user.id)} disabled={deleteUserMutation.isPending} className="flex-1 rounded-full font-black" data-testid="button-confirm-delete">
                          {deleteUserMutation.isPending ? t('dashboard.admin.deleting') : t('dashboard.admin.delete')}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, user: null })} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Delete Order Confirmation */}
                  {deleteOrderConfirm.open && deleteOrderConfirm.order && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-red-300 dark:border-red-800 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-red-600">{t('dashboard.admin.deleteOrder')}</h3>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteOrderConfirm({ open: false, order: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">{t('dashboard.admin.deleteUserConfirm')} <strong>{deleteOrderConfirm.order?.application?.requestCode || deleteOrderConfirm.order?.maintenanceApplication?.requestCode || deleteOrderConfirm.order?.invoiceNumber}</strong>?</p>
                        <p className="text-xs text-muted-foreground mt-2">{t('dashboard.admin.deleteOrderClient')}: {deleteOrderConfirm.order?.user?.firstName} {deleteOrderConfirm.order?.user?.lastName}</p>
                        <p className="text-xs text-red-500 mt-2">{t('dashboard.admin.deleteOrderWarning')}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button variant="destructive" onClick={() => deleteOrderConfirm.order?.id && deleteOrderMutation.mutate(deleteOrderConfirm.order.id)} disabled={deleteOrderMutation.isPending} className="flex-1 rounded-full font-black" data-testid="button-confirm-delete-order">
                          {deleteOrderMutation.isPending ? t('dashboard.admin.deleting') : t('dashboard.admin.deleteOrderBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteOrderConfirm({ open: false, order: null })} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Generate Invoice */}
                  {generateInvoiceDialog.open && generateInvoiceDialog.order && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.generateInvoice')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.orderLabel')}: {generateInvoiceDialog.order?.application?.requestCode || generateInvoiceDialog.order?.maintenanceApplication?.requestCode || generateInvoiceDialog.order?.invoiceNumber}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setGenerateInvoiceDialog({ open: false, order: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.invoiceAmount')}</Label>
                          <Input type="number" 
                            step="0.01" 
                            value={orderInvoiceAmount} 
                            onChange={e => setOrderInvoiceAmount(e.target.value)}
                            className="rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" 
                            placeholder="899.00"
                            data-testid="input-invoice-amount"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.currency')}</Label>
                          <NativeSelect 
                            value={orderInvoiceCurrency} 
                            onValueChange={setOrderInvoiceCurrency}
                            className="w-full rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                          >
                            <NativeSelectItem value="EUR">EUR (€)</NativeSelectItem>
                            <NativeSelectItem value="USD">USD ($)</NativeSelectItem>
                          </NativeSelect>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button 
                          className="flex-1 bg-accent text-accent-foreground font-black rounded-full"
                          disabled={!orderInvoiceAmount || isNaN(parseFloat(orderInvoiceAmount)) || parseFloat(orderInvoiceAmount) <= 0 || isGeneratingInvoice}
                          onClick={async () => {
                            setIsGeneratingInvoice(true);
                            try {
                              const amountCents = Math.round(parseFloat(orderInvoiceAmount) * 100);
                              if (amountCents <= 0) {
                                setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.amountMustBeGreater") });
                                return;
                              }
                              const res = await apiRequest("POST", `/api/admin/orders/${generateInvoiceDialog.order?.id}/generate-invoice`, {
                                amount: amountCents,
                                currency: orderInvoiceCurrency
                              });
                              if (!res.ok) {
                                const data = await res.json().catch(() => ({}));
                                throw new Error(data.message || t("dashboard.toasts.couldNotGenerate"));
                              }
                              setFormMessage({ type: 'success', text: t("dashboard.toasts.invoiceGenerated") + ". " + t("dashboard.toasts.invoiceGeneratedDesc", { amount: orderInvoiceAmount, currency: orderInvoiceCurrency }) });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
                              window.open(`/api/orders/${generateInvoiceDialog.order?.id}/invoice`, '_blank');
                              setGenerateInvoiceDialog({ open: false, order: null });
                              setOrderInvoiceAmount("");
                            } catch (err: any) {
                              setFormMessage({ type: 'error', text: t("common.error") + ". " + (err.message || t("dashboard.toasts.couldNotGenerate")) });
                            } finally {
                              setIsGeneratingInvoice(false);
                            }
                          }}
                          data-testid="button-confirm-generate-invoice"
                        >
                          {isGeneratingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.generateInvoiceBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => setGenerateInvoiceDialog({ open: false, order: null })} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Request Documents */}
                  {docDialog.open && docDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.requestDocs')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.requestDocsDesc')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setDocDialog({ open: false, user: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.docType')}</Label>
                          <NativeSelect 
                            value={docType} 
                            onValueChange={setDocType}
                            placeholder={t('dashboard.admin.selectDocType')}
                            className="w-full rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                          >
                            <NativeSelectItem value="passport">{t('dashboard.admin.docPassport')}</NativeSelectItem>
                            <NativeSelectItem value="address_proof">{t('dashboard.admin.docAddressProof')}</NativeSelectItem>
                            <NativeSelectItem value="tax_id">{t('dashboard.admin.docTaxId')}</NativeSelectItem>
                            <NativeSelectItem value="other">{t('dashboard.admin.docOther')}</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.message')}</Label>
                          <Textarea value={docMessage} onChange={e => setDocMessage(e.target.value)} placeholder={t('dashboard.admin.messageForClient')} rows={3} className="w-full rounded-2xl border-border bg-background dark:bg-card" data-testid="input-doc-message" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => {
                          if (docDialog.user?.id && docDialog.user?.email) {
                            const docTypeI18nKeys: Record<string, string> = {
                              passport: 'dashboard.documents.passport',
                              address_proof: 'dashboard.documents.addressProof',
                              tax_id: 'dashboard.documents.taxId',
                              other: 'dashboard.documents.otherDocument'
                            };
                            const docI18nKey = docTypeI18nKeys[docType] || docType;
                            const i18nTitle = `i18n:ntf.docRequested.title::{"docType":"@${docI18nKey}"}`;
                            const i18nMessage = docMessage 
                              ? `i18n:ntf.docRequested.message::{"docType":"@${docI18nKey}"}` 
                              : `i18n:ntf.docRequested.message::{"docType":"@${docI18nKey}"}`;
                            sendNoteMutation.mutate({ 
                              userId: docDialog.user.id, 
                              title: i18nTitle, 
                              message: docMessage || i18nMessage, 
                              type: 'action_required' 
                            });
                            setDocDialog({ open: false, user: null });
                            setDocType('');
                            setDocMessage('');
                          }
                        }} disabled={!docType || sendNoteMutation.isPending} className="flex-1 bg-accent text-accent-foreground font-black rounded-full" data-testid="button-request-doc">
                          {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.requestDocBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => setDocDialog({ open: false, user: null })} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Create Invoice */}
                  {invoiceDialog.open && invoiceDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.createInvoice')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.client')}: {invoiceDialog.user?.firstName} {invoiceDialog.user?.lastName}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setInvoiceDialog({ open: false, user: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.concept')}</Label>
                          <Input value={invoiceConcept} 
                            onChange={e => setInvoiceConcept(e.target.value)} 
                            placeholder={t('dashboard.admin.conceptPlaceholder')} 
                            className="w-full rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                            data-testid="input-invoice-concept"
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.invoiceAmount')}</Label>
                            <Input type="number" 
                              value={invoiceAmount} 
                              onChange={e => setInvoiceAmount(e.target.value)} 
                              placeholder="899" 
                              className="w-full rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                              data-testid="input-invoice-amount"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.currencyLabel')}</Label>
                            <NativeSelect 
                              value={invoiceCurrency} 
                              onValueChange={setInvoiceCurrency}
                              className="w-full rounded-full h-11 px-3 border border-border dark:border-border bg-white dark:bg-card"
                              data-testid="select-invoice-currency"
                            >
                              <NativeSelectItem value="EUR">EUR</NativeSelectItem>
                              <NativeSelectItem value="USD">USD</NativeSelectItem>
                            </NativeSelect>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.invoiceDate')}</Label>
                            <Input type="date" 
                              value={invoiceDate} 
                              onChange={e => setInvoiceDate(e.target.value)} 
                              className="w-full rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                              data-testid="input-invoice-date"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.invoicePaymentMethods')}</Label>
                          <div className="flex flex-wrap gap-2">
                            {paymentAccountsList?.filter((a: any) => a.isActive).map((acct: any) => (
                              <Button 
                                key={acct.id}
                                type="button"
                                size="sm"
                                variant={invoicePaymentAccountIds.includes(acct.id) ? "default" : "outline"}
                                className={`rounded-full text-xs ${invoicePaymentAccountIds.includes(acct.id) ? 'bg-accent text-accent-foreground' : ''}`}
                                onClick={() => {
                                  setInvoicePaymentAccountIds(prev => 
                                    prev.includes(acct.id) ? prev.filter(id => id !== acct.id) : [...prev, acct.id]
                                  );
                                }}
                                data-testid={`button-invoice-payment-${acct.id}`}
                              >
                                {acct.label}
                              </Button>
                            ))}
                            {(!paymentAccountsList || paymentAccountsList.filter((a: any) => a.isActive).length === 0) && (
                              <p className="text-xs text-muted-foreground">{t('dashboard.admin.noPaymentAccounts')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => invoiceDialog.user?.id && createInvoiceMutation.mutate({ 
                            userId: invoiceDialog.user.id, 
                            concept: invoiceConcept, 
                            amount: Math.round(parseFloat(invoiceAmount) * 100),
                            currency: invoiceCurrency,
                            invoiceDate,
                            paymentAccountIds: invoicePaymentAccountIds.length > 0 ? invoicePaymentAccountIds : undefined
                          })} 
                          disabled={!invoiceConcept || !invoiceAmount || createInvoiceMutation.isPending}
                          className="flex-1 bg-accent text-accent-foreground font-black rounded-full"
                          data-testid="button-create-invoice"
                        >
                          {createInvoiceMutation.isPending ? t('dashboard.admin.creating') : t('dashboard.admin.createInvoiceBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => setInvoiceDialog({ open: false, user: null })} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Discount Code */}
                  {discountCodeDialog.open && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">
                            {discountCodeDialog.code ? t('dashboard.admin.editDiscountCode') : t('dashboard.admin.newDiscountCode')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {discountCodeDialog.code ? t('dashboard.admin.editDiscountCodeDesc') : t('dashboard.admin.newDiscountCodeDesc')}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setDiscountCodeDialog({ open: false, code: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.code')}</Label>
                          <Input value={newDiscountCode.code} 
                            onChange={e => setNewDiscountCode(p => ({ ...p, code: e.target.value.toUpperCase() }))} 
                            className="rounded-xl h-11 px-4 border border-border dark:border-border uppercase bg-white dark:bg-card" 
                            disabled={!!discountCodeDialog.code}
                            data-testid="input-discount-code" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.type')}</Label>
                            <NativeSelect 
                              value={newDiscountCode.discountType} 
                              onValueChange={(val) => setNewDiscountCode(p => ({ ...p, discountType: val as 'percentage' | 'fixed' }))}
                              className="w-full rounded-xl h-11 px-3 border border-border dark:border-border bg-white dark:bg-card"
                              data-testid="select-discount-type"
                            >
                              <NativeSelectItem value="percentage">{t('dashboard.admin.percentage')}</NativeSelectItem>
                              <NativeSelectItem value="fixed">{t('dashboard.admin.fixed')}</NativeSelectItem>
                            </NativeSelect>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">
                              {t('dashboard.admin.value')} {newDiscountCode.discountType === 'percentage' ? '(%)' : '(cts)'}
                            </Label>
                            <Input type="number" 
                              value={newDiscountCode.discountValue} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, discountValue: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" 
                              data-testid="input-discount-value" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.minAmount')}</Label>
                            <Input type="number" 
                              value={newDiscountCode.minOrderAmount} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, minOrderAmount: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" 
                              data-testid="input-discount-min-amount" 
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.maxUses')}</Label>
                            <Input type="number" 
                              value={newDiscountCode.maxUses} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, maxUses: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" 
                              data-testid="input-discount-max-uses" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.validFrom')}</Label>
                            <Input type="date" 
                              value={newDiscountCode.validFrom} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, validFrom: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" 
                              data-testid="input-discount-valid-from" 
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.validUntil')}</Label>
                            <Input type="date" 
                              value={newDiscountCode.validUntil} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, validUntil: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card" 
                              data-testid="input-discount-valid-until" 
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={newDiscountCode.isActive} 
                            onCheckedChange={(checked) => setNewDiscountCode(p => ({ ...p, isActive: checked }))}
                            data-testid="switch-discount-active"
                          />
                          <Label className="text-sm font-semibold">{t('dashboard.admin.activeCode')}</Label>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-4">
                        <Button onClick={async () => {
                            try {
                              const payload = {
                                code: newDiscountCode.code,
                                discountType: newDiscountCode.discountType,
                                discountValue: parseInt(newDiscountCode.discountValue),
                                minOrderAmount: newDiscountCode.minOrderAmount ? parseInt(newDiscountCode.minOrderAmount) * 100 : null,
                                maxUses: newDiscountCode.maxUses ? parseInt(newDiscountCode.maxUses) : null,
                                validFrom: newDiscountCode.validFrom || null,
                                validUntil: newDiscountCode.validUntil || null,
                                isActive: newDiscountCode.isActive
                              };
                              if (discountCodeDialog.code) {
                                await apiRequest("PATCH", `/api/admin/discount-codes/${discountCodeDialog.code.id}`, payload);
                                setFormMessage({ type: 'success', text: t("dashboard.toasts.discountCodeUpdated") });
                              } else {
                                await apiRequest("POST", "/api/admin/discount-codes", payload);
                                setFormMessage({ type: 'success', text: t("dashboard.toasts.discountCodeCreated") });
                              }
                              refetchDiscountCodes();
                              setDiscountCodeDialog({ open: false, code: null });
                            } catch (e: any) {
                              setFormMessage({ type: 'error', text: t("common.error") + ". " + (e.message || t("dashboard.toasts.couldNotSave")) });
                            }
                          }} 
                          disabled={!newDiscountCode.code || !newDiscountCode.discountValue} 
                          className="flex-1 bg-accent text-accent-foreground font-black rounded-full" 
                          data-testid="button-save-discount"
                        >
                          {discountCodeDialog.code ? t('dashboard.admin.saveDiscountChanges') : t('dashboard.admin.createCode')}
                        </Button>
                        <Button variant="outline" onClick={() => setDiscountCodeDialog({ open: false, code: null })} className="flex-1 rounded-full" data-testid="button-cancel-discount">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Payment Link */}
                  {paymentLinkDialog.open && paymentLinkDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground">{t('dashboard.admin.sendPaymentLink')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.sendPaymentLinkDesc')} {paymentLinkDialog.user?.firstName} {paymentLinkDialog.user?.lastName}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setPaymentLinkDialog({ open: false, user: null }); setPaymentLinkUrl(""); setPaymentLinkAmount(""); setPaymentLinkMessage(""); }} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.paymentLinkUrl')}</Label>
                          <Input value={paymentLinkUrl}
                            onChange={(e) => setPaymentLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                            data-testid="input-payment-link-url"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.paymentAmount')}</Label>
                          <Input value={paymentLinkAmount}
                            onChange={(e) => setPaymentLinkAmount(e.target.value)}
                            placeholder={t('dashboard.admin.paymentAmountPlaceholder')}
                            className="rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                            data-testid="input-payment-link-amount"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.paymentMessage')}</Label>
                          <Textarea value={paymentLinkMessage}
                            onChange={(e) => setPaymentLinkMessage(e.target.value)}
                            placeholder={t('dashboard.admin.paymentMessagePlaceholder')}
                            className="rounded-xl border-border bg-background dark:bg-card"
                            rows={3}
                            data-testid="input-payment-link-message"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={async () => {
                            if (!paymentLinkUrl || !paymentLinkAmount) {
                              setFormMessage({ type: 'error', text: t("form.validation.requiredFields") });
                              return;
                            }
                            setIsSendingPaymentLink(true);
                            try {
                              await apiRequest("POST", "/api/admin/send-payment-link", {
                                userId: paymentLinkDialog.user?.id,
                                paymentLink: paymentLinkUrl,
                                amount: paymentLinkAmount,
                                message: paymentLinkMessage || `Por favor, completa el pago de ${paymentLinkAmount} a través del siguiente enlace.`
                              });
                              setFormMessage({ type: 'success', text: t("dashboard.toasts.paymentLinkSent") + ". " + t("dashboard.toasts.paymentLinkSentDesc", { email: paymentLinkDialog.user?.email }) });
                              setPaymentLinkDialog({ open: false, user: null });
                              setPaymentLinkUrl("");
                              setPaymentLinkAmount("");
                              setPaymentLinkMessage("");
                            } catch (err: any) {
                              setFormMessage({ type: 'error', text: t("common.error") + ". " + (err.message || t("dashboard.toasts.couldNotSendLink")) });
                            } finally {
                              setIsSendingPaymentLink(false);
                            }
                          }}
                          disabled={isSendingPaymentLink || !paymentLinkUrl || !paymentLinkAmount}
                          className="flex-1 bg-accent text-accent-foreground font-black rounded-full"
                          data-testid="button-send-payment-link"
                        >
                          {isSendingPaymentLink ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.sendPaymentLinkBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => { setPaymentLinkDialog({ open: false, user: null }); setPaymentLinkUrl(""); setPaymentLinkAmount(""); setPaymentLinkMessage(""); }} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Admin Document Upload */}
                  {adminDocUploadDialog.open && adminDocUploadDialog.order && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground tracking-tight">{t('dashboard.admin.uploadDocForClient')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {adminDocUploadDialog.order?.userId 
                              ? `${t('dashboard.admin.user')}: ${adminDocUploadDialog.order?.user?.firstName} ${adminDocUploadDialog.order?.user?.lastName}`
                              : `${t('dashboard.admin.orderLabel')}: ${adminDocUploadDialog.order?.application?.requestCode || adminDocUploadDialog.order?.maintenanceApplication?.requestCode || adminDocUploadDialog.order?.invoiceNumber}`
                            }
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setAdminDocUploadDialog({ open: false, order: null }); setAdminDocFile(null); setAdminDocType("articles_of_organization"); }} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.adminDocType')}</Label>
                          <NativeSelect
                            value={adminDocType}
                            onValueChange={setAdminDocType}
                            className="w-full rounded-xl h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                          >
                            <NativeSelectItem value="articles_of_organization">{t('dashboard.admin.articlesOfOrg')}</NativeSelectItem>
                            <NativeSelectItem value="certificate_of_formation">{t('dashboard.admin.certOfFormation')}</NativeSelectItem>
                            <NativeSelectItem value="boir">BOIR</NativeSelectItem>
                            <NativeSelectItem value="ein_document">{t('dashboard.admin.einDocument')}</NativeSelectItem>
                            <NativeSelectItem value="operating_agreement">{t('dashboard.admin.operatingAgreement')}</NativeSelectItem>
                            <NativeSelectItem value="invoice">{t('dashboard.admin.invoice')}</NativeSelectItem>
                            <NativeSelectItem value="other">{t('dashboard.admin.otherDoc')}</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.file')}</Label>
                          <label className="cursor-pointer block">
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setAdminDocFile(file);
                              }}
                            />
                            <div className={`p-4 border-2 border-dashed rounded-xl text-center ${adminDocFile ? 'border-accent bg-accent/5' : 'border-border dark:border-border'}`}>
                              {adminDocFile ? (
                                <div className="flex items-center justify-center gap-2">
                                  <FileUp className="w-5 h-5 text-accent" />
                                  <span className="text-sm font-medium truncate max-w-[200px]">{adminDocFile.name}</span>
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-sm">
                                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  {t('dashboard.admin.clickToSelectFile')}
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button disabled={!adminDocFile || isUploadingAdminDoc}
                          onClick={async () => {
                            if (!adminDocFile || !adminDocUploadDialog.order) return;
                            setIsUploadingAdminDoc(true);
                            try {
                              const formData = new FormData();
                              formData.append('file', adminDocFile);
                              formData.append('documentType', adminDocType);
                              if (adminDocUploadDialog.order.userId) {
                                formData.append('userId', adminDocUploadDialog.order.userId);
                              } else {
                                formData.append('orderId', adminDocUploadDialog.order.id);
                              }
                              const csrfToken = await getCsrfToken();
                              const res = await fetch('/api/admin/documents/upload', {
                                method: 'POST',
                                headers: { 'X-CSRF-Token': csrfToken },
                                body: formData,
                                credentials: 'include'
                              });
                              if (res.ok) {
                                setFormMessage({ type: 'success', text: t("dashboard.toasts.adminDocUploaded") + ". " + t("dashboard.toasts.adminDocUploadedDesc") });
                                queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                                queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
                                setAdminDocUploadDialog({ open: false, order: null });
                                setAdminDocFile(null);
                              } else {
                                const data = await res.json();
                                setFormMessage({ type: 'error', text: t("common.error") + ". " + (data.message || t("dashboard.toasts.couldNotUpload")) });
                              }
                            } catch {
                              setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.connectionError") });
                            } finally {
                              setIsUploadingAdminDoc(false);
                            }
                          }}
                          className="flex-1 bg-accent text-accent-foreground font-black rounded-full"
                          data-testid="button-admin-upload-doc"
                        >
                          {isUploadingAdminDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.uploadDocBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => { setAdminDocUploadDialog({ open: false, order: null }); setAdminDocFile(null); }} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Reset Password */}
                  {resetPasswordDialog.open && resetPasswordDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground">{t('dashboard.admin.resetPassword')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.newPasswordFor')} {resetPasswordDialog.user?.firstName} {resetPasswordDialog.user?.lastName}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setResetPasswordDialog({ open: false, user: null }); setNewAdminPassword(""); }} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.newPassword')}</Label>
                          <Input type="password"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder={t('dashboard.admin.minChars')}
                            className="rounded-xl h-12 border-border bg-background dark:bg-card"
                            data-testid="input-admin-new-password"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button disabled={newAdminPassword.length < 8 || isResettingPassword}
                          onClick={async () => {
                            if (!resetPasswordDialog.user?.id || newAdminPassword.length < 8) return;
                            setIsResettingPassword(true);
                            try {
                              await apiRequest("POST", `/api/admin/users/${resetPasswordDialog.user.id}/reset-password`, { newPassword: newAdminPassword });
                              setFormMessage({ type: 'success', text: t("dashboard.toasts.adminPasswordUpdated") + ". " + t("dashboard.toasts.adminPasswordUpdatedDesc") });
                              setResetPasswordDialog({ open: false, user: null });
                              setNewAdminPassword("");
                            } catch {
                              setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.couldNotUpdatePassword") });
                            } finally {
                              setIsResettingPassword(false);
                            }
                          }}
                          className="flex-1 bg-accent text-accent-foreground font-black rounded-full"
                          data-testid="button-confirm-reset-password"
                        >
                          {isResettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.resetPasswordBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => { setResetPasswordDialog({ open: false, user: null }); setNewAdminPassword(""); }} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {idvRequestDialog.open && idvRequestDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 dark:border-accent/30 bg-accent/5 dark:bg-accent/10 shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground">{t('dashboard.admin.users.requestIdvTitle')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.users.requestIdvDesc')} {idvRequestDialog.user?.firstName} {idvRequestDialog.user?.lastName} ({idvRequestDialog.user?.email})</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setIdvRequestDialog({ open: false, user: null }); setIdvRequestNotes(""); }} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.users.idvNotes')}</Label>
                          <Textarea value={idvRequestNotes}
                            onChange={(e) => setIdvRequestNotes(e.target.value)}
                            placeholder={t('dashboard.admin.users.idvNotesPlaceholder')}
                            className="rounded-xl border-border bg-white dark:bg-card"
                            rows={3}
                            data-testid="input-idv-notes"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-accent/30 dark:border-accent/30">
                        <Button disabled={isSendingIdvRequest}
                          onClick={async () => {
                            if (!idvRequestDialog.user?.id) return;
                            setIsSendingIdvRequest(true);
                            try {
                              await apiRequest("POST", `/api/admin/users/${idvRequestDialog.user.id}/request-identity-verification`, { notes: idvRequestNotes || undefined });
                              setFormMessage({ type: 'success', text: t('dashboard.admin.users.idvRequestSent') });
                              setIdvRequestDialog({ open: false, user: null });
                              setIdvRequestNotes("");
                              queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
                            } catch {
                              setFormMessage({ type: 'error', text: t('dashboard.admin.users.idvRequestError') });
                            } finally {
                              setIsSendingIdvRequest(false);
                            }
                          }}
                          className="flex-1 bg-accent text-white font-black rounded-full"
                          data-testid="button-confirm-idv-request"
                        >
                          {isSendingIdvRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.users.sendIdvBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => { setIdvRequestDialog({ open: false, user: null }); setIdvRequestNotes(""); }} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {idvRejectDialog.open && idvRejectDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground">{t('dashboard.admin.users.rejectIdvTitle')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.users.rejectIdvDesc')} {idvRejectDialog.user?.firstName} {idvRejectDialog.user?.lastName}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setIdvRejectDialog({ open: false, user: null }); setIdvRejectReason(""); }} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.users.idvRejectReason')}</Label>
                          <Textarea value={idvRejectReason}
                            onChange={(e) => setIdvRejectReason(e.target.value)}
                            placeholder={t('dashboard.admin.users.idvRejectReasonPlaceholder')}
                            className="rounded-xl border-border bg-white dark:bg-card"
                            rows={3}
                            data-testid="input-idv-reject-reason"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-red-200 dark:border-red-800">
                        <Button disabled={isSendingIdvReject}
                          onClick={async () => {
                            if (!idvRejectDialog.user?.id) return;
                            setIsSendingIdvReject(true);
                            try {
                              await apiRequest("POST", `/api/admin/users/${idvRejectDialog.user.id}/reject-identity-verification`, { reason: idvRejectReason || undefined });
                              setFormMessage({ type: 'success', text: t('dashboard.admin.users.idvRejected') });
                              setIdvRejectDialog({ open: false, user: null });
                              setIdvRejectReason("");
                              queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
                            } catch {
                              setFormMessage({ type: 'error', text: t('common.error') });
                            } finally {
                              setIsSendingIdvReject(false);
                            }
                          }}
                          className="flex-1 bg-red-600 text-white font-black rounded-full"
                          data-testid="button-confirm-idv-reject"
                        >
                          {isSendingIdvReject ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.admin.users.rejectIdvBtn')}
                        </Button>
                        <Button variant="outline" onClick={() => { setIdvRejectDialog({ open: false, user: null }); setIdvRejectReason(""); }} className="flex-1 rounded-full">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}
                  
                  {docRejectDialog.open && docRejectDialog.docId && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground">{t('dashboard.admin.documents.rejectionReasonTitle')}</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setDocRejectDialog({ open: false, docId: null }); setDocRejectReason(""); }} className="rounded-full" data-testid="button-close-doc-reject">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <Textarea value={docRejectReason}
                          onChange={(e) => setDocRejectReason(e.target.value)}
                          placeholder={t('dashboard.admin.documents.rejectionReasonPlaceholder')}
                          className="rounded-xl border-border bg-white dark:bg-card"
                          rows={3}
                          data-testid="input-doc-reject-reason"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                        <Button
                          disabled={!docRejectReason.trim()}
                          onClick={async () => {
                            if (!docRejectDialog.docId || !docRejectReason.trim()) {
                              setFormMessage({ type: 'error', text: t('dashboard.admin.documents.rejectionReasonRequired') });
                              return;
                            }
                            try {
                              await apiRequest("PATCH", `/api/admin/documents/${docRejectDialog.docId}/review`, { reviewStatus: 'rejected', rejectionReason: docRejectReason });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                              setFormMessage({ type: 'success', text: t("dashboard.toasts.statusUpdated") });
                              setDocRejectDialog({ open: false, docId: null });
                              setDocRejectReason("");
                            } catch { setFormMessage({ type: 'error', text: t("common.error") }); }
                          }}
                          variant="destructive"
                          className="flex-1 font-black rounded-full"
                          data-testid="button-confirm-doc-reject"
                        >
                          {t('dashboard.admin.documents.confirmReject')}
                        </Button>
                        <Button variant="outline" onClick={() => { setDocRejectDialog({ open: false, docId: null }); setDocRejectReason(""); }} className="flex-1 rounded-full" data-testid="button-cancel-doc-reject">{t('common.cancel')}</Button>
                      </div>
                    </Card>
                  )}

                  {adminSubTab === 'dashboard' && (
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
                  )}
                  
                  {adminSubTab === 'orders' && (
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
                  )}
                  {adminSubTab === 'communications' && (
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
                  )}
                  {adminSubTab === 'incomplete' && (
                    <AdminIncompletePanel
                      incompleteApps={incompleteApps}
                      onDelete={(params) => deleteIncompleteAppMutation.mutate(params)}
                      isDeleting={deleteIncompleteAppMutation.isPending}
                    />
                  )}
                  {adminSubTab === 'users' && (
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
                  )}
                  {adminSubTab === 'calendar' && (
                    <AdminCalendarPanel
                      adminOrders={adminOrders || []}
                      updateLlcDatesMutation={updateLlcDatesMutation}
                      setFormMessage={setFormMessage}
                      showConfirm={showConfirm}
                    />
                  )}
                  {adminSubTab === 'docs' && (
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
                  )}
                  {adminSubTab === 'billing' && (
                    <AdminBillingPanel
                      billingSubTab={billingSubTab}
                      setBillingSubTab={setBillingSubTab}
                      adminInvoices={adminInvoices || []}
                      paymentAccountsList={paymentAccountsList || []}
                      refetchPaymentAccounts={refetchPaymentAccounts}
                      setFormMessage={setFormMessage}
                      showConfirm={showConfirm}
                    />
                  )}


                  {adminSubTab === 'activity' && (
                    <ActivityLogPanel />
                  )}

                  {adminSubTab === 'roles' && (
                    <AdminRolesPanel />
                  )}

                  {adminSubTab === 'descuentos' && (
                    <AdminDiscountsPanel
                      discountCodes={discountCodes}
                      refetchDiscountCodes={refetchDiscountCodes}
                      setFormMessage={setFormMessage}
                      setNewDiscountCode={setNewDiscountCode}
                      setDiscountCodeDialog={setDiscountCodeDialog}
                      showConfirm={showConfirm}
                    />
                  )}
                </div>
              )}
            </div>

          <div className="space-y-6 order-1 xl:order-2 self-start">
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
                                ? `${orders[0]?.application?.companyName} LLC`
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
