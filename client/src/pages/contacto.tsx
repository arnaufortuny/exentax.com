import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Loader2, CheckCircle2, Info, Mail, User, Phone, MessageSquare, HelpCircle, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  nombre: z.string().min(1, "Dinos tu nombre"),
  apellido: z.string().min(1, "Dinos tu apellido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  subject: z.string().min(1, "Selecciona un motivo"),
  mensaje: z.string().min(1, "Cuéntanos un poco más"),
  otp: z.string().optional(),
  dataProcessingConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
  termsConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
});

type FormValues = z.infer<typeof formSchema>;

const SUBJECT_OPTIONS = [
  "Constituir una LLC",
  "Pack de mantenimiento",
  "Disolver una LLC",
  "Banca / Stripe",
  "Tengo una duda general",
  "Otro"
];

export default function Contacto() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedMessageId, setSubmittedMessageId] = useState<number | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
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
    if (isAuthenticated && user) {
      form.reset({
        ...form.getValues(),
        nombre: user.firstName || "",
        apellido: user.lastName || "",
        email: user.email || "",
        telefono: user.phone || "",
      });
      if (user.emailVerified) {
        setIsOtpVerified(true);
      }
    }
  }, [isAuthenticated, user, form]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setIsSubmitted(true);
    if (params.get("subject")) form.setValue("subject", params.get("subject") as string);
  }, [form]);

  const nextStep = async () => {
    const stepsValidation: Record<number, (keyof FormValues)[]> = {
      0: ["nombre"],
      1: ["apellido"],
      2: ["email"],
      3: [],
      4: ["subject"],
      5: ["mensaje"],
    };

    const fieldsToValidate = stepsValidation[step];
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (step === 5) {
      if (isOtpVerified) setStep(7);
      else setStep(6);
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

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
      setStep(7);
    } catch (err) {
      toast({ title: "Código incorrecto", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!isOtpVerified) {
      toast({ title: "Verificación requerida", description: "Verifica tu email primero" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/messages", {
        name: `${values.nombre} ${values.apellido}`,
        email: values.email,
        phone: values.telefono,
        subject: values.subject,
        content: values.mensaje
      });
      const data = await response.json();
      setSubmittedMessageId(data.id);
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
  const urlOrderId = params.get("orderId");
  const urlTicketId = params.get("ticket");

  if (isSubmitted || isUrlSubmitted) {
    const isLLC = successType === "llc";
    const isMaintenance = successType === "maintenance";
    
    return (
      <div className="min-h-screen bg-white font-sans selection:bg-[#6EDC8A] selection:text-black">
        <Navbar />
        <main className="pt-20 sm:pt-28 pb-12 px-4 flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <div className="space-y-5 sm:space-y-6 w-full">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#6EDC8A] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#6EDC8A]/20">
              <CheckCircle2 className="w-7 h-7 sm:w-10 sm:h-10 text-black" />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-black leading-tight">
                {isLLC ? "¡Solicitud Recibida!" : isMaintenance ? "¡Mantenimiento Confirmado!" : "¡Mensaje recibido!"}
              </h1>
              <div className="h-1 w-16 sm:w-20 bg-[#6EDC8A] mx-auto rounded-full" />
            </div>

            {(submittedMessageId || urlTicketId || urlOrderId) && (
              <div className="bg-white border-2 border-[#6EDC8A] px-4 py-3 sm:px-6 sm:py-4 rounded-xl inline-block">
                <span className="text-[10px] sm:text-xs font-black text-gray-500 tracking-widest uppercase">
                  {urlOrderId ? "Número de Pedido" : "Número de Ticket"}
                </span>
                <p className="text-xl sm:text-2xl font-black text-black">
                  {urlOrderId || submittedMessageId || urlTicketId}
                </p>
              </div>
            )}
            
            <div className="space-y-3 sm:space-y-4">
              <p className="text-base sm:text-lg font-black text-black leading-tight">
                {isLLC || isMaintenance 
                  ? "Solicitud procesada correctamente." 
                  : "Consulta recibida correctamente."}
              </p>
              <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-xl mx-auto">
                Te contactaremos en <span className="text-black font-black">24-48h laborables</span>.
              </p>
              {(submittedMessageId || urlTicketId) && !urlOrderId && (
                <p className="text-xs sm:text-sm bg-white p-3 rounded-xl border border-gray-100 max-w-md mx-auto">
                  Guarda tu ticket <span className="font-black text-black">{submittedMessageId || urlTicketId}</span> para seguimiento.
                </p>
              )}
              {(isLLC || isMaintenance) && (
                <p className="text-xs sm:text-sm bg-white p-3 rounded-xl border border-gray-100 max-w-md mx-auto">
                  Recibirás un correo con los siguientes pasos.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <Link href="/">
                <Button 
                  className="bg-accent text-black font-black px-6 sm:px-10 rounded-full text-base sm:text-lg shadow-lg w-full sm:w-auto"
                  size="default"
                  data-testid="button-home"
                > 
                  Volver al inicio 
                </Button>
              </Link>
              <a 
                href="https://wa.me/34614916910" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button 
                  variant="outline"
                  className="border-2 border-black text-black font-black px-6 sm:px-10 rounded-full text-base sm:text-lg transition-all w-full"
                  data-testid="button-whatsapp"
                > 
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-5 sm:px-6 md:px-8">
        <h1 className="text-3xl md:text-4xl font-black mb-4 text-primary leading-tight text-left">
          <span className="text-accent">Contáctanos</span>
        </h1>
        <p className="text-muted-foreground font-medium mb-8">Estamos aquí para ayudarte</p>

        <div>
          <div className="space-y-6">
            <Form {...form}>
              <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                
                {step === 0 && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <User className="w-6 h-6 text-accent" /> 1️⃣ ¿Cómo te llamas?
                    </h2>
                    <FormDescription>Tu nombre de pila</FormDescription>
                    <FormField control={form.control} name="nombre" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary">Nombre:</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  data-testid="input-nombre" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" onClick={nextStep} className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all" data-testid="button-next-0">Siguiente</Button>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <User className="w-6 h-6 text-accent" /> 2️⃣ ¿Y tu apellido?
                    </h2>
                    <FormField control={form.control} name="apellido" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary">Apellido:</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg" placeholder="Tu apellido" data-testid="input-apellido" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-black/20 active:scale-95 transition-all">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all" data-testid="button-next-1">Siguiente</Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <Mail className="w-6 h-6 text-accent" /> 3️⃣ Tu email
                    </h2>
                    <FormDescription>Para poder responderte</FormDescription>
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary">Email:</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" inputMode="email" className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-black/20 active:scale-95 transition-all">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all" data-testid="button-next-2">Siguiente</Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <Phone className="w-6 h-6 text-accent" /> 4️⃣ Teléfono (opcional)
                    </h2>
                    <FormDescription>Si prefieres que te llamemos</FormDescription>
                    <FormField control={form.control} name="telefono" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary">Teléfono:</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" inputMode="tel" className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  data-testid="input-telefono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-black/20 active:scale-95 transition-all">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all" data-testid="button-next-3">Siguiente</Button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <HelpCircle className="w-6 h-6 text-accent" /> 5️⃣ ¿En qué podemos ayudarte?
                    </h2>
                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm md:text-base font-black text-primary">Motivo:</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {SUBJECT_OPTIONS.map((opt) => (
                              <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-black/20 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                                <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-[#6EDC8A]" />
                                <span className="font-black text-primary text-sm md:text-base">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-black/20 active:scale-95 transition-all">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all" data-testid="button-next-4">Siguiente</Button>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-accent" /> 6️⃣ Cuéntanos más
                    </h2>
                    <FormDescription>Describe tu consulta o situación</FormDescription>
                    <FormField control={form.control} name="mensaje" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary">Tu mensaje:</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="rounded-2xl min-h-[150px] px-6 py-4 border-black/20 focus:border-[#6EDC8A] transition-all font-medium text-primary placeholder:text-primary/30 text-base"  data-testid="input-mensaje" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="bg-[#6EDC8A]/10 p-6 rounded-2xl border border-[#6EDC8A]/30">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-[#6EDC8A] mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-primary/80">
                          Leemos personalmente todos los mensajes y respondemos lo antes posible. Si vemos que una LLC no es la mejor opción para ti, también te lo diremos.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-black/20 active:scale-95 transition-all">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all" data-testid="button-next-5">Siguiente</Button>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-accent" /> 7️⃣ Verifica tu email
                    </h2>
                    <FormDescription>Te enviamos un código de 6 dígitos a tu email</FormDescription>
                    
                    {!isOtpSent ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Email: <span className="font-black text-primary">{form.getValues("email")}</span></p>
                        <Button 
                          type="button" 
                          onClick={sendOtp} 
                          disabled={isLoading} 
                          className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all"
                          data-testid="button-send-otp"
                        >
                          {isLoading ? <Loader2 className="animate-spin" /> : "Enviar código de verificación"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FormField control={form.control} name="otp" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm md:text-base font-black text-primary">Código:</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="rounded-full h-14 px-6 text-center text-2xl font-black border-black/20 focus:border-[#6EDC8A] text-primary placeholder:text-primary/30 tracking-[0.5em]" 
                                 
                                maxLength={6}
                                data-testid="input-otp"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button 
                          type="button" 
                          onClick={verifyOtp} 
                          disabled={isLoading} 
                          className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all"
                          data-testid="button-verify-otp"
                        >
                          {isLoading ? <Loader2 className="animate-spin" /> : "Verificar código"}
                        </Button>
                        <button type="button" onClick={sendOtp} className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                          ¿No recibiste el código? Reenviar
                        </button>
                      </div>
                    )}
                    
                    <Button type="button" variant="outline" onClick={prevStep} className="w-full rounded-full h-14 font-black border-black/20 active:scale-95 transition-all mt-4">Atrás</Button>
                  </div>
                )}

                {step === 7 && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-accent" /> Confirmar y enviar
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                      <p className="text-sm"><span className="font-black">Nombre:</span> {form.getValues("nombre")} {form.getValues("apellido")}</p>
                      <p className="text-sm"><span className="font-black">Email:</span> {form.getValues("email")}</p>
                      {form.getValues("telefono") && <p className="text-sm"><span className="font-black">Teléfono:</span> {form.getValues("telefono")}</p>}
                      <p className="text-sm"><span className="font-black">Motivo:</span> {form.getValues("subject")}</p>
                      <p className="text-sm"><span className="font-black">Mensaje:</span> {form.getValues("mensaje")}</p>
                    </div>

                    <div className="space-y-4">
                      <FormField control={form.control} name="dataProcessingConsent" render={({ field }) => (
                        <FormItem className="flex items-start gap-3">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-primary/80 leading-relaxed cursor-pointer">
                            Acepto el tratamiento de mis datos para poder responder a mi solicitud.
                          </FormLabel>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="termsConsent" render={({ field }) => (
                        <FormItem className="flex items-start gap-3">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-primary/80 leading-relaxed cursor-pointer">
                            He leído y acepto los <a href="/legal/terminos" className="text-accent hover:underline">términos del servicio</a> y la <a href="/legal/privacidad" className="text-accent hover:underline">política de privacidad</a>.
                          </FormLabel>
                        </FormItem>
                      )} />
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(5)} className="flex-1 rounded-full h-14 font-black border-black/20 active:scale-95 transition-all">Atrás</Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading || !form.getValues("dataProcessingConsent") || !form.getValues("termsConsent")} 
                        className="flex-[2] bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all disabled:opacity-50"
                        data-testid="button-submit"
                      >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Enviar mensaje"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-24 pt-16">
          <div className="text-center mb-10 flex flex-col items-center justify-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight text-center">
              <span className="text-accent tracking-widest text-xs sm:text-sm font-black block mb-0 text-center">OTRAS VÍAS DE CONTACTO</span>
              Escríbenos, te esperamos!
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a 
              href="https://wa.me/34614916910" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 p-5 rounded-full hover:bg-accent/5 transition-all group"
              data-testid="link-whatsapp"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.475-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.631 1.436h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-primary">+34 614 91 69 10</p>
              </div>
            </a>

            <a 
              href="mailto:info@easyusllc.com" 
              className="flex items-center justify-center gap-4 p-5 rounded-full hover:bg-accent/5 transition-all group"
              data-testid="link-email"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6EDC8A] group-hover:scale-105 transition-transform shadow-sm">
                <Mail className="w-7 h-7" />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-primary">info@easyusllc.com</p>
              </div>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
