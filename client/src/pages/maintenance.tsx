import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { User, Phone, Mail, Building2, ShieldCheck, Briefcase, CheckSquare, Trash2, Check, CreditCard, Info, Globe, Loader2, Lock, Eye, EyeOff } from "lucide-react";
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
import { StepProgress } from "@/components/ui/step-progress";
import { useFormDraft } from "@/hooks/use-form-draft";

const TOTAL_STEPS = 12;

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
  password: z.string().min(8, "Mínimo 8 caracteres").optional(),
  confirmPassword: z.string().optional(),
  paymentMethod: z.string().optional(),
  authorizedManagement: z.boolean().refine(val => val === true, "Debes autorizar"),
  termsConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
  dataProcessingConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function MaintenanceApplication() {
  const { user, isAuthenticated, refetch: refetchAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [requestCode, setRequestCode] = useState<string>("");
  const { toast } = useToast();
  
  // OTP verification states
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

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
      password: "",
      confirmPassword: "",
      paymentMethod: "transfer",
      authorizedManagement: false,
      termsConsent: false,
      dataProcessingConsent: false
    },
  });

  const prevStepRef = useRef(step);
  const direction = step > prevStepRef.current ? "forward" : "backward";
  
  useEffect(() => {
    prevStepRef.current = step;
  }, [step]);

  const formDefaults = {
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
    authorizedManagement: false,
    termsConsent: false,
    dataProcessingConsent: false
  };

  const { clearDraft } = useFormDraft({
    form,
    storageKey: "maintenance-application-draft",
    debounceMs: 1000,
    defaultValues: formDefaults,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const ownerFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const ownerEmail = user.email || "";
      const ownerPhone = user.phone || "";
      const businessActivity = user.businessActivity || "";
      
      form.reset({
        ...form.getValues(),
        ownerFullName,
        ownerEmail,
        ownerPhone,
        businessActivity,
      });
      
      // Skip to first empty required field (step 0 is creationSource, always needs input)
      // Steps: 0=creationSource, 1=name, 2=phone, 3=email, 4=companyName, 5=ein, 6=state, 7=businessActivity
      const fieldsToCheck = [
        { step: 0, value: "" }, // creationSource - always needs input
        { step: 1, value: ownerFullName },
        { step: 2, value: ownerPhone },
        { step: 3, value: ownerEmail },
        { step: 4, value: "" }, // companyName - always needs input
      ];
      
      for (const field of fieldsToCheck) {
        if (!field.value) {
          setStep(field.step);
          return;
        }
      }
      // If basic info complete, start at company name (step 4)
      setStep(4);
    }
  }, [isAuthenticated, user, form]);

  const [emailExists, setEmailExists] = useState(false);
  const [existingUserName, setExistingUserName] = useState<string>("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const checkEmailExists = async (email: string) => {
    setIsCheckingEmail(true);
    try {
      const res = await apiRequest("POST", "/api/auth/check-email", { email });
      const data = await res.json();
      setEmailExists(data.exists);
      setExistingUserName(data.firstName || "");
      return data.exists;
    } catch {
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Reset OTP state when email changes
  const watchedEmail = form.watch("ownerEmail");
  useEffect(() => {
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtpCode("");
  }, [watchedEmail]);

  // Send OTP for email verification
  const sendOtp = async () => {
    const email = form.getValues("ownerEmail");
    if (!email) {
      toast({ title: "Ingresa tu email primero", variant: "destructive" });
      return;
    }
    
    setIsSendingOtp(true);
    try {
      const res = await apiRequest("POST", "/api/register/send-otp", { email });
      if (res.ok) {
        setIsOtpSent(true);
        toast({ title: "Código enviado", description: "Revisa tu bandeja de entrada" });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error al enviar el código", variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const email = form.getValues("ownerEmail");
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: "Ingresa el código de 6 dígitos", variant: "destructive" });
      return;
    }
    
    setIsVerifyingOtp(true);
    try {
      const res = await apiRequest("POST", "/api/register/verify-otp", { email, otp: otpCode });
      if (res.ok) {
        setIsOtpVerified(true);
        toast({ title: "Email verificado", description: "Ahora crea tu contraseña" });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Código inválido o expirado", variant: "destructive" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogin = async () => {
    const email = form.getValues("ownerEmail");
    const password = form.getValues("password");
    
    if (!password || password.length < 1) {
      toast({ title: "Introduce tu contraseña", variant: "destructive" });
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/login", { email, password });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.message || "Contraseña incorrecta", variant: "destructive" });
        return;
      }
      await refetchAuth();
      setIsOtpVerified(true);
      toast({ title: "Sesión iniciada correctamente" });
      setStep(4);
    } catch {
      toast({ title: "Error al iniciar sesión", variant: "destructive" });
    }
  };

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
    
    if (step === 3 && !isAuthenticated) {
      const email = form.getValues("ownerEmail");
      const exists = await checkEmailExists(email);
      if (exists) {
        setStep(20);
        return;
      }
    }
    
    if (step === 9) {
      if (isAuthenticated || isOtpVerified) {
        setStep(11);
      } else {
        setStep(10);
      }
      return;
    }

    setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const productId = stateFromUrl.includes("Wyoming") ? 2 : stateFromUrl.includes("Delaware") ? 3 : 1;
      const state = data.state || stateFromUrl;
      
      if (isAuthenticated) {
        const res = await apiRequest("POST", "/api/maintenance/orders", { productId, state });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Error al crear pedido");
        }
        const orderData = await res.json();
        
        await apiRequest("PUT", `/api/maintenance/${orderData.application.id}`, {
          ...data,
          status: "submitted"
        });
        
        setRequestCode(orderData.application.requestCode || "");
        toast({ title: "Solicitud enviada correctamente" });
        clearDraft();
        setLocation(`/contacto?success=true&type=maintenance&orderId=${encodeURIComponent(orderData.application.requestCode || "")}`);
      } else {
        if (!data.password || data.password.length < 8) {
          toast({ title: "La contraseña debe tener al menos 8 caracteres", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        
        const res = await apiRequest("POST", "/api/maintenance/orders", {
          productId,
          state,
          email: data.ownerEmail,
          password: data.password,
          ownerFullName: data.ownerFullName,
          paymentMethod: data.paymentMethod || "transfer"
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Error al crear pedido");
        }
        
        const orderData = await res.json();
        
        await apiRequest("PUT", `/api/maintenance/${orderData.application.id}`, {
          ...data,
          status: "submitted"
        });
        
        setRequestCode(orderData.application.requestCode || "");
        toast({ title: "Solicitud enviada y cuenta creada" });
        clearDraft();
        setLocation(`/contacto?success=true&type=maintenance&orderId=${encodeURIComponent(orderData.application.requestCode || "")}`);
      }
    } catch (err: any) {
      toast({ title: err.message || "Error al enviar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-5 sm:px-6 md:px-8">
        <h1 className="text-3xl md:text-4xl font-black mb-8 md:mb-12 text-primary leading-tight text-center">
          Pack de <span className="text-accent">Mantenimiento</span> LLC
        </h1>
        
        <div>
          <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} className="mb-6" />
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-primary  mb-2 leading-tight">Solicitud de Mantenimiento</h2>
            <Form {...form}>
              <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                
                {/* STEP 0: Ya tienes LLC? */}
                {step === 0 && (
                  <div key="step-0" className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-[#6EDC8A]" /> 1️⃣ ¿Ya tienes una LLC creada?
                    </h2>
                    <FormDescription>Para saber desde dónde partimos</FormDescription>
                    <FormField control={form.control} name="creationSource" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {["Sí", "No (en ese caso, te orientamos primero)"].map((opt) => (
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
                    <Button type="button" onClick={nextStep} className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                  </div>
                )}

                {/* STEP 1: Nombre Completo */}
                {step === 1 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <User className="w-6 h-6 text-[#6EDC8A]" /> 2️⃣ Nombre completo
                    </h2>
                    <FormDescription>El de los documentos oficiales</FormDescription>
                    <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Nombre completo:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Teléfono */}
                {step === 2 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Phone className="w-6 h-6 text-[#6EDC8A]" /> 3️⃣ Teléfono de contacto
                    </h2>
                    <FormDescription>Para avisos importantes y comunicación rápida</FormDescription>
                    <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Teléfono:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Email */}
                {step === 3 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Mail className="w-6 h-6 text-[#6EDC8A]" /> 4️⃣ Email
                    </h2>
                    <FormDescription>Aquí recibirás recordatorios y documentación</FormDescription>
                    <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Email:
                        </FormLabel>
                        <FormControl><Input {...field} type="email" inputMode="email" className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Nombre Legal LLC */}
                {step === 4 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-[#6EDC8A]" /> 5️⃣ Nombre legal de la LLC
                    </h2>
                    <FormDescription>Tal y como figura en los documentos oficiales</FormDescription>
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          Nombre de la LLC:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 5: EIN */}
                {step === 5 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-[#6EDC8A]" /> 6️⃣ EIN
                    </h2>
                    <FormDescription>El número fiscal de tu empresa en EE. UU.</FormDescription>
                    <FormField control={form.control} name="ein" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-black text-primary flex items-center gap-2">
                          EIN:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 6: Estado de constitución */}
                {step === 6 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
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
                          <FormControl><SelectTrigger className="rounded-full h-14 px-6 border-black/20 focus:ring-[#6EDC8A] font-black text-primary text-lg"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="New Mexico">New Mexico</SelectItem><SelectItem value="Wyoming">Wyoming</SelectItem><SelectItem value="Delaware">Delaware</SelectItem></SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 7: Actividad */}
                {step === 7 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-[#6EDC8A]" /> 8️⃣ Actividad
                    </h2>
                    <FormDescription>Tipo de negocio o producto</FormDescription>
                    <FormField control={form.control} name="businessActivity" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-black/20 focus:border-[#6EDC8A] transition-all font-black text-primary placeholder:text-primary/30 text-lg"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 8: Servicios */}
                {step === 8 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <CheckSquare className="w-6 h-6 text-[#6EDC8A]" /> 9️⃣ ¿Qué necesitas gestionar?
                    </h2>
                    <FormDescription>Marca lo que aplique</FormDescription>
                    <FormField control={form.control} name="expectedServices" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {["Recordatorios y cumplimiento anual", "Presentación de documentos obligatorios", "Soporte durante el año", "Revisión general de la situación de la LLC"].map(opt => (
                              <label key={opt} className="flex items-center gap-3 p-4 rounded-[2rem] border border-black/20 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                                <Checkbox 
                                  checked={field.value?.split(", ").includes(opt)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ? field.value.split(", ") : [];
                                    const next = checked ? [...current, opt] : current.filter(v => v !== opt);
                                    field.onChange(next.join(", "));
                                  }}
                                  className="border-black/20 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]"
                                />
                                <span className="font-black text-sm text-primary">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 9: Disolver? */}
                {step === 9 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Trash2 className="w-6 h-6 text-[#6EDC8A]" /> 1️⃣0️⃣ ¿Deseas disolver tu LLC?
                    </h2>
                    <FormDescription>Si necesitas cerrar la empresa de forma correcta y ordenada</FormDescription>
                    <FormField control={form.control} name="wantsDissolve" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {["No", "Sí, quiero disolver mi LLC", "Quiero que me expliquéis primero el proceso"].map((opt) => (
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
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 10: Crear Cuenta */}
                {step === 10 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <User className="w-6 h-6 text-[#6EDC8A]" /> Crea tu cuenta
                    </h2>
                    <p className="text-sm text-muted-foreground">Para gestionar tu pedido necesitas una cuenta. Primero verifica tu email.</p>
                    
                    {!isAuthenticated && (
                      <div className="space-y-6">
                        {/* Step 1: Email verification with OTP */}
                        {!isOtpVerified && (
                          <div className="space-y-4">
                            <div className="bg-gray-50 rounded-2xl p-5">
                              <p className="text-xs font-black text-primary tracking-widest mb-2">TU EMAIL</p>
                              <p className="text-lg font-bold text-primary">{form.getValues("ownerEmail")}</p>
                            </div>
                            
                            {!isOtpSent ? (
                              <Button 
                                type="button" 
                                onClick={sendOtp}
                                disabled={isSendingOtp}
                                className="w-full bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20"
                                data-testid="button-send-otp"
                              >
                                {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
                                {isSendingOtp ? "Enviando..." : "Enviar código de verificación"}
                              </Button>
                            ) : (
                              <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                  <Mail className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                  <p className="text-sm font-bold text-green-700">Código enviado a tu email</p>
                                  <p className="text-xs text-green-600">Revisa tu bandeja de entrada (y spam)</p>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-black text-primary tracking-widest block mb-2">Código de verificación</label>
                                  <Input 
                                    type="text" 
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                        className="rounded-full p-6 border-black/20 focus:border-[#6EDC8A] text-center text-xl tracking-[0.5em] font-mono"
                                    maxLength={6}
                                    data-testid="input-otp-code"
                                  />
                                </div>
                                
                                <Button 
                                  type="button" 
                                  onClick={verifyOtp}
                                  disabled={isVerifyingOtp || otpCode.length !== 6}
                                  className="w-full bg-[#6EDC8A] text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 disabled:opacity-50"
                                  data-testid="button-verify-otp"
                                >
                                  {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                                  {isVerifyingOtp ? "Verificando..." : "Verificar código"}
                                </Button>
                                
                                <button 
                                  type="button"
                                  onClick={() => { setIsOtpSent(false); setOtpCode(""); }}
                                  className="text-xs text-[#6EDC8A] underline w-full text-center"
                                >
                                  Reenviar código
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Step 2: Password creation (only after OTP verified) */}
                        {isOtpVerified && (
                          <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
                              <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                              <p className="text-sm font-bold text-green-700">Email verificado</p>
                            </div>
                            
                            <FormField control={form.control} name="password" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-black text-primary tracking-widest">Contraseña</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password"  className="rounded-full p-6 border-black/20 focus:border-[#6EDC8A]" data-testid="input-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-black text-primary tracking-widest">Confirmar Contraseña</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password"  className="rounded-full p-6 border-black/20 focus:border-[#6EDC8A]" data-testid="input-confirm-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isAuthenticated && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                        <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-black text-green-700">Ya tienes cuenta activa</p>
                        <p className="text-xs text-green-600">Continúa con el siguiente paso</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20">Atrás</Button>
                      <Button 
                        type="button" 
                        onClick={nextStep} 
                        disabled={!isAuthenticated && (!isOtpVerified || !form.getValues("password") || form.getValues("password")!.length < 8 || form.getValues("password") !== form.getValues("confirmPassword"))}
                        className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 disabled:opacity-50"
                        data-testid="button-next-step-10"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 11: Método de Pago */}
                {step === 11 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-[#6EDC8A]" /> Método de Pago
                    </h2>
                    <p className="text-sm text-muted-foreground">Selecciona cómo deseas realizar el pago del servicio de mantenimiento.</p>
                    
                    <div className="bg-[#6EDC8A] text-primary p-6 rounded-[2rem] text-center mb-6">
                      <p className="text-[10px] font-black tracking-widest opacity-50 mb-1">Total a pagar</p>
                      <p className="text-3xl font-black">299.00 €</p>
                      <p className="text-[10px] opacity-80">Mantenimiento Anual</p>
                    </div>
                    
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-4">
                          <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${field.value === 'transfer' ? 'border-[#6EDC8A] bg-[#6EDC8A]/5' : 'border-black/20 bg-white hover:border-[#6EDC8A]/50'}`}>
                            <input type="radio" {...field} value="transfer" checked={field.value === 'transfer'} className="w-5 h-5 accent-[#6EDC8A] mt-1" />
                            <div className="flex-1">
                              <span className="font-black text-primary text-sm block mb-2">Transferencia Bancaria</span>
                              <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-1">
                                <p><span className="opacity-60">Beneficiario:</span> <span className="font-bold">Fortuny Consulting LLC</span></p>
                                <p><span className="opacity-60">Número de cuenta:</span> <span className="font-bold font-mono">141432778929495</span></p>
                                <p><span className="opacity-60">Número de ruta:</span> <span className="font-bold font-mono">121145433</span></p>
                                <p><span className="opacity-60">Banco:</span> <span className="font-bold">Column N.A.</span></p>
                                <p className="opacity-60 text-[10px] pt-2">1 Letterman Drive, Building A, Suite A4-700, San Francisco, CA 94129</p>
                                <p className="pt-2 text-[#6EDC8A] font-bold">Concepto: Tu número de pedido</p>
                              </div>
                            </div>
                          </label>
                          <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${field.value === 'link' ? 'border-[#6EDC8A] bg-[#6EDC8A]/5' : 'border-black/20 bg-white hover:border-[#6EDC8A]/50'}`}>
                            <input type="radio" {...field} value="link" checked={field.value === 'link'} className="w-5 h-5 accent-[#6EDC8A] mt-1" />
                            <div className="flex-1">
                              <span className="font-black text-primary text-sm block mb-1">Link de Pago</span>
                              <p className="text-xs text-muted-foreground">Recibirás un enlace de pago seguro por email para completar la transacción.</p>
                            </div>
                          </label>
                        </div>
                      </FormControl>
                    )} />
                    
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20">Siguiente</Button>
                    </div>
                  </div>
                )}

                {/* STEP 12: Autorización y Consentimiento */}
                {step === 12 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-accent" /> Último paso: Confirmación
                    </h2>
                    <div className="bg-accent/5 p-5 rounded-2xl border border-accent/20 text-xs space-y-2 mb-4">
                      <p><span className="opacity-50">Nombre:</span> <span className="font-black">{form.getValues("ownerFullName")}</span></p>
                      <p><span className="opacity-50">Email:</span> <span className="font-black">{form.getValues("ownerEmail")}</span></p>
                      <p><span className="opacity-50">LLC:</span> <span className="font-black">{form.getValues("companyName")}</span></p>
                      <p><span className="opacity-50">Pago:</span> <span className="font-black">{form.getValues("paymentMethod") === 'transfer' ? 'Transferencia Bancaria' : 'Link de Pago'}</span></p>
                    </div>
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
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 20: Login para usuarios existentes */}
                {step === 20 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      <Lock className="w-6 h-6 text-[#6EDC8A]" /> Inicia sesión
                    </h2>
                    
                    <div className="bg-[#6EDC8A]/10 border border-[#6EDC8A]/30 rounded-2xl p-5 text-center">
                      <User className="w-8 h-8 text-[#6EDC8A] mx-auto mb-3" />
                      <p className="text-sm font-black text-primary mb-1">
                        ¡Hola{existingUserName ? `, ${existingUserName}` : ""}!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ya tienes una cuenta con este email. Inicia sesión para continuar.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5">
                      <p className="text-xs font-black text-primary tracking-widest mb-2">TU EMAIL</p>
                      <p className="text-lg font-bold text-primary">{form.getValues("ownerEmail")}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-primary tracking-widest block">Contraseña</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={form.getValues("password") || ""}
                          onChange={(e) => form.setValue("password", e.target.value)}
                          className="rounded-full p-6 pr-12 border-black/20 focus:border-[#6EDC8A]"
                          data-testid="input-login-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEmailExists(false);
                          setStep(3);
                          form.setValue("ownerEmail", "");
                        }}
                        className="flex-1 rounded-full h-12 md:h-14 font-black border-black/20"
                      >
                        Usar otro email
                      </Button>
                      <Button
                        type="button"
                        onClick={handleLogin}
                        disabled={isCheckingEmail}
                        className="flex-1 bg-[#6EDC8A] text-primary font-black rounded-full h-12 md:h-14 shadow-lg shadow-[#6EDC8A]/20"
                        data-testid="button-login-submit"
                      >
                        {isCheckingEmail ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Iniciar sesión
                      </Button>
                    </div>

                    <div className="text-center">
                      <a href="/recuperar" className="text-xs text-[#6EDC8A] hover:underline">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  </div>
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
