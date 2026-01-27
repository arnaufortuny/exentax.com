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

const formSchema = z.object({
  ownerFullName: z.string().min(1, "Requerido"),
  ownerEmail: z.string().email("Email inválido"),
  ownerPhone: z.string().min(1, "Requerido"),
  companyName: z.string().min(1, "Requerido"),
  companyNameOption2: z.string().optional(),
  ownerNamesAlternates: z.string().optional(),
  state: z.string().min(1, "Requerido"),
  ownerCount: z.number().default(1),
  ownerCountryResidency: z.string().min(1, "Requerido"),
  ownerAddress: z.string().min(1, "Requerido"),
  ownerBirthDate: z.string().min(1, "Requerido"),
  businessActivity: z.string().min(1, "Requerido"),
  isSellingOnline: z.string().min(1, "Requerido"),
  needsBankAccount: z.string().min(1, "Requerido"),
  willUseStripe: z.string().min(1, "Requerido"),
  wantsBoiReport: z.string().min(1, "Requerido"),
  wantsMaintenancePack: z.string().min(1, "Requerido"),
  notes: z.string().optional(),
  idDocumentUrl: z.string().optional(),
  otp: z.string().optional(),
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
      companyNameOption2: "",
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
        const res = await apiRequest("POST", "/api/orders", { productId: 1 });
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
      4: ["companyNameOption2", "ownerNamesAlternates"],
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
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-black  mb-8 md:mb-12 text-primary leading-tight">Constituir mi <span className="text-accent">LLC</span></h1>
        
        <Form {...form}>
          <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣ ¿Cómo te llamas?</h2>
                <FormDescription>El nombre real, el que pondremos en los documentos oficiales</FormDescription>
                <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Nombre completo:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="Tu nombre" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-accent text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">2️⃣ Email de contacto</h2>
                <FormDescription>Aquí te enviaremos los avances y documentos de tu LLC</FormDescription>
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Email:</FormLabel>
                    <FormControl><Input {...field} type="email" className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="email@ejemplo.com" /></FormControl>
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
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">3️⃣ WhatsApp (muy recomendado)</h2>
                <FormDescription>Para dudas rápidas y avisos importantes</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Teléfono:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="+34..." /></FormControl>
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
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">4️⃣ ¿Cómo quieres que se llame tu LLC?</h2>
                <FormDescription>Si no estás 100% seguro, no pasa nada. Lo revisamos contigo</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Nombre deseado:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="MI EMPRESA LLC" /></FormControl>
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
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">5️⃣ ¿Tienes nombres alternativos? (opcional)</h2>
                <FormDescription>Plan B, C o D por si el primero no está disponible</FormDescription>
                <div className="space-y-4">
                  <FormField control={form.control} name="companyNameOption2" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Nombre alternativo 1:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="OPCIÓN 2 LLC" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerNamesAlternates" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Nombre alternativo 2:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="OPCIÓN 3 LLC" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">6️⃣ Estado donde quieres crear la LLC</h2>
                <FormDescription>Si dudas, te asesoramos antes de continuar</FormDescription>
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["New Mexico", "Wyoming", "Delaware"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                            <span className="font-black text-primary text-sm md:text-base">{opt}</span>
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

            {step === 6 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">7️⃣ ¿Quién será el propietario?</h2>
                <FormDescription>Esto es importante a nivel fiscal</FormDescription>
                <FormField control={form.control} name="ownerCount" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                          <input type="radio" onChange={() => field.onChange(1)} checked={field.value === 1} className="w-5 h-5 accent-accent" />
                          <span className="font-black text-primary text-sm md:text-base">Solo yo</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                          <input type="radio" onChange={() => field.onChange(2)} checked={field.value > 1} className="w-5 h-5 accent-accent" />
                          <span className="font-black text-primary text-sm md:text-base">Varios socios</span>
                        </label>
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                {form.watch("ownerCount") > 1 && (
                  <FormField control={form.control} name="ownerCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">8️⃣ Número de miembros:</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" min={2} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">9️⃣ País de residencia</h2>
                <FormField control={form.control} name="ownerCountryResidency" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">País:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="España, México, Argentina..." /></FormControl>
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
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">🔟 Dirección completa</h2>
                <FormDescription>La de tu residencia habitual</FormDescription>
                <FormField control={form.control} name="ownerAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Dirección:</FormLabel>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-100 focus:border-accent" placeholder="Calle, número, ciudad, código postal..." /></FormControl>
                    <FormMessage />
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
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣1️⃣ Fecha de nacimiento</h2>
                <FormField control={form.control} name="ownerBirthDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Fecha:</FormLabel>
                    <FormControl><Input {...field} type="date" className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" /></FormControl>
                    <FormMessage />
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
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣2️⃣ Documento de identidad</h2>
                <FormDescription>DNI o pasaporte en vigor</FormDescription>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-8 md:p-12 text-center hover:border-accent transition-colors cursor-pointer bg-white">
                    <Upload className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-black text-primary text-sm">Subir archivo o arrastrar</p>
                    <p className="text-[10px] text-gray-400 mt-2">JPG, PNG, PDF (Máx 10MB)</p>
                  </div>
                  <FormField control={form.control} name="idDocumentUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">ID del documento (opcional):</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="Número de documento" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 11 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣3️⃣ ¿A qué se dedicará tu LLC?</h2>
                <FormDescription>Explícalo con tus palabras, sin tecnicismos</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-100 focus:border-accent" placeholder="Mi empresa se dedicará a..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step >= 12 && step <= 17 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                {step === 12 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣4️⃣ ¿Vas a vender online?</h2>
                    <FormField control={form.control} name="isSellingOnline" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Aún no lo sé"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-black text-primary text-sm md:text-base">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 13 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣5️⃣ ¿Necesitas cuenta bancaria?</h2>
                    <FormField control={form.control} name="needsBankAccount" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí, Mercury", "Sí, Relay", "Aún no", "Ya tengo cuenta"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-black text-primary text-sm md:text-base">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 14 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣6️⃣ ¿Usarás Stripe u otra?</h2>
                    <FormField control={form.control} name="willUseStripe" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Stripe", "PayPal", "Ambas", "Otra", "No todavía"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-black text-primary text-sm md:text-base">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 15 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣7️⃣ ¿Quieres el reporte BOI?</h2>
                    <FormField control={form.control} name="wantsBoiReport" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Quiero que me expliquéis esto"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-black text-primary text-sm md:text-base">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 16 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣8️⃣ ¿Quieres Mantenimiento?</h2>
                    <FormField control={form.control} name="wantsMaintenancePack" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Quiero info"].map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-accent" />
                              <span className="font-black text-primary text-sm md:text-base">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 17 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣9️⃣ ¿Algo más que debamos saber?</h2>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-100 focus:border-accent" placeholder="Dudas, contexto, situaciones especiales..." /></FormControl>
                      </FormItem>
                    )} />
                  </>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {step === 18 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">Revisión Final</h2>
                <div className="bg-accent/5 p-6 md:p-8 rounded-[2rem] border border-accent/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <p className="flex justify-between md:block"><span className="opacity-50">Nombre:</span> <span className="font-black">{form.getValues("ownerFullName")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">Email:</span> <span className="font-black">{form.getValues("ownerEmail")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">LLC:</span> <span className="font-black">{form.getValues("companyName")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">Estado:</span> <span className="font-black">{form.getValues("state")}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black  text-primary tracking-widest opacity-60">✅ Consentimientos</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                      <Checkbox required className="mt-1" />
                      <span className="text-xs md:text-sm font-black text-primary leading-tight">Confirmo que la información es correcta y autorizo a Easy US LLC.</span>
                    </label>
                    <label className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                      <Checkbox required className="mt-1" />
                      <span className="text-xs md:text-sm font-black text-primary leading-tight">Acepto los términos del servicio y el tratamiento de mis datos.</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <Button type="submit" className="w-full bg-accent text-primary font-black py-8 rounded-full text-lg md:text-xl  tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20">
                    🚀 Ir al Pago
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep(0)} className="text-primary/50 font-black  text-[10px] tracking-widest">Empezar de nuevo</Button>
                </div>
              </motion.div>
            )}

            {step === 20 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-accent" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black  text-primary leading-tight">Casi listo</h2>
                <p className="text-xs md:text-sm text-gray-500 max-w-xs mx-auto">Necesitamos formalizar el pago para empezar el proceso legal de constitución.</p>
                
                <div className="bg-accent text-primary p-8 rounded-[2rem] max-w-xs mx-auto my-8">
                  <p className=" text-[10px] font-black tracking-widest opacity-50 mb-2">Total a pagar</p>
                  <p className="text-4xl md:text-5xl font-black mb-4">$399.00</p>
                  <p className="text-[10px] md:text-xs opacity-80 italic">Incluye tasas estatales de {form.getValues("state")}</p>
                </div>

                <Button onClick={handlePayment} className="w-full max-w-xs bg-accent text-primary font-black py-7 rounded-full text-lg  tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20">
                  💳 Pagar con Stripe
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
