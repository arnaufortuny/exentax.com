import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Phone, Mail, Building2, ShieldCheck, Briefcase, CheckSquare, Trash2, Check, CreditCard, Info } from "lucide-react";
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

const formSchema = z.object({
  creationSource: z.string().min(1, "Requerido"),
  ownerFullName: z.string().min(1, "Requerido"),
  ownerPhone: z.string().min(1, "Requerido"),
  ownerEmail: z.string().email("Email inválido"),
  companyName: z.string().min(1, "Requerido"),
  ein: z.string().min(1, "Requerido"),
  state: z.string().min(1, "Requerido"),
  businessActivity: z.string().min(1, "Requerido"),
  expectedServices: z.string().min(1, "Requerido"),
  wantsDissolve: z.string().min(1, "Requerido"),
  otp: z.string().optional(),
  authorizedManagement: z.boolean().refine(val => val === true, "Debes autorizar"),
  termsConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
  dataProcessingConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
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
      ownerPhone: "",
      ownerEmail: "",
      companyName: "",
      ein: "",
      state: stateFromUrl,
      businessActivity: "",
      expectedServices: "",
      wantsDissolve: "No",
      otp: "",
      authorizedManagement: false,
      termsConsent: false,
      dataProcessingConsent: false
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
      2: ["ownerPhone"],
      3: ["ownerEmail"],
      4: ["companyName"],
      5: ["ein"],
      6: ["state"],
      7: ["businessActivity"],
      8: ["expectedServices"],
      9: ["wantsDissolve"],
    };

    const fieldsToValidate = stepsValidation[step];
    if (fieldsToValidate) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (step === 10) {
      if (isEmailVerified) setStep(12);
      else setStep(11);
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
      setStep(12);
    } catch {
      toast({ title: "Código incorrecto", variant: "destructive" });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
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
        <h1 className="text-3xl md:text-4xl font-black uppercase mb-8 md:mb-12 text-primary leading-tight text-left">
          Pack de <span className="text-accent">Mantenimiento</span> LLC
        </h1>
        
        <Form {...form}>
          <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {/* STEP 0: Ya tienes LLC? */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#6EDC8A]" /> 1️⃣ ¿Ya tienes una LLC creada?
                </h2>
                <FormDescription>Para saber desde dónde partimos</FormDescription>
                <FormField control={form.control} name="creationSource" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["Sí", "No (en ese caso, te orientamos primero)"].map((opt) => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-[#6EDC8A]" />
                            <span className="font-bold text-primary text-sm md:text-base">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
              </motion.div>
            )}

            {/* STEP 1: Nombre Completo */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <User className="w-6 h-6 text-[#6EDC8A]" /> 2️⃣ Nombre completo
                </h2>
                <FormDescription>El de los documentos oficiales</FormDescription>
                <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest text-primary">Nombre completo:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] font-bold text-primary placeholder:text-primary/30" placeholder="Tu nombre" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Teléfono */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Phone className="w-6 h-6 text-[#6EDC8A]" /> 3️⃣ Teléfono de contacto
                </h2>
                <FormDescription>Para avisos importantes y comunicación rápida</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest text-primary">Teléfono:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] font-bold text-primary placeholder:text-primary/30" placeholder="+34..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Email */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Mail className="w-6 h-6 text-[#6EDC8A]" /> 4️⃣ Email
                </h2>
                <FormDescription>Aquí recibirás recordatorios y documentación</FormDescription>
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest text-primary">Email:</FormLabel>
                    <FormControl><Input {...field} type="email" inputMode="email" className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] font-bold text-primary placeholder:text-primary/30" placeholder="email@ejemplo.com" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Nombre Legal LLC */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#6EDC8A]" /> 5️⃣ Nombre legal de la LLC
                </h2>
                <FormDescription>Tal y como figura en los documentos oficiales</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest text-primary">Nombre de la LLC:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] font-bold text-primary placeholder:text-primary/30" placeholder="MI EMPRESA LLC" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: EIN */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#6EDC8A]" /> 6️⃣ EIN
                </h2>
                <FormDescription>El número fiscal de tu empresa en EE. UU.</FormDescription>
                <FormField control={form.control} name="ein" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest text-primary">EIN:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] font-bold text-primary placeholder:text-primary/30" placeholder="00-0000000" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Estado de constitución */}
            {step === 6 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <Globe className="w-6 h-6 text-accent" /> 7️⃣ Estado de constitución
                </h2>
                <FormDescription>Cada estado tiene sus propios plazos</FormDescription>
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest text-primary">Estado:</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger className="rounded-full h-14 px-6 border-gray-200 focus:ring-[#6EDC8A] font-bold text-primary"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="New Mexico">New Mexico</SelectItem><SelectItem value="Wyoming">Wyoming</SelectItem><SelectItem value="Delaware">Delaware</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: Actividad */}
            {step === 7 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-[#6EDC8A]" /> 8️⃣ Actividad
                </h2>
                <FormDescription>Tipo de negocio o producto</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-200 focus:border-[#6EDC8A] font-bold text-primary placeholder:text-primary/30" placeholder="A qué se dedica tu LLC..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 8: Servicios */}
            {step === 8 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <CheckSquare className="w-6 h-6 text-[#6EDC8A]" /> 9️⃣ ¿Qué necesitas gestionar?
                </h2>
                <FormDescription>Marca lo que aplique</FormDescription>
                <FormField control={form.control} name="expectedServices" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["Recordatorios y cumplimiento anual", "Presentación de documentos obligatorios", "Soporte durante el año", "Revisión general de la situación de la LLC"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-[2rem] border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                            <Checkbox 
                              checked={field.value?.split(", ").includes(opt)}
                              onCheckedChange={(checked) => {
                                const current = field.value ? field.value.split(", ") : [];
                                const next = checked ? [...current, opt] : current.filter(v => v !== opt);
                                field.onChange(next.join(", "));
                              }}
                              className="border-gray-200 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]"
                            />
                            <span className="font-bold text-sm text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 9: Disolver? */}
            {step === 9 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-[#6EDC8A]" /> 🔟 ¿Deseas disolver tu LLC?
                </h2>
                <FormDescription>Si necesitas cerrar la empresa de forma correcta y ordenada</FormDescription>
                <FormField control={form.control} name="wantsDissolve" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["No", "Sí, quiero disolver mi LLC", "Quiero que me expliquéis primero el proceso"].map((opt) => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-[#6EDC8A]" />
                            <span className="font-bold text-primary text-sm md:text-base">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 10: Resumen */}
            {step === 10 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Info className="w-6 h-6 text-[#6EDC8A]" /> Revisión Final
                </h2>
                <div className="bg-[#6EDC8A]/5 p-6 md:p-8 rounded-[2rem] border border-[#6EDC8A]/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <p className="flex justify-between md:block"><span className="opacity-50 font-black uppercase text-[10px] text-primary">Email:</span> <span className="font-bold text-primary">{form.getValues("ownerEmail")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50 font-black uppercase text-[10px] text-primary">LLC:</span> <span className="font-bold text-primary">{form.getValues("companyName")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50 font-black uppercase text-[10px] text-primary">Estado:</span> <span className="font-bold text-primary">{form.getValues("state")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50 font-black uppercase text-[10px] text-primary">Disolver:</span> <span className="font-bold text-primary">{form.getValues("wantsDissolve")}</span></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all uppercase">VERIFICAR EMAIL</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 11: Verificación */}
            {step === 11 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#6EDC8A]" /> Verificación
                </h2>
                {!isOtpSent ? (
                  <Button type="button" onClick={sendOtp} className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all uppercase">ENVIAR CÓDIGO</Button>
                ) : (
                  <div className="space-y-4">
                    <FormField control={form.control} name="otp" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-[10px] md:text-xs tracking-widest text-primary">Código de 6 dígitos:</FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 text-center text-2xl border-gray-200 focus:border-[#6EDC8A] font-black text-primary placeholder:text-primary/30" placeholder="000000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" onClick={verifyOtp} className="w-full bg-[#6EDC8A] text-primary py-7 rounded-full font-black text-lg active:scale-95 transition-all uppercase">VERIFICAR</Button>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-200 active:scale-95 transition-all">ATRÁS</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 12: Pago y Confirmación */}
            {step === 12 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-[#6EDC8A]" /> Pago y Confirmación
                </h2>
                <div className="bg-[#6EDC8A]/5 p-6 md:p-8 rounded-[2rem] border border-[#6EDC8A]/20 space-y-3">
                  <FormField control={form.control} name="authorizedManagement" render={({ field }) => (
                    <FormItem className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-200 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" /></FormControl>
                      <div className="space-y-1">
                        <span className="text-xs md:text-sm font-bold text-primary">Confirmo que la información es correcta y autorizo la gestión.</span>
                      </div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="termsConsent" render={({ field }) => (
                    <FormItem className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-200 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" /></FormControl>
                      <span className="text-xs md:text-sm font-bold text-primary">Acepto los términos del servicio.</span>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataProcessingConsent" render={({ field }) => (
                    <FormItem className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-200 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" /></FormControl>
                      <span className="text-xs md:text-sm font-bold text-primary">Acepto el tratamiento de mis datos personales.</span>
                    </FormItem>
                  )} />
                </div>
                <div className="flex flex-col gap-4 pt-4">
                  <Button type="submit" className="w-full bg-[#6EDC8A] text-primary font-black py-8 rounded-full text-lg md:text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#6EDC8A]/20">
                    🚀 Enviar y Pagar
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
