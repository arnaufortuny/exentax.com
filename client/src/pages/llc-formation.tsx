import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Check, Loader2, Eye, EyeOff } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import { StepProgress } from "@/components/ui/step-progress";
import { useFormDraft } from "@/hooks/use-form-draft";

const TOTAL_STEPS = 20;

const formSchema = z.object({
  ownerFullName: z.string().min(1, "Este campo es obligatorio"),
  ownerEmail: z.string().email("Email inválido"),
  ownerPhone: z.string().min(1, "Este campo es obligatorio"),
  companyName: z.string().min(1, "Este campo es obligatorio").refine(
    (val) => val.toUpperCase().trim().endsWith("LLC") || val.toUpperCase().trim().endsWith("L.L.C.") || val.toUpperCase().trim().endsWith("L.L.C"),
    { message: "El nombre debe terminar en LLC (ej: MI EMPRESA LLC)" }
  ),
  companyNameOption2: z.string().optional(),
  ownerNamesAlternates: z.string().optional(),
  state: z.string().min(1, "Este campo es obligatorio"),
  ownerCount: z.number().default(1),
  ownerStreetType: z.string().min(1, "Este campo es obligatorio"),
  ownerAddress: z.string().min(1, "Este campo es obligatorio"),
  ownerCity: z.string().min(1, "Este campo es obligatorio"),
  ownerProvince: z.string().optional(),
  ownerPostalCode: z.string().min(1, "Este campo es obligatorio"),
  ownerCountry: z.string().min(1, "Este campo es obligatorio"),
  ownerBirthDate: z.string().min(1, "Este campo es obligatorio"),
  businessActivity: z.string().min(1, "Este campo es obligatorio"),
  isSellingOnline: z.string().min(1, "Este campo es obligatorio"),
  needsBankAccount: z.string().min(1, "Este campo es obligatorio"),
  willUseStripe: z.string().min(1, "Este campo es obligatorio"),
  wantsBoiReport: z.string().min(1, "Este campo es obligatorio"),
  wantsMaintenancePack: z.string().min(1, "Este campo es obligatorio"),
  notes: z.string().optional(),
  idDocumentUrl: z.string().optional(),
  password: z.string().min(8, "Mínimo 8 caracteres").optional(),
  confirmPassword: z.string().optional(),
  paymentMethod: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function LlcFormation() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [acceptedInfo, setAcceptedInfo] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  
  // OTP verification states
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  // Check for edit parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const editAppId = urlParams.get('edit');

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
      ownerStreetType: "",
      ownerAddress: "",
      ownerCity: "",
      ownerProvince: "",
      ownerPostalCode: "",
      ownerCountry: "",
      ownerBirthDate: "",
      businessActivity: "",
      isSellingOnline: "",
      needsBankAccount: "",
      willUseStripe: "",
      wantsBoiReport: "",
      wantsMaintenancePack: "",
      notes: "",
      idDocumentUrl: "",
      password: "",
      confirmPassword: "",
      paymentMethod: "transfer",
    },
  });

  const prevStepRef = useRef(step);
  const direction = step > prevStepRef.current ? "forward" : "backward";
  
  useEffect(() => {
    prevStepRef.current = step;
  }, [step]);

  const formDefaults = {
    ownerFullName: "",
    ownerEmail: "",
    ownerPhone: "",
    companyName: "",
    companyNameOption2: "",
    ownerNamesAlternates: "",
    state: "New Mexico",
    ownerCount: 1,
    ownerStreetType: "",
    ownerAddress: "",
    ownerCity: "",
    ownerProvince: "",
    ownerPostalCode: "",
    ownerCountry: "",
    ownerBirthDate: "",
    businessActivity: "",
    isSellingOnline: "",
    needsBankAccount: "",
    willUseStripe: "",
    wantsBoiReport: "",
    wantsMaintenancePack: "",
    notes: "",
    idDocumentUrl: ""
  };

  const { clearDraft } = useFormDraft({
    form,
    storageKey: "llc-formation-draft",
    debounceMs: 1000,
    defaultValues: formDefaults,
  });

  useEffect(() => {
    async function init() {
      try {
        // If in edit mode, load existing application data
        if (editAppId) {
          const res = await fetch(`/api/llc/${editAppId}`);
          if (res.ok) {
            const appData = await res.json();
            setAppId(Number(editAppId));
            setIsEditMode(true);
            
            // Populate form with existing data
            form.reset({
              ownerFullName: appData.ownerFullName || "",
              ownerEmail: appData.ownerEmail || "",
              ownerPhone: appData.ownerPhone || "",
              companyName: appData.companyName || "",
              companyNameOption2: appData.companyNameOption2 || "",
              ownerNamesAlternates: appData.ownerNamesAlternates || "",
              state: appData.state || "New Mexico",
              ownerCount: appData.ownerCount || 1,
              ownerStreetType: appData.ownerStreetType || "",
              ownerAddress: appData.ownerAddress || "",
              ownerCity: appData.ownerCity || "",
              ownerProvince: appData.ownerProvince || "",
              ownerPostalCode: appData.ownerPostalCode || "",
              ownerCountry: appData.ownerCountry || appData.ownerCountryResidency || "",
              ownerBirthDate: appData.ownerBirthDate || "",
              businessActivity: appData.businessActivity || "",
              isSellingOnline: appData.isSellingOnline || "",
              needsBankAccount: appData.needsBankAccount || "",
              willUseStripe: appData.willUseStripe || "",
              wantsBoiReport: appData.wantsBoiReport || "",
              wantsMaintenancePack: appData.wantsMaintenancePack || "",
              notes: appData.notes || "",
              idDocumentUrl: appData.idDocumentUrl || ""
            });
            toast({ title: "Datos cargados", description: "Puedes editar tu solicitud" });
          }
        }
        // Order creation is now deferred to the final submit step
      } catch (err) {
        // Silent fail - order will be created on submit
        console.log("Init completed");
      }
    }
    init();
  }, [editAppId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const ownerFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const ownerEmail = user.email || "";
      const ownerPhone = user.phone || "";
      const ownerStreetType = user.streetType || "";
      const ownerAddress = user.address || "";
      const ownerCity = user.city || "";
      const ownerProvince = user.province || "";
      const ownerPostalCode = user.postalCode || "";
      const ownerCountry = user.country || "";
      const ownerBirthDate = user.birthDate || "";
      const businessActivity = user.businessActivity || "";
      
      form.reset({
        ...form.getValues(),
        ownerFullName,
        ownerEmail,
        ownerPhone,
        ownerStreetType,
        ownerAddress,
        ownerCity,
        ownerProvince,
        ownerPostalCode,
        ownerCountry,
        ownerBirthDate,
        businessActivity,
      });
      
      // Skip to first empty required field
      const fieldsToCheck = [
        { step: 0, value: ownerFullName },
        { step: 1, value: ownerEmail },
        { step: 2, value: ownerPhone },
        { step: 3, value: "" }, // companyName - always needs input
      ];
      
      for (const field of fieldsToCheck) {
        if (!field.value) {
          setStep(field.step);
          return;
        }
      }
      // If basic info complete, start at company name (step 3)
      setStep(3);
    }
  }, [isAuthenticated, user, form]);

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

  const nextStep = async () => {
    const stepsValidation: Record<number, (keyof FormValues)[]> = {
      0: ["ownerFullName"],
      1: ["ownerEmail"],
      2: ["ownerPhone"],
      3: ["companyName"],
      4: ["companyNameOption2", "ownerNamesAlternates"],
      5: ["state"],
      6: ["ownerCount"],
      7: ["ownerStreetType", "ownerAddress", "ownerCity", "ownerProvince", "ownerPostalCode", "ownerCountry"],
      8: ["ownerBirthDate"],
      9: ["idDocumentUrl"],
      10: ["businessActivity"],
      11: ["isSellingOnline"],
      12: ["needsBankAccount"],
      13: ["willUseStripe"],
      14: ["wantsBoiReport"],
      15: ["wantsMaintenancePack"],
      16: ["notes"],
    };

    const fieldsToValidate = stepsValidation[step];
    if (fieldsToValidate) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }
    
    // Validate password step (step 17) for non-authenticated users
    if (step === 17 && !isAuthenticated) {
      const password = form.getValues("password");
      const confirmPassword = form.getValues("confirmPassword");
      if (!password || password.length < 8) {
        toast({ title: "Contraseña demasiado corta", description: "Debe tener al menos 8 caracteres", variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Las contraseñas no coinciden", description: "Revísalas y vuelve a intentarlo", variant: "destructive" });
        return;
      }
    }

    // All steps advance normally
    setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // In edit mode, save changes and redirect to dashboard
      if (isEditMode) {
        await apiRequest("PUT", `/api/llc/${appId}`, data);
        toast({ title: "Cambios guardados", description: "Tu información se ha actualizado" });
        clearDraft();
        setLocation("/dashboard");
        return;
      }
      
      // If not authenticated and password provided, create account first
      if (!isAuthenticated && data.password) {
        try {
          const res = await apiRequest("POST", "/api/llc/claim-order", {
            applicationId: appId,
            email: data.ownerEmail,
            password: data.password,
            ownerFullName: data.ownerFullName,
            paymentMethod: data.paymentMethod
          });
          if (!res.ok) {
            const errorData = await res.json();
            toast({ title: "Ha habido un problema", description: errorData.message, variant: "destructive" });
            return;
          }
          toast({ title: "Cuenta creada", description: "Ya casi terminamos" });
        } catch (err) {
          toast({ title: "No se pudo crear la cuenta", description: "Inténtalo de nuevo", variant: "destructive" });
          return;
        }
      }
      
      // Normal flow: submit and proceed to payment
      await apiRequest("PUT", `/api/llc/${appId}`, { ...data, status: "submitted" });
      
      // Update user profile with form data if authenticated
      if (isAuthenticated && user) {
        try {
          const nameParts = data.ownerFullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          await apiRequest("PATCH", "/api/user/profile", {
            firstName,
            lastName,
            phone: data.ownerPhone,
            streetType: data.ownerStreetType,
            address: data.ownerAddress,
            city: data.ownerCity,
            province: data.ownerProvince,
            postalCode: data.ownerPostalCode,
            country: data.ownerCountry,
            birthDate: data.ownerBirthDate,
            businessActivity: data.businessActivity,
          });
        } catch {
          // Profile update failed silently - not critical
        }
      }
      
      toast({ title: "Información guardada", description: "Vamos al siguiente paso" });
      setStep(19); // Payment Step
    } catch {
      toast({ title: "Algo no ha ido bien", description: "Inténtalo de nuevo", variant: "destructive" });
    }
  };
  
  // Save changes in edit mode
  const handleSaveChanges = async () => {
    const data = form.getValues();
    try {
      await apiRequest("PUT", `/api/llc/${appId}`, data);
      
      // Sync user profile with form data
      if (isAuthenticated && user) {
        try {
          const nameParts = data.ownerFullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          await apiRequest("PATCH", "/api/user/profile", {
            firstName,
            lastName,
            phone: data.ownerPhone,
            streetType: data.ownerStreetType,
            address: data.ownerAddress,
            city: data.ownerCity,
            province: data.ownerProvince,
            postalCode: data.ownerPostalCode,
            country: data.ownerCountry,
            birthDate: data.ownerBirthDate,
            businessActivity: data.businessActivity,
          });
        } catch {
          // Profile update failed silently - not critical
        }
      }
      
      toast({ title: "Cambios guardados", description: "Tu información se ha actualizado" });
      clearDraft();
      setLocation("/dashboard");
    } catch {
      toast({ title: "Algo no ha ido bien", description: "Inténtalo de nuevo", variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    toast({ title: "Procesando pago", description: "Un momento..." });
    setTimeout(async () => {
      await apiRequest("POST", `/api/llc/${appId}/pay`, {});
      toast({ title: "Pago completado", description: "Todo listo. Ya estamos trabajando en tu solicitud" });
      setLocation("/contacto?success=true");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 md:px-6">
        {isEditMode && (
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-black text-primary">Modo Edición</p>
              <p className="text-sm text-muted-foreground">Estás modificando los datos de tu pedido pendiente</p>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline" 
                className="rounded-full"
                onClick={() => setLocation("/dashboard")}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                className="bg-accent text-primary font-black rounded-full"
                onClick={handleSaveChanges}
                data-testid="button-save-changes"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-black  mb-2 text-primary leading-tight">
          {isEditMode ? "Modificar datos de " : "Constituir mi "}
          <span className="text-accent">LLC</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-6">
          Constituye tu LLC online en unos clics. Te guiamos paso a paso y nos encargamos de todo.
        </p>
        
        <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} className="mb-8" />
        
        <Form {...form}>
          <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            
            {step === 0 && (
              <div key="step-0" className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣ ¿Cómo te llamas?</h2>
                <FormDescription>El nombre real, el que pondremos en los documentos oficiales</FormDescription>
                <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Nombre completo:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
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

            {step === 1 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">2️⃣ Email de contacto</h2>
                <FormDescription>Aquí te enviaremos los avances y documentos de tu LLC</FormDescription>
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Email:</FormLabel>
                    <FormControl><Input {...field} type="email" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">3️⃣ WhatsApp (muy recomendado)</h2>
                <FormDescription>Para dudas rápidas y avisos importantes</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Teléfono:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">4️⃣ ¿Cómo quieres que se llame tu LLC?</h2>
                <FormDescription>Si no estás 100% seguro, no pasa nada. Lo revisamos contigo</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Nombre deseado:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">5️⃣ ¿Tienes nombres alternativos? (opcional)</h2>
                <FormDescription>Plan B, C o D por si el primero no está disponible</FormDescription>
                <div className="space-y-4">
                  <FormField control={form.control} name="companyNameOption2" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Nombre alternativo 1:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerNamesAlternates" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Nombre alternativo 2:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">6️⃣ Estado donde quieres crear la LLC</h2>
                <FormDescription>Si dudas, te asesoramos antes de continuar</FormDescription>
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["New Mexico", "Wyoming", "Delaware"].map(opt => (
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
                            {field.value === opt && <Check className="w-5 h-5 text-accent" />}
                          </label>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight">7️⃣ Propietario único</h2>
                <FormDescription>Tu LLC tendrá un único propietario al 100%</FormDescription>
                <div className="flex items-center justify-between gap-3 p-4 rounded-full border-2 border-accent bg-accent/10 dark:bg-accent/20">
                  <span className="font-bold text-foreground text-sm md:text-base">Único propietario (100%)</span>
                  <Check className="w-5 h-5 text-accent" />
                </div>
                <div className="bg-muted/50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">¿Necesitas varios socios?</strong><br />
                    Contáctanos para LLCs con dos o más propietarios.
                  </p>
                  <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer" className="inline-block mt-3">
                    <Button type="button" variant="outline" size="sm" className="rounded-full font-bold text-xs">
                      Consultar por WhatsApp
                    </Button>
                  </a>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 7 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">9️⃣ Dirección completa</h2>
                <FormDescription>Tu dirección de residencia habitual</FormDescription>
                
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="ownerStreetType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] md:text-xs tracking-widest opacity-60">Tipo de vía:</FormLabel>
                      <FormControl>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Calle">Calle</SelectItem>
                            <SelectItem value="Avenida">Avenida</SelectItem>
                            <SelectItem value="Plaza">Plaza</SelectItem>
                            <SelectItem value="Paseo">Paseo</SelectItem>
                            <SelectItem value="Camino">Camino</SelectItem>
                            <SelectItem value="Carrera">Carrera</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerAddress" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="font-black text-[10px] md:text-xs tracking-widest opacity-60">Dirección y número:</FormLabel>
                      <FormControl><Input {...field} placeholder="Nombre y número" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="ownerCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] md:text-xs tracking-widest opacity-60">Ciudad:</FormLabel>
                      <FormControl><Input {...field} placeholder="Ciudad" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerProvince" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] md:text-xs tracking-widest opacity-60">Provincia:</FormLabel>
                      <FormControl><Input {...field} placeholder="Provincia" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="ownerPostalCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] md:text-xs tracking-widest opacity-60">Código postal:</FormLabel>
                      <FormControl><Input {...field} placeholder="Código postal" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerCountry" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] md:text-xs tracking-widest opacity-60">País:</FormLabel>
                      <FormControl><Input {...field} placeholder="País" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 8 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">🔟 Fecha de nacimiento</h2>
                <FormField control={form.control} name="ownerBirthDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Fecha:</FormLabel>
                    <FormControl><Input {...field} type="date" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 9 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣1️⃣ Documento de identidad</h2>
                <FormDescription>DNI o pasaporte en vigor (puedes proporcionarlo más tarde)</FormDescription>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-[2rem] p-8 md:p-12 text-center hover:border-accent transition-colors cursor-pointer bg-white dark:bg-zinc-900">
                    <span className="text-3xl md:text-4xl text-gray-300 mx-auto mb-4 block">📄</span>
                    <p className="font-black text-primary text-sm">Subir archivo o arrastrar</p>
                    <p className="text-[10px] text-gray-400 mt-2">JPG, PNG, PDF (Máx 10MB)</p>
                  </div>
                  <FormField control={form.control} name="idDocumentUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">ID del documento (opcional):</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"  /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <label className="flex items-center gap-3 p-4 rounded-[2rem] border border-border bg-white dark:bg-zinc-900 hover:border-accent cursor-pointer transition-all">
                    <Checkbox 
                      checked={form.getValues("idDocumentUrl") === "PENDIENTE"}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          form.setValue("idDocumentUrl", "PENDIENTE");
                        } else {
                          form.setValue("idDocumentUrl", "");
                        }
                      }}
                    />
                    <span className="text-xs md:text-sm font-medium text-primary">Prefiero proporcionarlo más tarde</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 10 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣2️⃣ ¿A qué se dedicará tu LLC?</h2>
                <FormDescription>Explícalo con tus palabras, sin tecnicismos</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-border focus:border-accent"  /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step >= 11 && step <= 16 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                {step === 11 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣3️⃣ ¿Vas a vender online?</h2>
                    <FormField control={form.control} name="isSellingOnline" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Aún no lo sé"].map(opt => (
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
                              {field.value === opt && <Check className="w-5 h-5 text-accent" />}
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 12 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣4️⃣ ¿Necesitas cuenta bancaria?</h2>
                    <FormField control={form.control} name="needsBankAccount" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí, Mercury", "Sí, Relay", "Aún no", "Ya tengo cuenta"].map(opt => (
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
                              {field.value === opt && <Check className="w-5 h-5 text-accent" />}
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 13 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣5️⃣ ¿Usarás Stripe u otra?</h2>
                    <FormField control={form.control} name="willUseStripe" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Stripe", "PayPal", "Ambas", "Otra", "No todavía"].map(opt => (
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
                              {field.value === opt && <Check className="w-5 h-5 text-accent" />}
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 14 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣6️⃣ ¿Quieres el reporte BOI?</h2>
                    <FormField control={form.control} name="wantsBoiReport" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Quiero que me expliquéis esto"].map(opt => (
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
                              {field.value === opt && <Check className="w-5 h-5 text-accent" />}
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 15 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣7️⃣ ¿Quieres Mantenimiento?</h2>
                    <FormField control={form.control} name="wantsMaintenancePack" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Sí", "No", "Quiero info"].map(opt => (
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
                              {field.value === opt && <Check className="w-5 h-5 text-accent" />}
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    )} />
                  </>
                )}
                {step === 16 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣8️⃣ ¿Algo más que debamos saber?</h2>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-border focus:border-accent"  /></FormControl>
                      </FormItem>
                    )} />
                  </>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-12 font-bold border-border transition-all">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">Continuar</Button>
                </div>
              </div>
            )}

            {step === 17 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight">Crea tu cuenta</h2>
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
                            className="w-full bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20"
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
                              <label className="text-xs font-black text-primary tracking-widest block mb-2">Código de verificación</label>
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
                              className="w-full bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 disabled:opacity-50"
                              data-testid="button-verify-otp"
                            >
                              {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                              {isVerifyingOtp ? "Verificando..." : "Verificar código"}
                            </Button>
                            
                            <button 
                              type="button"
                              onClick={() => { setIsOtpSent(false); setOtpCode(""); }}
                              className="text-xs text-accent underline w-full text-center"
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
                            <FormLabel className="text-xs font-black text-primary tracking-widest">Contraseña</FormLabel>
                            <FormControl>
                              <Input {...field} type="password"  className="rounded-full p-6 border-border focus:border-accent" data-testid="input-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black text-primary tracking-widest">Confirmar Contraseña</FormLabel>
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
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-border">Volver</Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!isAuthenticated && (!isOtpVerified || !form.getValues("password") || form.getValues("password")!.length < 8 || form.getValues("password") !== form.getValues("confirmPassword"))}
                    className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 disabled:opacity-50"
                    data-testid="button-next-step-18"
                  >
                    SIGUIENTE
                  </Button>
                </div>
              </div>
            )}

            {step === 18 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight">Método de Pago</h2>
                <p className="text-sm text-muted-foreground">Selecciona cómo deseas realizar el pago de tu LLC.</p>
                
                <div className="bg-accent text-primary p-6 rounded-[2rem] text-center mb-6">
                  <p className="text-[10px] font-black tracking-widest opacity-50 mb-1">Total a pagar</p>
                  <p className="text-3xl font-black">399.00 €</p>
                  <p className="text-[10px] opacity-80">Incluye tasas estatales de {form.getValues("state")}</p>
                </div>
                
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormControl>
                    <div className="flex flex-col gap-4">
                      <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${field.value === 'transfer' ? 'border-accent bg-accent/5' : 'border-border bg-white dark:bg-zinc-900 hover:border-accent/50'}`}>
                        <input type="radio" {...field} value="transfer" checked={field.value === 'transfer'} className="w-5 h-5 accent-accent mt-1" />
                        <div className="flex-1">
                          <span className="font-black text-primary text-sm block mb-2">Transferencia Bancaria</span>
                          <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-xs space-y-1">
                            <p><span className="opacity-60">Beneficiario:</span> <span className="font-bold">Fortuny Consulting LLC</span></p>
                            <p><span className="opacity-60">Número de cuenta:</span> <span className="font-bold font-mono">141432778929495</span></p>
                            <p><span className="opacity-60">Número de ruta:</span> <span className="font-bold font-mono">121145433</span></p>
                            <p><span className="opacity-60">Banco:</span> <span className="font-bold">Column N.A.</span></p>
                            <p className="opacity-60 text-[10px] pt-2">1 Letterman Drive, Building A, Suite A4-700, San Francisco, CA 94129</p>
                            <p className="pt-2 text-accent font-bold">Concepto: Tu número de pedido</p>
                          </div>
                        </div>
                      </label>
                      <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${field.value === 'link' ? 'border-accent bg-accent/5' : 'border-border bg-white dark:bg-zinc-900 hover:border-accent/50'}`}>
                        <input type="radio" {...field} value="link" checked={field.value === 'link'} className="w-5 h-5 accent-accent mt-1" />
                        <div className="flex-1">
                          <span className="font-black text-primary text-sm block mb-1">Link de Pago</span>
                          <p className="text-xs text-muted-foreground">Recibirás un enlace de pago seguro por email para completar la transacción.</p>
                        </div>
                      </label>
                    </div>
                  </FormControl>
                )} />
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-border">Volver</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20">Continuar</Button>
                </div>
              </div>
            )}

            {step === 19 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-primary border-b border-accent/20 pb-2 leading-tight">Revisión Final</h2>
                <div className="bg-accent/5 p-6 md:p-8 rounded-[2rem] border border-accent/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <p className="flex justify-between md:block"><span className="opacity-50">Nombre:</span> <span className="font-black">{form.getValues("ownerFullName")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">Email:</span> <span className="font-black">{form.getValues("ownerEmail")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">LLC:</span> <span className="font-black">{form.getValues("companyName")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">Estado:</span> <span className="font-black">{form.getValues("state")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50">Pago:</span> <span className="font-black">{form.getValues("paymentMethod") === 'transfer' ? 'Transferencia Bancaria' : 'Link de Pago'}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-primary tracking-widest opacity-60">Consentimientos</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-4 p-4 rounded-[2rem] border border-border bg-white dark:bg-zinc-900 hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                      <Checkbox checked={acceptedInfo} onCheckedChange={(checked) => setAcceptedInfo(!!checked)} className="mt-1" />
                      <span className="text-xs md:text-sm font-black text-primary leading-tight">Confirmo que la información es correcta y autorizo a Easy US LLC a procesar mi solicitud.</span>
                    </label>
                    <label className="flex items-start gap-4 p-4 rounded-[2rem] border border-border bg-white dark:bg-zinc-900 hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
                      <Checkbox checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(!!checked)} className="mt-1" />
                      <span className="text-xs md:text-sm font-black text-primary leading-tight">
                        Acepto los <Link href="/legal/terminos" className="text-accent underline" target="_blank">Términos y Condiciones</Link> de Easy US LLC y el tratamiento de mis datos.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={!acceptedInfo || !acceptedTerms}
                    className="w-full bg-accent text-primary font-black py-8 rounded-full text-lg md:text-xl tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar Solicitud
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep(0)} className="text-primary/50 font-black text-[10px] tracking-widest">Empezar de nuevo</Button>
                </div>
              </div>
            )}
            
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
