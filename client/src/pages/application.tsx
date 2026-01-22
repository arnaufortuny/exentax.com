import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Info, ShieldCheck, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HelpSection } from "@/components/layout/help-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertLlcApplicationSchema } from "@shared/schema";

// Custom schema to match both database and wizard UI
const formSchema = insertLlcApplicationSchema.extend({
  otp: z.string().length(6, "El código debe tener 6 dígitos"),
}).omit({ 
  orderId: true,
  requestCode: true,
  submittedAt: true,
  emailOtp: true,
  emailOtpExpires: true,
  emailVerified: true
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  { id: "owner", title: "Propietario" },
  { id: "company", title: "Empresa" },
  { id: "verification", title: "Verificación" },
  { id: "review", title: "Revisión" },
];

export default function ApplicationWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const stateFromUrl = params.get("state") || "New Mexico";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerAddress: "",
      companyName: "",
      companyNameOption2: "",
      state: stateFromUrl,
      companyDescription: "",
      status: "draft",
      otp: "",
      ownerBirthDate: "",
      ownerCity: "",
      ownerCountry: "",
      ownerProvince: "",
      ownerPostalCode: "",
      ownerIdNumber: "",
      ownerIdType: "Passport",
      idLater: false,
      dataProcessingConsent: true,
      ageConfirmation: true,
      designator: "LLC",
      businessCategory: "Services"
    },
  });

  // Create initial order/application if not exists
  useEffect(() => {
    async function init() {
      try {
        const productId = stateFromUrl.includes("Wyoming") ? 2 : stateFromUrl.includes("Delaware") ? 3 : 1;
        const res = await apiRequest("POST", "/api/orders", { productId });
        const data = await res.json();
        setAppId(data.application.id);
      } catch (err) {
        console.error("Error initializing application:", err);
      }
    }
    init();
  }, [stateFromUrl]);

  const nextStep = async () => {
    let fields: (keyof FormValues)[] = [];
    if (step === 0) fields = ["ownerFullName", "ownerEmail", "ownerPhone", "ownerAddress", "ownerBirthDate"];
    else if (step === 1) fields = ["companyName", "companyNameOption2", "companyDescription"];
    else if (step === 2) {
      if (!isEmailVerified) {
        toast({ title: "Verificación requerida", description: "Debes verificar tu email antes de continuar.", variant: "destructive" });
        return;
      }
    }
    
    const isValid = await form.trigger(fields);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const sendOtp = async () => {
    const email = form.getValues("ownerEmail");
    if (!email) return;
    try {
      await apiRequest("POST", `/api/llc/${appId}/send-otp`, { email });
      setIsOtpSent(true);
      toast({ title: "Código enviado", description: "Revisa tu bandeja de entrada." });
    } catch {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
    }
  };

  const verifyOtp = async () => {
    const otp = form.getValues("otp");
    try {
      await apiRequest("POST", `/api/llc/${appId}/verify-otp`, { otp });
      setIsEmailVerified(true);
      toast({ title: "Email verificado", variant: "success" });
    } catch {
      toast({ title: "Código incorrecto", variant: "destructive" });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEmailVerified) {
      toast({ title: "Verificación requerida", description: "Debes verificar tu email antes de enviar.", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("PUT", `/api/llc/${appId}`, { ...data, status: "submitted" });
      toast({ title: "¡Solicitud enviada!", description: "Nos pondremos en contacto contigo pronto.", variant: "success" });
      setLocation("/contacto?success=true");
    } catch {
      toast({ title: "Error", description: "Hubo un problema al enviar la solicitud.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="pt-32 pb-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="flex justify-between mb-12 relative px-2">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10" />
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  step > i ? "bg-brand-lime border-brand-lime text-brand-dark" : 
                  step === i ? "bg-white border-brand-lime text-brand-dark shadow-[0_0_15px_rgba(217,255,0,0.5)]" : 
                  "bg-white border-gray-200 text-gray-400"
                }`}>
                  {step > i ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-[9px] sm:text-[10px] uppercase font-black mt-3 tracking-widest transition-colors ${
                  step >= i ? "text-brand-dark" : "text-gray-400"
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden rounded-[2.5rem] bg-white border border-gray-100">
            <CardContent className="p-8 sm:p-14">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="text-center space-y-2 mb-8">
                          <h2 className="text-3xl font-black uppercase tracking-tight text-brand-dark">Datos Personales</h2>
                          <p className="text-muted-foreground text-sm font-medium">Información del propietario de la LLC</p>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="ownerFullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Nombre Completo (como en DNI/Pasaporte)</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 px-6 focus:border-brand-lime focus:ring-brand-lime transition-all font-medium" placeholder="Juan Pérez García" /></FormControl>
                              <FormMessage className="font-bold text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ownerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Email de contacto</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} type="email" className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 px-6 focus:border-brand-lime font-medium" placeholder="tu@email.com" /></FormControl>
                              <FormMessage className="font-bold text-xs" />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="ownerPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">WhatsApp</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 px-6 focus:border-brand-lime font-medium" placeholder="+34 000 000 000" /></FormControl>
                                <FormMessage className="font-bold text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ownerBirthDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Fecha Nacimiento</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} type="date" className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 px-6 focus:border-brand-lime font-medium" /></FormControl>
                                <FormMessage className="font-bold text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="ownerAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Dirección Completa</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 px-6 focus:border-brand-lime font-medium" placeholder="Calle, Número, Piso, Ciudad, País" /></FormControl>
                              <FormMessage className="font-bold text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="text-center space-y-2 mb-8">
                          <h2 className="text-3xl font-black uppercase tracking-tight text-brand-dark">Tu Nueva LLC</h2>
                          <p className="text-muted-foreground text-sm font-medium">Define los detalles de tu empresa</p>
                        </div>

                        <div className="p-5 bg-brand-lime/10 rounded-[1.5rem] border border-brand-lime/20 flex gap-4 mb-8">
                          <div className="w-10 h-10 bg-brand-lime rounded-full flex items-center justify-center shrink-0 shadow-sm">
                            <ShieldCheck className="w-5 h-5 text-brand-dark" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] uppercase font-black tracking-widest text-brand-dark/50">Estado Seleccionado</p>
                            <p className="text-lg font-black text-brand-dark">{stateFromUrl}</p>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Nombre Deseado (Prioridad 1)</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 px-6 focus:border-brand-lime font-medium uppercase" placeholder="MI EMPRESA LLC" /></FormControl>
                              <FormMessage className="font-bold text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companyNameOption2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Nombre Alternativo (Prioridad 2)</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 px-6 focus:border-brand-lime font-medium uppercase" placeholder="EMPRESA DIGITAL LLC" /></FormControl>
                              <FormMessage className="font-bold text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companyDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Actividad Principal</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 px-6 focus:border-brand-lime font-medium" placeholder="Ej: Servicios de Marketing, E-commerce, etc." /></FormControl>
                              <FormMessage className="font-bold text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8 text-center"
                      >
                        <div className="w-20 h-20 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Mail className="w-10 h-10 text-brand-dark" />
                        </div>
                        <div className="space-y-3">
                          <h2 className="text-3xl font-black uppercase tracking-tight text-brand-dark">Verificación</h2>
                          <p className="text-muted-foreground font-medium px-4">Hemos enviado un código de seguridad a <br/><span className="font-black text-brand-dark">{form.getValues("ownerEmail")}</span></p>
                        </div>
                        
                        {!isOtpSent ? (
                          <Button 
                            type="button" 
                            onClick={sendOtp} 
                            className="bg-brand-dark text-white rounded-full px-12 h-14 font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl"
                          >
                            Enviar Código OTP
                          </Button>
                        ) : (
                          <div className="space-y-6 max-w-sm mx-auto">
                            <FormField
                              control={form.control}
                              name="otp"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      value={field.value || ""} 
                                      maxLength={6} 
                                      className="text-center text-4xl font-black tracking-[0.5em] h-20 rounded-[1.5rem] border-4 border-brand-lime bg-white shadow-inner focus:ring-brand-lime" 
                                      placeholder="000000" 
                                    />
                                  </FormControl>
                                  <FormMessage className="font-bold text-xs" />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="button" 
                              onClick={verifyOtp} 
                              disabled={isEmailVerified} 
                              className={`w-full rounded-2xl h-14 font-black uppercase tracking-widest text-sm transition-all ${
                                isEmailVerified ? "bg-green-500 text-white" : "bg-brand-lime text-brand-dark hover:bg-brand-lime/90 shadow-lg"
                              }`}
                            >
                              {isEmailVerified ? "Verificado Correctamente ✓" : "Verificar Email"}
                            </Button>
                          </div>
                        )}
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paso obligatorio para continuar</p>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="text-center space-y-2 mb-8">
                          <h2 className="text-3xl font-black uppercase tracking-tight text-brand-dark">Revisión Final</h2>
                          <p className="text-muted-foreground text-sm font-medium">Confirma que toda la información es correcta</p>
                        </div>

                        <div className="space-y-4">
                          <div className="p-8 bg-gray-50/80 rounded-[2rem] border border-gray-100 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Propietario</p>
                                <p className="font-black text-brand-dark leading-tight">{form.getValues("ownerFullName")}</p>
                              </div>
                              <div className="space-y-1 text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Estado</p>
                                <p className="font-black text-brand-dark leading-tight">{form.getValues("state")}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email</p>
                                <p className="font-black text-brand-dark leading-tight">{form.getValues("ownerEmail")}</p>
                              </div>
                              <div className="space-y-1 text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">WhatsApp</p>
                                <p className="font-black text-brand-dark leading-tight">{form.getValues("ownerPhone")}</p>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-gray-200/50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Nombre LLC Deseado</p>
                              <div className="bg-brand-lime/20 p-4 rounded-xl border border-brand-lime/30">
                                <p className="font-black text-brand-dark uppercase tracking-tight text-lg">{form.getValues("companyName")}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 px-4">
                            <div className="w-5 h-5 rounded bg-brand-lime flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-brand-dark" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 leading-tight">Al confirmar, enviaremos tu solicitud oficial para procesamiento inmediato.</p>
                          </div>
                        </div>

                        <Button type="submit" className="w-full bg-brand-lime text-brand-dark font-black rounded-2xl h-16 text-xl shadow-[0_10px_30px_rgba(217,255,0,0.4)] hover:bg-brand-lime/90 transform transition-all hover:scale-[1.02] active:scale-95">
                          Confirmar y Enviar Solicitud
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between pt-10 border-t border-gray-50">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={prevStep}
                      disabled={step === 0}
                      className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-brand-dark transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1.5" /> Volver
                    </Button>
                    {step < 3 && (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-brand-dark text-white rounded-full px-10 h-14 font-black uppercase tracking-[0.2em] text-[11px] shadow-lg hover:bg-brand-dark/90 hover:scale-105 active:scale-95 transition-all"
                      >
                        Continuar <ChevronRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <HelpSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
