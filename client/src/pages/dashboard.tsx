import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Building2, FileText, Clock, ChevronRight, User as UserIcon, Settings, Package, CreditCard, PlusCircle, Download, ExternalLink, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, Users, Power, Edit, Trash2, FileUp, Newspaper, Loader2, CheckCircle, Receipt, Plus, Calendar, DollarSign, TrendingUp, BarChart3, UserCheck, UserX, Star, Eye, FileCheck } from "lucide-react";
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

type Tab = 'services' | 'profile' | 'payments' | 'documents' | 'messages' | 'notifications' | 'admin' | 'calendar';

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
      toast({ title: "Preferencia actualizada", description: "Tu suscripción ha sido actualizada correctamente." });
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
  const [emailDialog, setEmailDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [paymentLink, setPaymentLink] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [docDialog, setDocDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [docType, setDocType] = useState("");
  const [docMessage, setDocMessage] = useState("");
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [noteTitle, setNoteTitle] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [noteType, setNoteType] = useState("info");
  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [invoiceConcept, setInvoiceConcept] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
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
      toast({ title: "Perfil actualizado" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
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
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({ title: "Respuesta enviada", description: "Tu mensaje ha sido registrado." });
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
    suspendedAccounts: number;
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

  const sendEmailMutation = useMutation({
    mutationFn: async ({ to, subject, message }: { to: string, subject: string, message: string }) => {
      await apiRequest("POST", "/api/admin/send-email", { to, subject, message });
    },
    onSuccess: () => {
      toast({ title: "Email enviado" });
      setEmailDialog({ open: false, user: null });
      setEmailSubject("");
      setEmailMessage("");
    }
  });

  const sendNoteMutation = useMutation({
    mutationFn: async ({ userId, email, title, message, type }: { userId: string, email: string, title: string, message: string, type: string }) => {
      await apiRequest("POST", "/api/admin/send-note", { userId, email, title, message, type, sendEmail: true });
    },
    onSuccess: () => {
      toast({ title: "Nota enviada al cliente" });
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

  const createInvoiceMutation = useMutation({
    mutationFn: async ({ userId, concept, amount }: { userId: string, concept: string, amount: number }) => {
      await apiRequest("POST", "/api/admin/invoices/create", { userId, concept, amount });
    },
    onSuccess: () => {
      toast({ title: "Factura creada", description: "La factura se ha añadido al centro de documentos del cliente" });
      setInvoiceDialog({ open: false, user: null });
      setInvoiceConcept("");
      setInvoiceAmount("");
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

  if (user?.accountStatus === 'suspended') {
    return (
      <div className="min-h-screen bg-[#F7F7F5] font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <Card className="rounded-[2rem] border-0 shadow-2xl overflow-hidden bg-white">
              <div className="bg-red-500 h-2 w-full" />
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight mb-4">
                  Tu cuenta está desactivada
                </h1>
                <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                  Revisa tu email, deberías haber recibido una nota de nuestro equipo con más información.
                </p>
                <div className="space-y-3">
                  <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full bg-accent text-primary font-black rounded-full py-6 shadow-lg shadow-accent/20">
                      Contactar Soporte
                    </Button>
                  </a>
                  <Button 
                    variant="ghost" 
                    className="w-full font-black text-muted-foreground"
                    onClick={() => apiRequest("POST", "/api/logout").then(() => window.location.href = "/")}
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
    <div className="min-h-screen bg-[#F7F7F5] font-sans">
      <Navbar />
      <main className="pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
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
              <Button className="w-full md:w-auto bg-accent text-primary font-black rounded-full px-6 md:px-8 py-5 md:py-6 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-sm md:text-base">
                <PlusCircle className="w-5 h-5" /> Nueva LLC
              </Button>
            </Link>
          </motion.div>
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
                : 'bg-white text-muted-foreground border-0'
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
            <AnimatePresence mode="wait">
              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-lg md:text-2xl font-black text-primary tracking-tight">Mis Servicios</h2>
                    <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Gestiona tus trámites activos</p>
                  </div>
                  
                  {(!orders || orders.length === 0) ? (
                    <Card className="rounded-2xl border-0 shadow-sm bg-white p-8 text-center">
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
                        <Card key={order.id} className="rounded-xl md:rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                          <CardHeader className="bg-primary/5 pb-3 md:pb-4 p-3 md:p-6">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] md:text-[10px] font-black text-accent uppercase tracking-widest mb-1">Pedido: {order.application?.requestCode || order.invoiceNumber || order.id}</p>
                                <CardTitle className="text-base md:text-lg font-black text-primary truncate">{order.product?.name}</CardTitle>
                              </div>
                              <Badge className="bg-accent text-primary font-black uppercase text-[9px] md:text-[10px] shrink-0">
                                {order.status}
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
                                  <p className="text-[10px] text-muted-foreground">Estamos revisando tu solicitud.</p>
                                </div>
                              )}
                            </div>
                            {order.status === 'pending' && (
                              <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8 rounded-full font-black">
                                  MODIFICAR DATOS
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Notificaciones</h2>
                  {notificationsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
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
                      {notifications?.map((notif) => (
                        <Card 
                          key={notif.id} 
                          className={`rounded-2xl border-0 shadow-sm transition-all hover:shadow-md ${!notif.isRead ? 'bg-accent/5 border-l-4 border-l-accent' : ''}`}
                        >
                          <CardContent className="p-4 md:p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
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
                                    className="mt-3 bg-accent text-primary font-black rounded-full text-xs px-4"
                                    onClick={() => {
                                      markNotificationRead.mutate(notif.id);
                                      setActiveTab('documents');
                                    }}
                                    data-testid={`button-complete-action-${notif.id}`}
                                  >
                                    Completar
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
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Mis Consultas y Soporte</h2>
                    <Link href="/contacto">
                      <Button className="bg-accent text-primary font-black rounded-full text-xs">Nueva Consulta</Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {(!messagesData || messagesData.length === 0) ? (
                      <Card className="rounded-2xl border-0 shadow-sm p-8 bg-white text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Todavía no hay mensajes</p>
                        <p className="text-sm text-muted-foreground mt-2">Tus conversaciones con soporte aparecerán aquí</p>
                      </Card>
                    ) : (
                      messagesData.map((msg) => (
                        <Card key={msg.id} className="rounded-2xl border-0 shadow-sm p-6 bg-white hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-accent" />
                              <h4 className="font-black text-primary">{msg.subject || 'Sin asunto'}</h4>
                            </div>
                            <span className="text-[10px] text-muted-foreground">MSG-{msg.id}</span>
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
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div key="documents" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 flex flex-col items-center text-center bg-white border-2 border-dashed border-gray-200">
                      <label className="cursor-pointer w-full">
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
                        <FileUp className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                        <h3 className="font-black text-gray-600 mb-2 text-sm md:text-base">Subir Documento</h3>
                        <p className="text-[10px] text-muted-foreground mb-4">PDF, JPG o PNG (máx. 10MB)</p>
                        <Button variant="outline" className="rounded-full font-black border-2 w-full text-xs py-5" asChild>
                          <span><FileUp className="w-4 h-4 mr-2" /> SELECCIONAR ARCHIVO</span>
                        </Button>
                      </label>
                    </Card>
                    
                    {userDocuments?.map((doc: any) => (
                      <Card key={doc.id} className="rounded-xl md:rounded-2xl border-0 shadow-sm p-4 md:p-6 flex flex-col items-center text-center bg-white">
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
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Historial de Pagos</h2>
                  <div className="space-y-4">
                    {(!orders || orders.length === 0) ? (
                      <Card className="rounded-2xl border-0 shadow-sm p-8 bg-white text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Todavía no has contratado ningún servicio</p>
                        <p className="text-sm text-muted-foreground mt-2">Tus facturas y recibos aparecerán aquí</p>
                      </Card>
                    ) : (
                      orders.map((order: any) => (
                        <Card key={order.id} className="rounded-2xl border-0 shadow-sm p-6 flex justify-between items-center bg-white">
                          <div>
                            <p className="font-black text-xs md:text-sm">Factura ORD-{order.id}</p>
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
                </motion.div>
              )}

              {activeTab === 'calendar' && (
                <motion.div key="calendar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Calendario Fiscal</h2>
                    <p className="text-xs text-muted-foreground font-medium">Fechas importantes de tu LLC</p>
                  </div>
                  {orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => {
                        const app = order.application;
                        if (!app) return null;
                        const dates = [
                          { label: 'Creación de LLC', date: app.llcCreatedDate, icon: Building2, color: 'bg-green-100 text-green-700' },
                          { label: 'Renovación Agente Registrado', date: app.agentRenewalDate, icon: Users, color: 'bg-blue-100 text-blue-700' },
                          { label: 'IRS Form 1120', date: app.irs1120DueDate, icon: FileText, color: 'bg-orange-100 text-orange-700' },
                          { label: 'IRS Form 5472', date: app.irs5472DueDate, icon: FileText, color: 'bg-red-100 text-red-700' },
                          { label: 'Reporte Anual', date: app.annualReportDueDate, icon: Newspaper, color: 'bg-purple-100 text-purple-700' },
                        ];
                        const hasDates = dates.some(d => d.date);
                        return (
                          <Card key={order.id} className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="pb-2 border-b bg-gray-50">
                              <CardTitle className="text-base font-black flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-accent" />
                                {app.companyName || 'LLC en proceso'} 
                                <Badge variant="outline" className="ml-2 text-[10px]">{app.state}</Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              {hasDates ? (
                                <div className="grid gap-3">
                                  {dates.map((item, idx) => {
                                    if (!item.date) return null;
                                    const date = new Date(item.date);
                                    const isUpcoming = date > new Date();
                                    const isPast = date < new Date();
                                    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                    return (
                                      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${item.color}`}>
                                        <div className="flex items-center gap-3">
                                          <item.icon className="w-4 h-4" />
                                          <span className="font-bold text-sm">{item.label}</span>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-black text-sm">{date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                          {isUpcoming && daysUntil <= 30 && (
                                            <span className="text-[10px] font-bold">En {daysUntil} días</span>
                                          )}
                                          {isPast && (
                                            <span className="text-[10px] font-bold opacity-70">Completado</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                  <p className="text-sm text-muted-foreground">Las fechas importantes aparecerán aquí cuando tu LLC esté activa</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="rounded-[2rem] border-0 shadow-sm p-8 bg-white text-center">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-black text-primary mb-2">Sin fechas programadas</h3>
                      <p className="text-sm text-muted-foreground mb-4">Contrata tu primera LLC para ver las fechas importantes</p>
                      <Link href="/servicios#pricing">
                        <Button className="bg-accent text-primary font-black rounded-full">
                          <PlusCircle className="w-4 h-4 mr-2" /> Comenzar
                        </Button>
                      </Link>
                    </Card>
                  )}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 bg-white">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black">Información Personal</h3>
                      {canEdit && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} data-testid="button-toggle-edit">{isEditing ? 'Cancelar' : 'Editar'}</Button>
                      )}
                    </div>
                    {!canEdit && (
                      <div className={`mb-4 p-3 rounded-lg ${user?.accountStatus === 'pending' ? 'bg-orange-50 border border-orange-200' : user?.accountStatus === 'suspended' ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className={`text-sm ${user?.accountStatus === 'pending' ? 'text-orange-700' : user?.accountStatus === 'suspended' ? 'text-yellow-700' : 'text-red-700'}`}>
                          {user?.accountStatus === 'pending' 
                            ? 'Tu cuenta está en revisión. No puedes modificar tu perfil hasta que sea verificada.' 
                            : user?.accountStatus === 'suspended' 
                            ? 'Tu cuenta está suspendida temporalmente. Contacta con soporte para más información.'
                            : 'Tu cuenta ha sido desactivada. No puedes modificar tu perfil.'}
                        </p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">ID Cliente</p>
                          <p className="text-lg font-black font-mono">{user?.clientId || user?.id?.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Estado</p>
                          <p className={`text-lg font-black ${user?.accountStatus === 'active' ? 'text-green-600' : user?.accountStatus === 'pending' ? 'text-orange-500' : user?.accountStatus === 'suspended' ? 'text-red-600' : user?.accountStatus === 'deactivated' ? 'text-gray-500' : user?.accountStatus === 'vip' ? 'text-yellow-600' : 'text-green-600'}`}>
                            {user?.accountStatus === 'active' ? 'Verificado' : user?.accountStatus === 'pending' ? 'Pendiente' : user?.accountStatus === 'suspended' ? 'Suspendido' : user?.accountStatus === 'deactivated' ? 'Desactivado' : user?.accountStatus === 'vip' ? 'VIP' : 'Verificado'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Nombre</Label>
                          {isEditing && canEdit ? <Input value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} data-testid="input-firstname" /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.firstName || '-'}</div>}
                        </div>
                        <div className="space-y-1">
                          <Label>Apellido</Label>
                          {isEditing && canEdit ? <Input value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} data-testid="input-lastname" /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.lastName || '-'}</div>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm">
                          <span>{user?.email}</span>
                          {user?.emailVerified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Teléfono</Label>
                        {isEditing && canEdit ? <Input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} data-testid="input-phone" /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.phone || 'No proporcionado'}</div>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Tipo de Documento</Label>
                          {isEditing && canEdit ? (
                            <Select value={profileData.idType} onValueChange={val => setProfileData({...profileData, idType: val})}>
                              <SelectTrigger className="bg-white" data-testid="select-idtype"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dni">DNI</SelectItem>
                                <SelectItem value="nie">NIE</SelectItem>
                                <SelectItem value="passport">Pasaporte</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.idType === 'dni' ? 'DNI' : user?.idType === 'nie' ? 'NIE' : user?.idType === 'passport' ? 'Pasaporte' : 'No proporcionado'}</div>}
                        </div>
                        <div className="space-y-1">
                          <Label>Número de Documento</Label>
                          {isEditing && canEdit ? <Input value={profileData.idNumber} onChange={e => setProfileData({...profileData, idNumber: e.target.value})} placeholder="Ej: 12345678A" data-testid="input-idnumber" /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.idNumber || 'No proporcionado'}</div>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Fecha de Nacimiento</Label>
                        {isEditing && canEdit ? <Input type="date" value={profileData.birthDate} onChange={e => setProfileData({...profileData, birthDate: e.target.value})} data-testid="input-birthdate" /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.birthDate || 'No proporcionado'}</div>}
                      </div>
                      <div className="space-y-1">
                        <Label>Actividad de Negocio</Label>
                        {isEditing && canEdit ? (
                          <Select value={profileData.businessActivity} onValueChange={val => setProfileData({...profileData, businessActivity: val})}>
                            <SelectTrigger className="bg-white" data-testid="select-activity"><SelectValue placeholder="Seleccionar actividad" /></SelectTrigger>
                            <SelectContent>
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
                        ) : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.businessActivity || 'No proporcionado'}</div>}
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-bold text-sm mb-3">Dirección</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Tipo de Vía</Label>
                            {isEditing && canEdit ? (
                              <Select value={profileData.streetType} onValueChange={val => setProfileData({...profileData, streetType: val})}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="calle">Calle</SelectItem>
                                  <SelectItem value="avenida">Avenida</SelectItem>
                                  <SelectItem value="paseo">Paseo</SelectItem>
                                  <SelectItem value="plaza">Plaza</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.streetType || '-'}</div>}
                          </div>
                          <div className="space-y-1">
                            <Label>Dirección</Label>
                            {isEditing && canEdit ? <Input value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder="Nombre de la calle y número" /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.address || '-'}</div>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="space-y-1">
                            <Label>Ciudad</Label>
                            {isEditing && canEdit ? <Input value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.city || '-'}</div>}
                          </div>
                          <div className="space-y-1">
                            <Label>Provincia</Label>
                            {isEditing && canEdit ? <Input value={profileData.province} onChange={e => setProfileData({...profileData, province: e.target.value})} /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.province || '-'}</div>}
                          </div>
                          <div className="space-y-1">
                            <Label>C.P.</Label>
                            {isEditing && canEdit ? <Input value={profileData.postalCode} onChange={e => setProfileData({...profileData, postalCode: e.target.value})} /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.postalCode || '-'}</div>}
                          </div>
                          <div className="space-y-1">
                            <Label>País</Label>
                            {isEditing && canEdit ? <Input value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} /> : <div className="p-3 bg-gray-50 rounded-lg text-sm">{user?.country || '-'}</div>}
                          </div>
                        </div>
                      </div>
                      {isEditing && canEdit && <Button onClick={() => { updateProfile.mutate(profileData); setIsEditing(false); }} className="w-full bg-accent text-primary font-black rounded-full mt-4" disabled={updateProfile.isPending} data-testid="button-save-profile">Guardar Cambios</Button>}
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
                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                          {passwordStep === 'form' && (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs">Contraseña actual</Label>
                                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" data-testid="input-current-password" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Nueva contraseña</Label>
                                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" data-testid="input-new-password" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Confirmar nueva contraseña</Label>
                                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" data-testid="input-confirm-password" />
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
                                  placeholder="000000" 
                                  className="text-center text-2xl tracking-[0.5em] font-mono"
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
                </motion.div>
              )}

              {activeTab === 'admin' && user?.isAdmin && (
                <motion.div key="admin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                    {['dashboard', 'orders', 'users', 'calendar', 'newsletter', 'inbox'].map(tab => (
                      <Button key={tab} variant={adminSubTab === tab ? "default" : "outline"} onClick={() => setAdminSubTab(tab)} className="rounded-full text-[10px] md:text-xs font-black capitalize px-2 md:px-3" data-testid={`button-admin-tab-${tab}`}>
                        <span className="hidden sm:inline">{tab === 'dashboard' ? 'Métricas' : tab === 'calendar' ? 'Fechas' : tab === 'orders' ? 'Pedidos' : tab === 'users' ? 'Clientes' : tab}</span>
                        <span className="sm:hidden">{tab === 'dashboard' ? <BarChart3 className="w-3 h-3" /> : tab === 'calendar' ? 'Cal' : tab === 'orders' ? 'Ord' : tab === 'users' ? 'Cli' : tab === 'newsletter' ? 'News' : 'Msg'}</span>
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
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" data-testid="heading-sales"><DollarSign className="w-4 h-4 text-accent" /> Ventas</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Total Ventas</p>
                            <p className="text-lg md:text-2xl font-black text-green-600" data-testid="stat-total-sales">{((adminStats?.totalSales || 0) / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Pendiente Cobro</p>
                            <p className="text-lg md:text-2xl font-black text-yellow-600" data-testid="stat-pending-sales">{((adminStats?.pendingSales || 0) / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Pedidos Totales</p>
                            <p className="text-lg md:text-2xl font-black" data-testid="stat-total-orders">{adminStats?.orderCount || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Conversión</p>
                            <p className="text-lg md:text-2xl font-black text-accent" data-testid="stat-conversion">{adminStats?.conversionRate || 0}%</p>
                          </Card>
                        </div>
                      </div>

                      {/* Estado Pedidos */}
                      <div data-testid="section-orders">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" data-testid="heading-orders"><Package className="w-4 h-4 text-accent" /> Estado de Pedidos</h3>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Pendientes</p>
                            <p className="text-xl md:text-3xl font-black text-orange-500" data-testid="stat-pending-orders">{adminStats?.pendingOrders || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                            <p className="text-[10px] md:text-xs text-muted-foreground">En Proceso</p>
                            <p className="text-xl md:text-3xl font-black text-blue-500" data-testid="stat-processing-orders">{adminStats?.processingOrders || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Completados</p>
                            <p className="text-xl md:text-3xl font-black text-green-500" data-testid="stat-completed-orders">{adminStats?.completedOrders || 0}</p>
                          </Card>
                        </div>
                      </div>

                      {/* Usuarios */}
                      <div data-testid="section-crm">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" data-testid="heading-crm"><Users className="w-4 h-4 text-accent" /> Clientes (CRM)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Total Usuarios</p>
                            <p className="text-xl md:text-3xl font-black" data-testid="stat-total-users">{adminStats?.userCount || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-green-500" />
                              <p className="text-[10px] md:text-xs text-muted-foreground">Activos</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-green-500" data-testid="stat-active-users">{adminStats?.activeAccounts || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <p className="text-[10px] md:text-xs text-muted-foreground">VIP</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-yellow-500" data-testid="stat-vip-users">{adminStats?.vipAccounts || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-orange-500" />
                              <p className="text-[10px] md:text-xs text-muted-foreground">En Revisión</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-orange-500" data-testid="stat-pending-accounts">{adminStats?.pendingAccounts || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
                            <div className="flex items-center gap-1">
                              <UserX className="w-3 h-3 text-red-500" />
                              <p className="text-[10px] md:text-xs text-muted-foreground">Suspendidos</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-red-500" data-testid="stat-suspended-users">{adminStats?.suspendedAccounts || 0}</p>
                          </Card>
                        </div>
                      </div>

                      {/* Comunicaciones y Documentos */}
                      <div data-testid="section-communications">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" data-testid="heading-communications"><MessageSquare className="w-4 h-4 text-accent" /> Comunicaciones</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Suscriptores Newsletter</p>
                            <p className="text-xl md:text-3xl font-black text-accent" data-testid="stat-subscribers">{adminStats?.subscriberCount || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Mensajes Totales</p>
                            <p className="text-xl md:text-3xl font-black" data-testid="stat-total-messages">{adminStats?.totalMessages || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Mensajes Pendientes</p>
                            <p className="text-xl md:text-3xl font-black text-orange-500" data-testid="stat-pending-messages">{adminStats?.pendingMessages || 0}</p>
                          </Card>
                          <Card className="p-3 md:p-4 rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                            <div className="flex items-center gap-1">
                              <FileCheck className="w-3 h-3 text-blue-500" />
                              <p className="text-[10px] md:text-xs text-muted-foreground">Docs Pendientes</p>
                            </div>
                            <p className="text-xl md:text-3xl font-black text-blue-500" data-testid="stat-pending-docs">{adminStats?.pendingDocs || 0}</p>
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
                        {adminOrders?.map(order => (
                          <div key={order.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-black">ORD-{order.id} - {order.user?.firstName} {order.user?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                                <p className="text-xs text-muted-foreground">{order.product?.name} • {(order.amount / 100).toFixed(2)}€</p>
                              </div>
                              <Select value={order.status} onValueChange={val => updateStatusMutation.mutate({ id: order.id, status: val })}>
                                <SelectTrigger className="w-full md:w-32 h-9 rounded-full text-xs bg-white border"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendiente</SelectItem>
                                  <SelectItem value="paid">Pagado</SelectItem>
                                  <SelectItem value="filed">Presentado</SelectItem>
                                  <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={() => window.open(`/api/admin/invoice/${order.id}`, '_blank')} data-testid={`btn-view-invoice-${order.id}`}>
                                <FileText className="w-3 h-3 mr-1" /> Ver Factura
                              </Button>
                              <Button size="sm" variant="default" className="h-7 text-xs rounded-full bg-accent text-primary" onClick={async () => {
                                try {
                                  await apiRequest("POST", `/api/admin/orders/${order.id}/generate-invoice`);
                                  toast({ title: "Factura generada", description: "La factura ha sido creada y añadida al centro de documentos del cliente." });
                                  queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                                } catch (err) {
                                  toast({ title: "Error", description: "No se pudo generar la factura", variant: "destructive" });
                                }
                              }} data-testid={`btn-generate-invoice-${order.id}`}>
                                <Plus className="w-3 h-3 mr-1" /> Generar Factura
                              </Button>
                            </div>
                          </div>
                        ))}
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
                                <Badge variant={u.accountStatus === 'active' ? 'default' : u.accountStatus === 'vip' ? 'default' : 'secondary'} className={`text-[9px] ${u.accountStatus === 'suspended' ? 'bg-red-100 text-red-700' : u.accountStatus === 'deactivated' ? 'bg-gray-200 text-gray-600' : u.accountStatus === 'vip' ? 'bg-yellow-100 text-yellow-700' : u.accountStatus === 'pending' ? 'bg-orange-100 text-orange-700' : ''}`}>
                                  {u.accountStatus === 'active' ? 'VERIFICADO' : u.accountStatus === 'pending' ? 'PENDIENTE' : u.accountStatus === 'suspended' ? 'SUSPENDIDO' : u.accountStatus === 'deactivated' ? 'DESACTIVADO' : u.accountStatus === 'vip' ? 'VIP' : 'VERIFICADO'}
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
                                  <SelectTrigger className="w-full h-9 rounded-full text-xs bg-white border shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="pending">Revisión</SelectItem>
                                    <SelectItem value="suspended">Suspendido (Temporal)</SelectItem>
                                    <SelectItem value="deactivated">Desactivado (Permanente)</SelectItem>
                                    <SelectItem value="vip">VIP</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                              <Button size="icon" variant="outline" className="h-10 w-10 md:h-7 md:w-auto md:px-2 rounded-full" onClick={() => setEditingUser(u)} data-testid={`button-edit-user-${u.id}`}>
                                <Edit className="w-4 h-4 md:w-3 md:h-3" /><span className="hidden md:inline ml-1 text-[10px]">Editar</span>
                              </Button>
                              <Button size="icon" variant="outline" className="h-10 w-10 md:h-7 md:w-auto md:px-2 rounded-full" onClick={() => setEmailDialog({ open: true, user: u })} data-testid={`button-email-user-${u.id}`}>
                                <Mail className="w-4 h-4 md:w-3 md:h-3" /><span className="hidden md:inline ml-1 text-[10px]">Email</span>
                              </Button>
                              <Button size="icon" variant="outline" className="h-10 w-10 md:h-7 md:w-auto md:px-2 rounded-full" onClick={() => setNoteDialog({ open: true, user: u })} data-testid={`button-note-user-${u.id}`}>
                                <MessageSquare className="w-4 h-4 md:w-3 md:h-3" /><span className="hidden md:inline ml-1 text-[10px]">Nota</span>
                              </Button>
                              <Button size="icon" variant="outline" className="h-10 w-10 md:h-7 md:w-auto md:px-2 rounded-full" onClick={() => setDocDialog({ open: true, user: u })} data-testid={`button-doc-user-${u.id}`}>
                                <FileUp className="w-4 h-4 md:w-3 md:h-3" /><span className="hidden md:inline ml-1 text-[10px]">Docs</span>
                              </Button>
                              <Button size="icon" variant="outline" className="h-10 w-10 md:h-7 md:w-auto md:px-2 rounded-full" onClick={() => setInvoiceDialog({ open: true, user: u })} data-testid={`button-invoice-user-${u.id}`}>
                                <FileText className="w-4 h-4 md:w-3 md:h-3" /><span className="hidden md:inline ml-1 text-[10px]">Factura</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-10 md:h-7 text-[10px] rounded-full text-red-600" onClick={() => setDeleteConfirm({ open: true, user: u })} data-testid={`button-delete-user-${u.id}`}>
                                <Trash2 className="w-4 h-4 md:w-3 md:h-3 mr-1" /> Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'calendar' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-4 overflow-hidden">
                      <h4 className="font-black text-sm mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> Gestión de Fechas Fiscales</h4>
                      <div className="space-y-4">
                        {adminOrders?.map((order: any) => {
                          const app = order.application;
                          if (!app) return null;
                          return (
                            <div key={order.id} className="border rounded-xl p-4 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-black text-sm">{app.companyName || 'LLC pendiente'}</p>
                                  <p className="text-[10px] text-muted-foreground">{order.user?.firstName} {order.user?.lastName} • {app.state}</p>
                                </div>
                                <Badge variant="outline" className="text-[10px]">ORD-{order.id}</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-[10px] text-muted-foreground">Creación LLC</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 text-xs" 
                                    defaultValue={app.llcCreatedDate ? new Date(app.llcCreatedDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'llcCreatedDate', value: e.target.value })}
                                    data-testid={`input-llc-created-${app.id}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] text-muted-foreground">Renovación Agente</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 text-xs" 
                                    defaultValue={app.agentRenewalDate ? new Date(app.agentRenewalDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'agentRenewalDate', value: e.target.value })}
                                    data-testid={`input-agent-renewal-${app.id}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] text-muted-foreground">IRS 1120</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 text-xs" 
                                    defaultValue={app.irs1120DueDate ? new Date(app.irs1120DueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs1120DueDate', value: e.target.value })}
                                    data-testid={`input-irs1120-${app.id}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] text-muted-foreground">IRS 5472</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 text-xs" 
                                    defaultValue={app.irs5472DueDate ? new Date(app.irs5472DueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => updateLlcDatesMutation.mutate({ appId: app.id, field: 'irs5472DueDate', value: e.target.value })}
                                    data-testid={`input-irs5472-${app.id}`}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label className="text-[10px] text-muted-foreground">Reporte Anual</Label>
                                  <Input 
                                    type="date" 
                                    className="h-8 text-xs" 
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
                              className="bg-white"
                              data-testid="input-broadcast-subject"
                            />
                            <Textarea 
                              value={broadcastMessage} 
                              onChange={e => setBroadcastMessage(e.target.value)} 
                              placeholder="Contenido del mensaje" 
                              rows={4}
                              className="bg-white"
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
                          <div key={msg.id} className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-black text-sm">{msg.firstName} {msg.lastName}</p>
                                <p className="text-xs text-muted-foreground">{msg.email} {msg.phone && `• ${msg.phone}`}</p>
                              </div>
                              <Badge variant="secondary" className="text-[10px]">{msg.status || 'pending'}</Badge>
                            </div>
                            <p className="text-xs font-medium">{msg.subject}</p>
                            <p className="text-xs text-muted-foreground">{msg.message}</p>
                            <p className="text-[10px] text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleString('es-ES') : ''}</p>
                          </div>
                        ))}
                        {(!adminMessages || adminMessages.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground text-sm">No hay mensajes</div>
                        )}
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}

                          </AnimatePresence>
          </div>

          <div className="space-y-6 md:gap-8 order-2 lg:order-2">
            <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm">
              <h3 className="text-lg md:text-xl font-black tracking-tight text-primary mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" /> Seguimiento
              </h3>
              <div className="space-y-5">
                {orders && orders.length > 0 ? (
                  selectedOrderEvents && selectedOrderEvents.length > 0 ? (
                    selectedOrderEvents.map((event: any, idx: number) => (
                      <div key={event.id} className="flex gap-4 relative">
                        {idx < selectedOrderEvents.length - 1 && <div className="absolute left-3 top-6 w-0.5 h-8 bg-gray-100" />}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 bg-accent text-primary"><CheckCircle2 className="w-3 h-3" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs md:text-sm font-black text-primary truncate">{event.eventType}</p>
                          <p className="text-[10px] text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div><p className="text-xs font-black">Pedido Recibido</p></div>
                      <div className="flex gap-4"><div className="w-6 h-6 rounded-full bg-gray-100" /><p className="text-xs text-gray-400">Verificación de Datos</p></div>
                    </div>
                  )
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
          <Dialog open={emailDialog.open} onOpenChange={(open) => setEmailDialog({ open, user: open ? emailDialog.user : null })}>
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[90vw] bg-white rounded-lg shadow-2xl z-[100]">
              <DialogHeader><DialogTitle className="text-lg font-bold">Enviar Email</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Asunto" data-testid="input-email-subject" />
                <Textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)} placeholder="Mensaje" rows={5} data-testid="input-email-message" />
                <DialogFooter>
                  <Button onClick={() => emailDialog.user?.email && sendEmailMutation.mutate({ to: emailDialog.user.email, subject: emailSubject, message: emailMessage })} disabled={!emailSubject || !emailMessage || sendEmailMutation.isPending} data-testid="button-send-email">
                    Enviar
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={noteDialog.open} onOpenChange={(open) => setNoteDialog({ open, user: open ? noteDialog.user : null })}>
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[90vw] bg-white rounded-lg shadow-2xl z-[100]">
              <DialogHeader><DialogTitle className="text-lg font-bold">Enviar Nota</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Título" data-testid="input-note-title" />
                <Textarea value={noteMessage} onChange={e => setNoteMessage(e.target.value)} placeholder="Mensaje" rows={4} data-testid="input-note-message" />
                <DialogFooter>
                  <Button onClick={() => noteDialog.user?.id && noteDialog.user?.email && sendNoteMutation.mutate({ userId: noteDialog.user.id, email: noteDialog.user.email, title: noteTitle, message: noteMessage, type: noteType })} disabled={!noteTitle || !noteMessage || sendNoteMutation.isPending} data-testid="button-send-note">
                    Enviar Nota
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-[95vw] bg-white rounded-lg shadow-2xl z-[100] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-lg font-bold">Editar Usuario</DialogTitle></DialogHeader>
              {editingUser && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Nombre</Label>
                      <Input value={editingUser.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} data-testid="input-edit-firstname" />
                    </div>
                    <div>
                      <Label className="text-xs">Apellidos</Label>
                      <Input value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} data-testid="input-edit-lastname" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} data-testid="input-edit-email" />
                  </div>
                  <div>
                    <Label className="text-xs">Teléfono</Label>
                    <Input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} data-testid="input-edit-phone" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Tipo ID</Label>
                      <Select value={editingUser.idType || ''} onValueChange={val => setEditingUser({...editingUser, idType: val})}>
                        <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dni">DNI</SelectItem>
                          <SelectItem value="nie">NIE</SelectItem>
                          <SelectItem value="passport">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Número ID</Label>
                      <Input value={editingUser.idNumber || ''} onChange={e => setEditingUser({...editingUser, idNumber: e.target.value})} data-testid="input-edit-idnumber" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Fecha Nacimiento</Label>
                    <Input type="date" value={editingUser.birthDate || ''} onChange={e => setEditingUser({...editingUser, birthDate: e.target.value})} data-testid="input-edit-birthdate" />
                  </div>
                  <div>
                    <Label className="text-xs">Actividad de Negocio</Label>
                    <Select value={editingUser.businessActivity || ''} onValueChange={val => setEditingUser({...editingUser, businessActivity: val})}>
                      <SelectTrigger className="bg-white" data-testid="select-edit-activity"><SelectValue placeholder="Seleccionar actividad" /></SelectTrigger>
                      <SelectContent>
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
                    <Label className="text-xs">Dirección</Label>
                    <Input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} placeholder="Calle y número" data-testid="input-edit-address" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Ciudad</Label>
                      <Input value={editingUser.city || ''} onChange={e => setEditingUser({...editingUser, city: e.target.value})} data-testid="input-edit-city" />
                    </div>
                    <div>
                      <Label className="text-xs">Código Postal</Label>
                      <Input value={editingUser.postalCode || ''} onChange={e => setEditingUser({...editingUser, postalCode: e.target.value})} data-testid="input-edit-postal" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Provincia</Label>
                      <Input value={editingUser.province || ''} onChange={e => setEditingUser({...editingUser, province: e.target.value})} data-testid="input-edit-province" />
                    </div>
                    <div>
                      <Label className="text-xs">País</Label>
                      <Input value={editingUser.country || ''} onChange={e => setEditingUser({...editingUser, country: e.target.value})} data-testid="input-edit-country" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Notas Internas (solo admin)</Label>
                    <Textarea value={editingUser.internalNotes || ''} onChange={e => setEditingUser({...editingUser, internalNotes: e.target.value})} rows={2} data-testid="input-edit-notes" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                    <Button onClick={() => editingUser.id && updateUserMutation.mutate({ id: editingUser.id, ...editingUser })} disabled={updateUserMutation.isPending} data-testid="button-save-user">
                      {updateUserMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, user: open ? deleteConfirm.user : null })}>
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-[90vw] bg-white rounded-lg shadow-2xl z-[100]">
              <DialogHeader><DialogTitle className="text-lg font-bold text-red-600">Eliminar Usuario</DialogTitle></DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm.user?.firstName} {deleteConfirm.user?.lastName}</strong>?</p>
                <p className="text-xs text-red-500 mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, user: null })}>Cancelar</Button>
                <Button variant="destructive" onClick={() => deleteConfirm.user?.id && deleteUserMutation.mutate(deleteConfirm.user.id)} disabled={deleteUserMutation.isPending} data-testid="button-confirm-delete">
                  {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={docDialog.open} onOpenChange={(open) => setDocDialog({ open, user: open ? docDialog.user : null })}>
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[90vw] bg-white rounded-lg shadow-2xl z-[100]">
              <DialogHeader><DialogTitle className="text-lg font-bold">Solicitar Documentos</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Tipo de documento" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Pasaporte / Documento de Identidad</SelectItem>
                    <SelectItem value="address_proof">Prueba de Domicilio</SelectItem>
                    <SelectItem value="tax_id">Identificación Fiscal (NIF/CIF)</SelectItem>
                    <SelectItem value="other">Otro Documento</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea value={docMessage} onChange={e => setDocMessage(e.target.value)} placeholder="Mensaje para el cliente" rows={3} data-testid="input-doc-message" />
                <DialogFooter>
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
                        email: docDialog.user.email, 
                        title: `Solicitud de Documento: ${docLabel}`, 
                        message: docMessage || `Por favor, sube tu ${docLabel} a tu panel de cliente.`, 
                        type: 'action_required' 
                      });
                      setDocDialog({ open: false, user: null });
                      setDocType('');
                      setDocMessage('');
                    }
                  }} disabled={!docType || sendNoteMutation.isPending} data-testid="button-request-doc">
                    Solicitar
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={invoiceDialog.open} onOpenChange={(open) => setInvoiceDialog({ open, user: open ? invoiceDialog.user : null })}>
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[90vw] bg-white rounded-lg shadow-2xl z-[100]">
              <DialogHeader><DialogTitle className="text-lg font-bold">Crear Factura</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">Cliente: {invoiceDialog.user?.firstName} {invoiceDialog.user?.lastName}</p>
                <Input 
                  value={invoiceConcept} 
                  onChange={e => setInvoiceConcept(e.target.value)} 
                  placeholder="Concepto (ej: Servicio de consultoría)" 
                  data-testid="input-invoice-concept"
                />
                <Input 
                  type="number" 
                  value={invoiceAmount} 
                  onChange={e => setInvoiceAmount(e.target.value)} 
                  placeholder="Importe en euros" 
                  data-testid="input-invoice-amount"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInvoiceDialog({ open: false, user: null })}>Cancelar</Button>
                  <Button 
                    onClick={() => invoiceDialog.user?.id && createInvoiceMutation.mutate({ 
                      userId: invoiceDialog.user.id, 
                      concept: invoiceConcept, 
                      amount: Math.round(parseFloat(invoiceAmount) * 100) 
                    })} 
                    disabled={!invoiceConcept || !invoiceAmount || createInvoiceMutation.isPending}
                    data-testid="button-create-invoice"
                  >
                    {createInvoiceMutation.isPending ? 'Creando...' : 'Crear Factura'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Dialog open={deleteOwnAccountDialog} onOpenChange={setDeleteOwnAccountDialog}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-[90vw] bg-white rounded-lg shadow-2xl z-[100]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-red-600">Eliminar Mi Cuenta</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar tu cuenta permanentemente?</p>
            <p className="text-xs text-red-500 mt-2">Esta acción no se puede deshacer. Todos tus datos serán eliminados.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOwnAccountDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteOwnAccountMutation.mutate()} disabled={deleteOwnAccountMutation.isPending} data-testid="button-confirm-delete-account">
              {deleteOwnAccountMutation.isPending ? 'Eliminando...' : 'Eliminar Mi Cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDialog.open} onOpenChange={(open) => { if (!open) setUploadDialog({ open: false, file: null }); }}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[90vw] bg-white rounded-lg shadow-2xl z-[100]">
          <DialogHeader><DialogTitle className="text-lg font-bold">Subir Documento</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {uploadDialog.file && (
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <FileUp className="w-8 h-8 text-accent" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{uploadDialog.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(uploadDialog.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo de documento</Label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger className="w-full bg-white" data-testid="select-upload-doc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-[9999]" side="bottom" align="start" sideOffset={4}>
                  <SelectItem value="passport">Pasaporte / Documento de Identidad</SelectItem>
                  <SelectItem value="address_proof">Prueba de Domicilio</SelectItem>
                  <SelectItem value="tax_id">Identificación Fiscal (NIF/CIF)</SelectItem>
                  <SelectItem value="other">Otro Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {uploadDocType === "other" && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Descripción del documento</Label>
                <Textarea 
                  value={uploadNotes} 
                  onChange={(e) => setUploadNotes(e.target.value)} 
                  placeholder="Describe el tipo de documento que estás subiendo..."
                  className="min-h-[80px]"
                  data-testid="input-upload-notes"
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setUploadDialog({ open: false, file: null })}>Cancelar</Button>
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
              data-testid="button-confirm-upload"
            >
              Subir Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[95vw] bg-white rounded-2xl shadow-2xl z-[100]">
          <DialogHeader><DialogTitle className="text-lg font-bold">Crear Nuevo Cliente</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium">Nombre</Label>
                <Input value={newUserData.firstName} onChange={e => setNewUserData(p => ({ ...p, firstName: e.target.value }))} placeholder="Nombre" className="mt-1" data-testid="input-create-user-firstname" />
              </div>
              <div>
                <Label className="text-xs font-medium">Apellidos</Label>
                <Input value={newUserData.lastName} onChange={e => setNewUserData(p => ({ ...p, lastName: e.target.value }))} placeholder="Apellidos" className="mt-1" data-testid="input-create-user-lastname" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium">Email</Label>
              <Input type="email" value={newUserData.email} onChange={e => setNewUserData(p => ({ ...p, email: e.target.value }))} placeholder="email@ejemplo.com" className="mt-1" data-testid="input-create-user-email" />
            </div>
            <div>
              <Label className="text-xs font-medium">Teléfono</Label>
              <Input value={newUserData.phone} onChange={e => setNewUserData(p => ({ ...p, phone: e.target.value }))} placeholder="+34 600 000 000" className="mt-1" data-testid="input-create-user-phone" />
            </div>
            <div>
              <Label className="text-xs font-medium">Contraseña</Label>
              <Input type="password" value={newUserData.password} onChange={e => setNewUserData(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" className="mt-1" data-testid="input-create-user-password" />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setCreateUserDialog(false)} data-testid="button-cancel-create-user">Cancelar</Button>
            <Button onClick={() => createUserMutation.mutate(newUserData)} disabled={createUserMutation.isPending || !newUserData.email || !newUserData.password} data-testid="button-confirm-create-user">
              {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOrderDialog} onOpenChange={setCreateOrderDialog}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[95vw] bg-white rounded-2xl shadow-2xl z-[100]">
          <DialogHeader><DialogTitle className="text-lg font-bold">Crear Nuevo Pedido</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs font-medium">Cliente</Label>
              <Select value={newOrderData.userId} onValueChange={val => setNewOrderData(p => ({ ...p, userId: val }))}>
                <SelectTrigger className="w-full mt-1 bg-white" data-testid="select-order-user">
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent className="bg-white z-[9999]">
                  {adminUsers?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Estado (LLC)</Label>
              <Select value={newOrderData.state} onValueChange={val => setNewOrderData(p => ({ ...p, state: val }))}>
                <SelectTrigger className="w-full mt-1 bg-white" data-testid="select-order-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-[9999]">
                  <SelectItem value="New Mexico">New Mexico - 639€</SelectItem>
                  <SelectItem value="Wyoming">Wyoming - 799€</SelectItem>
                  <SelectItem value="Delaware">Delaware - 999€</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Importe (€)</Label>
              <Input type="number" value={newOrderData.amount} onChange={e => setNewOrderData(p => ({ ...p, amount: e.target.value }))} placeholder="639" className="mt-1" data-testid="input-order-amount" />
            </div>
          </div>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCreateOrderDialog(false)} className="w-full sm:w-auto" data-testid="button-cancel-create-order">Cancelar</Button>
            <Button onClick={() => createOrderMutation.mutate(newOrderData)} disabled={createOrderMutation.isPending || !newOrderData.userId || !newOrderData.amount} className="w-full sm:w-auto" data-testid="button-confirm-create-order">
              {createOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Pedido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
