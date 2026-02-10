import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { formatDate, formatDateShort, formatDateLong, formatDateCompact, getLocale } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getCsrfToken } from "@/lib/queryClient";
import { Building2, FileText, Clock, ChevronRight, User as UserIcon, Package, CreditCard, PlusCircle, Download, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, ShieldCheck, Users, Edit, Edit2, Trash2, FileUp, Newspaper, Loader2, CheckCircle, Receipt, Plus, Calendar, DollarSign, BarChart3, UserCheck, Eye, Upload, XCircle, Tag, X, Calculator, Archive, Key, Search, LogOut, ShieldAlert, ClipboardList, Bell, Globe } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { SocialLogin } from "@/components/auth/social-login";
import { LLCProgressWidget } from "@/components/llc-progress-widget";
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
import { NotificationsTab } from "@/components/dashboard/notifications-tab";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { ConsultationsTab } from "@/components/dashboard/consultations-tab";
import { AdminConsultationsPanel } from "@/components/dashboard/admin-consultations-panel";
import { AdminAccountingPanel } from "@/components/dashboard/admin-accounting-panel";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingScreen } from "@/components/loading-screen";


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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  usePageTitle();
  const tabFromUrl = new URLSearchParams(searchString).get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabFromUrl || (user?.isAdmin ? 'admin' : 'services'));
  const initialTabApplied = useRef(false);

  useEffect(() => {
    if (tabFromUrl && !initialTabApplied.current) {
      setActiveTab(tabFromUrl);
      initialTabApplied.current = true;
    }
  }, [tabFromUrl]);
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
  
  // Only allow profile editing for active and VIP accounts
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
  const [adminSubTab, setAdminSubTab] = useState(user?.isSupport && !user?.isAdmin ? "orders" : "dashboard");
  const [commSubTab, setCommSubTab] = useState<'inbox' | 'agenda'>('inbox');
  const [usersSubTab, setUsersSubTab] = useState<'users' | 'newsletter'>('users');
  const [billingSubTab, setBillingSubTab] = useState<'invoices' | 'accounting' | 'payment-methods'>('invoices');
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminSearchFilter, setAdminSearchFilter] = useState<'all' | 'name' | 'email' | 'date' | 'invoiceId'>('all');
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

  const updateProfile = useMutation({
    retry: false,
    mutationFn: async (data: typeof profileData) => {
      setFormMessage(null);
      if (!canEdit) {
        throw new Error(t("dashboard.toasts.cannotModifyAccountState"));
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
      if (!profileOtp || profileOtp.length !== 6) throw new Error("Invalid OTP code");
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
      if (!res.ok) throw new Error("Failed to cancel");
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
        throw new Error(err.message || "Error");
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
    refetchInterval: 30000,
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
    refetchInterval: 30000,
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

  const { data: adminOrders } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin || !!user?.isSupport,
    staleTime: 1000 * 60 * 2,
  });

  const { data: incompleteApps } = useQuery<{ llc: any[]; maintenance: any[] }>({
    queryKey: ["/api/admin/incomplete-applications"],
    enabled: !!user?.isAdmin,
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

  const { data: adminUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
    staleTime: 1000 * 60 * 3,
  });

  const { data: adminNewsletterSubs, refetch: refetchNewsletterSubs } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletter"],
    enabled: !!user?.isAdmin,
  });

  const { data: adminDocuments } = useQuery<any[]>({
    queryKey: ["/api/admin/documents"],
    enabled: !!user?.isAdmin || !!user?.isSupport,
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminInvoices } = useQuery<any[]>({
    queryKey: ["/api/admin/invoices"],
    enabled: !!user?.isAdmin,
    refetchInterval: 30000,
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
    enabled: !!user?.isAdmin,
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminMessages } = useQuery<any[]>({
    queryKey: ["/api/admin/messages"],
    enabled: !!user?.isAdmin || !!user?.isSupport,
  });

  const { data: discountCodes, refetch: refetchDiscountCodes } = useQuery<DiscountCode[]>({
    queryKey: ["/api/admin/discount-codes"],
    enabled: !!user?.isAdmin,
  });

  const { data: guestVisitors, refetch: refetchGuests } = useQuery({
    queryKey: ['/api/admin/guests'],
    enabled: !!user?.isAdmin,
  });

  const { data: paymentAccountsList, refetch: refetchPaymentAccounts } = useQuery<any[]>({
    queryKey: ['/api/admin/payment-accounts'],
    enabled: !!user?.isAdmin,
  });
  const [paymentAccountDialog, setPaymentAccountDialog] = useState<{ open: boolean; account: any | null }>({ open: false, account: null });
  const [paymentAccountForm, setPaymentAccountForm] = useState({
    label: '', holder: '', bankName: '', accountType: 'checking',
    accountNumber: '', routingNumber: '', iban: '', swift: '', address: '', isActive: true, sortOrder: 0,
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
    mutationFn: async ({ appId, field, value }: { appId: number, field: string, value: string }) => {
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
  const [inlineEditOrderId, setInlineEditOrderId] = useState<number | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Record<string, string>>({});
  const [generateInvoiceDialog, setGenerateInvoiceDialog] = useState<{ open: boolean; order: any }>({ open: false, order: null });
  const [orderInvoiceAmount, setOrderInvoiceAmount] = useState("");
  const [orderInvoiceCurrency, setOrderInvoiceCurrency] = useState("EUR");
  
  const inlineEditOrderMutation = useMutation({
    mutationFn: async ({ orderId, data }: { orderId: number; data: Record<string, string> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.amount) payload.amount = parseFloat(data.amount);
      const res = await apiRequest("PATCH", `/api/admin/orders/${orderId}/inline`, payload);
      if (!res.ok) throw new Error("Could not update order");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.changesSaved") });
      setInlineEditOrderId(null);
      setInlineEditData({});
    },
    onError: () => {
      setFormMessage({ type: 'error', text: t("common.error") });
    }
  });

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
    ];
    return allItems.filter(item => isAdmin || !item.adminOnly);
  }, [t, isAdmin]);

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;
  const sidebarMainItems = useMemo(() => {
    if (isAdmin) return adminMenuItems;
    return userMenuItems.filter(item => item.id !== 'profile');
  }, [isAdmin, adminMenuItems, userMenuItems]);
  
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

  const filteredAdminOrders = useMemo(() => {
    if (!adminSearchQuery.trim() || !adminOrders) return adminOrders;
    const query = adminSearchQuery.toLowerCase().trim();
    return adminOrders.filter((order: any) => {
      const app = order.application || order.maintenanceApplication;
      const fields: Record<string, string> = {
        name: ((order.user?.firstName || '') + ' ' + (order.user?.lastName || '')).toLowerCase(),
        email: (order.user?.email || '').toLowerCase(),
        date: order.createdAt ? formatDateShort(order.createdAt) : '',
        dateLong: order.createdAt ? formatDateLong(order.createdAt) : '',
        invoiceId: (order.invoiceNumber || '').toLowerCase(),
        orderId: (order.id?.toString() || ''),
        requestCode: (app?.requestCode || '').toLowerCase(),
        clientId: (order.user?.clientId || '').toLowerCase(),
        companyName: (app?.companyName || '').toLowerCase(),
      };
      return matchesFilter(fields, query, adminSearchFilter);
    });
  }, [adminOrders, adminSearchQuery, adminSearchFilter]);

  const filteredAdminUsers = useMemo(() => {
    if (!adminSearchQuery.trim() || !adminUsers) return adminUsers;
    const query = adminSearchQuery.toLowerCase().trim();
    return adminUsers.filter((u: any) => {
      const fields: Record<string, string> = {
        name: ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase(),
        email: (u.email || '').toLowerCase(),
        date: u.createdAt ? formatDateShort(u.createdAt) : '',
        clientId: (u.clientId || '').toLowerCase(),
        orderId: (u.id?.toString() || ''),
        invoiceId: '',
        phone: (u.phone || '').toLowerCase(),
      };
      return matchesFilter(fields, query, adminSearchFilter);
    });
  }, [adminUsers, adminSearchQuery, adminSearchFilter]);

  const filteredAdminMessages = useMemo(() => {
    if (!adminSearchQuery.trim() || !adminMessages) return adminMessages;
    const query = adminSearchQuery.toLowerCase().trim();
    return adminMessages.filter((msg: any) => {
      const fields: Record<string, string> = {
        name: (msg.name || '').toLowerCase(),
        email: (msg.email || '').toLowerCase(),
        date: msg.createdAt ? formatDateShort(msg.createdAt) : '',
        invoiceId: (msg.messageId || '').toLowerCase(),
        orderId: '',
        subject: (msg.subject || '').toLowerCase(),
      };
      return matchesFilter(fields, query, adminSearchFilter);
    });
  }, [adminMessages, adminSearchQuery, adminSearchFilter]);

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

  if (authLoading || !isAuthenticated) {
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

        {/* Main content area */}
        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
      <main className={`${activeTab === 'services' ? 'pt-8 sm:pt-10 lg:pt-14' : 'pt-6 sm:pt-10'} pb-20 ${isAdmin ? 'px-3 md:px-4 lg:px-4 xl:px-5' : 'px-5 md:px-8 max-w-7xl mx-auto lg:mx-0 lg:max-w-none lg:px-10'}`}>

        {/* Mobile Navigation - Horizontal scroll buttons (ABOVE welcome on mobile) */}
        <div className="flex flex-col gap-2 mb-4 lg:hidden">
          <div className="flex overflow-x-auto pb-3 gap-2 no-scrollbar mobile-tab-bar -mx-5 px-5 pl-5 sm:pl-5">
            {isAdmin ? (
              adminMenuItems.map((item: any) => {
                const isActive = activeTab === 'admin' && adminSubTab === item.subTab;
                return (
                  <Button key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => { setActiveTab('admin' as Tab); setAdminSubTab(item.subTab); }}
                    size="sm"
                    className={`flex items-center gap-1.5 rounded-full font-black text-xs tracking-normal whitespace-nowrap shrink-0 h-10 px-5 transition-all duration-200 animate-press ${
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
                    size="sm"
                    className={`flex items-center gap-1.5 rounded-full font-black text-xs tracking-normal whitespace-nowrap shrink-0 h-10 px-5 transition-all duration-200 animate-press ${
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

        <header className={`${activeTab === 'services' ? 'mb-4 md:mb-6' : 'mb-2 md:mb-4'} animate-fade-in-up`}>
          {activeTab === 'services' && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-lg sm:text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
                {t('dashboard.welcome', { name: (user?.firstName || t('dashboard.defaultName')).charAt(0).toUpperCase() + (user?.firstName || t('dashboard.defaultName')).slice(1).toLowerCase() })}
              </h1>
              <p className="text-muted-foreground text-base md:text-lg mt-1 md:mt-2">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>
          )}

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
                  className="shrink-0 bg-accent hover:bg-accent/90 text-white font-black rounded-full h-9 px-4"
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
                  : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              }`} data-testid="form-message">
                {formMessage.text}
              </div>
            )}
            <div className={`flex flex-col ${isAdmin ? '' : 'xl:grid xl:grid-cols-3'} gap-6 lg:gap-8`}>
              <div className={`${isAdmin ? '' : 'xl:col-span-2'} space-y-6 ${isAdmin ? '' : 'order-2 xl:order-1'}`}>
            
              {activeTab === 'services' && (
                <>
                <ServicesTab 
                  orders={orders} 
                  draftOrders={draftOrders} 
                  activeOrders={activeOrders} 
                />
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
                      <a href="https://es.trustpilot.com/review/easyusllc.com" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-full whitespace-nowrap" size="sm" data-testid="button-trustpilot-review">
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
                <div key="documents" className="space-y-6">
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.documents.title')}</h2>
                    <p className="text-base text-muted-foreground mt-1">{t('dashboard.documents.subtitle')}</p>
                  </div>
                  
                  {(() => {
                    const actionRequiredNotifs = notifications?.filter((n: any) => n.type === 'action_required') || [];
                    const docInReviewNotifs = notifications?.filter((n: any) => n.type === 'info' && (n.title || '').includes('docInReview')) || [];
                    const hasActionRequired = actionRequiredNotifs.length > 0;
                    const hasDocInReview = docInReviewNotifs.length > 0;
                    
                    if ((hasActionRequired || hasDocInReview) && user?.accountStatus !== 'deactivated') {
                      return (
                        <Card className={`rounded-2xl shadow-sm p-4 mb-4 ${hasActionRequired ? 'border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30' : 'border-2 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30'}`} data-testid="card-doc-action-required">
                          <div className="flex items-start gap-3">
                            {hasActionRequired ? (
                              <FileUp className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                            ) : (
                              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              {hasActionRequired ? (
                                <>
                                  <h4 className="font-black text-foreground text-sm">{t('dashboard.documents.requestedDocuments')}</h4>
                                  <div className="mt-2 space-y-1">
                                    {actionRequiredNotifs.map((n: any) => (
                                      <p key={n.id} className="text-xs text-muted-foreground">{tn(n.message)}</p>
                                    ))}
                                  </div>
                                  <div className="mt-3">
                                    <label className="cursor-pointer">
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setUploadDialog({ open: false, file });
                                            setUploadDocType("other");
                                            setUploadNotes("");
                                          }
                                        }}
                                        data-testid="input-upload-document"
                                      />
                                      <Button variant="outline" className="rounded-full text-xs border-accent/50 dark:border-accent text-accent dark:text-accent" asChild>
                                        <span><FileUp className="w-3 h-3 mr-1" /> {t('dashboard.documents.uploadDocument')}</span>
                                      </Button>
                                    </label>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <h4 className="font-black text-foreground text-sm">{t('dashboard.documents.underReview')}</h4>
                                  <p className="text-xs text-muted-foreground mt-2">{t('dashboard.documents.underReviewDesc')}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Subir documento inline sin dialogo */}
                  <Card className="rounded-2xl border-2 border-dashed border-accent/50 bg-accent/5 p-4 md:p-6 mb-4">
                    {!uploadDialog.file ? (
                      <label className="cursor-pointer w-full block">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadDialog({ open: false, file });
                              setUploadDocType("passport");
                              setUploadNotes("");
                            }
                          }}
                          data-testid="input-upload-new-document"
                        />
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                            <Upload className="w-7 h-7 md:w-8 md:h-8 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-foreground text-base md:text-lg">{t('dashboard.documents.uploadDocument')}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.documents.maxSize')}</p>
                          </div>
                          <Button size="lg" className="rounded-full font-black bg-accent text-primary shrink-0" asChild>
                            <span>
                              <FileUp className="w-5 h-5 md:mr-2" />
                              <span className="hidden md:inline">{t('dashboard.documents.uploadButton')}</span>
                            </span>
                          </Button>
                        </div>
                      </label>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1A1A1A] rounded-xl">
                          <FileUp className="w-8 h-8 text-accent shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-foreground">{uploadDialog.file.name}</p>
                            <p className="text-xs text-muted-foreground">{(uploadDialog.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setUploadDialog({ open: false, file: null })}
                            className="shrink-0 text-muted-foreground hover:text-red-500"
                            data-testid="button-clear-file"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-2 block">{t('dashboard.documents.documentType')}</Label>
                          <NativeSelect 
                            value={uploadDocType} 
                            onValueChange={setUploadDocType}
                            className="w-full rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="select-upload-doc-type-inline"
                          >
                            <NativeSelectItem value="passport">{t('dashboard.documents.passport')}</NativeSelectItem>
                            <NativeSelectItem value="address_proof">{t('dashboard.documents.addressProof')}</NativeSelectItem>
                            <NativeSelectItem value="tax_id">{t('dashboard.documents.taxId')}</NativeSelectItem>
                            <NativeSelectItem value="other">{t('dashboard.documents.otherDocument')}</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        
                        {uploadDocType === "other" && (
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-2 block">{t('dashboard.documents.description')}</Label>
                            <Textarea value={uploadNotes} 
                              onChange={(e) => setUploadNotes(e.target.value)} 
                              placeholder={t('dashboard.documents.describePlaceholder')}
                              className="min-h-[70px] rounded-2xl border-border bg-background dark:bg-[#1A1A1A] text-base"
                              style={{ fontSize: '16px' }}
                              data-testid="input-upload-notes-inline"
                            />
                          </div>
                        )}
                        
                        <Button onClick={async () => {
                            if (!uploadDialog.file) return;
                            const formData = new FormData();
                            formData.append('file', uploadDialog.file);
                            formData.append('documentType', uploadDocType);
                            if (uploadDocType === 'other' && uploadNotes) {
                              formData.append('notes', uploadNotes);
                            }
                            try {
                              const csrfToken = await getCsrfToken();
                              const res = await fetch('/api/user/documents/upload', {
                                method: 'POST',
                                headers: { 'X-CSRF-Token': csrfToken },
                                body: formData,
                                credentials: 'include'
                              });
                              if (res.ok) {
                                setFormMessage({ type: 'success', text: t("dashboard.toasts.documentUploadedClient") + ". " + t("dashboard.toasts.documentUploadedClientDesc") });
                                queryClient.invalidateQueries({ queryKey: ['/api/user/documents'] });
                                setUploadDialog({ open: false, file: null });
                              } else {
                                const data = await res.json();
                                setFormMessage({ type: 'error', text: t("common.error") + ". " + (data.message || t("dashboard.toasts.couldNotUpload")) });
                              }
                            } catch {
                              setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.connectionError") });
                            }
                          }}
                          disabled={uploadDocType === 'other' && !uploadNotes.trim()}
                          className="w-full bg-accent text-accent-foreground font-black rounded-full h-12"
                          data-testid="button-send-document"
                        >
                          <Send className="w-4 h-4 mr-2" /> {t('dashboard.documents.sendDocument')}
                        </Button>
                      </div>
                    )}
                  </Card>
                  
                  {userDocuments && userDocuments.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-foreground">{t('dashboard.documents.myDocuments')}</h3>
                      {userDocuments.map((doc: any) => {
                        const docTypeLabels: Record<string, string> = {
                          passport: t('dashboard.documents.passport'),
                          address_proof: t('dashboard.documents.addressProof'),
                          tax_id: t('dashboard.documents.taxId'),
                          articles_of_organization: t('dashboard.documents.articlesOfOrg'),
                          ein_letter: t('dashboard.documents.einLetter'),
                          operating_agreement: t('dashboard.documents.operatingAgreement'),
                          other: t('dashboard.documents.otherDocument'),
                        };
                        const statusConfig: Record<string, { label: string; className: string }> = {
                          pending: { label: t('dashboard.documents.statusPending'), className: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' },
                          approved: { label: t('dashboard.documents.statusApproved'), className: 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent' },
                          rejected: { label: t('dashboard.documents.statusRejected'), className: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
                        };
                        const status = statusConfig[doc.reviewStatus] || statusConfig.pending;
                        const isApproved = doc.reviewStatus === 'approved';
                        const isRejected = doc.reviewStatus === 'rejected';
                        
                        return (
                          <Card key={doc.id} className="rounded-xl md:rounded-2xl border-0 shadow-sm bg-white dark:bg-card" data-testid={`card-document-${doc.id}`}>
                            <CardContent className="p-4 md:p-5">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="font-black text-foreground text-xs sm:text-sm truncate">{doc.fileName}</h4>
                                    <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate text-[10px] font-bold shrink-0 ${status.className}`}>
                                      {status.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground mb-2 flex-wrap">
                                    <span>{docTypeLabels[doc.documentType] || doc.documentType}</span>
                                    <span>{formatDate(doc.uploadedAt || doc.createdAt)}</span>
                                    {doc.uploader && (
                                      <span className="text-accent">{doc.uploader.firstName} {doc.uploader.lastName}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Button variant="outline" size="sm" className="rounded-full font-bold text-[10px] md:text-xs" onClick={() => window.open(doc.fileUrl, "_blank")} data-testid={`button-download-doc-${doc.id}`}>
                                      <Download className="w-3 h-3 mr-1" /> {t('dashboard.documents.download')}
                                    </Button>
                                    {isRejected && canEdit && (
                                      <label className="cursor-pointer">
                                        <input 
                                          type="file" 
                                          className="hidden" 
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('documentType', doc.documentType);
                                            try {
                                              const csrfToken = await getCsrfToken();
                                              const res = await fetch('/api/user/documents/upload', {
                                                method: 'POST',
                                                headers: { 'X-CSRF-Token': csrfToken },
                                                body: formData,
                                                credentials: 'include'
                                              });
                                              if (res.ok) {
                                                setFormMessage({ type: 'success', text: t("dashboard.toasts.documentUploadedClient") });
                                                queryClient.invalidateQueries({ queryKey: ['/api/user/documents'] });
                                              } else {
                                                setFormMessage({ type: 'error', text: t("dashboard.toasts.couldNotUpload") });
                                              }
                                            } catch {
                                              setFormMessage({ type: 'error', text: t("dashboard.toasts.connectionError") });
                                            }
                                          }}
                                          data-testid={`input-reupload-doc-${doc.id}`}
                                        />
                                        <Button variant="outline" size="sm" className="rounded-full font-bold text-[10px] md:text-xs border-accent/50 dark:border-accent text-accent dark:text-accent" asChild>
                                          <span><Upload className="w-3 h-3 mr-1" /> {t('dashboard.documents.uploadAgain')}</span>
                                        </Button>
                                      </label>
                                    )}
                                    {user?.isAdmin && (
                                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground shrink-0" onClick={() => deleteDocMutation.mutate(doc.id)} disabled={deleteDocMutation.isPending} data-testid={`button-delete-doc-${doc.id}`}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}


              {activeTab === 'payments' && (
                <div key="payments" className="space-y-6">
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.payments.title')}</h2>
                    <p className="text-base text-muted-foreground mt-1">{t('dashboard.payments.subtitle')}</p>
                  </div>

                  {clientInvoices && clientInvoices.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-black tracking-tight">{t('dashboard.payments.invoiceLabel')}</h3>
                      {clientInvoices.map((inv: any) => {
                        const currencySymbol = inv.currency === 'USD' ? '$' : '€';
                        const statusMap: Record<string, { label: string; color: string }> = {
                          pending: { label: t('dashboard.payments.pending'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
                          paid: { label: t('dashboard.payments.paid'), color: 'bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent' },
                          completed: { label: t('dashboard.payments.completed'), color: 'bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent' },
                          cancelled: { label: t('dashboard.payments.cancelled'), color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
                          refunded: { label: t('dashboard.payments.refunded'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
                        };
                        const st = statusMap[inv.status] || statusMap.pending;
                        return (
                          <Card key={inv.id} className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card" data-testid={`invoice-client-${inv.id}`}>
                            <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-xs md:text-sm">{inv.invoiceNumber}</span>
                                  <Badge className={`text-[10px] no-default-hover-elevate no-default-active-elevate ${st.color}`}>{st.label}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{inv.concept}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)} | {(inv.amount / 100).toFixed(2)} {currencySymbol}</p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                {inv.fileUrl && (
                                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => window.open(`/api/user/invoices/${inv.id}/download`, '_blank')} data-testid={`button-view-client-invoice-${inv.id}`}>
                                    {t('dashboard.payments.invoice')}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-4">
                    {(!orders || orders.length === 0) && (!clientInvoices || clientInvoices.length === 0) ? (
                      <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="widget-payments-empty">
                        <div className="flex flex-col items-center gap-3 md:gap-4">
                          <CreditCard className="w-12 h-12 md:w-16 md:h-16 text-accent" />
                          <div>
                            <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.payments.empty')}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.payments.emptyDesc')}</p>
                          </div>
                          <Link href="/servicios#pricing">
                            <Button className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-view-services">
                              {t('dashboard.payments.viewServices')}
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ) : orders && orders.length > 0 ? (
                      orders.map((order: any) => (
                        <Card key={order.id} className="rounded-2xl border-0 shadow-sm p-6 flex justify-between items-center bg-white dark:bg-card">
                          <div>
                            <p className="font-black text-xs md:text-sm">{t('dashboard.payments.invoiceLabel')} {order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}>{t('dashboard.payments.invoice')}</Button>
                          </div>
                        </Card>
                      ))
                    ) : null}
                  </div>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div key="calendar" className="space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
                    <div>
                      <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.calendar.title')}</h2>
                      <p className="text-base text-muted-foreground mt-1">{t('dashboard.calendar.subtitle')}</p>
                    </div>
                  </div>
                  {orders && orders.length > 0 ? (
                    <div className="space-y-4 md:space-y-6">
                      {orders.map((order: any) => {
                        const app = order.application;
                        if (!app) return null;
                        const isCancelled = order.status === 'cancelled';
                        const isInReview = ['pending', 'paid', 'processing'].includes(order.status);
                        const stateHasAnnualReport = ['Wyoming', 'Delaware', 'WY', 'DE'].includes(app.state);
                        const dates = [
                          { label: t('dashboard.calendar.creation'), fullLabel: t('dashboard.calendar.creationFull'), date: app.llcCreatedDate, icon: Building2, bgColor: 'bg-accent/10', textColor: 'text-accent', borderColor: 'border-accent/20' },
                          { label: t('dashboard.calendar.agent'), fullLabel: t('dashboard.calendar.agentFull'), date: app.agentRenewalDate, icon: UserCheck, bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-800' },
                          { label: 'IRS 1120', fullLabel: t('dashboard.calendar.irs1120'), date: app.irs1120DueDate, icon: FileText, bgColor: 'bg-accent/5 dark:bg-accent/10', textColor: 'text-accent dark:text-accent', borderColor: 'border-accent/30 dark:border-accent/30' },
                          { label: 'IRS 5472', fullLabel: t('dashboard.calendar.irs5472'), date: app.irs5472DueDate, icon: FileText, bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-600 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-800' },
                          ...(stateHasAnnualReport ? [{ label: t('dashboard.calendar.annual'), fullLabel: `${t('dashboard.calendar.annualFull')} ${app.state}`, date: app.annualReportDueDate, icon: Newspaper, bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-800' }] : []),
                        ];
                        const hasDates = dates.some(d => d.date);
                        const sortedDates = dates.filter(d => d.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        const nextDeadline = sortedDates.find(d => new Date(d.date) > new Date());
                        
                        return (
                          <Card key={order.id} className={`rounded-xl md:rounded-2xl border shadow-sm bg-white dark:bg-card overflow-hidden ${isCancelled ? 'opacity-50' : ''}`}>
                            <CardHeader className="p-3 md:p-4 pb-2 md:pb-3 border-b bg-muted/30">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <CardTitle className="text-sm md:text-base font-black flex items-center gap-2 flex-wrap">
                                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm md:text-base">{app.companyName || t('dashboard.llcStatus.inProcess')}</span>
                                    <span className="text-[10px] md:text-xs font-normal text-muted-foreground">{app.state}</span>
                                  </div>
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isCancelled && <Badge variant="destructive" className="text-[9px] md:text-[10px]">{t('dashboard.calendar.cancelled')}</Badge>}
                                  {isInReview && <Badge className="text-[9px] md:text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{t('dashboard.calendar.inReview')}</Badge>}
                                  {!isCancelled && !isInReview && nextDeadline && (
                                    <Badge className={`text-[9px] md:text-[10px] ${nextDeadline.bgColor} ${nextDeadline.textColor}`}>
                                      {t('dashboard.calendar.next')}: {nextDeadline.label}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4">
                              {isCancelled ? (
                                <div className="text-center py-6 md:py-8">
                                  <XCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto text-red-300 mb-2 md:mb-3" />
                                  <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.llcStatus.cancelled')}</p>
                                </div>
                              ) : isInReview ? (
                                <div className="text-center py-6 md:py-8">
                                  <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto text-yellow-400 mb-2 md:mb-3" />
                                  <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.llcStatus.inProcess')}</p>
                                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{t('dashboard.llcStatus.datesWillAppear')}</p>
                                </div>
                              ) : hasDates ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                                  {sortedDates.map((item, idx) => {
                                    const date = new Date(item.date);
                                    const now = new Date();
                                    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    const isPast = date < now;
                                    const isUrgent = !isPast && daysUntil <= 30;
                                    const isWarning = !isPast && daysUntil <= 60 && daysUntil > 30;
                                    const IconComponent = item.icon;
                                    
                                    return (
                                      <div 
                                        key={idx} 
                                        className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border ${item.borderColor} ${item.bgColor} transition-all hover:shadow-md`}
                                      >
                                        <div className={`flex items-center gap-1.5 md:gap-2 mb-2 ${item.textColor}`}>
                                          <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                          <span className="font-bold text-[10px] md:text-xs truncate">{item.label}</span>
                                        </div>
                                        <div className="font-black text-xs md:text-sm text-foreground">
                                          {formatDateCompact(date)}
                                        </div>
                                        <div className="text-[9px] md:text-[10px] text-muted-foreground">
                                          {date.getFullYear()}
                                        </div>
                                        {isPast ? (
                                          <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3 text-accent" />
                                            <span className="text-[9px] md:text-[10px] text-accent dark:text-accent font-medium">{t('dashboard.calendar.completed')}</span>
                                          </div>
                                        ) : isUrgent ? (
                                          <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3 text-red-500" />
                                            <span className="text-[9px] md:text-[10px] text-red-600 dark:text-red-400 font-bold">{daysUntil} {t('dashboard.calendar.days')}</span>
                                          </div>
                                        ) : isWarning ? (
                                          <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-accent" />
                                            <span className="text-[9px] md:text-[10px] text-accent dark:text-accent font-medium">{daysUntil} {t('dashboard.calendar.days')}</span>
                                          </div>
                                        ) : (
                                          <div className="mt-1.5 md:mt-2">
                                            <span className="text-[9px] md:text-[10px] text-muted-foreground">{daysUntil} {t('dashboard.calendar.days')}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-6 md:py-8">
                                  <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto opacity-30 mb-2 md:mb-3 text-muted-foreground" />
                                  <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.calendar.pendingDates')}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="widget-calendar-empty">
                      <div className="flex flex-col items-center gap-3 md:gap-4">
                        <Calendar className="w-12 h-12 md:w-16 md:h-16 text-accent" />
                        <div>
                          <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.calendar.title')}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.calendar.emptyDescription')}</p>
                        </div>
                        <Link href="/servicios#pricing">
                          <Button className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-start-llc-calendar">
                            {t('dashboard.calendar.createLlc')}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'tools' && (
                <div key="tools" className="space-y-6">
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.tools.title')}</h2>
                    <p className="text-base text-muted-foreground mt-1">{t('dashboard.tools.subtitle')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Receipt className="w-6 h-6 text-accent" />
                          <h3 className="font-black text-foreground tracking-tight">{t('dashboard.clientTools.invoiceGenerator')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.invoiceDescription')}</p>
                        <Link href="/tools/invoice">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-full" size="sm" data-testid="button-invoice-generator">
                            {t('dashboard.clientTools.createInvoice')} <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                    
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calculator className="w-6 h-6 text-accent" />
                          <h3 className="font-black text-foreground tracking-tight">{t('dashboard.clientTools.priceCalculator')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.calculatorDescription')}</p>
                        <Link href="/tools/price-calculator">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-full" size="sm" data-testid="button-price-calculator">
                            {t('dashboard.clientTools.calculate')} <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                    
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <ClipboardList className="w-6 h-6 text-accent" />
                          <h3 className="font-black text-foreground tracking-tight">{t('dashboard.clientTools.operatingAgreement')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.operatingDescription')}</p>
                        <Link href="/tools/operating-agreement">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-full" size="sm" data-testid="button-operating-agreement">
                            {t('dashboard.clientTools.generateDocument')} <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                    
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-6 h-6 text-accent" />
                          <h3 className="font-black text-foreground tracking-tight">{t('tools.csvGenerator.toolTitle')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('tools.csvGenerator.toolDescription')}</p>
                        <Link href="/tools/csv-generator">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-full" size="sm" data-testid="button-csv-generator">
                            {t('tools.csvGenerator.openTool')} <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </div>
                </div>
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
                            className="rounded-xl text-center text-2xl font-black border-border bg-background dark:bg-[#1A1A1A] h-14 tracking-[0.5em]"
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
                    <div className="flex items-center gap-2 w-full">
                      <div className="shrink-0 w-32">
                        <NativeSelect
                          value={adminSearchFilter}
                          onValueChange={(val) => setAdminSearchFilter(val as typeof adminSearchFilter)}
                          className="rounded-full h-11 text-sm border-border bg-white dark:bg-[#1A1A1A]"
                          data-testid="select-admin-search-filter"
                        >
                          <option value="all">{t('dashboard.admin.searchFilters.all')}</option>
                          <option value="name">{t('dashboard.admin.searchFilters.name')}</option>
                          <option value="email">{t('dashboard.admin.searchFilters.email')}</option>
                          <option value="date">{t('dashboard.admin.searchFilters.date')}</option>
                          <option value="invoiceId">{t('dashboard.admin.searchFilters.invoiceId')}</option>
                        </NativeSelect>
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input placeholder={t('dashboard.admin.searchPlaceholder')}
                          value={adminSearchQuery}
                          onChange={(e) => setAdminSearchQuery(e.target.value)}
                          className="pl-10 pr-12 h-11 rounded-full text-sm bg-white dark:bg-[#1A1A1A] border-border w-full"
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
                      <Button
                        className="h-11 rounded-full bg-accent text-primary font-black shrink-0 px-5"
                        data-testid="button-admin-search"
                      >
                        <Search className="w-4 h-4 mr-1" />
                        {t('dashboard.admin.search')}
                      </Button>
                    </div>
                    {isAdmin && (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" className={`rounded-full text-xs font-black shadow-sm border ${createUserDialog ? 'bg-accent text-accent-foreground border-accent' : 'bg-white dark:bg-[#1A1A1A] border-accent/50'}`} onClick={() => setCreateUserDialog(!createUserDialog)} data-testid="button-create-user">
                        <Plus className="w-3 h-3 mr-1" />
                        {t('dashboard.admin.newClient')}
                      </Button>
                      <Button variant="ghost" size="sm" className={`rounded-full text-xs font-black shadow-sm border ${createOrderDialog ? 'bg-accent text-accent-foreground border-accent' : 'bg-white dark:bg-[#1A1A1A] border-accent/50'}`} onClick={() => setCreateOrderDialog(!createOrderDialog)} data-testid="button-create-order">
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
                            <Input value={newUserData.firstName} onChange={e => setNewUserData(p => ({ ...p, firstName: e.target.value }))} placeholder={t('dashboard.admin.firstName')} className="rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-firstname" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.lastName')}</Label>
                            <Input value={newUserData.lastName} onChange={e => setNewUserData(p => ({ ...p, lastName: e.target.value }))} placeholder={t('dashboard.admin.lastName')} className="rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-lastname" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.email')}</Label>
                          <Input type="email" value={newUserData.email} onChange={e => setNewUserData(p => ({ ...p, email: e.target.value }))} placeholder={t('dashboard.admin.email')} className="rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-email" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.phone')}</Label>
                          <Input value={newUserData.phone} onChange={e => setNewUserData(p => ({ ...p, phone: e.target.value }))} placeholder="+34 600 000 000" className="rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-phone" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.password')}</Label>
                          <Input type="password" value={newUserData.password} onChange={e => setNewUserData(p => ({ ...p, password: e.target.value }))} placeholder={t('dashboard.admin.minChars')} className="rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-password" />
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
                            className="w-full rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                            className="w-full rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                              className="rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
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
                              className="w-full rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                          <Input type="number" value={newOrderData.amount} onChange={e => setNewOrderData(p => ({ ...p, amount: e.target.value }))} placeholder="899" className="rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-order-amount" />
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
                          <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder={t('dashboard.admin.messageTitlePlaceholder')} className="w-full rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-note-title" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.message')}</Label>
                          <Textarea value={noteMessage} onChange={e => setNoteMessage(e.target.value)} placeholder={t('dashboard.admin.messagePlaceholder')} rows={4} className="w-full rounded-2xl border-border bg-background dark:bg-[#1A1A1A]" data-testid="input-note-message" />
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
                            <Input value={editingUser.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-firstname" />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.lastName')}</Label>
                            <Input value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-lastname" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.email')}</Label>
                          <Input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-email" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.phone')}</Label>
                          <Input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-phone" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.idType')}</Label>
                            <NativeSelect 
                              value={editingUser.idType || ''} 
                              onValueChange={val => setEditingUser({...editingUser, idType: val})}
                              placeholder={t('dashboard.admin.select')}
                              className="w-full rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]"
                            >
                              <NativeSelectItem value="dni">DNI</NativeSelectItem>
                              <NativeSelectItem value="nie">NIE</NativeSelectItem>
                              <NativeSelectItem value="passport">{t('dashboard.admin.passport')}</NativeSelectItem>
                            </NativeSelect>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.idNumber')}</Label>
                            <Input value={editingUser.idNumber || ''} onChange={e => setEditingUser({...editingUser, idNumber: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-idnumber" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.birthDate')}</Label>
                          <Input type="date" value={editingUser.birthDate || ''} onChange={e => setEditingUser({...editingUser, birthDate: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-birthdate" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.businessActivity')}</Label>
                          <NativeSelect 
                            value={editingUser.businessActivity || ''} 
                            onValueChange={val => setEditingUser({...editingUser, businessActivity: val})}
                            placeholder={t("common.select")}
                            className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]"
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
                          <Input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} placeholder={t('dashboard.admin.streetAndNumber')} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-address" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.city')}</Label>
                            <Input value={editingUser.city || ''} onChange={e => setEditingUser({...editingUser, city: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-city" />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.postalCode')}</Label>
                            <Input value={editingUser.postalCode || ''} onChange={e => setEditingUser({...editingUser, postalCode: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-postal" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.province')}</Label>
                            <Input value={editingUser.province || ''} onChange={e => setEditingUser({...editingUser, province: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-province" />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.country')}</Label>
                            <Input value={editingUser.country || ''} onChange={e => setEditingUser({...editingUser, country: e.target.value})} className="rounded-full h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-country" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">{t('dashboard.admin.internalNotes')}</Label>
                          <Textarea value={editingUser.internalNotes || ''} onChange={e => setEditingUser({...editingUser, internalNotes: e.target.value})} rows={2} className="rounded-2xl border-border bg-background dark:bg-[#1A1A1A] text-sm" data-testid="input-edit-notes" />
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
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-blue-700 dark:text-blue-300">{t('dashboard.admin.supportPermissions')}</p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-400">{t('dashboard.admin.supportPermissionsDesc')}</p>
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
                            className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
                            placeholder="899.00"
                            data-testid="input-invoice-amount"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.currency')}</Label>
                          <NativeSelect 
                            value={orderInvoiceCurrency} 
                            onValueChange={setOrderInvoiceCurrency}
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                          >
                            <NativeSelectItem value="passport">{t('dashboard.admin.docPassport')}</NativeSelectItem>
                            <NativeSelectItem value="address_proof">{t('dashboard.admin.docAddressProof')}</NativeSelectItem>
                            <NativeSelectItem value="tax_id">{t('dashboard.admin.docTaxId')}</NativeSelectItem>
                            <NativeSelectItem value="other">{t('dashboard.admin.docOther')}</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.message')}</Label>
                          <Textarea value={docMessage} onChange={e => setDocMessage(e.target.value)} placeholder={t('dashboard.admin.messageForClient')} rows={3} className="w-full rounded-2xl border-border bg-background dark:bg-[#1A1A1A]" data-testid="input-doc-message" />
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
                            className="w-full rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                              className="w-full rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                              data-testid="input-invoice-amount"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.currencyLabel')}</Label>
                            <NativeSelect 
                              value={invoiceCurrency} 
                              onValueChange={setInvoiceCurrency}
                              className="w-full rounded-full h-11 px-3 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                              className="w-full rounded-full h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                                className={`rounded-full text-xs ${invoicePaymentAccountIds.includes(acct.id) ? 'bg-accent text-black' : ''}`}
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
                            className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border uppercase bg-white dark:bg-[#1A1A1A]" 
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
                              className="w-full rounded-xl h-11 px-3 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
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
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
                              data-testid="input-discount-min-amount" 
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.maxUses')}</Label>
                            <Input type="number" 
                              value={newDiscountCode.maxUses} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, maxUses: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
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
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
                              data-testid="input-discount-valid-from" 
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.validUntil')}</Label>
                            <Input type="date" 
                              value={newDiscountCode.validUntil} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, validUntil: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
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
                            className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="input-payment-link-url"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.paymentAmount')}</Label>
                          <Input value={paymentLinkAmount}
                            onChange={(e) => setPaymentLinkAmount(e.target.value)}
                            placeholder={t('dashboard.admin.paymentAmountPlaceholder')}
                            className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="input-payment-link-amount"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">{t('dashboard.admin.paymentMessage')}</Label>
                          <Textarea value={paymentLinkMessage}
                            onChange={(e) => setPaymentLinkMessage(e.target.value)}
                            placeholder={t('dashboard.admin.paymentMessagePlaceholder')}
                            className="rounded-xl border-border bg-background dark:bg-[#1A1A1A]"
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
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                            <div className={`p-4 border-2 border-dashed rounded-xl text-center ${adminDocFile ? 'border-accent bg-accent/5' : 'border-gray-200 dark:border-border'}`}>
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
                            className="rounded-xl h-12 border-border bg-background dark:bg-[#1A1A1A]"
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
                    <div className="space-y-5 md:space-y-7" data-testid="admin-dashboard-metrics">
                      <div data-testid="section-sales">
                        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-sales">{t('dashboard.admin.metrics.sales')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold leading-tight mb-2">{t('dashboard.admin.metrics.totalSales')}</p>
                            <p className="text-lg md:text-2xl font-black text-blue-800 dark:text-blue-300 truncate" data-testid="stat-total-sales">{((adminStats?.totalSales || 0) / 100).toLocaleString(getLocale(), { style: 'currency', currency: 'EUR' })}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold leading-tight mb-2">{t('dashboard.admin.metrics.pendingCollection')}</p>
                            <p className="text-lg md:text-2xl font-black text-blue-800 dark:text-blue-300 truncate" data-testid="stat-pending-sales">{((adminStats?.pendingSales || 0) / 100).toLocaleString(getLocale(), { style: 'currency', currency: 'EUR' })}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold leading-tight mb-2">{t('dashboard.admin.metrics.totalOrders')}</p>
                            <p className="text-lg md:text-2xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-total-orders">{adminStats?.orderCount || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold leading-tight mb-2">{t('dashboard.admin.metrics.conversion')}</p>
                            <p className="text-lg md:text-2xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-conversion">{adminStats?.conversionRate || 0}%</p>
                          </Card>
                        </div>
                      </div>

                      <div data-testid="section-orders">
                        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-orders">{t('dashboard.admin.metrics.orderStatus')}</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('dashboard.admin.metrics.pending')}</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-pending-orders">{adminStats?.pendingOrders || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('dashboard.admin.metrics.inProcess')}</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-processing-orders">{adminStats?.processingOrders || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('dashboard.admin.metrics.completed')}</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-completed-orders">{adminStats?.completedOrders || 0}</p>
                          </Card>
                        </div>
                      </div>

                      <div data-testid="section-crm">
                        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-crm">{t('dashboard.admin.metrics.clients')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold mb-2">{t('dashboard.admin.metrics.totalUsers')}</p>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-total-users">{adminStats?.userCount || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('dashboard.admin.metrics.active')}</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-active-users">{adminStats?.activeAccounts || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">VIP</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-vip-users">{adminStats?.vipAccounts || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('dashboard.admin.metrics.inReview')}</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-pending-accounts">{adminStats?.pendingAccounts || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('dashboard.admin.metrics.deactivated')}</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-deactivated-users">{adminStats?.deactivatedAccounts || 0}</p>
                          </Card>
                        </div>
                      </div>

                      <div data-testid="section-guests">
                        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-guests">{t('dashboard.admin.guestSection.guests')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold mb-2">{t('dashboard.admin.guestSection.totalVisitors')}</p>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-total-guests">{(guestVisitors as any[])?.length || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold mb-2">{t('dashboard.admin.guestSection.withEmail')}</p>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-guests-with-email">{(guestVisitors as any[])?.filter((g: any) => g.email)?.length || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold mb-2">{t('dashboard.admin.guestSection.calculator')}</p>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-calculator-guests">{(guestVisitors as any[])?.filter((g: any) => g.source === 'calculator')?.length || 0}</p>
                          </Card>
                        </div>
                        <Card className="rounded-xl border border-border/50 shadow-sm mt-3 p-0 overflow-hidden">
                          <div className="divide-y max-h-80 overflow-y-auto">
                            {(guestVisitors as any[])?.slice(0, 30)?.map((guest: any) => {
                              let meta: any = null;
                              try {
                                if (guest.metadata) {
                                  meta = typeof guest.metadata === 'string' ? JSON.parse(guest.metadata) : guest.metadata;
                                }
                              } catch {}
                              return (
                              <div key={guest.id} className="px-4 py-3 flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-bold truncate">{guest.email || '-'}</p>
                                    {guest.source === 'calculator' && (
                                      <Badge className="text-[8px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{t('dashboard.admin.guestSection.calculator')}</Badge>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {guest.source !== 'calculator' && <>{t(`dashboard.admin.guestSection.${guest.source}`, guest.source)} · </>}{guest.page || '-'} · {guest.createdAt ? formatDate(guest.createdAt) : ''}
                                  </p>
                                  {meta && guest.source === 'calculator' && (
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                      {meta.income && (
                                        <span className="text-[9px] bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent px-1.5 py-0.5 rounded-full font-medium">
                                          ${Number(meta.income).toLocaleString('en-US')}
                                        </span>
                                      )}
                                      {meta.country && (
                                        <span className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium">
                                          {meta.country}
                                        </span>
                                      )}
                                      {meta.activity && (
                                        <span className="text-[9px] bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent px-1.5 py-0.5 rounded-full font-medium">
                                          {meta.activity}
                                        </span>
                                      )}
                                      {meta.savings !== undefined && meta.savings !== 0 && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${meta.savings > 0 ? 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                          {meta.savings > 0 ? '+' : ''}{t('dashboard.admin.guestSection.savingsLabel')}: ${Math.abs(meta.savings).toLocaleString('en-US')}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive shrink-0"
                                  onClick={() => {
                                    showConfirm({
                                      title: t('common.confirmAction'),
                                      description: t('dashboard.admin.guestSection.confirmDelete'),
                                      onConfirm: async () => {
                                        try {
                                          await apiRequest("DELETE", `/api/admin/guests/${guest.id}`);
                                          refetchGuests();
                                        } catch (e) {
                                          setFormMessage({ type: 'error', text: t("common.error") });
                                        }
                                      },
                                    });
                                  }}
                                  data-testid={`button-delete-guest-${guest.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            );})}
                            {(!guestVisitors || (guestVisitors as any[]).length === 0) && (
                              <p className="text-sm text-muted-foreground py-4 text-center">{t('dashboard.admin.guestSection.noGuests')}</p>
                            )}
                          </div>
                        </Card>
                      </div>

                      <div data-testid="section-communications">
                        <h3 className="font-black text-lg tracking-tight mb-3" data-testid="heading-communications">{t('dashboard.admin.metrics.communications')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold mb-2">{t('dashboard.admin.metrics.newsletterSubs')}</p>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-subscribers">{adminStats?.subscriberCount || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold mb-2">{t('dashboard.admin.metrics.totalMessages')}</p>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-total-messages">{adminStats?.totalMessages || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('dashboard.admin.metrics.pendingMessages')}</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-pending-messages">{adminStats?.pendingMessages || 0}</p>
                          </Card>
                          <Card className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                              <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('dashboard.admin.metrics.pendingDocs')}</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-800 dark:text-blue-300" data-testid="stat-pending-docs">{adminStats?.pendingDocs || 0}</p>
                          </Card>
                        </div>
                      </div>

                    </div>
                  )}
                  
                  {adminSubTab === 'orders' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
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
                                    onValueChange={val => updateStatusMutation.mutate({ id: order.id, status: val })}
                                    className="w-28 h-7 rounded-lg text-xs bg-white dark:bg-card border px-2"
                                  >
                                    <NativeSelectItem value="pending">{t('dashboard.admin.orders.pending')}</NativeSelectItem>
                                    <NativeSelectItem value="paid">{t('dashboard.admin.orders.paid')}</NativeSelectItem>
                                    <NativeSelectItem value="filed">{t('dashboard.admin.orders.filed')}</NativeSelectItem>
                                    <NativeSelectItem value="cancelled">{t('dashboard.admin.orders.cancelled')}</NativeSelectItem>
                                  </NativeSelect>
                                  <Badge className={`text-[9px] ${isMaintenance ? 'bg-blue-100 text-blue-700' : 'bg-accent/10 text-accent'}`}>
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
                              <Button size="sm" className="rounded-full text-xs bg-accent hover:bg-accent/90 text-black" onClick={() => {
                                setOrderInvoiceAmount(((order.amount || 0) / 100).toFixed(2));
                                setOrderInvoiceCurrency("EUR");
                                setGenerateInvoiceDialog({ open: true, order });
                              }} data-testid={`btn-generate-invoice-${order.id}`}>
                                {t('dashboard.admin.orders.generateInvoice')}
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full text-xs text-red-600 border-red-200" onClick={() => setDeleteOrderConfirm({ open: true, order })} data-testid={`btn-delete-order-${order.id}`}>
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
                                  className="rounded-full text-xs bg-accent text-black"
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
                    </Card>
                  )}
                  {adminSubTab === 'communications' && (
                    <div className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={commSubTab === 'inbox' ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-full text-xs font-black ${commSubTab === 'inbox' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => setCommSubTab('inbox')}
                          data-testid="button-comm-inbox"
                        >
                          {t('dashboard.admin.communicationsSubTabs.inbox')}
                        </Button>
                        <Button
                          variant={commSubTab === 'agenda' ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-full text-xs font-black ${commSubTab === 'agenda' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => setCommSubTab('agenda')}
                          data-testid="button-comm-agenda"
                        >
                          {t('dashboard.admin.communicationsSubTabs.agenda')}
                        </Button>
                      </div>
                      {commSubTab === 'inbox' && (
                        <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                          <div className="divide-y">
                            {filteredAdminMessages?.map((msg: any) => (
                              <div 
                                key={msg.id} 
                                className="p-4 space-y-2 hover:bg-accent/5 cursor-pointer transition-colors"
                                onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                                data-testid={`inbox-message-${msg.id}`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-black text-xs md:text-sm">{msg.firstName} {msg.lastName}</p>
                                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{msg.email}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Badge variant="outline" className="text-[8px] md:text-[10px] hidden md:inline-flex">{msg.messageId || msg.id}</Badge>
                                    <Badge variant={msg.status === 'archived' ? 'secondary' : 'default'} className="text-[8px] md:text-[10px]">{msg.status === 'archived' ? t('dashboard.admin.inboxSection.archived') : msg.status || t('dashboard.admin.inboxSection.pendingStatus')}</Badge>
                                    {msg.status !== 'archived' && (
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground hover:text-foreground" 
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await apiRequest("PATCH", `/api/admin/messages/${msg.id}/archive`);
                                            queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
                                            setFormMessage({ type: 'success', text: t("dashboard.toasts.messageArchived") });
                                          } catch { setFormMessage({ type: 'error', text: t("common.error") }); }
                                        }}
                                        data-testid={`btn-archive-msg-${msg.id}`}
                                        title={t('dashboard.admin.documents.archive')}
                                      >
                                        <Archive className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                      </Button>
                                    )}
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-6 w-6 md:h-7 md:w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        showConfirm({
                                          title: t('common.confirmAction'),
                                          description: t('dashboard.admin.inboxSection.confirmDeleteMsg'),
                                          onConfirm: async () => {
                                            try {
                                              await apiRequest("DELETE", `/api/admin/messages/${msg.id}`);
                                              queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
                                              setFormMessage({ type: 'success', text: t("dashboard.toasts.messageDeleted") });
                                            } catch { setFormMessage({ type: 'error', text: t("common.error") }); }
                                          },
                                        });
                                      }}
                                      data-testid={`btn-delete-msg-${msg.id}`}
                                    >
                                      <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs font-medium">{msg.subject}</p>
                                <p className="text-xs text-muted-foreground">{msg.message}</p>
                                
                                {msg.replies && msg.replies.length > 0 && (
                                  <div className="pl-4 border-l-2 border-accent/30 space-y-2 mt-3">
                                    {msg.replies.map((reply: any) => (
                                      <div key={reply.id} className="text-xs">
                                        <span className={`font-semibold ${reply.isAdmin ? 'text-accent' : 'text-muted-foreground'}`}>
                                          {reply.isAdmin ? t('dashboard.admin.inboxSection.adminLabel') : t('dashboard.admin.inboxSection.clientLabel')}:
                                        </span>
                                        <span className="ml-2">{reply.content}</span>
                                        <span className="text-[10px] text-muted-foreground ml-2">
                                          {reply.createdAt && new Date(reply.createdAt).toLocaleString(getLocale())}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                <p className="text-[10px] text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleString(getLocale()) : ''}</p>
                                
                                {selectedMessage?.id === msg.id && (
                                  <div className="space-y-2 pt-3 border-t mt-2" onClick={(e) => e.stopPropagation()}>
                                    <Textarea value={replyContent} 
                                      onChange={(e) => setReplyContent(e.target.value)} 
                                      placeholder={t('dashboard.admin.inboxSection.replyPlaceholder')} 
                                      className="rounded-2xl min-h-[80px] text-sm"
                                      data-testid="input-admin-reply"
                                    />
                                    <Button onClick={() => sendReplyMutation.mutate(msg.id)} 
                                      disabled={!replyContent.trim() || sendReplyMutation.isPending} 
                                      className="bg-accent text-accent-foreground font-black rounded-full px-6"
                                      data-testid="button-send-admin-reply"
                                    >
                                      {sendReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                      {t('dashboard.admin.inboxSection.sendReply')}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                            {(!filteredAdminMessages || filteredAdminMessages.length === 0) && (
                              <div className="text-center py-8 text-muted-foreground text-sm">{t('dashboard.admin.inboxSection.noMessages')}</div>
                            )}
                          </div>
                        </Card>
                      )}
                      {commSubTab === 'agenda' && (
                        <AdminConsultationsPanel searchQuery={adminSearchQuery} />
                      )}
                    </div>
                  )}
                  {adminSubTab === 'incomplete' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                      <div className="p-4 border-b bg-gradient-to-r from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/15">
                        <h3 className="font-black text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          {t('dashboard.admin.incomplete.title')} ({(incompleteApps?.llc?.length || 0) + (incompleteApps?.maintenance?.length || 0)})
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{t('dashboard.admin.incomplete.autoDeleteNotice')}</p>
                      </div>
                      <div className="divide-y">
                        {[...(incompleteApps?.llc || []), ...(incompleteApps?.maintenance || [])].map((app: any) => {
                          const hoursRemaining = app.abandonedAt 
                            ? Math.max(0, Math.round(48 - ((Date.now() - new Date(app.abandonedAt).getTime()) / 3600000))) 
                            : null;
                          return (
                            <div key={`${app.type}-${app.id}`} className="p-4 space-y-2" data-testid={`incomplete-app-${app.type}-${app.id}`}>
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <Badge className={`text-[9px] ${app.type === 'maintenance' ? 'bg-blue-100 text-blue-700' : 'bg-accent/10 text-accent'}`}>
                                      {app.type === 'maintenance' ? t('dashboard.admin.orders.maintenance') : 'LLC'}
                                    </Badge>
                                    <Badge className="text-[9px] bg-accent/10 text-accent">{t('dashboard.admin.incomplete.incomplete')}</Badge>
                                    {hoursRemaining !== null && (
                                      <Badge className="text-[9px] bg-red-100 text-red-700">
                                        {hoursRemaining > 0 ? t('dashboard.admin.incomplete.deleteInHours', { hours: hoursRemaining }) : t('dashboard.admin.incomplete.deletionPending')}
                                      </Badge>
                                    )}
                                  </div>
                                  {app.ownerFullName && <p className="text-sm font-bold">{app.ownerFullName}</p>}
                                  {app.ownerEmail && <p className="text-xs text-muted-foreground">{app.ownerEmail}</p>}
                                  {app.ownerPhone && <p className="text-xs text-muted-foreground">{app.ownerPhone}</p>}
                                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                    {app.companyName && <p><strong>{t('dashboard.admin.orders.company')}:</strong> {app.companyName}</p>}
                                    {app.state && <p><strong>{t('dashboard.admin.orders.stateLabel')}:</strong> {app.state}</p>}
                                    {app.remindersSent > 0 && <p><strong>{t('dashboard.admin.incomplete.reminders')}:</strong> {app.remindersSent}/3 {t('dashboard.admin.incomplete.sent')}</p>}
                                    {app.lastUpdated && <p><strong>{t('dashboard.admin.incomplete.lastActivity')}:</strong> {new Date(app.lastUpdated).toLocaleString(getLocale())}</p>}
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-full text-xs text-red-600 border-red-200"
                                  onClick={() => deleteIncompleteAppMutation.mutate({ type: app.type, id: app.id })}
                                  disabled={deleteIncompleteAppMutation.isPending}
                                  data-testid={`btn-delete-incomplete-${app.type}-${app.id}`}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  {t('dashboard.admin.delete')}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {(!incompleteApps?.llc?.length && !incompleteApps?.maintenance?.length) && (
                          <div className="p-8 text-center text-muted-foreground">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent" />
                            <p className="text-sm font-medium">{t('dashboard.admin.incomplete.noIncomplete')}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'users' && (
                    <div className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={usersSubTab === 'users' ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-full text-xs font-black ${usersSubTab === 'users' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => setUsersSubTab('users')}
                          data-testid="button-users-subtab-users"
                        >
                          {t('dashboard.admin.tabs.clients')}
                        </Button>
                        <Button
                          variant={usersSubTab === 'newsletter' ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-full text-xs font-black ${usersSubTab === 'newsletter' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => setUsersSubTab('newsletter')}
                          data-testid="button-users-subtab-newsletter"
                        >
                          {t('dashboard.admin.clientsSubTabs.newsletter')}
                        </Button>
                      </div>
                      {usersSubTab === 'users' && (
                        <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                          <div className="divide-y">
                            {filteredAdminUsers?.map(u => (
                              <div key={u.id} className="p-3 md:p-4 space-y-3">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-black text-sm">{u.firstName} {u.lastName}</p>
                                    <Badge className={`text-[9px] rounded-full ${u.accountStatus === 'deactivated' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700' : u.accountStatus === 'vip' ? 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent dark:border-accent' : u.accountStatus === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700' : 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent dark:border-accent'}`}>
                                      {u.accountStatus === 'active' ? t('dashboard.admin.users.verified') : u.accountStatus === 'pending' ? t('dashboard.admin.users.inReview') : u.accountStatus === 'deactivated' ? t('dashboard.admin.users.deactivated') : u.accountStatus === 'vip' ? 'VIP' : t('dashboard.admin.users.verified')}
                                    </Badge>
                                    {u.isAdmin && <Badge className="text-[9px] rounded-full bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent dark:border-accent">ADMIN</Badge>}
                                    {u.isSupport && !u.isAdmin && <Badge className="text-[9px] rounded-full bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent dark:border-accent">{t('dashboard.admin.users.supportBadge')}</Badge>}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                    {u.clientId && (
                                      <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full" data-testid={`text-client-id-${u.id}`}>{u.clientId}</span>
                                    )}
                                    {(u as any).preferredLanguage && (
                                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-muted-foreground border border-border" data-testid={`text-lang-${u.id}`}>{(u as any).preferredLanguage}</span>
                                    )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{u.email}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {u.phone && <span className="mr-2">{u.phone}</span>}
                                    {u.businessActivity && <span className="mr-2">• {u.businessActivity}</span>}
                                    {u.city && <span>• {u.city}</span>}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                                    {u.lastLoginIp && (
                                      <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                                        <span className="font-medium">IP:</span> {u.lastLoginIp}
                                      </span>
                                    )}
                                    {typeof u.loginCount === 'number' && (
                                      <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                                        <span className="font-medium">Logins:</span> {u.loginCount}
                                      </span>
                                    )}
                                    {u.securityOtpRequired && (
                                      <span className="flex items-center gap-1 bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                        {t('dashboard.admin.users.otpRequired')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="w-full">
                                    <Label className="text-[10px] text-muted-foreground mb-1 block">{t('dashboard.admin.users.accountStatus')}</Label>
                                    <NativeSelect 
                                      value={u.accountStatus || 'active'} 
                                      onValueChange={val => u.id && updateUserMutation.mutate({ id: u.id, accountStatus: val as any })}
                                      className="w-full h-9 rounded-full text-xs bg-white dark:bg-card border shadow-sm px-3"
                                    >
                                      <NativeSelectItem value="active">{t('dashboard.admin.users.verifiedStatus')}</NativeSelectItem>
                                      <NativeSelectItem value="pending">{t('dashboard.admin.users.inReviewStatus')}</NativeSelectItem>
                                      <NativeSelectItem value="deactivated">{t('dashboard.admin.users.deactivatedStatus')}</NativeSelectItem>
                                      <NativeSelectItem value="vip">VIP</NativeSelectItem>
                                    </NativeSelect>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setEditingUser(u)} data-testid={`button-edit-user-${u.id}`}>
                                    {t('dashboard.admin.users.edit')}
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setResetPasswordDialog({ open: true, user: u })} data-testid={`button-reset-pwd-${u.id}`}>
                                    <Key className="w-3 h-3 mr-1" />{t('dashboard.admin.users.passwordBtn')}
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => { setIdvRequestDialog({ open: true, user: u }); setIdvRequestNotes(""); }} data-testid={`button-request-idv-${u.id}`}>
                                    <ShieldCheck className="w-3 h-3 mr-1" />{t('dashboard.admin.users.requestIdvBtn')}
                                  </Button>
                                  {(u as any).identityVerificationStatus === 'uploaded' && (
                                    <>
                                      <Button size="sm" className="rounded-full text-xs bg-accent text-white" 
                                        disabled={isApprovingIdv}
                                        onClick={async () => {
                                          setIsApprovingIdv(true);
                                          try {
                                            await apiRequest("POST", `/api/admin/users/${u.id}/approve-identity-verification`);
                                            setFormMessage({ type: 'success', text: t('dashboard.admin.users.idvApproved') });
                                            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
                                          } catch { setFormMessage({ type: 'error', text: t('common.error') }); }
                                          finally { setIsApprovingIdv(false); }
                                        }}
                                        data-testid={`button-approve-idv-${u.id}`}>
                                        <CheckCircle className="w-3 h-3 mr-1" />{t('dashboard.admin.users.approveIdvBtn')}
                                      </Button>
                                      <Button size="sm" variant="outline" className="rounded-full text-xs text-red-600 border-red-200" onClick={() => { setIdvRejectDialog({ open: true, user: u }); setIdvRejectReason(""); }} data-testid={`button-reject-idv-${u.id}`}>
                                        <XCircle className="w-3 h-3 mr-1" />{t('dashboard.admin.users.rejectIdvBtn')}
                                      </Button>
                                      <a href={`/api/admin/users/${u.id}/identity-document`} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" variant="outline" className="rounded-full text-xs" data-testid={`button-view-idv-doc-${u.id}`}>
                                          <FileText className="w-3 h-3 mr-1" />{t('dashboard.admin.users.viewIdvDoc')}
                                        </Button>
                                      </a>
                                    </>
                                  )}
                                  <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setNoteDialog({ open: true, user: u })} data-testid={`button-note-user-${u.id}`}>
                                    {t('dashboard.admin.users.messageBtn')}
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setDocDialog({ open: true, user: u })} data-testid={`button-doc-user-${u.id}`}>
                                    {t('dashboard.admin.users.docsBtn')}
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setInvoiceDialog({ open: true, user: u })} data-testid={`button-invoice-user-${u.id}`}>
                                    {t('dashboard.admin.users.invoiceBtn')}
                                  </Button>
                                  <Button size="sm" className="rounded-full text-xs bg-accent hover:bg-accent/90 text-black" onClick={() => setPaymentLinkDialog({ open: true, user: u })} data-testid={`button-payment-link-${u.id}`}>
                                    {t('dashboard.admin.users.paymentBtn')}
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-full text-xs text-red-600 border-red-200" onClick={() => setDeleteConfirm({ open: true, user: u })} data-testid={`button-delete-user-${u.id}`}>
                                    {t('dashboard.admin.users.deleteBtn')}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}
                      {usersSubTab === 'newsletter' && (
                        <div className="space-y-4">
                          <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6">
                            <h4 className="font-black text-sm mb-3">{t('dashboard.admin.newsletterSection.sendNewsletter')}</h4>
                            <div className="space-y-3">
                              <Input placeholder={t('dashboard.admin.newsletterSection.subjectPlaceholder')}
                                value={broadcastSubject}
                                onChange={(e) => setBroadcastSubject(e.target.value)}
                                className="rounded-full text-sm"
                                data-testid="input-broadcast-subject"
                              />
                              <Textarea placeholder={t('dashboard.admin.newsletterSection.messagePlaceholder')}
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                className="rounded-2xl min-h-[100px] text-sm"
                                data-testid="input-broadcast-message"
                              />
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] text-muted-foreground">
                                  {t('dashboard.admin.newsletterSection.recipientCount', { count: adminNewsletterSubs?.length || 0 })}
                                </p>
                                <Button
                                  className="rounded-full text-xs font-black bg-accent text-accent-foreground px-6"
                                  disabled={!broadcastSubject.trim() || !broadcastMessage.trim() || broadcastMutation.isPending}
                                  onClick={() => broadcastMutation.mutate({ subject: broadcastSubject, message: broadcastMessage })}
                                  data-testid="button-send-broadcast"
                                >
                                  {broadcastMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                                  {t('dashboard.admin.newsletterSection.sendBroadcast')}
                                </Button>
                              </div>
                            </div>
                          </Card>
                          <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6">
                            <h4 className="font-black text-sm mb-3">{t('dashboard.admin.newsletterSection.title')} ({adminNewsletterSubs?.length || 0})</h4>
                            <div className="divide-y max-h-80 overflow-y-auto">
                              {adminNewsletterSubs?.map((sub: any) => (
                                <div key={sub.id} className="py-2 flex justify-between items-center gap-2">
                                  <span className="text-sm truncate flex-1">{sub.email}</span>
                                  <span className="text-[10px] text-muted-foreground shrink-0">{sub.subscribedAt ? formatDate(sub.subscribedAt) : ''}</span>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                                    onClick={() => {
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
                                    data-testid={`button-delete-subscriber-${sub.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                              {(!adminNewsletterSubs || adminNewsletterSubs.length === 0) && (
                                <p className="text-sm text-muted-foreground py-4 text-center">{t('dashboard.admin.newsletterSection.noSubscribers')}</p>
                              )}
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                  {adminSubTab === 'calendar' && (
                    <div className="space-y-4">
                      <h4 className="font-black text-lg">
                        {t('dashboard.admin.calendar.title')}
                      </h4>
                    <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 overflow-hidden">
                      <div className="space-y-4 md:space-y-6">
                        {adminOrders?.map((order: any) => {
                          const app = order.application;
                          if (!app) return null;
                          const fiscalOrderCode = app?.requestCode || order.invoiceNumber;
                          return (
                            <div key={order.id} className="border-2 rounded-2xl p-4 md:p-5 bg-gray-50/50 dark:bg-[#1A1A1A]/50">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                <div>
                                  <p className="font-black text-base md:text-lg">{app.companyName || t('dashboard.admin.calendar.llcPending')}</p>
                                  <p className="text-xs md:text-sm text-muted-foreground">{order.user?.firstName} {order.user?.lastName} • {app.state}</p>
                                </div>
                                <Badge variant="outline" className="text-xs w-fit">{fiscalOrderCode}</Badge>
                              </div>
                              {/* Fechas - Grid compacto en móvil */}
                              <div className="grid grid-cols-2 gap-2 md:gap-4">
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">{t('dashboard.admin.calendar.llcCreation')}</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                                    defaultValue={app.llcCreatedDate ? new Date(app.llcCreatedDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'llcCreatedDate', value: e.target.value })}
                                    data-testid={`input-llc-created-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">{t('dashboard.admin.calendar.agentRenewal')}</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                                    defaultValue={app.agentRenewalDate ? new Date(app.agentRenewalDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'agentRenewalDate', value: e.target.value })}
                                    data-testid={`input-agent-renewal-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">IRS 1120</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                                    defaultValue={app.irs1120DueDate ? new Date(app.irs1120DueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs1120DueDate', value: e.target.value })}
                                    data-testid={`input-irs1120-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">IRS 5472</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                                    defaultValue={app.irs5472DueDate ? new Date(app.irs5472DueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs5472DueDate', value: e.target.value })}
                                    data-testid={`input-irs5472-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border col-span-2">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">{t('dashboard.admin.calendar.annualReport')}</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 rounded-full"
                                    defaultValue={app.annualReportDueDate ? new Date(app.annualReportDueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'annualReportDueDate', value: e.target.value })}
                                    data-testid={`input-annual-report-${app.id}`}
                                  />
                                </div>
                              </div>
                              {/* EIN Field */}
                              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block">EIN (Employer Identification Number)</Label>
                                  <Input 
                                    type="text" 
                                    placeholder="XX-XXXXXXX"
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 font-mono rounded-full"
                                    defaultValue={app.ein || ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'ein', value: e.target.value })}
                                    data-testid={`input-ein-${app.id}`}
                                  />
                                </div>
                              </div>
                              {/* Tax Extension Toggle */}
                              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t flex items-center justify-between">
                                <div>
                                  <Label className="text-xs md:text-sm font-bold text-foreground">{t("dashboard.calendar.taxExtension.label")}</Label>
                                  <p className="text-[10px] md:text-xs text-muted-foreground">
                                    {app.hasTaxExtension 
                                      ? t("dashboard.calendar.taxExtension.datesOctober") 
                                      : t("dashboard.calendar.taxExtension.datesApril")}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant={app.hasTaxExtension ? "default" : "outline"}
                                  className={`rounded-full text-xs ${app.hasTaxExtension ? "bg-accent text-primary" : ""}`}
                                  onClick={async () => {
                                    try {
                                      const res = await apiRequest("PATCH", `/api/admin/llc/${app.id}/tax-extension`, {
                                        hasTaxExtension: !app.hasTaxExtension
                                      });
                                      if (res.ok) {
                                        queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                                        setFormMessage({ type: 'success', text: (!app.hasTaxExtension ? t("dashboard.calendar.taxExtension.activated") : t("dashboard.calendar.taxExtension.deactivated")) + ". " + !app.hasTaxExtension 
                                            ? t("dashboard.calendar.taxExtension.movedToOctober")
                                            : t("dashboard.calendar.taxExtension.movedToApril") });
                                      }
                                    } catch {
                                      setFormMessage({ type: 'error', text: t("common.error") });
                                    }
                                  }}
                                  data-testid={`button-tax-extension-${app.id}`}
                                >
                                  {app.hasTaxExtension ? t("dashboard.calendar.taxExtension.active") : t("dashboard.calendar.taxExtension.inactive")}
                                </Button>
                              </div>
                              {/* Clear Calendar Button */}
                              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t flex items-center justify-between">
                                <div>
                                  <Label className="text-xs md:text-sm font-bold text-foreground text-red-600">{t('dashboard.calendar.clearCalendar')}</Label>
                                  <p className="text-[10px] md:text-xs text-muted-foreground">
                                    {t('dashboard.calendar.clearCalendarDesc')}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => {
                                    showConfirm({
                                      title: t('common.confirmAction'),
                                      description: t('dashboard.calendar.clearCalendarConfirm'),
                                      onConfirm: async () => {
                                        try {
                                          await Promise.all([
                                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'llcCreatedDate', value: null }),
                                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'agentRenewalDate', value: null }),
                                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'irs1120DueDate', value: null }),
                                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'irs5472DueDate', value: null }),
                                            apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'annualReportDueDate', value: null }),
                                          ]);
                                          queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                                          setFormMessage({ type: 'success', text: t("dashboard.toasts.calendarCleared") + ". " + t("dashboard.toasts.calendarClearedDesc") });
                                        } catch {
                                          setFormMessage({ type: 'error', text: t("common.error") });
                                        }
                                      },
                                    });
                                  }}
                                  data-testid={`button-clear-calendar-${app.id}`}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" /> {t('dashboard.calendar.clear')}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {(!adminOrders || adminOrders.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            {t('dashboard.admin.calendar.noOrders')}
                          </div>
                        )}
                      </div>
                    </Card>
                    </div>
                  )}
                  {adminSubTab === 'docs' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg">{t('dashboard.admin.documents.title')}</h3>
                            <Badge className="bg-accent/20 text-accent">{adminDocuments?.length || 0}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{t('dashboard.admin.documents.subtitle')}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <NativeSelect
                            value=""
                            onValueChange={(orderId) => {
                              if (orderId) {
                                const order = adminOrders?.find((o: any) => o.id === Number(orderId));
                                if (order) {
                                  setAdminDocUploadDialog({ open: true, order });
                                  setAdminDocType("articles_of_organization");
                                  setAdminDocFile(null);
                                }
                              }
                            }}
                            className="h-9 text-xs rounded-full px-3 bg-accent text-primary font-bold min-w-[120px]"
                          >
                            <option value="">{t('dashboard.admin.documents.byOrder')}</option>
                            {adminOrders?.map((order: any) => (
                              <option key={order.id} value={order.id}>
                                {order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber} - {order.user?.firstName}
                              </option>
                            ))}
                          </NativeSelect>
                          <NativeSelect
                            value=""
                            onValueChange={(userId) => {
                              if (userId) {
                                const user = adminUsers?.find((u: any) => u.id === userId);
                                if (user) {
                                  setAdminDocUploadDialog({ open: true, order: { userId: user.id, user } });
                                  setAdminDocType("other");
                                  setAdminDocFile(null);
                                }
                              }
                            }}
                            className="h-9 text-xs rounded-full px-3 bg-primary text-white font-bold min-w-[120px]"
                          >
                            <option value="">{t('dashboard.admin.documents.byUser')}</option>
                            {adminUsers?.map((user: any) => (
                              <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </option>
                            ))}
                          </NativeSelect>
                        </div>
                      </div>

                      {filteredAdminDocuments && filteredAdminDocuments.length > 0 ? (
                        <div className="space-y-3">
                          {filteredAdminDocuments.map((doc: any) => {
                            const docTypeKey = doc.documentType ? `ntf.docTypes.${doc.documentType}` : '';
                            const translatedDocType = docTypeKey ? t(docTypeKey) : '';
                            const docTypeLabel = translatedDocType && translatedDocType !== docTypeKey ? translatedDocType : (doc.documentType || '').replace(/_/g, ' ');
                            const idvStatusKey = doc.user?.identityVerificationStatus || 'none';
                            const idvLabels: Record<string, string> = {
                              'none': t('dashboard.admin.documents.idvNone'),
                              'requested': t('dashboard.admin.documents.idvRequested'),
                              'uploaded': t('dashboard.admin.documents.idvUploaded'),
                              'approved': t('dashboard.admin.documents.idvApproved'),
                              'rejected': t('dashboard.admin.documents.idvRejected'),
                            };
                            return (
                            <Card key={doc.id} className="rounded-xl border-0 shadow-sm p-4" data-testid={`admin-doc-card-${doc.id}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${doc.reviewStatus === 'approved' ? 'bg-accent/10 dark:bg-accent/15' : doc.reviewStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                                  <FileText className={`w-5 h-5 ${doc.reviewStatus === 'approved' ? 'text-accent dark:text-accent' : doc.reviewStatus === 'rejected' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-black text-sm truncate">{doc.fileName}</p>
                                    <Badge variant="outline" className={`text-[9px] shrink-0 ${doc.reviewStatus === 'approved' ? 'bg-accent/5 text-accent border-accent/30 dark:bg-accent/10 dark:text-accent dark:border-accent/30' : doc.reviewStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'}`}>
                                      {doc.reviewStatus === 'approved' ? t('dashboard.admin.documents.approved') : doc.reviewStatus === 'rejected' ? t('dashboard.admin.documents.rejected') : t('dashboard.admin.documents.pendingStatus')}
                                    </Badge>
                                    {docTypeLabel && (
                                      <Badge variant="outline" className="text-[9px] shrink-0">{docTypeLabel}</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {doc.user && (
                                      <>
                                        <p className="text-xs text-foreground font-bold">
                                          {doc.user.firstName} {doc.user.lastName}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground">|</span>
                                        <p className="text-[10px] text-muted-foreground truncate">{doc.user.email}</p>
                                        <span className="text-[10px] text-muted-foreground">|</span>
                                        <span className="text-[10px] text-muted-foreground">{t('dashboard.admin.documents.clientId')}: {doc.user.id}</span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {doc.user && (
                                      <>
                                        <Badge variant="outline" className={`text-[9px] no-default-hover-elevate no-default-active-elevate ${doc.user.emailVerified ? 'bg-accent/5 text-accent border-accent/30 dark:bg-accent/10 dark:text-accent dark:border-accent/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                                          {doc.user.emailVerified ? t('dashboard.admin.documents.emailVerified') : t('dashboard.admin.documents.emailNotVerified')}
                                        </Badge>
                                        {idvStatusKey !== 'none' && (
                                          <Badge variant="outline" className={`text-[9px] no-default-hover-elevate no-default-active-elevate ${idvStatusKey === 'approved' ? 'bg-accent/5 text-accent border-accent/30 dark:bg-accent/10 dark:text-accent dark:border-accent/30' : idvStatusKey === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'}`}>
                                            {idvLabels[idvStatusKey] || idvStatusKey}
                                          </Badge>
                                        )}
                                      </>
                                    )}
                                    {doc.application?.companyName && (
                                      <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{doc.application.companyName}</span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">{doc.uploadedAt ? formatDate(doc.uploadedAt) : '-'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <NativeSelect 
                                    value={doc.reviewStatus || 'pending'} 
                                    onValueChange={async val => {
                                      if (val === 'rejected') {
                                        setDocRejectDialog({ open: true, docId: doc.id });
                                        setDocRejectReason("");
                                        return;
                                      }
                                      try {
                                        await apiRequest("PATCH", `/api/admin/documents/${doc.id}/review`, { reviewStatus: val });
                                        queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                                        setFormMessage({ type: 'success', text: t("dashboard.toasts.statusUpdated") });
                                      } catch { setFormMessage({ type: 'error', text: t("common.error") }); }
                                    }}
                                    className="h-8 text-[10px] rounded-full px-2 max-w-[110px]"
                                  >
                                    <NativeSelectItem value="pending">{t('dashboard.admin.documents.pendingStatus')}</NativeSelectItem>
                                    <NativeSelectItem value="approved">{t('dashboard.admin.documents.approve')}</NativeSelectItem>
                                    <NativeSelectItem value="rejected">{t('dashboard.admin.documents.reject')}</NativeSelectItem>
                                  </NativeSelect>
                                  {doc.fileUrl && (
                                    <Button size="icon" variant="outline" className="rounded-full" onClick={() => window.open(doc.fileUrl, '_blank')} data-testid={`btn-view-doc-${doc.id}`}>
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                  {doc.user && (
                                    <Button size="icon" variant="outline" className="rounded-full" onClick={() => setNoteDialog({ open: true, user: doc.user })} data-testid={`btn-note-doc-${doc.id}`}>
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="icon" 
                                    variant="outline" 
                                    className="rounded-full text-red-500" 
                                    onClick={() => {
                                      showConfirm({
                                        title: t('common.confirmAction'),
                                        description: t('dashboard.admin.documents.confirmDelete'),
                                        onConfirm: async () => {
                                          try {
                                            await apiRequest("DELETE", `/api/admin/documents/${doc.id}`);
                                            queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                                            setFormMessage({ type: 'success', text: t("dashboard.toasts.documentDeleted") });
                                          } catch { setFormMessage({ type: 'error', text: t("common.error") }); }
                                        },
                                      });
                                    }}
                                    data-testid={`btn-delete-doc-${doc.id}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );})}
                        </div>
                      ) : (
                        <Card className="rounded-2xl border-0 shadow-sm p-8 md:p-12">
                          <div className="text-center space-y-1">
                            <p className="font-black text-foreground">{t('dashboard.admin.documents.noDocs')}</p>
                            <p className="text-xs text-muted-foreground">{t('dashboard.admin.documents.noDocsHint')}</p>
                          </div>
                        </Card>
                      )}
                    </div>
                  )}
                  {adminSubTab === 'billing' && (
                    <div className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={billingSubTab === 'invoices' ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-full text-xs font-black ${billingSubTab === 'invoices' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => setBillingSubTab('invoices')}
                          data-testid="button-billing-subtab-invoices"
                        >
                          {t('dashboard.admin.tabs.invoices')}
                        </Button>
                        <Button
                          variant={billingSubTab === 'accounting' ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-full text-xs font-black ${billingSubTab === 'accounting' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => setBillingSubTab('accounting')}
                          data-testid="button-billing-subtab-accounting"
                        >
                          {t('dashboard.admin.tabs.accounting')}
                        </Button>
                        <Button
                          variant={billingSubTab === 'payment-methods' ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-full text-xs font-black ${billingSubTab === 'payment-methods' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => setBillingSubTab('payment-methods')}
                          data-testid="button-billing-subtab-payment-methods"
                        >
                          {t('dashboard.admin.tabs.paymentAccounts')}
                        </Button>
                      </div>
                      {billingSubTab === 'invoices' && (
                        <div className="space-y-4" data-testid="admin-facturas-section">
                          <div className="flex justify-between items-center">
                            <h3 className="font-black text-lg">{t('dashboard.admin.invoicesSection.title')}</h3>
                          </div>
                          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                            <div className="divide-y max-h-[60vh] overflow-y-auto">
                              {adminInvoices?.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">{t('dashboard.admin.invoicesSection.noInvoices')}</div>
                              )}
                              {adminInvoices?.map((inv: any) => {
                                const currencySymbol = inv.currency === 'USD' ? '$' : '€';
                                return (
                                <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`invoice-row-${inv.id}`}>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-black text-sm">{inv.invoiceNumber}</span>
                                      <Badge variant={inv.status === 'paid' || inv.status === 'completed' ? "default" : "secondary"} className="text-[10px]">
                                        {inv.status === 'paid' ? t('dashboard.admin.invoicesSection.paid') : inv.status === 'completed' ? t('dashboard.admin.invoicesSection.completedStatus') : inv.status === 'pending' ? t('dashboard.admin.invoicesSection.pendingStatus') : inv.status === 'cancelled' ? t('dashboard.admin.invoicesSection.cancelledStatus') : inv.status === 'refunded' ? t('dashboard.admin.invoicesSection.refundedStatus') : inv.status || t('common.na')}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">{inv.concept}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {inv.user?.firstName} {inv.user?.lastName} ({inv.user?.email})
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {t('dashboard.admin.invoicesSection.amountLabel')}: {(inv.amount / 100).toFixed(2)} {currencySymbol} | 
                                      {t('dashboard.admin.invoicesSection.date')}: {inv.createdAt ? formatDate(inv.createdAt) : t('common.na')}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    <NativeSelect
                                      value={inv.status || 'pending'}
                                      onValueChange={async (newStatus) => {
                                        try {
                                          await apiRequest("PATCH", `/api/admin/invoices/${inv.id}/status`, { status: newStatus });
                                          queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
                                          setFormMessage({ type: 'success', text: t("dashboard.toasts.statusUpdated") });
                                        } catch {
                                          setFormMessage({ type: 'error', text: t("common.error") });
                                        }
                                      }}
                                      className="h-8 text-[10px] rounded-full px-2 min-w-[90px]"
                                    >
                                      <option value="pending">{t('dashboard.admin.invoicesSection.pendingStatus')}</option>
                                      <option value="paid">{t('dashboard.admin.invoicesSection.paid')}</option>
                                      <option value="completed">{t('dashboard.admin.invoicesSection.completedStatus')}</option>
                                      <option value="cancelled">{t('dashboard.admin.invoicesSection.cancelledStatus')}</option>
                                      <option value="refunded">{t('dashboard.admin.invoicesSection.refundedStatus')}</option>
                                    </NativeSelect>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="rounded-full text-xs"
                                      onClick={() => window.open(`/api/admin/invoices/${inv.id}/download`, '_blank')}
                                      data-testid={`button-view-invoice-${inv.id}`}
                                    >
                                      <Eye className="w-3 h-3 mr-1" /> {t('dashboard.admin.invoicesSection.view')}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="rounded-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                                      onClick={() => {
                                        showConfirm({
                                          title: t('common.confirmAction'),
                                          description: t('dashboard.admin.invoicesSection.confirmDeleteInvoice'),
                                          onConfirm: async () => {
                                            try {
                                              await apiRequest("DELETE", `/api/admin/invoices/${inv.id}`);
                                              queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
                                              setFormMessage({ type: 'success', text: t("dashboard.toasts.invoiceDeleted") });
                                            } catch {
                                              setFormMessage({ type: 'error', text: t("common.error") });
                                            }
                                          },
                                        });
                                      }}
                                      data-testid={`button-delete-invoice-${inv.id}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          </Card>
                        </div>
                      )}
                      {billingSubTab === 'accounting' && (
                        <AdminAccountingPanel />
                      )}
                      {billingSubTab === 'payment-methods' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <h3 className="font-black text-lg">{t('dashboard.admin.tabs.paymentAccounts')}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full text-xs font-black"
                              onClick={() => {
                                setPaymentAccountForm({
                                  label: '', holder: 'Fortuny Consulting LLC', bankName: '', accountType: 'checking',
                                  accountNumber: '', routingNumber: '', iban: '', swift: '', address: '', isActive: true, sortOrder: 0,
                                });
                                setPaymentAccountDialog({ open: true, account: null });
                              }}
                              data-testid="button-create-payment-account-billing"
                            >
                              <Plus className="w-3 h-3 mr-1" /> {t('dashboard.admin.paymentAccounts.newAccount')}
                            </Button>
                          </div>
                          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                            <div className="divide-y">
                              {paymentAccountsList?.map((acct: any) => (
                                <div key={acct.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`billing-payment-account-${acct.id}`}>
                                  <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-black text-sm">{acct.label}</span>
                                      <Badge variant={acct.isActive ? "default" : "secondary"} className="text-[10px]">
                                        {acct.isActive ? t('dashboard.admin.paymentAccounts.active') : t('dashboard.admin.paymentAccounts.inactive')}
                                      </Badge>
                                      <Badge variant="outline" className="text-[10px]">{acct.accountType}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{acct.bankName} — {acct.holder}</p>
                                    {acct.accountNumber && <p className="text-[10px] text-muted-foreground">{t('dashboard.admin.paymentAccounts.accountLabel')}: ****{acct.accountNumber.slice(-4)}</p>}
                                    {acct.iban && <p className="text-[10px] text-muted-foreground">IBAN: ****{acct.iban.slice(-4)}</p>}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="rounded-lg"
                                      onClick={() => {
                                        setPaymentAccountForm({
                                          label: acct.label, holder: acct.holder, bankName: acct.bankName,
                                          accountType: acct.accountType, accountNumber: acct.accountNumber || '',
                                          routingNumber: acct.routingNumber || '', iban: acct.iban || '',
                                          swift: acct.swift || '', address: acct.address || '',
                                          isActive: acct.isActive, sortOrder: acct.sortOrder || 0,
                                        });
                                        setPaymentAccountDialog({ open: true, account: acct });
                                      }}
                                      data-testid={`button-edit-payment-billing-${acct.id}`}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className={`rounded-lg ${acct.isActive ? 'text-red-600' : 'text-accent'}`}
                                      onClick={async () => {
                                        try {
                                          await apiRequest("PATCH", `/api/admin/payment-accounts/${acct.id}`, { isActive: !acct.isActive });
                                          refetchPaymentAccounts();
                                          setFormMessage({ type: 'success', text: acct.isActive ? t('dashboard.admin.paymentAccounts.accountDeactivated') : t('dashboard.admin.paymentAccounts.accountActivated') });
                                        } catch (e) {
                                          setFormMessage({ type: 'error', text: t("common.error") });
                                        }
                                      }}
                                      data-testid={`button-toggle-payment-billing-${acct.id}`}
                                    >
                                      {acct.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {(!paymentAccountsList || paymentAccountsList.length === 0) && (
                                <div className="text-center py-8 text-muted-foreground text-sm">{t('dashboard.admin.paymentAccounts.noAccounts')}</div>
                              )}
                            </div>
                          </Card>

                          {paymentAccountDialog.open && (
                            <Card className="rounded-2xl p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black">{paymentAccountDialog.account ? t('dashboard.admin.paymentAccounts.editAccount') : t('dashboard.admin.paymentAccounts.newBankAccount')}</h4>
                                <Button variant="ghost" size="icon" onClick={() => setPaymentAccountDialog({ open: false, account: null })} className="rounded-full">
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.label')} *</label>
                                  <Input value={paymentAccountForm.label} onChange={e => setPaymentAccountForm(f => ({...f, label: e.target.value}))} className="rounded-full text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.holder')} *</label>
                                  <Input value={paymentAccountForm.holder} onChange={e => setPaymentAccountForm(f => ({...f, holder: e.target.value}))} className="rounded-full text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.bank')} *</label>
                                  <Input value={paymentAccountForm.bankName} onChange={e => setPaymentAccountForm(f => ({...f, bankName: e.target.value}))} className="rounded-full text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.accountType')}</label>
                                  <NativeSelect value={paymentAccountForm.accountType} onValueChange={v => setPaymentAccountForm(f => ({...f, accountType: v}))}>
                                    <option value="checking">{t('dashboard.admin.paymentAccounts.checkingType')}</option>
                                    <option value="savings">{t('dashboard.admin.paymentAccounts.savingsType')}</option>
                                    <option value="iban">IBAN</option>
                                  </NativeSelect>
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.accountNumber')}</label>
                                  <Input value={paymentAccountForm.accountNumber} onChange={e => setPaymentAccountForm(f => ({...f, accountNumber: e.target.value}))} className="rounded-full text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.routingNumber')}</label>
                                  <Input value={paymentAccountForm.routingNumber} onChange={e => setPaymentAccountForm(f => ({...f, routingNumber: e.target.value}))} className="rounded-full text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">IBAN</label>
                                  <Input value={paymentAccountForm.iban} onChange={e => setPaymentAccountForm(f => ({...f, iban: e.target.value}))} className="rounded-full text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.swiftBic')}</label>
                                  <Input value={paymentAccountForm.swift} onChange={e => setPaymentAccountForm(f => ({...f, swift: e.target.value}))} className="rounded-full text-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.address')}</label>
                                  <Input value={paymentAccountForm.address} onChange={e => setPaymentAccountForm(f => ({...f, address: e.target.value}))} className="rounded-full text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground mb-1 block">{t('dashboard.admin.paymentAccounts.sortOrder')}</label>
                                  <Input type="number" value={paymentAccountForm.sortOrder} onChange={e => setPaymentAccountForm(f => ({...f, sortOrder: parseInt(e.target.value) || 0}))} className="rounded-full text-sm" />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPaymentAccountDialog({ open: false, account: null })}>
                                  {t('common.cancel')}
                                </Button>
                                <Button
                                  size="sm"
                                  className="rounded-full"
                                  disabled={!paymentAccountForm.label || !paymentAccountForm.holder || !paymentAccountForm.bankName}
                                  onClick={async () => {
                                    try {
                                      const body = { ...paymentAccountForm };
                                      if (paymentAccountDialog.account) {
                                        await apiRequest("PATCH", `/api/admin/payment-accounts/${paymentAccountDialog.account.id}`, body);
                                        setFormMessage({ type: 'success', text: t('dashboard.admin.paymentAccounts.accountUpdated') });
                                      } else {
                                        await apiRequest("POST", "/api/admin/payment-accounts", body);
                                        setFormMessage({ type: 'success', text: t('dashboard.admin.paymentAccounts.accountCreated') });
                                      }
                                      refetchPaymentAccounts();
                                      setPaymentAccountDialog({ open: false, account: null });
                                    } catch (e) {
                                      setFormMessage({ type: 'error', text: t("common.error") });
                                    }
                                  }}
                                  data-testid="button-save-payment-account-billing"
                                >
                                  {paymentAccountDialog.account ? t('common.save') : t('dashboard.admin.paymentAccounts.createAccount')}
                                </Button>
                              </div>
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  )}


                  {adminSubTab === 'activity' && (
                    <ActivityLogPanel />
                  )}

                  {adminSubTab === 'descuentos' && (
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
                      <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
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
                                  className="rounded-full text-xs h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
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
                    <div key={n.id} className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3" data-testid={`action-item-doc-review-${n.id}`}>
                      <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
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
            <Card className={`rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 ${activeTab !== 'services' ? 'hidden xl:block' : ''}`}>
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-black tracking-tight text-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" /> {t('dashboard.tracking.title')}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.tracking.subtitle')}</p>
              </div>
              <div className="space-y-5">
                {orders && orders.length > 0 ? (
                  <>
                    <div className="rounded-xl bg-gray-50 dark:bg-[#1A1A1A] p-3 mb-4">
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
            <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 mb-16 md:mb-12 text-center" data-testid="card-support-help">
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
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
