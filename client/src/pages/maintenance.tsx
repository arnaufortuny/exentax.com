import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Mail, Building2, Loader2, MessageCircle, Info } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMaintenanceApplicationSchema } from "@shared/schema";

const formSchema = insertMaintenanceApplicationSchema.extend({
  otp: z.string().length(6, "El código debe tener 6 dígitos"),
  subscribeNewsletter: z.boolean().default(false),
}).omit({ 
  orderId: true,
  requestCode: true,
  submittedAt: true,
  emailOtp: true,
  emailOtpExpires: true,
  emailVerified: true
});

type FormValues = z.infer<typeof formSchema>;

export default function MaintenanceApplication() {
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
      creationSource: "",
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
      companyName: "",
      state: stateFromUrl,
      ein: "",
      creationYear: "",
      bankAccount: "",
      paymentGateway: "",
      businessActivity: "",
      expectedServices: "",
      notes: "",
      status: "draft",
      otp: "",
      subscribeNewsletter: false
    },
  });

  useEffect(() => {
    async function init() {
      try {
        const productId = stateFromUrl.includes("Wyoming") ? 2 : stateFromUrl.includes("Delaware") ? 3 : 1;
        const res = await apiRequest("POST", "/api/maintenance/orders", { productId, state: stateFromUrl });
        const data = await res.json();
        setAppId(data.application.id);
      } catch (err) {
        console.error("Error initializing maintenance application:", err);
      }
    }
    init();
  }, [stateFromUrl]);

  const nextStep = async () => {
    const stepsValidation: Record<number, (keyof FormValues)[]> = {
      0: ["creationSource"],
      1: ["ownerFullName"],
      2: ["ownerEmail"],
      3: ["ownerPhone"],
      4: ["companyName"],
      5: ["state"],
      6: ["ein"],
      7: ["creationYear"],
      8: ["bankAccount"],
      9: ["paymentGateway"],
      10: ["businessActivity"],
      11: ["expectedServices"],
      12: ["notes"],
    };

    const fieldsToValidate = stepsValidation[Math.floor(step)];
    if (fieldsToValidate) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (step === 12) {
      if (isEmailVerified) setStep(14);
      else setStep(13);
    } else if (step === 13) {
      if (isEmailVerified) setStep(14);
      else toast({ title: "Verificación requerida", description: "Verifica tu email primero." });
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const sendOtp = async () => {
    const email = form.getValues("ownerEmail");
    try {
      await apiRequest("POST", `/api/maintenance/${appId}/send-otp`, { email });
      setIsOtpSent(true);
      toast({ title: "Código enviado" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const verifyOtp = async () => {
    const otp = form.getValues("otp");
    try {
      await apiRequest("POST", `/api/maintenance/${appId}/verify-otp`, { otp });
      setIsEmailVerified(true);
      toast({ title: "Email verificado", variant: "success" });
      setStep(14);
    } catch {
      toast({ title: "Código incorrecto", variant: "destructive" });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (data.subscribeNewsletter) {
        await apiRequest("POST", "/api/newsletter/subscribe", { email: data.ownerEmail });
      }
      await apiRequest("PUT", `/api/maintenance/${appId}`, { ...data, status: "submitted" });
      toast({ title: "Solicitud enviada", variant: "success" });
      setLocation("/contacto?success=true");
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-32 pb-16 max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-black uppercase mb-12 text-primary">Activar Pack de <span className="text-accent">Mantenimiento</span></h1>
        
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 text-left">1️⃣ ¿Tu LLC ya existe o la creamos nosotros?</h2>
                <FormDescription className="text-left">👉 Tranquilo, no te juzgamos</FormDescription>
                <FormField control={form.control} name="creationSource" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3 text-left">
                        {["Ya tengo una LLC", "La creé con Easy US LLC", "Aún no la tengo (me he adelantado 😅)"].map((opt) => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                            <span className="font-bold text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-accent text-primary font-black py-6 rounded-3xl">SIGUIENTE</Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">2️⃣ ¿Cómo te llamas?</h2>
                <FormDescription>El nombre real, el de tu madre, no el de Instagram</FormDescription>
                <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Nombre completo:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl h-14 px-6" placeholder="Tu nombre" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">3️⃣ Email de contacto</h2>
                <FormDescription>Aquí te escribiremos cosas importantes, no spam</FormDescription>
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Email:</FormLabel>
                    <FormControl><Input {...field} type="email" value={field.value || ""} className="rounded-2xl h-14 px-6" placeholder="email@ejemplo.com" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">4️⃣ WhatsApp (opcional pero recomendado)</h2>
                <FormDescription>Para avisos rápidos y salvarte de sustos fiscales</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Teléfono:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl h-14 px-6" placeholder="+34..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">5️⃣ Nombre legal de tu LLC</h2>
                <FormDescription>Tal y como aparece en los documentos oficiales</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Nombre de la LLC:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl h-14 px-6" placeholder="MI EMPRESA LLC" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">6️⃣ Estado donde está registrada</h2>
                <FormDescription>Cada estado juega a su propio juego</FormDescription>
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Estado:</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger className="rounded-2xl h-14 px-6"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="New Mexico">New Mexico</SelectItem><SelectItem value="Wyoming">Wyoming</SelectItem><SelectItem value="Delaware">Delaware</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">7️⃣ EIN de la LLC</h2>
                <FormDescription>Ese numerito que el IRS no olvida nunca</FormDescription>
                <FormField control={form.control} name="ein" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">EIN:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl h-14 px-6" placeholder="00-0000000" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">8️⃣ Año de constitución</h2>
                <FormDescription>Para saber desde cuándo existe la criatura</FormDescription>
                <FormField control={form.control} name="creationYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Año:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl h-14 px-6" placeholder="Ej: 2024" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 8 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">9️⃣ ¿Tienes cuenta bancaria activa?</h2>
                <FormDescription>No pasa nada si aún no, lo vemos contigo</FormDescription>
                <FormField control={form.control} name="bankAccount" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        {["Mercury", "Relay", "Otro banco", "Aún no tengo cuenta"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-4 h-4 accent-accent" />
                            <span className="font-bold text-sm text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 9 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">🔟 ¿Usas Stripe u otra pasarela de pago?</h2>
                <FormDescription>Opcional, pero nos da contexto</FormDescription>
                <FormField control={form.control} name="paymentGateway" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        {["Stripe", "PayPal", "Otra", "No todavía"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-4 h-4 accent-accent" />
                            <span className="font-bold text-sm text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 10 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣1️⃣ Tipo de actividad de la LLC</h2>
                <FormDescription>Explícalo como si se lo contaras a un amigo</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} value={field.value || ""} className="rounded-2xl min-h-[100px] p-4" placeholder="Cuéntanos a qué se dedica tu empresa..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 11 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣2️⃣ ¿Qué esperas del Pack de Mantenimiento?</h2>
                <FormDescription>Marca todo lo que te quite dolores de cabeza</FormDescription>
                <FormField control={form.control} name="expectedServices" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        {["Recordatorios fiscales", "Presentación de informes obligatorios", "Soporte y dudas durante el año", "Dormir tranquilo sabiendo que todo está en orden"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                            <Checkbox 
                              checked={field.value?.split(", ").includes(opt)}
                              onCheckedChange={(checked) => {
                                const current = field.value ? field.value.split(", ") : [];
                                const next = checked ? [...current, opt] : current.filter(v => v !== opt);
                                field.onChange(next.join(", "));
                              }}
                            />
                            <span className="font-bold text-sm text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 12 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣3️⃣ ¿Algo que debamos saber?</h2>
                <FormDescription>Este es tu espacio. Confesiones fiscales bienvenidas</FormDescription>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} value={field.value || ""} className="rounded-2xl min-h-[100px] p-4" placeholder="Cualquier detalle adicional..." /></FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 13 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">Verificación de Identidad</h2>
                {!isOtpSent ? (
                  <Button type="button" onClick={sendOtp} className="w-full bg-accent text-primary font-black py-6 rounded-3xl">Enviar código al email</Button>
                ) : (
                  <div className="space-y-4">
                    <FormField control={form.control} name="otp" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de 6 dígitos</FormLabel>
                        <FormControl><Input {...field} className="rounded-2xl h-14" placeholder="000000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {!isEmailVerified && <Button type="button" onClick={verifyOtp} className="w-full bg-primary text-white py-6 rounded-3xl font-black">Verificar Código</Button>}
                  </div>
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                </div>
              </motion.div>
            )}

            {step === 14 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">Revisión y Activación</h2>
                <div className="bg-accent/5 p-8 rounded-[2rem] border border-accent/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><strong>Propietario:</strong> {form.getValues("ownerFullName")}</p>
                    <p><strong>Email:</strong> {form.getValues("ownerEmail")}</p>
                    <p><strong>LLC:</strong> {form.getValues("companyName")}</p>
                    <p><strong>Estado:</strong> {form.getValues("state")}</p>
                    <p><strong>Año:</strong> {form.getValues("creationYear")}</p>
                    <p><strong>Origen:</strong> {form.getValues("creationSource")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase text-primary">✅ Consentimientos (versión humana)</h3>
                  <div className="space-y-4">
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                      <Checkbox required className="mt-1" />
                      <span className="text-sm font-bold text-primary">Acepto los términos del servicio y confío en Easy US LLC para la gestión y mantenimiento de mi LLC.</span>
                    </label>
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                      <Checkbox required className="mt-1" />
                      <span className="text-sm font-bold text-primary">Autorizo el tratamiento de mis datos para la correcta prestación del servicio y cumplimiento legal.</span>
                    </label>
                    <FormField control={form.control} name="subscribeNewsletter" render={({ field }) => (
                      <label className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-primary">¡Quiero estar al día!</span>
                          <p className="text-xs text-muted-foreground">Suscribirme a la newsletter para recibir consejos fiscales y actualizaciones sobre LLCs.</p>
                        </div>
                      </label>
                    )} />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button type="submit" className="w-full bg-accent text-primary font-black py-8 rounded-3xl text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20">
                    🚀 Activar mi Pack de Mantenimiento
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep(12)} className="text-primary/50 font-bold uppercase text-xs">Revisar datos anteriores</Button>
                </div>
              </motion.div>
            )}
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
