import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Info } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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
    if (step === 0) fields = ["ownerFullName", "ownerEmail", "ownerPhone", "ownerAddress"];
    else if (step === 1) fields = ["companyName", "companyNameOption2", "companyDescription"];
    
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
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="flex justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step >= i ? "bg-brand-lime text-brand-dark" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > i ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-[10px] uppercase font-black mt-2 tracking-widest ${
                  step >= i ? "text-brand-dark" : "text-gray-400"
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          <Card className="border-0 shadow-xl overflow-hidden rounded-3xl">
            <CardContent className="p-8 sm:p-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h2 className="text-2xl font-black uppercase tracking-tight text-brand-dark mb-6 text-center">Datos del Propietario</h2>
                        <FormField
                          control={form.control}
                          name="ownerFullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-xs uppercase tracking-widest text-gray-500">Nombre Completo</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-200 h-12" placeholder="Tal cual aparece en tu pasaporte" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ownerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-xs uppercase tracking-widest text-gray-500">Email de contacto</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} type="email" className="rounded-xl border-gray-200 h-12" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="ownerPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-xs uppercase tracking-widest text-gray-500">Teléfono (WhatsApp)</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-200 h-12" placeholder="+34..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ownerAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-xs uppercase tracking-widest text-gray-500">Dirección de residencia</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-200 h-12" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="ownerBirthDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-xs uppercase tracking-widest text-gray-500">Fecha de Nacimiento</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} type="date" className="rounded-xl border-gray-200 h-12" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h2 className="text-2xl font-black uppercase tracking-tight text-brand-dark mb-6 text-center">Detalles de la LLC</h2>
                        <div className="p-4 bg-brand-lime/10 rounded-2xl border border-brand-lime/20 flex gap-3 mb-6">
                          <Info className="w-5 h-5 text-brand-dark shrink-0" />
                          <p className="text-sm text-brand-dark/80 font-medium">Estado seleccionado: <span className="font-black">{stateFromUrl}</span></p>
                        </div>
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-xs uppercase tracking-widest text-gray-500">Nombre deseado (Opción 1)</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-200 h-12" placeholder="Ej: Mi Empresa LLC" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companyNameOption2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-xs uppercase tracking-widest text-gray-500">Nombre alternativo (Opción 2)</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-200 h-12" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companyDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-xs uppercase tracking-widest text-gray-500">Actividad de la empresa</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-200 h-12" placeholder="Ej: Marketing Digital, Desarrollo Software..." /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 text-center"
                      >
                        <div className="w-16 h-16 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-brand-dark" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-brand-dark">Verifica tu identidad</h2>
                        <p className="text-muted-foreground">Hemos enviado un código a <span className="font-bold text-brand-dark">{form.getValues("ownerEmail")}</span></p>
                        
                        {!isOtpSent ? (
                          <Button type="button" onClick={sendOtp} className="bg-brand-dark text-white rounded-full px-8 h-12 font-black uppercase tracking-widest text-xs">
                            Enviar Código
                          </Button>
                        ) : (
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="otp"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} maxLength={6} className="text-center text-2xl font-black tracking-[0.5em] h-16 rounded-2xl border-2 border-brand-lime" placeholder="000000" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="button" onClick={verifyOtp} disabled={isEmailVerified} className="w-full bg-brand-lime text-brand-dark font-black rounded-xl h-12">
                              {isEmailVerified ? "Verificado ✓" : "Verificar Código"}
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h2 className="text-2xl font-black uppercase tracking-tight text-brand-dark mb-6 text-center">Resumen de solicitud</h2>
                        <div className="bg-gray-50 rounded-2xl p-6 space-y-3 border border-gray-100">
                          <p className="text-sm"><strong>Propietario:</strong> {form.getValues("ownerFullName")}</p>
                          <p className="text-sm"><strong>Email:</strong> {form.getValues("ownerEmail")}</p>
                          <p className="text-sm"><strong>Estado:</strong> {form.getValues("state")}</p>
                          <p className="text-sm"><strong>Nombre LLC:</strong> {form.getValues("companyName")}</p>
                        </div>
                        <Button type="submit" className="w-full bg-brand-lime text-brand-dark font-black rounded-xl h-14 text-lg shadow-lg hover:bg-brand-lime/90 transform transition-all active:scale-95">
                          Finalizar Solicitud
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between pt-8 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={prevStep}
                      disabled={step === 0}
                      className="text-gray-400 font-bold uppercase tracking-widest text-[10px]"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
                    </Button>
                    {step < 3 && (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-brand-dark text-white rounded-full px-8 h-12 font-black uppercase tracking-widest text-xs"
                      >
                        Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
