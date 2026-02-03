import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/use-page-title";
import { PRICING, getFormationPriceFormatted } from "@shared/config/pricing";

import { Check, Loader2, Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertLlcApplicationSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { StepProgress } from "@/components/ui/step-progress";
import { useFormDraft } from "@/hooks/use-form-draft";

const TOTAL_STEPS = 17; // Single company name (no alternatives), BOI and maintenance mandatory

const createFormSchema = (t: (key: string) => string) => z.object({
  ownerFirstName: z.string().min(1, t("validation.firstNameRequired")),
  ownerLastName: z.string().min(1, t("validation.lastNameRequired")),
  ownerEmail: z.string().email(t("validation.emailInvalid")),
  ownerPhone: z.string().min(1, t("validation.required")),
  companyName: z.string().min(1, t("validation.required")).refine(
    (val) => val.toUpperCase().trim().endsWith("LLC") || val.toUpperCase().trim().endsWith("L.L.C.") || val.toUpperCase().trim().endsWith("L.L.C"),
    { message: t("validation.llcNameFormat") }
  ),
  state: z.string().min(1, t("validation.required")),
  ownerCount: z.number().default(1),
  ownerStreetType: z.string().min(1, t("validation.required")),
  ownerAddress: z.string().min(1, t("validation.required")),
  ownerCity: z.string().min(1, t("validation.required")),
  ownerProvince: z.string().optional(),
  ownerPostalCode: z.string().min(1, t("validation.required")),
  ownerCountry: z.string().min(1, t("validation.required")),
  ownerBirthDate: z.string().min(1, t("validation.required")).refine(
    (val) => {
      if (!val) return false;
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    },
    { message: t("validation.ageMinimum") }
  ),
  businessActivity: z.string().min(1, t("validation.required")),
  isSellingOnline: z.string().min(1, t("validation.required")),
  needsBankAccount: z.string().min(1, t("validation.required")),
  willUseStripe: z.string().min(1, t("validation.required")),
  wantsBoiReport: z.string().min(1, t("validation.required")),
  wantsMaintenancePack: z.string().min(1, t("validation.required")),
  notes: z.string().optional(),
  idDocumentUrl: z.string().optional(),
  password: z.string().min(8, t("validation.minLength")).optional(),
  confirmPassword: z.string().optional(),
  paymentMethod: z.string().optional(),
  discountCode: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: t("validation.passwordMismatch") || "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export default function LlcFormation() {
  const { t } = useTranslation();
  usePageTitle();
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
  
  // Discount code states
  const [discountInfo, setDiscountInfo] = useState<{ valid: boolean; discountAmount: number; message?: string } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  
  // Check for edit and state parameters in URL
  const urlParams = new URLSearchParams(window.location.search);
  const editAppId = urlParams.get('edit');
  const urlState = urlParams.get('state');
  const hasUrlState = !!urlState && ["New Mexico", "Wyoming", "Delaware"].includes(urlState);

  const formSchema = useMemo(() => createFormSchema(t), [t]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
      ownerPhone: "",
      companyName: "",
      state: hasUrlState ? urlState : "",
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
      wantsBoiReport: "Sí", // BOI is mandatory - always included
      wantsMaintenancePack: "No", // Default to No, can be offered separately
      notes: "",
      idDocumentUrl: "",
      password: "",
      confirmPassword: "",
      paymentMethod: "transfer",
      discountCode: "",
    },
  });

  const prevStepRef = useRef(step);
  const direction = step > prevStepRef.current ? "forward" : "backward";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  
  useEffect(() => {
    prevStepRef.current = step;
  }, [step]);

  const formDefaults = {
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
    companyName: "",
    state: hasUrlState ? urlState : "",
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
    wantsBoiReport: "Sí", // BOI is mandatory
    wantsMaintenancePack: "No", // Default to No
    notes: "",
    idDocumentUrl: ""
  };

  const { clearDraft } = useFormDraft({
    form,
    storageKey: "llc-formation-draft",
    debounceMs: 1000,
    defaultValues: formDefaults,
  });

  const formationPriceMap: Record<string, number> = {
    "New Mexico": PRICING.formation.newMexico.price * 100,
    "Wyoming": PRICING.formation.wyoming.price * 100,
    "Delaware": PRICING.formation.delaware.price * 100
  };
  const selectedState = form.watch("state");
  const formationPrice = formationPriceMap[selectedState] || PRICING.formation.newMexico.price * 100;

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountInfo(null);
      return;
    }
    setIsValidatingDiscount(true);
    try {
      const res = await apiRequest("POST", "/api/discount-codes/validate", { 
        code: code.toUpperCase(), 
        orderAmount: formationPrice 
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountInfo({ valid: true, discountAmount: data.discountAmount });
      } else {
        setDiscountInfo({ valid: false, discountAmount: 0, message: data.message || "Código no válido" });
      }
    } catch (error) {
      setDiscountInfo({ valid: false, discountAmount: 0, message: "Error al validar el código" });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

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
            
            // Populate form with existing data - split full name into first/last
            const nameParts = (appData.ownerFullName || "").split(' ');
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(' ') || "";
            
            form.reset({
              ownerFirstName: firstName,
              ownerLastName: lastName,
              ownerEmail: appData.ownerEmail || "",
              ownerPhone: appData.ownerPhone || "",
              companyName: appData.companyName || "",
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
              wantsBoiReport: appData.wantsBoiReport || "Sí", // BOI is mandatory
              wantsMaintenancePack: appData.wantsMaintenancePack || "No", // Default to No
              notes: appData.notes || "",
              idDocumentUrl: appData.idDocumentUrl || ""
            });
            toast({ title: t("application.messages.dataLoaded"), description: t("application.messages.canEditApplication") });
          }
        }
        // Order creation is now deferred to the final submit step
      } catch {
        // Silent fail - order will be created on submit
      }
    }
    init();
  }, [editAppId]);

  // Set initial step based on URL state
  useEffect(() => {
    if (hasUrlState && step === 0) {
      setStep(1); // Skip state selection, go to name
    }
  }, [hasUrlState]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const ownerFirstName = user.firstName || "";
      const ownerLastName = user.lastName || "";
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
        ownerFirstName,
        ownerLastName,
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
      
      // If URL has state, start from step 1 (name) - skip state selection
      // Otherwise, start from step 0 (state selection) or first empty field
      const startStep = hasUrlState ? 1 : 0;
      
      // Skip to first empty required field (step 1 = name, step 2 = email, etc.)
      const fieldsToCheck = [
        { step: 1, value: ownerFirstName && ownerLastName ? `${ownerFirstName} ${ownerLastName}` : "" },
        { step: 2, value: ownerEmail },
        { step: 3, value: ownerPhone },
        { step: 4, value: "" }, // companyName - always needs input
      ];
      
      for (const field of fieldsToCheck) {
        if (!field.value && field.step >= startStep) {
          setStep(field.step);
          return;
        }
      }
      // If basic info complete, start at company name (step 4)
      setStep(4);
    }
  }, [isAuthenticated, user, form, hasUrlState]);

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
      toast({ title: t("application.messages.emailMissing"), description: t("application.messages.emailNeeded"), variant: "destructive" });
      return;
    }
    
    setIsSendingOtp(true);
    try {
      const res = await apiRequest("POST", "/api/register/send-otp", { email });
      if (res.ok) {
        setIsOtpSent(true);
        toast({ title: t("application.messages.codeSent"), description: t("application.messages.checkEmailWaiting") });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: t("application.messages.errorSending"), description: t("application.messages.tryAgainSeconds"), variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const email = form.getValues("ownerEmail");
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: t("application.messages.codeMissing"), description: t("application.messages.enter6DigitCode"), variant: "destructive" });
      return;
    }
    
    setIsVerifyingOtp(true);
    try {
      const res = await apiRequest("POST", "/api/register/verify-otp", { email, otp: otpCode });
      if (res.ok) {
        setIsOtpVerified(true);
        toast({ title: t("application.messages.emailVerified"), description: t("application.messages.canContinue") });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: t("application.messages.incorrectCode"), description: t("application.messages.codeInvalidOrExpired"), variant: "destructive" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const nextStep = async () => {
    const stepsValidation: Record<number, (keyof FormValues)[]> = {
      0: ["state"],
      1: ["ownerFirstName", "ownerLastName"],
      2: ["ownerEmail"],
      3: ["ownerPhone"],
      4: ["companyName"],
      5: ["ownerCount"],
      6: ["ownerStreetType", "ownerAddress", "ownerCity", "ownerProvince", "ownerPostalCode", "ownerCountry"],
      7: ["ownerBirthDate"],
      8: ["idDocumentUrl"],
      9: ["businessActivity"],
      10: ["isSellingOnline"],
      11: ["needsBankAccount"],
      12: ["willUseStripe"],
      13: ["notes"],
    };

    const fieldsToValidate = stepsValidation[step];
    if (fieldsToValidate) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }
    
    // Validate password step (step 14) for non-authenticated users
    if (step === 14 && !isAuthenticated) {
      const password = form.getValues("password");
      const confirmPassword = form.getValues("confirmPassword");
      if (!password || password.length < 8) {
        toast({ title: t("application.validation.passwordTooShort"), description: t("application.validation.passwordMinChars"), variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: t("application.validation.passwordMismatch"), description: t("application.messages.tryAgain"), variant: "destructive" });
        return;
      }
    }

    // All steps advance normally
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const prevStep = () => {
    const minStep = hasUrlState ? 1 : 0;
    if (step > minStep) {
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // In edit mode, save changes and redirect to dashboard
      if (isEditMode) {
        await apiRequest("PUT", `/api/llc/${appId}`, data);
        toast({ title: t("application.messages.changesSaved"), description: t("application.messages.infoUpdated") });
        clearDraft();
        setLocation("/dashboard");
        return;
      }
      
      // If not authenticated and password provided, create account first
      if (!isAuthenticated && data.password) {
        try {
          const orderPayload: any = {
            applicationId: appId,
            email: data.ownerEmail,
            password: data.password,
            ownerFullName: `${data.ownerFirstName} ${data.ownerLastName}`.trim(),
            paymentMethod: data.paymentMethod
          };
          if (discountInfo?.valid && data.discountCode) {
            orderPayload.discountCode = data.discountCode;
            orderPayload.discountAmount = discountInfo.discountAmount;
          }
          const res = await apiRequest("POST", "/api/llc/claim-order", orderPayload);
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
      
      // Normal flow: submit and proceed to payment - combine names for API
      const submitData: any = { ...data, ownerFullName: `${data.ownerFirstName} ${data.ownerLastName}`.trim(), status: "submitted" };
      if (discountInfo?.valid && data.discountCode) {
        submitData.discountCode = data.discountCode;
        submitData.discountAmount = discountInfo.discountAmount;
      }
      await apiRequest("PUT", `/api/llc/${appId}`, submitData);
      
      // Update user profile with form data if authenticated
      if (isAuthenticated && user) {
        try {
          const firstName = data.ownerFirstName || '';
          const lastName = data.ownerLastName || '';
          
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
      
      toast({ title: t("application.messages.changesSaved"), description: t("application.continue") });
      setStep(19); // Payment Step
    } catch {
      toast({ title: t("application.messages.somethingWentWrong"), description: t("application.messages.tryAgain"), variant: "destructive" });
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
          await apiRequest("PATCH", "/api/user/profile", {
            firstName: data.ownerFirstName || '',
            lastName: data.ownerLastName || '',
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
      
      toast({ title: t("application.messages.changesSaved"), description: t("application.messages.infoUpdated") });
      clearDraft();
      setLocation("/dashboard");
    } catch {
      toast({ title: t("application.messages.somethingWentWrong"), description: t("application.messages.tryAgain"), variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    toast({ title: t("application.messages.processingPayment"), description: t("application.messages.momentPlease") });
    setTimeout(async () => {
      await apiRequest("POST", `/api/llc/${appId}/pay`, {});
      toast({ title: t("application.messages.paymentCompleted"), description: t("application.messages.workingOnRequest") });
      setLocation("/contacto?success=true");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background bg-green-gradient-subtle font-sans w-full">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-16 max-w-4xl mx-auto px-4 md:px-6">
        {isEditMode && (
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-black text-primary">{t("application.editMode")}</p>
              <p className="text-sm text-muted-foreground">{t("application.editModeDesc")}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline" 
                className="rounded-full"
                onClick={() => setLocation("/dashboard")}
              >
                {t("application.cancel")}
              </Button>
              <Button 
                type="button"
                className="bg-accent text-primary font-black rounded-full"
                onClick={handleSaveChanges}
                data-testid="button-save-changes"
              >
                {t("application.saveChanges")}
              </Button>
            </div>
          </div>
        )}
        
        <h1 className="text-2xl md:text-4xl font-black mb-2 text-primary leading-tight text-center">
          {isEditMode ? t("application.editTitle") + " " : t("application.title").replace("LLC", "") }
          <span className="text-accent">LLC</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6 text-center">
          {t("application.subtitle")}
        </p>
        
        <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} className="mb-8" />
        
        <Form {...form}>
          <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            
            {step === 0 && (
              <div key="step-0" className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣ {t("application.steps.whereToForm")}</h2>
                <FormDescription>{t("application.steps.whereToFormDesc")}</FormDescription>
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {[
                          { name: "New Mexico", price: getFormationPriceFormatted("newMexico"), desc: t("application.states.newMexicoDesc") },
                          { name: "Wyoming", price: getFormationPriceFormatted("wyoming"), desc: t("application.states.wyomingDesc") },
                          { name: "Delaware", price: getFormationPriceFormatted("delaware"), desc: t("application.states.delawareDesc") }
                        ].map(opt => (
                          <label 
                            key={opt.name} 
                            onClick={() => {
                              field.onChange(opt.name);
                              setStep(1);
                            }}
                            className={`flex items-center justify-between gap-3 p-4 rounded-full border-2 cursor-pointer transition-all active:scale-[0.98] ${
                              field.value === opt.name 
                                ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-accent/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                field.value === opt.name ? 'border-accent bg-accent' : 'border-gray-300 dark:border-zinc-600'
                              }`}>
                                {field.value === opt.name && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground text-sm md:text-base">{opt.name}</span>
                                <span className="text-xs text-muted-foreground">{opt.desc}</span>
                              </div>
                            </div>
                            <span className="font-black text-accent text-lg">{opt.price}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-accent hover:bg-accent/90 text-black font-bold h-12 rounded-full text-base transition-all">{t("application.continue")}</Button>
              </div>
            )}

            {step === 1 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">2️⃣ {t("application.steps.whatsYourName")}</h2>
                <FormDescription>{t("application.steps.whatsYourNameDesc")}</FormDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="ownerFirstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.firstName")}:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerLastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.lastName")}:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-3">
                  {!hasUrlState && (
                    <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  )}
                  <Button type="button" onClick={nextStep} className={`${hasUrlState ? 'flex-1' : 'flex-[2]'} bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all`}>{t("application.continue")}</Button>
                </div>
                
                {!isAuthenticated && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground font-medium">{t("application.orContinueFast")}</span>
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
                      {t("application.accessWithGoogle")}
                    </Button>
                    
                    <p className="text-center text-xs text-muted-foreground">
                      {t("application.orLoginWithEmail").split("inicia sesión")[0]}<Link href="/auth/login" className="text-accent font-bold underline">{t("auth.login.signIn")}</Link>{t("application.orLoginWithEmail").split("inicia sesión")[1] || ""}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">3️⃣ {t("application.steps.contactEmail")}</h2>
                <FormDescription>{t("application.steps.contactEmailDesc")}</FormDescription>
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-foreground">Email:</FormLabel>
                    <FormControl><Input {...field} type="email" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">4️⃣ {t("application.steps.contactPhone")}</h2>
                <FormDescription>{t("application.steps.contactPhoneDesc")}</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-foreground">Teléfono:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">5️⃣ {t("application.steps.companyName")}</h2>
                <FormDescription>{t("application.steps.companyNameDesc")}</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-foreground">Nombre deseado:</FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">6️⃣ {t("application.steps.howManyOwners")}</h2>
                <FormDescription>{t("application.steps.howManyOwnersDesc")}</FormDescription>
                <div className="flex items-center justify-between gap-3 p-4 rounded-full border-2 border-accent bg-accent/10 dark:bg-accent/20">
                  <span className="font-bold text-foreground text-sm md:text-base">Único propietario (100%)</span>
                  <Check className="w-5 h-5 text-accent" />
                </div>
                <div className="bg-muted/50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">¿Necesitas varios socios?</strong><br />
                    Contáctanos para LLCs con dos o más propietarios.
                  </p>
                  <a href="https://wa.me/34614916910?text=Hola%2C%20me%20interesa%20crear%20una%20LLC%20en%20Estados%20Unidos" target="_blank" rel="noopener noreferrer" className="inline-block mt-3">
                    <Button type="button" variant="outline" size="sm" className="rounded-full font-bold text-xs">
                      Consultar por WhatsApp
                    </Button>
                  </a>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">7️⃣ {t("application.steps.yourAddress")}</h2>
                <FormDescription>{t("application.steps.yourAddressDesc")}</FormDescription>
                
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="ownerStreetType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">Tipo de vía:</FormLabel>
                      <FormControl>
                        <NativeSelect 
                          value={field.value || ""} 
                          onValueChange={field.onChange}
                          placeholder="Tipo"
                          className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base"
                        >
                          <NativeSelectItem value="Calle">Calle</NativeSelectItem>
                          <NativeSelectItem value="Avenida">Avenida</NativeSelectItem>
                          <NativeSelectItem value="Plaza">Plaza</NativeSelectItem>
                          <NativeSelectItem value="Paseo">Paseo</NativeSelectItem>
                          <NativeSelectItem value="Camino">Camino</NativeSelectItem>
                          <NativeSelectItem value="Carrera">Carrera</NativeSelectItem>
                          <NativeSelectItem value="Otro">Otro</NativeSelectItem>
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerAddress" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">Dirección y número:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="ownerCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">Ciudad:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerProvince" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">Provincia:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="ownerPostalCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">Código postal:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerCountry" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">País:</FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 7 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">8️⃣ Fecha de nacimiento</h2>
                <FormField control={form.control} name="ownerBirthDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">Fecha:</FormLabel>
                    <FormControl><Input {...field} type="date" className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 8 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">9️⃣ Documento de identidad</h2>
                <FormDescription>DNI o pasaporte en vigor (puedes proporcionarlo más tarde)</FormDescription>
                <div className="space-y-4">
                  <FormField control={form.control} name="idDocumentUrl" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          <label 
                            className="border-2 border-dashed border-border rounded-[2rem] p-8 md:p-12 text-center hover:border-accent transition-colors cursor-pointer bg-white dark:bg-zinc-900 block"
                          >
                            <input 
                              type="file" 
                              accept=".jpg,.jpeg,.png,.pdf"
                              className="hidden"
                              data-testid="input-file-identity"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 10 * 1024 * 1024) {
                                    toast({ title: "Error", description: "El archivo no puede superar 10MB", variant: "destructive" });
                                    return;
                                  }
                                  field.onChange(file.name);
                                  toast({ title: "Archivo seleccionado", description: `${file.name} - Se guardará con tu solicitud` });
                                }
                              }}
                            />
                            {field.value && field.value !== "PENDIENTE" ? (
                              <>
                                <Check className="w-10 h-10 text-accent mx-auto mb-3" />
                                <p className="font-black text-accent text-sm">Documento cargado</p>
                                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px] mx-auto">{field.value}</p>
                              </>
                            ) : (
                              <>
                                <svg className="w-10 h-10 text-muted-foreground mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <p className="font-black text-foreground text-sm">Subir archivo o arrastrar</p>
                                <p className="text-[10px] text-muted-foreground mt-2">JPG, PNG, PDF (Máx 10MB)</p>
                              </>
                            )}
                          </label>
                        </div>
                      </FormControl>
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
                    <span className="text-xs md:text-sm font-medium text-foreground">Prefiero proporcionarlo más tarde</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 9 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">🔟 ¿A qué se dedicará tu LLC?</h2>
                <FormDescription>Explícalo con tus palabras, sin tecnicismos</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-border focus:border-accent"  /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step >= 10 && step <= 13 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                {step === 10 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣1️⃣ ¿Vas a vender online?</h2>
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
                {step === 11 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣2️⃣ ¿Necesitas cuenta bancaria?</h2>
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
                {step === 12 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣3️⃣ ¿Usarás Stripe u otra?</h2>
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
                {step === 13 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣4️⃣ ¿Algo más que debamos saber?</h2>
                    <FormDescription>El reporte BOI está incluido en tu formación (es obligatorio por ley)</FormDescription>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-border focus:border-accent" /></FormControl>
                      </FormItem>
                    )} />
                  </>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 14 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">Crea tu cuenta</h2>
                <p className="text-sm text-muted-foreground">Para gestionar tu pedido necesitas una cuenta. Primero verifica tu email.</p>
                
                {!isAuthenticated && (
                  <div className="space-y-6">
                    {/* Step 1: Email verification with OTP */}
                    {!isOtpVerified && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-5">
                          <p className="text-xs font-black text-foreground tracking-widest mb-2">{t("common.yourEmail")}</p>
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
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!isAuthenticated && (!isOtpVerified || !form.getValues("password") || form.getValues("password")!.length < 8 || form.getValues("password") !== form.getValues("confirmPassword"))}
                    className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all disabled:opacity-50"
                    data-testid="button-next-step-18"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {step === 15 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">Método de Pago</h2>
                <p className="text-sm text-muted-foreground">Selecciona cómo deseas realizar el pago de tu LLC.</p>
                
                <div className="bg-accent text-primary p-6 rounded-[2rem] text-center mb-6">
                  <p className="text-[10px] font-black tracking-widest opacity-50 mb-1">Total a pagar</p>
                  <p className="text-3xl font-black">
                    {discountInfo?.valid 
                      ? `${((formationPrice - discountInfo.discountAmount) / 100).toFixed(2)} €` 
                      : `${(formationPrice / 100).toFixed(2)} €`}
                  </p>
                  {discountInfo?.valid && (
                    <p className="text-xs line-through opacity-60">{(formationPrice / 100).toFixed(2)} €</p>
                  )}
                  <p className="text-[10px] opacity-80">Incluye tasas estatales de {form.getValues("state")}</p>
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
                    <div className={`text-sm p-3 rounded-xl ${discountInfo.valid ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {discountInfo.valid 
                        ? `Descuento aplicado: -${(discountInfo.discountAmount / 100).toFixed(2)}€` 
                        : discountInfo.message}
                    </div>
                  )}
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
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-all">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-all">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 16 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">Revisión Final</h2>
                <div className="bg-accent/5 p-6 md:p-8 rounded-[2rem] border border-accent/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <p className="flex justify-between md:block"><span className="opacity-50">Nombre:</span> <span className="font-black">{form.getValues("ownerFirstName")} {form.getValues("ownerLastName")}</span></p>
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
