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
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  "Constituir una LLC",
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
      await apiRequest("POST", "/api/messages", {
        name: `${values.nombre} ${values.apellido}`,
        email: values.email,
        subject: values.subject,
        content: values.mensaje
      });
      setIsSubmitted(true);
      toast({ title: "Mensaje enviado", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el mensaje", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const isUrlSubmitted = params.get("success") === "true";
  const successType = params.get("type");

  if (isSubmitted || isUrlSubmitted) {
    const isLLC = successType === "llc";
    const isMaintenance = successType === "maintenance";
    
    return (
      <div className="min-h-screen bg-white font-sans selection:bg-[#6EDC8A] selection:text-black">
        <Navbar />
        <main className="pt-24 sm:pt-32 pb-16 px-4 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 w-full"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#6EDC8A] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#6EDC8A]/20">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-black  leading-tight">
                {isLLC ? "¡Solicitud de LLC Recibida!" : isMaintenance ? "¡Pack de Mantenimiento Confirmado!" : "¡Mensaje recibido!"}
              </h1>
              <div className="h-1.5 w-24 bg-[#6EDC8A] mx-auto rounded-full" />
            </div>

            <div className="bg-gray-50 border border-gray-100 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-6 shadow-sm">
              <p className="text-xl sm:text-2xl font-bold text-black leading-tight">
                {isLLC || isMaintenance 
                  ? "Tu solicitud se ha procesado correctamente." 
                  : "Hemos recibido tu consulta correctamente."}
              </p>
              <div className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto space-y-4">
                <p>
                  Un experto de nuestro equipo revisará los detalles y te contactará personalmente en un plazo de <span className="text-black font-bold">24-48h laborables</span>.
                </p>
                {(isLLC || isMaintenance) && (
                  <p className="text-sm sm:text-base bg-white p-4 rounded-2xl border border-gray-100">
                    Te hemos enviado un correo de confirmación con los siguientes pasos y la copia de tu solicitud.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                onClick={() => (window.location.href = "/")} 
                className="bg-[#6EDC8A] text-black hover:bg-[#5bc979] font-bold px-8 sm:px-12 py-6 sm:py-8 rounded-full text-lg sm:text-xl transition-all shadow-lg active:scale-95 w-full sm:w-auto"
              > 
                Volver al inicio 
              </Button>
              <a 
                href="https://wa.me/34614916910" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button 
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-black hover:text-primary font-bold px-8 sm:px-12 py-6 sm:py-8 rounded-full text-lg sm:text-xl transition-all w-full shadow-lg active:scale-95"
                > 
                  WhatsApp Directo
                </Button>
              </a>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar />
      <main className="pt-20 pb-16 w-full max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 sm:mb-10 flex flex-col items-center justify-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary  tracking-tight text-center">
            <span className="text-accent  tracking-widest text-xs sm:text-sm font-bold block mb-2 text-center">CONTACTO</span>
            Contactanos
          </h2>
          <p className="hidden sm:block text-accent font-bold  tracking-wide text-base sm:text-lg mt-1 sm:mt-2 text-center">(Siempre listos para ayudarte)</p>
        </div>

        <div className="grid grid-cols-1 gap-12 mt-12 sm:mt-16">
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-0">
                  <FormField control={form.control} name="nombre" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                        <User className="w-5 h-5 text-[#6EDC8A]" /> Nombre:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-lg" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="apellido" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                        <User className="w-5 h-5 text-[#6EDC8A]" /> Apellido:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-lg" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-0">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#6EDC8A]" /> Email:
                      </FormLabel>
                      <FormControl><Input {...field} type="email" inputMode="email" disabled={isOtpVerified} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-lg" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telefono" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                        <Phone className="w-5 h-5 text-[#6EDC8A]" /> Teléfono:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-lg" /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem className="space-y-4 px-4 sm:px-0">
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#6EDC8A]" /> Motivo de tu mensaje:
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {SUBJECT_OPTIONS.map((opt) => (
                          <label key={opt} className={`flex items-center gap-3 p-4 rounded-full border cursor-pointer transition-all active:scale-95 ${field.value === opt ? 'border-[#6EDC8A] bg-[#6EDC8A]/5' : 'border-gray-200 bg-white hover:border-[#6EDC8A]/50'}`}>
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${field.value === opt ? 'border-[#6EDC8A]' : 'border-gray-200'}`}>
                              {field.value === opt && <div className="w-2 h-2 rounded-full bg-[#6EDC8A]" />}
                            </div>
                            <span className="font-bold text-xs md:text-sm text-primary tracking-tight">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="mensaje" render={({ field }) => (
                  <FormItem className="px-4 sm:px-0">
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-[#6EDC8A]" /> Tu mensaje:
                    </FormLabel>
                    <FormControl><Textarea {...field} className="rounded-[1.5rem] min-h-[160px] p-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-lg" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="mx-4 sm:mx-0">
                  <div className="bg-[#6EDC8A]/10 p-6 md:p-8 rounded-[2rem] border-2 border-[#6EDC8A]/30 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                      <Info className="w-16 h-16 text-[#6EDC8A]" />
                    </div>
                    <h3 className="text-primary font-bold text-sm md:text-base  tracking-tight flex items-center gap-2">
                      Nota tranquilizadora
                    </h3>
                    <p className="text-sm md:text-base font-medium text-primary/80 leading-relaxed">
                      Leemos personalmente todos los mensajes y respondemos lo antes posible. Si vemos que una LLC no es la mejor opción para ti, también te lo diremos.
                    </p>
                  </div>
                </div>

                {!isOtpVerified && (
                  <div className="space-y-4 pt-4 px-4 sm:px-0">
                    <div className="flex flex-col md:flex-row gap-4">
                      {!isOtpSent ? (
                        <Button type="button" onClick={sendOtp} disabled={isLoading} style={{ backgroundColor: '#6EDC8A' }} className="w-full md:w-auto text-primary hover:opacity-90 font-bold px-8 h-14 rounded-full active:scale-95 transition-all shadow-lg shadow-[#6EDC8A]/20">
                          {isLoading ? <Loader2 className="animate-spin" /> : "Enviar código de verificación"}
                        </Button>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                          <FormField control={form.control} name="otp" render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input {...field} className="rounded-full h-14 px-6 text-center text-2xl font-bold border-gray-200 focus:border-[#6EDC8A] text-primary placeholder:text-primary/30" placeholder="Código (6 dígitos)" /></FormControl>
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
                  <div className="space-y-6 pt-4 px-4 sm:px-0">
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
          </div>
        </div>

        {/* Otras vías de contacto */}
        <div className="mt-24 pt-16">
          <div className="text-center mb-10 flex flex-col items-center justify-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primary  tracking-tight text-center">
              <span className="text-accent  tracking-widest text-xs sm:text-sm font-bold block mb-0 text-center">OTRAS VÍAS DE CONTACTO</span>
              Escríbenos, te esperamos!
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a 
              href="https://wa.me/34614916910" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 p-5 rounded-full hover:bg-accent/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.475-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.631 1.436h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-primary">+34 614 91 69 10</p>
              </div>
            </a>

            <a 
              href="mailto:info@easyusllc.com" 
              className="flex items-center justify-center gap-4 p-5 rounded-full hover:bg-accent/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6EDC8A] group-hover:scale-105 transition-transform shadow-sm">
                <Mail className="w-7 h-7" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-primary">info@easyusllc.com</p>
              </div>
            </a>
          </div>
        </div>
      </main>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
