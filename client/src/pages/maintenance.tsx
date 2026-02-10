import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { PRICING } from "@shared/config/pricing";

import { Check, Loader2, Eye, EyeOff, CheckCircle2 } from "@/components/icons";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { insertMaintenanceApplicationSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { StepProgress } from "@/components/ui/step-progress";
import { useFormDraft } from "@/hooks/use-form-draft";

const TOTAL_STEPS = 12;

const createFormSchema = (t: (key: string) => string) => z.object({
  creationSource: z.string().min(1, t("validation.required")),
  ownerFullName: z.string().min(1, t("validation.required")),
  ownerPhone: z.string()
    .min(1, t("validation.required"))
    .refine(
      (val) => {
        // Must start with +
        if (!val.startsWith('+')) return false;
        // No letters allowed
        if (/[a-zA-Z]/.test(val)) return false;
        // Must have at least 6 digits after the +
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length >= 6;
      },
      { message: t("validation.phoneFormat") }
    ),
  ownerEmail: z.string().email(t("validation.emailInvalid")),
  companyName: z.string().min(1, t("validation.required")),
  ein: z.string().min(1, t("validation.required")),
  state: z.string().min(1, t("validation.required")),
  creationYear: z.string().optional(),
  bankAccount: z.string().optional(),
  paymentGateway: z.string().optional(),
  businessActivity: z.string().min(1, t("validation.required")),
  expectedServices: z.string().min(1, t("validation.required")),
  wantsDissolve: z.string().min(1, t("validation.required")),
  notes: z.string().optional(),
  password: z.string().min(8, t("validation.minLength")).optional(),
  confirmPassword: z.string().optional(),
  paymentMethod: z.string().optional(),
  discountCode: z.string().optional(),
  authorizedManagement: z.boolean().refine(val => val === true, t("validation.acceptTerms")),
  termsConsent: z.boolean().refine(val => val === true, t("validation.acceptTerms")),
  dataProcessingConsent: z.boolean().refine(val => val === true, t("validation.acceptTerms")),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: t("validation.passwordMismatch") || "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export default function MaintenanceApplication() {
  const { t } = useTranslation();
  const { user, isAuthenticated, refetch: refetchAuth } = useAuth();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [requestCode, setRequestCode] = useState<string>("");
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

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

  const formSchema = useMemo(() => createFormSchema(t), [t]);
  
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
  const maintenancePriceMap: Record<string, number> = { 
    "New Mexico": PRICING.maintenance.newMexico.price * 100, 
    "Wyoming": PRICING.maintenance.wyoming.price * 100, 
    "Delaware": PRICING.maintenance.delaware.price * 100 
  };
  const maintenancePrice = maintenancePriceMap[state] || PRICING.maintenance.newMexico.price * 100;

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountInfo(null);
      return;
    }
    setIsValidatingDiscount(true);
    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/discount-codes/validate", { code: code.trim(), orderAmount: maintenancePrice });
      const data = await res.json();
      setDiscountInfo(data);
      if (data.valid) {
        setFormMessage({ type: 'success', text: `${t("toast.discountApplied")}. ${t("toast.discountAppliedDesc")} (${(data.discountAmount / 100).toFixed(2)}€)` });
      } else {
        setFormMessage({ type: 'error', text: `${t("toast.discountInvalid")}. ${t("toast.discountInvalidDesc")}` });
      }
    } catch {
      setDiscountInfo({ valid: false, discountAmount: 0, message: t("toast.discountValidationError") });
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
      setFormMessage({ type: 'error', text: `${t("toast.emailMissing")}. ${t("toast.emailMissingDesc")}` });
      return;
    }
    
    setIsSendingOtp(true);
    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/register/send-otp", { email });
      if (res.ok) {
        setIsOtpSent(true);
        setFormMessage({ type: 'success', text: `${t("toast.codeSent")}. ${t("toast.checkEmail")}` });
      } else {
        const data = await res.json();
        setFormMessage({ type: 'error', text: `${t("toast.error")}. ${data.message}` });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: `${t("toast.errorSending")}. ${t("toast.tryAgain")}` });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const email = form.getValues("ownerEmail");
    if (!otpCode || otpCode.length !== 6) {
      setFormMessage({ type: 'error', text: `${t("toast.otpMissing")}. ${t("toast.otpMissingDesc")}` });
      return;
    }
    
    setIsVerifyingOtp(true);
    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/register/verify-otp", { email, otp: otpCode });
      if (res.ok) {
        setIsOtpVerified(true);
        setFormMessage({ type: 'success', text: `${t("toast.emailVerified")}. ${t("toast.canContinue")}` });
      } else {
        const data = await res.json();
        setFormMessage({ type: 'error', text: `${t("toast.error")}. ${data.message}` });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: `${t("toast.invalidCode")}. ${t("toast.codeExpiredOrInvalid")}` });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogin = async () => {
    const email = form.getValues("ownerEmail");
    const password = form.getValues("password");
    
    if (!password || password.length < 1) {
      setFormMessage({ type: 'error', text: `${t("toast.passwordMissing")}. ${t("toast.passwordMissingDesc")}` });
      return;
    }

    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      if (!res.ok) {
        const data = await res.json();
        setFormMessage({ type: 'error', text: `${t("toast.passwordIncorrect")}. ${t("toast.passwordIncorrectDesc")}` });
        return;
      }
      await refetchAuth();
      setIsOtpVerified(true);
      setFormMessage({ type: 'success', text: `${t("toast.welcomeBack")}. ${t("toast.welcomeBackDesc")}` });
      setStep(4);
    } catch {
      setFormMessage({ type: 'error', text: `${t("toast.connectionError")}. ${t("toast.connectionErrorDesc")}` });
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
      setFormMessage({ type: 'info', text: `${t("toast.redirectingToLLC")}. ${t("toast.noLLCYetDesc")}` });
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
    setFormMessage(null);
    
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
          throw new Error(error.message || t("toast.orderCreationError"));
        }
        const orderData = await res.json();
        
        await apiRequest("PUT", `/api/maintenance/${orderData.application.id}`, {
          ...data,
          status: "submitted"
        });
        
        setRequestCode(orderData.application.requestCode || "");
        setFormMessage({ type: 'success', text: `${t("maintenance.requestReceived")}. ${t("maintenance.workingOnIt")}` });
        clearDraft();
        setLocation(`/contacto?success=true&type=maintenance&orderId=${encodeURIComponent(orderData.application.requestCode || "")}`);
      } else {
        if (!data.password || data.password.length < 8) {
          setFormMessage({ type: 'error', text: `${t("application.validation.passwordTooShort")}. ${t("application.validation.passwordMinChars")}` });
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
          throw new Error(error.message || t("toast.orderCreationError"));
        }
        
        const orderData = await res.json();
        
        await apiRequest("PUT", `/api/maintenance/${orderData.application.id}`, {
          ...data,
          status: "submitted"
        });
        
        setRequestCode(orderData.application.requestCode || "");
        setFormMessage({ type: 'success', text: `${t("maintenance.accountCreatedRequest")}. ${t("maintenance.allSetStarting")}` });
        clearDraft();
        setLocation(`/contacto?success=true&type=maintenance&orderId=${encodeURIComponent(orderData.application.requestCode || "")}`);
      }
    } catch (err: any) {
      setFormMessage({ type: 'error', text: `${t("application.messages.somethingWentWrong")}. ${t("application.messages.tryAgainSeconds")}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-16 max-w-xl mx-auto px-5 sm:px-6 md:px-8">
        <h1 className="text-2xl md:text-4xl font-black mb-2 text-primary leading-tight text-center">
          {t("maintenance.title")} <span className="text-accent">LLC</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6 text-center">
          {t("maintenance.subtitle")}
        </p>
        
        <div>
          <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} className="mb-6" />
          <div className="space-y-6">
            <Form {...form}>
              <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                {formMessage && (
                  <div className={`mb-4 p-3 rounded-xl text-center text-sm font-medium ${
                    formMessage.type === 'error' 
                      ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
                      : formMessage.type === 'success'
                      ? 'bg-accent/10 border border-accent/20 text-accent'
                      : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  }`} data-testid="form-message">
                    {formMessage.text}
                  </div>
                )}
                
                {/* STEP 0: Ya tienes LLC? */}
                {step === 0 && (
                  <div key="step-0" className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      1️⃣ {t("maintenance.steps.hasLLC")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.hasLLCDesc")}</FormDescription>
                    <FormField control={form.control} name="creationSource" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {[
                              { value: "Sí", label: t("maintenance.steps.hasLLCYes") },
                              { value: "No (en ese caso, te orientamos primero)", label: t("maintenance.steps.hasLLCNo") }
                            ].map((opt) => (
                              <label 
                                key={opt.value} 
                                onClick={() => field.onChange(opt.value)}
                                className={`flex items-center justify-between gap-3 p-4 rounded-full border-2 cursor-pointer transition-colors ${
                                  field.value === opt.value 
                                    ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                    : 'border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A] hover:border-accent/50'
                                }`}
                              >
                                <span className="font-bold text-foreground text-sm md:text-base">{opt.label}</span>
                                {field.value === opt.value && <Check className="w-5 h-5 text-accent flex-shrink-0" />}
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" onClick={nextStep} className="w-full bg-accent hover:bg-accent/90 text-black font-bold h-12 rounded-full text-base transition-colors">{t("maintenance.buttons.continue")}</Button>
                    
                    {!isAuthenticated && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground font-medium">{t("maintenance.steps.orContinueQuickly")}</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        
                        <Button type="button"
                          variant="outline"
                          onClick={() => window.location.href = '/api/auth/google'}
                          className="w-full h-12 rounded-full border-2 border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors font-bold flex items-center justify-center gap-3"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          {t("maintenance.steps.accessWithGoogle")}
                        </Button>
                        
                        <Link href="/auth/login" className="block text-center text-xs text-accent font-bold underline" data-testid="link-login-email-maintenance">
                          {t("maintenance.steps.orLoginWithEmail")}
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 1: Nombre Completo */}
                {step === 1 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      2️⃣ {t("maintenance.steps.fullName")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.fullNameDesc")}</FormDescription>
                    <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          {t("maintenance.steps.fullNameLabel")}
                        </FormLabel>
                        <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Teléfono */}
                {step === 2 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      3️⃣ {t("maintenance.steps.phone")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.phoneDesc")}</FormDescription>
                    <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          {t("maintenance.steps.phoneLabel")}
                        </FormLabel>
                        <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Email */}
                {step === 3 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      4️⃣ {t("maintenance.steps.email")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.emailDesc")}</FormDescription>
                    <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          {t("maintenance.steps.emailLabel")}
                        </FormLabel>
                        <FormControl><Input {...field} type="email" inputMode="email" className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Nombre Legal LLC */}
                {step === 4 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      5️⃣ {t("maintenance.steps.companyName")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.companyNameDesc")}</FormDescription>
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          {t("maintenance.steps.companyNameLabel")}
                        </FormLabel>
                        <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 5: EIN */}
                {step === 5 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      6️⃣ {t("maintenance.steps.ein")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.einDesc")}</FormDescription>
                    <FormField control={form.control} name="ein" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                          {t("maintenance.steps.einLabel")}
                        </FormLabel>
                        <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 6: Estado de constitución y detalles de la LLC */}
                {step === 6 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">
                      7️⃣ {t("maintenance.steps.llcDetails")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.llcDetailsDesc")}</FormDescription>
                    
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("maintenance.steps.stateLabel")}</FormLabel>
                        <FormControl>
                          <NativeSelect 
                            value={field.value || ""} 
                            onValueChange={field.onChange}
                            placeholder={t("maintenance.steps.selectState")}
                            className="rounded-full h-14 px-6 border-border bg-white dark:bg-card font-bold text-foreground text-lg"
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
                        <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("maintenance.steps.creationYearLabel")}</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="bankAccount" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("maintenance.steps.bankAccountLabel")}</FormLabel>
                        <FormControl>
                          <NativeSelect 
                            value={field.value || ""} 
                            onValueChange={field.onChange}
                            placeholder={t("maintenance.steps.selectBankAccount")}
                            className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                          >
                            <NativeSelectItem value="Mercury">Mercury</NativeSelectItem>
                            <NativeSelectItem value="Relay">Relay</NativeSelectItem>
                            <NativeSelectItem value="Otro banco">{t("maintenance.steps.otherBank")}</NativeSelectItem>
                            <NativeSelectItem value="No tengo cuenta">{t("maintenance.steps.noAccount")}</NativeSelectItem>
                          </NativeSelect>
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="paymentGateway" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("maintenance.steps.paymentGatewayLabel")}</FormLabel>
                        <FormControl>
                          <NativeSelect 
                            value={field.value || ""} 
                            onValueChange={field.onChange}
                            placeholder={t("maintenance.steps.selectPaymentGateway")}
                            className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A]"
                          >
                            <NativeSelectItem value="Stripe">Stripe</NativeSelectItem>
                            <NativeSelectItem value="PayPal">PayPal</NativeSelectItem>
                            <NativeSelectItem value="Stripe y PayPal">{t("maintenance.steps.stripeAndPaypal")}</NativeSelectItem>
                            <NativeSelectItem value="Otra">{t("maintenance.steps.other")}</NativeSelectItem>
                            <NativeSelectItem value="Ninguna">{t("maintenance.steps.none")}</NativeSelectItem>
                          </NativeSelect>
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 7: Actividad */}
                {step === 7 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">
                      8️⃣ {t("maintenance.steps.activity")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.activityDesc")}</FormDescription>
                    <FormField control={form.control} name="businessActivity" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-3xl min-h-[120px] p-6 border-border focus:border-accent transition-colors font-bold text-foreground placeholder:text-primary/30 text-lg"  /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 8: Servicios */}
                {step === 8 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                      9️⃣ {t("maintenance.steps.services")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.servicesDesc")}</FormDescription>
                    <FormField control={form.control} name="expectedServices" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {[
                              { value: "Recordatorios y cumplimiento anual", label: t("maintenance.steps.serviceReminders") },
                              { value: "Presentación de documentos obligatorios", label: t("maintenance.steps.serviceDocuments") },
                              { value: "Soporte durante el año", label: t("maintenance.steps.serviceSupport") },
                              { value: "Revisión general de la situación de la LLC", label: t("maintenance.steps.serviceReview") }
                            ].map(opt => (
                              <label key={opt.value} className="flex items-center gap-3 p-4 rounded-[2rem] border border-border bg-white dark:bg-card hover:border-accent cursor-pointer transition-colors active:scale-[0.98]">
                                <Checkbox 
                                  checked={field.value?.split(", ").includes(opt.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ? field.value.split(", ") : [];
                                    const next = checked ? [...current, opt.value] : current.filter(v => v !== opt.value);
                                    field.onChange(next.join(", "));
                                  }}
                                  className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-[#6EDC8A]"
                                />
                                <span className="font-black text-sm text-primary">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 9: Disolver? */}
                {step === 9 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">
                      1️⃣0️⃣ {t("maintenance.steps.dissolve")}
                    </h2>
                    <FormDescription>{t("maintenance.steps.dissolveDesc")}</FormDescription>
                    <FormField control={form.control} name="wantsDissolve" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {[
                              { value: "No", label: t("maintenance.steps.dissolveNo") },
                              { value: "Sí, quiero disolver mi LLC", label: t("maintenance.steps.dissolveYes") },
                              { value: "Quiero que me expliquéis primero el proceso", label: t("maintenance.steps.dissolveExplain") }
                            ].map((opt) => (
                              <label 
                                key={opt.value} 
                                onClick={() => field.onChange(opt.value)}
                                className={`flex items-center justify-between gap-3 p-4 rounded-full border-2 cursor-pointer transition-colors ${
                                  field.value === opt.value 
                                    ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                    : 'border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A] hover:border-accent/50'
                                }`}
                              >
                                <span className="font-bold text-foreground text-sm md:text-base">{opt.label}</span>
                                {field.value === opt.value && <Check className="w-5 h-5 text-accent flex-shrink-0" />}
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 10: Crear Cuenta */}
                {step === 10 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      {t("maintenance.steps.createAccount")}
                    </h2>
                    <p className="text-sm text-muted-foreground">{t("maintenance.steps.createAccountDesc")}</p>
                    
                    {!isAuthenticated && (
                      <div className="space-y-6">
                        {/* Step 1: Email verification with OTP */}
                        {!isOtpVerified && (
                          <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-5">
                              <p className="text-xs font-black text-foreground tracking-widest mb-2">{t("common.yourEmail")}</p>
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
                                {isSendingOtp ? t("maintenance.steps.sending") : t("maintenance.steps.sendVerificationCode")}
                              </Button>
                            ) : (
                              <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                  <span className="text-2xl font-black text-green-600 block mb-2">✓</span>
                                  <p className="text-sm font-bold text-green-700">{t("maintenance.steps.codeSentToEmail")}</p>
                                  <p className="text-xs text-green-600">{t("maintenance.steps.checkInbox")}</p>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-bold text-foreground tracking-widest block mb-2">{t("maintenance.steps.verificationCode")}</label>
                                  <Input type="text" 
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                        className="p-6 border-border focus:border-accent text-center text-xl tracking-[0.5em] font-mono rounded-xl"
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
                                  {isVerifyingOtp ? t("maintenance.steps.verifying") : t("maintenance.steps.verifyCode")}
                                </Button>
                                
                                <button 
                                  type="button"
                                  onClick={() => { setIsOtpSent(false); setOtpCode(""); }}
                                  className="text-xs text-[#6EDC8A] underline w-full text-center"
                                >
                                  {t("maintenance.steps.resendCode")}
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
                              <p className="text-sm font-bold text-green-700">{t("maintenance.steps.emailVerified")}</p>
                            </div>
                            
                            <FormField control={form.control} name="password" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-foreground tracking-widest">{t("maintenance.steps.password")}</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password"  className="p-6 border-border focus:border-accent rounded-full" data-testid="input-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold text-foreground tracking-widest">{t("maintenance.steps.confirmPassword")}</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password"  className="p-6 border-border focus:border-accent rounded-full" data-testid="input-confirm-password" />
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
                        <p className="text-sm font-black text-green-700">{t("maintenance.steps.emailVerified")}</p>
                        <p className="text-xs text-green-600">{t("maintenance.buttons.continue")}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button 
                        type="button" 
                        onClick={nextStep} 
                        disabled={!isAuthenticated && (!isOtpVerified || !form.getValues("password") || form.getValues("password")!.length < 8 || form.getValues("password") !== form.getValues("confirmPassword"))}
                        className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors disabled:opacity-50"
                        data-testid="button-next-step-10"
                      >
                        {t("maintenance.buttons.continue")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 11: Método de Pago */}
                {step === 11 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-[#6EDC8A]/20 pb-2 leading-tight">
                      1️⃣1️⃣ {t("maintenance.payment.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">{t("maintenance.payment.desc")}</p>
                    
                    <div className="bg-accent text-primary p-6 rounded-[2rem] text-center mb-6">
                      <p className="text-[10px] font-black tracking-widest opacity-50 mb-1">{t("maintenance.payment.totalToPay")}</p>
                      <p className="text-3xl font-black">
                        {discountInfo?.valid 
                          ? `${((maintenancePrice - discountInfo.discountAmount) / 100).toFixed(2)} €` 
                          : `${(maintenancePrice / 100).toFixed(2)} €`}
                      </p>
                      {discountInfo?.valid && (
                        <p className="text-xs line-through opacity-60">{(maintenancePrice / 100).toFixed(2)} €</p>
                      )}
                      <p className="text-[10px] opacity-80">{t("maintenance.payment.annualMaintenance")}</p>
                    </div>

                    <div className="space-y-3 p-5 rounded-2xl border-2 border-border bg-white dark:bg-card mb-6">
                      <label className="font-bold text-foreground text-sm block">{t("maintenance.payment.discountCode")}</label>
                      <div className="flex gap-2">
                        <FormField control={form.control} name="discountCode" render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                {...field} 
                                className="h-11 px-4 border-border focus:border-accent uppercase rounded-xl" 
                                onChange={(e) => {
                                  field.onChange(e.target.value.toUpperCase());
                                  setDiscountInfo(null);
                                }}
                                data-testid="input-discount-code" 
                              />
                            </FormControl>
                          </FormItem>
                        )} />
                        <Button type="button" 
                          variant="outline" 
                          onClick={() => validateDiscountCode(form.getValues("discountCode") || "")}
                          disabled={isValidatingDiscount || !form.getValues("discountCode")}
                          className="rounded-full h-11 px-6 font-black border-border"
                          data-testid="button-validate-discount"
                        >
                          {isValidatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : t("maintenance.payment.apply")}
                        </Button>
                      </div>
                      {discountInfo && (
                        <div className={`text-sm p-3 rounded-xl ${discountInfo.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {discountInfo.valid 
                            ? `${t("maintenance.payment.discountApplied")}: -${(discountInfo.discountAmount / 100).toFixed(2)}€` 
                            : discountInfo.message}
                        </div>
                      )}
                    </div>
                    
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-4">
                          <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-colors ${field.value === 'transfer' ? 'border-[#6EDC8A] bg-accent/5' : 'border-border bg-white dark:bg-card hover:border-accent/50'}`}>
                            <input type="radio" {...field} value="transfer" checked={field.value === 'transfer'} className="w-5 h-5 accent-[#6EDC8A]" />
                            <div className="flex-1">
                              <span className="font-bold text-foreground text-sm block">{t("maintenance.payment.bankTransfer")}</span>
                              <p className="text-xs text-muted-foreground mt-1">{t("maintenance.payment.bankTransferFormDesc", "Recibirás los datos bancarios en la factura de tu pedido.")}</p>
                            </div>
                          </label>
                          <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-colors ${field.value === 'link' ? 'border-[#6EDC8A] bg-accent/5' : 'border-border bg-white dark:bg-card hover:border-accent/50'}`}>
                            <input type="radio" {...field} value="link" checked={field.value === 'link'} className="w-5 h-5 accent-[#6EDC8A]" />
                            <div className="flex-1">
                              <span className="font-bold text-foreground text-sm block">{t("maintenance.payment.paymentLink")}</span>
                              <p className="text-xs text-muted-foreground mt-1">{t("maintenance.payment.paymentLinkDesc")}</p>
                            </div>
                          </label>
                        </div>
                      </FormControl>
                    )} />
                    
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("maintenance.buttons.continue")}</Button>
                    </div>
                  </div>
                )}

                {/* STEP 12: Autorización y Consentimiento */}
                {step === 12 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-accent" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-foreground leading-tight">{t("maintenance.confirmation.title")}</h2>
                      <p className="text-sm text-muted-foreground mt-2">{t("maintenance.confirmation.subtitle")}</p>
                    </div>
                    <div className="bg-accent/5 p-5 rounded-2xl border border-accent/20 text-xs space-y-2 mb-4">
                      <p><span className="opacity-50">{t("maintenance.confirmation.name")}:</span> <span className="font-black">{form.getValues("ownerFullName")}</span></p>
                      <p><span className="opacity-50">{t("maintenance.confirmation.email")}:</span> <span className="font-black">{form.getValues("ownerEmail")}</span></p>
                      <p><span className="opacity-50">{t("maintenance.confirmation.llc")}:</span> <span className="font-black">{form.getValues("companyName")}</span></p>
                      <p><span className="opacity-50">{t("maintenance.confirmation.state")}:</span> <span className="font-black">{form.getValues("state")}</span></p>
                      <p><span className="opacity-50">EIN:</span> <span className="font-black">{form.getValues("ein")}</span></p>
                      <p><span className="opacity-50">{t("maintenance.confirmation.payment")}:</span> <span className="font-black">{form.getValues("paymentMethod") === 'transfer' ? t("maintenance.confirmation.bankTransfer") : t("maintenance.confirmation.paymentLink")}</span></p>
                    </div>
                    
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-foreground">{t("maintenance.confirmation.additionalNotes")}</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="rounded-3xl min-h-[80px] p-4 border-border focus:border-accent transition-colors text-foreground" />
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <div className="space-y-4">
                      <FormField control={form.control} name="authorizedManagement" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A]">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">{t("maintenance.confirmation.authorizedManagement")}</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="dataProcessingConsent" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A]">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">{t("maintenance.confirmation.dataProcessing")}</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="termsConsent" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A]">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs md:text-sm font-medium">{t("maintenance.confirmation.termsConsent")}</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />
                    </div>
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("maintenance.buttons.back")}</Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {isSubmitting ? t("maintenance.confirmation.submitting") : t("maintenance.confirmation.submit")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 20: Login para usuarios existentes */}
                {step === 20 && (
                  <div key={"step-" + step} className="space-y-6 text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                      {t("maintenance.login.title")}
                    </h2>
                    
                    <div className="bg-accent/10 border border-[#6EDC8A]/30 rounded-2xl p-5 text-center">
                                            <p className="text-sm font-bold text-foreground mb-1">
                        {t("maintenance.login.hello")}{existingUserName ? `, ${existingUserName}` : ""}!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("maintenance.login.existingAccount")}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-5">
                      <p className="text-xs font-black text-foreground tracking-widest mb-2">{t("common.yourEmail")}</p>
                      <p className="text-lg font-bold text-foreground">{form.getValues("ownerEmail")}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-foreground tracking-widest block">{t("auth.login.password")}</label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"}
                          value={form.getValues("password") || ""}
                          onChange={(e) => form.setValue("password", e.target.value)}
                          className="p-6 pr-12 border-border focus:border-accent rounded-xl"
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
                      <Button type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEmailExists(false);
                          setStep(3);
                          form.setValue("ownerEmail", "");
                        }}
                        className="rounded-full h-10 px-4 font-medium border-border transition-colors"
                      >
                        {t("auth.useAnotherEmail")}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleLogin}
                        disabled={isCheckingEmail}
                        className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors"
                        data-testid="button-login-submit"
                      >
                        {isCheckingEmail ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {t("auth.login.submit")}
                      </Button>
                    </div>

                    <div className="text-center">
                      <Link href="/auth/forgot-password" className="text-xs text-[#6EDC8A] hover:underline">
                        {t("maintenance.login.forgotPassword")}
                      </Link>
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
