import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Upload, CreditCard } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NewsletterSection } from "@/components/layout/newsletter-section";
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
  otp: z.string().length(6, "El código debe tener 6 dígitos").optional(),
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

    const fieldsToValidate = stepsValidation[step];
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
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-black uppercase mb-8 md:mb-12 text-primary leading-tight">Activar Pack de <span className="text-accent">Mantenimiento</span></h1>
        
        <Form {...form}>
          <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 text-left leading-tight">1️⃣ ¿Tu LLC ya existe o la creamos nosotros?</h2>
                <FormDescription className="text-left">👉 Tranquilo, no te juzgamos</FormDescription>
                <FormField control={form.control} name="creationSource" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3 text-left">
                        {["Ya tengo una LLC", "La creé con Easy US LLC", "Aún no la tengo"].map((opt) => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-[2rem] border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                            <span className="font-bold text-primary text-sm md:text-base">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-accent text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">2️⃣ ¿Cómo te llamas?</h2>
                <FormDescription>El nombre real, el que pondremos en los documentos</FormDescription>
                <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest opacity-60">Nombre completo:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="Tu nombre" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">3️⃣ Email de contacto</h2>
                <FormDescription>Aquí te escribiremos cosas importantes</FormDescription>
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest opacity-60">Email:</FormLabel>
                    <FormControl><Input {...field} type="email" value={field.value || ""} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="email@ejemplo.com" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">4️⃣ WhatsApp (muy recomendado)</h2>
                <FormDescription>Para avisos rápidos y avisos importantes</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest opacity-60">Teléfono:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="+34..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">5️⃣ Nombre legal de tu LLC</h2>
                <FormDescription>Tal y como aparece en los documentos oficiales</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest opacity-60">Nombre de la LLC:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="MI EMPRESA LLC" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">6️⃣ Estado donde está registrada</h2>
                <FormDescription>Indica el estado de formación</FormDescription>
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest opacity-60">Estado:</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger className="rounded-full h-14 px-6 border-gray-100 focus:ring-accent"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="New Mexico">New Mexico</SelectItem><SelectItem value="Wyoming">Wyoming</SelectItem><SelectItem value="Delaware">Delaware</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">7️⃣ EIN de la LLC</h2>
                <FormDescription>El número de identificación fiscal</FormDescription>
                <FormField control={form.control} name="ein" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest opacity-60">EIN:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="00-0000000" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">8️⃣ Año de constitución</h2>
                <FormDescription>Para conocer la antigüedad de la empresa</FormDescription>
                <FormField control={form.control} name="creationYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest opacity-60">Año:</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="Ej: 2024" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 8 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">9️⃣ ¿Tienes cuenta bancaria activa?</h2>
                <FormDescription>No pasa nada si aún no la tienes</FormDescription>
                <FormField control={form.control} name="bankAccount" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["Mercury", "Relay", "Otro banco", "Aún no tengo cuenta"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                            <span className="font-bold text-sm text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 9 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">🔟 ¿Usas Stripe u otra pasarela?</h2>
                <FormDescription>Opcional, nos da contexto</FormDescription>
                <FormField control={form.control} name="paymentGateway" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["Stripe", "PayPal", "Otra", "No todavía"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                            <span className="font-bold text-sm text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 10 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣1️⃣ Actividad de la LLC</h2>
                <FormDescription>Explícalo brevemente</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} value={field.value || ""} className="rounded-[2rem] min-h-[120px] p-6 border-gray-100 focus:border-accent" placeholder="A qué se dedica tu empresa..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 11 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣2️⃣ ¿Qué esperas del Pack?</h2>
                <FormDescription>Marca lo que necesites</FormDescription>
                <FormField control={form.control} name="expectedServices" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["Recordatorios fiscales", "Informes obligatorios", "Soporte anual", "Tranquilidad total"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-[2rem] border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
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
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 12 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣3️⃣ ¿Algo más?</h2>
                <FormDescription>Dudas o situaciones especiales</FormDescription>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} value={field.value || ""} className="rounded-[2rem] min-h-[120px] p-6 border-gray-100 focus:border-accent" placeholder="Detalles adicionales..." /></FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 13 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">Verificación</h2>
                {!isOtpSent ? (
                  <Button type="button" onClick={sendOtp} className="w-full bg-accent text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-accent/20 active:scale-95 transition-all">Enviar código</Button>
                ) : (
                  <div className="space-y-4">
                    <FormField control={form.control} name="otp" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-[10px] tracking-widest opacity-60">Código:</FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 text-center text-2xl border-gray-100 focus:border-accent" placeholder="000000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {!isEmailVerified && <Button type="button" onClick={verifyOtp} className="w-full bg-primary text-white py-7 rounded-full font-black text-lg active:scale-95 transition-all">Verificar</Button>}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                </div>
              </motion.div>
            )}

            {step === 14 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight">Revisión Final</h2>
                <div className="bg-accent/5 p-6 md:p-8 rounded-[2rem] border border-accent/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <p className="flex justify-between md:block"><span className="opacity-50">Email:</span> <span className="font-bold">{form.getValues("ownerEmail")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">LLC:</span> <span className="font-bold">{form.getValues("companyName")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">Estado:</span> <span className="font-bold">{form.getValues("state")}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-primary tracking-widest opacity-60">✅ Consentimientos</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                      <Checkbox required className="mt-1" />
                      <span className="text-xs md:text-sm font-bold text-primary">Confirmo los datos y autorizo el servicio.</span>
                    </label>
                    <label className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                      <Checkbox required className="mt-1" />
                      <span className="text-xs md:text-sm font-bold text-primary">Acepto los términos de Easy US LLC.</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <Button type="submit" className="w-full bg-accent text-primary font-black py-8 rounded-full text-lg md:text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20">
                    🚀 Activar Mantenimiento
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep(0)} className="text-primary/50 font-bold uppercase text-[10px] tracking-widest">Reiniciar</Button>
                </div>
              </motion.div>
            )}
          </form>
        </Form>
      </main>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
