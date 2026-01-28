import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Building2, FileText, Clock, ChevronRight, User as UserIcon, Settings, Package, CreditCard, PlusCircle, Download, ExternalLink, Mail, BellRing, CheckCircle2, AlertCircle, MessageSquare, Send, Shield, Users, Power, Edit, Trash2, FileUp, Newspaper, Loader2, CheckCircle, Receipt } from "lucide-react";
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

type Tab = 'services' | 'profile' | 'payments' | 'documents' | 'messages' | 'notifications' | 'admin' | 'logs';

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
  const [passwordData, setPasswordData] = useState({ current: '', newPassword: '', confirm: '' });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const { toast } = useToast();
  const [activityLogs, setActivityLogs] = useState<string[]>([]);
  
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
      if (user?.accountStatus === 'pending') {
        throw new Error("Tu cuenta está en revisión. No puedes modificar tus datos en este momento.");
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
    refetchInterval: 15000,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");

  const selectedOrderId = orders?.[0]?.id;
  const { data: selectedOrderEvents } = useQuery<any[]>({
    queryKey: ["/api/orders", selectedOrderId, "events"],
    enabled: !!selectedOrderId,
    refetchInterval: 15000,
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
    refetchInterval: 15000,
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
      setNoteType("info");
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
    { id: 'services', label: 'Servicios', icon: Package, mobileLabel: 'Servicios' },
    { id: 'notifications', label: 'Alertas', icon: BellRing, mobileLabel: 'Alertas' },
    { id: 'messages', label: 'Mensajes', icon: Mail, mobileLabel: 'Msgs' },
    { id: 'documents', label: 'Docs', icon: FileText, mobileLabel: 'Docs' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, mobileLabel: 'Pagos' },
    { id: 'profile', label: 'Perfil', icon: UserIcon, mobileLabel: 'Perfil' },
    ...(user?.isAdmin ? [
      { id: 'admin', label: 'Admin', icon: Shield, mobileLabel: 'Admin' },
      { id: 'logs', label: 'Logs', icon: FileText, mobileLabel: 'Logs' }
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
              <p className="text-accent font-black tracking-widest text-[10px] md:text-sm mb-1 md:mb-2 uppercase">Área de Clientes</p>
              <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tighter leading-tight md:leading-none">
                Bienvenido a tu espacio personal, {user?.firstName || 'Cliente'}
              </h1>
              <p className="text-muted-foreground font-medium mt-2">
                Estás en tu área privada, ¡realiza tus gestiones en unos clics!
              </p>
            </div>
            <Link href="/servicios#pricing">
              <Button className="w-full md:w-auto bg-accent text-primary font-black rounded-full px-6 md:px-8 py-5 md:py-6 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-sm md:text-base">
                <PlusCircle className="w-5 h-5" /> Nueva LLC
              </Button>
            </Link>
          </motion.div>
        </header>

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
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">Mis Servicios</h2>
                      <p className="text-xs text-muted-foreground font-medium">Gestiona tus trámites activos en tiempo real</p>
                    </div>
                    <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                      <Clock className="w-3.5 h-3.5 text-accent animate-pulse" />
                      <span className="text-[10px] font-black text-accent uppercase tracking-wider">En vivo</span>
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {orders.map((order) => (
                        <Card key={order.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                          <CardHeader className="bg-primary/5 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Pedido ID: {order.application?.requestCode || order.invoiceNumber || order.id}</p>
                                <CardTitle className="text-lg font-black text-primary">{order.product?.name}</CardTitle>
                              </div>
                              <Badge className="bg-accent text-primary font-black uppercase text-[10px]">
                                {order.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                              {order.events?.slice(0, 3).map((event: any, i: number) => (
                                <div key={i} className="relative">
                                  <div className={`absolute -left-[1.35rem] top-1.5 w-3 h-3 rounded-full border-2 border-white ${i === 0 ? 'bg-accent animate-pulse' : 'bg-gray-300'}`} />
                                  <div className="flex justify-between items-center">
                                    <p className={`text-xs font-black ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{event.eventType}</p>
                                    <span className="text-[9px] text-muted-foreground">{new Date(event.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground line-clamp-1">{event.description}</p>
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
                                  <span className="text-[10px] text-muted-foreground font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-black text-sm md:text-base">{notif.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
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
                      <Button className="bg-accent text-primary font-black rounded-full text-xs">Nueva Consulta</Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {messagesData?.map((msg) => (
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
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div key="documents" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight mb-6">Centro de Documentación</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 flex flex-col items-center text-center bg-white">
                      <FileText className="w-12 h-12 text-primary mb-4" />
                      <h3 className="font-black text-primary mb-2 text-sm md:text-base">Contrato de Servicio</h3>
                      <Button variant="outline" className="rounded-full font-black border-2 w-full text-xs py-5" onClick={() => window.print()}>
                        <Download className="w-4 h-4 mr-2" /> Imprimir / PDF
                      </Button>
                    </Card>
                    {userDocuments?.map((doc: any) => (
                      <Card key={doc.id} className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 flex flex-col items-center text-center bg-white">
                        <FileUp className="w-12 h-12 text-accent mb-4" />
                        <h3 className="font-black text-primary mb-2 text-sm md:text-base">{doc.fileName}</h3>
                        <Button variant="outline" className="rounded-full font-black border-2 w-full text-xs py-5" onClick={() => window.open(doc.fileUrl, "_blank")}>
                          <Download className="w-4 h-4 mr-2" /> DESCARGAR
                        </Button>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <Card className="rounded-[1.5rem] md:rounded-[2.5rem] bg-accent text-primary border-0 shadow-xl overflow-hidden relative">
                    <div className="p-6 md:p-10 relative z-10">
                      <CreditCard className="w-12 h-12 text-accent mb-4" />
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Métodos de Pago</h3>
                      <p className="text-sm text-primary/60 mb-6">Gestiona tus tarjetas y facturas en Stripe.</p>
                      <a href="https://billing.stripe.com/p/login/test_6oE5mG0Y0" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-accent text-primary font-black rounded-full px-8 py-6 flex items-center justify-center gap-2">
                          Portal Stripe <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </Card>
                  <h3 className="text-xl font-black text-primary mt-10 mb-6">Historial</h3>
                  <div className="space-y-4">
                    {orders?.map((order: any) => (
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
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <Card className="rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-sm p-6 md:p-8 bg-white">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black">Información Personal</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancelar' : 'Editar'}</Button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">ID Cliente</p>
                          <p className="text-lg font-black font-mono">{user?.id?.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Estado</p>
                          <p className="text-lg font-black">{user?.accountStatus}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Nombre</Label>
                          {isEditing ? <Input value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} /> : <div className="p-3 bg-gray-50 rounded-lg">{user?.firstName}</div>}
                        </div>
                        <div className="space-y-1">
                          <Label>Apellido</Label>
                          {isEditing ? <Input value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} /> : <div className="p-3 bg-gray-50 rounded-lg">{user?.lastName}</div>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                          <span>{user?.email}</span>
                          {user?.emailVerified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Teléfono</Label>
                        {isEditing ? <Input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} /> : <div className="p-3 bg-gray-50 rounded-lg">{user?.phone || 'No proporcionado'}</div>}
                      </div>
                      {isEditing && <Button onClick={() => updateProfile.mutate(profileData)} className="w-full bg-accent text-primary font-black rounded-full" disabled={updateProfile.isPending}>Guardar Cambios</Button>}
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
                  </Card>
                </motion.div>
              )}

              {activeTab === 'admin' && user?.isAdmin && (
                <motion.div key="admin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="flex gap-2 mb-6">
                    {['orders', 'users', 'newsletter', 'inbox'].map(tab => (
                      <Button key={tab} variant={adminSubTab === tab ? "default" : "outline"} onClick={() => setAdminSubTab(tab)} className="rounded-full text-xs font-black capitalize">{tab}</Button>
                    ))}
                  </div>
                  {adminSubTab === 'orders' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                      <div className="divide-y">
                        {adminOrders?.map(order => (
                          <div key={order.id} className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-black">ORD-{order.id} - {order.user?.firstName}</p>
                              <p className="text-xs text-muted-foreground">{order.product?.name} • {(order.amount / 100).toFixed(2)}€</p>
                            </div>
                            <Select value={order.status} onValueChange={val => updateStatusMutation.mutate({ id: order.id, status: val })}>
                              <SelectTrigger className="w-32 h-8 rounded-full text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="paid">Pagado</SelectItem>
                                <SelectItem value="filed">Presentado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {adminSubTab === 'users' && (
                    <Card className="rounded-2xl border-0 shadow-sm p-0 overflow-hidden">
                      <div className="divide-y">
                        {adminUsers?.map(u => (
                          <div key={u.id} className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-black">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => setEmailDialog({ open: true, user: u })}><Mail className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => setNoteDialog({ open: true, user: u })}><MessageSquare className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}

              {activeTab === 'logs' && user?.isAdmin && (
                <motion.div key="logs" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <Card className="rounded-3xl bg-black text-green-400 p-6 font-mono text-xs h-[500px] overflow-y-auto">
                    <div className="flex justify-between mb-4 border-b border-green-900 pb-2">
                      <span className="font-black uppercase">System Activity Logs</span>
                      <Button variant="ghost" size="sm" onClick={() => setActivityLogs([])} className="text-green-400">Limpiar</Button>
                    </div>
                    {activityLogs.map((log, i) => <div key={i} className="py-1">[{new Date().toLocaleTimeString()}] {log}</div>)}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6 md:gap-8 order-1 lg:order-2">
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
        </>
      )}
      <Footer />
    </div>
  );
}
