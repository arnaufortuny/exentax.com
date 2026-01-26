import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Building2, FileText, Clock, ChevronRight, User, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, authLoading]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] font-sans">
      <Navbar />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <p className="text-accent font-black uppercase tracking-widest text-sm mb-2">Panel de Control</p>
              <h1 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-tighter leading-none">
                Hola, {user?.firstName || 'Emprendedor'}
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full border-2 border-primary font-bold px-6">
                <Settings className="w-4 h-4 mr-2" /> Ajustes
              </Button>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                  <Package className="w-6 h-6 text-accent" /> Tus Servicios
                </h2>
              </div>
              
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse" />)}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <Card key={order.id} className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 text-center md:text-left">
                          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                            <Building2 className="w-8 h-8 text-accent" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-primary uppercase tracking-tight">{order.product?.name || "Servicio LLC"}</h3>
                            <p className="text-muted-foreground font-medium">Pedido #{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="flex-1 md:text-right">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-yellow-100 text-yellow-700">
                              {order.status === 'pending' ? 'En Proceso' : order.status}
                            </span>
                          </div>
                          <Button variant="ghost" className="rounded-full w-12 h-12 p-0">
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary mb-2">Aún no tienes servicios activos</h3>
                  <p className="text-muted-foreground mb-6">Comienza hoy mismo la constitución de tu empresa en USA.</p>
                  <Button onClick={() => window.location.href="/servicios"} className="bg-accent text-primary font-black rounded-full px-8 py-6">
                    Constituir mi LLC ahora
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="bg-primary text-white p-8 rounded-[3rem] shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" /> Próximos Pasos
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-accent text-primary flex items-center justify-center shrink-0 font-black text-xs">1</div>
                    <p className="text-sm font-medium opacity-90">Revisión inicial de tu solicitud (24-48h)</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 font-black text-xs">2</div>
                    <p className="text-sm font-medium opacity-70">Preparación de Articles of Organization</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 font-black text-xs">3</div>
                    <p className="text-sm font-medium opacity-70">Presentación ante el Estado correspondiente</p>
                  </li>
                </ul>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent opacity-10 rounded-full" />
            </section>

            <section className="bg-white p-8 rounded-[3rem] shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-tight text-primary mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" /> Documentación
              </h3>
              <p className="text-sm text-muted-foreground font-medium mb-6">Aquí aparecerán tus documentos (Articles, EIN, etc.) una vez procesados.</p>
              <Button variant="outline" disabled className="w-full rounded-full font-bold py-6 opacity-50">
                No hay documentos aún
              </Button>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
