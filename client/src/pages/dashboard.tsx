import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Building2, FileText, Clock, ChevronRight, User as UserIcon, Settings, Package, CreditCard, PlusCircle, Download, ExternalLink, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, Users, Power, Edit, Trash2, FileUp, Newspaper, Loader2, CheckCircle, Receipt, Plus, Calendar, DollarSign, TrendingUp, BarChart3, UserCheck, UserX, Star, Eye, FileCheck, Upload, XCircle, Tag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SocialLogin } from "@/components/auth/social-login";

type Tab = 'services' | 'profile' | 'payments' | 'documents' | 'messages' | 'notifications' | 'admin' | 'calendar';

function getOrderStatusLabel(status: string): { label: string; className: string } {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
    paid: { label: 'Pagado', className: 'bg-blue-100 text-blue-800' },
    processing: { label: 'En Proceso', className: 'bg-purple-100 text-purple-800' },
    documents_ready: { label: 'Docs. Listos', className: 'bg-cyan-100 text-cyan-800' },
    completed: { label: 'Completado', className: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700 font-black' },
    filed: { label: 'Presentado', className: 'bg-indigo-100 text-indigo-800' },
    draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-600' },
  };
  return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
}

interface AdminUserData {
  id?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  streetType?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  idNumber?: string | null;
  idType?: string | null;
  birthDate?: string | null;
  businessActivity?: string | null;
  isAdmin?: boolean;
  isActive?: boolean;
  accountStatus?: string;
  internalNotes?: string | null;
  createdAt?: string | null;
}

interface DiscountCode {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
  createdAt: string;
}

function NewsletterToggle() {
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

  if (isLoading) return <div className="w-10 h-6 bg-gray-100 animate-pulse rounded-full" />;

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
      await apiRequest("PATCH", "/api/user/profile", data);
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
      await apiRequest("POST", `/api/messages/${messageId}/reply`, { content: replyContent });
    },
    onSuccess: () => {
      setReplyContent("");
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      toast({ title: user?.isAdmin ? "Respuesta enviada" : "Mensaje enviado", description: user?.isAdmin ? "El cliente recibirá un email con la información" : "Te responderemos personalmente lo antes posible" });
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
      await apiRequest("PATCH", `/api/user/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
    }
  });

  const { data: adminOrders } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
    refetchInterval: 30000,
  });

  const { data: adminUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
    refetchInterval: 60000,
  });

  const { data: adminNewsletterSubs } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletter"],
    enabled: !!user?.isAdmin,
  });

  const { data: adminDocuments } = useQuery<any[]>({
    queryKey: ["/api/admin/documents"],
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
      await apiRequest("POST", "/api/admin/newsletter/broadcast", { subject, message });
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
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      toast({ title: "Documento subido", description: "El cliente ya puede verlo en su panel." });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Estado actualizado" });
    }
  });

  const updateLlcDatesMutation = useMutation({
    mutationFn: async ({ appId, field, value }: { appId: number, field: string, value: string }) => {
      await apiRequest("PATCH", `/api/admin/llc/${appId}/dates`, { field, value });
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
      await apiRequest("POST", "/api/admin/send-note", { userId, title, message, type });
    },
    onSuccess: () => {
      toast({ title: "Nota enviada", description: "El cliente recibirá notificación y email" });
      setNoteDialog({ open: false, user: null });
      setNoteTitle("");
      setNoteMessage("");
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<AdminUserData> & { id: string }) => {
      const { id, ...updateData } = data;
      await apiRequest("PATCH", `/api/admin/users/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario actualizado" });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
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
      await apiRequest("DELETE", `/api/admin/orders/${orderId}`);
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
      await apiRequest("POST", "/api/admin/invoices/create", { userId, concept, amount, currency });
    },
    onSuccess: () => {
      toast({ title: "Factura creada", description: "La factura se ha añadido al centro de documentos del cliente" });
      setInvoiceDialog({ open: false, user: null });
      setInvoiceConcept("");
      setInvoiceAmount("");
      setInvoiceCurrency("EUR");
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear la factura", variant: "destructive" });
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
      const res = await apiRequest("POST", "/api/admin/orders/create", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Pedido creado", description: "El pedido ha sido registrado correctamente" });
      setCreateOrderDialog(false);
      setNewOrderData({ userId: '', productId: '1', amount: '', state: 'New Mexico' });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el pedido", variant: "destructive" });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: number) => {
      await apiRequest("DELETE", `/api/user/documents/${docId}`);
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
      await apiRequest("DELETE", "/api/user/account");
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
      await apiRequest("POST", "/api/user/request-password-otp");
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
      await apiRequest("POST", "/api/user/change-password", data);
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

  const menuItems = [
    { id: 'services', label: 'Mis Servicios', icon: Package, mobileLabel: 'Servicios' },
    { id: 'notifications', label: 'Seguimiento', icon: BellRing, mobileLabel: 'Seguim.' },
    { id: 'messages', label: '¿Necesitas ayuda?', icon: Mail, mobileLabel: 'Ayuda' },
    { id: 'documents', label: 'Documentos', icon: FileText, mobileLabel: 'Docs' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, mobileLabel: 'Pagos' },
    { id: 'calendar', label: 'Calendario', icon: Calendar, mobileLabel: 'Fechas' },
    { id: 'profile', label: 'Mi Perfil', icon: UserIcon, mobileLabel: 'Perfil' },
    ...(user?.isAdmin ? [
      { id: 'admin', label: 'Admin', icon: Shield, mobileLabel: 'Admin' }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-muted font-sans">
      <Navbar />
      <main className="pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-accent font-black tracking-widest text-[10px] md:text-xs mb-1 uppercase">Área de Clientes</p>
              <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tighter leading-tight">
                Bienvenido, {user?.firstName || 'Cliente'}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Tu espacio privado de gestión
              </p>
            </div>
            <Link href="/servicios#pricing">
              <Button className="w-full md:w-auto bg-accent hover:bg-accent/90 text-black font-bold rounded-full px-8 h-12 transition-all flex items-center justify-center gap-2">
                <PlusCircle className="w-5 h-5" /> Nueva LLC
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex overflow-x-auto pb-3 mb-6 gap-1.5 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:gap-2 md:pb-4 md:mb-8">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "outline"}
              onClick={() => setActiveTab(item.id as Tab)}
              size="sm"
              className={`flex items-center gap-1.5 md:gap-2 rounded-full font-bold text-[11px] md:text-xs tracking-tight whitespace-nowrap shrink-0 ${
                activeTab === item.id 
                ? 'bg-accent text-primary shadow-lg shadow-accent/20' 
                : 'bg-white dark:bg-zinc-900 text-muted-foreground border-0'
              }`}
              data-testid={`button-tab-${item.id}`}
            >
              <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.mobileLabel}</span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1">
            
              {activeTab === 'services' && (
                <div key="services" className="space-y-6">
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-lg md:text-2xl font-black text-primary tracking-tight">Mis Servicios</h2>
                    <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Gestiona tus trámites activos</p>
                  </div>
                  
                  {(!orders || orders.length === 0) ? (
                    <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900 p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-primary mb-2">Ningún servicio activo</h3>
                          <p className="text-sm text-muted-foreground mb-6">¡Crea tu LLC hoy mismo! Conoce nuestros packs.</p>
                        </div>
                        <Link href="/servicios#pricing">
                          <Button className="bg-accent text-primary font-black rounded-full px-8 py-3" data-testid="button-view-packs">
                            Ver Packs
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {orders.map((order) => (
                        <Card key={order.id} className="rounded-xl md:rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 overflow-hidden">
                          <CardHeader className="bg-primary/5 pb-3 md:pb-4 p-3 md:p-6">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] md:text-[10px] font-black text-accent uppercase tracking-widest mb-1">Pedido: {order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || order.id}</p>
                                <CardTitle className="text-base md:text-lg font-black text-primary truncate">
                                  {order.maintenanceApplication 
                                    ? `Mantenimiento ${order.maintenanceApplication.state || order.product?.name?.replace(' LLC', '') || ''}`
                                    : order.application?.companyName 
                                      ? `${order.application.companyName} LLC`
                                      : order.product?.name || 'LLC pendiente'
                                  }
                                </CardTitle>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{order.application?.state || order.maintenanceApplication?.state || ''}</p>
                              </div>
                              <Badge className={`${getOrderStatusLabel(order.status).className} font-black uppercase text-[9px] md:text-[10px] shrink-0`} data-testid={`badge-order-status-${order.id}`}>
                                {getOrderStatusLabel(order.status).label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                            <div className="relative pl-5 md:pl-6 space-y-3 md:space-y-4 before:absolute before:left-1.5 md:before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                              {order.events?.slice(0, 3).map((event: any, i: number) => (
                                <div key={i} className="relative">
                                  <div className={`absolute -left-[1.1rem] md:-left-[1.35rem] top-1 md:top-1.5 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-white ${i === 0 ? 'bg-accent animate-pulse' : 'bg-gray-300'}`} />
                                  <div className="flex justify-between items-center gap-2">
                                    <p className={`text-[11px] md:text-xs font-bold ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{event.eventType}</p>
                                    <span className="text-[9px] text-muted-foreground shrink-0">{new Date(event.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-[9px] md:text-[10px] text-muted-foreground line-clamp-1">{event.description}</p>
                                </div>
                              ))}
                              {!order.events?.length && (
                                <div className="relative">
                                  <div className="absolute -left-[1.35rem] top-1.5 w-3 h-3 rounded-full border-2 border-white bg-accent animate-pulse" />
                                  <p className="text-xs font-black text-primary">Pedido Recibido</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {(order.application?.status === 'submitted' || order.maintenanceApplication?.status === 'submitted')
                                      ? 'Formulario completado.'
                                      : (order.application?.status === 'pending' || order.maintenanceApplication?.status === 'pending')
                                        ? 'Falta información del formulario.'
                                        : (order.status === 'completed' || order.status === 'filed')
                                          ? 'Proceso completado.'
                                          : 'Estamos procesando tu solicitud.'
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                            {order.status === 'pending' && order.application && (
                              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-700 flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 text-[10px] h-8 rounded-full font-black"
                                  onClick={() => window.location.href = `/llc/formation?edit=${order.application.id}`}
                                  data-testid={`button-modify-order-${order.id}`}
                                >
                                  Modificar datos
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div key="notifications" className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Notificaciones</h2>
                  {notificationsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
                    </div>
                  ) : notifications?.length === 0 ? (
                    <Card className="rounded-2xl border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <BellRing className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-muted-foreground">No tienes notificaciones</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {notifications?.map((notif: any) => (
                        <Card 
                          key={notif.id} 
                          className={`rounded-2xl border-0 shadow-sm transition-all hover:shadow-md ${!notif.isRead ? 'bg-accent/5 border-l-4 border-l-accent' : ''}`}
                        >
                          <CardContent className="p-4 md:p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {notif.orderCode && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-black">Pedido: {notif.orderCode}</span>
                                  )}
                                  {notif.type === 'action_required' && (
                                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-black">ACCIÓN REQUERIDA</span>
                                  )}
                                  {notif.type === 'update' && (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-black">ACTUALIZACIÓN</span>
                                  )}
                                  {notif.type === 'info' && (
                                    <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-black">INFORMACIÓN</span>
                                  )}
                                  <span className="text-[10px] text-muted-foreground font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-black text-sm md:text-base">{notif.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                                {notif.type === 'action_required' && canEdit && (
                                  <Button 
                                    className="mt-3 bg-accent text-primary font-black rounded-full text-xs px-4 gap-2"
                                    onClick={() => {
                                      markNotificationRead.mutate(notif.id);
                                      setActiveTab('documents');
                                    }}
                                    data-testid={`button-upload-document-${notif.id}`}
                                  >
                                    <Upload className="w-3 h-3" />
                                    Subir Documento
                                  </Button>
                                )}
                              </div>
                              {!notif.isRead && (
                                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div key="messages" className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Mis Consultas y Soporte</h2>
                    <Link href="/contacto">
                      <Button className="bg-accent text-primary font-black rounded-full text-xs">Nueva Consulta</Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {(!messagesData || messagesData.length === 0) ? (
                      <Card className="rounded-2xl border-0 shadow-sm p-8 bg-white dark:bg-zinc-900 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Todavía no hay mensajes</p>
                        <p className="text-sm text-muted-foreground mt-2">Tus conversaciones con soporte aparecerán aquí</p>
                      </Card>
                    ) : (
                      messagesData.map((msg) => (
                        <Card key={msg.id} className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-accent" />
                              <h4 className="font-black text-primary">{msg.subject || 'Sin asunto'}</h4>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{msg.messageId || msg.id}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{msg.content}</p>
                          {selectedMessage?.id === msg.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                              <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Escribe tu respuesta..." className="rounded-xl min-h-[80px] text-sm" />
                              <Button onClick={(e) => { e.stopPropagation(); sendReplyMutation.mutate(msg.id); }} disabled={!replyContent.trim() || sendReplyMutation.isPending} className="bg-accent text-primary font-black rounded-full px-6">
                                Enviar Respuesta
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div key="documents" className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight mb-6">Centro de Documentación</h2>
                  
                  {notifications?.some((n: any) => n.type === 'action_required' && !n.isRead) && (
                    <Card className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <FileUp className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-orange-800 text-sm">Documentos Solicitados</h4>
                          <p className="text-xs text-orange-700 mt-1">Tienes solicitudes de documentos pendientes. Por favor, sube los documentos requeridos.</p>
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
                                    } else {
                                      toast({ title: "Error", description: "No se pudo subir el documento", variant: "destructive" });
                                    }
                                  } catch {
                                    toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
                                  }
                                }}
                                data-testid="input-upload-document"
                              />
                              <Button variant="outline" className="rounded-full text-xs border-orange-300 text-orange-700" asChild>
                                <span><FileUp className="w-3 h-3 mr-1" /> Subir Documento</span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  {/* Botón prominente de subir archivo para móvil */}
                  <Card className="rounded-2xl border-2 border-dashed border-accent/50 bg-accent/5 p-4 md:p-6 mb-4">
                    <label className="cursor-pointer w-full block">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadDialog({ open: true, file });
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
                          <h3 className="font-black text-primary text-base md:text-lg">Subir Documento</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">PDF, JPG o PNG (máx. 10MB)</p>
                        </div>
                        <Button size="lg" className="rounded-full font-black bg-accent text-primary shrink-0">
                          <FileUp className="w-5 h-5 md:mr-2" />
                          <span className="hidden md:inline">SUBIR</span>
                        </Button>
                      </div>
                    </label>
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
                  <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Historial de Pagos</h2>
                  <div className="space-y-4">
                    {(!orders || orders.length === 0) ? (
                      <Card className="rounded-2xl border-0 shadow-sm p-8 bg-white dark:bg-zinc-900 text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Todavía no has contratado ningún servicio</p>
                        <p className="text-sm text-muted-foreground mt-2">Tus facturas y recibos aparecerán aquí</p>
                      </Card>
                    ) : (
                      orders.map((order: any) => (
                        <Card key={order.id} className="rounded-2xl border-0 shadow-sm p-6 flex justify-between items-center bg-white dark:bg-zinc-900">
                          <div>
                            <p className="font-black text-xs md:text-sm">Factura {order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}>Factura</Button>
                            <Button variant="outline" size="sm" onClick={() => window.open(`/api/orders/${order.id}/receipt`, '_blank')}>Recibo</Button>
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
                      <h2 className="text-lg md:text-2xl font-black text-primary tracking-tight">Calendario Fiscal</h2>
                      <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Fechas importantes y vencimientos de tu LLC</p>
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
                    <Card className="rounded-xl md:rounded-2xl border shadow-sm p-6 md:p-8 bg-white dark:bg-zinc-900 text-center">
                      <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground/30 mb-3 md:mb-4" />
                      <h3 className="text-base md:text-lg font-black text-primary mb-2">Sin fechas programadas</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mb-4">Contrata tu primera LLC para ver las fechas importantes</p>
                      <Link href="/servicios#pricing">
                        <Button className="bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">
                          <PlusCircle className="w-4 h-4 mr-2" /> Comenzar
                        </Button>
                      </Link>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div key="profile" className="space-y-6">
                  <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 bg-white dark:bg-zinc-900">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-black">Perfil Personal</h3>
                      {canEdit && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} data-testid="button-toggle-edit">{isEditing ? 'Cancelar' : 'Editar'}</Button>
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
                            <Select value={profileData.idType} onValueChange={val => setProfileData({...profileData, idType: val})}>
                              <SelectTrigger className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" data-testid="select-idtype"><SelectValue placeholder="DNI · NIE · Pasaporte" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dni">DNI</SelectItem>
                                <SelectItem value="nie">NIE</SelectItem>
                                <SelectItem value="passport">Pasaporte</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.idType === 'dni' ? 'DNI' : user?.idType === 'nie' ? 'NIE' : user?.idType === 'passport' ? 'Pasaporte' : 'No proporcionado'}</div>}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-muted-foreground">Número de documento</Label>
                          {isEditing && canEdit ? <Input value={profileData.idNumber} onChange={e => setProfileData({...profileData, idNumber: e.target.value})} placeholder="Documento de identificación" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-idnumber" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.idNumber || 'No proporcionado'}</div>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-muted-foreground">Fecha de nacimiento</Label>
                        {isEditing && canEdit ? <Input type="date" value={profileData.birthDate} onChange={e => setProfileData({...profileData, birthDate: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-birthdate" /> : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.birthDate || 'No proporcionado'}</div>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-muted-foreground">Actividad profesional</Label>
                        {isEditing && canEdit ? (
                          <Select value={profileData.businessActivity} onValueChange={val => setProfileData({...profileData, businessActivity: val})}>
                            <SelectTrigger className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" style={{ fontSize: '16px' }} data-testid="select-activity"><SelectValue placeholder="A qué te dedicas" /></SelectTrigger>
                            <SelectContent position="popper" className="max-h-[50vh]">
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="dropshipping">Dropshipping</SelectItem>
                              <SelectItem value="consulting">Consultoría</SelectItem>
                              <SelectItem value="marketing">Marketing Digital</SelectItem>
                              <SelectItem value="software">Desarrollo de Software</SelectItem>
                              <SelectItem value="trading">Trading / Inversiones</SelectItem>
                              <SelectItem value="freelance">Freelance</SelectItem>
                              <SelectItem value="other">Otra</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">{user?.businessActivity || 'No proporcionado'}</div>}
                      </div>
                      <div className="pt-4 border-t border-border">
                        <h4 className="font-bold text-sm mb-3">Dirección de residencia</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-muted-foreground">Tipo de vía</Label>
                            {isEditing && canEdit ? (
                              <Select value={profileData.streetType} onValueChange={val => setProfileData({...profileData, streetType: val})}>
                                <SelectTrigger className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" style={{ fontSize: '16px' }} data-testid="select-street-type"><SelectValue placeholder="Calle · Avenida · Paseo · Plaza" /></SelectTrigger>
                                <SelectContent position="popper" className="max-h-[50vh]">
                                  <SelectItem value="calle">Calle</SelectItem>
                                  <SelectItem value="avenida">Avenida</SelectItem>
                                  <SelectItem value="paseo">Paseo</SelectItem>
                                  <SelectItem value="plaza">Plaza</SelectItem>
                                </SelectContent>
                              </Select>
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
                          <h4 className="font-black text-primary">Suscripción Newsletter</h4>
                          <p className="text-xs text-muted-foreground">Recibe noticias y consejos para tu LLC.</p>
                        </div>
                        <NewsletterToggle />
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-black text-primary">Cambiar Contraseña</h4>
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
                                  className="bg-accent text-primary font-black rounded-full flex-1"
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
                                  className="bg-accent text-primary font-black rounded-full flex-1"
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
                          <h4 className="font-black text-primary">Cuentas Conectadas</h4>
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
              )}

              {activeTab === 'admin' && user?.isAdmin && (
                <div key="admin" className="space-y-6">
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                    {['dashboard', 'orders', 'users', 'calendar', 'docs', 'newsletter', 'inbox', 'descuentos'].map(tab => (
                      <Button key={tab} variant={adminSubTab === tab ? "default" : "outline"} onClick={() => setAdminSubTab(tab)} className="rounded-full text-[10px] md:text-xs font-black capitalize px-2 md:px-3" data-testid={`button-admin-tab-${tab}`}>
                        <span className="hidden sm:inline">{tab === 'dashboard' ? 'Métricas' : tab === 'calendar' ? 'Fechas' : tab === 'orders' ? 'Pedidos' : tab === 'users' ? 'Clientes' : tab === 'docs' ? 'Documentos' : tab === 'descuentos' ? 'Descuentos' : tab}</span>
                        <span className="sm:hidden flex items-center justify-center">{tab === 'dashboard' ? <BarChart3 className="w-5 h-5" /> : tab === 'calendar' ? <Calendar className="w-5 h-5" /> : tab === 'orders' ? <Package className="w-5 h-5" /> : tab === 'users' ? <Users className="w-5 h-5" /> : tab === 'docs' ? <FileText className="w-5 h-5" /> : tab === 'newsletter' ? <Mail className="w-5 h-5" /> : tab === 'descuentos' ? <Tag className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold" onClick={() => setCreateUserDialog(true)} data-testid="button-create-user">
                      <Plus className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Nuevo Cliente</span>
                      <span className="sm:hidden">Cliente</span>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold" onClick={() => setCreateOrderDialog(true)} data-testid="button-create-order">
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

                      {/* Actualización en tiempo real */}
                      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground pt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Actualización en tiempo real cada 10 segundos</span>
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
                              <Select value={order.status} onValueChange={val => updateStatusMutation.mutate({ id: order.id, status: val })}>
                                <SelectTrigger className="w-28 h-9 rounded-full text-xs bg-white dark:bg-zinc-900 border"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendiente</SelectItem>
                                  <SelectItem value="paid">Pagado</SelectItem>
                                  <SelectItem value="filed">Presentado</SelectItem>
                                  <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
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
                              <div className="w-full">
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Estado de cuenta</Label>
                                <Select value={u.accountStatus || 'active'} onValueChange={val => u.id && updateUserMutation.mutate({ id: u.id, accountStatus: val as any })}>
                                  <SelectTrigger className="w-full h-9 rounded-full text-xs bg-white dark:bg-zinc-900 border shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Verificado</SelectItem>
                                    <SelectItem value="pending">En revisión</SelectItem>
                                    <SelectItem value="deactivated">Desactivada</SelectItem>
                                    <SelectItem value="vip">VIP</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setEditingUser(u)} data-testid={`button-edit-user-${u.id}`}>
                                Editar
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
                      <h4 className="font-black text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2">
                        <div className="w-10 h-10 md:w-8 md:h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 md:w-4 md:h-4 text-accent" />
                        </div>
                        <span>Gestión de Fechas Fiscales</span>
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
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-lg">Documentos de Clientes</h3>
                        <Badge className="bg-accent/20 text-accent">{adminDocuments?.length || 0} docs</Badge>
                      </div>
                      <div className="divide-y max-h-[60vh] overflow-y-auto">
                        {adminDocuments?.map((doc: any) => (
                          <div key={doc.id} className="py-3 flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-bold text-sm truncate">{doc.fileName}</p>
                                <Badge variant="outline" className={`text-[9px] ${doc.reviewStatus === 'approved' ? 'bg-green-100 text-green-700' : doc.reviewStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {doc.reviewStatus === 'approved' ? 'Aprobado' : doc.reviewStatus === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{doc.user?.firstName} {doc.user?.lastName} • {doc.user?.email}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {doc.application?.companyName && <><strong>LLC:</strong> {doc.application.companyName} • </>}
                                <strong>Tipo:</strong> {doc.documentType || 'Documento'} • 
                                <strong> Fecha:</strong> {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('es-ES') : '-'}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {doc.fileUrl && (
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(doc.fileUrl, '_blank')} data-testid={`btn-view-doc-${doc.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Select value={doc.reviewStatus || 'pending'} onValueChange={async val => {
                                try {
                                  await apiRequest("PATCH", `/api/admin/documents/${doc.id}/review`, { reviewStatus: val });
                                  queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
                                  toast({ title: "Estado actualizado" });
                                } catch { toast({ title: "Error", variant: "destructive" }); }
                              }}>
                                <SelectTrigger className="h-8 w-24 text-[10px] rounded-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendiente</SelectItem>
                                  <SelectItem value="approved">Aprobar</SelectItem>
                                  <SelectItem value="rejected">Rechazar</SelectItem>
                                </SelectContent>
                              </Select>
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
                        <div className="bg-accent/10 p-4 rounded-xl">
                          <h4 className="font-black text-sm mb-3">Enviar a todos los suscriptores ({adminNewsletterSubs?.length || 0})</h4>
                          <div className="space-y-3">
                            <Input 
                              value={broadcastSubject} 
                              onChange={e => setBroadcastSubject(e.target.value)} 
                              placeholder="Asunto del email" 
                              className="bg-white dark:bg-zinc-900"
                              data-testid="input-broadcast-subject"
                            />
                            <Textarea 
                              value={broadcastMessage} 
                              onChange={e => setBroadcastMessage(e.target.value)} 
                              placeholder="Contenido del mensaje" 
                              rows={4}
                              className="bg-white dark:bg-zinc-900"
                              data-testid="input-broadcast-message"
                            />
                            <Button 
                              onClick={() => broadcastMutation.mutate({ subject: broadcastSubject, message: broadcastMessage })}
                              disabled={!broadcastSubject || !broadcastMessage || broadcastMutation.isPending}
                              className="w-full rounded-full"
                              data-testid="button-send-broadcast"
                            >
                              {broadcastMutation.isPending ? 'Enviando...' : `Enviar a ${adminNewsletterSubs?.length || 0} suscriptores`}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-sm mb-3">Lista de Suscriptores</h4>
                          <div className="divide-y max-h-80 overflow-y-auto">
                            {adminNewsletterSubs?.map((sub: any) => (
                              <div key={sub.id} className="py-2 flex justify-between items-center">
                                <span className="text-sm">{sub.email}</span>
                                <span className="text-[10px] text-muted-foreground">{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('es-ES') : ''}</span>
                              </div>
                            ))}
                            {(!adminNewsletterSubs || adminNewsletterSubs.length === 0) && (
                              <p className="text-sm text-muted-foreground py-4 text-center">No hay suscriptores</p>
                            )}
                          </div>
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
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-black text-sm">{msg.firstName} {msg.lastName}</p>
                                <p className="text-xs text-muted-foreground">{msg.email} {msg.phone && `• ${msg.phone}`}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">{msg.messageId || msg.id}</Badge>
                                <Badge variant="secondary" className="text-[10px]">{msg.status || 'pendiente'}</Badge>
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
                                  className="bg-accent text-primary font-black rounded-full px-6"
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
                                  <p className="text-[10px] text-muted-foreground">
                                    {dc.validFrom && `Desde: ${new Date(dc.validFrom).toLocaleDateString('es-ES')}`}
                                    {dc.validFrom && dc.validUntil && ' - '}
                                    {dc.validUntil && `Hasta: ${new Date(dc.validUntil).toLocaleDateString('es-ES')}`}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-full text-xs"
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
                                  className={`rounded-full text-xs ${dc.isActive ? 'text-red-600' : 'text-green-600'}`}
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
              <h3 className="text-lg md:text-xl font-black tracking-tight text-primary mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" /> Seguimiento
              </h3>
              <div className="space-y-5">
                {orders && orders.length > 0 ? (
                  <>
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 mb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold text-accent uppercase tracking-wider mb-0.5">Pedido: {orders[0]?.application?.requestCode || orders[0]?.maintenanceApplication?.requestCode || orders[0]?.invoiceNumber || orders[0]?.id}</p>
                          <p className="text-sm font-black text-primary truncate">
                            {orders[0]?.maintenanceApplication 
                              ? `Mantenimiento ${orders[0]?.maintenanceApplication?.state || ''}`
                              : orders[0]?.application?.companyName 
                                ? `${orders[0]?.application?.companyName} LLC`
                                : orders[0]?.product?.name || 'LLC'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{orders[0]?.application?.state || orders[0]?.maintenanceApplication?.state || ''}</p>
                        </div>
                        <Badge className={`${getOrderStatusLabel(orders[0]?.status).className} font-bold text-[9px] shrink-0`}>
                          {getOrderStatusLabel(orders[0]?.status).label}
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
                            <p className="text-xs md:text-sm font-black text-primary truncate">{event.eventType}</p>
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
                  <div className="text-center py-4"><AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-xs text-muted-foreground">No hay pedidos activos</p></div>
                )}
              </div>
            </section>
            <section className="bg-accent/10 p-6 md:p-8 rounded-[2rem] border-2 border-accent/20">
              <h3 className="text-base font-black text-primary mb-3">¿Necesitas ayuda?</h3>
              <p className="text-xs text-primary/70 mb-5 leading-relaxed">Nuestro equipo de expertos está listo para resolver tus dudas.</p>
              <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-accent text-primary font-black rounded-full py-5">Contactar Soporte</Button>
              </a>
            </section>
          </div>
        </div>
      </main>

      {user?.isAdmin && (
        <>
          <Dialog open={noteDialog.open} onOpenChange={(open) => setNoteDialog({ open, user: open ? noteDialog.user : null })}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-primary">Enviar Mensaje al Cliente</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">El cliente recibirá notificación en su panel y email</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-sm font-black text-primary mb-2 block">Título</Label>
                  <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Título del mensaje" className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-note-title" />
                </div>
                <div>
                  <Label className="text-sm font-black text-primary mb-2 block">Mensaje</Label>
                  <Textarea value={noteMessage} onChange={e => setNoteMessage(e.target.value)} placeholder="Escribe tu mensaje..." rows={4} className="w-full rounded-xl border-gray-200 focus:border-accent" data-testid="input-note-message" />
                </div>
              </div>
              <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setNoteDialog({ open: false, user: null })} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
                <Button onClick={() => noteDialog.user?.id && sendNoteMutation.mutate({ userId: noteDialog.user.id, title: noteTitle, message: noteMessage, type: noteType })} disabled={!noteTitle || !noteMessage || sendNoteMutation.isPending} className="w-full sm:w-auto bg-accent text-primary font-black rounded-full" data-testid="button-send-note">
                  {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Mensaje'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-primary">Editar Usuario</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">Modifica los datos del cliente</DialogDescription>
              </DialogHeader>
              {editingUser && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-black text-primary mb-2 block">Nombre</Label>
                      <Input value={editingUser.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-firstname" />
                    </div>
                    <div>
                      <Label className="text-sm font-black text-primary mb-2 block">Apellidos</Label>
                      <Input value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-lastname" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-black text-primary mb-2 block">Email</Label>
                    <Input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-email" />
                  </div>
                  <div>
                    <Label className="text-sm font-black text-primary mb-2 block">Teléfono</Label>
                    <Input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-phone" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-black text-primary mb-2 block">Tipo ID</Label>
                      <Select value={editingUser.idType || ''} onValueChange={val => setEditingUser({...editingUser, idType: val})}>
                        <SelectTrigger className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="dni">DNI</SelectItem>
                          <SelectItem value="nie">NIE</SelectItem>
                          <SelectItem value="passport">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-black text-primary mb-2 block">Número ID</Label>
                      <Input value={editingUser.idNumber || ''} onChange={e => setEditingUser({...editingUser, idNumber: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-idnumber" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-black text-primary mb-2 block">Fecha Nacimiento</Label>
                    <Input type="date" value={editingUser.birthDate || ''} onChange={e => setEditingUser({...editingUser, birthDate: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-birthdate" />
                  </div>
                  <div>
                    <Label className="text-sm font-black text-primary mb-2 block">Actividad de Negocio</Label>
                    <Select value={editingUser.businessActivity || ''} onValueChange={val => setEditingUser({...editingUser, businessActivity: val})}>
                      <SelectTrigger className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" style={{ fontSize: '16px' }} data-testid="select-edit-activity"><SelectValue placeholder="Seleccionar actividad" /></SelectTrigger>
                      <SelectContent position="popper" className="max-h-[50vh] rounded-xl">
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="dropshipping">Dropshipping</SelectItem>
                        <SelectItem value="consulting">Consultoría</SelectItem>
                        <SelectItem value="marketing">Marketing Digital</SelectItem>
                        <SelectItem value="software">Desarrollo de Software</SelectItem>
                        <SelectItem value="trading">Trading / Inversiones</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="other">Otra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-black text-primary mb-2 block">Dirección</Label>
                    <Input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} placeholder="Calle y número" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-address" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-black text-primary mb-2 block">Ciudad</Label>
                      <Input value={editingUser.city || ''} onChange={e => setEditingUser({...editingUser, city: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-city" />
                    </div>
                    <div>
                      <Label className="text-sm font-black text-primary mb-2 block">Código Postal</Label>
                      <Input value={editingUser.postalCode || ''} onChange={e => setEditingUser({...editingUser, postalCode: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-postal" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-black text-primary mb-2 block">Provincia</Label>
                      <Input value={editingUser.province || ''} onChange={e => setEditingUser({...editingUser, province: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-province" />
                    </div>
                    <div>
                      <Label className="text-sm font-black text-primary mb-2 block">País</Label>
                      <Input value={editingUser.country || ''} onChange={e => setEditingUser({...editingUser, country: e.target.value})} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-edit-country" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-black text-primary mb-2 block">Notas Internas (solo admin)</Label>
                    <Textarea value={editingUser.internalNotes || ''} onChange={e => setEditingUser({...editingUser, internalNotes: e.target.value})} rows={2} className="rounded-xl border-gray-200 focus:border-accent" data-testid="input-edit-notes" />
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                    <Button variant="outline" onClick={() => setEditingUser(null)} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
                    <Button onClick={() => editingUser.id && updateUserMutation.mutate({ id: editingUser.id, ...editingUser })} disabled={updateUserMutation.isPending} className="w-full sm:w-auto bg-accent text-primary font-black rounded-full" data-testid="button-save-user">
                      {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, user: open ? deleteConfirm.user : null })}>
            <DialogContent className="sm:max-w-sm bg-white dark:bg-zinc-900 rounded-2xl">
              <DialogHeader><DialogTitle className="text-xl font-black text-red-600">Eliminar Usuario</DialogTitle></DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm.user?.firstName} {deleteConfirm.user?.lastName}</strong>?</p>
                <p className="text-xs text-red-500 mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, user: null })} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
                <Button variant="destructive" onClick={() => deleteConfirm.user?.id && deleteUserMutation.mutate(deleteConfirm.user.id)} disabled={deleteUserMutation.isPending} className="rounded-full font-black" data-testid="button-confirm-delete">
                  {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={deleteOrderConfirm.open} onOpenChange={(open) => setDeleteOrderConfirm({ open, order: open ? deleteOrderConfirm.order : null })}>
            <DialogContent className="sm:max-w-sm bg-white dark:bg-zinc-900 rounded-2xl">
              <DialogHeader><DialogTitle className="text-xl font-black text-red-600">Eliminar Pedido</DialogTitle></DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar el pedido <strong>{deleteOrderConfirm.order?.application?.requestCode || deleteOrderConfirm.order?.maintenanceApplication?.requestCode || deleteOrderConfirm.order?.invoiceNumber}</strong>?</p>
                <p className="text-xs text-muted-foreground mt-2">Cliente: {deleteOrderConfirm.order?.user?.firstName} {deleteOrderConfirm.order?.user?.lastName}</p>
                <p className="text-xs text-red-500 mt-2">Esta acción eliminará el pedido, la solicitud LLC asociada y todos los documentos relacionados.</p>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setDeleteOrderConfirm({ open: false, order: null })} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
                <Button variant="destructive" onClick={() => deleteOrderConfirm.order?.id && deleteOrderMutation.mutate(deleteOrderConfirm.order.id)} disabled={deleteOrderMutation.isPending} className="w-full sm:w-auto rounded-full font-black" data-testid="button-confirm-delete-order">
                  {deleteOrderMutation.isPending ? 'Eliminando...' : 'Eliminar Pedido'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={generateInvoiceDialog.open} onOpenChange={(open) => setGenerateInvoiceDialog({ open, order: open ? generateInvoiceDialog.order : null })}>
            <DialogContent className="sm:max-w-sm bg-white dark:bg-zinc-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-primary">Generar Factura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">Pedido: <strong>{generateInvoiceDialog.order?.application?.requestCode || generateInvoiceDialog.order?.maintenanceApplication?.requestCode || generateInvoiceDialog.order?.invoiceNumber}</strong></p>
                <div>
                  <Label className="text-sm font-black text-primary mb-2 block">Importe</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={orderInvoiceAmount} 
                    onChange={e => setOrderInvoiceAmount(e.target.value)}
                    className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" 
                    placeholder="739.00"
                    data-testid="input-invoice-amount"
                  />
                </div>
                <div>
                  <Label className="text-sm font-black text-primary mb-2 block">Divisa</Label>
                  <Select value={orderInvoiceCurrency} onValueChange={setOrderInvoiceCurrency}>
                    <SelectTrigger className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"><SelectValue placeholder="Seleccionar divisa" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" onClick={() => setGenerateInvoiceDialog({ open: false, order: null })} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
                <Button 
                  className="w-full sm:w-auto bg-accent text-primary font-black rounded-full"
                  disabled={!orderInvoiceAmount || isNaN(parseFloat(orderInvoiceAmount)) || parseFloat(orderInvoiceAmount) <= 0}
                  onClick={async () => {
                    try {
                      const amountCents = Math.round(parseFloat(orderInvoiceAmount) * 100);
                      if (amountCents <= 0) {
                        toast({ title: "Error", description: "El importe debe ser mayor que 0", variant: "destructive" });
                        return;
                      }
                      await apiRequest("POST", `/api/admin/orders/${generateInvoiceDialog.order?.id}/generate-invoice`, {
                        amount: amountCents,
                        currency: orderInvoiceCurrency
                      });
                      toast({ title: "Factura generada", description: `Factura creada por ${orderInvoiceAmount} ${orderInvoiceCurrency}` });
                      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                      setGenerateInvoiceDialog({ open: false, order: null });
                    } catch (err) {
                      toast({ title: "Error", description: "No se pudo generar la factura", variant: "destructive" });
                    }
                  }}
                  data-testid="button-confirm-generate-invoice"
                >
                  Generar Factura
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={docDialog.open} onOpenChange={(open) => setDocDialog({ open, user: open ? docDialog.user : null })}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-primary">Solicitar Documentos</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">Solicita documentos al cliente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-sm font-black text-primary mb-2 block">Tipo de documento</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="passport">Pasaporte / Documento de Identidad</SelectItem>
                      <SelectItem value="address_proof">Prueba de Domicilio</SelectItem>
                      <SelectItem value="tax_id">Identificación Fiscal (NIF/CIF)</SelectItem>
                      <SelectItem value="other">Otro Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-black text-primary mb-2 block">Mensaje</Label>
                  <Textarea value={docMessage} onChange={e => setDocMessage(e.target.value)} placeholder="Mensaje para el cliente" rows={3} className="w-full rounded-xl border-gray-200 focus:border-accent" data-testid="input-doc-message" />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" onClick={() => setDocDialog({ open: false, user: null })} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
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
                }} disabled={!docType || sendNoteMutation.isPending} className="w-full sm:w-auto bg-accent text-primary font-black rounded-full" data-testid="button-request-doc">
                  {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solicitar Documento'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={invoiceDialog.open} onOpenChange={(open) => setInvoiceDialog({ open, user: open ? invoiceDialog.user : null })}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-primary">Crear Factura</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">Genera una factura para el cliente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl">Cliente: <strong>{invoiceDialog.user?.firstName} {invoiceDialog.user?.lastName}</strong></p>
                <div>
                  <Label className="text-sm font-black text-primary mb-2 block">Concepto</Label>
                  <Input 
                    value={invoiceConcept} 
                    onChange={e => setInvoiceConcept(e.target.value)} 
                    placeholder="Ej: Servicio de consultoría" 
                    className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"
                    data-testid="input-invoice-concept"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label className="text-sm font-black text-primary mb-2 block">Importe</Label>
                    <Input 
                      type="number" 
                      value={invoiceAmount} 
                      onChange={e => setInvoiceAmount(e.target.value)} 
                      placeholder="739" 
                      className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"
                      data-testid="input-invoice-amount"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-black text-primary mb-2 block">Moneda</Label>
                    <Select value={invoiceCurrency} onValueChange={setInvoiceCurrency}>
                      <SelectTrigger className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" data-testid="select-invoice-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-zinc-900 z-[9999] rounded-xl">
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" onClick={() => setInvoiceDialog({ open: false, user: null })} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
                <Button 
                  onClick={() => invoiceDialog.user?.id && createInvoiceMutation.mutate({ 
                    userId: invoiceDialog.user.id, 
                    concept: invoiceConcept, 
                    amount: Math.round(parseFloat(invoiceAmount) * 100),
                    currency: invoiceCurrency
                  })} 
                  disabled={!invoiceConcept || !invoiceAmount || createInvoiceMutation.isPending}
                  className="w-full sm:w-auto bg-accent text-primary font-black rounded-full"
                  data-testid="button-create-invoice"
                >
                  {createInvoiceMutation.isPending ? 'Creando...' : 'Crear Factura'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Dialog open={deleteOwnAccountDialog} onOpenChange={setDeleteOwnAccountDialog}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-zinc-900 rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-black text-red-600">Eliminar Mi Cuenta</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar tu cuenta permanentemente?</p>
            <p className="text-xs text-red-500 mt-2">Esta acción no se puede deshacer. Todos tus datos serán eliminados.</p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setDeleteOwnAccountDialog(false)} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteOwnAccountMutation.mutate()} disabled={deleteOwnAccountMutation.isPending} className="rounded-full font-black" data-testid="button-confirm-delete-account">
              {deleteOwnAccountMutation.isPending ? 'Eliminando...' : 'Eliminar Mi Cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDialog.open} onOpenChange={(open) => { if (!open) setUploadDialog({ open: false, file: null }); }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md bg-white dark:bg-zinc-900 rounded-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black text-primary">Subir Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {uploadDialog.file && (
              <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg flex items-center gap-3">
                <FileUp className="w-7 h-7 sm:w-8 sm:h-8 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{uploadDialog.file.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{(uploadDialog.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs sm:text-sm font-black text-primary mb-2 block">Tipo de documento</Label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger className="w-full rounded-full h-11 sm:h-12 px-4 sm:px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" style={{ fontSize: '16px' }} data-testid="select-upload-doc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 z-[9999] rounded-xl max-h-[50vh]" position="popper" sideOffset={4}>
                  <SelectItem value="passport">Pasaporte / Documento de Identidad</SelectItem>
                  <SelectItem value="address_proof">Prueba de Domicilio</SelectItem>
                  <SelectItem value="tax_id">Identificación Fiscal (NIF/CIF)</SelectItem>
                  <SelectItem value="other">Otro Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {uploadDocType === "other" && (
              <div>
                <Label className="text-xs sm:text-sm font-black text-primary mb-2 block">Descripción del documento</Label>
                <Textarea 
                  value={uploadNotes} 
                  onChange={(e) => setUploadNotes(e.target.value)} 
                  placeholder="Describe el tipo de documento que estás subiendo..."
                  className="min-h-[80px] rounded-xl border-gray-200 focus:border-accent text-base"
                  style={{ fontSize: '16px' }}
                  data-testid="input-upload-notes"
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setUploadDialog({ open: false, file: null })} className="w-full sm:w-auto rounded-full font-black">Cancelar</Button>
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
              className="w-full sm:w-auto bg-accent text-primary font-black rounded-full"
              data-testid="button-confirm-upload"
            >
              Subir Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary">Crear Nuevo Cliente</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Completa los datos del nuevo cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-black text-primary mb-2 block">Nombre</Label>
                <Input value={newUserData.firstName} onChange={e => setNewUserData(p => ({ ...p, firstName: e.target.value }))} placeholder="Nombre" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-create-user-firstname" />
              </div>
              <div>
                <Label className="text-sm font-black text-primary mb-2 block">Apellidos</Label>
                <Input value={newUserData.lastName} onChange={e => setNewUserData(p => ({ ...p, lastName: e.target.value }))} placeholder="Apellidos" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-create-user-lastname" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-black text-primary mb-2 block">Email</Label>
              <Input type="email" value={newUserData.email} onChange={e => setNewUserData(p => ({ ...p, email: e.target.value }))} placeholder="email@ejemplo.com" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-create-user-email" />
            </div>
            <div>
              <Label className="text-sm font-black text-primary mb-2 block">Teléfono</Label>
              <Input value={newUserData.phone} onChange={e => setNewUserData(p => ({ ...p, phone: e.target.value }))} placeholder="+34 600 000 000" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-create-user-phone" />
            </div>
            <div>
              <Label className="text-sm font-black text-primary mb-2 block">Contraseña</Label>
              <Input type="password" value={newUserData.password} onChange={e => setNewUserData(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 8 caracteres" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-create-user-password" />
            </div>
          </div>
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setCreateUserDialog(false)} className="w-full sm:w-auto rounded-full font-black" data-testid="button-cancel-create-user">Cancelar</Button>
            <Button onClick={() => createUserMutation.mutate(newUserData)} disabled={createUserMutation.isPending || !newUserData.email || !newUserData.password} className="w-full sm:w-auto bg-accent text-primary font-black rounded-full" data-testid="button-confirm-create-user">
              {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOrderDialog} onOpenChange={setCreateOrderDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary">Crear Nuevo Pedido</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Configura el pedido para el cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-black text-primary mb-2 block">Cliente</Label>
              <Select value={newOrderData.userId} onValueChange={val => setNewOrderData(p => ({ ...p, userId: val }))}>
                <SelectTrigger className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" data-testid="select-order-user">
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 z-[9999] rounded-xl">
                  {adminUsers?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-black text-primary mb-2 block">Estado (LLC)</Label>
              <Select value={newOrderData.state} onValueChange={val => setNewOrderData(p => ({ ...p, state: val }))}>
                <SelectTrigger className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" data-testid="select-order-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 z-[9999] rounded-xl">
                  <SelectItem value="New Mexico">New Mexico - 739€</SelectItem>
                  <SelectItem value="Wyoming">Wyoming - 899€</SelectItem>
                  <SelectItem value="Delaware">Delaware - 1199€</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-black text-primary mb-2 block">Importe (€)</Label>
              <Input type="number" value={newOrderData.amount} onChange={e => setNewOrderData(p => ({ ...p, amount: e.target.value }))} placeholder="739" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" data-testid="input-order-amount" />
            </div>
          </div>
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setCreateOrderDialog(false)} className="w-full sm:w-auto rounded-full font-black" data-testid="button-cancel-create-order">Cancelar</Button>
            <Button onClick={() => createOrderMutation.mutate(newOrderData)} disabled={createOrderMutation.isPending || !newOrderData.userId || !newOrderData.amount} className="w-full sm:w-auto bg-accent text-primary font-black rounded-full" data-testid="button-confirm-create-order">
              {createOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Pedido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discountCodeDialog.open} onOpenChange={(open) => setDiscountCodeDialog({ open, code: open ? discountCodeDialog.code : null })}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary">
              {discountCodeDialog.code ? 'Editar Código de Descuento' : 'Nuevo Código de Descuento'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {discountCodeDialog.code ? 'Modifica los datos del código' : 'Configura un nuevo código de descuento'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-black text-primary mb-2 block">Código</Label>
              <Input 
                value={newDiscountCode.code} 
                onChange={e => setNewDiscountCode(p => ({ ...p, code: e.target.value.toUpperCase() }))} 
                className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base uppercase" 
                disabled={!!discountCodeDialog.code}
                data-testid="input-discount-code" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-black text-primary mb-2 block">Tipo</Label>
                <Select 
                  value={newDiscountCode.discountType} 
                  onValueChange={(val: 'percentage' | 'fixed') => setNewDiscountCode(p => ({ ...p, discountType: val }))}
                >
                  <SelectTrigger className="w-full rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" data-testid="select-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 z-[9999] rounded-xl">
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Fijo (centimos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-black text-primary mb-2 block">
                  Valor {newDiscountCode.discountType === 'percentage' ? '(%)' : '(centimos)'}
                </Label>
                <Input 
                  type="number" 
                  value={newDiscountCode.discountValue} 
                  onChange={e => setNewDiscountCode(p => ({ ...p, discountValue: e.target.value }))} 
                  className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" 
                  data-testid="input-discount-value" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-black text-primary mb-2 block">Pedido min. (EUR)</Label>
                <Input 
                  type="number" 
                  value={newDiscountCode.minOrderAmount} 
                  onChange={e => setNewDiscountCode(p => ({ ...p, minOrderAmount: e.target.value }))} 
                  className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" 
                  data-testid="input-discount-min-amount" 
                />
              </div>
              <div>
                <Label className="text-sm font-black text-primary mb-2 block">Usos max.</Label>
                <Input 
                  type="number" 
                  value={newDiscountCode.maxUses} 
                  onChange={e => setNewDiscountCode(p => ({ ...p, maxUses: e.target.value }))} 
                  className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" 
                  data-testid="input-discount-max-uses" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-black text-primary mb-2 block">Válido desde</Label>
                <Input 
                  type="date" 
                  value={newDiscountCode.validFrom} 
                  onChange={e => setNewDiscountCode(p => ({ ...p, validFrom: e.target.value }))} 
                  className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" 
                  data-testid="input-discount-valid-from" 
                />
              </div>
              <div>
                <Label className="text-sm font-black text-primary mb-2 block">Válido hasta</Label>
                <Input 
                  type="date" 
                  value={newDiscountCode.validUntil} 
                  onChange={e => setNewDiscountCode(p => ({ ...p, validUntil: e.target.value }))} 
                  className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" 
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
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setDiscountCodeDialog({ open: false, code: null })} className="w-full sm:w-auto rounded-full font-black" data-testid="button-cancel-discount">Cancelar</Button>
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
              className="w-full sm:w-auto bg-accent text-primary font-black rounded-full" 
              data-testid="button-save-discount"
            >
              {discountCodeDialog.code ? 'Guardar Cambios' : 'Crear Código'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailVerification} onOpenChange={(open) => {
        setShowEmailVerification(open);
        if (!open) {
          setEmailVerificationCode("");
        }
      }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Verifica tu correo electrónico</DialogTitle>
            <DialogDescription>Te hemos enviado un código de verificación para confirmar tu email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-black text-primary block mb-2">Código de verificación</Label>
              <Input
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="rounded-full text-center text-2xl font-black border-gray-200 focus:border-accent tracking-[0.5em]"
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
              className="w-full bg-accent text-primary font-black rounded-full"
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
        </DialogContent>
      </Dialog>

      <Dialog open={paymentLinkDialog.open} onOpenChange={(open) => {
        setPaymentLinkDialog({ open, user: open ? paymentLinkDialog.user : null });
        if (!open) {
          setPaymentLinkUrl("");
          setPaymentLinkAmount("");
          setPaymentLinkMessage("");
        }
      }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Enviar Link de Pago</DialogTitle>
            <DialogDescription>
              Envía un enlace de pago a {paymentLinkDialog.user?.firstName} {paymentLinkDialog.user?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-black text-primary block mb-2">Link de pago (URL)</Label>
              <Input
                value={paymentLinkUrl}
                onChange={(e) => setPaymentLinkUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-full border-gray-200 focus:border-accent"
                data-testid="input-payment-link-url"
              />
            </div>
            <div>
              <Label className="text-sm font-black text-primary block mb-2">Importe</Label>
              <Input
                value={paymentLinkAmount}
                onChange={(e) => setPaymentLinkAmount(e.target.value)}
                placeholder="Ej: 739€"
                className="rounded-full border-gray-200 focus:border-accent"
                data-testid="input-payment-link-amount"
              />
            </div>
            <div>
              <Label className="text-sm font-black text-primary block mb-2">Mensaje (opcional)</Label>
              <Textarea
                value={paymentLinkMessage}
                onChange={(e) => setPaymentLinkMessage(e.target.value)}
                placeholder="Mensaje adicional para el cliente..."
                className="rounded-xl border-gray-200 focus:border-accent resize-none"
                rows={3}
                data-testid="input-payment-link-message"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setPaymentLinkDialog({ open: false, user: null })}
              className="w-full sm:w-auto rounded-full"
            >
              Cancelar
            </Button>
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
              className="w-full sm:w-auto bg-accent text-primary font-black rounded-full"
              data-testid="button-send-payment-link"
            >
              {isSendingPaymentLink ? <Loader2 className="animate-spin" /> : "Enviar Link de Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
