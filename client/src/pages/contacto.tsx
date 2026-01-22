import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { HelpSection } from "@/components/layout/help-section";
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

import { useState } from "react";

const contactFormSchema = z.object({
  nombre: z.string().min(2, "El nombre es demasiado corto"),
  apellido: z.string().min(2, "El apellido es demasiado corto"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(5, "El asunto es demasiado corto"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  otp: z.string().min(6, "El código debe tener 6 dígitos"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;
// ... rest of imports and definitions
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
      toast({ title: "Código enviado", description: "Revisa tu bandeja de entrada" });
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
      toast({ title: "Email verificado", description: "Ya puedes enviar tu mensaje" });
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
      await apiRequest("POST", "/api/contact", data);
      toast({
        title: "Mensaje enviado",
        description: "Hemos recibido tu mensaje correctamente.",
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

  return (
    <div className="min-h-screen bg-white font-sans text-left overflow-x-hidden w-full relative">
      <Navbar />
      <HeroSection 
        className="flex flex-col items-center justify-center text-center pt-32 sm:pt-32 lg:pt-40 min-h-[450px] sm:min-h-[auto] w-full"
        showOverlay={false}
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-brand-dark uppercase tracking-tight leading-[1.1] text-center">
            Contacto
          </h1>
        }
        subtitle={
          <p className="text-[13px] sm:text-xl lg:text-2xl text-brand-dark font-medium leading-relaxed max-w-2xl text-center mb-12 sm:mb-20 mx-auto px-2">
            ¿Tienes alguna duda técnica o comercial? Estamos aquí para ayudarte a resolverla en menos de 24 horas.
          </p>
        }
      />
      <section className="py-8 sm:py-20 bg-white border-t border-brand-dark/5">
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
              className="bg-white p-8 sm:p-12 rounded-2xl border border-brand-lime/20 shadow-xl mb-16"
              variants={fadeIn}
            >
              <h3 className="text-2xl sm:text-3xl font-black uppercase mb-8 text-brand-dark text-center">Envíanos un mensaje</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black uppercase text-xs tracking-widest">Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} className="rounded-xl border-brand-lime/30 focus:border-brand-lime" disabled={isEmailVerified} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black uppercase text-xs tracking-widest">Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu apellido" {...field} className="rounded-xl border-brand-lime/30 focus:border-brand-lime" disabled={isEmailVerified} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black uppercase text-xs tracking-widest">Email</FormLabel>
                            <FormControl>
                              <Input placeholder="tu@email.com" {...field} className="rounded-xl border-brand-lime/30 focus:border-brand-lime" disabled={isEmailVerified || isOtpSent} />
                            </FormControl>
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
                        className="bg-brand-lime text-brand-dark font-black rounded-full h-10 px-6 hover:bg-brand-lime/90 transition-all shrink-0 w-full sm:w-auto"
                      >
                        {isSendingOtp ? "Enviando..." : isOtpSent ? "Código Enviado" : "Enviar Código"}
                      </Button>
                    )}
                  </div>

                  {isOtpSent && !isEmailVerified && (
                    <div className="flex flex-col sm:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-2">
                      <div className="flex-1 w-full">
                        <FormField
                          control={form.control}
                          name="otp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black uppercase text-xs tracking-widest text-brand-lime">Introduce el código de 6 dígitos</FormLabel>
                              <FormControl>
                                <Input placeholder="000000" {...field} className="rounded-xl border-brand-lime focus:border-brand-lime bg-brand-lime/5 text-center text-lg tracking-widest font-black" maxLength={6} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={verifyOtp} 
                        disabled={isVerifyingOtp}
                        className="bg-brand-dark text-white font-black rounded-full h-10 px-8 hover:bg-brand-dark/90 transition-all shrink-0 w-full sm:w-auto"
                      >
                        {isVerifyingOtp ? "Verificando..." : "Verificar Email"}
                      </Button>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-xs tracking-widest">Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="¿En qué podemos ayudarte?" {...field} className="rounded-xl border-brand-lime/30 focus:border-brand-lime" disabled={!isEmailVerified} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mensaje"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-xs tracking-widest">Mensaje</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escribe tu mensaje aquí..." 
                            className="min-h-[150px] rounded-xl border-brand-lime/30 focus:border-brand-lime" 
                            {...field} 
                            disabled={!isEmailVerified}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting || !isEmailVerified}
                    className={`w-full font-black rounded-full py-6 text-lg transition-all shadow-lg ${
                      isEmailVerified 
                        ? "bg-brand-lime text-brand-dark hover:bg-brand-lime/90 cursor-pointer" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {form.formState.isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                  </Button>
                  {!isEmailVerified && (
                    <p className="text-center text-xs font-bold uppercase text-brand-dark/40 tracking-widest">
                      * Verifica tu email para habilitar el envío
                    </p>
                  )}
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
              <motion.h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-dark uppercase tracking-tight text-center" variants={fadeIn}>
                <span className="text-brand-lime uppercase tracking-widest text-xs sm:text-sm font-black block mb-1 sm:mb-2 text-center">CONTACTO</span>
                Vías de comunicación
              </motion.h2>
              <motion.p className="text-brand-lime font-black uppercase tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center" variants={fadeIn}>(Mensaje)</motion.p>
            </motion.div>

            {/* 3. Vías de Comunicación Detalladas */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <motion.div className="space-y-6" variants={fadeIn}>
                <div className="p-6 bg-brand-lime/5 border-l-4 border-brand-lime rounded-r-2xl">
                  <p className="font-black uppercase text-xs tracking-widest text-brand-dark/50 mb-1 text-center sm:text-left">EMAIL</p>
                  <p className="text-lg sm:text-xl font-bold text-brand-dark text-center sm:text-left">info@easyusallc.com</p>
                </div>
              </motion.div>
              <motion.div className="space-y-6" variants={fadeIn}>
                <div className="p-6 bg-brand-lime/5 border-l-4 border-brand-lime rounded-r-2xl">
                  <p className="font-black uppercase text-xs tracking-widest text-brand-dark/50 mb-1 text-center sm:text-left">WHATSAPP</p>
                  <p className="text-lg sm:text-xl font-bold text-brand-dark text-center sm:text-left">+34 614 916 910</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <HelpSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
