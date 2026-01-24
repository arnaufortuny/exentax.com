import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, MessageSquare } from "lucide-react";

import { useState, useEffect } from "react";

const contactFormSchema = z.object({
  nombre: z.string().min(2, "El nombre es demasiado corto"),
  apellido: z.string().min(2, "El apellido es demasiado corto"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  subject: z.string().min(5, "El asunto es demasiado corto"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  otp: z.string().min(6, "El código debe tener 6 dígitos"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

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

export default function Contacto() {
  const { toast } = useToast();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      subject: "",
      mensaje: "",
      otp: "",
    },
  });

  const sendOtp = async () => {
    const email = form.getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast({ title: "Error", description: "Introduce un email válido", variant: "destructive" });
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
    } catch (error) {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    const email = form.getValues("email");
    const otp = form.getValues("otp");
    if (!otp || otp.length < 6) {
      toast({ title: "Error", description: "Código incompleto", variant: "destructive" });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await apiRequest("POST", "/api/contact/verify-otp", { email, otp });
      setIsEmailVerified(true);
      toast({ 
        title: "¡Email verificado!", 
        description: "Ya puedes enviar tu mensaje.",
        variant: "success"
      });
    } catch (error) {
      toast({ title: "Error", description: "Código incorrecto o caducado", variant: "destructive" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    if (!isEmailVerified) {
      toast({ title: "Error", description: "Verifica tu email primero", variant: "destructive" });
      return;
    }
    try {
      const isConstitution = data.subject.toLowerCase().includes("constitución");
      const response = await apiRequest("POST", "/api/contact", data);
      const result = await response.json();
      toast({
        title: "Mensaje Enviado",
        description: `Tu consulta #${result.ticketId} ha sido recibida. Te responderemos en 24-48h.`,
        variant: "success"
      });
      form.reset();
      setIsOtpSent(false);
      setIsEmailVerified(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Check for pre-filled subject (Constitution)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject");
    if (subject) {
      form.setValue("subject", subject);
    }
  }, [form]);

  return (
    <div className="min-h-screen bg-background font-sans text-left overflow-x-hidden w-full relative">
      <Navbar />
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-24 pb-8 sm:pt-32 lg:pt-40 min-h-[300px] sm:min-h-[auto] w-full"
        showOverlay={false}
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-primary uppercase tracking-tight leading-[1.1] text-center mb-2">
            Contacto
          </h1>
        }
        subtitle={
          <p className="text-[13px] sm:text-xl lg:text-2xl text-primary font-medium leading-relaxed max-w-2xl text-center mb-4 sm:mb-20 mx-auto px-2">
            ¿Tienes dudas antes de constituir tu LLC o necesitas aclarar algún punto? Escríbenos y te respondemos en menos de 24h.
          </p>
        }
      />
      <section className="py-8 sm:py-20 bg-background border-t border-primary/5">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* 1. Formulario Primero */}
            <motion.div 
              className="bg-background p-8 sm:p-12 rounded-2xl border border-accent/20 shadow-xl mb-16"
              variants={fadeIn}
            >
              <h3 className="text-2xl sm:text-3xl font-black uppercase mb-8 text-primary text-center">Envíanos un mensaje</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5 sm:space-y-2">
                          <FormLabel className="font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-70">Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} className="rounded-3xl border-accent/30 focus:border-accent h-11 sm:h-12" disabled={isEmailVerified} />
                          </FormControl>
                          <FormMessage className="text-[10px] sm:text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5 sm:space-y-2">
                          <FormLabel className="font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-70">Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu apellido" {...field} className="rounded-3xl border-accent/30 focus:border-accent h-11 sm:h-12" disabled={isEmailVerified} />
                          </FormControl>
                          <FormMessage className="text-[10px] sm:text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 sm:space-y-2">
                        <FormLabel className="font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-70">Teléfono (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 000 00 00 00" {...field} className="rounded-3xl border-accent/30 focus:border-accent h-11 sm:h-12" disabled={isEmailVerified} />
                        </FormControl>
                        <FormMessage className="text-[10px] sm:text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
                    <div className="flex-1 w-full">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5 sm:space-y-2">
                            <FormLabel className="font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-70">Email</FormLabel>
                            <FormControl>
                              <Input placeholder="tu@email.com" {...field} className="rounded-3xl border-accent/30 focus:border-accent h-11 sm:h-12" disabled={isEmailVerified || isOtpSent} />
                            </FormControl>
                            <FormMessage className="text-[10px] sm:text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    {!isEmailVerified && (
                      <Button 
                        type="button" 
                        onClick={sendOtp} 
                        disabled={isSendingOtp || isOtpSent}
                        className="bg-accent text-primary font-black text-sm rounded-full h-11 sm:h-12 px-8 hover:bg-accent/90 transition-all shrink-0 w-full sm:w-auto shadow-lg shadow-accent/20 border-0"
                      >
                        {isSendingOtp ? "Enviando..." : isOtpSent ? "Código enviado" : "Enviar código"}
                      </Button>
                    )}
                  </div>

                  {isOtpSent && !isEmailVerified && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end animate-in fade-in slide-in-from-top-2">
                      <div className="flex-1 w-full">
                        <FormField
                          control={form.control}
                          name="otp"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5 sm:space-y-2">
                              <FormLabel className="font-black uppercase text-[10px] sm:text-xs tracking-widest text-accent flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent" /> Introduce el código de 6 dígitos
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="000000" {...field} className="rounded-3xl border-accent focus:border-accent bg-accent/5 text-center text-lg tracking-[0.5em] font-black h-11 sm:h-12" maxLength={6} />
                              </FormControl>
                              <FormMessage className="text-[10px] sm:text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={verifyOtp} 
                        disabled={isVerifyingOtp}
                        className="bg-accent text-primary font-black text-sm rounded-full h-11 sm:h-12 px-10 hover:bg-accent/90 transition-all shrink-0 w-full sm:w-auto shadow-xl shadow-accent/20 border-0"
                      >
                        {isVerifyingOtp ? "Verificando..." : "Verificar email"}
                      </Button>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 sm:space-y-2">
                        <FormLabel className="font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-70">Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="¿En qué podemos ayudarte?" {...field} className="rounded-3xl border-accent/30 focus:border-accent h-11 sm:h-12" disabled={!isEmailVerified} />
                        </FormControl>
                        <FormMessage className="text-[10px] sm:text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mensaje"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 sm:space-y-2">
                        <FormLabel className="font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-70">Mensaje</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escribe tu mensaje aquí..." 
                            className="min-h-[120px] sm:min-h-[150px] rounded-3xl border-accent/30 focus:border-accent py-3" 
                            {...field} 
                            disabled={!isEmailVerified}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] sm:text-xs" />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={form.formState.isSubmitting || !isEmailVerified}
                      className={`w-full font-black text-sm rounded-full py-7 sm:py-8 transition-all shadow-xl border-0 ${
                        isEmailVerified 
                          ? "bg-accent text-primary hover:bg-accent/90 cursor-pointer shadow-accent/30" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none"
                      }`}
                    >
                      {form.formState.isSubmitting ? "Enviando..." : "Enviar mensaje"}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>

            {/* 2. Título Vías de Comunicación */}
            <motion.div 
              className="text-center mb-10 flex flex-col items-center justify-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tight text-center" variants={fadeIn}>
                <span className="text-accent uppercase tracking-widest text-xs sm:text-sm font-black block mb-1 sm:mb-2 text-center">CONTACTO</span>
                Vías de comunicación
              </motion.h2>
              <motion.p className="text-accent font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>(Mensaje)</motion.p>
            </motion.div>

            {/* 3. Vías de Comunicación Detalladas */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <motion.div className="space-y-6" variants={fadeIn}>
                <div className="p-6 bg-accent/5 border-l-4 border-accent rounded-r-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-black uppercase text-[10px] tracking-widest text-primary/50 mb-0.5">EMAIL</p>
                    <p className="text-lg sm:text-xl font-bold text-primary">info@easyusllc.com</p>
                  </div>
                </div>
              </motion.div>
              <motion.div className="space-y-6" variants={fadeIn}>
                <div className="p-6 bg-accent/5 border-l-4 border-accent rounded-r-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-black uppercase text-[10px] tracking-widest text-primary/50 mb-0.5">WHATSAPP</p>
                    <p className="text-lg sm:text-xl font-bold text-primary">+34 614 91 69 10</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
