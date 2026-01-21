import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-dark border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed': return 'bg-brand-lime text-brand-dark border-brand-lime/20';
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-brand-dark/10 text-brand-dark border-brand-dark/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'filed': return 'APROBADO';
      case 'submitted': return 'EN PROCESO';
      case 'rejected': return 'RECHAZADO';
      default: return 'BORRADOR';
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <Navbar />
      
      <main className="container max-w-5xl mx-auto py-12 px-4 flex-1">
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-brand-dark">Mis Solicitudes</h1>
            <p className="mt-2 text-muted-foreground">Gestiona tus LLCs y revisa su estado.</p>
          </div>
          <Button asChild className="bg-brand-lime text-brand-dark font-semibold border-0" data-testid="button-new-application">
            <Link href="/#pricing">Nueva Solicitud</Link>
          </Button>
        </div>

        {orders && orders.length > 0 ? (
          <div className="grid gap-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden border border-border/60 hover:border-primary/30 transition-all hover:shadow-md rounded-[2rem]">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="font-serif text-xl font-bold text-primary">
                              {order.application?.companyName 
                                ? `${order.application.companyName} ${order.application.designator || ''}` 
                                : "Solicitud sin nombre"}
                            </h3>
                            <Badge variant="outline" className={getStatusColor(order.application?.status || 'draft')}>
                              {getStatusText(order.application?.status || 'draft')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.product.name} | Orden #{order.id}
                          </p>
                          {order.application?.requestCode && (
                            <p className="text-sm font-mono font-semibold text-primary mt-2">
                              Código: {order.application.requestCode}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-wrap items-center gap-8">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Estado</span>
                          <span className="font-medium">{order.application?.state || "No seleccionado"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Enviado</span>
                          <span className="font-medium">
                            {order.application?.submittedAt 
                              ? new Date(order.application.submittedAt).toLocaleDateString('es-ES') 
                              : "Pendiente"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l bg-muted/20 p-6 md:w-64">
                       {order.application?.status === 'draft' ? (
                         <div className="space-y-3">
                           <div className="text-amber-600 text-sm font-medium">
                             Acción requerida
                           </div>
                           <Button asChild className="w-full" data-testid={`button-continue-${order.id}`}>
                             <Link href={`/application/${order.application?.id}`}>
                               Continuar →
                             </Link>
                           </Button>
                         </div>
                       ) : (
                         <div className="space-y-3">
                            <div className="text-brand-dark text-sm font-medium">
                             En proceso
                           </div>
                           <Button asChild variant="outline" className="w-full" data-testid={`button-view-${order.id}`}>
                             <Link href={`/application/${order.application?.id}`}>Ver Detalles</Link>
                           </Button>
                         </div>
                       )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center border-dashed rounded-[2rem]">
            <h3 className="font-serif text-xl font-bold">Sin Solicitudes</h3>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
              Comienza tu viaje empresarial hoy. Elige un paquete para iniciar la formación de tu LLC.
            </p>
            <Button asChild className="mt-6" variant="premium" data-testid="button-start-application">
              <Link href="/#pricing">Empezar Solicitud</Link>
            </Button>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
