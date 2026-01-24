import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Mail, Building2, Loader2, MessageCircle, Info, Upload, CreditCard } from "lucide-react";
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
import { insertLlcApplicationSchema } from "@shared/schema";

const formSchema = insertLlcApplicationSchema.extend({
  otp: z.string().length(6, "El código debe tener 6 dígitos").optional(),
}).omit({ 
  orderId: true,
  requestCode: true,
  submittedAt: true,
  emailOtp: true,
  emailOtpExpires: true,
  emailVerified: true,
  paymentStatus: true,
  status: true,
  lastUpdated: true
});

type FormValues = z.infer<typeof formSchema>;

export default function LlcFormation() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
      companyName: "",
      ownerNamesAlternates: "",
      state: "New Mexico",
      ownerCount: 1,
      ownerCountryResidency: "",
      ownerAddress: "",
      ownerBirthDate: "",
      businessActivity: "",
      isSellingOnline: "",
      needsBankAccount: "",
      willUseStripe: "",
      wantsBoiReport: "",
      wantsMaintenancePack: "",
      notes: "",
      idDocumentUrl: "",
      otp: ""
    },
  });

  useEffect(() => {
    async function init() {
      try {
        const res = await apiRequest("POST", "/api/llc/orders", { productId: 1 });
        const data = await res.json();
        setAppId(data.application.id);
      } catch (err) {
        console.error("Error initializing LLC application:", err);
      }
    }
    init();
  }, []);

  const nextStep = async () => {
    const stepsValidation: Record<number, (keyof FormValues)[]> = {
      0: ["ownerFullName"],
      1: ["ownerEmail"],
      2: ["ownerPhone"],
      3: ["companyName"],
      4: ["ownerNamesAlternates"],
      5: ["state"],
      6: ["ownerCount"],
      7: ["ownerCountryResidency"],
      8: ["ownerAddress"],
      9: ["ownerBirthDate"],
      10: ["idDocumentUrl"],
      11: ["businessActivity"],
      12: ["isSellingOnline"],
      13: ["needsBankAccount"],
      14: ["willUseStripe"],
      15: ["wantsBoiReport"],
      16: ["wantsMaintenancePack"],
      17: ["notes"],
    };

    const fieldsToValidate = stepsValidation[step];
    if (fieldsToValidate) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (step === 18) {
      // Logic for OTP or Final Submission
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await apiRequest("PUT", `/api/llc/${appId}`, { ...data, status: "submitted" });
      toast({ title: "Información guardada", description: "Procediendo al pago..." });
      setStep(20); // Payment Step
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    toast({ title: "Redirigiendo a Stripe...", description: "Simulación de pago en curso." });
    setTimeout(async () => {
      await apiRequest("POST", `/api/llc/${appId}/pay`, {});
      toast({ title: "Pago completado", variant: "success" });
      setLocation("/contacto?success=true");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-32 pb-16 max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-black uppercase mb-12 text-primary">Constituir mi <span className="text-accent">LLC</span></h1>
        
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣ ¿Cómo te llamas?</h2>
                <FormDescription>El nombre real, el que pondremos en los documentos oficiales</FormDescription>
                <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Nombre completo:</FormLabel>
                    <FormControl><Input {...field} className="rounded-2xl h-14 px-6" placeholder="Tu nombre" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-accent text-primary font-black py-6 rounded-3xl">SIGUIENTE</Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">2️⃣ Email de contacto</h2>
                <FormDescription>Aquí te enviaremos los avances y documentos de tu LLC</FormDescription>
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Email:</FormLabel>
                    <FormControl><Input {...field} type="email" className="rounded-2xl h-14 px-6" placeholder="email@ejemplo.com" /></FormControl>
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
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">3️⃣ WhatsApp (muy recomendado)</h2>
                <FormDescription>Para dudas rápidas y avisos importantes</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Teléfono:</FormLabel>
                    <FormControl><Input {...field} className="rounded-2xl h-14 px-6" placeholder="+34..." /></FormControl>
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
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">4️⃣ ¿Cómo quieres que se llame tu LLC?</h2>
                <FormDescription>Si no estás 100% seguro, no pasa nada. Lo revisamos contigo</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Nombre deseado:</FormLabel>
                    <FormControl><Input {...field} className="rounded-2xl h-14 px-6" placeholder="MI EMPRESA LLC" /></FormControl>
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
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">5️⃣ ¿Tienes nombres alternativos?</h2>
                <FormDescription>Plan B, C o D por si el primero no está disponible</FormDescription>
                <FormField control={form.control} name="ownerNamesAlternates" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-xs tracking-widest">Nombres alternativos:</FormLabel>
                    <FormControl><Input {...field} className="rounded-2xl h-14 px-6" placeholder="Opción 2, Opción 3..." /></FormControl>
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
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">6️⃣ Estado donde quieres crear la LLC</h2>
                <FormDescription>Si dudas, te asesoramos antes de continuar</FormDescription>
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["New Mexico", "Wyoming", "Delaware"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                            <span className="font-bold text-primary">{opt}</span>
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

            {step === 6 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">7️⃣ ¿Quién será el propietario?</h2>
                <FormDescription>Esto es importante a nivel fiscal</FormDescription>
                <FormField control={form.control} name="ownerCount" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                          <input type="radio" onChange={() => field.onChange(1)} checked={field.value === 1} className="w-5 h-5 accent-accent" />
                          <span className="font-bold text-primary">Solo yo</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                          <input type="radio" onChange={() => field.onChange(2)} checked={field.value > 1} className="w-5 h-5 accent-accent" />
                          <span className="font-bold text-primary">Varios socios</span>
                        </label>
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

            {step === 7 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">9️⃣ País de residencia</h2>
                <FormField control={form.control} name="ownerCountryResidency" render={({ field }) => (
                  <FormItem>
                    <FormControl><Input {...field} className="rounded-2xl h-14 px-6" placeholder="España, México, Argentina..." /></FormControl>
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
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">🔟 Dirección completa</h2>
                <FormDescription>La de tu residencia habitual</FormDescription>
                <FormField control={form.control} name="ownerAddress" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-2xl min-h-[100px] p-4" placeholder="Calle, número, ciudad, código postal..." /></FormControl>
                    <FormMessage />
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
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣1️⃣ Fecha de nacimiento</h2>
                <FormField control={form.control} name="ownerBirthDate" render={({ field }) => (
                  <FormItem>
                    <FormControl><Input {...field} type="date" className="rounded-2xl h-14 px-6" /></FormControl>
                    <FormMessage />
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
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣2️⃣ Documento de identidad</h2>
                <FormDescription>DNI o pasaporte en vigor</FormDescription>
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-accent transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="font-bold text-primary">Subir archivo o arrastrar aquí</p>
                  <p className="text-xs text-gray-500 mt-2">Formatos: JPG, PNG, PDF (Máx 10MB)</p>
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 11 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣3️⃣ ¿A qué se dedicará tu LLC?</h2>
                <FormDescription>Explícalo con tus palabras, sin tecnicismos</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-2xl min-h-[100px] p-4" placeholder="Mi empresa se dedicará a..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step >= 12 && step <= 17 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                {step === 12 && (
                  <>
                    <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣4️⃣ ¿Vas a vender online?</h2>
                    <FormField control={form.control} name="isSellingOnline" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Aún no lo sé"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-bold text-primary">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 13 && (
                  <>
                    <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣5️⃣ ¿Necesitas cuenta bancaria en USA?</h2>
                    <FormField control={form.control} name="needsBankAccount" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí, Mercury", "Sí, Relay", "Aún no", "Ya tengo cuenta"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-bold text-primary">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 14 && (
                  <>
                    <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣6️⃣ ¿Usarás Stripe u otra pasarela?</h2>
                    <FormField control={form.control} name="willUseStripe" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Stripe", "PayPal", "Ambas", "Otra", "No todavía"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-bold text-primary">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 15 && (
                  <>
                    <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣7️⃣ ¿Quieres que presentemos el BOI Report?</h2>
                    <FormField control={form.control} name="wantsBoiReport" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Quiero que me expliquéis esto primero"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-bold text-primary">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 16 && (
                  <>
                    <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣8️⃣ ¿Quieres añadir Pack de Mantenimiento?</h2>
                    <FormField control={form.control} name="wantsMaintenancePack" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Quiero info"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-bold text-primary">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 17 && (
                  <>
                    <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1️⃣9️⃣ ¿Algo que debamos saber?</h2>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-2xl min-h-[100px] p-4" placeholder="Dudas, contexto, situaciones especiales..." /></FormControl>
                      </FormItem>
                    )} />
                  </>
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-3xl h-14 font-black">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black rounded-3xl h-14">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 18 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">Revisión Final</h2>
                <div className="bg-accent/5 p-8 rounded-[2rem] border border-accent/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><strong>Nombre:</strong> {form.getValues("ownerFullName")}</p>
                    <p><strong>Email:</strong> {form.getValues("ownerEmail")}</p>
                    <p><strong>LLC:</strong> {form.getValues("companyName")}</p>
                    <p><strong>Estado:</strong> {form.getValues("state")}</p>
                    <p><strong>Residencia:</strong> {form.getValues("ownerCountryResidency")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase text-primary">✅ Consentimientos</h3>
                  <div className="space-y-4">
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                      <Checkbox required className="mt-1" />
                      <span className="text-sm font-bold text-primary">Confirmo que la información es correcta y autorizo a Easy US LLC.</span>
                    </label>
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-accent cursor-pointer transition-all">
                      <Checkbox required className="mt-1" />
                      <span className="text-sm font-bold text-primary">Acepto los términos del servicio y el tratamiento de mis datos.</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button type="submit" className="w-full bg-accent text-primary font-black py-8 rounded-3xl text-xl uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-accent/20">
                    🚀 Guardar y Continuar al Pago
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep(0)} className="text-primary/50 font-bold uppercase text-xs">Empezar de nuevo</Button>
                </div>
              </motion.div>
            )}

            {step === 20 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CreditCard className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-3xl font-black uppercase text-primary">Casi listo</h2>
                <p className="text-gray-500 max-w-md mx-auto">Para empezar con el proceso de constitución necesitamos formalizar el pago de la tasa estatal y gestión.</p>
                
                <div className="bg-primary text-white p-8 rounded-[2rem] max-w-sm mx-auto my-12">
                  <p className="uppercase text-xs font-black tracking-widest opacity-50 mb-2">Total a pagar</p>
                  <p className="text-5xl font-black mb-4">$399.00</p>
                  <p className="text-sm opacity-80 italic">Incluye tasas estatales de {form.getValues("state")}</p>
                </div>

                <Button onClick={handlePayment} className="w-full max-w-md bg-accent text-primary font-black py-8 rounded-3xl text-xl uppercase tracking-widest hover:scale-[1.02] transition-all">
                  💳 Pagar Ahora con Stripe
                </Button>
              </motion.div>
            )}
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
