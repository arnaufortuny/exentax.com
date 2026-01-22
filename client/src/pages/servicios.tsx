import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { HelpSection } from "@/components/layout/help-section";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import type { Product } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
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

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

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
      toast({ 
        title: "¡Código enviado!", 
        description: "Revisa tu bandeja de entrada.",
        variant: "success"
      });
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
      toast({ 
        title: "¡Email verificado!", 
        description: "Ya puedes enviar tu mantenimiento.",
        variant: "success"
      });
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
      toast({ 
        title: "¡Solicitud enviada!", 
        description: "Revisa tu bandeja de entrada.",
        variant: "success"
      });
      mForm.reset();
      setMaintenanceStep("ask");
    } catch {
      toast({ title: "Error", description: "Error al enviar la solicitud", variant: "destructive" });
    }
  };

  const handleSelectProduct = (productId: number) => {
    setLocation(`/contacto`);
  };

  const nmProduct = products?.find(p => p.name.includes("New Mexico"));
  const wyProduct = products?.find(p => p.name.includes("Wyoming"));
  const deProduct = products?.find(p => p.name.includes("Delaware"));

  const packFeatures = [
    "Tasas del estado pagadas",
    "Registered Agent (12 meses)",
    "Articles of Organization",
    "Operating Agreement",
    "EIN del IRS",
    "BOI Report presentado",
    "Dirección nuestra",
    "Asistencia con bancos",
    "Soporte completo 12 meses",
    "Servicio Express"
  ];

  const maintenanceFeatures = [
    "Presentación Form 1120 ante el IRS",
    "Presentación Form 5472 ante el IRS",
    "Renovación Registered Agent (12 meses)",
    "Presentación y Gestión Annual Report",
    "Soporte Ilimitado (12 meses)",
    "Renovación de BOI Report (si fuera necesario)",
    "1 Actualización de Articles of Organization"
  ];

  return (
    <div className="min-h-screen font-sans bg-white text-center overflow-x-hidden w-full relative">
      <Navbar />
      
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-32 sm:pt-16 min-h-[450px] sm:min-h-[auto] w-full"
        showOverlay={false}
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-brand-dark uppercase tracking-tight leading-[1.1] text-center">
            Constituimos tu LLC en Estados Unidos de <span className="text-brand-lime">forma simple, rápida y transparente.</span>
          </h1>
        }
        subtitle={
            <motion.div 
              className="flex flex-col items-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.p 
                className="text-[13px] sm:text-xl lg:text-2xl text-brand-dark font-medium leading-relaxed max-w-2xl text-center mb-12 sm:mb-20 mx-auto px-2"
                variants={fadeIn}
              >
                Todo lo que necesitas saber sobre tu LLC: estructura, impuestos, bancos y cómo trabajamos.
              </motion.p>
            </motion.div>
        }
      />

      {/* 2. Nuestros Packs */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="pricing">
        <div className="w-full px-4 sm:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">PACKS</span>
              NUESTROS PACKS
            </motion.h2>
            <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>
              (Elige el plan que mejor se adapte a ti)
            </motion.p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* New Mexico */}
            <motion.div className="border-[2px] border-brand-lime rounded-2xl overflow-hidden relative bg-white shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full max-w-[280px] sm:max-w-none" variants={fadeIn}>
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex justify-between items-start mb-3 sm:mb-3">
                  <h3 className="text-xl sm:text-xl font-black text-brand-dark uppercase tracking-tight">New Mexico</h3>
                  <span className="bg-brand-lime/20 text-brand-dark text-[10px] sm:text-[11px] font-black px-2 py-1 rounded-full uppercase">Popular | 2-3 días</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-brand-dark">639€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[10px] sm:text-[9px] font-black uppercase tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-brand-lime/10 pt-4 sm:pt-4">
                  {packFeatures.map((f) => (
                    <p key={f} className="flex items-center justify-start gap-2 sm:gap-2 text-brand-dark/80 font-medium text-left leading-tight">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(nmProduct?.id || 1)}
                  className="w-full bg-brand-lime text-brand-dark font-black rounded-full py-4 sm:py-4 text-base sm:text-base border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-11 sm:h-11"
                >
                  Elegir New Mexico
                </Button>
              </div>
              <div className="bg-brand-cream/30 px-5 py-3 sm:px-5 sm:py-3 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[10px] sm:text-[9px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 339€</p>
              </div>
            </motion.div>

            {/* Wyoming */}
            <motion.div className="border-[2px] border-brand-lime rounded-2xl overflow-hidden relative bg-white shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full max-w-[280px] sm:max-w-none" variants={fadeIn}>
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex justify-between items-start mb-3 sm:mb-3">
                  <h3 className="text-xl sm:text-xl font-black text-brand-dark uppercase tracking-tight">Wyoming</h3>
                  <span className="bg-brand-dark text-white text-[10px] sm:text-[11px] font-black px-2 py-1 rounded-full uppercase">Premium | 2-3 días</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-brand-dark">799€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[10px] sm:text-[9px] font-black uppercase tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-brand-lime/10 pt-4 sm:pt-4">
                  {packFeatures.map((f) => (
                    <p key={f} className="flex items-center justify-start gap-2 sm:gap-2 text-brand-dark/80 font-medium text-left leading-tight">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(wyProduct?.id || 2)}
                  className="w-full bg-brand-lime text-brand-dark font-black rounded-full py-4 sm:py-4 text-base sm:text-base border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-11 sm:h-11"
                >
                  Elegir Wyoming
                </Button>
              </div>
              <div className="bg-brand-cream/30 px-5 py-3 sm:px-5 sm:py-3 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[10px] sm:text-[9px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 449€</p>
              </div>
            </motion.div>

            {/* Delaware */}
            <motion.div className="border-[2px] border-brand-lime rounded-2xl overflow-hidden relative bg-white shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group mx-auto w-full max-w-[280px] sm:max-w-none" variants={fadeIn}>
              <div className="p-5 sm:p-6 flex-grow text-center">
                <div className="flex justify-between items-start mb-3 sm:mb-3">
                  <h3 className="text-xl sm:text-xl font-black text-brand-dark uppercase tracking-tight">Delaware</h3>
                  <span className="bg-brand-lime text-brand-dark text-[10px] sm:text-[11px] font-black px-2 py-1 rounded-full uppercase">Startups | 2-5 días</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <p className="text-4xl sm:text-4xl font-black text-brand-dark">999€</p>
                  <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año 1</span>
                </div>
                <p className="text-muted-foreground text-[10px] sm:text-[9px] font-black uppercase tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                  Tasas estatales incluidas
                </p>
                <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-brand-lime/10 pt-4 sm:pt-4">
                  {packFeatures.map((f) => (
                    <p key={f} className="flex items-center justify-start gap-2 sm:gap-2 text-brand-dark/80 font-medium text-left leading-tight">
                      <span className="text-brand-lime font-black">✓</span> 
                      <span className="text-xs sm:text-base">{f}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button 
                  onClick={() => handleSelectProduct(deProduct?.id || 3)}
                  className="w-full bg-brand-lime text-brand-dark font-black rounded-full py-4 sm:py-4 text-base sm:text-base border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-11 sm:h-11"
                >
                  Elegir Delaware
                </Button>
              </div>
              <div className="bg-brand-cream/30 px-5 py-3 sm:px-5 sm:py-3 border-t border-brand-lime/10 mt-auto text-center">
                <p className="font-black text-[10px] sm:text-[9px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Año 2: 599€</p>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mt-12 sm:mt-16 flex justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Button 
              onClick={() => {
                setLocation("/?scroll=servicios");
              }}
              variant="outline"
              className="group border-brand-dark/20 text-brand-dark font-black rounded-full px-8 py-6 text-lg hover:bg-brand-dark hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm"
            >
              ¿Qué incluyen?
              <ChevronDown className="ml-2 w-5 h-5 transition-transform group-hover:translate-y-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 3. Banca & Mantenimiento (Unified Section) */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="bancos">
        <div className="w-full px-5 sm:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">BANCOS</span>
              Asistencia Bancaria
            </motion.h2>
            <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>
              (Ayudamos a abrir cuentas en fintech y bancos, si el cliente lo requiere)
            </motion.p>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6 max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { title: "Mercury", desc: "Te acompañamos en todo el proceso de solicitud de cuenta en Mercury, ayudándote a presentar correctamente la información de tu LLC." },
              { title: "Relay", desc: "Asistencia en la apertura de cuenta en Relay, una alternativa bancaria sólida para la operativa diaria de tu empresa." },
              { title: "Estrategia bancaria", desc: "Te orientamos sobre la opción bancaria más adecuada según tu tipo de negocio y forma de operar." },
              { title: "Acompañamiento continuo", desc: "Te acompañamos durante el proceso y resolvemos tus dudas hasta que la solicitud queda resuelta." },
            ].map((service, i) => (
              <motion.div key={i} className="p-6 bg-brand-lime/5 rounded-2xl border border-brand-lime/10 sm:border-brand-lime/10 border-brand-lime/30 hover:bg-brand-lime/10 transition-colors text-center" variants={fadeIn}>
                <p className="font-display font-black uppercase tracking-tighter text-lg sm:text-xl mb-3 text-brand-dark">{service.title}</p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-8 mb-12 flex justify-center">
            <div className="bg-brand-lime px-8 py-3 rounded-full shadow-lg transform -rotate-1">
              <p className="text-brand-dark font-display font-black uppercase tracking-[0.2em] text-sm sm:text-base">
                Incluido en tu paquete inicial
              </p>
            </div>
          </div>

          <div className="border-t border-brand-dark/5 w-full max-w-7xl mx-auto mb-12" />

          <motion.div 
            className="text-center mb-6 sm:mb-10 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">MANTENIMIENTO</span>
              Precios Mantenimiento
            </motion.h2>
            <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>(Todo incluido anualmente)</motion.p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { state: "New Mexico", price: "339€", annual: true },
              { state: "Wyoming", price: "449€", annual: true },
              { state: "Delaware", price: "599€", annual: true }
            ].map((item, i) => (
              <motion.div key={i} className="border-[2px] border-brand-lime rounded-2xl overflow-hidden relative bg-white shadow-lg flex flex-col h-full transform transition-all hover:scale-[1.01] hover:shadow-xl group text-center mx-auto w-full max-w-[280px] sm:max-w-none" variants={fadeIn}>
                <div className="p-5 sm:p-6 flex-grow text-center">
                  <div className="flex justify-between items-start mb-3 sm:mb-3">
                    <h3 className="text-xl sm:text-xl font-black text-brand-dark uppercase tracking-tight">{item.state}</h3>
                    <span className="bg-brand-lime/20 text-brand-dark text-[10px] sm:text-[11px] font-black px-2 py-1 rounded-full uppercase">Mantenimiento</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <p className="text-4xl sm:text-4xl font-black text-brand-dark">{item.price}</p>
                    <span className="text-muted-foreground text-xs sm:text-xs font-medium">/año</span>
                  </div>
                  <p className="text-muted-foreground text-[10px] sm:text-[9px] font-black uppercase tracking-widest mb-4 sm:mb-4 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                    Tasas estatales incluidas
                  </p>
                  <div className="space-y-2 sm:space-y-2 text-sm sm:text-base mb-4 sm:mb-4 border-t border-brand-lime/10 pt-4 sm:pt-4">
                    {maintenanceFeatures.map((f) => (
                      <p key={f} className="flex items-center justify-start gap-2 sm:gap-2 text-brand-dark/80 font-medium text-left leading-tight">
                        <span className="text-brand-lime font-black">✓</span> 
                        <span className="text-xs sm:text-base">{f}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="p-5 sm:p-6 pt-0">
                  <Dialog open={maintenanceDialogOpen} onOpenChange={(open) => {
                    setMaintenanceDialogOpen(open);
                    if (!open) setMaintenanceStep("ask");
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setSelectedState(item.state);
                          setMaintenanceStep("ask");
                        }}
                        className="w-full bg-brand-lime text-brand-dark font-black rounded-full py-4 sm:py-4 text-base sm:text-base border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-11 sm:h-11"
                      >
                        Contratar Mantenimiento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl border-brand-lime/20 font-sans p-4 sm:p-6 overflow-y-auto max-h-[90vh] bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-black text-brand-dark text-center uppercase tracking-tighter">
                          Mantenimiento {selectedState}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4 sm:py-6">
                        <AnimatePresence mode="wait">
                          {maintenanceStep === "ask" ? (
                            <motion.div 
                              key="ask"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="text-center space-y-4 sm:space-y-6"
                            >
                              <p className="text-base sm:text-lg font-bold text-brand-dark">¿Ya tienes una LLC constituida con nosotros o con terceros?</p>
                              <div className="flex flex-col gap-3">
                                <Button 
                                  onClick={() => setLocation("/contacto")}
                                  className="bg-brand-lime text-brand-dark font-black rounded-full h-12 sm:h-14 text-sm sm:text-lg hover:bg-brand-lime/90 shadow-md border-0 uppercase"
                                >
                                  Sí, ya tengo una LLC
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    setMaintenanceDialogOpen(false);
                                    const el = document.getElementById('pricing');
                                    el?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="border-brand-dark text-brand-dark font-black rounded-full h-12 sm:h-14 text-sm sm:text-lg hover:bg-brand-dark hover:text-white transition-all uppercase"
                                >
                                  No, quiero constituirla
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            /* This step is currently bypassed by redirects above, but keeping structure for future use if needed */
                            <div />
                          )}
                        </AnimatePresence>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Servicios Extras */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="extras">
        <div className="w-full px-5 sm:px-8">
          <motion.div 
            className="text-center mb-6 sm:mb-10 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">EXTRAS</span>
              Servicios Adicionales
            </motion.h2>
            <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>(Servicios a medida para tu LLC)</motion.p>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { title: "Disolución de LLC", desc: "Gestionamos el cierre oficial y ordenado de tu LLC en Estados Unidos, asegurando que la estructura quede correctamente disuelta y sin obligaciones futuras." },
              { title: "Enmiendas de la LLC", desc: "Tramitamos modificaciones oficiales como cambio de nombre, actualización de datos o ajustes estructurales, manteniendo tu empresa siempre en regla." },
              { title: "Agente Registrado", desc: "Gestión y renovación del Registered Agent para garantizar que tu LLC disponga de dirección legal válida y cumpla con los requisitos estatales." },
              { title: "Presentación Fiscal", desc: "Preparamos y presentamos los formularios 1120 y 5472 ante el IRS, cumpliendo con las obligaciones informativas federales aplicables a LLCs de propietarios no residentes." },
            ].map((service, i) => (
              <motion.div key={i} className="p-6 bg-brand-lime/5 rounded-2xl border border-brand-lime/10 sm:border-brand-lime/10 border-brand-lime/30 hover:bg-brand-lime/10 transition-colors text-center" variants={fadeIn}>
                <p className="font-display font-black uppercase tracking-tighter text-lg sm:text-xl mb-3 text-brand-dark">{service.title}</p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-24 bg-white border-t border-brand-dark/5">
        <div className="w-full px-5 sm:px-8">
          {/* Main Maintenance Dialog handled within cards above */}

          <motion.div 
            className="text-center mb-0 sm:mb-16 mt-0"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-brand-lime uppercase tracking-widest text-xs sm:text-sm font-black block mb-0 text-center">FAQ</span>
              Preguntas Frecuentes
            </motion.h2>
            <motion.p className="text-brand-lime font-black uppercase tracking-wide text-sm sm:text-lg mt-0 text-center leading-[1.1]" variants={fadeIn}>(Respondemos de forma clara a las dudas más habituales sobre LLCs, impuestos, bancos y cómo trabajamos)</motion.p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              { q: "¿Cuánto tiempo tarda en estar lista mi LLC?", a: "El proceso suele tardar entre 2 y 3 días hábiles en New Mexico y Wyoming, y hasta 5 días en Delaware." },
              { q: "¿Necesito viajar a EE. UU. para abrir mi LLC?", a: "No, todo el proceso se realiza de forma 100% online y remota." },
              { q: "¿Puedo abrir una cuenta bancaria desde mi país?", a: "Sí, te ayudamos a abrir cuentas en Mercury y Relay sin necesidad de viajar." }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                className={`border-2 rounded-2xl overflow-hidden bg-white shadow-lg transition-all duration-300 ${openFaq === i ? "border-brand-lime" : "border-brand-dark/5"}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <button 
                  className="w-full p-6 sm:p-8 flex items-center justify-between text-left transition-colors hover:bg-brand-dark/[0.02]"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-lg sm:text-xl font-black uppercase tracking-tight text-brand-dark">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className={`w-6 h-6 ${openFaq === i ? "text-brand-lime" : "text-brand-dark"}`} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0">
                        <div className="border-t border-brand-dark/10 pt-6">
                          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Soporte Directo */}
      <section className="py-12 sm:py-20 bg-white border-t border-brand-dark/5" id="soporte">
        <div className="w-full px-5 sm:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-brand-lime uppercase tracking-widest text-sm font-black block mb-2 text-center">SOPORTE</span>
              Estamos Contigo
            </motion.h2>
            <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>(Soporte humano y cercano)</motion.p>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-10 sm:mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { title: "Email y WhatsApp", desc: "Atención directa y personalizada para resolver tus dudas operativas cuando lo necesites." },
              { title: "Guía de bienvenida", desc: "Manual claro y práctico para entender cómo funciona tu LLC y cómo mantenerla correctamente." },
              { title: "Alertas de plazos", desc: "Te avisamos con antelación de las obligaciones y fechas clave para que no se te pase nada." },
            ].map((service, i) => (
              <motion.div key={i} className="p-6 bg-brand-lime/5 rounded-2xl border border-brand-lime/10 sm:border-brand-lime/10 border-brand-lime/30 hover:bg-brand-lime/10 transition-colors text-center shadow-sm" variants={fadeIn}>
                <p className="font-display font-black uppercase tracking-tighter text-lg sm:text-xl mb-3 text-brand-dark">{service.title}</p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          {/* Removed redundant FAQ button from Soporte section as well */}
        </div>
      </section>

      <HelpSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}