import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import type { Product } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const maintenanceFormSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  mensaje: z.string().min(10, "Cuéntanos más sobre tu LLC"),
  otp: z.string().min(6, "Código de 6 dígitos"),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Servicios() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [maintenanceStep, setMaintenanceStep] = useState<"ask" | "form">("ask");
  const [selectedState, setSelectedState] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { toast } = useToast();

  const mForm = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: { nombre: "", email: "", mensaje: "", otp: "" },
  });

  const sendOtp = async () => {
    const email = mForm.getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast({ title: "Error", description: "Email inválido", variant: "destructive" });
      return;
    }
    setIsSendingOtp(true);
    try {
      await apiRequest("POST", "/api/contact/send-otp", { email });
      setIsOtpSent(true);
      toast({ title: "¡Código enviado!", description: "Revisa tu bandeja de entrada.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    const email = mForm.getValues("email");
    const otp = mForm.getValues("otp");
    setIsVerifyingOtp(true);
    try {
      await apiRequest("POST", "/api/contact/verify-otp", { email, otp });
      setIsEmailVerified(true);
      toast({ title: "¡Email verificado!", description: "Ya puedes enviar tu mantenimiento.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Código incorrecto", variant: "destructive" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const onMaintenanceSubmit = async (data: MaintenanceFormValues) => {
    try {
      await apiRequest("POST", "/api/contact", {
        ...data,
        apellido: "(Mantenimiento)",
        subject: `Pack Mantenimiento ${selectedState}`,
      });
      toast({ title: "¡Solicitud enviada!", description: "Revisa tu bandeja de entrada.", variant: "success" });
      mForm.reset();
      setMaintenanceStep("ask");
      setMaintenanceDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Error al enviar la solicitud", variant: "destructive" });
    }
  };

  const handleSelectProduct = (stateName: string) => {
    setLocation(`/application?state=${encodeURIComponent(stateName)}`);
  };

  const maintenanceFeatures = [
    "Presentación Form 1120 ante el IRS",
    "Presentación Form 5472 ante el IRS",
    "Renovación Registered Agent (12 meses)",
    "Presentación y Gestión Annual Report",
    "Soporte Ilimitado (12 meses)",
    "Renovación de BOI Report (si fuera necesario)",
    "1 Actualización de Articles of Organization"
  ];

  const maintenanceProcess = [
    { title: "Gestión Fiscal", desc: "Preparación y presentación de los formularios 1120 y 5472 ante el IRS, asegurando el cumplimiento tributario anual de tu LLC." },
    { title: "Registered Agent", desc: "Renovación del servicio de Agente Registrado por un año más, manteniendo tu dirección legal y la recepción de notificaciones oficiales." },
    { title: "Annual Report", desc: "Gestión y presentación del Informe Anual ante el Secretario de Estado correspondiente, incluyendo el pago de las tasas estatales obligatorias." },
    { title: "BOI Report", desc: "Actualización y mantenimiento del Beneficial Ownership Information Report ante FinCEN para reflejar cualquier cambio en la estructura." },
    { title: "Soporte Continuo", desc: "Acceso ilimitado a nuestro equipo de soporte para resolver dudas sobre la operativa, impuestos y mantenimiento de tu empresa." },
    { title: "Actualizaciones", desc: "Incluye una actualización anual de tus Articles of Organization en caso de cambios menores en la estructura de la empresa." },
  ];

  return (
    <div className="min-h-screen font-sans bg-background text-center overflow-x-hidden w-full relative">
      <Navbar />
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-32 sm:pt-16 min-h-[450px] sm:min-h-[auto] w-full"
        showOverlay={false}
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-primary uppercase tracking-tight leading-[1.1] text-center">
            Mantenimiento y Gestión <span className="text-accent">Anual para tu LLC</span>
          </h1>
        }
      />

      <section className="py-12 sm:py-20 bg-background border-t border-primary/5">
        <div className="w-full px-4 sm:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { state: "New Mexico", price: "349€" },
              { state: "Wyoming", price: "499€" },
              { state: "Delaware", price: "599€" }
            ].map((item, i) => (
              <motion.div key={i} className="border-[2px] border-accent rounded-2xl overflow-hidden relative bg-background shadow-lg flex flex-col h-full text-center p-6" variants={fadeIn}>
                <h3 className="text-xl font-black text-primary uppercase mb-2">{item.state}</h3>
                <p className="text-4xl font-black text-primary mb-1">{item.price}</p>
                <p className="text-muted-foreground text-xs mb-6">/año</p>
                
                <div className="space-y-3 text-left mb-8 flex-grow">
                  {maintenanceFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-primary/80 font-medium">
                      <Check className="text-accent w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Dialog open={maintenanceDialogOpen && selectedState === item.state} onOpenChange={(open) => {
                  if (!open) setMaintenanceDialogOpen(false);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setSelectedState(item.state);
                        setMaintenanceStep("ask");
                        setMaintenanceDialogOpen(true);
                      }}
                      className="w-full bg-primary text-primary-foreground font-black rounded-full h-12"
                    >
                      Contratar {item.state}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-3xl z-[99999] border-0 shadow-2xl p-0 !bg-white">
                    <div className="bg-accent h-1.5 w-full" />
                    <div className="p-6 sm:p-8 text-center">
                      <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black uppercase text-primary text-center">Mantenimiento {selectedState}</DialogTitle>
                      </DialogHeader>
                      
                      <AnimatePresence mode="wait">
                        {maintenanceStep === "ask" ? (
                          <motion.div 
                            key="ask"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                          >
                            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                              ¿Ya constituiste tu LLC con nosotros o eres un nuevo cliente?
                            </p>
                            <div className="grid gap-4">
                              <Button onClick={() => setMaintenanceStep("form")} className="h-14 rounded-2xl bg-accent text-primary font-black">Soy Cliente de Easy US</Button>
                              <Button onClick={() => setMaintenanceStep("form")} variant="outline" className="h-14 rounded-2xl border-2 border-primary text-primary font-black">Soy Nuevo Cliente</Button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-left">
                            <Form {...mForm}>
                              <form onSubmit={mForm.handleSubmit(onMaintenanceSubmit)} className="space-y-4">
                                <FormField control={mForm.control} name="nombre" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary/50 text-left block">Nombre Completo</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Tu nombre" className="rounded-xl h-12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <div className="flex gap-2 items-end">
                                  <FormField control={mForm.control} name="email" render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary/50 text-left block">Email</FormLabel>
                                      <FormControl>
                                        <Input placeholder="tu@email.com" className="rounded-xl h-12" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <Button type="button" onClick={sendOtp} disabled={isSendingOtp || isEmailVerified} className="h-12 rounded-xl">
                                    {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEmailVerified ? <Check className="w-4 h-4" /> : "Validar")}
                                  </Button>
                                </div>
                                {isOtpSent && !isEmailVerified && (
                                  <div className="flex gap-2 items-end">
                                    <FormField control={mForm.control} name="otp" render={({ field }) => (
                                      <FormItem className="flex-1">
                                        <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary/50 text-left block">Código</FormLabel>
                                        <FormControl>
                                          <Input placeholder="123456" className="rounded-xl h-12 text-center font-black" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <Button type="button" onClick={verifyOtp} disabled={isVerifyingOtp} className="h-12 rounded-xl">Verificar</Button>
                                  </div>
                                )}
                                <FormField control={mForm.control} name="mensaje" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary/50 text-left block">Detalles LLC</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Nombre de tu LLC..." className="rounded-xl min-h-[80px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <Button type="submit" disabled={!isEmailVerified} className="w-full bg-accent text-primary font-black h-14 rounded-xl">Confirmar Mantenimiento</Button>
                              </form>
                            </Form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-accent/5">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-black uppercase text-primary mb-8">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {maintenanceProcess.map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-primary/5 text-left cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-primary uppercase text-sm">{step.title}</h4>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </div>
                {openFaq === i && <p className="mt-4 text-muted-foreground text-sm leading-relaxed">{step.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
