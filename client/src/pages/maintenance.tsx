import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Phone, Mail, Building2, ShieldCheck, Briefcase, CheckSquare, Trash2, Check, CreditCard, Info, Globe } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMaintenanceApplicationSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

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
  const { user, isAuthenticated } = useAuth();
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
    if (isAuthenticated && user) {
      form.reset({
        ...form.getValues(),
        ownerFullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        ownerEmail: user.email || "",
        ownerPhone: user.phone || "",
        businessActivity: user.businessActivity || "",
      });
      if (user.emailVerified) {
        setIsEmailVerified(true);
      }
    }
  }, [isAuthenticated, user, form]);

  useEffect(() => {
    async function init() {
      try {
        const productId = stateFromUrl.includes("Wyoming") ? 2 : stateFromUrl.includes("Delaware") ? 3 : 1;
        const res = await apiRequest("POST", "/api/maintenance/orders", { productId, state: stateFromUrl });
        const data = await res.json();
        setAppId(data.application.id);
      } catch (err) {
        toast({ title: "Error al iniciar", description: "No se pudo crear la solicitud", variant: "destructive" });
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

    if (step === 9) {
      if (isEmailVerified) setStep(11);
      else setStep(10);
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
      setLocation("/contacto?success=true&type=maintenance");
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-black  mb-8 md:mb-12 text-primary leading-tight text-left">
          Pack de <span className="text-accent">Mantenimiento</span> LLC
        </h1>
        
        <div>
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-primary  mb-2 leading-tight">Solicitud de Mantenimiento</h2>
            <Form {...form}>
              <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                {/* STEP 0: Ya tienes LLC? */}
                {step === 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
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
                                <span className="font-black text-primary text-sm md:text-base">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" onClick={nextStep} className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                  </motion.div>
                )}

                {/* STEP 1: Nombre Completo */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <User className="w-6 h-6 text-[#6EDC8A]" /> 2️⃣ Nombre completo
                    </h2>
                    <FormDescription>El de los documentos oficiales</FormDescription>
                    <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Nombre completo:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg" placeholder="Tu nombre" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Teléfono */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Phone className="w-6 h-6 text-[#6EDC8A]" /> 3️⃣ Teléfono de contacto
                    </h2>
                    <FormDescription>Para avisos importantes y comunicación rápida</FormDescription>
                    <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Teléfono:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg" placeholder="+34..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Email */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Mail className="w-6 h-6 text-[#6EDC8A]" /> 4️⃣ Email
                    </h2>
                    <FormDescription>Aquí recibirás recordatorios y documentación</FormDescription>
                    <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Email:
                        </FormLabel>
                        <FormControl><Input {...field} type="email" inputMode="email" className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg" placeholder="email@ejemplo.com" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Nombre Legal LLC */}
                {step === 4 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-[#6EDC8A]" /> 5️⃣ Nombre legal de la LLC
                    </h2>
                    <FormDescription>Tal y como figura en los documentos oficiales</FormDescription>
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Nombre de la LLC:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg" placeholder="MI EMPRESA LLC" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: EIN */}
                {step === 5 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-[#6EDC8A]" /> 6️⃣ EIN
                    </h2>
                    <FormDescription>El número fiscal de tu empresa en EE. UU.</FormDescription>
                    <FormField control={form.control} name="ein" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          EIN:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg" placeholder="00-0000000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 6: Estado de constitución */}
                {step === 6 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <Globe className="w-6 h-6 text-accent" /> 7️⃣ Estado de constitución
                    </h2>
                    <FormDescription>Cada estado tiene sus propios plazos</FormDescription>
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Estado:
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl><SelectTrigger className="rounded-full h-14 px-6 border-gray-200 focus:ring-[#6EDC8A] font-black text-primary text-lg"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="New Mexico">New Mexico</SelectItem><SelectItem value="Wyoming">Wyoming</SelectItem><SelectItem value="Delaware">Delaware</SelectItem></SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 7: Actividad */}
                {step === 7 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-[#6EDC8A]" /> 8️⃣ Actividad
                    </h2>
                    <FormDescription>Tipo de negocio o producto</FormDescription>
                    <FormField control={form.control} name="businessActivity" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg" placeholder="A qué se dedica tu LLC..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 8: Servicios */}
                {step === 8 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
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
                                <span className="font-black text-sm text-primary">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 9: Disolver? */}
                {step === 9 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Trash2 className="w-6 h-6 text-[#6EDC8A]" /> 1️⃣0️⃣ ¿Deseas disolver tu LLC?
                    </h2>
                    <FormDescription>Si necesitas cerrar la empresa de forma correcta y ordenada</FormDescription>
                    <FormField control={form.control} name="wantsDissolve" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {["No", "Sí, quiero disolver mi LLC", "Quiero que me expliquéis primero el proceso"].map((opt) => (
                              <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                                <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-[#6EDC8A]" />
                                <span className="font-black text-primary text-sm md:text-base">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 10: OTP */}
                {step === 10 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Mail className="w-6 h-6 text-[#6EDC8A]" /> Verificación de Email
                    </h2>
                    {!isOtpSent ? (
                      <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">Para continuar, debemos verificar tu correo electrónico: <strong>{form.getValues("ownerEmail")}</strong></p>
                        <Button type="button" onClick={sendOtp} className="w-full bg-accent text-primary font-black py-7 rounded-full text-lg shadow-lg">Enviar Código</Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <FormField control={form.control} name="otp" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black">Ingresa el código de 6 dígitos:</FormLabel>
                            <FormControl><Input {...field} className="rounded-full h-14 text-center text-2xl tracking-[0.5em] font-black" maxLength={6} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="button" onClick={verifyOtp} className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20">Verificar y Continuar</Button>
                        <button type="button" onClick={sendOtp} className="w-full text-xs text-muted-foreground hover:underline">Reenviar código</button>
                      </div>
                    )}
                    <Button type="button" variant="link" onClick={() => setStep(9)} className="w-full">Atrás</Button>
                  </motion.div>
                )}

                {/* STEP 11: Autorización y Consentimiento */}
                {(step === 11 || step === 12) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-accent" /> Último paso: Confirmación
                    </h2>
                    <div className="space-y-4">
                      <FormField control={form.control} name="authorizedManagement" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">Autorizo a Easy US LLC a gestionar administrativamente mi LLC ante los organismos competentes.</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="dataProcessingConsent" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">Acepto el tratamiento de mis datos personales según la política de privacidad.</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="termsConsent" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">He leído y acepto los Términos y Condiciones de Easy US LLC.</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                    </div>
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={() => setStep(9)} className="flex-1 rounded-full h-12 md:h-14 font-black border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="submit" className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Enviar Solicitud</Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
