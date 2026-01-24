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
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-primary">¡Mensaje recibido!</h1>
            <p className="text-lg md:text-xl font-medium text-foreground/70 leading-relaxed">
              Hemos recibido tu consulta. Un experto de nuestro equipo la revisará y te contactará en menos de 24-48h laborables.
            </p>
            <Button onClick={() => (window.location.href = "/")} className="bg-primary text-primary font-bold px-10 py-7 rounded-full text-lg hover:scale-105 active:scale-95 transition-all"> Volver al inicio </Button>
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
          className="text-center mb-2 sm:mb-10 flex flex-col items-center justify-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tight text-center">
            <span className="text-accent uppercase tracking-widest text-xs sm:text-sm font-black block mb-0 text-center">CONTACTO</span>
            Contactanos
          </motion.h2>
          <motion.p className="hidden sm:block text-accent font-black uppercase tracking-wide text-base sm:text-lg mt-0.5 text-center">(Siempre listos para ayudarte)</motion.p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="nombre" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-lg font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                        <User className="w-5 h-5 text-[#6EDC8A]" /> Nombre:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-11 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="apellido" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-lg font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                        <User className="w-5 h-5 text-[#6EDC8A]" /> Apellido:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-11 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-lg font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                        <Mail className="w-5 h-5 text-[#6EDC8A]" /> Email:
                      </FormLabel>
                      <FormControl><Input {...field} type="email" inputMode="email" disabled={isOtpVerified} className="rounded-full h-11 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telefono" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-lg font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                        <Phone className="w-5 h-5 text-[#6EDC8A]" /> Teléfono:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-11 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-sm md:text-lg font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                      <HelpCircle className="w-5 h-5 text-[#6EDC8A]" /> Motivo de tu mensaje:
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {SUBJECT_OPTIONS.map((opt) => (
                          <label key={opt} className={`flex items-center gap-2 p-2 px-4 rounded-full border cursor-pointer transition-all active:scale-95 ${field.value === opt ? 'border-[#6EDC8A] bg-[#6EDC8A]/5' : 'border-gray-200 bg-white hover:border-[#6EDC8A]/50'}`}>
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${field.value === opt ? 'border-[#6EDC8A]' : 'border-gray-200'}`}>
                              {field.value === opt && <div className="w-2 h-2 rounded-full bg-[#6EDC8A]" />}
                            </div>
                            <span className="font-black text-xs md:text-sm text-primary tracking-tight">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="mensaje" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-lg font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                      <MessageCircle className="w-5 h-5 text-[#6EDC8A]" /> Tu mensaje:
                    </FormLabel>
                    <FormControl><Textarea {...field} className="rounded-[1rem] min-h-[100px] p-5 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="bg-[#6EDC8A]/5 p-6 md:p-8 rounded-[2rem] border border-[#6EDC8A]/20 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Info className="w-12 h-12 text-[#6EDC8A]" />
                  </div>
                  <h3 className="text-primary font-bold text-sm md:text-base">Nota tranquilizadora</h3>
                  <p className="text-sm md:text-base font-medium text-primary/80 leading-relaxed">
                    Leemos personalmente todos los mensajes y respondemos lo antes posible. Si vemos que una LLC no es la mejor opción para ti, también te lo diremos.
                  </p>
                </div>

                {!isOtpVerified && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                      {!isOtpSent ? (
                        <Button type="button" onClick={sendOtp} disabled={isLoading} className="w-full md:w-auto bg-[#6EDC8A] text-primary font-bold px-8 h-11 rounded-full active:scale-95 transition-all shadow-lg shadow-[#6EDC8A]/20">
                          {isLoading ? <Loader2 className="animate-spin" /> : "Enviar código de verificación"}
                        </Button>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                          <FormField control={form.control} name="otp" render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input {...field} className="rounded-full h-11 px-6 text-center text-2xl font-bold border-gray-200 focus:border-[#6EDC8A] text-primary placeholder:text-primary/30" placeholder="Código (6 dígitos)" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <Button type="button" onClick={verifyOtp} disabled={isLoading} className="bg-[#6EDC8A] text-primary font-bold px-12 h-11 rounded-full active:scale-95 transition-all shadow-lg shadow-[#6EDC8A]/20">
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
                    <Button type="submit" disabled={isLoading} className="w-full bg-[#6EDC8A] text-primary font-bold py-8 rounded-full text-lg md:text-xl  hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-[#6EDC8A]/20">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Enviar mensaje"}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </motion.div>
        </div>

        {/* Otras vías de contacto */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-24 pt-16 border-t border-gray-100"
        >
          <motion.div 
            className="text-center mb-10 flex flex-col items-center justify-center"
          >
            <motion.h2 className="text-xl md:text-3xl font-black text-primary uppercase tracking-tight text-center">
              <span className="text-accent uppercase tracking-widest text-[10px] sm:text-xs font-black block mb-0 text-center">OTRAS VIAS DE CONTACTO</span>
              Otras vías de contacto
            </motion.h2>
            <motion.p className="text-accent font-black uppercase tracking-wide text-xs sm:text-sm mt-0.5 text-center">(Escríbenos, te esperamos!)</motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <a 
              href="https://wa.me/34614916910" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-6 p-8 rounded-[2rem] bg-[#25D366]/5 border border-[#25D366]/30 hover:bg-[#25D366]/10 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-[#25D366]/20">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.475-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.631 1.436h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">WhatsApp</p>
                <p className="text-xl font-black text-[#25D366]">+34 614 91 69 10</p>
              </div>
            </a>

            <a 
              href="mailto:info@easyusllc.com" 
              className="flex items-center justify-center gap-6 p-8 rounded-[2rem] bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                <Mail className="w-8 h-8" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Email</p>
                <p className="text-xl font-black text-primary">info@easyusllc.com</p>
              </div>
            </a>
          </div>
        </motion.div>
      </main>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
