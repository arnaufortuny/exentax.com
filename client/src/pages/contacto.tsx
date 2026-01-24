import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, ShieldCheck, MessageCircle, Info, Mail, User, Phone, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  nombre: z.string().min(1, "Dinos tu nombre"),
  apellido: z.string().min(1, "Dinos tu apellido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  subject: z.string().min(1, "Selecciona un motivo"),
  mensaje: z.string().min(1, "Cuéntanos un poco más"),
  otp: z.string().min(1, "Verificación requerida"),
  dataProcessingConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
  termsConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
});

const SUBJECT_OPTIONS = [
  "Crear una LLC",
  "Pack de mantenimiento",
  "Disolver una LLC",
  "Banca / Stripe",
  "Tengo una duda general",
  "Otro"
];

export default function Contacto() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      subject: "",
      mensaje: "",
      otp: "",
      dataProcessingConsent: false,
      termsConsent: false,
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setIsSubmitted(true);
    if (params.get("subject")) form.setValue("subject", params.get("subject") as string);
  }, [form]);

  const sendOtp = async () => {
    const email = form.getValues("email");
    if (!email || !email.includes("@")) {
      toast({ title: "Email inválido", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/contact/send-otp", { email });
      setIsOtpSent(true);
      toast({ title: "Código enviado", description: "Revisa tu email" });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    const email = form.getValues("email");
    const otp = form.getValues("otp");
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/contact/verify-otp", { email, otp });
      setIsOtpVerified(true);
      toast({ title: "Email verificado", variant: "success" });
    } catch (err) {
      toast({ title: "Código incorrecto", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isOtpVerified) {
      toast({ title: "Verificación requerida", description: "Verifica tu email primero" });
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/contact", values);
      setIsSubmitted(true);
      toast({ title: "Mensaje enviado", variant: "success" });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el mensaje", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-32 pb-16 px-4 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-primary">¡Mensaje recibido!</h1>
            <p className="text-lg md:text-xl font-medium text-foreground/70 leading-relaxed">
              Hemos recibido tu consulta. Un experto de nuestro equipo la revisará y te contactará en menos de 24-48h laborables.
            </p>
            <Button onClick={() => (window.location.href = "/")} className="bg-primary text-primary-foreground font-black px-10 py-7 rounded-full text-lg hover:scale-105 active:scale-95 transition-all"> Volver al inicio </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar />
      <main className="pt-24 pb-16 w-full max-w-4xl mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-primary leading-none">
            CONTACTO
          </h1>
          <p className="text-lg md:text-xl font-medium text-foreground/60 max-w-2xl mx-auto">
            Contactanos (Siempre listos para ayudarte)
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="nombre" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-primary flex items-center gap-2">
                        <User className="w-3 h-3 text-[#6EDC8A]" /> Nombre:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30" placeholder="Tu nombre" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="apellido" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-primary flex items-center gap-2">
                        <User className="w-3 h-3 text-[#6EDC8A]" /> Apellido:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30" placeholder="Tu apellido" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-primary flex items-center gap-2">
                        <Mail className="w-3 h-3 text-[#6EDC8A]" /> Email:
                      </FormLabel>
                      <FormControl><Input {...field} type="email" inputMode="email" disabled={isOtpVerified} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30" placeholder="email@ejemplo.com" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telefono" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-primary flex items-center gap-2">
                        <Phone className="w-3 h-3 text-[#6EDC8A]" /> Teléfono (opcional):
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30" placeholder="+34..." /></FormControl>
                      <FormDescription className="text-[10px] font-bold text-primary/40">Solo si prefieres WhatsApp</FormDescription>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-xs font-bold text-primary flex items-center gap-2">
                      <HelpCircle className="w-3 h-3 text-[#6EDC8A]" /> Motivo de tu mensaje:
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {SUBJECT_OPTIONS.map((opt) => (
                          <label key={opt} className={`flex items-center gap-3 p-4 rounded-full border cursor-pointer transition-all active:scale-95 ${field.value === opt ? 'border-[#6EDC8A] bg-[#6EDC8A]/5' : 'border-gray-200 bg-white hover:border-[#6EDC8A]/50'}`}>
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${field.value === opt ? 'border-[#6EDC8A]' : 'border-gray-200'}`}>
                              {field.value === opt && <div className="w-2 h-2 rounded-full bg-[#6EDC8A]" />}
                            </div>
                            <span className="font-bold text-xs md:text-sm text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="mensaje" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-primary flex items-center gap-2">
                      <MessageCircle className="w-3 h-3 text-[#6EDC8A]" /> Tu mensaje:
                    </FormLabel>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[160px] p-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30" placeholder="Cuéntanos tu situación con total libertad. No hace falta que uses palabras técnicas." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="bg-[#6EDC8A]/5 p-6 md:p-8 rounded-[2rem] border border-[#6EDC8A]/20 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Info className="w-12 h-12 text-[#6EDC8A]" />
                  </div>
                  <h3 className="text-primary font-bold text-sm">Nota tranquilizadora</h3>
                  <p className="text-sm md:text-base font-medium text-primary/80 leading-relaxed">
                    Leemos personalmente todos los mensajes y respondemos lo antes posible. Si vemos que una LLC no es la mejor opción para ti, también te lo diremos.
                  </p>
                </div>

                {!isOtpVerified && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                      {!isOtpSent ? (
                        <Button type="button" onClick={sendOtp} disabled={isLoading} className="w-full md:w-auto bg-[#6EDC8A] text-primary font-bold px-8 h-14 rounded-full active:scale-95 transition-all shadow-lg shadow-[#6EDC8A]/20">
                          {isLoading ? <Loader2 className="animate-spin" /> : "Enviar código de verificación"}
                        </Button>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                          <FormField control={form.control} name="otp" render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input {...field} className="rounded-full h-14 px-6 text-center text-xl font-bold border-gray-200 focus:border-[#6EDC8A] text-primary placeholder:text-primary/30" placeholder="Código (6 dígitos)" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <Button type="button" onClick={verifyOtp} disabled={isLoading} className="bg-[#6EDC8A] text-primary font-bold px-12 h-14 rounded-full active:scale-95 transition-all shadow-lg shadow-[#6EDC8A]/20">
                            {isLoading ? <Loader2 className="animate-spin" /> : "Verificar"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isOtpVerified && (
                  <div className="space-y-6 pt-4 border-t border-gray-100">
                    <div className="space-y-3">
                      <FormField control={form.control} name="dataProcessingConsent" render={({ field }) => (
                        <FormItem className="flex items-start gap-3 p-4 rounded-[1.5rem] border border-gray-200 bg-white hover:border-[#6EDC8A]/30 cursor-pointer transition-all">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-200 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" /></FormControl>
                          <span className="text-[10px] md:text-xs font-bold text-primary">Acepto el tratamiento de mis datos para poder responder a mi solicitud.</span>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="termsConsent" render={({ field }) => (
                        <FormItem className="flex items-start gap-3 p-4 rounded-[1.5rem] border border-gray-200 bg-white hover:border-[#6EDC8A]/30 cursor-pointer transition-all">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-200 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" /></FormControl>
                          <span className="text-[10px] md:text-xs font-bold text-primary">He leído y acepto los términos del servicio y la política de privacidad.</span>
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-[#6EDC8A] text-primary font-black py-8 rounded-full text-lg md:text-xl tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-[#6EDC8A]/20">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Enviar mensaje"}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </motion.div>
        </div>
      </main>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
