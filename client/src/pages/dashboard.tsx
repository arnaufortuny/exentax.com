import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Building2, FileText, Clock, ChevronRight, User as UserIcon, Settings, Package, CreditCard, PlusCircle, Download, ExternalLink, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, Users, Power, Edit, Trash2, FileUp, Newspaper, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tab = 'services' | 'profile' | 'payments' | 'documents' | 'messages' | 'notifications' | 'admin';

// Admin-specific types for flexible user data handling
interface AdminUserData {
  id?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isAdmin?: boolean;
  accountStatus?: string;
  [key: string]: unknown;
}

function NewsletterToggle() {
  const { toast } = useToast();
  const { data: status, isLoading } = useQuery<{ isSubscribed: boolean }>({
    queryKey: ["/api/newsletter/status"],
  });

  const mutation = useMutation({
    mutationFn: async (subscribe: boolean) => {
      const endpoint = subscribe ? "/api/newsletter/subscribe" : "/api/newsletter/unsubscribe";
      // The subscribe endpoint expects { email }, unsubscribe uses auth
      const body = subscribe ? { email: undefined } : undefined; // server uses req.user.email if available
      await apiRequest("POST", endpoint, body);
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
  const [passwordData, setPasswordData] = useState({ current: '', newPassword: '', confirm: '' });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const { toast } = useToast();
  
  // Admin state
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [emailDialog, setEmailDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [docDialog, setDocDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [docType, setDocType] = useState("");
  const [docMessage, setDocMessage] = useState("");
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; user: AdminUserData | null }>({ open: false, user: null });
  const [noteTitle, setNoteTitle] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [noteType, setNoteType] = useState("info");
  const [adminSubTab, setAdminSubTab] = useState("orders");

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
      await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({ title: "Perfil actualizado" });
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
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
  });

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");

  const selectedOrderId = orders?.[0]?.id;
  const { data: selectedOrderEvents } = useQuery<any[]>({
    queryKey: ["/api/orders", selectedOrderId, "events"],
    enabled: !!selectedOrderId,
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
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/user/change-password", { 
        currentPassword: passwordData.current, 
        newPassword: passwordData.newPassword 
      });
    },
    onSuccess: () => {
      setPasswordData({ current: '', newPassword: '', confirm: '' });
      setShowPasswordChange(false);
      toast({ title: "Contraseña cambiada", description: "Tu nueva contraseña está activa." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo cambiar la contraseña", variant: "destructive" });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/user/account");
    },
    onSuccess: () => {
      setLocation("/");
    }
  });

  const markNotificationRead = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/user/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
    }
  });

  const { data: adminStats } = useQuery<{ totalSales: number }>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const totalSales = adminStats?.totalSales ? (adminStats.totalSales / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '0,00 €';

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

  const { data: adminNewsletter } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletter"],
    enabled: !!user?.isAdmin,
  });

  const { data: adminMessages } = useQuery<any[]>({
    queryKey: ["/api/admin/messages"],
    enabled: !!user?.isAdmin,
  });

  // Admin mutations
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

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/admin/users"], (old: any[] | undefined) => {
        if (!old) return [updatedUser];
        return old.map(u => u.id === updatedUser.id ? updatedUser : u);
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario actualizado" });
      setEditingUser(null);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario eliminado", variant: "destructive" });
    }
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/newsletter/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter"] });
      toast({ title: "Suscriptor eliminado" });
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

  const requestDocMutation = useMutation({
    mutationFn: async ({ email, documentType, message }: { email: string, documentType: string, message: string }) => {
      await apiRequest("POST", "/api/admin/request-document", { email, documentType, message });
    },
    onSuccess: () => {
      toast({ title: "Solicitud enviada" });
      setDocDialog({ open: false, user: null });
      setDocType("");
      setDocMessage("");
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
      setNoteType("info");
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/admin/messages/${id}/status`, { status: 'archived' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      toast({ title: "Mensaje archivado" });
    }
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { id: 'services', label: 'Mis Servicios', icon: Package, mobileLabel: 'Servicios' },
    { id: 'notifications', label: 'Notificaciones', icon: BellRing, mobileLabel: 'Alertas' },
    { id: 'messages', label: 'Mensajes', icon: Mail, mobileLabel: 'Msgs' },
    { id: 'documents', label: 'Documentos', icon: FileText, mobileLabel: 'Docs' },
    { id: 'payments', label: 'Pagos y Facturas', icon: CreditCard, mobileLabel: 'Pagos' },
    { id: 'profile', label: 'Mi Perfil', icon: UserIcon, mobileLabel: 'Perfil' },
    ...(user?.isAdmin ? [
      { id: 'admin', label: 'Administración', icon: Shield, mobileLabel: 'Admin' },
      { id: 'logs', label: 'Logs Sistema', icon: FileText, mobileLabel: 'Logs' }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] font-sans">
      <Navbar />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-8 md:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <p className="text-accent font-black  tracking-widest text-[10px] md:text-sm mb-1 md:mb-2">Área de Clientes</p>
              <h1 className="text-3xl md:text-5xl font-black text-primary  tracking-tighter leading-tight md:leading-none">
                {user?.firstName ? `Hola, ${user.firstName}` : 'Mi Panel'}
              </h1>
            </div>
            <Link href="/servicios#pricing">
              <Button className="w-full md:w-auto bg-accent text-primary font-black rounded-full px-6 md:px-8 py-5 md:py-6 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-sm md:text-base">
                <PlusCircle className="w-5 h-5" /> Nueva LLC
              </Button>
            </Link>
          </motion.div>
        </header>

        {/* Mobile & Desktop Navigation Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "outline"}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex items-center gap-2 rounded-full font-black text-xs md:text-sm tracking-tight whitespace-nowrap shrink-0 ${
                activeTab === item.id 
                ? 'bg-accent text-primary shadow-lg shadow-accent/20' 
                : 'bg-white text-muted-foreground border-0'
              }`}
              data-testid={`button-tab-${item.id}`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.mobileLabel}</span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <Card className="rounded-3xl border-0 shadow-sm p-6 bg-white">
                      <p className="text-[10px] font-black  tracking-widest text-muted-foreground mb-1">Actividad de Cuenta</p>
                      <h4 className="text-2xl font-black text-primary">{orders?.length || 0}</h4>
                      <p className="text-xs text-muted-foreground font-medium">Servicios totales contratados</p>
                    </Card>
                          <Card className="rounded-3xl border-0 shadow-sm p-6 bg-white">
                            <p className="text-[10px] font-black tracking-widest text-muted-foreground mb-1">Ventas Totales</p>
                            <h4 className="text-2xl font-black text-primary">{totalSales}</h4>
                            <p className="text-xs text-muted-foreground font-medium">Facturación real (completados)</p>
                          </Card>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-black text-primary  tracking-tight mb-6">Tus Servicios Activos</h2>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-[1.5rem] md:rounded-[2rem] animate-pulse" />)}
                    </div>
                  ) : orders && Array.isArray(orders) && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <Card key={order.id} className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 md:gap-6 w-full">
                              <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-primary transition-colors">
                                <Building2 className="w-6 h-6 md:w-7 md:h-7" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg md:text-xl font-black text-primary  tracking-tight truncate">{order.product?.name || "Constitución LLC"}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">Pedido #{order.application?.requestCode || order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black  tracking-widest whitespace-nowrap ${
                                order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.status === 'completed' ? 'Completado' : 
                                 order.status === 'cancelled' ? 'Cancelado' : 
                                 order.status === 'processing' ? 'En proceso' :
                                 order.status === 'documents_ready' ? 'Docs listos' :
                                 'Pendiente'}
                              </span>
                              <div className="flex gap-1 md:gap-2">
                                {order.isInvoiceGenerated && (
                                  <Button 
                                    variant="ghost" 
                                    className="rounded-full w-9 h-9 md:w-11 md:h-11 p-0 bg-gray-50 shrink-0"
                                    title="Ver Factura PDF"
                                    onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}
                                    data-testid={`button-invoice-${order.id}`}
                                  >
                                    <FileText className="w-4 h-4 md:w-5 md:h-5" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  className="rounded-full w-9 h-9 md:w-11 md:h-11 p-0 bg-gray-50 shrink-0"
                                  title="Ver Recibo PDF"
                                  onClick={() => window.open(`/api/orders/${order.id}/receipt`, '_blank')}
                                  data-testid={`button-receipt-${order.id}`}
                                >
                                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  className="rounded-full w-9 h-9 md:w-11 md:h-11 p-0 bg-gray-50 shrink-0"
                                  title="Editar Datos"
                                  onClick={() => {
                                    const newData = prompt("¿Qué datos deseas modificar? (Nombre de empresa, actividad, etc.)");
                                    if (newData) {
                                      apiRequest("PATCH", `/api/llc/${order.application?.id}/data`, { notes: newData })
                                        .then(() => {
                                          toast({ title: "Solicitud enviada", description: "Tus cambios han sido registrados y serán revisados." });
                                          queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
                                        });
                                    }
                                  }}
                                >
                                  <Settings className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-16 rounded-[3rem] text-center shadow-sm">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-black text-primary  mb-3">No tienes servicios aún</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">Emprende hoy mismo y constituye tu empresa en Estados Unidos con Easy US LLC.</p>
                      <Link href="/servicios#pricing">
                        <Button className="bg-accent text-primary font-black rounded-full px-10 py-7 text-lg shadow-xl shadow-accent/20">
                          Empezar ahora
                        </Button>
                      </Link>
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
                          className={`rounded-2xl border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${!notif.isRead ? 'bg-accent/5 border-l-4 border-l-accent' : ''}`}
                          onClick={() => markNotificationRead.mutate(notif.id)}
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
                                  {!notif.isRead && (
                                    <span className="w-2 h-2 bg-accent rounded-full" />
                                  )}
                                </div>
                                <h3 className="font-black text-sm md:text-base">{notif.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                              </div>
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
                      <Button className="bg-accent text-primary font-black rounded-full text-xs" data-testid="button-new-query">Nueva Consulta</Button>
                    </Link>
                  </div>
                  
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[1,2].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messagesData?.map((msg) => (
                        <Card 
                          key={msg.id} 
                          className="rounded-2xl border-0 shadow-sm p-6 bg-white hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                          data-testid={`card-message-${msg.id}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-accent" />
                              <h4 className="font-black text-primary">{msg.subject || 'Sin asunto'}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">MSG-{msg.id}</span>
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                msg.status === 'unread' ? 'bg-accent text-primary' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {msg.status === 'unread' ? 'Pendiente' : msg.status === 'read' ? 'Leído' : 'Archivado'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{msg.content}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            {new Date(msg.createdAt).toLocaleString('es-ES')}
                          </p>
                          
                          {selectedMessage?.id === msg.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                              <div className="flex gap-2">
                                <Textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Escribe tu respuesta..."
                                  className="flex-1 rounded-xl min-h-[80px] text-sm"
                                />
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendReplyMutation.mutate(msg.id);
                                }}
                                disabled={!replyContent.trim() || sendReplyMutation.isPending}
                                className="bg-accent text-primary font-black rounded-full px-6"
                                data-testid="button-send-reply"
                              >
                                <Send className="w-4 h-4 mr-2" /> Enviar Respuesta
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                      {(!messagesData || messagesData.length === 0) && (
                        <div className="text-center py-12 bg-white rounded-3xl">
                          <Mail className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                          <p className="text-muted-foreground font-black">No tienes mensajes pendientes.</p>
                          <Link href="/contacto">
                            <Button className="mt-4 bg-accent text-primary font-black rounded-full">
                              Enviar primera consulta
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm">
                    <CardHeader className="p-6 md:p-8">
                      <CardTitle className="text-xl md:text-2xl font-black text-primary  tracking-tight">Información Personal</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Gestiona tus datos de contacto y preferencias.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-0 space-y-6">
                      {/* Client ID and Account Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                          <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">ID de Cliente</p>
                          <p className="text-lg font-black text-primary font-mono">{user?.id?.slice(0, 8).toUpperCase() || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                          <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Estado de Cuenta</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              user?.accountStatus === 'active' ? 'bg-green-500' :
                              user?.accountStatus === 'vip' ? 'bg-accent' :
                              user?.accountStatus === 'pending' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            <p className="text-lg font-black text-primary capitalize">
                              {user?.accountStatus === 'active' ? 'Activa' :
                               user?.accountStatus === 'vip' ? 'VIP' :
                               user?.accountStatus === 'pending' ? 'Pendiente' :
                               user?.accountStatus === 'suspended' ? 'Suspendida' : 'Activa'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Nombre</label>
                          {isEditing ? (
                            <Input 
                              value={profileData.firstName} 
                              onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="rounded-full h-14 px-6"
                              data-testid="input-firstname"
                            />
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">{user?.firstName || 'No disponible'}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Apellido</label>
                          {isEditing ? (
                            <Input 
                              value={profileData.lastName} 
                              onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="rounded-full h-14 px-6"
                              data-testid="input-lastname"
                            />
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">{user?.lastName || 'No disponible'}</div>
                          )}
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Email</label>
                          <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base flex items-center justify-between">
                            <span>{user?.email || 'No disponible'}</span>
                            {user?.emailVerified ? (
                              <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verificado
                              </span>
                            ) : (
                              <span className="text-[10px] bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-black flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> No verificado
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Teléfono</label>
                          {isEditing ? (
                            <Input 
                              value={profileData.phone} 
                              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                              className="rounded-full h-14 px-6"
                              placeholder="+34 612 345 678"
                              data-testid="input-phone"
                            />
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">
                              {user?.phone || 'No proporcionado'}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Tipo de Documento</label>
                          {isEditing ? (
                            <select
                              value={profileData.idType}
                              onChange={(e) => setProfileData(prev => ({ ...prev, idType: e.target.value }))}
                              className="w-full rounded-full h-14 px-6 bg-white border border-gray-200 font-black text-sm"
                              data-testid="select-id-type"
                            >
                              <option value="">Seleccionar...</option>
                              <option value="dni">DNI</option>
                              <option value="nie">NIE</option>
                              <option value="passport">Pasaporte</option>
                            </select>
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">
                              {user?.idType === 'dni' ? 'DNI' : user?.idType === 'nie' ? 'NIE' : user?.idType === 'passport' ? 'Pasaporte' : 'No proporcionado'}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Número de Documento</label>
                          {isEditing ? (
                            <Input 
                              value={profileData.idNumber} 
                              onChange={(e) => setProfileData(prev => ({ ...prev, idNumber: e.target.value }))}
                              className="rounded-full h-14 px-6"
                              placeholder="12345678A"
                              data-testid="input-id-number"
                            />
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">
                              {user?.idNumber || 'No proporcionado'}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Fecha de Nacimiento</label>
                          {isEditing ? (
                            <Input 
                              type="date"
                              value={profileData.birthDate} 
                              onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                              className="rounded-full h-14 px-6"
                              data-testid="input-birth-date"
                            />
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">
                              {user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'No proporcionada'}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Actividad del Negocio</label>
                          {isEditing ? (
                            <Textarea 
                              value={profileData.businessActivity} 
                              onChange={(e) => setProfileData(prev => ({ ...prev, businessActivity: e.target.value }))}
                              className="rounded-2xl min-h-[100px] p-4"
                              placeholder="Describe la actividad principal de tu negocio..."
                              data-testid="input-business-activity"
                            />
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-2xl font-black text-sm md:text-base">{user?.businessActivity || 'No proporcionada'}</div>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-black tracking-tight text-primary mb-4">Dirección Completa</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Dirección</label>
                            {isEditing ? (
                              <Input 
                                value={profileData.address} 
                                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                className="rounded-full h-14 px-6"
                                placeholder="Calle, número, piso..."
                                data-testid="input-address"
                              />
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">{user?.address || 'No proporcionada'}</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Ciudad</label>
                            {isEditing ? (
                              <Input 
                                value={profileData.city} 
                                onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                                className="rounded-full h-14 px-6"
                                placeholder="Madrid"
                                data-testid="input-city"
                              />
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">{user?.city || 'No proporcionada'}</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Provincia</label>
                            {isEditing ? (
                              <Input 
                                value={profileData.province} 
                                onChange={(e) => setProfileData(prev => ({ ...prev, province: e.target.value }))}
                                className="rounded-full h-14 px-6"
                                placeholder="Madrid"
                                data-testid="input-province"
                              />
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">{user?.province || 'No proporcionada'}</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">Código Postal</label>
                            {isEditing ? (
                              <Input 
                                value={profileData.postalCode} 
                                onChange={(e) => setProfileData(prev => ({ ...prev, postalCode: e.target.value }))}
                                className="rounded-full h-14 px-6"
                                placeholder="28001"
                                data-testid="input-postal-code"
                              />
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">{user?.postalCode || 'No proporcionado'}</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-black tracking-widest text-muted-foreground uppercase">País</label>
                            {isEditing ? (
                              <Input 
                                value={profileData.country} 
                                onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                                className="rounded-full h-14 px-6"
                                placeholder="España"
                                data-testid="input-country"
                              />
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-full font-black text-sm md:text-base">{user?.country || 'No proporcionado'}</div>
                            )}
                          </div>
                        </div>
                      </div>
                          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            {isEditing ? (
                              <>
                                <Button 
                                  onClick={() => updateProfile.mutate(profileData)}
                                  disabled={updateProfile.isPending}
                                  className="bg-accent text-primary font-black rounded-full px-8 py-6 text-sm"
                                >
                                  Guardar Cambios
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsEditing(false)}
                                  className="rounded-full font-black border-2 py-6 text-sm"
                                >
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <Button 
                                onClick={() => setIsEditing(true)}
                                className="bg-accent text-primary font-black rounded-full px-8 py-6 text-sm"
                              >
                                Editar Perfil
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              className="rounded-full font-black border-2 py-6 text-sm" 
                              onClick={() => setShowPasswordChange(!showPasswordChange)}
                            >
                              {showPasswordChange ? 'Cancelar' : 'Cambiar Contraseña'}
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="rounded-full font-black py-6 text-sm"
                              onClick={() => {
                                if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")) {
                                  deleteAccountMutation.mutate();
                                }
                              }}
                            >
                              Eliminar Cuenta
                            </Button>
                          </div>

                          {showPasswordChange && (
                            <div className="p-6 bg-gray-50 rounded-2xl space-y-4 mt-4">
                              <h4 className="font-black text-sm">Cambiar Contraseña</h4>
                              <div className="space-y-3">
                                <Input 
                                  type="password"
                                  placeholder="Contraseña actual"
                                  value={passwordData.current}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                                  className="rounded-full h-12 px-6"
                                  data-testid="input-current-password"
                                />
                                <Input 
                                  type="password"
                                  placeholder="Nueva contraseña"
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                  className="rounded-full h-12 px-6"
                                  data-testid="input-new-password"
                                />
                                <Input 
                                  type="password"
                                  placeholder="Confirmar nueva contraseña"
                                  value={passwordData.confirm}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                                  className="rounded-full h-12 px-6"
                                  data-testid="input-confirm-password"
                                />
                              </div>
                              <Button 
                                className="bg-accent text-primary font-black rounded-full w-full py-6"
                                onClick={() => {
                                  if (!passwordData.current) {
                                    toast({ title: "Error", description: "Ingresa tu contraseña actual", variant: "destructive" });
                                    return;
                                  }
                                  if (passwordData.newPassword !== passwordData.confirm) {
                                    toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
                                    return;
                                  }
                                  if (passwordData.newPassword.length < 8) {
                                    toast({ title: "Error", description: "La contraseña debe tener al menos 8 caracteres", variant: "destructive" });
                                    return;
                                  }
                                  changePasswordMutation.mutate();
                                }}
                                disabled={changePasswordMutation.isPending}
                              >
                                {changePasswordMutation.isPending ? 'Cambiando...' : 'Guardar Nueva Contraseña'}
                              </Button>
                            </div>
                          )}

                      <div className="pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-between gap-4 p-6 bg-accent/5 rounded-[2rem] border border-accent/10">
                          <div className="space-y-1">
                            <h4 className="text-sm font-black  tracking-tight text-primary flex items-center gap-2">
                              <BellRing className="w-4 h-4 text-accent" /> Suscripción Newsletter
                            </h4>
                            <p className="text-xs text-muted-foreground font-medium">Recibe noticias, actualizaciones fiscales y consejos para tu LLC.</p>
                          </div>
                          <NewsletterToggle />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <Card className="rounded-[1.5rem] md:rounded-[2.5rem] bg-accent text-primary border-0 shadow-xl overflow-hidden relative">
                    <div className="p-6 md:p-10 relative z-10">
                      <div className="flex justify-between items-start mb-8 md:mb-12">
                        <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-accent" />
                        <span className="text-[10px] font-black  tracking-[0.2em] opacity-60">Suscripción Activa</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black  tracking-tight mb-2">Métodos de Pago</h3>
                      <p className="text-sm md:text-base text-primary/60 font-medium mb-6 md:mb-8">Gestiona tus tarjetas, facturas y suscripciones a través de Stripe.</p>
                      <div className="flex flex-wrap gap-4">
                        <a href="https://billing.stripe.com/p/login/test_6oE5mG0Y0" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                          <Button className="w-full sm:w-auto bg-accent text-primary font-black rounded-full px-8 py-6 flex items-center justify-center gap-2 transition-colors">
                            Portal Stripe <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-60 h-60 md:w-80 md:h-80 bg-accent opacity-5 rounded-full" />
                  </Card>

                  <h3 className="text-xl md:text-2xl font-black text-primary  tracking-tight mt-10 md:mt-12 mb-6">Historial de Facturación</h3>
                  <div className="space-y-4">
                    {orders?.map((order: any) => (
                      <Card key={order.id} className="rounded-2xl md:rounded-3xl border-0 shadow-sm overflow-hidden group">
                        <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-colors">
                              <FileText className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                              <p className="font-black text-primary  text-xs md:text-sm">Factura INV-{order.id}</p>
                              <p className="text-[10px] md:text-xs text-muted-foreground font-black">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                            <p className="font-black text-primary text-sm md:text-base">{(order.amount / 100).toFixed(2)}€</p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full font-black border-2 h-8 px-3 text-[10px]"
                                onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}
                              >
                                Factura
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full font-black border-2 h-8 px-3 text-[10px]"
                                onClick={() => window.open(`/api/orders/${order.id}/receipt`, '_blank')}
                              >
                                Recibo
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl md:text-2xl font-black text-primary  tracking-tight mb-6">Centro de Documentación</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 flex flex-col items-center text-center group hover:bg-accent transition-all">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                        <FileText className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                      </div>
                      <h3 className="font-black text-primary  tracking-tight mb-2 text-sm md:text-base">Contrato de Servicio</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mb-6 font-medium">Tus términos aceptados y firmados con Easy US LLC.</p>
                      <Button 
                        variant="outline" 
                        className="rounded-full font-black border-2 w-full text-xs py-5"
                        onClick={() => window.open("/terminos_y_condiciones.pdf", "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" /> Descargar PDF
                      </Button>
                    </Card>
                    
                    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 flex flex-col items-center text-center opacity-50 bg-gray-50/50">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mb-4">
                        <Building2 className="w-7 h-7 md:w-8 md:h-8 text-gray-300" />
                      </div>
                      <h3 className="font-black text-primary  tracking-tight mb-2 text-sm md:text-base">Articles of Organization</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mb-6 font-medium">Disponible una vez que el estado procese tu LLC.</p>
                      <Button disabled variant="outline" className="rounded-full font-black border-2 w-full text-xs py-5">
                        Pendiente...
                      </Button>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'admin' && user?.isAdmin && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Panel de Administración</h2>
                  <p className="text-muted-foreground text-sm">Gestión de pedidos, clientes, newsletter y comunicaciones.</p>

                  {/* Admin Sub-tabs */}
                  <div className="flex flex-wrap gap-2 pb-4">
                    {[
                      { id: 'orders', label: 'Pedidos', icon: Clock },
                      { id: 'users', label: 'Clientes', icon: Users },
                      { id: 'newsletter', label: 'Newsletter', icon: Newspaper },
                      { id: 'inbox', label: 'Mensajes', icon: Mail },
                    ].map((tab) => (
                      <Button
                        key={tab.id}
                        variant={adminSubTab === tab.id ? "default" : "outline"}
                        onClick={() => setAdminSubTab(tab.id)}
                        className={`flex items-center gap-2 rounded-full text-xs font-black ${
                          adminSubTab === tab.id ? 'bg-accent text-primary' : 'bg-white border-0'
                        }`}
                        data-testid={`button-admin-tab-${tab.id}`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="rounded-2xl border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground">VENTAS TOTALES</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl md:text-2xl font-black text-primary">
                          {adminOrders?.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground">PENDIENTES</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl md:text-2xl font-black text-yellow-600">{adminOrders?.filter(o => o.status === 'pending').length || 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground">COMPLETADOS</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl md:text-2xl font-black text-green-600">{adminOrders?.filter(o => o.status === 'paid' || o.status === 'filed').length || 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground">SUSCRIPTORES</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl md:text-2xl font-black text-accent">{adminNewsletter?.length || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Orders Section */}
                  {adminSubTab === 'orders' && (
                    <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                      <CardHeader className="bg-white border-b border-gray-100 p-4">
                        <CardTitle className="text-lg font-black">Listado de Pedidos</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {adminOrders?.map((order) => (
                            <div key={order.id} className="p-4 hover:bg-gray-50/50">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="font-mono text-xs bg-gray-100">
                                      {order.application?.requestCode || `#${order.id}`}
                                    </Badge>
                                    <Badge className={`text-[10px] font-black ${
                                      order.status === 'paid' || order.status === 'filed' ? 'bg-green-100 text-green-700' : 
                                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {order.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="font-medium mt-1">{order.user?.firstName} {order.user?.lastName} - {order.user?.email}</p>
                                  <p className="text-sm text-muted-foreground">{order.product?.name} • <span className="font-black">{(order.amount / 100).toFixed(2)}€</span></p>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
                                  <Select value={order.status} onValueChange={(val) => updateStatusMutation.mutate({ id: order.id, status: val })}>
                                    <SelectTrigger className="w-24 md:w-28 h-7 md:h-8 rounded-full text-[10px] md:text-xs font-black">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pendiente</SelectItem>
                                      <SelectItem value="paid">Pagado</SelectItem>
                                      <SelectItem value="filed">Presentado</SelectItem>
                                      <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9" onClick={() => window.open(`/api/admin/invoice/${order.id}`, '_blank')} title="Ver Factura PDF">
                                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {!adminOrders?.length && (
                            <div className="p-8 text-center text-muted-foreground">No hay pedidos</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Users Section */}
                  {adminSubTab === 'users' && (
                    <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                      <CardHeader className="bg-white border-b border-gray-100 p-4">
                        <CardTitle className="text-lg font-black">Gestión de Clientes</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {adminUsers?.map((u) => (
                            <div key={u.id} className="p-4 hover:bg-gray-50/50">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-black">{u.firstName} {u.lastName}</span>
                                    <Badge className={`text-[10px] font-black ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                      {u.isAdmin ? 'Admin' : 'Cliente'}
                                    </Badge>
                                    {u.isActive === false && (
                                      <Badge className="text-[10px] font-black bg-red-100 text-red-700">Desactivado</Badge>
                                    )}
                                    {u.accountStatus && u.accountStatus !== 'active' && (
                                      <Badge className={`text-[10px] font-black ${
                                        u.accountStatus === 'vip' ? 'bg-accent/20 text-accent-foreground' :
                                        u.accountStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {u.accountStatus === 'vip' ? 'VIP' : u.accountStatus === 'pending' ? 'Pendiente' : 'Suspendida'}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{u.email} • {u.phone || 'Sin teléfono'}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{u.id}</p>
                                </div>
                                <div className="flex items-center gap-0.5 md:gap-1 flex-wrap justify-end">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9" title="Editar" onClick={() => setEditingUser({...u})}>
                                        <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Editar Usuario</DialogTitle>
                                      </DialogHeader>
                                      {editingUser && editingUser.id === u.id && (
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <Label>Nombre</Label>
                                              <Input value={editingUser.firstName || ''} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} />
                                            </div>
                                            <div>
                                              <Label>Apellido</Label>
                                              <Input value={editingUser.lastName || ''} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} />
                                            </div>
                                          </div>
                                          <div>
                                            <Label>Email</Label>
                                            <Input value={editingUser.email || ''} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
                                          </div>
                                          <div>
                                            <Label>Nueva Contraseña (Dejar en blanco para no cambiar)</Label>
                                            <Input type="password" placeholder="Nueva contraseña" onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} />
                                          </div>
                                          <div>
                                            <Label>Notas Internas (Solo Admin)</Label>
                                            <Textarea value={(editingUser as any).internalNotes || ''} onChange={(e) => setEditingUser({...editingUser, internalNotes: e.target.value})} className="h-20" />
                                          </div>
                                          <div>
                                            <Label>Teléfono</Label>
                                            <Input value={editingUser.phone || ''} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} />
                                          </div>
                                          <div>
                                            <Label>Estado de Cuenta</Label>
                                            <Select 
                                              value={editingUser.accountStatus || 'active'} 
                                              onValueChange={(val) => setEditingUser({...editingUser, accountStatus: val})}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="active">Activa</SelectItem>
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="vip">VIP</SelectItem>
                                                <SelectItem value="suspended">Suspendida</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <DialogFooter>
                                            <Button onClick={() => editingUser?.id && updateUserMutation.mutate({ id: editingUser.id, data: editingUser })} disabled={!editingUser?.id || updateUserMutation.isPending} className="bg-accent text-primary font-black">
                                              Guardar Cambios
                                            </Button>
                                          </DialogFooter>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9" title={u.isActive === false ? "Activar" : "Desactivar"} 
                                    onClick={() => updateUserMutation.mutate({ id: u.id, data: { isActive: u.isActive === false ? true : false } })}>
                                    <Power className={`w-3.5 h-3.5 md:w-4 md:h-4 ${u.isActive === false ? 'text-green-600' : 'text-yellow-600'}`} />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9" title="Enviar Email" onClick={() => setEmailDialog({ open: true, user: u })}>
                                    <Send className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9 hidden sm:flex" title="Solicitar Documento" onClick={() => setDocDialog({ open: true, user: u })}>
                                    <FileUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-600" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9 hidden sm:flex" title="Enviar Nota" onClick={() => setNoteDialog({ open: true, user: u })}>
                                    <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9 text-red-600" title="Eliminar" 
                                    onClick={() => confirm("¿Eliminar este usuario permanentemente?") && deleteUserMutation.mutate(u.id)}>
                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {!adminUsers?.length && (
                            <div className="p-8 text-center text-muted-foreground">No hay usuarios</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Newsletter Section */}
                  {adminSubTab === 'newsletter' && (
                    <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                      <CardHeader className="bg-white border-b border-gray-100 p-4 flex flex-row items-center justify-between gap-2">
                        <CardTitle className="text-lg font-black">Suscriptores Newsletter</CardTitle>
                        <Badge className="bg-accent text-primary font-black">{adminNewsletter?.length || 0} suscriptores</Badge>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {adminNewsletter?.map((sub) => (
                            <div key={sub.id} className="p-4 hover:bg-gray-50/50 flex items-center justify-between">
                              <div>
                                <p className="font-medium">{sub.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Suscrito: {new Date(sub.subscribedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9" title="Enviar Email" 
                                  onClick={() => setEmailDialog({ open: true, user: { email: sub.email } })}>
                                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                                </Button>
                                <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9 text-red-600" 
                                  onClick={() => confirm("¿Eliminar suscriptor?") && deleteSubscriberMutation.mutate(sub.id)}>
                                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {!adminNewsletter?.length && (
                            <div className="p-8 text-center text-muted-foreground">No hay suscriptores</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Messages Section */}
                  {adminSubTab === 'inbox' && (
                    <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                      <CardHeader className="bg-white border-b border-gray-100 p-4">
                        <CardTitle className="text-lg font-black">Bandeja de Entrada</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {adminMessages?.map((msg) => (
                            <div key={msg.id} className="p-4 hover:bg-gray-50/50">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="font-mono text-xs">MSG-{msg.id}</Badge>
                                    <Badge className={`text-[10px] font-black ${msg.status === 'unread' ? 'bg-accent text-primary' : 'bg-gray-100'}`}>
                                      {msg.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="font-medium mt-1">{msg.name || 'Cliente'} - {msg.email}</p>
                                  <p className="text-sm font-black">{msg.subject}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{msg.content}</p>
                                </div>
                                <div className="flex items-center gap-0.5 md:gap-1">
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9 text-green-600"
                                    onClick={() => apiRequest("PATCH", `/api/admin/messages/${msg.id}/status`, { status: 'read' }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] }))}>
                                    <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9" title="Responder" 
                                    onClick={() => setEmailDialog({ open: true, user: { email: msg.email } })}>
                                    <Send className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="w-8 h-8 md:w-9 md:h-9 text-red-600" onClick={() => deleteMessageMutation.mutate(msg.id)}>
                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {!adminMessages?.length && (
                            <div className="p-8 text-center text-muted-foreground">No hay mensajes</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
              {activeTab === 'logs' && user?.isAdmin && (
                <motion.div
                  key="logs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <Card className="rounded-3xl border-0 shadow-sm overflow-hidden bg-black text-green-400 p-6 font-mono text-xs h-[600px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 border-b border-green-900 pb-2">
                      <span className="font-black text-accent tracking-widest uppercase">System Activity Logs (Live)</span>
                      <Button variant="ghost" size="sm" onClick={() => setActivityLogs([])} className="text-green-400 hover:text-green-300">Limpiar</Button>
                    </div>
                    <div className="space-y-1">
                      {activityLogs.map((log, i) => (
                        <div key={i} className="border-l-2 border-green-900 pl-2 py-1 hover:bg-white/5 transition-colors">
                          <span className="text-green-600">[{new Date().toLocaleTimeString()}]</span> {log}
                        </div>
                      ))}
                      {activityLogs.length === 0 && <p className="text-green-800">Esperando actividad...</p>}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6 md:gap-8 order-1 lg:order-2">
            <section className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
              <h3 className="text-lg md:text-xl font-black  tracking-tight text-primary mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" /> Seguimiento del Pedido
              </h3>
              <div className="space-y-5 md:space-y-6">
                {orders && orders.length > 0 ? (
                  <>
                    {/* Dynamic events from order */}
                    {selectedOrderEvents && selectedOrderEvents.length > 0 ? (
                      selectedOrderEvents.map((event: any, idx: number) => (
                        <div key={event.id} className="flex gap-4 relative">
                          {idx < selectedOrderEvents.length - 1 && (
                            <div className="absolute left-3 top-6 w-0.5 h-8 md:h-10 bg-gray-100" />
                          )}
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 bg-accent text-primary">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-black tracking-tight text-primary truncate">
                              {event.eventType}
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">
                              {event.description}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">
                              {new Date(event.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Default timeline when no events yet
                      <>
                        {[
                          { title: "Pedido Recibido", status: orders[0]?.status !== 'pending' ? "completed" : "current", date: orders[0]?.createdAt ? new Date(orders[0].createdAt).toLocaleDateString('es-ES') : "Pendiente" },
                          { title: "Verificación de Datos", status: orders[0]?.application?.status === 'submitted' ? "completed" : "pending", date: orders[0]?.application?.status === 'submitted' ? "Completado" : "Pendiente" },
                          { title: "Presentación Estatal", status: orders[0]?.application?.status === 'filed' ? "completed" : "pending", date: "Pendiente" },
                          { title: "LLC Constituida", status: "pending", date: "Pendiente" },
                        ].map((step, idx) => (
                          <div key={idx} className="flex gap-4 relative">
                            {idx < 3 && <div className="absolute left-3 top-6 w-0.5 h-8 md:h-10 bg-gray-100" />}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                              step.status === 'completed' ? 'bg-accent text-primary' : 
                              step.status === 'current' ? 'bg-accent/50 text-primary animate-pulse' : 
                              'bg-gray-100 text-gray-400'
                            }`}>
                              {step.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : null}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs md:text-sm font-black tracking-tight ${step.status === 'pending' ? 'text-gray-400' : 'text-primary'} truncate`}>
                                {step.title}
                              </p>
                              <p className="text-[10px] md:text-xs font-black text-muted-foreground">{step.date}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No tienes pedidos activos</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-accent/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-accent/20">
              <h3 className="text-base md:text-lg font-black  tracking-tight text-primary mb-3 md:mb-4">¿Necesitas ayuda?</h3>
              <p className="text-xs md:text-sm text-primary/70 font-medium mb-5 md:mb-6 leading-relaxed">Nuestro equipo de expertos está listo para resolver tus dudas sobre la LLC.</p>
              <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-accent text-primary font-black rounded-full py-5 md:py-6 text-sm">
                  Contactar Soporte
                </Button>
              </a>
            </section>
          </div>
        </div>
      </main>

      {/* Admin Dialogs */}
      {user?.isAdmin && (
        <>
          {/* Send Email Dialog */}
          <Dialog open={emailDialog.open} onOpenChange={(open) => setEmailDialog({ open, user: open ? emailDialog.user : null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Email</DialogTitle>
                <DialogDescription>Enviar email a {emailDialog.user?.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Asunto</Label>
                  <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Asunto del email" />
                </div>
                <div>
                  <Label>Mensaje</Label>
                  <Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Escribe tu mensaje..." rows={5} />
                </div>
                <DialogFooter>
                  <Button onClick={() => emailDialog.user?.email && sendEmailMutation.mutate({ to: emailDialog.user.email, subject: emailSubject, message: emailMessage })}
                    disabled={!emailDialog.user?.email || !emailSubject || !emailMessage || sendEmailMutation.isPending}
                    className="bg-accent text-primary font-black">
                    {sendEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Enviar Email
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Request Document Dialog */}
          <Dialog open={docDialog.open} onOpenChange={(open) => setDocDialog({ open, user: open ? docDialog.user : null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Documento</DialogTitle>
                <DialogDescription>Solicitar documento a {docDialog.user?.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Documento</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI/Pasaporte">DNI/Pasaporte</SelectItem>
                      <SelectItem value="Comprobante de domicilio">Comprobante de domicilio</SelectItem>
                      <SelectItem value="Documento de identidad adicional">Documento adicional</SelectItem>
                      <SelectItem value="Formulario firmado">Formulario firmado</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mensaje adicional (opcional)</Label>
                  <Textarea value={docMessage} onChange={(e) => setDocMessage(e.target.value)} placeholder="Instrucciones adicionales..." rows={3} />
                </div>
                <DialogFooter>
                  <Button onClick={() => docDialog.user?.email && requestDocMutation.mutate({ email: docDialog.user.email, documentType: docType, message: docMessage })}
                    disabled={!docDialog.user?.email || !docType || requestDocMutation.isPending}
                    className="bg-accent text-primary font-black">
                    {requestDocMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                    Solicitar Documento
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Send Note Dialog */}
          <Dialog open={noteDialog.open} onOpenChange={(open) => setNoteDialog({ open, user: open ? noteDialog.user : null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Nota al Cliente</DialogTitle>
                <DialogDescription>Enviar nota a {noteDialog.user?.firstName} {noteDialog.user?.lastName} ({noteDialog.user?.email})</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Nota</Label>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Información</SelectItem>
                      <SelectItem value="action_required">Acción Requerida</SelectItem>
                      <SelectItem value="update">Actualización</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título</Label>
                  <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Título de la nota" />
                </div>
                <div>
                  <Label>Mensaje</Label>
                  <Textarea value={noteMessage} onChange={(e) => setNoteMessage(e.target.value)} placeholder="Escribe tu mensaje..." rows={4} />
                </div>
                <DialogFooter>
                  <Button onClick={() => noteDialog.user?.id && noteDialog.user?.email && sendNoteMutation.mutate({ userId: noteDialog.user.id, email: noteDialog.user.email, title: noteTitle, message: noteMessage, type: noteType })}
                    disabled={!noteDialog.user?.id || !noteDialog.user?.email || !noteTitle || !noteMessage || sendNoteMutation.isPending}
                    className="bg-accent text-primary font-black">
                    {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                    Enviar Nota
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Footer />
    </div>
  );
}
