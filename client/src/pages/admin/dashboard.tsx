import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, FileText, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      window.location.href = "/";
    }
  }, [isAuthenticated, user, authLoading]);

  const { data: orders, isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Estado actualizado", description: "El pedido ha sido actualizado correctamente." });
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
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión centralizada de pedidos, clientes y facturación.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Ventas Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-primary">
                {orders?.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Pedidos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-yellow-600">
                {orders?.filter(o => o.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Clientes Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-accent">
                {new Set(orders?.map(o => o.userId)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 p-6">
            <CardTitle className="text-xl font-black uppercase">Listado de Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="font-bold uppercase text-xs px-6">ID / Fecha</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Cliente</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Servicio</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Importe</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Estado</TableHead>
                  <TableHead className="font-bold uppercase text-xs text-right px-6">Acciones</TableHead>
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
                      <Badge variant="outline" className="font-bold uppercase text-[10px] tracking-widest bg-gray-50">
                        {order.product?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      {(order.amount / 100).toFixed(2)}€
                    </TableCell>
                    <TableCell>
                      <Badge className={`font-black uppercase text-[10px] tracking-tighter ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(`/api/admin/invoice/${order.id}`, '_blank')}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-green-600"
                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'paid' })}
                        disabled={order.status === 'paid'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
