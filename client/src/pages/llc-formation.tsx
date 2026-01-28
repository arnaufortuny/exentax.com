import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { useAuth } from "@/hooks/use-auth";
import { StepProgress } from "@/components/ui/step-progress";
import { useFormDraft } from "@/hooks/use-form-draft";

const TOTAL_STEPS = 19;

const formSchema = z.object({
  ownerFullName: z.string().min(1, "Requerido"),
  ownerEmail: z.string().email("Email inválido"),
  ownerPhone: z.string().min(1, "Requerido"),
  companyName: z.string().min(1, "Requerido").refine(
    (val) => val.toUpperCase().trim().endsWith("LLC") || val.toUpperCase().trim().endsWith("L.L.C.") || val.toUpperCase().trim().endsWith("L.L.C"),
    { message: "El nombre debe terminar en LLC (ej: MI EMPRESA LLC)" }
  ),
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
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [acceptedInfo, setAcceptedInfo] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  
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
            setIsEmailVerified(true); // Skip email verification for edit mode
            
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
              ownerCountryResidency: appData.ownerCountryResidency || "",
              ownerAddress: appData.ownerAddress || "",
              ownerBirthDate: appData.ownerBirthDate || "",
              businessActivity: appData.businessActivity || "",
              isSellingOnline: appData.isSellingOnline || "",
              needsBankAccount: appData.needsBankAccount || "",
              willUseStripe: appData.willUseStripe || "",
              wantsBoiReport: appData.wantsBoiReport || "",
              wantsMaintenancePack: appData.wantsMaintenancePack || "",
              notes: appData.notes || "",
              idDocumentUrl: appData.idDocumentUrl || "",
              otp: ""
            });
            toast({ title: "Datos cargados", description: "Puedes modificar los datos de tu solicitud" });
            return;
          }
        }
        
        // Normal flow: create new order
        const res = await apiRequest("POST", "/api/orders", { productId: 1 });
        const data = await res.json();
        setAppId(data.application.id);
      } catch (err) {
        toast({ title: "Error al iniciar", description: "No se pudo cargar la solicitud", variant: "destructive" });
      }
    }
    init();
  }, [editAppId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fullAddress = [user.streetType, user.address, user.city, user.province, user.postalCode, user.country]
        .filter(Boolean).join(', ');
      const ownerFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const ownerEmail = user.email || "";
      const ownerPhone = user.phone || "";
      const ownerAddress = fullAddress || user.address || "";
      const ownerCountryResidency = user.country || "";
      const ownerBirthDate = user.birthDate || "";
      const businessActivity = user.businessActivity || "";
      
      form.reset({
        ...form.getValues(),
        ownerFullName,
        ownerEmail,
        ownerPhone,
        ownerAddress,
        ownerCountryResidency,
        ownerBirthDate,
        businessActivity,
      });
      
      if (user.emailVerified) {
        setIsEmailVerified(true);
      }
      
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
      // In edit mode, save changes and redirect to dashboard
      if (isEditMode) {
        await apiRequest("PUT", `/api/llc/${appId}`, data);
        toast({ title: "Datos actualizados", description: "Los cambios han sido guardados correctamente." });
        clearDraft();
        setLocation("/dashboard");
        return;
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
            address: data.ownerAddress,
            country: data.ownerCountryResidency,
            birthDate: data.ownerBirthDate,
            businessActivity: data.businessActivity,
          });
        } catch {
          // Profile update failed silently - not critical
        }
      }
      
      toast({ title: "Información guardada", description: "Procediendo al pago..." });
      setStep(20); // Payment Step
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
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
            address: data.ownerAddress,
            country: data.ownerCountryResidency,
            birthDate: data.ownerBirthDate,
            businessActivity: data.businessActivity,
          });
        } catch {
          // Profile update failed silently - not critical
        }
      }
      
      toast({ title: "Datos actualizados", description: "Los cambios han sido guardados correctamente." });
      clearDraft();
      setLocation("/dashboard");
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
        
        <h1 className="text-3xl md:text-4xl font-black  mb-4 text-primary leading-tight">
          {isEditMode ? "Modificar datos de " : "Constituir mi "}
          <span className="text-accent">LLC</span>
        </h1>
        
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
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-100 focus:border-accent" placeholder="Tu nombre" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-accent text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
              </div>
            )}

            {step === 1 && (
              <div key={"step-" + step} className="space-y-6 text-left">
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
              </div>
            )}

            {step === 2 && (
              <div key={"step-" + step} className="space-y-6 text-left">
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
              </div>
            )}

            {step === 3 && (
              <div key={"step-" + step} className="space-y-6 text-left">
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
              </div>
            )}

            {step === 6 && (
              <div key={"step-" + step} className="space-y-6 text-left">
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
              </div>
            )}

            {step === 7 && (
              <div key={"step-" + step} className="space-y-6 text-left">
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
              </div>
            )}

            {step === 8 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">🔟 Dirección completa</h2>
                <FormDescription>Calle, número, ciudad, código postal y país de tu residencia habitual</FormDescription>
                <FormField control={form.control} name="ownerAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Dirección completa:</FormLabel>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-100 focus:border-accent" placeholder="Ej: Calle Mayor 15, 2ºB&#10;28001 Madrid&#10;España" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </div>
            )}

            {step === 9 && (
              <div key={"step-" + step} className="space-y-6 text-left">
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
              </div>
            )}

            {step === 10 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black  text-primary border-b border-accent/20 pb-2 leading-tight">1️⃣2️⃣ Documento de identidad</h2>
                <FormDescription>DNI o pasaporte en vigor (puedes proporcionarlo más tarde)</FormDescription>
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
                  <label className="flex items-center gap-3 p-4 rounded-[2rem] border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all">
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
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-black border-gray-100 active:scale-95 transition-all">ATRÁS</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 active:scale-95 transition-all">SIGUIENTE</Button>
                </div>
              </div>
            )}

            {step === 11 && (
              <div key={"step-" + step} className="space-y-6 text-left">
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
              </div>
            )}

            {step >= 12 && step <= 17 && (
              <div key={"step-" + step} className="space-y-6 text-left">
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
              </div>
            )}

            {step === 18 && (
              <div key={"step-" + step} className="space-y-8 text-left">
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
                      <Checkbox checked={acceptedInfo} onCheckedChange={(checked) => setAcceptedInfo(!!checked)} className="mt-1" />
                      <span className="text-xs md:text-sm font-black text-primary leading-tight">Confirmo que la información es correcta y autorizo a Easy US LLC a procesar mi solicitud.</span>
                    </label>
                    <label className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-100 bg-white hover:border-accent cursor-pointer transition-all active:scale-[0.98]">
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
                    🚀 Enviar Solicitud
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep(0)} className="text-primary/50 font-black  text-[10px] tracking-widest">Empezar de nuevo</Button>
                </div>
              </div>
            )}

            {step === 20 && (
              <div key={"step-" + step} className="space-y-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-accent" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black  text-primary leading-tight">Casi listo</h2>
                <p className="text-xs md:text-sm text-gray-500 max-w-xs mx-auto">Necesitamos formalizar el pago para empezar el proceso legal de constitución.</p>
                
                <div className="bg-accent text-primary p-8 rounded-[2rem] max-w-xs mx-auto my-8">
                  <p className=" text-[10px] font-black tracking-widest opacity-50 mb-2">Total a pagar</p>
                  <p className="text-4xl md:text-5xl font-black mb-4">399.00 €</p>
                  <p className="text-[10px] md:text-xs opacity-80 italic">Incluye tasas estatales de {form.getValues("state")}</p>
                </div>

                <Button onClick={handlePayment} className="w-full max-w-xs bg-accent text-primary font-black py-7 rounded-full text-lg  tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20">
                  Pagar con Stripe
                </Button>
              </div>
            )}
            
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
