import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import type { Product } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
      setMaintenanceDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Error al enviar la solicitud", variant: "destructive" });
    }
  };

  const handleSelectProduct = (stateName: string) => {
    setLocation(`/application?state=${encodeURIComponent(stateName)}`);
  };

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
                className="text-[13px] sm:text-xl lg:text-2xl text-brand-dark font-medium leading-relaxed max-w-2xl text-center mb-8 sm:mb-12 mx-auto px-2"
                variants={fadeIn}
              >
                Todo lo que necesitas saber sobre tu LLC: estructura, impuestos, bancos y cómo trabajamos.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl px-4 mb-12"
                variants={fadeIn}
              >
                {[
                  "Mas de 30 LLC constituidas",
                  "Nuestros clientes nos valoran 5/5",
                  "Aprobacion 90% Cuentas",
                  "Precios Competitivos"
                ].map((text, i) => (
                  <div 
                    key={i} 
                    className="bg-brand-lime text-brand-dark font-black text-sm px-4 py-2 rounded-full shadow-sm"
                  >
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
        }
      />

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
                  onClick={() => handleSelectProduct("New Mexico")}
                  className="w-full bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-brand-lime/20"
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
                  onClick={() => handleSelectProduct("Wyoming")}
                  className="w-full bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-brand-lime/20"
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
                  onClick={() => handleSelectProduct("Delaware")}
                  className="w-full bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-brand-lime/20"
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
              className="group bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base rounded-full px-8 py-6 h-14 shadow-md hover:bg-brand-lime/90 transition-all transform hover:scale-105 active:scale-95 shadow-brand-lime/20"
            >
              ¿Qué incluyen?
              <ChevronDown className="ml-2 w-5 h-5 transition-transform group-hover:translate-y-1" />
            </Button>
          </motion.div>
        </div>
      </section>

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
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-lime text-brand-dark font-black text-sm shadow-sm mb-4">
                  {service.title}
                </span>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-8 mb-12 flex justify-center">
            <div className="bg-brand-lime px-8 py-3 rounded-full shadow-lg transform -rotate-1">
              <p className="text-brand-dark font-sans font-black uppercase tracking-[0.2em] text-sm sm:text-base">
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
                  <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setSelectedState(item.state);
                          setMaintenanceStep("ask");
                          setMaintenanceDialogOpen(true);
                        }}
                        className="w-full bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base rounded-full py-4 sm:py-4 border-0 shadow-md hover:bg-brand-lime/90 transition-all transform active:scale-95 h-11 sm:h-11 shadow-brand-lime/20"
                      >
                        Pack Mantenimiento {item.state}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white rounded-3xl p-8 border-brand-lime/20">
                      <AnimatePresence mode="wait">
                        {maintenanceStep === "ask" ? (
                          <motion.div
                            key="ask"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6 text-center"
                          >
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black uppercase text-brand-dark text-center">¿Ya tienes tu LLC?</DialogTitle>
                            </DialogHeader>
                            <p className="text-gray-500">¿Deseas contratar el mantenimiento para una LLC que ya tienes o vas a constituir una nueva?</p>
                            <div className="grid grid-cols-1 gap-3">
                              <Button 
                                onClick={() => {
                                  setMaintenanceStep("form");
                                  setIsOtpSent(false);
                                  setIsEmailVerified(false);
                                  mForm.reset();
                                }}
                                className="w-full bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base h-14 rounded-full"
                              >
                                Ya tengo mi LLC
                              </Button>
                              <Button 
                                onClick={() => {
                                  setMaintenanceDialogOpen(false);
                                  handleSelectProduct(item.state);
                                }}
                                className="w-full bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base h-14 rounded-full shadow-md shadow-brand-lime/20"
                              >
                                Quiero constituir una nueva
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                          >
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black uppercase text-brand-dark text-center">Datos de tu LLC ({selectedState})</DialogTitle>
                            </DialogHeader>
                            <Form {...mForm}>
                              <form onSubmit={mForm.handleSubmit(onMaintenanceSubmit)} className="space-y-4">
                                <FormField
                                  control={mForm.control}
                                  name="nombre"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[10px] uppercase font-black tracking-widest text-gray-400">Nombre de la LLC</FormLabel>
                                      <FormControl><Input {...field} className="rounded-xl h-12" /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex gap-2 items-end">
                                  <div className="flex-1">
                                    <FormField
                                      control={mForm.control}
                                      name="email"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] uppercase font-black tracking-widest text-gray-400">Email de contacto</FormLabel>
                                          <FormControl><Input {...field} disabled={isEmailVerified || isOtpSent} className="rounded-xl h-12" /></FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  {!isEmailVerified && (
                                    <Button 
                                      type="button" 
                                      onClick={sendOtp} 
                                      disabled={isSendingOtp || isOtpSent}
                                      className="bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base h-12 px-6 rounded-full"
                                    >
                                      {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : (isOtpSent ? "Enviado" : "Enviar")}
                                    </Button>
                                  )}
                                </div>
                                
                                {isOtpSent && !isEmailVerified && (
                                  <div className="flex gap-2 items-end animate-in slide-in-from-top-2">
                                    <div className="flex-1">
                                      <FormField
                                        control={mForm.control}
                                        name="otp"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl><Input {...field} maxLength={6} className="rounded-xl h-12 text-center text-xl font-black tracking-widest" placeholder="000000" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <Button type="button" onClick={verifyOtp} disabled={isVerifyingOtp} className="bg-brand-lime text-brand-dark font-sans font-medium text-[14px] sm:text-base h-12 px-6 rounded-full">
                                      {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
                                    </Button>
                                  </div>
                                )}

                                <FormField
                                  control={mForm.control}
                                  name="mensaje"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[10px] uppercase font-black tracking-widest text-gray-400">Notas adicionales</FormLabel>
                                      <FormControl><Textarea {...field} disabled={!isEmailVerified} className="rounded-xl min-h-[80px]" /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button 
                                  type="submit" 
                                  disabled={!isEmailVerified} 
                                  className={`w-full font-sans font-medium text-[14px] sm:text-base h-14 rounded-full ${
                                    isEmailVerified ? "bg-brand-lime text-brand-dark shadow-md shadow-brand-lime/20" : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  Solicitar Mantenimiento
                                </Button>
                              </form>
                            </Form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="bg-brand-cream/30 px-5 py-3 sm:px-5 sm:py-3 border-t border-brand-lime/10 mt-auto text-center">
                  <p className="font-black text-[10px] sm:text-[9px] uppercase tracking-widest text-brand-dark/70">Mantenimiento Anual</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
