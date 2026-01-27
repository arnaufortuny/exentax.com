import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Clock, FileText, Mail, Download, User as UserIcon, Trash2, Key, Users, Send, FileUp, Edit, Power, Newspaper, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("orders");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [emailDialog, setEmailDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [docDialog, setDocDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [docType, setDocType] = useState("");
  const [docMessage, setDocMessage] = useState("");
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [noteTitle, setNoteTitle] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [noteType, setNoteType] = useState("info");

  const { data: orders, isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: newsletter } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletter"],
    enabled: !!user?.isAdmin,
  });

  const { data: messages } = useQuery<any[]>({
    queryKey: ["/api/admin/messages"],
    enabled: !!user?.isAdmin,
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

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black">Acceso Administrador</CardTitle>
              <CardDescription>Inicia sesión con una cuenta de administrador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login">
                <Button className="w-full bg-accent text-primary font-black">
                  Iniciar Sesión
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <Navbar />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-primary tracking-tighter">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión de pedidos, clientes, newsletter y comunicaciones.</p>
        </div>

        <Tabs defaultValue="orders" onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white p-1 rounded-full border border-gray-100 shadow-sm flex-wrap w-full justify-center gap-1">
            <TabsTrigger value="orders" className="rounded-full px-3 sm:px-6 py-2 data-[state=active]:bg-accent data-[state=active]:text-primary font-black text-xs">
              <Clock className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-full px-3 sm:px-6 py-2 data-[state=active]:bg-accent data-[state=active]:text-primary font-black text-xs">
              <Users className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="rounded-full px-3 sm:px-6 py-2 data-[state=active]:bg-accent data-[state=active]:text-primary font-black text-xs">
              <Newspaper className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Newsletter</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-full px-3 sm:px-6 py-2 data-[state=active]:bg-accent data-[state=active]:text-primary font-black text-xs">
              <Mail className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Mensajes</span>
            </TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-8 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black text-muted-foreground">VENTAS TOTALES</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-primary">
                    {orders?.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black text-muted-foreground">PENDIENTES</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-yellow-600">{orders?.filter(o => o.status === 'pending').length || 0}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black text-muted-foreground">COMPLETADOS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-green-600">{orders?.filter(o => o.status === 'paid' || o.status === 'filed').length || 0}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black text-muted-foreground">SUSCRIPTORES</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-accent">{newsletter?.length || 0}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 p-4">
                <CardTitle className="text-lg font-black">Listado de Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {orders?.map((order) => (
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
                        <div className="flex items-center gap-2">
                          <Select value={order.status} onValueChange={(val) => updateStatusMutation.mutate({ id: order.id, status: val })}>
                            <SelectTrigger className="w-28 h-8 rounded-full text-xs font-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="paid">Pagado</SelectItem>
                              <SelectItem value="filed">Presentado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" onClick={() => window.open(`/api/admin/invoice/${order.id}`, '_blank')} title="Factura">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!orders?.length && (
                    <div className="p-8 text-center text-muted-foreground">No hay pedidos</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-8 mt-0">
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 p-4">
                <CardTitle className="text-lg font-black">Gestión de Clientes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {users?.map((u) => (
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
                        <div className="flex items-center gap-1 flex-wrap">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="icon" variant="ghost" title="Editar" onClick={() => setEditingUser({...u})}>
                                <Edit className="w-4 h-4" />
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
                                    <Button onClick={() => updateUserMutation.mutate({ id: editingUser.id, data: editingUser })} className="bg-accent text-primary font-black">
                                      Guardar Cambios
                                    </Button>
                                  </DialogFooter>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button size="icon" variant="ghost" title={u.isActive === false ? "Activar" : "Desactivar"} 
                            onClick={() => updateUserMutation.mutate({ id: u.id, data: { isActive: u.isActive === false ? true : false } })}>
                            <Power className={`w-4 h-4 ${u.isActive === false ? 'text-green-600' : 'text-yellow-600'}`} />
                          </Button>
                          <Button size="icon" variant="ghost" title="Enviar Email" onClick={() => setEmailDialog({ open: true, user: u })}>
                            <Send className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Solicitar Documento" onClick={() => setDocDialog({ open: true, user: u })}>
                            <FileUp className="w-4 h-4 text-orange-600" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Enviar Nota" onClick={() => setNoteDialog({ open: true, user: u })}>
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-600" title="Eliminar" 
                            onClick={() => confirm("¿Eliminar este usuario permanentemente?") && deleteUserMutation.mutate(u.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!users?.length && (
                    <div className="p-8 text-center text-muted-foreground">No hay usuarios</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEWSLETTER TAB */}
          <TabsContent value="newsletter" className="space-y-8 mt-0">
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black">Suscriptores Newsletter</CardTitle>
                <Badge className="bg-accent text-primary font-black">{newsletter?.length || 0} suscriptores</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {newsletter?.map((sub) => (
                    <div key={sub.id} className="p-4 hover:bg-gray-50/50 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sub.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Suscrito: {new Date(sub.subscribedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" title="Enviar Email" 
                          onClick={() => setEmailDialog({ open: true, user: { email: sub.email } })}>
                          <Send className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600" 
                          onClick={() => confirm("¿Eliminar suscriptor?") && deleteSubscriberMutation.mutate(sub.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!newsletter?.length && (
                    <div className="p-8 text-center text-muted-foreground">No hay suscriptores</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages" className="space-y-8 mt-0">
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 p-4">
                <CardTitle className="text-lg font-black">Bandeja de Entrada</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {messages?.map((msg) => (
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
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="text-green-600"
                            onClick={() => apiRequest("PATCH", `/api/admin/messages/${msg.id}/status`, { status: 'read' }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] }))}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Responder" 
                            onClick={() => setEmailDialog({ open: true, user: { email: msg.email } })}>
                            <Send className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-600" onClick={() => deleteMessageMutation.mutate(msg.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!messages?.length && (
                    <div className="p-8 text-center text-muted-foreground">No hay mensajes</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                <Button onClick={() => sendEmailMutation.mutate({ to: emailDialog.user?.email, subject: emailSubject, message: emailMessage })}
                  disabled={!emailSubject || !emailMessage || sendEmailMutation.isPending}
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
                <Button onClick={() => requestDocMutation.mutate({ email: docDialog.user?.email, documentType: docType, message: docMessage })}
                  disabled={!docType || requestDocMutation.isPending}
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
                <Button onClick={() => sendNoteMutation.mutate({ userId: noteDialog.user?.id, email: noteDialog.user?.email, title: noteTitle, message: noteMessage, type: noteType })}
                  disabled={!noteTitle || !noteMessage || sendNoteMutation.isPending}
                  className="bg-accent text-primary font-black">
                  {sendNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                  Enviar Nota
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
