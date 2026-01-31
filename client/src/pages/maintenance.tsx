import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Check, Loader2, Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
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
  creationSource: z.string().min(1, "Este campo es obligatorio"),
  ownerFullName: z.string().min(1, "Este campo es obligatorio"),
  ownerPhone: z.string().min(1, "Este campo es obligatorio"),
  ownerEmail: z.string().email("Email inválido"),
  companyName: z.string().min(1, "Este campo es obligatorio"),
  ein: z.string().min(1, "Este campo es obligatorio"),
  state: z.string().min(1, "Este campo es obligatorio"),
  creationYear: z.string().optional(),
  bankAccount: z.string().optional(),
  paymentGateway: z.string().optional(),
  businessActivity: z.string().min(1, "Este campo es obligatorio"),
  expectedServices: z.string().min(1, "Este campo es obligatorio"),
  wantsDissolve: z.string().min(1, "Este campo es obligatorio"),
  notes: z.string().optional(),
  password: z.string().min(8, "Mínimo 8 caracteres").optional(),
  confirmPassword: z.string().optional(),
  paymentMethod: z.string().optional(),
  discountCode: z.string().optional(),
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  
  // OTP verification states
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{ valid: boolean; discountAmount: number; message?: string } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

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
      creationYear: "",
      bankAccount: "",
      paymentGateway: "",
      businessActivity: "",
      expectedServices: "",
      wantsDissolve: "No",
      notes: "",
      password: "",
      confirmPassword: "",
      paymentMethod: "transfer",
      discountCode: "",
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
    creationYear: "",
    bankAccount: "",
    paymentGateway: "",
    businessActivity: "",
    expectedServices: "",
    wantsDissolve: "No",
    notes: "",
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

  const state = form.watch("state");
  const maintenancePriceMap: Record<string, number> = { "New Mexico": 53900, "Wyoming": 69900, "Delaware": 89900 };
  const maintenancePrice = maintenancePriceMap[state] || 53900;

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountInfo(null);
      return;
    }
    setIsValidatingDiscount(true);
    try {
      const res = await apiRequest("POST", "/api/discount-codes/validate", { code: code.trim(), orderAmount: maintenancePrice });
      const data = await res.json();
      setDiscountInfo(data);
      if (data.valid) {
        toast({ title: "Descuento aplicado", description: `Se ha aplicado correctamente a tu pedido (${(data.discountAmount / 100).toFixed(2)}€)` });
      } else {
        toast({ title: "Código no válido", description: "El descuento introducido no es correcto", variant: "destructive" });
      }
    } catch {
      setDiscountInfo({ valid: false, discountAmount: 0, message: "Error al validar" });
    } finally {
      setIsValidatingDiscount(false);
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
      toast({ title: "Falta tu email", description: "Necesitamos tu email para continuar", variant: "destructive" });
      return;
    }
    
    setIsSendingOtp(true);
    try {
      const res = await apiRequest("POST", "/api/register/send-otp", { email });
      if (res.ok) {
        setIsOtpSent(true);
        toast({ title: "Código enviado", description: "Revisa tu correo, te esperamos aquí" });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error al enviar", description: "Inténtalo de nuevo en unos segundos", variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const email = form.getValues("ownerEmail");
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: "Falta el código", description: "Introduce el código de 6 dígitos", variant: "destructive" });
      return;
    }
    
    setIsVerifyingOtp(true);
    try {
      const res = await apiRequest("POST", "/api/register/verify-otp", { email, otp: otpCode });
      if (res.ok) {
        setIsOtpVerified(true);
        toast({ title: "Email verificado", description: "Perfecto. Ya puedes continuar" });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Código incorrecto", description: "El código no es válido o ha caducado", variant: "destructive" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogin = async () => {
    const email = form.getValues("ownerEmail");
    const password = form.getValues("password");
    
    if (!password || password.length < 1) {
      toast({ title: "Falta tu contraseña", description: "Introduce tu contraseña para continuar", variant: "destructive" });
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/login", { email, password });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: "Contraseña incorrecta", description: "Revísala y vuelve a intentarlo", variant: "destructive" });
        return;
      }
      await refetchAuth();
      setIsOtpVerified(true);
      toast({ title: "Nos alegra verte otra vez", description: "Ya puedes continuar" });
      setStep(4);
    } catch {
      toast({ title: "Error de conexión", description: "Inténtalo de nuevo", variant: "destructive" });
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
    
    if (step === 0 && form.getValues("creationSource")?.includes("No")) {
      toast({ 
        title: "Te orientamos primero", 
        description: "Como aún no tienes una LLC, te guiaremos en el proceso de creación." 
      });
      setLocation("/llc/formation");
      return;
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
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const productId = stateFromUrl.includes("Wyoming") ? 2 : stateFromUrl.includes("Delaware") ? 3 : 1;
      const state = data.state || stateFromUrl;
      
      if (isAuthenticated) {
        const orderPayload: any = { productId, state };
        if (discountInfo?.valid && data.discountCode) {
          orderPayload.discountCode = data.discountCode;
          orderPayload.discountAmount = discountInfo.discountAmount;
        }
        const res = await apiRequest("POST", "/api/maintenance/orders", orderPayload);
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
        toast({ title: "Solicitud recibida", description: "Ya estamos trabajando en ello" });
        clearDraft();
        setLocation(`/contacto?success=true&type=maintenance&orderId=${encodeURIComponent(orderData.application.requestCode || "")}`);
      } else {
        if (!data.password || data.password.length < 8) {
          toast({ title: "Contraseña demasiado corta", description: "Debe tener al menos 8 caracteres", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        
        const orderPayload: any = {
          productId,
          state,
          email: data.ownerEmail,
          password: data.password,
          ownerFullName: data.ownerFullName,
          paymentMethod: data.paymentMethod || "transfer"
        };
        if (discountInfo?.valid && data.discountCode) {
          orderPayload.discountCode = data.discountCode;
          orderPayload.discountAmount = discountInfo.discountAmount;
        }
        const res = await apiRequest("POST", "/api/maintenance/orders", orderPayload);
        
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
        toast({ title: "Cuenta creada y solicitud enviada", description: "Todo listo. Nos ponemos en marcha" });
        clearDraft();
        setLocation(`/contacto?success=true&type=maintenance&orderId=${encodeURIComponent(orderData.application.requestCode || "")}`);
      }
    } catch (err: any) {
      toast({ title: "Algo no ha ido bien", description: "Inténtalo de nuevo en unos segundos", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-green-gradient-subtle font-sans w-full">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-16 max-w-4xl mx-auto px-5 sm:px-6 md:px-8">
        <h1 className="text-2xl md:text-4xl font-black mb-2 text-primary leading-tight text-center">
          Cuidamos tu <span className="text-accent">LLC</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6 text-center">
          Nos encargamos del mantenimiento para que tú te centres en tu negocio.
        </p>
        
        <div>
          <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} className="mb-6" />
          <div className="space-y-6">
            <Form {...form}>
              <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                
                {/* STEP 0: Ya tienes LLC? */}
                {step === 0 && (
                  <div key="step-0" className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      1️⃣ ¿Ya tienes una LLC creada?
                    </h2>
                    <FormDescription>Para saber desde dónde partimos</FormDescription>
                    <FormField control={form.control} name="creationSource" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {["Sí", "No (en ese caso, te orientamos primero)"].map((opt) => (
                              <label 
                                key={opt} 
                                onClick={() => field.onChange(opt)}
                                className={`flex items-center justify-between gap-3 p-4 rounded-full border-2 cursor-pointer transition-all active:scale-[0.98] ${
                                  field.value === opt 
                                    ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                    : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-accent/50'
                                }`}
                              >
                                <span className="font-bold text-foreground text-sm md:text-base">{opt}</span>
                                {field.value === opt && <Check className="w-5 h-5 text-accent flex-shrink-0" />}
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" onClick={nextStep} className="w-full bg-accent hover:bg-accent/90 text-black font-bold h-12 rounded-full text-base transition-all">Continuar</Button>
                    
                    {!isAuthenticated && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground font-medium">o continúa de forma rápida</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => window.location.href = '/api/auth/google'}
                          className="w-full h-12 rounded-full border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all font-bold flex items-center justify-center gap-3"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Acceder con Google
                        </Button>
                        
                        <p className="text-center text-xs text-muted-foreground">
                          o <Link href="/auth/login" className="text-accent font-bold underline">inicia sesión</Link> con email para ir más rápido
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 1: Nombre Completo */}
                {step === 1 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      2️⃣ Nombre completo
                    </h2>
                    <FormDescription>El de los documentos oficiales</FormDescription>
                    <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          Nombre completo:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Teléfono */}
                {step === 2 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      3️⃣ Teléfono de contacto
                    </h2>
                    <FormDescription>Para avisos importantes y comunicación rápida</FormDescription>
                    <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          Teléfono:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Email */}
                {step === 3 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      4️⃣ Email
                    </h2>
                    <FormDescription>Aquí recibirás recordatorios y documentación</FormDescription>
                    <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          Email:
                        </FormLabel>
                        <FormControl><Input {...field} type="email" inputMode="email" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Nombre Legal LLC */}
                {step === 4 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      5️⃣ Nombre legal de la LLC
                    </h2>
                    <FormDescription>Tal y como figura en los documentos oficiales</FormDescription>
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          Nombre de la LLC:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 5: EIN */}
                {step === 5 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      6️⃣ EIN
                    </h2>
                    <FormDescription>El número fiscal de tu empresa en EE. UU.</FormDescription>
                    <FormField control={form.control} name="ein" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          EIN:
                        </FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 6: Estado de constitución y detalles de la LLC */}
                {step === 6 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">
                      7️⃣ Detalles de tu LLC
                    </h2>
                    <FormDescription>Información sobre la constitución y situación actual</FormDescription>
                    
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground">Estado de constitución</FormLabel>
                        <FormControl>
                          <NativeSelect 
                            value={field.value || ""} 
                            onValueChange={field.onChange}
                            placeholder="Seleccionar estado"
                            className="rounded-full h-14 px-6 border-border bg-white dark:bg-zinc-900 font-bold text-foreground text-lg"
                          >
                            <NativeSelectItem value="New Mexico">New Mexico</NativeSelectItem>
                            <NativeSelectItem value="Wyoming">Wyoming</NativeSelectItem>
                            <NativeSelectItem value="Delaware">Delaware</NativeSelectItem>
                          </NativeSelect>
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="creationYear" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground">Año de creación</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="bankAccount" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground">Cuenta bancaria USA (opcional)</FormLabel>
                        <FormControl>
                          <NativeSelect 
                            value={field.value || ""} 
                            onValueChange={field.onChange}
                            placeholder="Selecciona si tienes cuenta"
                            className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          >
                            <NativeSelectItem value="Mercury">Mercury</NativeSelectItem>
                            <NativeSelectItem value="Relay">Relay</NativeSelectItem>
                            <NativeSelectItem value="Otro banco">Otro banco</NativeSelectItem>
                            <NativeSelectItem value="No tengo cuenta">No tengo cuenta</NativeSelectItem>
                          </NativeSelect>
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="paymentGateway" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground">Pasarela de pagos (opcional)</FormLabel>
                        <FormControl>
                          <NativeSelect 
                            value={field.value || ""} 
                            onValueChange={field.onChange}
                            placeholder="Selecciona pasarela"
                            className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          >
                            <NativeSelectItem value="Stripe">Stripe</NativeSelectItem>
                            <NativeSelectItem value="PayPal">PayPal</NativeSelectItem>
                            <NativeSelectItem value="Stripe y PayPal">Stripe y PayPal</NativeSelectItem>
                            <NativeSelectItem value="Otra">Otra</NativeSelectItem>
                            <NativeSelectItem value="Ninguna">Ninguna</NativeSelectItem>
                          </NativeSelect>
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 7: Actividad */}
                {step === 7 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">
                      8️⃣ Actividad
                    </h2>
                    <FormDescription>Tipo de negocio o producto</FormDescription>
                    <FormField control={form.control} name="businessActivity" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-border focus:border-accent transition-all font-bold text-foreground placeholder:text-primary/30 text-lg"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 8: Servicios */}
                {step === 8 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      9️⃣ ¿Qué necesitas gestionar?
                    </h2>
                    <FormDescription>Marca lo que aplique</FormDescription>
                    <FormField control={form.control} name="expectedServices" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {["Recordatorios y cumplimiento anual", "Presentación de documentos obligatorios", "Soporte durante el año", "Revisión general de la situación de la LLC"].map(opt => (
                              <label key={opt} className="flex items-center gap-3 p-4 rounded-[2rem] border border-border bg-white dark:bg-zinc-900 hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                                <Checkbox 
                                  checked={field.value?.split(", ").includes(opt)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ? field.value.split(", ") : [];
                                    const next = checked ? [...current, opt] : current.filter(v => v !== opt);
                                    field.onChange(next.join(", "));
                                  }}
                                  className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-[#6EDC8A]"
                                />
                                <span className="font-black text-sm text-primary">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 9: Disolver? */}
                {step === 9 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">
                      1️⃣0️⃣ ¿Deseas disolver tu LLC?
                    </h2>
                    <FormDescription>Si necesitas cerrar la empresa de forma correcta y ordenada</FormDescription>
                    <FormField control={form.control} name="wantsDissolve" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {["No", "Sí, quiero disolver mi LLC", "Quiero que me expliquéis primero el proceso"].map((opt) => (
                              <label 
                                key={opt} 
                                onClick={() => field.onChange(opt)}
                                className={`flex items-center justify-between gap-3 p-4 rounded-full border-2 cursor-pointer transition-all active:scale-[0.98] ${
                                  field.value === opt 
                                    ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                    : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-accent/50'
                                }`}
                              >
                                <span className="font-bold text-foreground text-sm md:text-base">{opt}</span>
                                {field.value === opt && <Check className="w-5 h-5 text-accent flex-shrink-0" />}
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 10: Crear Cuenta */}
                {step === 10 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      Crea tu cuenta
                    </h2>
                    <p className="text-sm text-muted-foreground">Para gestionar tu pedido necesitas una cuenta. Primero verifica tu email.</p>
                    
                    {!isAuthenticated && (
                      <div className="space-y-6">
                        {/* Step 1: Email verification with OTP */}
                        {!isOtpVerified && (
                          <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-5">
                              <p className="text-xs font-black text-foreground tracking-widest mb-2">TU EMAIL</p>
                              <p className="text-lg font-bold text-foreground">{form.getValues("ownerEmail")}</p>
                            </div>
                            
                            {!isOtpSent ? (
                              <Button 
                                type="button" 
                                onClick={sendOtp}
                                disabled={isSendingOtp}
                                className="w-full bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20"
                                data-testid="button-send-otp"
                              >
                                {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {isSendingOtp ? "Enviando..." : "Enviar código de verificación"}
                              </Button>
                            ) : (
                              <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                  <span className="text-2xl font-black text-green-600 block mb-2">✓</span>
                                  <p className="text-sm font-bold text-green-700">Código enviado a tu email</p>
                                  <p className="text-xs text-green-600">Revisa tu bandeja de entrada (y spam)</p>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-bold text-foreground tracking-widest block mb-2">Código de verificación</label>
                                  <Input 
                                    type="text" 
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                        className="rounded-full p-6 border-border focus:border-accent text-center text-xl tracking-[0.5em] font-mono"
                                    maxLength={6}
                                    data-testid="input-otp-code"
                                  />
                                </div>
                                
                                <Button 
                                  type="button" 
                                  onClick={verifyOtp}
                                  disabled={isVerifyingOtp || otpCode.length !== 6}
                                  className="w-full bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 disabled:opacity-50"
                                  data-testid="button-verify-otp"
                                >
                                  {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
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
                              <span className="text-2xl font-black text-green-600 block mb-2">✓</span>
                              <p className="text-sm font-bold text-green-700">Email verificado</p>
                            </div>
                            
                            <FormField control={form.control} name="password" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-foreground tracking-widest">Contraseña</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password"  className="rounded-full p-6 border-border focus:border-accent" data-testid="input-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-foreground tracking-widest">Confirmar Contraseña</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password"  className="rounded-full p-6 border-border focus:border-accent" data-testid="input-confirm-password" />
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
                        <span className="text-3xl font-black text-green-600 block mb-2">✓</span>
                        <p className="text-sm font-black text-green-700">Ya tienes cuenta activa</p>
                        <p className="text-xs text-green-600">Continúa con el siguiente paso</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button 
                        type="button" 
                        onClick={nextStep} 
                        disabled={!isAuthenticated && (!isOtpVerified || !form.getValues("password") || form.getValues("password")!.length < 8 || form.getValues("password") !== form.getValues("confirmPassword"))}
                        className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all disabled:opacity-50"
                        data-testid="button-next-step-10"
                      >
                        Continuar
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 11: Método de Pago */}
                {step === 11 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-[#6EDC8A]/20 pb-2 leading-tight">
                      1️⃣1️⃣ Método de Pago
                    </h2>
                    <p className="text-sm text-muted-foreground">Selecciona cómo deseas realizar el pago del servicio de mantenimiento.</p>
                    
                    <div className="bg-accent text-primary p-6 rounded-[2rem] text-center mb-6">
                      <p className="text-[10px] font-black tracking-widest opacity-50 mb-1">Total a pagar</p>
                      <p className="text-3xl font-black">
                        {discountInfo?.valid 
                          ? `${((maintenancePrice - discountInfo.discountAmount) / 100).toFixed(2)} €` 
                          : `${(maintenancePrice / 100).toFixed(2)} €`}
                      </p>
                      {discountInfo?.valid && (
                        <p className="text-xs line-through opacity-60">{(maintenancePrice / 100).toFixed(2)} €</p>
                      )}
                      <p className="text-[10px] opacity-80">Mantenimiento Anual</p>
                    </div>

                    <div className="space-y-3 p-5 rounded-2xl border-2 border-border bg-white dark:bg-zinc-900 mb-6">
                      <label className="font-bold text-foreground text-sm block">Código de descuento</label>
                      <div className="flex gap-2">
                        <FormField control={form.control} name="discountCode" render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                {...field} 
                                className="rounded-full h-11 px-4 border-border focus:border-accent uppercase" 
                                onChange={(e) => {
                                  field.onChange(e.target.value.toUpperCase());
                                  setDiscountInfo(null);
                                }}
                                data-testid="input-discount-code" 
                              />
                            </FormControl>
                          </FormItem>
                        )} />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => validateDiscountCode(form.getValues("discountCode") || "")}
                          disabled={isValidatingDiscount || !form.getValues("discountCode")}
                          className="rounded-full h-11 px-6 font-black border-border"
                          data-testid="button-validate-discount"
                        >
                          {isValidatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                        </Button>
                      </div>
                      {discountInfo && (
                        <div className={`text-sm p-3 rounded-xl ${discountInfo.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {discountInfo.valid 
                            ? `Descuento aplicado: -${(discountInfo.discountAmount / 100).toFixed(2)}€` 
                            : discountInfo.message}
                        </div>
                      )}
                    </div>
                    
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-4">
                          <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${field.value === 'transfer' ? 'border-[#6EDC8A] bg-accent/5' : 'border-border bg-white dark:bg-zinc-900 hover:border-accent/50'}`}>
                            <input type="radio" {...field} value="transfer" checked={field.value === 'transfer'} className="w-5 h-5 accent-[#6EDC8A] mt-1" />
                            <div className="flex-1">
                              <span className="font-bold text-foreground text-sm block mb-2">Transferencia Bancaria</span>
                              <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-xs space-y-1">
                                <p><span className="opacity-60">Beneficiario:</span> <span className="font-bold">Fortuny Consulting LLC</span></p>
                                <p><span className="opacity-60">Número de cuenta:</span> <span className="font-bold font-mono">141432778929495</span></p>
                                <p><span className="opacity-60">Número de ruta:</span> <span className="font-bold font-mono">121145433</span></p>
                                <p><span className="opacity-60">Banco:</span> <span className="font-bold">Column N.A.</span></p>
                                <p className="opacity-60 text-[10px] pt-2">1 Letterman Drive, Building A, Suite A4-700, San Francisco, CA 94129</p>
                                <p className="pt-2 text-[#6EDC8A] font-bold">Concepto: Tu número de pedido</p>
                              </div>
                            </div>
                          </label>
                          <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${field.value === 'link' ? 'border-[#6EDC8A] bg-accent/5' : 'border-border bg-white dark:bg-zinc-900 hover:border-accent/50'}`}>
                            <input type="radio" {...field} value="link" checked={field.value === 'link'} className="w-5 h-5 accent-[#6EDC8A] mt-1" />
                            <div className="flex-1">
                              <span className="font-bold text-foreground text-sm block mb-1">Link de Pago</span>
                              <p className="text-xs text-muted-foreground">Recibirás un enlace de pago seguro por email para completar la transacción.</p>
                            </div>
                          </label>
                        </div>
                      </FormControl>
                    )} />
                    
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                    </div>
                  </div>
                )}

                {/* STEP 12: Autorización y Consentimiento */}
                {step === 12 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      Último paso: Confirmación
                    </h2>
                    <div className="bg-accent/5 p-5 rounded-2xl border border-accent/20 text-xs space-y-2 mb-4">
                      <p><span className="opacity-50">Nombre:</span> <span className="font-black">{form.getValues("ownerFullName")}</span></p>
                      <p><span className="opacity-50">Email:</span> <span className="font-black">{form.getValues("ownerEmail")}</span></p>
                      <p><span className="opacity-50">LLC:</span> <span className="font-black">{form.getValues("companyName")}</span></p>
                      <p><span className="opacity-50">Estado:</span> <span className="font-black">{form.getValues("state")}</span></p>
                      <p><span className="opacity-50">EIN:</span> <span className="font-black">{form.getValues("ein")}</span></p>
                      <p><span className="opacity-50">Pago:</span> <span className="font-black">{form.getValues("paymentMethod") === 'transfer' ? 'Transferencia Bancaria' : 'Link de Pago'}</span></p>
                    </div>
                    
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-foreground">Notas adicionales (opcional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="rounded-2xl min-h-[80px] p-4 border-border focus:border-accent transition-all text-foreground" />
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <div className="space-y-4">
                      <FormField control={form.control} name="authorizedManagement" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">Autorizo a Easy US LLC a gestionar administrativamente mi LLC ante los organismos competentes.</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="dataProcessingConsent" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">Acepto el tratamiento de mis datos personales según la política de privacidad.</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="termsConsent" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">He leído y acepto los Términos y Condiciones de Easy US LLC.</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                    </div>
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all disabled:opacity-50"
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
                    <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      Inicia sesión
                    </h2>
                    
                    <div className="bg-accent/10 border border-[#6EDC8A]/30 rounded-2xl p-5 text-center">
                                            <p className="text-sm font-bold text-foreground mb-1">
                        ¡Hola{existingUserName ? `, ${existingUserName}` : ""}!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ya tienes una cuenta con este email. Inicia sesión para continuar.
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-5">
                      <p className="text-xs font-black text-foreground tracking-widest mb-2">TU EMAIL</p>
                      <p className="text-lg font-bold text-foreground">{form.getValues("ownerEmail")}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-foreground tracking-widest block">Contraseña</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={form.getValues("password") || ""}
                          onChange={(e) => form.setValue("password", e.target.value)}
                          className="rounded-full p-6 pr-12 border-border focus:border-accent"
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
                        className="flex-1 rounded-full h-12 font-bold border-border transition-all"
                      >
                        Usar otro email
                      </Button>
                      <Button
                        type="button"
                        onClick={handleLogin}
                        disabled={isCheckingEmail}
                        className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all"
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
