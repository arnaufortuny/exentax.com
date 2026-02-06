import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getCsrfToken } from "@/lib/queryClient";
import { Building2, FileText, Clock, ChevronRight, User as UserIcon, Package, CreditCard, PlusCircle, Download, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, Users, Edit, Edit2, Trash2, FileUp, Newspaper, Loader2, CheckCircle, Receipt, Plus, Calendar, DollarSign, BarChart3, UserCheck, Eye, Upload, XCircle, Tag, X, Calculator, Archive, Key, Search, LogOut, ShieldAlert, ClipboardList, Bell, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
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
  getOrderStatusLabel,
  NewsletterToggle 
} from "@/components/dashboard";
import { ServicesTab } from "@/components/dashboard/services-tab";
import { NotificationsTab } from "@/components/dashboard/notifications-tab";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { ConsultationsTab } from "@/components/dashboard/consultations-tab";
import { AdminConsultationsPanel } from "@/components/dashboard/admin-consultations-panel";
import { AdminAccountingPanel } from "@/components/dashboard/admin-accounting-panel";

function _NewsletterToggleLegacy() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { data: status, isLoading } = useQuery<{ isSubscribed: boolean }>({
    queryKey: ["/api/newsletter/status"],
  });

  const mutation = useMutation({
    mutationFn: async (subscribe: boolean) => {
      const endpoint = subscribe ? "/api/newsletter/subscribe" : "/api/newsletter/unsubscribe";
      await apiRequest("POST", endpoint, subscribe ? { email: undefined } : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/status"] });
      toast({ title: t("dashboard.toasts.preferencesUpdated"), description: t("dashboard.toasts.preferencesUpdatedDesc") });
    }
  });

  if (isLoading) return <div className="w-10 h-6 bg-gray-100 dark:bg-[#1A1A1A] animate-pulse rounded-full" />;

  return (
    <Switch 
      checked={status?.isSubscribed} 
      onCheckedChange={(val) => mutation.mutate(val)}
      disabled={mutation.isPending}
    />
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  usePageTitle();
  const [activeTab, setActiveTab] = useState<Tab>('services');
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
  const { toast } = useToast();
  
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
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [noteTitle, setNoteTitle] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [noteType, setNoteType] = useState("info");
  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [invoiceConcept, setInvoiceConcept] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceCurrency, setInvoiceCurrency] = useState("EUR");
  const [adminSubTab, setAdminSubTab] = useState("dashboard");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [createOrderDialog, setCreateOrderDialog] = useState(false);
  const [newOrderData, setNewOrderData] = useState({ userId: '', productId: '1', amount: '', state: 'New Mexico', orderType: 'llc' as 'llc' | 'maintenance' });
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
  const [pendingProfileData, setPendingProfileData] = useState<typeof profileData | null>(null);
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
    mutationFn: async (data: typeof profileData & { otpCode?: string }) => {
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
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === "OTP_REQUIRED") {
          setPendingProfileData(data);
          const otpRes = await apiRequest("POST", "/api/user/profile/send-otp");
          if (otpRes.ok) {
            setProfileOtpStep('otp');
            toast({ title: t("profile.otpSentTitle", "Código enviado"), description: t("profile.otpSentDesc", "Hemos enviado un código de verificación a tu email.") });
          }
          return;
        }
        throw new Error(err.message || t("dashboard.toasts.couldNotSave"));
      }
    },
    onSuccess: () => {
      if (profileOtpStep === 'idle') {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setIsEditing(false);
        toast({ title: t("dashboard.toasts.changesSaved"), description: t("dashboard.toasts.changesSavedDesc") });
      }
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    }
  });

  const confirmProfileWithOtp = useMutation({
    mutationFn: async () => {
      if (!pendingProfileData || !profileOtp) return;
      const res = await apiRequest("PATCH", "/api/user/profile", { ...pendingProfileData, otpCode: profileOtp });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("dashboard.toasts.couldNotSave"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      setProfileOtpStep('idle');
      setProfileOtp("");
      setPendingProfileData(null);
      toast({ title: t("dashboard.toasts.changesSaved"), description: t("dashboard.toasts.changesSavedDesc") });
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
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
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");

  const selectedOrderId = orders?.[0]?.id;
  const { data: selectedOrderEvents } = useQuery<any[]>({
    queryKey: ["/api/orders", selectedOrderId, "events"],
    enabled: !!selectedOrderId,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async (messageId: number) => {
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
      toast({ title: user?.isAdmin ? t("dashboard.toasts.messageReplied") : t("dashboard.toasts.messageSent"), description: user?.isAdmin ? t("dashboard.toasts.messageRepliedDesc") : t("dashboard.toasts.messageSentDesc") });
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message || t("dashboard.toasts.couldNotSend"), variant: "destructive" });
    }
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/notifications"],
    enabled: isAuthenticated,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const markNotificationRead = useMutation({
    mutationFn: async (id: string) => {
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
      const res = await apiRequest("DELETE", `/api/user/notifications/${id}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotDelete"), variant: "destructive" });
    }
  });

  const { data: adminOrders } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
    refetchInterval: 30000,
  });

  const { data: incompleteApps } = useQuery<{ llc: any[]; maintenance: any[] }>({
    queryKey: ["/api/admin/incomplete-applications"],
    enabled: !!user?.isAdmin,
    refetchInterval: 30000,
  });

  const deleteIncompleteAppMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const res = await apiRequest("DELETE", `/api/admin/incomplete-applications/${type}/${id}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/incomplete-applications"] });
      toast({ title: t("dashboard.toasts.incompleteDeleted"), description: t("dashboard.toasts.incompleteDeletedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotDelete"), variant: "destructive" });
    }
  });

  const { data: adminUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
    refetchInterval: 60000,
  });

  const { data: adminNewsletterSubs, refetch: refetchNewsletterSubs } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletter"],
    enabled: !!user?.isAdmin,
  });

  const { data: adminDocuments } = useQuery<any[]>({
    queryKey: ["/api/admin/documents"],
    enabled: !!user?.isAdmin,
    refetchInterval: 30000,
  });

  const { data: adminInvoices } = useQuery<any[]>({
    queryKey: ["/api/admin/invoices"],
    enabled: !!user?.isAdmin,
    refetchInterval: 60000,
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
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const { data: adminMessages } = useQuery<any[]>({
    queryKey: ["/api/admin/messages"],
    enabled: !!user?.isAdmin,
  });

  const { data: discountCodes, refetch: refetchDiscountCodes } = useQuery<DiscountCode[]>({
    queryKey: ["/api/admin/discount-codes"],
    enabled: !!user?.isAdmin,
  });

  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const broadcastMutation = useMutation({
    mutationFn: async ({ subject, message }: { subject: string, message: string }) => {
      const res = await apiRequest("POST", "/api/admin/newsletter/broadcast", { subject, message });
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotSend"));
    },
    onSuccess: () => {
      toast({ title: t("dashboard.toasts.emailsSent"), description: t("dashboard.toasts.emailsSentDesc") });
      setBroadcastSubject("");
      setBroadcastMessage("");
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotSend"), variant: "destructive" });
    }
  });

  const { data: userDocuments } = useQuery<any[]>({
    queryKey: ["/api/user/documents"],
    enabled: isAuthenticated,
  });

  const uploadDocMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/documents", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("dashboard.toasts.couldNotUpload"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      toast({ title: t("dashboard.toasts.documentUploaded"), description: t("dashboard.toasts.documentUploadedDesc") });
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message || t("dashboard.toasts.couldNotUpload"), variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotUpdate"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: t("dashboard.toasts.statusUpdated") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotUpdate"), variant: "destructive" });
    }
  });

  const updateLlcDatesMutation = useMutation({
    mutationFn: async ({ appId, field, value }: { appId: number, field: string, value: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/llc/${appId}/dates`, { field, value });
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotUpdate"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: t("dashboard.toasts.dateUpdated") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotUpdate"), variant: "destructive" });
    }
  });

  const sendNoteMutation = useMutation({
    mutationFn: async ({ userId, title, message, type }: { userId: string, title: string, message: string, type: string }) => {
      const res = await apiRequest("POST", "/api/admin/send-note", { userId, title, message, type });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t("dashboard.toasts.couldNotSend"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("dashboard.toasts.notesSent"), description: t("dashboard.toasts.notesSentDesc") });
      setNoteDialog({ open: false, user: null });
      setNoteTitle("");
      setNoteMessage("");
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message || t("dashboard.toasts.couldNotSend"), variant: "destructive" });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<AdminUserData> & { id: string }) => {
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
      toast({ title: t("dashboard.toasts.userUpdated") });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message || t("dashboard.toasts.couldNotUpdate"), variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t("dashboard.toasts.userDeleted") });
      setDeleteConfirm({ open: false, user: null });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotDelete"), variant: "destructive" });
    }
  });
  
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<{ open: boolean; order: any }>({ open: false, order: null });
  const [generateInvoiceDialog, setGenerateInvoiceDialog] = useState<{ open: boolean; order: any }>({ open: false, order: null });
  const [orderInvoiceAmount, setOrderInvoiceAmount] = useState("");
  const [orderInvoiceCurrency, setOrderInvoiceCurrency] = useState("EUR");
  
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      toast({ title: t("dashboard.toasts.orderDeleted"), description: t("dashboard.toasts.orderDeletedDesc") });
      setDeleteOrderConfirm({ open: false, order: null });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotDelete"), variant: "destructive" });
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async ({ userId, concept, amount, currency }: { userId: string, concept: string, amount: number, currency: string }) => {
      if (!amount || isNaN(amount) || amount < 1) {
        throw new Error(t("dashboard.toasts.invalidAmount"));
      }
      const res = await apiRequest("POST", "/api/admin/invoices/create", { userId, concept, amount, currency });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t("dashboard.toasts.couldNotCreate"));
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: t("dashboard.toasts.invoiceCreated"), description: t("dashboard.toasts.invoiceCreatedDesc", { number: data?.invoiceNumber || '' }) });
      setInvoiceDialog({ open: false, user: null });
      setInvoiceConcept("");
      setInvoiceAmount("");
      setInvoiceCurrency("EUR");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message || t("dashboard.toasts.couldNotCreate"), variant: "destructive" });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUserData) => {
      const res = await apiRequest("POST", "/api/admin/users/create", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t("dashboard.toasts.userCreated"), description: t("dashboard.toasts.userCreatedDesc") });
      setCreateUserDialog(false);
      setNewUserData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotCreate"), variant: "destructive" });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: typeof newOrderData) => {
      const { userId, state, amount, orderType } = data;
      if (!userId || !state || !amount) {
        throw new Error(t("dashboard.toasts.missingRequiredData"));
      }
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
      toast({ title: t("dashboard.toasts.orderCreated"), description: t("dashboard.toasts.orderCreatedDesc", { number: data?.invoiceNumber || '' }) });
      setCreateOrderDialog(false);
      setNewOrderData({ userId: '', productId: '1', amount: '', state: 'New Mexico', orderType: 'llc' });
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message || t("dashboard.toasts.couldNotCreate"), variant: "destructive" });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: number) => {
      const res = await apiRequest("DELETE", `/api/user/documents/${docId}`);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      toast({ title: t("dashboard.toasts.documentDeleted") });
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error?.message || t("dashboard.toasts.couldNotDelete"), variant: "destructive" });
    }
  });

  const deleteOwnAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/user/account");
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      toast({ title: t("dashboard.toasts.accountDeleted"), description: t("dashboard.toasts.accountDeletedDesc") });
      window.location.href = "/";
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotDelete"), variant: "destructive" });
    }
  });

  const requestPasswordOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/request-password-otp");
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotSend"));
    },
    onSuccess: () => {
      toast({ title: t("dashboard.toasts.codeSent"), description: t("dashboard.toasts.codeSentDesc") });
      setPasswordStep('otp');
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message || t("dashboard.toasts.couldNotSend"), variant: "destructive" });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; otp: string }) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("dashboard.toasts.couldNotUpdate"));
      }
    },
    onSuccess: () => {
      toast({ title: t("dashboard.toasts.passwordUpdated"), description: t("dashboard.toasts.passwordUpdatedDesc") });
      setShowPasswordForm(false);
      setPasswordStep('form');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOtp("");
    },
    onError: (error: any) => {
      toast({ title: t("common.error"), description: error.message || t("dashboard.toasts.couldNotUpdate"), variant: "destructive" });
    }
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.accountStatus === 'deactivated') {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="max-w-md w-full">
            <Card className="rounded-2xl sm:rounded-[2rem] border-0 shadow-2xl overflow-hidden bg-white dark:bg-card">
              <div className="bg-red-500 h-2 w-full" />
              <CardContent className="p-6 sm:p-8 md:p-12 text-center">
                <div className="flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight mb-3 sm:mb-4">
                  {t("dashboard.accountDeactivated.title")}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed mb-6 sm:mb-8">
                  {t("dashboard.accountDeactivated.message")}
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto px-8 font-black h-11 sm:h-12 rounded-full shadow-lg hover:shadow-xl transition-all"
                  onClick={() => apiRequest("POST", "/api/logout").then(() => window.location.href = "/")}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Cuenta en revisión - solo verificar email y ver notificaciones
  if (user?.accountStatus === 'pending') {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col overflow-y-auto">
        <Navbar />
        <main className="flex-1 pt-16 sm:pt-20 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full overflow-y-auto">
          <header className="mb-6 md:mb-8">
            <p className="text-accent font-bold tracking-wide text-xs md:text-sm mb-1 uppercase">{t("dashboard.clientArea")}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
              {t("dashboard.pendingAccount.hello", { name: (user?.firstName || 'Cliente').charAt(0).toUpperCase() + (user?.firstName || 'Cliente').slice(1).toLowerCase() })}
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estado de cuenta */}
            <Card className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white dark:bg-card">
              <div className={`h-1.5 w-full ${!user?.emailVerified ? 'bg-orange-500' : 'bg-amber-500'}`} />
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-900/10 dark:border-accent/30">
                  <div className="flex items-center justify-center shrink-0">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-amber-500" />
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
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="w-4 h-4 text-orange-600" />
                      <span className="font-bold text-sm text-orange-800 dark:text-orange-300">{t("dashboard.pendingAccount.verifyEmailStep")}</span>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                      {t("dashboard.pendingAccount.codeSentTo")} <strong>{user?.email}</strong>
                    </p>
                    <Input
                      value={emailVerificationCode}
                      onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, ""))}
                      className="rounded-full text-center text-xl font-black border-orange-200 focus:border-accent tracking-[0.4em] h-12 mb-3"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="------"
                      data-testid="input-pending-verification-code"
                    />
                    <Button
                      onClick={async () => {
                        if (!emailVerificationCode || emailVerificationCode.length < 6) {
                          toast({ title: t("dashboard.pendingAccount.enter6DigitCode"), variant: "destructive" });
                          return;
                        }
                        setIsVerifyingEmail(true);
                        try {
                          const res = await apiRequest("POST", "/api/auth/verify-email", { code: emailVerificationCode });
                          const result = await res.json();
                          if (result.success) {
                            await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
                            toast({ title: t("dashboard.pendingAccount.emailVerified") });
                            setEmailVerificationCode("");
                          }
                        } catch (err: any) {
                          toast({ title: t("llc.messages.incorrectCode"), variant: "destructive" });
                        } finally {
                          setIsVerifyingEmail(false);
                        }
                      }}
                      disabled={isVerifyingEmail || emailVerificationCode.length < 6}
                      className="w-full bg-accent text-accent-foreground font-black rounded-full h-11"
                      data-testid="button-pending-verify"
                    >
                      {isVerifyingEmail ? <Loader2 className="animate-spin" /> : t("dashboard.pendingAccount.verifyButton")}
                    </Button>
                    <Button
                      variant="link"
                      onClick={async () => {
                        setIsResendingCode(true);
                        try {
                          await apiRequest("POST", "/api/auth/resend-verification");
                          toast({ title: t("llc.messages.codeSent") });
                        } catch {
                          toast({ title: t("common.error"), variant: "destructive" });
                        } finally {
                          setIsResendingCode(false);
                        }
                      }}
                      disabled={isResendingCode}
                      className="text-accent p-0 h-auto text-xs mt-2"
                      data-testid="button-pending-resend"
                    >
                      {isResendingCode ? t("common.sending") : t("dashboard.pendingAccount.resendCode")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-amber-600" />
                        <span className="font-bold text-sm text-amber-800 dark:text-amber-300">{t("dashboard.pendingAccount.adminReviewTitle")}</span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                        {t("dashboard.pendingAccount.adminReviewMessage")}
                      </p>
                    </div>
                                      </div>
                )}
              </CardContent>
            </Card>

            {/* Notificaciones */}
            <Card className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white dark:bg-card">
              <div className="bg-accent h-1.5 w-full" />
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-900/10 dark:border-accent/30">
                  <BellRing className="w-5 h-5 text-accent" />
                  <h2 className="font-black text-lg text-foreground">{t("dashboard.notifications.title")}</h2>
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-muted' : 'bg-accent/10'}`}>
                            <BellRing className={`w-4 h-4 ${notif.isRead ? 'text-muted-foreground' : 'text-accent'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{notif.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(notif.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
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

          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              className="text-sm text-muted-foreground"
              onClick={() => apiRequest("POST", "/api/logout").then(() => window.location.href = "/")}
              data-testid="button-pending-logout"
            >
              {t("dashboard.pendingAccount.logout")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Memoized filtered orders to avoid recalculating on every render
  const draftOrders = useMemo(() => 
    orders?.filter(o => o.status === 'draft' || o.application?.status === 'draft' || o.maintenanceApplication?.status === 'draft') || [],
    [orders]
  );
  
  const activeOrders = useMemo(() => 
    orders?.filter(o => o.status !== 'cancelled' && o.status !== 'completed').slice(0, 4) || [],
    [orders]
  );

  const menuItems = useMemo(() => [
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

  // Admin search filtering
  const filteredAdminOrders = useMemo(() => {
    if (!adminSearchQuery.trim() || !adminOrders) return adminOrders;
    const query = adminSearchQuery.toLowerCase().trim();
    return adminOrders.filter((order: any) => {
      const app = order.application || order.maintenanceApplication;
      const requestCode = (app?.requestCode || order.invoiceNumber || '').toLowerCase();
      const userId = (order.userId?.toString() || '');
      const orderId = (order.id?.toString() || '');
      const userName = ((order.user?.firstName || '') + ' ' + (order.user?.lastName || '')).toLowerCase();
      const userEmail = (order.user?.email || '').toLowerCase();
      return requestCode.includes(query) || userId.includes(query) || orderId.includes(query) || userName.includes(query) || userEmail.includes(query);
    });
  }, [adminOrders, adminSearchQuery]);

  const filteredAdminUsers = useMemo(() => {
    if (!adminSearchQuery.trim() || !adminUsers) return adminUsers;
    const query = adminSearchQuery.toLowerCase().trim();
    return adminUsers.filter((u: any) => {
      const fullName = ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase();
      const email = (u.email || '').toLowerCase();
      const clientId = (u.clientId || '').toLowerCase();
      const id = (u.id?.toString() || '');
      return fullName.includes(query) || email.includes(query) || clientId.includes(query) || id.includes(query);
    });
  }, [adminUsers, adminSearchQuery]);

  const filteredAdminMessages = useMemo(() => {
    if (!adminSearchQuery.trim() || !adminMessages) return adminMessages;
    const query = adminSearchQuery.toLowerCase().trim();
    return adminMessages.filter((msg: any) => {
      const messageId = (msg.messageId || '').toLowerCase();
      const userEmail = (msg.email || '').toLowerCase();
      const userName = (msg.name || '').toLowerCase();
      return messageId.includes(query) || userEmail.includes(query) || userName.includes(query);
    });
  }, [adminMessages, adminSearchQuery]);
  
  const isAdmin = user?.isAdmin;

  return (
    <div className="min-h-screen bg-background font-sans animate-page-in">
      <Navbar />
      <DashboardTour />
      <main className="pt-16 sm:pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-6 md:mb-10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div>
              <p className="text-accent font-bold tracking-wide text-xs md:text-sm mb-1 md:mb-2 uppercase">{t('dashboard.clientArea')}</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                {t('dashboard.welcome', { name: (user?.firstName || 'Cliente').charAt(0).toUpperCase() + (user?.firstName || 'Cliente').slice(1).toLowerCase() })}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mt-1 md:mt-2">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/llc/formation">
                <Button className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-6 h-11 transition-all flex items-center justify-center gap-2 shadow-sm">
                  <PlusCircle className="w-5 h-5" /> {t('dashboard.newLLC')}
                </Button>
              </Link>
            </div>
          </div>

          {!user?.emailVerified && (
            <Card className="mt-4 p-4 rounded-2xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-orange-800 dark:text-orange-300">{t('dashboard.emailVerification.title')}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">{t('dashboard.emailVerification.description')}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowEmailVerification(true)}
                  className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-full h-9 px-4"
                  data-testid="button-verify-email-header"
                >
                  {t('dashboard.emailVerification.button')}
                </Button>
              </div>
            </Card>
          )}
        </header>

        {/* Mobile Navigation - Horizontal scroll buttons */}
        <div className="flex flex-col gap-2 mb-6 lg:hidden">
          <div className="flex overflow-x-auto pb-3 gap-2 no-scrollbar -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                onClick={() => setActiveTab(item.id as Tab)}
                size="sm"
                className={`flex items-center gap-1.5 rounded-full font-semibold text-[11px] sm:text-xs tracking-normal whitespace-nowrap shrink-0 h-10 px-4 transition-colors ${
                  activeTab === item.id 
                  ? 'bg-accent text-accent-foreground shadow-md' 
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                data-testid={`button-tab-${item.id}`}
                {...('tour' in item && item.tour ? { 'data-tour': item.tour } : {})}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.mobileLabel}</span>
              </Button>
            ))}
          </div>
          {isAdmin && (
            <div className="flex -mx-4 px-4">
              <Button
                variant={activeTab === 'admin' ? "default" : "ghost"}
                onClick={() => setActiveTab('admin' as Tab)}
                size="sm"
                className={`flex items-center gap-1.5 rounded-full font-semibold text-[11px] sm:text-xs tracking-normal whitespace-nowrap shrink-0 h-10 px-4 transition-colors ${
                  activeTab === 'admin' 
                  ? 'bg-accent text-accent-foreground shadow-md' 
                  : 'bg-accent/10 dark:bg-accent/20 text-accent hover:bg-accent/20 dark:hover:bg-accent/30'
                }`}
                data-testid="button-tab-admin-mobile"
              >
                <Shield className="w-4 h-4" />
                <span>{t('dashboard.menu.admin')}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Desktop Layout with Sidebar */}
        <div className="flex gap-8">
          {/* Desktop Sidebar - Hidden on mobile/tablet */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24 space-y-1">
              <div className="bg-card border border-border/50 rounded-2xl p-3 space-y-1 shadow-sm">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === item.id 
                      ? 'bg-accent text-accent-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                    data-testid={`button-sidebar-${item.id}`}
                    {...('tour' in item && item.tour ? { 'data-tour': item.tour } : {})}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-accent-foreground' : 'text-accent'}`} />
                    <span>{item.label}</span>
                    {activeTab === item.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                    )}
                  </button>
                ))}
              </div>
              
              {isAdmin && (
                <div className="bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-2xl p-3 mt-3">
                  <button
                    onClick={() => setActiveTab('admin' as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === 'admin' 
                      ? 'bg-accent text-accent-foreground shadow-sm' 
                      : 'text-accent hover:bg-accent/10'
                    }`}
                    data-testid="button-sidebar-admin"
                  >
                    <Shield className={`w-5 h-5 ${activeTab === 'admin' ? 'text-accent-foreground' : 'text-accent'}`} />
                    <span>{t('dashboard.menu.admin')}</span>
                    {activeTab === 'admin' && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                    )}
                  </button>
                </div>
              )}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              <div className="xl:col-span-2 space-y-6 order-1">
            
              {activeTab === 'services' && (
                <ServicesTab 
                  orders={orders} 
                  draftOrders={draftOrders} 
                  activeOrders={activeOrders} 
                />
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
                />
              )}

              {activeTab === 'documents' && (
                <div key="documents" className="space-y-6">
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{t('dashboard.documents.title')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('dashboard.documents.subtitle')}</p>
                  </div>
                  
                  {notifications?.some((n: any) => n.type === 'action_required') && user?.accountStatus !== 'deactivated' && (
                    <Card className="rounded-xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <FileUp className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm">{t('dashboard.documents.requestedDocuments')}</h4>
                          <div className="mt-2 space-y-1">
                            {notifications?.filter((n: any) => n.type === 'action_required').map((n: any) => (
                              <p key={n.id} className="text-xs text-orange-700 dark:text-orange-400">{n.message}</p>
                            ))}
                          </div>
                          <div className="mt-3">
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
                                  try {
                                    const csrfToken = await getCsrfToken();
                                    const res = await fetch('/api/user/documents/upload', {
                                      method: 'POST',
                                      headers: { 'X-CSRF-Token': csrfToken },
                                      body: formData,
                                      credentials: 'include'
                                    });
                                    if (res.ok) {
                                      toast({ title: t("dashboard.toasts.documentUploadedClient"), description: t("dashboard.toasts.documentUploadedClientDesc") });
                                      queryClient.invalidateQueries({ queryKey: ['/api/user/documents'] });
                                      queryClient.invalidateQueries({ queryKey: ['/api/user/notifications'] });
                                    } else {
                                      toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotUpload"), variant: "destructive" });
                                    }
                                  } catch {
                                    toast({ title: t("common.error"), description: t("dashboard.toasts.connectionError"), variant: "destructive" });
                                  }
                                }}
                                data-testid="input-upload-document"
                              />
                              <Button variant="outline" className="rounded-full text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300" asChild>
                                <span><FileUp className="w-3 h-3 mr-1" /> {t('dashboard.documents.uploadDocument')}</span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                  
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
                            <h3 className="font-semibold text-foreground text-base md:text-lg">{t('dashboard.documents.uploadDocument')}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.documents.maxSize')}</p>
                          </div>
                          <Button size="lg" className="rounded-full font-black bg-accent text-primary shrink-0" asChild>
                            <span>
                              <FileUp className="w-5 h-5 md:mr-2" />
                              <span className="hidden md:inline">Subir</span>
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
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
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
                            <Textarea 
                              value={uploadNotes} 
                              onChange={(e) => setUploadNotes(e.target.value)} 
                              placeholder="Describe el documento..."
                              className="min-h-[70px] rounded-xl border-border bg-background dark:bg-[#1A1A1A] text-base"
                              style={{ fontSize: '16px' }}
                              data-testid="input-upload-notes-inline"
                            />
                          </div>
                        )}
                        
                        <Button 
                          onClick={async () => {
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
                                toast({ title: t("dashboard.toasts.documentUploadedClient"), description: t("dashboard.toasts.documentUploadedClientDesc") });
                                queryClient.invalidateQueries({ queryKey: ['/api/user/documents'] });
                                setUploadDialog({ open: false, file: null });
                              } else {
                                const data = await res.json();
                                toast({ title: t("common.error"), description: data.message || t("dashboard.toasts.couldNotUpload"), variant: "destructive" });
                              }
                            } catch {
                              toast({ title: t("common.error"), description: t("dashboard.toasts.connectionError"), variant: "destructive" });
                            }
                          }}
                          disabled={uploadDocType === 'other' && !uploadNotes.trim()}
                          className="w-full bg-accent text-accent-foreground font-bold rounded-full h-12"
                          data-testid="button-send-document"
                        >
                          <Send className="w-4 h-4 mr-2" /> Enviar Documento
                        </Button>
                      </div>
                    )}
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {userDocuments?.map((doc: any) => (
                      <Card key={doc.id} className="rounded-xl md:rounded-2xl border-0 shadow-sm p-4 md:p-6 flex flex-col items-center text-center bg-white dark:bg-card">
                        <FileUp className="w-10 h-10 md:w-12 md:h-12 text-accent mb-3" />
                        <h3 className="font-bold text-primary mb-1 text-xs md:text-sm line-clamp-2">{doc.fileName}</h3>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground">{new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}</p>
                        {doc.uploader && (
                          <p className="text-[9px] text-accent mb-1">Subido por: {doc.uploader.firstName} {doc.uploader.lastName}</p>
                        )}
                        <div className="flex gap-2 w-full mt-3">
                          <Button variant="outline" size="sm" className="rounded-full font-bold flex-1 text-[10px] md:text-xs" onClick={() => window.open(doc.fileUrl, "_blank")} data-testid={`button-download-doc-${doc.id}`}>
                            <Download className="w-3 h-3 mr-1" /> Descargar
                          </Button>
                          {canEdit && (
                            <Button variant="outline" size="icon" className="rounded-full text-red-500 shrink-0" onClick={() => deleteDocMutation.mutate(doc.id)} disabled={deleteDocMutation.isPending} data-testid={`button-delete-doc-${doc.id}`}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div key="payments" className="space-y-6">
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{t('dashboard.payments.title')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('dashboard.payments.subtitle')}</p>
                  </div>
                  <div className="space-y-4">
                    {(!orders || orders.length === 0) ? (
                      <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="widget-payments-empty">
                        <div className="flex flex-col items-center gap-3 md:gap-4">
                          <Wallet className="w-12 h-12 md:w-16 md:h-16 text-accent" />
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2 text-center">{t('dashboard.payments.empty')}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.payments.emptyDesc')}</p>
                          </div>
                          <Link href="/servicios#pricing">
                            <Button className="bg-accent text-accent-foreground font-semibold rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-view-services">
                              <PlusCircle className="w-4 h-4 mr-2" /> {t('dashboard.payments.viewServices')}
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ) : (
                      orders.map((order: any) => (
                        <Card key={order.id} className="rounded-2xl border-0 shadow-sm p-6 flex justify-between items-center bg-white dark:bg-card">
                          <div>
                            <p className="font-black text-xs md:text-sm">Factura {order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}>{t('dashboard.payments.invoice')}</Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div key="calendar" className="space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{t('dashboard.calendar.title')}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{t('dashboard.calendar.subtitle')}</p>
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
                          { label: 'IRS 1120', fullLabel: t('dashboard.calendar.irs1120'), date: app.irs1120DueDate, icon: FileText, bgColor: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-600 dark:text-orange-400', borderColor: 'border-orange-200 dark:border-orange-800' },
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
                                          {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="text-[9px] md:text-[10px] text-muted-foreground">
                                          {date.getFullYear()}
                                        </div>
                                        {isPast ? (
                                          <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                            <span className="text-[9px] md:text-[10px] text-green-600 dark:text-green-400 font-medium">{t('dashboard.calendar.completed')}</span>
                                          </div>
                                        ) : isUrgent ? (
                                          <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3 text-red-500" />
                                            <span className="text-[9px] md:text-[10px] text-red-600 dark:text-red-400 font-bold">{daysUntil} {t('dashboard.calendar.days')}</span>
                                          </div>
                                        ) : isWarning ? (
                                          <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-orange-500" />
                                            <span className="text-[9px] md:text-[10px] text-orange-600 dark:text-orange-400 font-medium">{daysUntil} {t('dashboard.calendar.days')}</span>
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
                        <Calendar className="w-10 h-10 md:w-12 md:h-12 text-accent" />
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2 text-center">{t('dashboard.calendar.title')}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.calendar.emptyDescription')}</p>
                        </div>
                        <Link href="/servicios#pricing">
                          <Button className="bg-accent text-accent-foreground font-semibold rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-start-llc-calendar">
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
                    <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{t('dashboard.tools.title')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('dashboard.tools.subtitle')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Receipt className="w-6 h-6 text-accent" />
                          <h3 className="font-bold text-foreground">{t('dashboard.clientTools.invoiceGenerator')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.invoiceDescription')}</p>
                        <Link href="/tools/invoice">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full" size="sm" data-testid="button-invoice-generator">
                            {t('dashboard.clientTools.createInvoice')} <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                    
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calculator className="w-6 h-6 text-accent" />
                          <h3 className="font-bold text-foreground">{t('dashboard.clientTools.priceCalculator')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.calculatorDescription')}</p>
                        <Link href="/tools/price-calculator">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full" size="sm" data-testid="button-price-calculator">
                            {t('dashboard.clientTools.calculate')} <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                    
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <ClipboardList className="w-6 h-6 text-accent" />
                          <h3 className="font-bold text-foreground">{t('dashboard.clientTools.operatingAgreement')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.operatingDescription')}</p>
                        <Link href="/tools/operating-agreement">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full" size="sm" data-testid="button-operating-agreement">
                            {t('dashboard.clientTools.generateDocument')} <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                    
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-6 h-6 text-accent" />
                          <h3 className="font-bold text-foreground">{t('tools.csvGenerator.toolTitle')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('tools.csvGenerator.toolDescription')}</p>
                        <Link href="/tools/csv-generator">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full" size="sm" data-testid="button-csv-generator">
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
                          <Input
                            value={emailVerificationCode}
                            onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, ""))}
                            className="rounded-xl text-center text-2xl font-black border-border bg-background dark:bg-[#1A1A1A] h-14 tracking-[0.5em]"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="000000"
                            data-testid="input-email-verification-code"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={async () => {
                              if (!emailVerificationCode || emailVerificationCode.length < 6) {
                                toast({ title: t("dashboard.toasts.enter6DigitCode"), variant: "destructive" });
                                return;
                              }
                              setIsVerifyingEmail(true);
                              try {
                                const res = await apiRequest("POST", "/api/auth/verify-email", { code: emailVerificationCode });
                                const result = await res.json();
                                if (result.success) {
                                  await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
                                  toast({ title: t("dashboard.toasts.emailVerified") });
                                  setShowEmailVerification(false);
                                  setEmailVerificationCode("");
                                }
                              } catch (err: any) {
                                toast({ title: t("dashboard.toasts.incorrectCode"), description: err.message || t("dashboard.toasts.incorrectCodeDesc"), variant: "destructive" });
                              } finally {
                                setIsVerifyingEmail(false);
                              }
                            }}
                            disabled={isVerifyingEmail || emailVerificationCode.length < 6}
                            className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full"
                            data-testid="button-verify-email-code"
                          >
                            {isVerifyingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.profile.verifyEmail')}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={async () => {
                              setIsResendingCode(true);
                              try {
                                await apiRequest("POST", "/api/auth/resend-verification");
                                toast({ title: t("dashboard.toasts.codeSent"), description: t("dashboard.toasts.codeSentDesc") });
                              } catch {
                                toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotSend"), variant: "destructive" });
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
                        <Button 
                          variant="destructive" 
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

              {activeTab === 'admin' && user?.isAdmin && (
                <div key="admin" className="space-y-6">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4 md:mb-6">
                    {[
                      { id: 'dashboard', label: 'Métricas', mobileLabel: 'Métricas', icon: BarChart3 },
                      { id: 'orders', label: 'Pedidos', mobileLabel: 'Pedidos', icon: Package },
                      { id: 'consultations', label: 'Consultas', mobileLabel: 'Consult.', icon: MessageSquare },
                      { id: 'incomplete', label: 'Incompletas', mobileLabel: 'Incompl.', icon: AlertCircle },
                      { id: 'users', label: 'Clientes', mobileLabel: 'Clientes', icon: Users },
                      { id: 'facturas', label: 'Facturas', mobileLabel: 'Facturas', icon: Receipt },
                      { id: 'accounting', label: 'Contabilidad', mobileLabel: 'Contab.', icon: Calculator },
                      { id: 'calendar', label: t('dashboard.calendar.dates'), mobileLabel: t('dashboard.calendar.dates'), icon: Calendar },
                      { id: 'docs', label: 'Docs', mobileLabel: 'Docs', icon: FileText },
                      { id: 'newsletter', label: 'News', mobileLabel: 'News', icon: Mail },
                      { id: 'inbox', label: 'Inbox', mobileLabel: 'Inbox', icon: MessageSquare },
                      { id: 'descuentos', label: 'Descuentos', mobileLabel: 'Desc', icon: Tag },
                    ].map((item) => (
                      <Button
                        key={item.id}
                        variant={adminSubTab === item.id ? "default" : "outline"}
                        onClick={() => setAdminSubTab(item.id)}
                        size="sm"
                        className={`flex items-center justify-center gap-1.5 rounded-full font-bold text-[10px] sm:text-xs h-9 px-3 ${
                          adminSubTab === item.id 
                          ? 'bg-accent text-primary shadow-md' 
                          : 'bg-white dark:bg-card text-muted-foreground border border-border hover:border-accent/50'
                        }`}
                        data-testid={`button-admin-tab-${item.id}`}
                      >
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.mobileLabel}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" className={`rounded-full text-xs font-semibold shadow-sm ${createUserDialog ? 'bg-accent text-accent-foreground' : 'bg-white dark:bg-[#1A1A1A]'}`} onClick={() => setCreateUserDialog(!createUserDialog)} data-testid="button-create-user">
                        <Plus className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">{t('dashboard.admin.newClient')}</span>
                        <span className="sm:hidden">{t('dashboard.admin.newClient')}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className={`rounded-full text-xs font-semibold shadow-sm ${createOrderDialog ? 'bg-accent text-accent-foreground' : 'bg-white dark:bg-[#1A1A1A]'}`} onClick={() => setCreateOrderDialog(!createOrderDialog)} data-testid="button-create-order">
                        <Plus className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Nuevo Pedido</span>
                        <span className="sm:hidden">Pedido</span>
                      </Button>
                    </div>
                    <div className="relative flex-1 max-w-xs min-w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t('dashboard.admin.searchPlaceholder')}
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="pl-9 rounded-full text-xs bg-white dark:bg-[#1A1A1A] border-border"
                        data-testid="input-admin-search"
                      />
                    </div>
                  </div>

                  {/* Inline Admin Panels - Replace Sheets */}
                  {createUserDialog && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{t('dashboard.admin.newClient')}</h3>
                          <p className="text-sm text-muted-foreground">{t('dashboard.admin.configureOrder')}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setCreateUserDialog(false)} className="rounded-full" data-testid="button-close-create-user">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Nombre</Label>
                            <Input value={newUserData.firstName} onChange={e => setNewUserData(p => ({ ...p, firstName: e.target.value }))} placeholder="Nombre" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-firstname" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Apellidos</Label>
                            <Input value={newUserData.lastName} onChange={e => setNewUserData(p => ({ ...p, lastName: e.target.value }))} placeholder="Apellidos" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-lastname" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Email</Label>
                          <Input type="email" value={newUserData.email} onChange={e => setNewUserData(p => ({ ...p, email: e.target.value }))} placeholder="email@ejemplo.com" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-email" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Teléfono</Label>
                          <Input value={newUserData.phone} onChange={e => setNewUserData(p => ({ ...p, phone: e.target.value }))} placeholder="+34 600 000 000" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-phone" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Contraseña</Label>
                          <Input type="password" value={newUserData.password} onChange={e => setNewUserData(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 8 caracteres" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-create-user-password" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => createUserMutation.mutate(newUserData)} disabled={createUserMutation.isPending || !newUserData.email || !newUserData.password} className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-confirm-create-user">
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
                          <h3 className="text-lg font-semibold text-foreground">{t('dashboard.admin.createOrder')}</h3>
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
                              const type = val as 'llc' | 'maintenance';
                              const defaultAmount = type === 'maintenance' 
                                ? (newOrderData.state === 'Wyoming' ? '699' : newOrderData.state === 'Delaware' ? '999' : '539')
                                : (newOrderData.state === 'Wyoming' ? '899' : newOrderData.state === 'Delaware' ? '1399' : '739');
                              setNewOrderData(p => ({ ...p, orderType: type, amount: defaultAmount }));
                            }}
                            placeholder={t('dashboard.admin.selectOrderType')}
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="select-order-type"
                          >
                            <NativeSelectItem value="llc">{t('dashboard.admin.llcCreation')}</NativeSelectItem>
                            <NativeSelectItem value="maintenance">{t('dashboard.admin.maintenanceService')}</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.client')}</Label>
                          <NativeSelect 
                            value={newOrderData.userId} 
                            onValueChange={val => setNewOrderData(p => ({ ...p, userId: val }))}
                            placeholder={t('dashboard.admin.selectClient')}
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="select-order-user"
                          >
                            {adminUsers?.map((u: any) => (
                              <NativeSelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</NativeSelectItem>
                            ))}
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.state')}</Label>
                          <NativeSelect 
                            value={newOrderData.state} 
                            onValueChange={val => {
                              const prices = newOrderData.orderType === 'maintenance'
                                ? { 'New Mexico': '539', 'Wyoming': '699', 'Delaware': '999' }
                                : { 'New Mexico': '739', 'Wyoming': '899', 'Delaware': '1399' };
                              setNewOrderData(p => ({ ...p, state: val, amount: prices[val as keyof typeof prices] || p.amount }));
                            }}
                            placeholder={t('dashboard.admin.selectState')}
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="select-order-state"
                          >
                            {newOrderData.orderType === 'maintenance' ? (
                              <>
                                <NativeSelectItem value="New Mexico">New Mexico - 539€</NativeSelectItem>
                                <NativeSelectItem value="Wyoming">Wyoming - 699€</NativeSelectItem>
                                <NativeSelectItem value="Delaware">Delaware - 999€</NativeSelectItem>
                              </>
                            ) : (
                              <>
                                <NativeSelectItem value="New Mexico">New Mexico - 739€</NativeSelectItem>
                                <NativeSelectItem value="Wyoming">Wyoming - 899€</NativeSelectItem>
                                <NativeSelectItem value="Delaware">Delaware - 1399€</NativeSelectItem>
                              </>
                            )}
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">{t('dashboard.admin.amount')} (€)</Label>
                          <Input type="number" value={newOrderData.amount} onChange={e => setNewOrderData(p => ({ ...p, amount: e.target.value }))} placeholder="739" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-order-amount" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => createOrderMutation.mutate(newOrderData)} disabled={createOrderMutation.isPending || !newOrderData.userId || !newOrderData.amount} className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-confirm-create-order">
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
                          <h3 className="text-lg font-semibold text-foreground">Enviar Mensaje al Cliente</h3>
                          <p className="text-sm text-muted-foreground">El cliente recibirá notificación en su panel y email</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setNoteDialog({ open: false, user: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Título</Label>
                          <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Título del mensaje" className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" data-testid="input-note-title" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Mensaje</Label>
                          <Textarea value={noteMessage} onChange={e => setNoteMessage(e.target.value)} placeholder="Escribe tu mensaje..." rows={4} className="w-full rounded-xl border-border bg-background dark:bg-[#1A1A1A]" data-testid="input-note-message" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => noteDialog.user?.id && sendNoteMutation.mutate({ userId: noteDialog.user.id, title: noteTitle, message: noteMessage, type: noteType })} disabled={!noteTitle || !noteMessage || sendNoteMutation.isPending} className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-send-note">
                          {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Mensaje'}
                        </Button>
                        <Button variant="outline" onClick={() => setNoteDialog({ open: false, user: null })} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Edit User */}
                  {editingUser && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Editar Usuario</h3>
                          <p className="text-sm text-muted-foreground">Modifica los datos del cliente</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setEditingUser(null)} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">Nombre</Label>
                            <Input value={editingUser.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-firstname" />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">Apellidos</Label>
                            <Input value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-lastname" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">Email</Label>
                          <Input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-email" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">Teléfono</Label>
                          <Input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-phone" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">Tipo ID</Label>
                            <NativeSelect 
                              value={editingUser.idType || ''} 
                              onValueChange={val => setEditingUser({...editingUser, idType: val})}
                              placeholder="Seleccionar"
                              className="w-full rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]"
                            >
                              <NativeSelectItem value="dni">DNI</NativeSelectItem>
                              <NativeSelectItem value="nie">NIE</NativeSelectItem>
                              <NativeSelectItem value="passport">Pasaporte</NativeSelectItem>
                            </NativeSelect>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">Número ID</Label>
                            <Input value={editingUser.idNumber || ''} onChange={e => setEditingUser({...editingUser, idNumber: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-idnumber" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">Fecha Nacimiento</Label>
                          <Input type="date" value={editingUser.birthDate || ''} onChange={e => setEditingUser({...editingUser, birthDate: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-birthdate" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">Actividad de Negocio</Label>
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
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">Dirección</Label>
                          <Input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} placeholder="Calle y número" className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-address" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">Ciudad</Label>
                            <Input value={editingUser.city || ''} onChange={e => setEditingUser({...editingUser, city: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-city" />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">CP</Label>
                            <Input value={editingUser.postalCode || ''} onChange={e => setEditingUser({...editingUser, postalCode: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-postal" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">Provincia</Label>
                            <Input value={editingUser.province || ''} onChange={e => setEditingUser({...editingUser, province: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-province" />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-1.5 block">País</Label>
                            <Input value={editingUser.country || ''} onChange={e => setEditingUser({...editingUser, country: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-border text-sm bg-white dark:bg-[#1A1A1A]" data-testid="input-edit-country" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-1.5 block">Notas Internas</Label>
                          <Textarea value={editingUser.internalNotes || ''} onChange={e => setEditingUser({...editingUser, internalNotes: e.target.value})} rows={2} className="rounded-xl border-border bg-background dark:bg-[#1A1A1A] text-sm" data-testid="input-edit-notes" />
                        </div>
                        {user?.email === 'afortuny07@gmail.com' && (
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-purple-700 dark:text-purple-300">Permisos de Administrador</p>
                                <p className="text-[10px] text-purple-600 dark:text-purple-400">Solo tú puedes cambiar esto</p>
                              </div>
                              <Switch
                                checked={editingUser.isAdmin || false}
                                onCheckedChange={(checked) => setEditingUser({...editingUser, isAdmin: checked})}
                                data-testid="switch-admin-toggle"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-4">
                        <Button type="button" onClick={(e) => { e.preventDefault(); editingUser.id && updateUserMutation.mutate({ id: editingUser.id, ...editingUser }); }} disabled={updateUserMutation.isPending} className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-save-user">
                          {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                        </Button>
                        <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); setEditingUser(null); }} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Delete User Confirmation */}
                  {deleteConfirm.open && deleteConfirm.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-red-300 dark:border-red-800 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-red-600">Eliminar Usuario</h3>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ open: false, user: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm.user?.firstName} {deleteConfirm.user?.lastName}</strong>?</p>
                        <p className="text-xs text-red-500 mt-2">Esta acción no se puede deshacer.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button variant="destructive" onClick={() => deleteConfirm.user?.id && deleteUserMutation.mutate(deleteConfirm.user.id)} disabled={deleteUserMutation.isPending} className="flex-1 rounded-full font-black" data-testid="button-confirm-delete">
                          {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, user: null })} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Delete Order Confirmation */}
                  {deleteOrderConfirm.open && deleteOrderConfirm.order && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-red-300 dark:border-red-800 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-red-600">Eliminar Pedido</h3>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteOrderConfirm({ open: false, order: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar el pedido <strong>{deleteOrderConfirm.order?.application?.requestCode || deleteOrderConfirm.order?.maintenanceApplication?.requestCode || deleteOrderConfirm.order?.invoiceNumber}</strong>?</p>
                        <p className="text-xs text-muted-foreground mt-2">Cliente: {deleteOrderConfirm.order?.user?.firstName} {deleteOrderConfirm.order?.user?.lastName}</p>
                        <p className="text-xs text-red-500 mt-2">Esta acción eliminará el pedido, la solicitud LLC asociada y todos los documentos relacionados.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button variant="destructive" onClick={() => deleteOrderConfirm.order?.id && deleteOrderMutation.mutate(deleteOrderConfirm.order.id)} disabled={deleteOrderMutation.isPending} className="flex-1 rounded-full font-black" data-testid="button-confirm-delete-order">
                          {deleteOrderMutation.isPending ? 'Eliminando...' : 'Eliminar Pedido'}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteOrderConfirm({ open: false, order: null })} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Generate Invoice */}
                  {generateInvoiceDialog.open && generateInvoiceDialog.order && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Generar Factura</h3>
                          <p className="text-sm text-muted-foreground">Pedido: {generateInvoiceDialog.order?.application?.requestCode || generateInvoiceDialog.order?.maintenanceApplication?.requestCode || generateInvoiceDialog.order?.invoiceNumber}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setGenerateInvoiceDialog({ open: false, order: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Importe</Label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            value={orderInvoiceAmount} 
                            onChange={e => setOrderInvoiceAmount(e.target.value)}
                            className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
                            placeholder="739.00"
                            data-testid="input-invoice-amount"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Divisa</Label>
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
                          className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full"
                          disabled={!orderInvoiceAmount || isNaN(parseFloat(orderInvoiceAmount)) || parseFloat(orderInvoiceAmount) <= 0 || isGeneratingInvoice}
                          onClick={async () => {
                            setIsGeneratingInvoice(true);
                            try {
                              const amountCents = Math.round(parseFloat(orderInvoiceAmount) * 100);
                              if (amountCents <= 0) {
                                toast({ title: t("common.error"), description: t("dashboard.toasts.amountMustBeGreater"), variant: "destructive" });
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
                              toast({ title: t("dashboard.toasts.invoiceGenerated"), description: t("dashboard.toasts.invoiceGeneratedDesc", { amount: orderInvoiceAmount, currency: orderInvoiceCurrency }) });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
                              window.open(`/api/orders/${generateInvoiceDialog.order?.id}/invoice`, '_blank');
                              setGenerateInvoiceDialog({ open: false, order: null });
                              setOrderInvoiceAmount("");
                            } catch (err: any) {
                              toast({ title: t("common.error"), description: err.message || t("dashboard.toasts.couldNotGenerate"), variant: "destructive" });
                            } finally {
                              setIsGeneratingInvoice(false);
                            }
                          }}
                          data-testid="button-confirm-generate-invoice"
                        >
                          {isGeneratingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generar Factura'}
                        </Button>
                        <Button variant="outline" onClick={() => setGenerateInvoiceDialog({ open: false, order: null })} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Request Documents */}
                  {docDialog.open && docDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Solicitar Documentos</h3>
                          <p className="text-sm text-muted-foreground">Solicita documentos al cliente</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setDocDialog({ open: false, user: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Tipo de documento</Label>
                          <NativeSelect 
                            value={docType} 
                            onValueChange={setDocType}
                            placeholder="Seleccionar tipo..."
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                          >
                            <NativeSelectItem value="passport">Pasaporte / Documento de Identidad</NativeSelectItem>
                            <NativeSelectItem value="address_proof">Prueba de Domicilio</NativeSelectItem>
                            <NativeSelectItem value="tax_id">Identificación Fiscal (NIF/CIF)</NativeSelectItem>
                            <NativeSelectItem value="other">Otro Documento</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Mensaje</Label>
                          <Textarea value={docMessage} onChange={e => setDocMessage(e.target.value)} placeholder="Mensaje para el cliente" rows={3} className="w-full rounded-xl border-border bg-background dark:bg-[#1A1A1A]" data-testid="input-doc-message" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button onClick={() => {
                          if (docDialog.user?.id && docDialog.user?.email) {
                            const docTypeLabels: Record<string, string> = {
                              passport: 'Pasaporte / Documento de Identidad',
                              address_proof: 'Prueba de Domicilio',
                              tax_id: 'Identificación Fiscal (NIF/CIF)',
                              other: 'Documento Adicional'
                            };
                            const docLabel = docTypeLabels[docType] || docType;
                            sendNoteMutation.mutate({ 
                              userId: docDialog.user.id, 
                              title: `Solicitud de Documento: ${docLabel}`, 
                              message: docMessage || `Por favor, sube tu ${docLabel} a tu panel de cliente.`, 
                              type: 'action_required' 
                            });
                            setDocDialog({ open: false, user: null });
                            setDocType('');
                            setDocMessage('');
                          }
                        }} disabled={!docType || sendNoteMutation.isPending} className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-request-doc">
                          {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solicitar Documento'}
                        </Button>
                        <Button variant="outline" onClick={() => setDocDialog({ open: false, user: null })} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Create Invoice */}
                  {invoiceDialog.open && invoiceDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Crear Factura</h3>
                          <p className="text-sm text-muted-foreground">Cliente: {invoiceDialog.user?.firstName} {invoiceDialog.user?.lastName}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setInvoiceDialog({ open: false, user: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Concepto</Label>
                          <Input 
                            value={invoiceConcept} 
                            onChange={e => setInvoiceConcept(e.target.value)} 
                            placeholder="Ej: Servicio de consultoría" 
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="input-invoice-concept"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Importe</Label>
                            <Input 
                              type="number" 
                              value={invoiceAmount} 
                              onChange={e => setInvoiceAmount(e.target.value)} 
                              placeholder="739" 
                              className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                              data-testid="input-invoice-amount"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Moneda</Label>
                            <NativeSelect 
                              value={invoiceCurrency} 
                              onValueChange={setInvoiceCurrency}
                              className="w-full rounded-xl h-11 px-3 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                              data-testid="select-invoice-currency"
                            >
                              <NativeSelectItem value="EUR">EUR</NativeSelectItem>
                              <NativeSelectItem value="USD">USD</NativeSelectItem>
                            </NativeSelect>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button 
                          onClick={() => invoiceDialog.user?.id && createInvoiceMutation.mutate({ 
                            userId: invoiceDialog.user.id, 
                            concept: invoiceConcept, 
                            amount: Math.round(parseFloat(invoiceAmount) * 100),
                            currency: invoiceCurrency
                          })} 
                          disabled={!invoiceConcept || !invoiceAmount || createInvoiceMutation.isPending}
                          className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full"
                          data-testid="button-create-invoice"
                        >
                          {createInvoiceMutation.isPending ? 'Creando...' : 'Crear Factura'}
                        </Button>
                        <Button variant="outline" onClick={() => setInvoiceDialog({ open: false, user: null })} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Discount Code */}
                  {discountCodeDialog.open && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {discountCodeDialog.code ? 'Editar Código de Descuento' : 'Nuevo Código de Descuento'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {discountCodeDialog.code ? 'Modifica los datos del código' : 'Configura un nuevo código de descuento'}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setDiscountCodeDialog({ open: false, code: null })} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-2 block">Código</Label>
                          <Input 
                            value={newDiscountCode.code} 
                            onChange={e => setNewDiscountCode(p => ({ ...p, code: e.target.value.toUpperCase() }))} 
                            className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border uppercase bg-white dark:bg-[#1A1A1A]" 
                            disabled={!!discountCodeDialog.code}
                            data-testid="input-discount-code" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Tipo</Label>
                            <NativeSelect 
                              value={newDiscountCode.discountType} 
                              onValueChange={(val) => setNewDiscountCode(p => ({ ...p, discountType: val as 'percentage' | 'fixed' }))}
                              className="w-full rounded-xl h-11 px-3 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                              data-testid="select-discount-type"
                            >
                              <NativeSelectItem value="percentage">Porcentaje (%)</NativeSelectItem>
                              <NativeSelectItem value="fixed">Fijo (centimos)</NativeSelectItem>
                            </NativeSelect>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">
                              Valor {newDiscountCode.discountType === 'percentage' ? '(%)' : '(cts)'}
                            </Label>
                            <Input 
                              type="number" 
                              value={newDiscountCode.discountValue} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, discountValue: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
                              data-testid="input-discount-value" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Min. (EUR)</Label>
                            <Input 
                              type="number" 
                              value={newDiscountCode.minOrderAmount} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, minOrderAmount: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
                              data-testid="input-discount-min-amount" 
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Usos max.</Label>
                            <Input 
                              type="number" 
                              value={newDiscountCode.maxUses} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, maxUses: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
                              data-testid="input-discount-max-uses" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Desde</Label>
                            <Input 
                              type="date" 
                              value={newDiscountCode.validFrom} 
                              onChange={e => setNewDiscountCode(p => ({ ...p, validFrom: e.target.value }))} 
                              className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]" 
                              data-testid="input-discount-valid-from" 
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-2 block">Hasta</Label>
                            <Input 
                              type="date" 
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
                          <Label className="text-sm font-semibold">Código activo</Label>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-4">
                        <Button 
                          onClick={async () => {
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
                                toast({ title: t("dashboard.toasts.discountCodeUpdated") });
                              } else {
                                await apiRequest("POST", "/api/admin/discount-codes", payload);
                                toast({ title: t("dashboard.toasts.discountCodeCreated") });
                              }
                              refetchDiscountCodes();
                              setDiscountCodeDialog({ open: false, code: null });
                            } catch (e: any) {
                              toast({ title: t("common.error"), description: e.message || t("dashboard.toasts.couldNotSave"), variant: "destructive" });
                            }
                          }} 
                          disabled={!newDiscountCode.code || !newDiscountCode.discountValue} 
                          className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full" 
                          data-testid="button-save-discount"
                        >
                          {discountCodeDialog.code ? 'Guardar Cambios' : 'Crear Código'}
                        </Button>
                        <Button variant="outline" onClick={() => setDiscountCodeDialog({ open: false, code: null })} className="flex-1 rounded-full" data-testid="button-cancel-discount">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Payment Link */}
                  {paymentLinkDialog.open && paymentLinkDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground">Enviar Link de Pago</h3>
                          <p className="text-sm text-muted-foreground">Envía un enlace de pago a {paymentLinkDialog.user?.firstName} {paymentLinkDialog.user?.lastName}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setPaymentLinkDialog({ open: false, user: null }); setPaymentLinkUrl(""); setPaymentLinkAmount(""); setPaymentLinkMessage(""); }} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">Link de pago (URL)</Label>
                          <Input
                            value={paymentLinkUrl}
                            onChange={(e) => setPaymentLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="input-payment-link-url"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">Importe</Label>
                          <Input
                            value={paymentLinkAmount}
                            onChange={(e) => setPaymentLinkAmount(e.target.value)}
                            placeholder="Ej: 739€"
                            className="rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                            data-testid="input-payment-link-amount"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">Mensaje (opcional)</Label>
                          <Textarea
                            value={paymentLinkMessage}
                            onChange={(e) => setPaymentLinkMessage(e.target.value)}
                            placeholder="Mensaje adicional para el cliente..."
                            className="rounded-xl border-border bg-background dark:bg-[#1A1A1A]"
                            rows={3}
                            data-testid="input-payment-link-message"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button
                          onClick={async () => {
                            if (!paymentLinkUrl || !paymentLinkAmount) {
                              toast({ title: t("form.validation.requiredFields"), variant: "destructive" });
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
                              toast({ title: t("dashboard.toasts.paymentLinkSent"), description: t("dashboard.toasts.paymentLinkSentDesc", { email: paymentLinkDialog.user?.email }) });
                              setPaymentLinkDialog({ open: false, user: null });
                              setPaymentLinkUrl("");
                              setPaymentLinkAmount("");
                              setPaymentLinkMessage("");
                            } catch (err: any) {
                              toast({ title: t("common.error"), description: err.message || t("dashboard.toasts.couldNotSendLink"), variant: "destructive" });
                            } finally {
                              setIsSendingPaymentLink(false);
                            }
                          }}
                          disabled={isSendingPaymentLink || !paymentLinkUrl || !paymentLinkAmount}
                          className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full"
                          data-testid="button-send-payment-link"
                        >
                          {isSendingPaymentLink ? <Loader2 className="animate-spin" /> : "Enviar Link de Pago"}
                        </Button>
                        <Button variant="outline" onClick={() => { setPaymentLinkDialog({ open: false, user: null }); setPaymentLinkUrl(""); setPaymentLinkAmount(""); setPaymentLinkMessage(""); }} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Admin Document Upload */}
                  {adminDocUploadDialog.open && adminDocUploadDialog.order && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Subir Documento para Cliente</h3>
                          <p className="text-sm text-muted-foreground">
                            {adminDocUploadDialog.order?.userId 
                              ? `Usuario: ${adminDocUploadDialog.order?.user?.firstName} ${adminDocUploadDialog.order?.user?.lastName}`
                              : `Pedido: ${adminDocUploadDialog.order?.application?.requestCode || adminDocUploadDialog.order?.maintenanceApplication?.requestCode || adminDocUploadDialog.order?.invoiceNumber}`
                            }
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setAdminDocUploadDialog({ open: false, order: null }); setAdminDocFile(null); setAdminDocType("articles_of_organization"); }} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">Tipo de Documento</Label>
                          <NativeSelect
                            value={adminDocType}
                            onValueChange={setAdminDocType}
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                          >
                            <NativeSelectItem value="articles_of_organization">Artículos de Organización</NativeSelectItem>
                            <NativeSelectItem value="certificate_of_formation">Certificado de Formación</NativeSelectItem>
                            <NativeSelectItem value="boir">BOIR</NativeSelectItem>
                            <NativeSelectItem value="ein_document">Documento EIN</NativeSelectItem>
                            <NativeSelectItem value="operating_agreement">Acuerdo Operativo</NativeSelectItem>
                            <NativeSelectItem value="invoice">Factura</NativeSelectItem>
                            <NativeSelectItem value="other">Otro Documento</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">Archivo</Label>
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
                                  Haz clic para seleccionar archivo
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button
                          disabled={!adminDocFile || isUploadingAdminDoc}
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
                                toast({ title: t("dashboard.toasts.adminDocUploaded"), description: t("dashboard.toasts.adminDocUploadedDesc") });
                                queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                                queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
                                setAdminDocUploadDialog({ open: false, order: null });
                                setAdminDocFile(null);
                              } else {
                                const data = await res.json();
                                toast({ title: t("common.error"), description: data.message || t("dashboard.toasts.couldNotUpload"), variant: "destructive" });
                              }
                            } catch {
                              toast({ title: t("common.error"), description: t("dashboard.toasts.connectionError"), variant: "destructive" });
                            } finally {
                              setIsUploadingAdminDoc(false);
                            }
                          }}
                          className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full"
                          data-testid="button-admin-upload-doc"
                        >
                          {isUploadingAdminDoc ? <Loader2 className="animate-spin" /> : "Subir Documento"}
                        </Button>
                        <Button variant="outline" onClick={() => { setAdminDocUploadDialog({ open: false, order: null }); setAdminDocFile(null); }} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  {/* Inline Panel: Reset Password */}
                  {resetPasswordDialog.open && resetPasswordDialog.user && (
                    <Card className="mb-4 p-4 md:p-6 rounded-2xl border border-accent/30 bg-white dark:bg-card shadow-lg animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground">Restablecer Contraseña</h3>
                          <p className="text-sm text-muted-foreground">Nueva contraseña para {resetPasswordDialog.user?.firstName} {resetPasswordDialog.user?.lastName}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setResetPasswordDialog({ open: false, user: null }); setNewAdminPassword(""); }} className="rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-foreground block mb-2">Nueva Contraseña</Label>
                          <Input
                            type="password"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            className="rounded-xl h-12 border-border bg-background dark:bg-[#1A1A1A]"
                            data-testid="input-admin-new-password"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                        <Button
                          disabled={newAdminPassword.length < 8 || isResettingPassword}
                          onClick={async () => {
                            if (!resetPasswordDialog.user?.id || newAdminPassword.length < 8) return;
                            setIsResettingPassword(true);
                            try {
                              await apiRequest("POST", `/api/admin/users/${resetPasswordDialog.user.id}/reset-password`, { newPassword: newAdminPassword });
                              toast({ title: t("dashboard.toasts.adminPasswordUpdated"), description: t("dashboard.toasts.adminPasswordUpdatedDesc") });
                              setResetPasswordDialog({ open: false, user: null });
                              setNewAdminPassword("");
                            } catch {
                              toast({ title: t("common.error"), description: t("dashboard.toasts.couldNotUpdatePassword"), variant: "destructive" });
                            } finally {
                              setIsResettingPassword(false);
                            }
                          }}
                          className="flex-1 bg-accent text-accent-foreground font-semibold rounded-full"
                          data-testid="button-confirm-reset-password"
                        >
                          {isResettingPassword ? <Loader2 className="animate-spin" /> : "Restablecer Contraseña"}
                        </Button>
                        <Button variant="outline" onClick={() => { setResetPasswordDialog({ open: false, user: null }); setNewAdminPassword(""); }} className="flex-1 rounded-full">Cancelar</Button>
                      </div>
                    </Card>
                  )}
                  
                  {adminSubTab === 'dashboard' && (
                    <div className="space-y-4 md:space-y-6" data-testid="admin-dashboard-metrics">
                      {/* Ventas */}
                      <div data-testid="section-sales">
                        <h3 className="text-sm font-bold mb-3" data-testid="heading-sales">Ventas</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Total Ventas</p>
                            <p className="text-lg md:text-2xl font-black text-green-600 dark:text-green-500" data-testid="stat-total-sales">{((adminStats?.totalSales || 0) / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Pendiente Cobro</p>
                            <p className="text-lg md:text-2xl font-black text-green-600 dark:text-green-500" data-testid="stat-pending-sales">{((adminStats?.pendingSales || 0) / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Pedidos Totales</p>
                            <p className="text-lg md:text-2xl font-black text-green-600 dark:text-green-500" data-testid="stat-total-orders">{adminStats?.orderCount || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Conversión</p>
                            <p className="text-lg md:text-2xl font-black text-green-600 dark:text-green-500" data-testid="stat-conversion">{adminStats?.conversionRate || 0}%</p>
                          </Card>
                        </div>
                      </div>

                      {/* Estado Pedidos */}
                      <div data-testid="section-orders">
                        <h3 className="text-sm font-bold mb-3" data-testid="heading-orders">Estado de Pedidos</h3>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Pendientes</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-pending-orders">{adminStats?.pendingOrders || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">En Proceso</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-processing-orders">{adminStats?.processingOrders || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Completados</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-completed-orders">{adminStats?.completedOrders || 0}</p>
                          </Card>
                        </div>
                      </div>

                      {/* Usuarios */}
                      <div data-testid="section-crm">
                        <h3 className="text-sm font-bold mb-3" data-testid="heading-crm">Clientes (CRM)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Total Usuarios</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-total-users">{adminStats?.userCount || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Activos</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-active-users">{adminStats?.activeAccounts || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">VIP</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-vip-users">{adminStats?.vipAccounts || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">En Revisión</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-pending-accounts">{adminStats?.pendingAccounts || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Desactivadas</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-deactivated-users">{adminStats?.deactivatedAccounts || 0}</p>
                          </Card>
                        </div>
                      </div>

                      {/* Comunicaciones y Documentos */}
                      <div data-testid="section-communications">
                        <h3 className="text-sm font-bold mb-3" data-testid="heading-communications">Comunicaciones</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Suscriptores Newsletter</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-subscribers">{adminStats?.subscriberCount || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Mensajes Totales</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-total-messages">{adminStats?.totalMessages || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Mensajes Pendientes</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-pending-messages">{adminStats?.pendingMessages || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Docs Pendientes</p>
                            <p className="text-xl md:text-3xl font-black text-green-600 dark:text-green-500" data-testid="stat-pending-docs">{adminStats?.pendingDocs || 0}</p>
                          </Card>
                        </div>
                      </div>

                    </div>
                  )}
                  
                  {adminSubTab === 'orders' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                      <div className="divide-y">
                        {filteredAdminOrders?.map(order => {
                          const app = order.application || order.maintenanceApplication;
                          const isMaintenance = !!order.maintenanceApplication && !order.application;
                          const orderCode = app?.requestCode || order.invoiceNumber;
                          const appStatus = app?.status;
                          const isFormComplete = appStatus === 'submitted';
                          
                          return (
                          <div key={order.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="font-black text-sm">{orderCode}</p>
                                  <NativeSelect 
                                    value={order.status} 
                                    onValueChange={val => updateStatusMutation.mutate({ id: order.id, status: val })}
                                    className="w-28 h-7 rounded-lg text-xs bg-white dark:bg-card border px-2"
                                  >
                                    <NativeSelectItem value="pending">Pendiente</NativeSelectItem>
                                    <NativeSelectItem value="paid">Pagado</NativeSelectItem>
                                    <NativeSelectItem value="filed">Presentado</NativeSelectItem>
                                    <NativeSelectItem value="cancelled">Cancelado</NativeSelectItem>
                                  </NativeSelect>
                                  <Badge className={`text-[9px] ${isMaintenance ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                    {isMaintenance ? 'MANTENIMIENTO' : 'LLC'}
                                  </Badge>
                                  {!isFormComplete && <Badge className="text-[9px] bg-orange-100 text-orange-700">FORMULARIO INCOMPLETO</Badge>}
                                </div>
                                <p className="text-xs font-semibold">{app?.ownerFullName || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`}</p>
                                <p className="text-xs text-muted-foreground">{app?.ownerEmail || order.user?.email}</p>
                                {app?.ownerPhone && <p className="text-xs text-muted-foreground">{app.ownerPhone}</p>}
                                <p className="text-xs text-muted-foreground mt-1">
                                  <strong>Empresa:</strong> {app?.companyName || 'No especificada'} • <strong>Estado:</strong> {app?.state || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <strong>Producto:</strong> {order.product?.name} • <strong>Monto:</strong> {(order.amount / 100).toFixed(2)}€
                                  {order.discountCode && (
                                    <span className="text-green-600 ml-2">
                                      (Descuento: {order.discountCode} -{(order.discountAmount / 100).toFixed(2)}€)
                                    </span>
                                  )}
                                </p>
                                {app?.businessCategory && <p className="text-xs text-muted-foreground"><strong>Categoría:</strong> {app.businessCategory}</p>}
                                {isMaintenance && app?.ein && <p className="text-xs text-muted-foreground"><strong>EIN:</strong> {app.ein}</p>}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {app?.id && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-full text-xs"
                                  onClick={() => {
                                    const editUrl = isMaintenance 
                                      ? `/llc/maintenance?edit=${app.id}`
                                      : `/llc/formation?edit=${app.id}`;
                                    window.location.href = editUrl;
                                  }}
                                  data-testid={`btn-modify-order-${order.id}`}
                                >
                                  <Edit2 className="w-3 h-3 mr-1" /> Modificar
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => window.open(`/api/admin/invoice/${order.id}`, '_blank')} data-testid={`btn-view-invoice-${order.id}`}>
                                Ver Factura
                              </Button>
                              <Button size="sm" className="rounded-full text-xs bg-accent hover:bg-accent/90 text-black" onClick={() => {
                                setOrderInvoiceAmount(((order.amount || 0) / 100).toFixed(2));
                                setOrderInvoiceCurrency("EUR");
                                setGenerateInvoiceDialog({ open: true, order });
                              }} data-testid={`btn-generate-invoice-${order.id}`}>
                                Generar Factura
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full text-xs text-red-600 border-red-200" onClick={() => setDeleteOrderConfirm({ open: true, order })} data-testid={`btn-delete-order-${order.id}`}>
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        )})}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'consultations' && (
                    <AdminConsultationsPanel />
                  )}
                  {adminSubTab === 'incomplete' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                      <div className="p-4 border-b bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                        <h3 className="font-black text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          Solicitudes Incompletas ({(incompleteApps?.llc?.length || 0) + (incompleteApps?.maintenance?.length || 0)})
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Formularios no completados - se eliminan automáticamente tras 48h de inactividad</p>
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
                                    <Badge className={`text-[9px] ${app.type === 'maintenance' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                      {app.type === 'maintenance' ? 'MANTENIMIENTO' : 'LLC'}
                                    </Badge>
                                    <Badge className="text-[9px] bg-orange-100 text-orange-700">INCOMPLETA</Badge>
                                    {hoursRemaining !== null && (
                                      <Badge className="text-[9px] bg-red-100 text-red-700">
                                        {hoursRemaining > 0 ? `Se elimina en ${hoursRemaining}h` : 'Eliminación pendiente'}
                                      </Badge>
                                    )}
                                  </div>
                                  {app.ownerFullName && <p className="text-sm font-bold">{app.ownerFullName}</p>}
                                  {app.ownerEmail && <p className="text-xs text-muted-foreground">{app.ownerEmail}</p>}
                                  {app.ownerPhone && <p className="text-xs text-muted-foreground">{app.ownerPhone}</p>}
                                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                    {app.companyName && <p><strong>Empresa:</strong> {app.companyName}</p>}
                                    {app.state && <p><strong>Estado:</strong> {app.state}</p>}
                                    {app.remindersSent > 0 && <p><strong>Recordatorios:</strong> {app.remindersSent}/3 enviados</p>}
                                    {app.lastUpdated && <p><strong>Última actividad:</strong> {new Date(app.lastUpdated).toLocaleString('es-ES')}</p>}
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
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {(!incompleteApps?.llc?.length && !incompleteApps?.maintenance?.length) && (
                          <div className="p-8 text-center text-muted-foreground">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <p className="text-sm font-medium">No hay solicitudes incompletas</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'users' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                      <div className="divide-y">
                        {filteredAdminUsers?.map(u => (
                          <div key={u.id} className="p-3 md:p-4 space-y-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-black text-sm">{u.firstName} {u.lastName}</p>
                                <Badge variant={u.accountStatus === 'active' ? 'default' : u.accountStatus === 'vip' ? 'default' : 'secondary'} className={`text-[9px] ${u.accountStatus === 'deactivated' ? 'bg-red-100 text-red-700' : u.accountStatus === 'vip' ? 'bg-yellow-100 text-yellow-700' : u.accountStatus === 'pending' ? 'bg-orange-100 text-orange-700' : ''}`}>
                                  {u.accountStatus === 'active' ? 'VERIFICADO' : u.accountStatus === 'pending' ? 'EN REVISIÓN' : u.accountStatus === 'deactivated' ? 'DESACTIVADA' : u.accountStatus === 'vip' ? 'VIP' : 'VERIFICADO'}
                                </Badge>
                                {u.isAdmin && <Badge className="text-[9px] bg-purple-100 text-purple-700">ADMIN</Badge>}
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
                                  <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                    OTP Requerido
                                  </span>
                                )}
                              </div>
                              <div className="w-full">
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Estado de cuenta</Label>
                                <NativeSelect 
                                  value={u.accountStatus || 'active'} 
                                  onValueChange={val => u.id && updateUserMutation.mutate({ id: u.id, accountStatus: val as any })}
                                  className="w-full h-9 rounded-full text-xs bg-white dark:bg-card border shadow-sm px-3"
                                >
                                  <NativeSelectItem value="active">Verificado</NativeSelectItem>
                                  <NativeSelectItem value="pending">En revisión</NativeSelectItem>
                                  <NativeSelectItem value="deactivated">Desactivada</NativeSelectItem>
                                  <NativeSelectItem value="vip">VIP</NativeSelectItem>
                                </NativeSelect>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setEditingUser(u)} data-testid={`button-edit-user-${u.id}`}>
                                Editar
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setResetPasswordDialog({ open: true, user: u })} data-testid={`button-reset-pwd-${u.id}`}>
                                <Key className="w-3 h-3 mr-1" />Contraseña
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setNoteDialog({ open: true, user: u })} data-testid={`button-note-user-${u.id}`}>
                                Mensaje
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setDocDialog({ open: true, user: u })} data-testid={`button-doc-user-${u.id}`}>
                                Docs
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setInvoiceDialog({ open: true, user: u })} data-testid={`button-invoice-user-${u.id}`}>
                                Factura
                              </Button>
                              <Button size="sm" className="rounded-full text-xs bg-accent hover:bg-accent/90 text-black" onClick={() => setPaymentLinkDialog({ open: true, user: u })} data-testid={`button-payment-link-${u.id}`}>
                                Pago
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full text-xs text-red-600 border-red-200" onClick={() => setDeleteConfirm({ open: true, user: u })} data-testid={`button-delete-user-${u.id}`}>
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'calendar' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 overflow-hidden">
                      <h4 className="font-black text-base md:text-lg mb-4 md:mb-6">
                        Gestión de Fechas Fiscales
                      </h4>
                      <div className="space-y-4 md:space-y-6">
                        {adminOrders?.map((order: any) => {
                          const app = order.application;
                          if (!app) return null;
                          const fiscalOrderCode = app?.requestCode || order.invoiceNumber;
                          return (
                            <div key={order.id} className="border-2 rounded-2xl p-4 md:p-5 bg-gray-50/50 dark:bg-[#1A1A1A]/50">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                <div>
                                  <p className="font-black text-base md:text-lg">{app.companyName || 'LLC pendiente'}</p>
                                  <p className="text-xs md:text-sm text-muted-foreground">{order.user?.firstName} {order.user?.lastName} • {app.state}</p>
                                </div>
                                <Badge variant="outline" className="text-xs w-fit">{fiscalOrderCode}</Badge>
                              </div>
                              {/* Fechas - Grid compacto en móvil */}
                              <div className="grid grid-cols-2 gap-2 md:gap-4">
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">Creación LLC</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
                                    defaultValue={app.llcCreatedDate ? new Date(app.llcCreatedDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'llcCreatedDate', value: e.target.value })}
                                    data-testid={`input-llc-created-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">Renovación Agente</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
                                    defaultValue={app.agentRenewalDate ? new Date(app.agentRenewalDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'agentRenewalDate', value: e.target.value })}
                                    data-testid={`input-agent-renewal-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">IRS 1120</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
                                    defaultValue={app.irs1120DueDate ? new Date(app.irs1120DueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs1120DueDate', value: e.target.value })}
                                    data-testid={`input-irs1120-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">IRS 5472</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
                                    defaultValue={app.irs5472DueDate ? new Date(app.irs5472DueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs5472DueDate', value: e.target.value })}
                                    data-testid={`input-irs5472-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-card p-2 md:p-3 rounded-lg md:rounded-xl border col-span-2">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">Reporte Anual</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
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
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3 font-mono"
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
                                        toast({
                                          title: !app.hasTaxExtension ? t("dashboard.calendar.taxExtension.activated") : t("dashboard.calendar.taxExtension.deactivated"),
                                          description: !app.hasTaxExtension 
                                            ? t("dashboard.calendar.taxExtension.movedToOctober")
                                            : t("dashboard.calendar.taxExtension.movedToApril")
                                        });
                                      }
                                    } catch {
                                      toast({ title: t("common.error"), variant: "destructive" });
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
                                  onClick={async () => {
                                    if (!confirm(t('dashboard.calendar.clearCalendarConfirm'))) return;
                                    try {
                                      // Clear all dates
                                      await Promise.all([
                                        apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'llcCreatedDate', value: null }),
                                        apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'agentRenewalDate', value: null }),
                                        apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'irs1120DueDate', value: null }),
                                        apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'irs5472DueDate', value: null }),
                                        apiRequest("PATCH", `/api/admin/llc/${app.id}/dates`, { field: 'annualReportDueDate', value: null }),
                                      ]);
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                                      toast({ title: t("dashboard.toasts.calendarCleared"), description: t("dashboard.toasts.calendarClearedDesc") });
                                    } catch {
                                      toast({ title: t("common.error"), variant: "destructive" });
                                    }
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
                            No hay pedidos con LLCs para gestionar
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'docs' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg">Documentos</h3>
                          <Badge className="bg-accent/20 text-accent">{adminDocuments?.length || 0}</Badge>
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
                            <option value="">Por pedido...</option>
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
                            <option value="">Por usuario...</option>
                            {adminUsers?.map((user: any) => (
                              <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </option>
                            ))}
                          </NativeSelect>
                        </div>
                      </div>
                      <div className="divide-y max-h-[60vh] overflow-y-auto">
                        {adminDocuments?.map((doc: any) => (
                          <div key={doc.id} className="py-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-xs md:text-sm truncate">{doc.fileName}</p>
                                  <Badge variant="outline" className={`text-[8px] md:text-[9px] shrink-0 ${doc.reviewStatus === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : doc.reviewStatus === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {doc.reviewStatus === 'approved' ? 'Aprobado' : doc.reviewStatus === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-accent font-medium mt-0.5">
                                  {doc.user?.firstName} {doc.user?.lastName}
                                </p>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">{doc.user?.email}</p>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground">
                                  {doc.application?.companyName && <><span className="font-medium">LLC:</span> {doc.application.companyName} • </>}
                                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '-'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-10">
                              <NativeSelect 
                                value={doc.reviewStatus || 'pending'} 
                                onValueChange={async val => {
                                  try {
                                    await apiRequest("PATCH", `/api/admin/documents/${doc.id}/review`, { reviewStatus: val });
                                    queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                                    toast({ title: t("dashboard.toasts.statusUpdated") });
                                  } catch { toast({ title: t("common.error"), variant: "destructive" }); }
                                }}
                                className="h-7 text-[10px] rounded-full px-2 flex-1 max-w-[120px]"
                              >
                                <NativeSelectItem value="pending">Pendiente</NativeSelectItem>
                                <NativeSelectItem value="approved">Aprobar</NativeSelectItem>
                                <NativeSelectItem value="rejected">Rechazar</NativeSelectItem>
                              </NativeSelect>
                              {doc.fileUrl && (
                                <Button size="icon" variant="outline" className="h-7 w-7 rounded-full" onClick={() => window.open(doc.fileUrl, '_blank')} data-testid={`btn-view-doc-${doc.id}`}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-7 w-7 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                onClick={async () => {
                                  if (confirm('¿Eliminar este documento permanentemente?')) {
                                    try {
                                      await apiRequest("DELETE", `/api/admin/documents/${doc.id}`);
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                                      toast({ title: t("dashboard.toasts.documentDeleted") });
                                    } catch { toast({ title: t("common.error"), variant: "destructive" }); }
                                  }
                                }}
                                data-testid={`btn-delete-doc-${doc.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {(!adminDocuments || adminDocuments.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                            No hay documentos subidos por clientes
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'newsletter' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6">
                      <div className="space-y-6">
                        <h4 className="font-black text-sm mb-3">Lista de Suscriptores ({adminNewsletterSubs?.length || 0})</h4>
                        <div className="divide-y max-h-80 overflow-y-auto">
                          {adminNewsletterSubs?.map((sub: any) => (
                            <div key={sub.id} className="py-2 flex justify-between items-center gap-2">
                              <span className="text-sm truncate flex-1">{sub.email}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('es-ES') : ''}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                                onClick={async () => {
                                  if (!confirm(`¿Eliminar suscriptor ${sub.email}?`)) return;
                                  try {
                                    await apiRequest("DELETE", `/api/admin/newsletter/${sub.id}`);
                                    refetchNewsletterSubs();
                                    toast({ title: t("dashboard.toasts.subscriberDeleted") });
                                  } catch (e) {
                                    toast({ title: t("common.error"), variant: "destructive" });
                                  }
                                }}
                                data-testid={`button-delete-subscriber-${sub.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                          {(!adminNewsletterSubs || adminNewsletterSubs.length === 0) && (
                            <p className="text-sm text-muted-foreground py-4 text-center">No hay suscriptores</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'inbox' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                      <div className="divide-y">
                        {adminMessages?.map((msg: any) => (
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
                                <Badge variant={msg.status === 'archived' ? 'secondary' : 'default'} className="text-[8px] md:text-[10px]">{msg.status === 'archived' ? 'archivado' : msg.status || 'pendiente'}</Badge>
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
                                        toast({ title: t("dashboard.toasts.messageArchived") });
                                      } catch { toast({ title: t("common.error"), variant: "destructive" }); }
                                    }}
                                    data-testid={`btn-archive-msg-${msg.id}`}
                                    title="Archivar"
                                  >
                                    <Archive className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                  </Button>
                                )}
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6 md:h-7 md:w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm('¿Eliminar este mensaje y todas sus respuestas?')) {
                                      try {
                                        await apiRequest("DELETE", `/api/admin/messages/${msg.id}`);
                                        queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
                                        toast({ title: t("dashboard.toasts.messageDeleted") });
                                      } catch { toast({ title: t("common.error"), variant: "destructive" }); }
                                    }
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
                                      {reply.isAdmin ? 'Admin' : 'Cliente'}:
                                    </span>
                                    <span className="ml-2">{reply.content}</span>
                                    <span className="text-[10px] text-muted-foreground ml-2">
                                      {reply.createdAt && new Date(reply.createdAt).toLocaleString('es-ES')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-[10px] text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleString('es-ES') : ''}</p>
                            
                            {selectedMessage?.id === msg.id && (
                              <div className="space-y-2 pt-3 border-t mt-2" onClick={(e) => e.stopPropagation()}>
                                <Textarea 
                                  value={replyContent} 
                                  onChange={(e) => setReplyContent(e.target.value)} 
                                  placeholder="Escribe tu respuesta al cliente..." 
                                  className="rounded-xl min-h-[80px] text-sm"
                                  data-testid="input-admin-reply"
                                />
                                <Button 
                                  onClick={() => sendReplyMutation.mutate(msg.id)} 
                                  disabled={!replyContent.trim() || sendReplyMutation.isPending} 
                                  className="bg-accent text-accent-foreground font-semibold rounded-full px-6"
                                  data-testid="button-send-admin-reply"
                                >
                                  {sendReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                  Enviar respuesta
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        {(!adminMessages || adminMessages.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground text-sm">No hay mensajes</div>
                        )}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'facturas' && (
                    <div className="space-y-4" data-testid="admin-facturas-section">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold">Facturas para Contabilidad</h3>
                      </div>
                      <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                        <div className="divide-y max-h-[60vh] overflow-y-auto">
                          {adminInvoices?.length === 0 && (
                            <p className="p-4 text-sm text-muted-foreground text-center">No hay facturas generadas</p>
                          )}
                          {adminInvoices?.map((inv: any) => (
                            <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`invoice-row-${inv.id}`}>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-sm">{inv.fileName || `Factura ${inv.order?.invoiceNumber}`}</span>
                                  <Badge variant={inv.order?.status === 'paid' || inv.order?.status === 'completed' ? "default" : "secondary"} className="text-[10px]">
                                    {inv.order?.status === 'paid' ? 'Pagada' : inv.order?.status === 'completed' ? 'Completada' : inv.order?.status === 'pending' ? 'Pendiente' : inv.order?.status || 'N/A'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {inv.user?.firstName} {inv.user?.lastName} ({inv.user?.email})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Importe: {inv.order?.amount ? ((inv.order.amount / 100).toFixed(2) + (inv.order.currency === 'USD' ? ' $' : ' €')) : 'N/A'} | 
                                  Fecha: {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                                </p>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <NativeSelect
                                  value={inv.order?.status || 'pending'}
                                  onValueChange={async (newStatus) => {
                                    try {
                                      await apiRequest("PATCH", `/api/admin/invoices/${inv.id}/status`, { status: newStatus });
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
                                      toast({ title: t("dashboard.toasts.statusUpdated") });
                                    } catch {
                                      toast({ title: t("common.error"), variant: "destructive" });
                                    }
                                  }}
                                  className="h-8 text-[10px] rounded-full px-2 min-w-[90px]"
                                >
                                  <option value="pending">Pendiente</option>
                                  <option value="paid">Pagada</option>
                                  <option value="completed">Completada</option>
                                  <option value="cancelled">Cancelada</option>
                                  <option value="refunded">Reembolsada</option>
                                </NativeSelect>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-full text-xs"
                                  onClick={() => window.open(inv.fileUrl || `/api/orders/${inv.orderId}/invoice`, '_blank')}
                                  data-testid={`button-view-invoice-${inv.id}`}
                                >
                                  <Eye className="w-3 h-3 mr-1" /> Ver
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-full text-xs"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = inv.fileUrl || `/api/orders/${inv.orderId}/invoice`;
                                    link.download = `Factura-${inv.order?.invoiceNumber || inv.id}.pdf`;
                                    link.click();
                                  }}
                                  data-testid={`button-download-invoice-${inv.id}`}
                                >
                                  <Download className="w-3 h-3 mr-1" /> Descargar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={async () => {
                                    if (!confirm('¿Eliminar esta factura?')) return;
                                    try {
                                      await apiRequest("DELETE", `/api/admin/invoices/${inv.id}`);
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
                                      toast({ title: t("dashboard.toasts.invoiceDeleted") });
                                    } catch {
                                      toast({ title: t("common.error"), variant: "destructive" });
                                    }
                                  }}
                                  data-testid={`button-delete-invoice-${inv.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {adminSubTab === 'accounting' && (
                    <AdminAccountingPanel />
                  )}

                  {adminSubTab === 'descuentos' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold">Códigos de Descuento</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full text-xs font-semibold"
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
                          <Plus className="w-3 h-3 mr-1" /> Nuevo Código
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
                                    {dc.isActive ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px]">
                                    {dc.discountType === 'percentage' ? `${dc.discountValue}%` : `${(dc.discountValue / 100).toFixed(2)}€`}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Usado: {dc.usedCount}{dc.maxUses ? `/${dc.maxUses}` : ''} veces
                                  {dc.minOrderAmount && ` | Min: ${(dc.minOrderAmount / 100).toFixed(2)}€`}
                                </p>
                                {(dc.validFrom || dc.validUntil) && (
                                  <p className="text-[9px] md:text-[10px] text-muted-foreground">
                                    {dc.validFrom && new Date(dc.validFrom).toLocaleDateString('es-ES')}
                                    {dc.validFrom && dc.validUntil && ' → '}
                                    {dc.validUntil && new Date(dc.validUntil).toLocaleDateString('es-ES')}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-lg text-xs h-8 w-8 p-0"
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
                                  className={`rounded-lg text-xs h-8 w-8 p-0 ${dc.isActive ? 'text-orange-600' : 'text-green-600'}`}
                                  onClick={async () => {
                                    try {
                                      await apiRequest("PATCH", `/api/admin/discount-codes/${dc.id}`, { isActive: !dc.isActive });
                                      refetchDiscountCodes();
                                      toast({ title: dc.isActive ? t("dashboard.toasts.discountCodeDeactivated") : t("dashboard.toasts.discountCodeActivated") });
                                    } catch (e) {
                                      toast({ title: t("common.error"), variant: "destructive" });
                                    }
                                  }}
                                  data-testid={`button-toggle-discount-${dc.code}`}
                                >
                                  {dc.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-lg text-xs h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={async () => {
                                    if (!confirm(`¿Eliminar el código ${dc.code}?`)) return;
                                    try {
                                      await apiRequest("DELETE", `/api/admin/discount-codes/${dc.id}`);
                                      refetchDiscountCodes();
                                      toast({ title: t("dashboard.toasts.discountCodeDeleted") });
                                    } catch (e) {
                                      toast({ title: t("common.error"), variant: "destructive" });
                                    }
                                  }}
                                  data-testid={`button-delete-discount-${dc.code}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {(!discountCodes || discountCodes.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground text-sm">No hay códigos de descuento</div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              )}

                          
          </div>

          <div className="space-y-6 md:gap-8 order-2 lg:order-2">
            {/* Consolidated Action Required Card */}
            {!user?.isAdmin && (notifications?.some((n: any) => n.type === 'action_required') || 
              (orders?.some((o: any) => o.application?.fiscalYearEnd && new Date(o.application.fiscalYearEnd) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))) ||
              (orders?.some((o: any) => o.status === 'pending_payment' || o.status === 'payment_failed'))) && (
              <section className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-[2rem] border-2 border-orange-200 dark:border-orange-800 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">{t('dashboard.actionRequired.title')}</h3>
                    <p className="text-[10px] text-orange-600 dark:text-orange-400">{t('dashboard.actionRequired.subtitle')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {notifications?.filter((n: any) => n.type === 'action_required').map((n: any) => (
                    <div key={n.id} className="flex items-start gap-2 bg-white/60 dark:bg-black/20 rounded-xl p-3" data-testid={`action-item-document-${n.id}`}>
                      <FileUp className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-orange-800 dark:text-orange-300">{t('dashboard.actionRequired.documentRequest')}</p>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 truncate">{n.message}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                        onClick={() => setActiveTab('documents')}
                        data-testid={`button-action-document-${n.id}`}
                      >
                        {t('dashboard.actionRequired.viewDocuments')}
                      </Button>
                    </div>
                  ))}
                  {orders?.filter((o: any) => o.status === 'pending_payment' || o.status === 'payment_failed').map((o: any) => (
                    <div key={o.id} className="flex items-start gap-2 bg-white/60 dark:bg-black/20 rounded-xl p-3" data-testid={`action-item-payment-${o.id}`}>
                      <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-orange-800 dark:text-orange-300">{t('dashboard.actionRequired.paymentPending')}</p>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 truncate">{o.application?.companyName || o.maintenanceApplication?.requestCode || o.invoiceNumber}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                        onClick={() => setActiveTab('payments')}
                        data-testid={`button-action-payment-${o.id}`}
                      >
                        {t('dashboard.actionRequired.payNow')}
                      </Button>
                    </div>
                  ))}
                  {orders?.filter((o: any) => o.application?.fiscalYearEnd && new Date(o.application.fiscalYearEnd) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).map((o: any) => (
                    <div key={`fiscal-${o.id}`} className="flex items-start gap-2 bg-white/60 dark:bg-black/20 rounded-xl p-3" data-testid={`action-item-fiscal-${o.id}`}>
                      <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-orange-800 dark:text-orange-300">{t('dashboard.actionRequired.fiscalDeadline')}</p>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400">{o.application?.companyName} - {new Date(o.application.fiscalYearEnd).toLocaleDateString()}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                        onClick={() => setActiveTab('calendar')}
                        data-testid={`button-action-fiscal-${o.id}`}
                      >
                        {t('dashboard.actionRequired.viewCalendar')}
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            <section className="bg-white dark:bg-card p-6 md:p-8 rounded-[2rem] shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-black tracking-tight text-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" /> {t('dashboard.tracking.title')}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.tracking.subtitle')}</p>
              </div>
              <div className="space-y-5">
                {orders && orders.length > 0 ? (
                  <>
                    <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3 mb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold text-accent uppercase tracking-wider mb-0.5">Pedido: {orders[0]?.application?.requestCode || orders[0]?.maintenanceApplication?.requestCode || orders[0]?.invoiceNumber || orders[0]?.id}</p>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {orders[0]?.maintenanceApplication 
                              ? `Mantenimiento ${orders[0]?.maintenanceApplication?.state || ''}`
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
                      <p className="text-[9px] text-muted-foreground mt-2">Creado: {orders[0]?.createdAt ? new Date(orders[0].createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</p>
                    </div>
                    {selectedOrderEvents && selectedOrderEvents.length > 0 ? (
                    selectedOrderEvents.map((event: any, idx: number) => (
                      <div key={event.id} className="flex gap-4 relative">
                        {idx < selectedOrderEvents.length - 1 && <div className="absolute left-3 top-6 w-0.5 h-8 bg-gray-100" />}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 bg-accent text-primary"><CheckCircle2 className="w-3 h-3" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs md:text-sm font-semibold text-foreground truncate">{event.eventType}</p>
                            {event.createdAt && (
                              <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                {new Date(event.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div><p className="text-xs font-black">{t('dashboard.tracking.orderReceived')}</p></div>
                        <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-gray-100" /><p className="text-xs text-gray-400">{t('dashboard.tracking.dataVerification')}</p></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4"><ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30 text-muted-foreground" /><p className="text-xs text-muted-foreground">{t('dashboard.tracking.empty')}</p><p className="text-[10px] text-muted-foreground/70 mt-1">{t('dashboard.tracking.emptyDescription')}</p></div>
                )}
              </div>
            </section>
            <section className="bg-accent/10 p-6 md:p-8 rounded-[2rem] border-2 border-accent/20 mt-8 mb-16 md:mb-12">
              <h3 className="text-base font-semibold text-foreground mb-2">{t('dashboard.support.haveQuestion')}</h3>
              <p className="text-xs text-primary/70 mb-5 leading-relaxed">{t('dashboard.support.hereToHelp')}</p>
              <a href="https://wa.me/34614916910?text=Hola!%20Soy%20cliente%20de%20Easy%20US%20LLC%20y%20tengo%20una%20duda%20sobre%20el%20estado%20de%20mi%20LLC%20o%20documentaci%C3%B3n.%20%C2%BFPodr%C3%ADais%20ayudarme%3F" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-accent text-accent-foreground font-semibold rounded-full py-5">{t('dashboard.support.talkToSupport')}</Button>
              </a>
            </section>
          </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
