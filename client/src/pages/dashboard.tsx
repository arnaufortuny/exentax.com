import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Building2, FileText, Clock, ChevronRight, User as UserIcon, Settings, Package, CreditCard, PlusCircle, Download, ExternalLink, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, Users, Power, Edit, Trash2, FileUp, Newspaper, Loader2, CheckCircle, Receipt, Plus, Calendar, DollarSign, TrendingUp, BarChart3, UserCheck, UserX, Star, Eye, FileCheck, Upload, XCircle, Tag, Percent, X, Calculator, Archive, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
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

function _NewsletterToggleLegacy() {
  const { toast } = useToast();
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
      toast({ title: "Preferencias actualizadas", description: "Gracias por quedarte con nosotros" });
    }
  });

  if (isLoading) return <div className="w-10 h-6 bg-gray-100 dark:bg-zinc-700 animate-pulse rounded-full" />;

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
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [createOrderDialog, setCreateOrderDialog] = useState(false);
  const [newOrderData, setNewOrderData] = useState({ userId: '', productId: '1', amount: '', state: 'New Mexico' });
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
    mutationFn: async (data: typeof profileData) => {
      if (!canEdit) {
        throw new Error("No puedes modificar tus datos en el estado actual de tu cuenta.");
      }
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al guardar");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({ title: "Cambios guardados", description: "Tu información se ha actualizado correctamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
        throw new Error(data.message || "Error al enviar");
      }
      return res.json();
    },
    onSuccess: () => {
      setReplyContent("");
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      toast({ title: user?.isAdmin ? "Respuesta enviada" : "Mensaje enviado", description: user?.isAdmin ? "El cliente recibirá un email con la información" : "Te responderemos personalmente lo antes posible" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo enviar la respuesta", variant: "destructive" });
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
      if (!res.ok) throw new Error("Error al marcar notificación");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
    },
    onError: () => {}
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/user/notifications/${id}`);
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
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
      if (!res.ok) throw new Error("Error al eliminar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/incomplete-applications"] });
      toast({ title: "Eliminada", description: "Solicitud incompleta eliminada correctamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar la solicitud", variant: "destructive" });
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
      if (!res.ok) throw new Error("Error al enviar");
    },
    onSuccess: () => {
      toast({ title: "Emails enviados", description: "Se ha enviado a todos los suscriptores del newsletter" });
      setBroadcastSubject("");
      setBroadcastMessage("");
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudieron enviar los emails", variant: "destructive" });
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
        throw new Error(err.message || "Error al subir documento");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      toast({ title: "Documento subido", description: "El cliente ya puede verlo en su panel." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo subir el documento", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      if (!res.ok) throw new Error("Error al actualizar estado");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Estado actualizado" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" });
    }
  });

  const updateLlcDatesMutation = useMutation({
    mutationFn: async ({ appId, field, value }: { appId: number, field: string, value: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/llc/${appId}/dates`, { field, value });
      if (!res.ok) throw new Error("Error al actualizar fecha");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Fecha actualizada" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar la fecha", variant: "destructive" });
    }
  });

  const sendNoteMutation = useMutation({
    mutationFn: async ({ userId, title, message, type }: { userId: string, title: string, message: string, type: string }) => {
      const res = await apiRequest("POST", "/api/admin/send-note", { userId, title, message, type });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al enviar");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Nota enviada", description: "El cliente recibirá notificación y email" });
      setNoteDialog({ open: false, user: null });
      setNoteTitle("");
      setNoteMessage("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo enviar la nota", variant: "destructive" });
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
        throw new Error(err.message || "Error al actualizar");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario actualizado" });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar", variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario eliminado" });
      setDeleteConfirm({ open: false, user: null });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el usuario", variant: "destructive" });
    }
  });
  
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<{ open: boolean; order: any }>({ open: false, order: null });
  const [generateInvoiceDialog, setGenerateInvoiceDialog] = useState<{ open: boolean; order: any }>({ open: false, order: null });
  const [orderInvoiceAmount, setOrderInvoiceAmount] = useState("");
  const [orderInvoiceCurrency, setOrderInvoiceCurrency] = useState("EUR");
  
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      toast({ title: "Pedido eliminado", description: "El pedido y sus datos asociados han sido eliminados." });
      setDeleteOrderConfirm({ open: false, order: null });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el pedido", variant: "destructive" });
    }
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async ({ userId, concept, amount, currency }: { userId: string, concept: string, amount: number, currency: string }) => {
      if (!amount || isNaN(amount) || amount < 1) {
        throw new Error("Importe inválido (mínimo 1 céntimo)");
      }
      const res = await apiRequest("POST", "/api/admin/invoices/create", { userId, concept, amount, currency });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al crear factura");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Factura creada", description: `Factura ${data?.invoiceNumber || ''} añadida al cliente` });
      setInvoiceDialog({ open: false, user: null });
      setInvoiceConcept("");
      setInvoiceAmount("");
      setInvoiceCurrency("EUR");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear la factura", variant: "destructive" });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUserData) => {
      const res = await apiRequest("POST", "/api/admin/users/create", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario creado", description: "El usuario ha sido registrado correctamente" });
      setCreateUserDialog(false);
      setNewUserData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el usuario", variant: "destructive" });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: typeof newOrderData) => {
      const { userId, state, amount } = data;
      if (!userId || !state || !amount) {
        throw new Error("Faltan datos requeridos");
      }
      const res = await apiRequest("POST", "/api/admin/orders/create", { userId, state, amount });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear pedido");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Pedido creado", description: `Pedido ${data?.invoiceNumber || ''} registrado correctamente` });
      setCreateOrderDialog(false);
      setNewOrderData({ userId: '', productId: '1', amount: '', state: 'New Mexico' });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear el pedido", variant: "destructive" });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: number) => {
      const res = await apiRequest("DELETE", `/api/user/documents/${docId}`);
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      toast({ title: "Documento eliminado" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "No se pudo eliminar el documento", variant: "destructive" });
    }
  });

  const deleteOwnAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/user/account");
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => {
      toast({ title: "Cuenta eliminada", description: "Tu cuenta ha sido eliminada correctamente." });
      window.location.href = "/";
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar la cuenta", variant: "destructive" });
    }
  });

  const requestPasswordOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/request-password-otp");
      if (!res.ok) throw new Error("Error al solicitar código");
    },
    onSuccess: () => {
      toast({ title: "Código enviado", description: "Revisa tu email para obtener el código de verificación." });
      setPasswordStep('otp');
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo enviar el código", variant: "destructive" });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; otp: string }) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al cambiar contraseña");
      }
    },
    onSuccess: () => {
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada correctamente." });
      setShowPasswordForm(false);
      setPasswordStep('form');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOtp("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo cambiar la contraseña", variant: "destructive" });
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
      <div className="min-h-screen bg-muted font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="max-w-md w-full">
            <Card className="rounded-2xl sm:rounded-[2rem] border-0 shadow-2xl overflow-hidden bg-white dark:bg-zinc-900">
              <div className="bg-red-500 h-2 w-full" />
              <CardContent className="p-6 sm:p-8 md:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl font-black text-red-500">!</span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight mb-3 sm:mb-4">
                  Tu cuenta ha sido desactivada
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed mb-6 sm:mb-8">
                  Revisa tu email, deberías haber recibido una nota de nuestro equipo con más información.
                </p>
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 p-3 rounded-xl">
                    No puedes realizar acciones ni contactar hasta que se resuelva tu situación.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full font-black text-foreground h-12 rounded-full border-2"
                    onClick={() => apiRequest("POST", "/api/logout").then(() => window.location.href = "/")}
                    data-testid="button-logout"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
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
      <div className="min-h-screen bg-muted bg-green-gradient font-sans flex flex-col overflow-x-hidden overflow-y-auto">
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
            <Card className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
              <div className={`h-1.5 w-full ${!user?.emailVerified ? 'bg-orange-500' : 'bg-amber-500'}`} />
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-900/10 dark:border-accent/30">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${!user?.emailVerified ? 'bg-orange-50 dark:bg-orange-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
                    {!user?.emailVerified ? (
                      <Clock className="w-6 h-6 text-orange-500" />
                    ) : (
                      <Shield className="w-6 h-6 text-amber-500" />
                    )}
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
                    <div className="text-xs text-muted-foreground">
                      {t("dashboard.pendingAccount.adminReviewContact")}
                    </div>
                    <a href="https://wa.me/34614916910?text=Hola!%20Mi%20cuenta%20est%C3%A1%20en%20revisi%C3%B3n%20administrativa" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full font-semibold h-10 rounded-full text-sm" data-testid="button-pending-whatsapp">
                        {t("dashboard.pendingAccount.askStatusWhatsApp")}
                      </Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notificaciones */}
            <Card className="rounded-2xl border-0 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
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
                    <BellRing className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
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
    { id: 'services', label: 'Mis trámites', icon: Package, mobileLabel: 'Trámites', tour: 'orders' },
    { id: 'notifications', label: 'Seguimiento', icon: BellRing, mobileLabel: 'Seguim.' },
    { id: 'messages', label: 'Soporte', icon: Mail, mobileLabel: 'Soporte', tour: 'messages' },
    { id: 'documents', label: 'Documentos', icon: FileText, mobileLabel: 'Docs' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, mobileLabel: 'Pagos' },
    { id: 'calendar', label: 'Calendario', icon: Calendar, mobileLabel: 'Fechas', tour: 'calendar' },
    { id: 'tools', label: 'Herramientas', icon: Calculator, mobileLabel: 'Tools' },
    { id: 'profile', label: 'Mi Perfil', icon: UserIcon, mobileLabel: 'Perfil', tour: 'profile' },
    ...(user?.isAdmin ? [
      { id: 'admin', label: 'Admin', icon: Shield, mobileLabel: 'Admin' }
    ] : []),
  ], [user?.isAdmin]);

  return (
    <div className="min-h-screen bg-muted dashboard-gradient font-sans overflow-x-hidden animate-page-in">
      <Navbar />
      <DashboardTour />
      <main className="pt-16 sm:pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-6 md:mb-10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div>
              <p className="text-accent font-bold tracking-wide text-xs md:text-sm mb-1 md:mb-2 uppercase">Área de Clientes</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Bienvenido, {(user?.firstName || 'Cliente').charAt(0).toUpperCase() + (user?.firstName || 'Cliente').slice(1).toLowerCase()}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mt-1 md:mt-2">
                Gestiona tu LLC de forma simple y clara.
              </p>
            </div>
            <Link href="/servicios#pricing">
              <Button className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-6 h-11 transition-all flex items-center justify-center gap-2 shadow-sm">
                <PlusCircle className="w-5 h-5" /> Nueva LLC
              </Button>
            </Link>
          </div>

          {!user?.emailVerified && (
            <Card className="mt-4 p-4 rounded-2xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-orange-800 dark:text-orange-300">Verifica tu email</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Tu cuenta está en revisión hasta que confirmes tu correo electrónico.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowEmailVerification(true)}
                  className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-full h-9 px-4"
                  data-testid="button-verify-email-header"
                >
                  Verificar
                </Button>
              </div>
            </Card>
          )}
        </header>

        <div className="flex overflow-x-auto pb-3 mb-6 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:gap-3 md:pb-4 md:mb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => setActiveTab(item.id as Tab)}
              size="sm"
              className={`flex items-center gap-1.5 sm:gap-2 rounded-full font-semibold text-[11px] sm:text-xs md:text-sm tracking-normal whitespace-nowrap shrink-0 h-10 px-4 md:px-5 transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-accent text-accent-foreground shadow-md' 
                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              data-testid={`button-tab-${item.id}`}
              {...('tour' in item && item.tour ? { 'data-tour': item.tour } : {})}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden md:inline">{item.label}</span>
              <span className="md:hidden">{item.mobileLabel}</span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1">
            
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
                    <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Centro de Documentación</h2>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona tus documentos y archivos</p>
                  </div>
                  
                  {notifications?.some((n: any) => n.type === 'action_required' && !n.isRead) && user?.accountStatus !== 'deactivated' && (
                    <Card className="rounded-xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <FileUp className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm">Documentos Solicitados</h4>
                          <div className="mt-2 space-y-1">
                            {notifications?.filter((n: any) => n.type === 'action_required' && !n.isRead).map((n: any) => (
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
                                    const res = await fetch('/api/user/documents/upload', {
                                      method: 'POST',
                                      body: formData,
                                      credentials: 'include'
                                    });
                                    if (res.ok) {
                                      toast({ title: "Documento subido", description: "Tu documento ha sido enviado correctamente." });
                                      queryClient.invalidateQueries({ queryKey: ['/api/user/documents'] });
                                      queryClient.invalidateQueries({ queryKey: ['/api/user/notifications'] });
                                    } else {
                                      toast({ title: "Error", description: "No se pudo subir el documento", variant: "destructive" });
                                    }
                                  } catch {
                                    toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
                                  }
                                }}
                                data-testid="input-upload-document"
                              />
                              <Button variant="outline" className="rounded-full text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300" asChild>
                                <span><FileUp className="w-3 h-3 mr-1" /> Subir Documento</span>
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
                            <h3 className="font-semibold text-foreground text-base md:text-lg">Subir Documento</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">PDF, JPG o PNG (máx. 10MB)</p>
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
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl">
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
                          <Label className="text-xs font-semibold text-foreground mb-2 block">Tipo de documento</Label>
                          <NativeSelect 
                            value={uploadDocType} 
                            onValueChange={setUploadDocType}
                            className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            data-testid="select-upload-doc-type-inline"
                          >
                            <NativeSelectItem value="passport">Pasaporte / Documento de Identidad</NativeSelectItem>
                            <NativeSelectItem value="address_proof">Prueba de Domicilio</NativeSelectItem>
                            <NativeSelectItem value="tax_id">Identificación Fiscal (NIF/CIF)</NativeSelectItem>
                            <NativeSelectItem value="other">Otro Documento</NativeSelectItem>
                          </NativeSelect>
                        </div>
                        
                        {uploadDocType === "other" && (
                          <div>
                            <Label className="text-xs font-semibold text-foreground mb-2 block">Descripción</Label>
                            <Textarea 
                              value={uploadNotes} 
                              onChange={(e) => setUploadNotes(e.target.value)} 
                              placeholder="Describe el documento..."
                              className="min-h-[70px] rounded-xl border-gray-200 text-base"
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
                              const res = await fetch('/api/user/documents/upload', {
                                method: 'POST',
                                body: formData,
                                credentials: 'include'
                              });
                              if (res.ok) {
                                toast({ title: "Documento subido", description: "Tu documento ha sido enviado correctamente." });
                                queryClient.invalidateQueries({ queryKey: ['/api/user/documents'] });
                                setUploadDialog({ open: false, file: null });
                              } else {
                                const data = await res.json();
                                toast({ title: "Error", description: data.message || "No se pudo subir el documento", variant: "destructive" });
                              }
                            } catch {
                              toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
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
                      <Card key={doc.id} className="rounded-xl md:rounded-2xl border-0 shadow-sm p-4 md:p-6 flex flex-col items-center text-center bg-white dark:bg-zinc-900">
                        <FileUp className="w-10 h-10 md:w-12 md:h-12 text-accent mb-3" />
                        <h3 className="font-bold text-primary mb-1 text-xs md:text-sm line-clamp-2">{doc.fileName}</h3>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground mb-3">{new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}</p>
                        <div className="flex gap-2 w-full">
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
                    <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Historial de Pagos</h2>
                    <p className="text-sm text-muted-foreground mt-1">Tus facturas y recibos</p>
                  </div>
                  <div className="space-y-4">
                    {(!orders || orders.length === 0) ? (
                      <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900 p-6 md:p-8 text-center" data-testid="widget-payments-empty">
                        <div className="flex flex-col items-center gap-3 md:gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-accent/10 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2 text-center">Sin pagos registrados</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">Tus facturas y recibos aparecerán aquí.</p>
                          </div>
                          <Link href="/servicios#pricing">
                            <Button className="bg-accent text-accent-foreground font-semibold rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-view-services">
                              <PlusCircle className="w-4 h-4 mr-2" /> Ver servicios
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ) : (
                      orders.map((order: any) => (
                        <Card key={order.id} className="rounded-2xl border-0 shadow-sm p-6 flex justify-between items-center bg-white dark:bg-zinc-900">
                          <div>
                            <p className="font-black text-xs md:text-sm">Factura {order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}>Factura</Button>
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.open(`/api/orders/${order.id}/receipt`, '_blank')}>Recibo</Button>
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
                      <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Mi Calendario Fiscal</h2>
                      <p className="text-sm text-muted-foreground mt-1">Fechas importantes y vencimientos de tu LLC</p>
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
                          { label: 'Creación', fullLabel: 'Creación de LLC', date: app.llcCreatedDate, icon: Building2, bgColor: 'bg-accent/10', textColor: 'text-accent', borderColor: 'border-accent/20' },
                          { label: 'Agente', fullLabel: 'Renovación Agente Registrado', date: app.agentRenewalDate, icon: UserCheck, bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-800' },
                          { label: 'IRS 1120', fullLabel: 'Formulario IRS 1120', date: app.irs1120DueDate, icon: FileText, bgColor: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-600 dark:text-orange-400', borderColor: 'border-orange-200 dark:border-orange-800' },
                          { label: 'IRS 5472', fullLabel: 'Formulario IRS 5472', date: app.irs5472DueDate, icon: FileText, bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-600 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-800' },
                          ...(stateHasAnnualReport ? [{ label: 'Anual', fullLabel: `Reporte Anual ${app.state}`, date: app.annualReportDueDate, icon: Newspaper, bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-800' }] : []),
                        ];
                        const hasDates = dates.some(d => d.date);
                        const sortedDates = dates.filter(d => d.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        const nextDeadline = sortedDates.find(d => new Date(d.date) > new Date());
                        
                        return (
                          <Card key={order.id} className={`rounded-xl md:rounded-2xl border shadow-sm bg-white dark:bg-zinc-900 overflow-hidden ${isCancelled ? 'opacity-50' : ''}`}>
                            <CardHeader className="p-3 md:p-4 pb-2 md:pb-3 border-b bg-muted/30">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <CardTitle className="text-sm md:text-base font-black flex items-center gap-2 flex-wrap">
                                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm md:text-base">{app.companyName || 'LLC en proceso'}</span>
                                    <span className="text-[10px] md:text-xs font-normal text-muted-foreground">{app.state}</span>
                                  </div>
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isCancelled && <Badge variant="destructive" className="text-[9px] md:text-[10px]">Cancelada</Badge>}
                                  {isInReview && <Badge className="text-[9px] md:text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">En revisión</Badge>}
                                  {!isCancelled && !isInReview && nextDeadline && (
                                    <Badge className={`text-[9px] md:text-[10px] ${nextDeadline.bgColor} ${nextDeadline.textColor}`}>
                                      Próximo: {nextDeadline.label}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4">
                              {isCancelled ? (
                                <div className="text-center py-6 md:py-8">
                                  <XCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto text-red-300 mb-2 md:mb-3" />
                                  <p className="text-xs md:text-sm text-muted-foreground">Esta LLC fue cancelada</p>
                                </div>
                              ) : isInReview ? (
                                <div className="text-center py-6 md:py-8">
                                  <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto text-yellow-400 mb-2 md:mb-3" />
                                  <p className="text-xs md:text-sm text-muted-foreground">Tu LLC está en proceso</p>
                                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Las fechas aparecerán cuando esté activa</p>
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
                                            <span className="text-[9px] md:text-[10px] text-green-600 dark:text-green-400 font-medium">Completado</span>
                                          </div>
                                        ) : isUrgent ? (
                                          <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3 text-red-500" />
                                            <span className="text-[9px] md:text-[10px] text-red-600 dark:text-red-400 font-bold">{daysUntil} días</span>
                                          </div>
                                        ) : isWarning ? (
                                          <div className="mt-1.5 md:mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-orange-500" />
                                            <span className="text-[9px] md:text-[10px] text-orange-600 dark:text-orange-400 font-medium">{daysUntil} días</span>
                                          </div>
                                        ) : (
                                          <div className="mt-1.5 md:mt-2">
                                            <span className="text-[9px] md:text-[10px] text-muted-foreground">{daysUntil} días</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-6 md:py-8">
                                  <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground/30 mb-2 md:mb-3" />
                                  <p className="text-xs md:text-sm text-muted-foreground">Fechas pendientes de configuración</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900 p-6 md:p-8 text-center" data-testid="widget-calendar-empty">
                      <div className="flex flex-col items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-accent/10 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2 text-center">Mi Calendario Fiscal</h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">Tus vencimientos fiscales aparecerán aquí una vez constituyas tu LLC.</p>
                        </div>
                        <Link href="/servicios#pricing">
                          <Button className="bg-accent text-accent-foreground font-semibold rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-start-llc-calendar">
                            Constituir mi LLC
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
                    <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Herramientas</h2>
                    <p className="text-sm text-muted-foreground mt-1">Utilidades para gestionar tu negocio</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground mb-1">Generador de Facturas</h3>
                          <p className="text-sm text-muted-foreground mb-4">Crea facturas profesionales en PDF con los datos de tu LLC americana.</p>
                          <Link href="/tools/invoice">
                            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full" size="sm" data-testid="button-invoice-generator">
                              Crear Factura <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calculator className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground mb-1">Calculadora de Precios</h3>
                          <p className="text-sm text-muted-foreground mb-4">Calcula precios con márgenes y costos para tus productos o servicios.</p>
                          <Link href="/tools/price-calculator">
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full" size="sm" data-testid="button-price-calculator">
                              Calcular Precio <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
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
                />
              )}

              {activeTab === 'admin' && user?.isAdmin && (
                <div key="admin" className="space-y-6">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4 md:mb-6">
                    {[
                      { id: 'dashboard', label: 'Métricas', mobileLabel: 'Métricas', icon: BarChart3 },
                      { id: 'orders', label: 'Pedidos', mobileLabel: 'Pedidos', icon: Package },
                      { id: 'incomplete', label: 'Incompletas', mobileLabel: 'Incompl.', icon: AlertCircle },
                      { id: 'users', label: 'Clientes', mobileLabel: 'Clientes', icon: Users },
                      { id: 'facturas', label: 'Facturas', mobileLabel: 'Facturas', icon: Receipt },
                      { id: 'calendar', label: 'Fechas', mobileLabel: 'Fechas', icon: Calendar },
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
                          : 'bg-white dark:bg-zinc-900 text-muted-foreground border border-border hover:border-accent/50'
                        }`}
                        data-testid={`button-admin-tab-${item.id}`}
                      >
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.mobileLabel}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 shadow-sm" onClick={() => setCreateUserDialog(true)} data-testid="button-create-user">
                      <Plus className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Nuevo Cliente</span>
                      <span className="sm:hidden">Cliente</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 shadow-sm" onClick={() => setCreateOrderDialog(true)} data-testid="button-create-order">
                      <Plus className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Nuevo Pedido</span>
                      <span className="sm:hidden">Pedido</span>
                    </Button>
                  </div>
                  
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
                        {adminOrders?.map(order => {
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
                              <NativeSelect 
                                value={order.status} 
                                onValueChange={val => updateStatusMutation.mutate({ id: order.id, status: val })}
                                className="w-28 h-9 rounded-lg text-xs bg-white dark:bg-zinc-900 border px-3 relative z-0"
                              >
                                <NativeSelectItem value="pending">Pendiente</NativeSelectItem>
                                <NativeSelectItem value="paid">Pagado</NativeSelectItem>
                                <NativeSelectItem value="filed">Presentado</NativeSelectItem>
                                <NativeSelectItem value="cancelled">Cancelado</NativeSelectItem>
                              </NativeSelect>
                            </div>
                            <div className="flex gap-2 flex-wrap">
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
                        {adminUsers?.map(u => (
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
                                  className="w-full h-9 rounded-full text-xs bg-white dark:bg-zinc-900 border shadow-sm px-3"
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
                            <div key={order.id} className="border-2 rounded-2xl p-4 md:p-5 bg-gray-50/50 dark:bg-zinc-800/50">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                <div>
                                  <p className="font-black text-base md:text-lg">{app.companyName || 'LLC pendiente'}</p>
                                  <p className="text-xs md:text-sm text-muted-foreground">{order.user?.firstName} {order.user?.lastName} • {app.state}</p>
                                </div>
                                <Badge variant="outline" className="text-xs w-fit">{fiscalOrderCode}</Badge>
                              </div>
                              {/* Fechas - Grid compacto en móvil */}
                              <div className="grid grid-cols-2 gap-2 md:gap-4">
                                <div className="bg-white dark:bg-zinc-900 p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">Creación LLC</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
                                    defaultValue={app.llcCreatedDate ? new Date(app.llcCreatedDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'llcCreatedDate', value: e.target.value })}
                                    data-testid={`input-llc-created-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">Renovación Agente</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
                                    defaultValue={app.agentRenewalDate ? new Date(app.agentRenewalDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'agentRenewalDate', value: e.target.value })}
                                    data-testid={`input-agent-renewal-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">IRS 1120</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
                                    defaultValue={app.irs1120DueDate ? new Date(app.irs1120DueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs1120DueDate', value: e.target.value })}
                                    data-testid={`input-irs1120-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-2 md:p-3 rounded-lg md:rounded-xl border">
                                  <Label className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 block truncate">IRS 5472</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-3"
                                    defaultValue={app.irs5472DueDate ? new Date(app.irs5472DueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs5472DueDate', value: e.target.value })}
                                    data-testid={`input-irs5472-${app.id}`}
                                  />
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-2 md:p-3 rounded-lg md:rounded-xl border col-span-2">
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
                                    toast({ title: "Estado actualizado" });
                                  } catch { toast({ title: "Error", variant: "destructive" }); }
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
                                      toast({ title: "Documento eliminado" });
                                    } catch { toast({ title: "Error al eliminar", variant: "destructive" }); }
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
                                    toast({ title: "Suscriptor eliminado" });
                                  } catch (e) {
                                    toast({ title: "Error al eliminar", variant: "destructive" });
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
                                        toast({ title: "Mensaje archivado" });
                                      } catch { toast({ title: "Error al archivar", variant: "destructive" }); }
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
                                        toast({ title: "Mensaje eliminado" });
                                      } catch { toast({ title: "Error al eliminar", variant: "destructive" }); }
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
                              <div className="flex gap-2">
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
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
                                      toast({ title: dc.isActive ? "Código desactivado" : "Código activado" });
                                    } catch (e) {
                                      toast({ title: "Error", variant: "destructive" });
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
                                      toast({ title: "Código eliminado" });
                                    } catch (e) {
                                      toast({ title: "Error al eliminar", variant: "destructive" });
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
            <section className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-black tracking-tight text-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" /> Notificaciones
                </h3>
                <p className="text-xs text-muted-foreground mt-1">El progreso de tu LLC, paso a paso</p>
              </div>
              <div className="space-y-5">
                {orders && orders.length > 0 ? (
                  <>
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 mb-4">
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
                        <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div><p className="text-xs font-black">Pedido Recibido</p></div>
                        <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-gray-100" /><p className="text-xs text-gray-400">Verificación de Datos</p></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4"><AlertCircle className="w-8 h-8 text-gray-200 dark:text-zinc-600 mx-auto mb-2" /><p className="text-xs text-muted-foreground">No hay trámites en curso</p><p className="text-[10px] text-muted-foreground/70 mt-1">Cuando contrates un servicio, aquí podrás seguir todo el proceso.</p></div>
                )}
              </div>
            </section>
            <section className="bg-accent/10 p-6 md:p-8 rounded-[2rem] border-2 border-accent/20 mt-8 mb-12">
              <h3 className="text-base font-semibold text-foreground mb-2">¿Tienes alguna duda?</h3>
              <p className="text-xs text-primary/70 mb-5 leading-relaxed">Estamos aquí para ayudarte, escríbenos y te responderemos lo antes posible!</p>
              <a href="https://wa.me/34614916910?text=Hola!%20Tengo%20una%20duda%20sobre%20mi%20LLC" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-accent text-accent-foreground font-semibold rounded-full py-5">Hablar con un asesor</Button>
              </a>
            </section>
          </div>
        </div>
      </main>

      {user?.isAdmin && (
        <>
          <Sheet open={noteDialog.open} onOpenChange={(open) => setNoteDialog({ open, user: open ? noteDialog.user : null })}>
            <SheetContent className="bg-white dark:bg-zinc-900">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-semibold text-foreground">Enviar Mensaje al Cliente</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">El cliente recibirá notificación en su panel y email</SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Título</Label>
                  <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Título del mensaje" className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800" data-testid="input-note-title" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Mensaje</Label>
                  <Textarea value={noteMessage} onChange={e => setNoteMessage(e.target.value)} placeholder="Escribe tu mensaje..." rows={4} className="w-full rounded-xl border-gray-200 focus:border-accent" data-testid="input-note-message" />
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
                <Button onClick={() => noteDialog.user?.id && sendNoteMutation.mutate({ userId: noteDialog.user.id, title: noteTitle, message: noteMessage, type: noteType })} disabled={!noteTitle || !noteMessage || sendNoteMutation.isPending} className="w-full bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-send-note">
                  {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Mensaje'}
                </Button>
                <Button variant="outline" onClick={() => setNoteDialog({ open: false, user: null })} className="w-full rounded-full">Cancelar</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
            <SheetContent className="bg-white dark:bg-zinc-900 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-semibold text-foreground">Editar Usuario</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">Modifica los datos del cliente</SheetDescription>
              </SheetHeader>
              {editingUser && (
                <div className="space-y-3 pb-20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1.5 block">Nombre</Label>
                      <Input value={editingUser.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-firstname" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1.5 block">Apellidos</Label>
                      <Input value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-lastname" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">Email</Label>
                    <Input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-email" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">Teléfono</Label>
                    <Input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-phone" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1.5 block">Tipo ID</Label>
                      <NativeSelect 
                        value={editingUser.idType || ''} 
                        onValueChange={val => setEditingUser({...editingUser, idType: val})}
                        placeholder="Seleccionar"
                        className="w-full rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm"
                      >
                        <NativeSelectItem value="dni">DNI</NativeSelectItem>
                        <NativeSelectItem value="nie">NIE</NativeSelectItem>
                        <NativeSelectItem value="passport">Pasaporte</NativeSelectItem>
                      </NativeSelect>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1.5 block">Número ID</Label>
                      <Input value={editingUser.idNumber || ''} onChange={e => setEditingUser({...editingUser, idNumber: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-idnumber" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">Fecha Nacimiento</Label>
                    <Input type="date" value={editingUser.birthDate || ''} onChange={e => setEditingUser({...editingUser, birthDate: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-birthdate" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">Actividad de Negocio</Label>
                    <NativeSelect 
                      value={editingUser.businessActivity || ''} 
                      onValueChange={val => setEditingUser({...editingUser, businessActivity: val})}
                      placeholder="Seleccionar actividad"
                      className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm"
                      data-testid="select-edit-activity"
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
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">Dirección</Label>
                    <Input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} placeholder="Calle y número" className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-address" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1.5 block">Ciudad</Label>
                      <Input value={editingUser.city || ''} onChange={e => setEditingUser({...editingUser, city: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-city" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1.5 block">CP</Label>
                      <Input value={editingUser.postalCode || ''} onChange={e => setEditingUser({...editingUser, postalCode: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-postal" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1.5 block">Provincia</Label>
                      <Input value={editingUser.province || ''} onChange={e => setEditingUser({...editingUser, province: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-province" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1.5 block">País</Label>
                      <Input value={editingUser.country || ''} onChange={e => setEditingUser({...editingUser, country: e.target.value})} className="rounded-xl h-10 px-3 border border-gray-200 dark:border-zinc-700 text-sm" data-testid="input-edit-country" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">Notas Internas</Label>
                    <Textarea value={editingUser.internalNotes || ''} onChange={e => setEditingUser({...editingUser, internalNotes: e.target.value})} rows={2} className="rounded-xl border-gray-200 text-sm" data-testid="input-edit-notes" />
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
                  <div className="flex flex-col gap-2 pt-4 border-t mt-4">
                    <Button onClick={() => editingUser.id && updateUserMutation.mutate({ id: editingUser.id, ...editingUser })} disabled={updateUserMutation.isPending} className="w-full bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-save-user">
                      {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingUser(null)} className="w-full rounded-full">Cancelar</Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          <Sheet open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, user: open ? deleteConfirm.user : null })}>
            <SheetContent className="bg-white dark:bg-zinc-900">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-black text-red-600">Eliminar Usuario</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm.user?.firstName} {deleteConfirm.user?.lastName}</strong>?</p>
                <p className="text-xs text-red-500 mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="destructive" onClick={() => deleteConfirm.user?.id && deleteUserMutation.mutate(deleteConfirm.user.id)} disabled={deleteUserMutation.isPending} className="w-full rounded-full font-black" data-testid="button-confirm-delete">
                  {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
                <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, user: null })} className="w-full rounded-full">Cancelar</Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet open={deleteOrderConfirm.open} onOpenChange={(open) => setDeleteOrderConfirm({ open, order: open ? deleteOrderConfirm.order : null })}>
            <SheetContent className="bg-white dark:bg-zinc-900">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-black text-red-600">Eliminar Pedido</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar el pedido <strong>{deleteOrderConfirm.order?.application?.requestCode || deleteOrderConfirm.order?.maintenanceApplication?.requestCode || deleteOrderConfirm.order?.invoiceNumber}</strong>?</p>
                <p className="text-xs text-muted-foreground mt-2">Cliente: {deleteOrderConfirm.order?.user?.firstName} {deleteOrderConfirm.order?.user?.lastName}</p>
                <p className="text-xs text-red-500 mt-2">Esta acción eliminará el pedido, la solicitud LLC asociada y todos los documentos relacionados.</p>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="destructive" onClick={() => deleteOrderConfirm.order?.id && deleteOrderMutation.mutate(deleteOrderConfirm.order.id)} disabled={deleteOrderMutation.isPending} className="w-full rounded-full font-black" data-testid="button-confirm-delete-order">
                  {deleteOrderMutation.isPending ? 'Eliminando...' : 'Eliminar Pedido'}
                </Button>
                <Button variant="outline" onClick={() => setDeleteOrderConfirm({ open: false, order: null })} className="w-full rounded-full">Cancelar</Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet open={generateInvoiceDialog.open} onOpenChange={(open) => setGenerateInvoiceDialog({ open, order: open ? generateInvoiceDialog.order : null })}>
            <SheetContent className="bg-white dark:bg-zinc-900">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-semibold text-foreground">Generar Factura</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">Pedido: <strong>{generateInvoiceDialog.order?.application?.requestCode || generateInvoiceDialog.order?.maintenanceApplication?.requestCode || generateInvoiceDialog.order?.invoiceNumber}</strong></p>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Importe</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={orderInvoiceAmount} 
                    onChange={e => setOrderInvoiceAmount(e.target.value)}
                    className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" 
                    placeholder="739.00"
                    data-testid="input-invoice-amount"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Divisa</Label>
                  <NativeSelect 
                    value={orderInvoiceCurrency} 
                    onValueChange={setOrderInvoiceCurrency}
                    className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
                  >
                    <NativeSelectItem value="EUR">EUR (€)</NativeSelectItem>
                    <NativeSelectItem value="USD">USD ($)</NativeSelectItem>
                  </NativeSelect>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
                <Button 
                  className="w-full bg-accent text-accent-foreground font-semibold rounded-full"
                  disabled={!orderInvoiceAmount || isNaN(parseFloat(orderInvoiceAmount)) || parseFloat(orderInvoiceAmount) <= 0 || isGeneratingInvoice}
                  onClick={async () => {
                    setIsGeneratingInvoice(true);
                    try {
                      const amountCents = Math.round(parseFloat(orderInvoiceAmount) * 100);
                      if (amountCents <= 0) {
                        toast({ title: "Error", description: "El importe debe ser mayor que 0", variant: "destructive" });
                        return;
                      }
                      const res = await apiRequest("POST", `/api/admin/orders/${generateInvoiceDialog.order?.id}/generate-invoice`, {
                        amount: amountCents,
                        currency: orderInvoiceCurrency
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.message || "Error al generar factura");
                      }
                      toast({ title: "Factura generada", description: `Factura creada por ${orderInvoiceAmount} ${orderInvoiceCurrency}` });
                      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
                      window.open(`/api/orders/${generateInvoiceDialog.order?.id}/invoice`, '_blank');
                      setGenerateInvoiceDialog({ open: false, order: null });
                      setOrderInvoiceAmount("");
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message || "No se pudo generar la factura", variant: "destructive" });
                    } finally {
                      setIsGeneratingInvoice(false);
                    }
                  }}
                  data-testid="button-confirm-generate-invoice"
                >
                  {isGeneratingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generar Factura'}
                </Button>
                <Button variant="outline" onClick={() => setGenerateInvoiceDialog({ open: false, order: null })} className="w-full rounded-full">Cancelar</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={docDialog.open} onOpenChange={(open) => setDocDialog({ open, user: open ? docDialog.user : null })}>
            <SheetContent className="bg-white dark:bg-zinc-900">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-semibold text-foreground">Solicitar Documentos</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">Solicita documentos al cliente</SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Tipo de documento</Label>
                  <NativeSelect 
                    value={docType} 
                    onValueChange={setDocType}
                    placeholder="Seleccionar tipo..."
                    className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
                  >
                    <NativeSelectItem value="passport">Pasaporte / Documento de Identidad</NativeSelectItem>
                    <NativeSelectItem value="address_proof">Prueba de Domicilio</NativeSelectItem>
                    <NativeSelectItem value="tax_id">Identificación Fiscal (NIF/CIF)</NativeSelectItem>
                    <NativeSelectItem value="other">Otro Documento</NativeSelectItem>
                  </NativeSelect>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Mensaje</Label>
                  <Textarea value={docMessage} onChange={e => setDocMessage(e.target.value)} placeholder="Mensaje para el cliente" rows={3} className="w-full rounded-xl border-gray-200" data-testid="input-doc-message" />
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
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
                }} disabled={!docType || sendNoteMutation.isPending} className="w-full bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-request-doc">
                  {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solicitar Documento'}
                </Button>
                <Button variant="outline" onClick={() => setDocDialog({ open: false, user: null })} className="w-full rounded-full">Cancelar</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={invoiceDialog.open} onOpenChange={(open) => setInvoiceDialog({ open, user: open ? invoiceDialog.user : null })}>
            <SheetContent className="bg-white dark:bg-zinc-900">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-semibold text-foreground">Crear Factura</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">Genera una factura para el cliente</SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">Cliente: <strong>{invoiceDialog.user?.firstName} {invoiceDialog.user?.lastName}</strong></p>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Concepto</Label>
                  <Input 
                    value={invoiceConcept} 
                    onChange={e => setInvoiceConcept(e.target.value)} 
                    placeholder="Ej: Servicio de consultoría" 
                    className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
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
                      className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
                      data-testid="input-invoice-amount"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Moneda</Label>
                    <NativeSelect 
                      value={invoiceCurrency} 
                      onValueChange={setInvoiceCurrency}
                      className="w-full rounded-xl h-11 px-3 border border-gray-200 dark:border-zinc-700"
                      data-testid="select-invoice-currency"
                    >
                      <NativeSelectItem value="EUR">EUR</NativeSelectItem>
                      <NativeSelectItem value="USD">USD</NativeSelectItem>
                    </NativeSelect>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
                <Button 
                  onClick={() => invoiceDialog.user?.id && createInvoiceMutation.mutate({ 
                    userId: invoiceDialog.user.id, 
                    concept: invoiceConcept, 
                    amount: Math.round(parseFloat(invoiceAmount) * 100),
                    currency: invoiceCurrency
                  })} 
                  disabled={!invoiceConcept || !invoiceAmount || createInvoiceMutation.isPending}
                  className="w-full bg-accent text-accent-foreground font-semibold rounded-full"
                  data-testid="button-create-invoice"
                >
                  {createInvoiceMutation.isPending ? 'Creando...' : 'Crear Factura'}
                </Button>
                <Button variant="outline" onClick={() => setInvoiceDialog({ open: false, user: null })} className="w-full rounded-full">Cancelar</Button>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}

      <Sheet open={deleteOwnAccountDialog} onOpenChange={setDeleteOwnAccountDialog}>
        <SheetContent className="bg-white dark:bg-zinc-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-black text-red-600">Eliminar Mi Cuenta</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar tu cuenta permanentemente?</p>
            <p className="text-xs text-red-500 mt-2">Esta acción no se puede deshacer. Todos tus datos serán eliminados.</p>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Button variant="destructive" onClick={() => deleteOwnAccountMutation.mutate()} disabled={deleteOwnAccountMutation.isPending} className="w-full rounded-full font-black" data-testid="button-confirm-delete-account">
              {deleteOwnAccountMutation.isPending ? 'Eliminando...' : 'Eliminar Mi Cuenta'}
            </Button>
            <Button variant="outline" onClick={() => setDeleteOwnAccountDialog(false)} className="w-full rounded-full">Cancelar</Button>
          </div>
        </SheetContent>
      </Sheet>

      
      <Sheet open={createUserDialog} onOpenChange={setCreateUserDialog}>
        <SheetContent className="bg-white dark:bg-zinc-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-semibold text-foreground">Crear Nuevo Cliente</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">Completa los datos del nuevo cliente</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">Nombre</Label>
                <Input value={newUserData.firstName} onChange={e => setNewUserData(p => ({ ...p, firstName: e.target.value }))} placeholder="Nombre" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" data-testid="input-create-user-firstname" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">Apellidos</Label>
                <Input value={newUserData.lastName} onChange={e => setNewUserData(p => ({ ...p, lastName: e.target.value }))} placeholder="Apellidos" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" data-testid="input-create-user-lastname" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Email</Label>
              <Input type="email" value={newUserData.email} onChange={e => setNewUserData(p => ({ ...p, email: e.target.value }))} placeholder="email@ejemplo.com" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" data-testid="input-create-user-email" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Teléfono</Label>
              <Input value={newUserData.phone} onChange={e => setNewUserData(p => ({ ...p, phone: e.target.value }))} placeholder="+34 600 000 000" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" data-testid="input-create-user-phone" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Contraseña</Label>
              <Input type="password" value={newUserData.password} onChange={e => setNewUserData(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 8 caracteres" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" data-testid="input-create-user-password" />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
            <Button onClick={() => createUserMutation.mutate(newUserData)} disabled={createUserMutation.isPending || !newUserData.email || !newUserData.password} className="w-full bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-confirm-create-user">
              {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Cliente'}
            </Button>
            <Button variant="outline" onClick={() => setCreateUserDialog(false)} className="w-full rounded-full" data-testid="button-cancel-create-user">Cancelar</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={createOrderDialog} onOpenChange={setCreateOrderDialog}>
        <SheetContent className="bg-white dark:bg-zinc-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-semibold text-foreground">Crear Nuevo Pedido</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">Configura el pedido para el cliente</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Cliente</Label>
              <NativeSelect 
                value={newOrderData.userId} 
                onValueChange={val => setNewOrderData(p => ({ ...p, userId: val }))}
                placeholder="Seleccionar cliente..."
                className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
                data-testid="select-order-user"
              >
                {adminUsers?.map((u: any) => (
                  <NativeSelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</NativeSelectItem>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Estado (LLC)</Label>
              <NativeSelect 
                value={newOrderData.state} 
                onValueChange={val => setNewOrderData(p => ({ ...p, state: val }))}
                placeholder="Seleccionar estado"
                className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
                data-testid="select-order-state"
              >
                <NativeSelectItem value="New Mexico">New Mexico - 739€</NativeSelectItem>
                <NativeSelectItem value="Wyoming">Wyoming - 899€</NativeSelectItem>
                <NativeSelectItem value="Delaware">Delaware - 1399€</NativeSelectItem>
              </NativeSelect>
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Importe (€)</Label>
              <Input type="number" value={newOrderData.amount} onChange={e => setNewOrderData(p => ({ ...p, amount: e.target.value }))} placeholder="739" className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" data-testid="input-order-amount" />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
            <Button onClick={() => createOrderMutation.mutate(newOrderData)} disabled={createOrderMutation.isPending || !newOrderData.userId || !newOrderData.amount} className="w-full bg-accent text-accent-foreground font-semibold rounded-full" data-testid="button-confirm-create-order">
              {createOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Pedido'}
            </Button>
            <Button variant="outline" onClick={() => setCreateOrderDialog(false)} className="w-full rounded-full" data-testid="button-cancel-create-order">Cancelar</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={discountCodeDialog.open} onOpenChange={(open) => setDiscountCodeDialog({ open, code: open ? discountCodeDialog.code : null })}>
        <SheetContent className="bg-white dark:bg-zinc-900 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-semibold text-foreground">
              {discountCodeDialog.code ? 'Editar Código de Descuento' : 'Nuevo Código de Descuento'}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {discountCodeDialog.code ? 'Modifica los datos del código' : 'Configura un nuevo código de descuento'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 pb-20">
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Código</Label>
              <Input 
                value={newDiscountCode.code} 
                onChange={e => setNewDiscountCode(p => ({ ...p, code: e.target.value.toUpperCase() }))} 
                className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700 uppercase" 
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
                  className="w-full rounded-xl h-11 px-3 border border-gray-200 dark:border-zinc-700"
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
                  className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" 
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
                  className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" 
                  data-testid="input-discount-min-amount" 
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">Usos max.</Label>
                <Input 
                  type="number" 
                  value={newDiscountCode.maxUses} 
                  onChange={e => setNewDiscountCode(p => ({ ...p, maxUses: e.target.value }))} 
                  className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" 
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
                  className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" 
                  data-testid="input-discount-valid-from" 
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">Hasta</Label>
                <Input 
                  type="date" 
                  value={newDiscountCode.validUntil} 
                  onChange={e => setNewDiscountCode(p => ({ ...p, validUntil: e.target.value }))} 
                  className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700" 
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
            <div className="flex flex-col gap-3 pt-4 border-t mt-4">
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
                      toast({ title: "Código actualizado" });
                    } else {
                      await apiRequest("POST", "/api/admin/discount-codes", payload);
                      toast({ title: "Código creado" });
                    }
                    refetchDiscountCodes();
                    setDiscountCodeDialog({ open: false, code: null });
                  } catch (e: any) {
                    toast({ title: "Error", description: e.message || "No se pudo guardar el código", variant: "destructive" });
                  }
                }} 
                disabled={!newDiscountCode.code || !newDiscountCode.discountValue} 
                className="w-full bg-accent text-accent-foreground font-semibold rounded-full" 
                data-testid="button-save-discount"
              >
                {discountCodeDialog.code ? 'Guardar Cambios' : 'Crear Código'}
              </Button>
              <Button variant="outline" onClick={() => setDiscountCodeDialog({ open: false, code: null })} className="w-full rounded-full" data-testid="button-cancel-discount">Cancelar</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showEmailVerification} onOpenChange={(open) => {
        setShowEmailVerification(open);
        if (!open) {
          setEmailVerificationCode("");
        }
      }}>
        <SheetContent className="bg-white dark:bg-zinc-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-black">Verifica tu correo electrónico</SheetTitle>
            <SheetDescription>Te hemos enviado un código de verificación para confirmar tu email</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-foreground block mb-2">Código de verificación</Label>
              <Input
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="rounded-xl text-center text-2xl font-black border-gray-200 h-14 tracking-[0.5em]"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                data-testid="input-email-verification-code"
              />
            </div>
            <Button
              onClick={async () => {
                if (!emailVerificationCode || emailVerificationCode.length < 6) {
                  toast({ title: "Introduce el código de 6 dígitos", variant: "destructive" });
                  return;
                }
                setIsVerifyingEmail(true);
                try {
                  const res = await apiRequest("POST", "/api/auth/verify-email", { code: emailVerificationCode });
                  const result = await res.json();
                  if (result.success) {
                    await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
                    toast({ title: "Email verificado correctamente" });
                    setShowEmailVerification(false);
                    setEmailVerificationCode("");
                  }
                } catch (err: any) {
                  toast({ 
                    title: "Código incorrecto", 
                    description: err.message || "Inténtalo de nuevo o solicita un nuevo código", 
                    variant: "destructive" 
                  });
                } finally {
                  setIsVerifyingEmail(false);
                }
              }}
              disabled={isVerifyingEmail || emailVerificationCode.length < 6}
              size="lg"
              className="w-full bg-accent text-accent-foreground font-semibold rounded-full"
              data-testid="button-verify-email-code"
            >
              {isVerifyingEmail ? <Loader2 className="animate-spin" /> : "Verificar mi email"}
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">¿No has recibido el código?</p>
              <Button
                variant="link"
                onClick={async () => {
                  setIsResendingCode(true);
                  try {
                    await apiRequest("POST", "/api/auth/resend-verification");
                    toast({ title: "Código enviado", description: "Revisa tu email" });
                  } catch (err) {
                    toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
                  } finally {
                    setIsResendingCode(false);
                  }
                }}
                disabled={isResendingCode}
                className="text-accent p-0 h-auto"
                data-testid="button-resend-verification-code"
              >
                {isResendingCode ? "Enviando..." : "Reenviar código"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={paymentLinkDialog.open} onOpenChange={(open) => {
        setPaymentLinkDialog({ open, user: open ? paymentLinkDialog.user : null });
        if (!open) {
          setPaymentLinkUrl("");
          setPaymentLinkAmount("");
          setPaymentLinkMessage("");
        }
      }}>
        <SheetContent className="bg-white dark:bg-zinc-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-black">Enviar Link de Pago</SheetTitle>
            <SheetDescription>
              Envía un enlace de pago a {paymentLinkDialog.user?.firstName} {paymentLinkDialog.user?.lastName}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-foreground block mb-2">Link de pago (URL)</Label>
              <Input
                value={paymentLinkUrl}
                onChange={(e) => setPaymentLinkUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
                data-testid="input-payment-link-url"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground block mb-2">Importe</Label>
              <Input
                value={paymentLinkAmount}
                onChange={(e) => setPaymentLinkAmount(e.target.value)}
                placeholder="Ej: 739€"
                className="rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
                data-testid="input-payment-link-amount"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground block mb-2">Mensaje (opcional)</Label>
              <Textarea
                value={paymentLinkMessage}
                onChange={(e) => setPaymentLinkMessage(e.target.value)}
                placeholder="Mensaje adicional para el cliente..."
                className="rounded-xl border-gray-200"
                rows={3}
                data-testid="input-payment-link-message"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
            <Button
              onClick={async () => {
                if (!paymentLinkUrl || !paymentLinkAmount) {
                  toast({ title: "Completa todos los campos requeridos", variant: "destructive" });
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
                  toast({ title: "Link de pago enviado", description: `Se ha enviado el link a ${paymentLinkDialog.user?.email}` });
                  setPaymentLinkDialog({ open: false, user: null });
                  setPaymentLinkUrl("");
                  setPaymentLinkAmount("");
                  setPaymentLinkMessage("");
                } catch (err: any) {
                  toast({ title: "Error", description: err.message || "No se pudo enviar el link", variant: "destructive" });
                } finally {
                  setIsSendingPaymentLink(false);
                }
              }}
              disabled={isSendingPaymentLink || !paymentLinkUrl || !paymentLinkAmount}
              className="w-full bg-accent text-accent-foreground font-semibold rounded-full"
              data-testid="button-send-payment-link"
            >
              {isSendingPaymentLink ? <Loader2 className="animate-spin" /> : "Enviar Link de Pago"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPaymentLinkDialog({ open: false, user: null })}
              className="w-full rounded-full"
            >
              Cancelar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={adminDocUploadDialog.open} onOpenChange={(open) => {
        setAdminDocUploadDialog({ open, order: open ? adminDocUploadDialog.order : null });
        if (!open) {
          setAdminDocFile(null);
          setAdminDocType("articles_of_organization");
        }
      }}>
        <SheetContent className="bg-white dark:bg-zinc-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-semibold text-foreground">Subir Documento para Cliente</SheetTitle>
            <SheetDescription>
              {adminDocUploadDialog.order?.userId 
                ? `Usuario: ${adminDocUploadDialog.order?.user?.firstName} ${adminDocUploadDialog.order?.user?.lastName}`
                : `Pedido: ${adminDocUploadDialog.order?.application?.requestCode || adminDocUploadDialog.order?.maintenanceApplication?.requestCode || adminDocUploadDialog.order?.invoiceNumber}`
              }
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-foreground block mb-2">Tipo de Documento</Label>
              <NativeSelect
                value={adminDocType}
                onValueChange={setAdminDocType}
                className="w-full rounded-xl h-11 px-4 border border-gray-200 dark:border-zinc-700"
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
                <div className={`p-4 border-2 border-dashed rounded-xl text-center ${adminDocFile ? 'border-accent bg-accent/5' : 'border-gray-200 dark:border-zinc-700'}`}>
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
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
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
                  const res = await fetch('/api/admin/documents/upload', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                  });
                  if (res.ok) {
                    toast({ title: "Documento subido", description: "El documento ha sido añadido al expediente del cliente." });
                    queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
                    setAdminDocUploadDialog({ open: false, order: null });
                    setAdminDocFile(null);
                  } else {
                    const data = await res.json();
                    toast({ title: "Error", description: data.message || "No se pudo subir el documento", variant: "destructive" });
                  }
                } catch {
                  toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
                } finally {
                  setIsUploadingAdminDoc(false);
                }
              }}
              className="w-full bg-accent text-accent-foreground font-semibold rounded-full"
              data-testid="button-admin-upload-doc"
            >
              {isUploadingAdminDoc ? <Loader2 className="animate-spin" /> : "Subir Documento"}
            </Button>
            <Button variant="outline" onClick={() => setAdminDocUploadDialog({ open: false, order: null })} className="w-full rounded-full">Cancelar</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={resetPasswordDialog.open} onOpenChange={(open) => {
        setResetPasswordDialog({ open, user: open ? resetPasswordDialog.user : null });
        if (!open) setNewAdminPassword("");
      }}>
        <SheetContent className="bg-white dark:bg-zinc-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-black">Restablecer Contraseña</SheetTitle>
            <SheetDescription>Nueva contraseña para {resetPasswordDialog.user?.firstName} {resetPasswordDialog.user?.lastName}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-foreground block mb-2">Nueva Contraseña</Label>
              <Input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="rounded-xl h-12 border-gray-200"
                data-testid="input-admin-new-password"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
            <Button
              disabled={newAdminPassword.length < 8 || isResettingPassword}
              onClick={async () => {
                if (!resetPasswordDialog.user?.id || newAdminPassword.length < 8) return;
                setIsResettingPassword(true);
                try {
                  await apiRequest("POST", `/api/admin/users/${resetPasswordDialog.user.id}/reset-password`, { newPassword: newAdminPassword });
                  toast({ title: "Contraseña actualizada", description: "El cliente recibirá un email notificando el cambio." });
                  setResetPasswordDialog({ open: false, user: null });
                  setNewAdminPassword("");
                } catch {
                  toast({ title: "Error", description: "No se pudo actualizar la contraseña", variant: "destructive" });
                } finally {
                  setIsResettingPassword(false);
                }
              }}
              className="w-full bg-accent text-accent-foreground font-semibold rounded-full"
              data-testid="button-confirm-reset-password"
            >
              {isResettingPassword ? <Loader2 className="animate-spin" /> : "Restablecer Contraseña"}
            </Button>
            <Button variant="outline" onClick={() => setResetPasswordDialog({ open: false, user: null })} className="w-full rounded-full">Cancelar</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
