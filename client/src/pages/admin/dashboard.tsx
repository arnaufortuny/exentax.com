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
import { Loader2, CheckCircle, XCircle, Clock, FileText, Mail, Download, User as UserIcon, Trash2, Key, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      window.location.href = "/";
    }
  }, [isAuthenticated, user, authLoading]);

  const { data: orders, isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Estado actualizado", description: "El pedido ha sido actualizado correctamente." });
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

  if (authLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <Navbar />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary  tracking-tighter">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión centralizada de pedidos, clientes y facturación.</p>
        </div>

        <Tabs defaultValue="orders" onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white p-1 rounded-full border border-gray-100 shadow-sm">
            <TabsTrigger value="orders" className="rounded-full px-8 py-2 data-[state=active]:bg-accent data-[state=active]:text-primary font-bold  text-xs">
              <Clock className="w-4 h-4 mr-2" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-full px-8 py-2 data-[state=active]:bg-accent data-[state=active]:text-primary font-bold  text-xs">
              <Users className="w-4 h-4 mr-2" /> Usuarios
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-full px-8 py-2 data-[state=active]:bg-accent data-[state=active]:text-primary font-bold  text-xs">
              <Mail className="w-4 h-4 mr-2" /> Mensajes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-8 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold  text-muted-foreground">Ventas Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">
                    {orders?.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold  text-muted-foreground">Pedidos Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">
                    {orders?.filter(o => o.status === 'pending').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold  text-muted-foreground">Clientes Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-accent">
                    {new Set(orders?.map(o => o.userId)).size}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 p-6">
                <CardTitle className="text-xl font-bold ">Listado de Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-100">
                      <TableHead className="font-bold  text-xs px-6">ID / Fecha</TableHead>
                      <TableHead className="font-bold  text-xs">Cliente</TableHead>
                      <TableHead className="font-bold  text-xs">Servicio</TableHead>
                      <TableHead className="font-bold  text-xs">Importe</TableHead>
                      <TableHead className="font-bold  text-xs">Estado</TableHead>
                      <TableHead className="font-bold  text-xs text-right px-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id} className="border-gray-50 hover:bg-gray-50/50">
                        <TableCell className="px-6">
                          <p className="font-bold">#{order.id}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold  text-[10px] tracking-widest bg-gray-50">
                            {order.product?.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          {(order.amount / 100).toFixed(2)}€
                        </TableCell>
                        <TableCell>
                          <Badge className={`font-bold  text-[10px] tracking-tighter ${
                            order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 space-x-2">
                          <Select 
                            value={order.status} 
                            onValueChange={(val) => updateStatusMutation.mutate({ id: order.id, status: val })}
                          >
                            <SelectTrigger className="w-[120px] h-8 rounded-full text-[10px] font-bold ">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="paid">Pagado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                              <SelectItem value="filed">Presentado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Ver Factura" onClick={() => window.open(`/api/admin/invoice/${order.id}`, '_blank')}>
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Ver Recibo" onClick={() => window.open(`/api/orders/${order.id}/receipt`, '_blank')}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-8 mt-0">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold  text-primary">Gestión de Usuarios</h2>
              <Button className="bg-accent text-primary font-bold rounded-full px-6" onClick={() => toast({ title: "Próximamente", description: "La creación de usuarios estará disponible pronto." })}>
                Crear Usuario
              </Button>
            </div>

            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-100">
                      <TableHead className="font-bold  text-xs px-6">ID / Nombre</TableHead>
                      <TableHead className="font-bold  text-xs">Email</TableHead>
                      <TableHead className="font-bold  text-xs">Teléfono</TableHead>
                      <TableHead className="font-bold  text-xs">Rol</TableHead>
                      <TableHead className="font-bold  text-xs text-right px-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id} className="border-gray-50 hover:bg-gray-50/50">
                        <TableCell className="px-6">
                          <p className="font-bold">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{u.id}</p>
                        </TableCell>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell className="text-sm font-medium">{u.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={`font-bold  text-[10px] ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                            {u.isAdmin ? 'Admin' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 space-x-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Cambiar Contraseña" onClick={() => window.open("/api/login?prompt=login", "_blank")}>
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" title="Eliminar Usuario" onClick={() => confirm("¿Seguro que quieres eliminar este usuario?") && deleteUserMutation.mutate(u.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
