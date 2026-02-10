import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { validateEmail } from "@/lib/validation";
import { usePageTitle } from "@/hooks/use-page-title";
import { PRICING, getFormationPriceFormatted } from "@shared/config/pricing";

import { Check, Loader2, Eye, EyeOff, CheckCircle2 } from "@/components/icons";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { insertLlcApplicationSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { StepProgress } from "@/components/ui/step-progress";
import { useFormDraft } from "@/hooks/use-form-draft";
import { PasswordStrength } from "@/components/ui/password-strength";

const TOTAL_STEPS = 17; // Single company name (no alternatives), BOI and maintenance mandatory

const createFormSchema = (t: (key: string) => string) => z.object({
  ownerFirstName: z.string().min(1, t("validation.firstNameRequired")),
  ownerLastName: z.string().min(1, t("validation.lastNameRequired")),
  ownerEmail: z.string().email(t("validation.emailInvalid")),
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
  password: z.string().optional().refine((val) => !val || val.length >= 8, { message: t("validation.minLength") }),
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
  const { user, isAuthenticated, refetch: refetchAuth } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: products } = useQuery<{ id: number; name: string; price: number }[]>({
    queryKey: ['/api/products'],
  });

  const getProductIdForState = (stateName: string): number => {
    if (!products) {
      const fallbackMap: Record<string, number> = { "New Mexico": 1, "Wyoming": 2, "Delaware": 3 };
      return fallbackMap[stateName] || 1;
    }
    const product = products.find(p => p.name.includes(stateName));
    return product?.id || 1;
  };

  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [acceptedInfo, setAcceptedInfo] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  
  // OTP verification states
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  // Discount code states
  const [discountInfo, setDiscountInfo] = useState<{ valid: boolean; discountAmount: number; message?: string } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  
  // Login states for existing users
  const [emailExists, setEmailExists] = useState(false);
  const [existingUserName, setExistingUserName] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  
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
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);
  
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
        setDiscountInfo({ valid: false, discountAmount: 0, message: data.message || t("application.codeInvalid") });
      }
    } catch (error) {
      setDiscountInfo({ valid: false, discountAmount: 0, message: t("application.codeInvalid") });
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
            setFormMessage({ type: 'info', text: t("application.messages.dataLoaded") + ". " + t("application.messages.canEditApplication") });
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
    if (!validateEmail(email)) {
      setFormMessage({ type: 'error', text: t("application.messages.emailMissing") + ". " + t("application.messages.emailNeeded") });
      return;
    }
    
    setFormMessage(null);
    setIsSendingOtp(true);
    try {
      const res = await apiRequest("POST", "/api/register/send-otp", { email });
      if (res.ok) {
        setIsOtpSent(true);
        setFormMessage({ type: 'success', text: t("application.messages.codeSent") + ". " + t("application.messages.checkEmailWaiting") });
      } else {
        const data = await res.json();
        setFormMessage({ type: 'error', text: t("common.error") + ". " + data.message });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: t("application.messages.errorSending") + ". " + t("application.messages.tryAgainSeconds") });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const email = form.getValues("ownerEmail");
    if (!otpCode || otpCode.length !== 6) {
      setFormMessage({ type: 'error', text: t("application.messages.codeMissing") + ". " + t("application.messages.enter6DigitCode") });
      return;
    }
    
    setFormMessage(null);
    setIsVerifyingOtp(true);
    try {
      const res = await apiRequest("POST", "/api/register/verify-otp", { email, otp: otpCode });
      if (res.ok) {
        setIsOtpVerified(true);
        setFormMessage({ type: 'success', text: t("application.messages.emailVerified") + ". " + t("application.messages.canContinue") });
      } else {
        const data = await res.json();
        setFormMessage({ type: 'error', text: t("common.error") + ". " + data.message });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: t("application.messages.incorrectCode") + ". " + t("application.messages.codeInvalidOrExpired") });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Check if email already exists (user already registered)
  const checkEmailExists = async (email: string) => {
    try {
      const res = await apiRequest("POST", "/api/auth/check-email", { email });
      const data = await res.json();
      setEmailExists(data.exists);
      setExistingUserName(data.firstName || "");
      return data.exists;
    } catch {
      return false;
    }
  };

  // Handle login for existing users during form
  const handleLogin = async () => {
    const email = form.getValues("ownerEmail");
    const password = form.getValues("password");
    
    if (!password || password.length < 1) {
      setFormMessage({ type: 'error', text: t("toast.passwordMissing") + ". " + t("toast.passwordMissingDesc") });
      return;
    }

    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      if (!res.ok) {
        setFormMessage({ type: 'error', text: t("toast.passwordIncorrect") + ". " + t("toast.passwordIncorrectDesc") });
        return;
      }
      await refetchAuth();
      setIsOtpVerified(true);
      setFormMessage({ type: 'success', text: t("toast.welcomeBack") + ". " + t("toast.welcomeBackDesc") });
      
      // Continue from first empty required field instead of fixed step
      // The useEffect will handle auto-fill and step navigation
    } catch {
      setFormMessage({ type: 'error', text: t("toast.connectionError") + ". " + t("toast.connectionErrorDesc") });
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
    
    // Check if email exists for step 2 (email) - redirect to login if user exists
    if (step === 2 && !isAuthenticated) {
      const email = form.getValues("ownerEmail");
      const exists = await checkEmailExists(email);
      if (exists) {
        setStep(20); // Go to login step
        return;
      }
    }
    
    // Validate password step (step 14) for non-authenticated users
    if (step === 14 && !isAuthenticated) {
      const password = form.getValues("password");
      const confirmPassword = form.getValues("confirmPassword");
      if (!password || password.length < 8) {
        setFormMessage({ type: 'error', text: t("application.validation.passwordTooShort") + ". " + t("application.validation.passwordMinChars") });
        return;
      }
      if (password !== confirmPassword) {
        setFormMessage({ type: 'error', text: t("application.validation.passwordMismatch") + ". " + t("application.messages.tryAgain") });
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
    setFormMessage(null);
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await apiRequest("PUT", `/api/llc/${appId}`, data);
        setFormMessage({ type: 'success', text: t("application.messages.changesSaved") + ". " + t("application.messages.infoUpdated") });
        clearDraft();
        setLocation("/dashboard");
        return;
      }

      const ownerFullName = `${data.ownerFirstName} ${data.ownerLastName}`.trim();
      const productId = getProductIdForState(data.state);

      const orderPayload: any = { productId };
      if (!isAuthenticated) {
        if (!data.password || data.password.length < 8) {
          setFormMessage({ type: 'error', text: t("application.validation.passwordTooShort") + ". " + t("application.validation.passwordMinChars") });
          setIsSubmitting(false);
          return;
        }
        orderPayload.email = data.ownerEmail;
        orderPayload.password = data.password;
        orderPayload.ownerFullName = ownerFullName;
        orderPayload.paymentMethod = data.paymentMethod || "transfer";
      }
      if (discountInfo?.valid && data.discountCode) {
        orderPayload.discountCode = data.discountCode;
        orderPayload.discountAmount = discountInfo.discountAmount;
      }

      const orderRes = await apiRequest("POST", "/api/orders", orderPayload);
      if (!orderRes.ok) {
        const error = await orderRes.json();
        throw new Error(error.message || t("application.messages.somethingWentWrong"));
      }
      const orderData = await orderRes.json();
      const applicationId = orderData.application?.id;
      if (!applicationId) {
        throw new Error(t("application.messages.somethingWentWrong"));
      }

      const submitData: any = { ...data, ownerFullName, status: "submitted" };
      await apiRequest("PUT", `/api/llc/${applicationId}`, submitData);

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
        }
      }

      clearDraft();
      setLocation("/contacto?success=true&type=llc&orderId=" + encodeURIComponent(orderData.application.requestCode || ""));
    } catch (err: any) {
      setFormMessage({ type: 'error', text: err.message || t("application.messages.somethingWentWrong") + ". " + t("application.messages.tryAgain") });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Save changes in edit mode
  const handleSaveChanges = async () => {
    setFormMessage(null);
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
      
      setFormMessage({ type: 'success', text: t("application.messages.changesSaved") + ". " + t("application.messages.infoUpdated") });
      clearDraft();
      setLocation("/dashboard");
    } catch {
      setFormMessage({ type: 'error', text: t("application.messages.somethingWentWrong") + ". " + t("application.messages.tryAgain") });
    }
  };

  const handlePayment = async () => {
    setFormMessage({ type: 'info', text: t("application.messages.processingPayment") + ". " + t("application.messages.momentPlease") });
    setTimeout(async () => {
      await apiRequest("POST", `/api/llc/${appId}/pay`, {});
      setFormMessage({ type: 'success', text: t("application.messages.paymentCompleted") + ". " + t("application.messages.workingOnRequest") });
      setLocation("/contacto?success=true");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-16 max-w-xl mx-auto px-4 md:px-6">
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
            
            {step === 0 && (
              <div key="step-0" className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣ {t("application.steps.whereToForm")}</h2>
                <FormDescription>{t("application.steps.whereToFormDesc")}</FormDescription>
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        {[
                          { name: "New Mexico", price: getFormationPriceFormatted("newMexico") },
                          { name: "Wyoming", price: getFormationPriceFormatted("wyoming") },
                          { name: "Delaware", price: getFormationPriceFormatted("delaware") }
                        ].map(opt => (
                          <label 
                            key={opt.name} 
                            onClick={() => field.onChange(opt.name)}
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-full border-2 cursor-pointer transition-colors ${
                              field.value === opt.name 
                                ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                : 'border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A] hover:border-accent/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                field.value === opt.name ? 'border-accent bg-accent' : 'border-gray-300 dark:border-border'
                              }`}>
                                {field.value === opt.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="font-bold text-foreground text-sm">{opt.name}</span>
                            </div>
                            <span className="font-black text-accent text-base">{opt.price}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-accent hover:bg-accent/90 text-black font-bold h-12 rounded-full text-base transition-colors" data-testid="button-continue-step0">{t("application.continue")}</Button>
                <Link href="/servicios#state-comparison" className="block text-center text-sm text-accent hover:text-accent/80 underline mt-3 font-medium" data-testid="link-help-choose">
                  {t("application.helpChoose")}
                </Link>
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
                      <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerLastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.lastName")}:</FormLabel>
                      <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-3">
                  {!hasUrlState && (
                    <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  )}
                  <Button type="button" onClick={nextStep} className={`${hasUrlState ? 'flex-1' : 'flex-[2]'} bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors`}>{t("application.continue")}</Button>
                </div>
                
                {!isAuthenticated && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground font-medium">{t("application.orContinueFast")}</span>
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
                      {t("application.accessWithGoogle")}
                    </Button>
                    
                    <Link href="/auth/login" className="block text-center text-xs text-accent font-bold underline" data-testid="link-login-email">
                      {t("application.orLoginWithEmail")}
                    </Link>
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
                    <FormControl><Input {...field} type="email" className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">4️⃣ {t("application.steps.contactPhone")}</h2>
                <FormDescription>{t("application.steps.contactPhoneDesc")}</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.phone")}:</FormLabel>
                    <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">5️⃣ {t("application.steps.companyName")}</h2>
                <FormDescription>{t("application.steps.companyNameDesc")}</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.desiredName")}:</FormLabel>
                    <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">6️⃣ {t("application.steps.howManyOwners")}</h2>
                <FormDescription>{t("application.steps.howManyOwnersDesc")}</FormDescription>
                <div className="flex items-center justify-between gap-3 p-4 rounded-full border-2 border-accent bg-accent/10 dark:bg-accent/20">
                  <span className="font-bold text-foreground text-sm md:text-base">{t("application.options.singleOwnerLabel")}</span>
                  <Check className="w-5 h-5 text-accent" />
                </div>
                <div className="bg-muted/50 dark:bg-[#1A1A1A]/50 p-4 rounded-2xl border border-border">
                  <p className="text-sm text-muted-foreground">
                    {t("application.options.needMultipleOwners")}
                  </p>
                  <a href={getWhatsAppUrl("llcFormation")} target="_blank" rel="noopener noreferrer" className="inline-block mt-3">
                    <Button type="button" variant="outline" size="sm" className="rounded-full font-bold text-xs">
                      {t("application.options.consultWhatsApp")}
                    </Button>
                  </a>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
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
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t('application.fields.streetType')}:</FormLabel>
                      <FormControl>
                        <NativeSelect 
                          value={field.value || ""} 
                          onValueChange={field.onChange}
                          placeholder={t('application.fields.streetType')}
                          className="rounded-full h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base"
                        >
                          <NativeSelectItem value="Calle">{t('application.streetTypes.street')}</NativeSelectItem>
                          <NativeSelectItem value="Avenida">{t('application.streetTypes.avenue')}</NativeSelectItem>
                          <NativeSelectItem value="Plaza">{t('application.streetTypes.plaza')}</NativeSelectItem>
                          <NativeSelectItem value="Paseo">{t('application.streetTypes.road')}</NativeSelectItem>
                          <NativeSelectItem value="Camino">{t('application.streetTypes.passage')}</NativeSelectItem>
                          <NativeSelectItem value="Carrera">{t('application.streetTypes.boulevard')}</NativeSelectItem>
                          <NativeSelectItem value="Otro">{t('application.streetTypes.other')}</NativeSelectItem>
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerAddress" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.addressAndNumber")}:</FormLabel>
                      <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="ownerCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.city")}:</FormLabel>
                      <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerProvince" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.province")}:</FormLabel>
                      <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="ownerPostalCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.postalCode")}:</FormLabel>
                      <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerCountry" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-foreground">{t("application.fields.country")}:</FormLabel>
                      <FormControl><Input {...field} className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base rounded-full" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 7 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">8️⃣ {t("application.steps.birthDate")}</h2>
                <FormField control={form.control} name="ownerBirthDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black  text-[10px] md:text-xs tracking-widest opacity-60">{t("application.fields.birthDate")}:</FormLabel>
                    <FormControl><Input {...field} type="date" className="h-12 px-5 border-2 border-gray-200 dark:border-border focus:border-accent bg-white dark:bg-[#1A1A1A] transition-colors font-medium text-foreground text-base max-w-[200px] md:max-w-none rounded-full" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 8 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">9️⃣ {t("application.steps.idDocument")}</h2>
                <FormDescription>{t("application.steps.idDocumentDesc")}</FormDescription>
                <div className="space-y-4">
                  <FormField control={form.control} name="idDocumentUrl" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          <label 
                            className="border-2 border-dashed border-border rounded-[2rem] p-8 md:p-12 text-center hover:border-accent transition-colors cursor-pointer bg-white dark:bg-card block"
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
                                    setFormMessage({ type: 'error', text: t("common.error") + ". " + t("application.validation.fileTooLarge") });
                                    return;
                                  }
                                  field.onChange(file.name);
                                  setFormMessage({ type: 'success', text: t("application.messages.fileSelected") + ". " + file.name });
                                }
                              }}
                            />
                            {field.value && field.value !== "PENDIENTE" ? (
                              <>
                                <Check className="w-10 h-10 text-accent mx-auto mb-3" />
                                <p className="font-black text-accent text-sm">{t("application.fields.documentUploaded")}</p>
                                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px] mx-auto">{field.value}</p>
                              </>
                            ) : (
                              <>
                                <svg className="w-10 h-10 text-muted-foreground mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <p className="font-black text-foreground text-sm">{t("application.fields.uploadOrDrag")}</p>
                                <p className="text-[10px] text-muted-foreground mt-2">{t("application.fields.maxFileSize")}</p>
                              </>
                            )}
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <label className="flex items-center gap-3 p-4 rounded-[2rem] border border-border bg-white dark:bg-card hover:border-accent cursor-pointer transition-colors">
                    <Checkbox 
                      checked={form.watch("idDocumentUrl") === "PENDIENTE"}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          form.setValue("idDocumentUrl", "PENDIENTE", { shouldValidate: true });
                        } else {
                          form.setValue("idDocumentUrl", "", { shouldValidate: true });
                        }
                      }}
                    />
                    <span className="text-xs md:text-sm font-medium text-foreground">{t("application.fields.provideItLater")}</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 9 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">🔟 {t("application.steps.businessActivity")}</h2>
                <FormDescription>{t("application.steps.businessActivityDesc")}</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-border focus:border-accent rounded-full"  /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step >= 10 && step <= 13 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                {step === 10 && (
                  <>
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣1️⃣ {t("application.steps.sellingOnline")}</h2>
                    <FormField control={form.control} name="isSellingOnline" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {[t("application.options.yes"), t("application.options.no"), t("application.options.notSure")].map(opt => (
                            <label 
                              key={opt} 
                              onClick={() => field.onChange(opt)}
                              className={`flex items-center justify-between gap-3 p-4 rounded-full border-2 cursor-pointer transition-colors ${
                                field.value === opt 
                                  ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                  : 'border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A] hover:border-accent/50'
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
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣2️⃣ {t("application.steps.bankAccount")}</h2>
                    <FormField control={form.control} name="needsBankAccount" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {[t("application.options.yesMercury"), t("application.options.yesRelay"), t("application.options.notYet"), t("application.options.otherBank")].map(opt => (
                            <label 
                              key={opt} 
                              onClick={() => field.onChange(opt)}
                              className={`flex items-center justify-between gap-3 p-4 rounded-full border-2 cursor-pointer transition-colors ${
                                field.value === opt 
                                  ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                  : 'border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A] hover:border-accent/50'
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
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣3️⃣ {t("application.steps.stripePayments")}</h2>
                    <FormField control={form.control} name="willUseStripe" render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["Stripe", t("application.options.other"), t("application.options.notYet")].map(opt => (
                            <label 
                              key={opt} 
                              onClick={() => field.onChange(opt)}
                              className={`flex items-center justify-between gap-3 p-4 rounded-full border-2 cursor-pointer transition-colors ${
                                field.value === opt 
                                  ? 'border-accent bg-accent/10 dark:bg-accent/20' 
                                  : 'border-gray-200 dark:border-border bg-white dark:bg-[#1A1A1A] hover:border-accent/50'
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
                    <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">1️⃣4️⃣ {t("application.steps.additionalNotes")}</h2>
                    <FormDescription>{t("application.steps.additionalNotesDesc")}</FormDescription>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-border focus:border-accent rounded-full" /></FormControl>
                      </FormItem>
                    )} />
                  </>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 14 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">{t("application.account.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("application.account.subtitle")}</p>
                
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
                            className="w-full bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20"
                            data-testid="button-send-otp"
                          >
                            {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            {isSendingOtp ? t("application.account.sendingOtp") : t("application.account.sendOtp")}
                          </Button>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-accent/5 border border-accent/30 rounded-xl p-4 text-center">
                              <span className="text-2xl font-black text-accent block mb-2">
                                <Check className="w-6 h-6 mx-auto" />
                              </span>
                              <p className="text-sm font-bold text-accent">{t("application.account.otpSent")}</p>
                              <p className="text-xs text-accent">{t("application.account.otpSentHint")}</p>
                            </div>
                            
                            <div>
                              <label className="text-xs font-black text-primary tracking-widest block mb-2">{t("application.account.otpLabel")}</label>
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
                              className="w-full bg-accent text-primary font-black rounded-full h-14 shadow-lg shadow-accent/20 disabled:opacity-50"
                              data-testid="button-verify-otp"
                            >
                              {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                              {isVerifyingOtp ? t("application.account.verifyingOtp") : t("application.account.verifyOtp")}
                            </Button>
                            
                            <button 
                              type="button"
                              onClick={() => { setIsOtpSent(false); setOtpCode(""); }}
                              className="text-xs text-accent underline w-full text-center"
                            >
                              {t("application.account.resendOtp")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Step 2: Password creation (only after OTP verified) */}
                    {isOtpVerified && (
                      <div className="space-y-4">
                        <div className="bg-accent/5 border border-accent/30 rounded-xl p-4 text-center mb-4">
                          <span className="text-2xl font-black text-accent block mb-2">
                            <Check className="w-6 h-6 mx-auto" />
                          </span>
                          <p className="text-sm font-bold text-accent">{t("application.account.emailVerified")}</p>
                        </div>
                        
                        <FormField control={form.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black text-primary tracking-widest">{t("application.account.passwordLabel")}</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="h-14 px-5 border-border focus:border-accent rounded-full" data-testid="input-password" />
                            </FormControl>
                            <PasswordStrength password={form.watch("password") || ""} className="mt-2" />
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black text-primary tracking-widest">{t("application.account.confirmPasswordLabel")}</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="h-14 px-5 border-border focus:border-accent rounded-full" data-testid="input-confirm-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    )}
                  </div>
                )}
                
                {isAuthenticated && (
                  <div className="bg-accent/5 border border-accent/30 rounded-2xl p-6 text-center">
                    <span className="text-3xl font-black text-accent block mb-2">
                      <Check className="w-8 h-8 mx-auto" />
                    </span>
                    <p className="text-sm font-black text-accent">{t("application.account.alreadyAuthenticated")}</p>
                    <p className="text-xs text-accent">{t("application.account.alreadyAuthenticatedHint")}</p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!isAuthenticated && (!isOtpVerified || !form.getValues("password") || form.getValues("password")!.length < 8 || form.getValues("password") !== form.getValues("confirmPassword"))}
                    className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors disabled:opacity-50"
                    data-testid="button-next-step-18"
                  >
                    {t("application.continue")}
                  </Button>
                </div>
              </div>
            )}

            {step === 15 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">{t("application.paymentMethodTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("application.selectPaymentMethod")}</p>
                
                <div className="bg-accent text-primary p-6 rounded-[2rem] text-center mb-6">
                  <p className="text-[10px] font-black tracking-widest opacity-50 mb-1">{t("application.totalToPay")}</p>
                  <p className="text-3xl font-black">
                    {discountInfo?.valid 
                      ? `${((formationPrice - discountInfo.discountAmount) / 100).toFixed(2)} €` 
                      : `${(formationPrice / 100).toFixed(2)} €`}
                  </p>
                  {discountInfo?.valid && (
                    <p className="text-xs line-through opacity-60">{(formationPrice / 100).toFixed(2)} €</p>
                  )}
                  <p className="text-[10px] opacity-80">{t("application.includesStateFees", { state: form.getValues("state") })}</p>
                </div>

                <div className="space-y-3 p-5 rounded-2xl border-2 border-border bg-white dark:bg-card mb-6">
                  <label className="font-bold text-foreground text-sm block">{t("application.discountCode")}</label>
                  <div className="flex gap-2">
                    <FormField control={form.control} name="discountCode" render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            {...field} 
                            className="h-11 px-4 border-border focus:border-accent uppercase rounded-full" 
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
                      {isValidatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : t("application.apply")}
                    </Button>
                  </div>
                  {discountInfo && (
                    <div className={`text-sm p-3 rounded-xl ${discountInfo.valid ? 'bg-accent/5 text-accent dark:bg-accent/10 dark:text-accent' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {discountInfo.valid 
                        ? t("application.discountApplied", { amount: (discountInfo.discountAmount / 100).toFixed(2) })
                        : discountInfo.message}
                    </div>
                  )}
                </div>
                
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormControl>
                    <div className="flex flex-col gap-4">
                      <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-colors ${field.value === 'transfer' ? 'border-accent bg-accent/5' : 'border-border bg-white dark:bg-card hover:border-accent/50'}`}>
                        <input type="radio" {...field} value="transfer" checked={field.value === 'transfer'} className="w-5 h-5 accent-accent" />
                        <div className="flex-1">
                          <span className="font-black text-primary text-sm block">{t("application.bankTransfer")}</span>
                          <p className="text-xs text-muted-foreground mt-1">{t("application.bankTransferFormDesc")}</p>
                        </div>
                      </label>
                      <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-colors ${field.value === 'link' ? 'border-accent bg-accent/5' : 'border-border bg-white dark:bg-card hover:border-accent/50'}`}>
                        <input type="radio" {...field} value="link" checked={field.value === 'link'} className="w-5 h-5 accent-accent" />
                        <div className="flex-1">
                          <span className="font-black text-primary text-sm block">{t("application.paymentLink")}</span>
                          <p className="text-xs text-muted-foreground mt-1">{t("application.paymentLinkDesc")}</p>
                        </div>
                      </label>
                    </div>
                  </FormControl>
                )} />
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button type="button" onClick={nextStep} className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors">{t("application.continue")}</Button>
                </div>
              </div>
            )}

            {step === 20 && (
              <div key={"step-" + step} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground border-b border-accent/20 pb-2 leading-tight">{t("maintenance.login.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("maintenance.login.description")}</p>
                
                <div className="bg-accent/10 border border-[#4A8BC2]/30 rounded-2xl p-5 text-center">
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
                      className="p-6 border-border focus:border-accent pr-12 rounded-full"
                      data-testid="input-login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-full h-12 px-6 font-bold border-border transition-colors">{t("application.back")}</Button>
                  <Button 
                    type="button" 
                    onClick={handleLogin}
                    className="flex-[2] bg-accent hover:bg-accent/90 text-black font-bold rounded-full h-12 transition-colors"
                    data-testid="button-login-continue"
                  >
                    {t("auth.login.signIn")}
                  </Button>
                </div>
                
                <div className="text-center pt-2">
                  <Link href="/auth/forgot-password" className="text-xs text-accent underline">
                    {t("auth.login.forgotPassword")}
                  </Link>
                </div>
              </div>
            )}

            {step === 16 && (
              <div key={"step-" + step} className="space-y-6 text-left">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-foreground leading-tight">{t("application.reviewTitle")}</h2>
                  <p className="text-sm text-muted-foreground mt-2">{t("application.reviewSubtitle")}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="bg-accent/10 px-5 py-3 border-b border-border">
                      <h3 className="text-xs font-black text-foreground tracking-wide">{t("application.personalInfo")}</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t("application.fullName")}</span>
                        <span className="text-sm font-bold text-foreground">{form.getValues("ownerFirstName")} {form.getValues("ownerLastName")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t("application.emailLabel")}</span>
                        <span className="text-sm font-bold text-foreground">{form.getValues("ownerEmail")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t("application.phoneLabel")}</span>
                        <span className="text-sm font-bold text-foreground">{form.getValues("ownerPhone")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="bg-accent/10 px-5 py-3 border-b border-border">
                      <h3 className="text-xs font-black text-foreground tracking-wide">{t("application.llcInfo")}</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t("application.companyNameLabel")}</span>
                        <span className="text-sm font-bold text-foreground">{form.getValues("companyName")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t("application.stateLabel")}</span>
                        <span className="text-sm font-bold text-foreground">{form.getValues("state")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="bg-accent/10 px-5 py-3 border-b border-border">
                      <h3 className="text-xs font-black text-foreground tracking-wide">{t("application.paymentInfo")}</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t("application.paymentMethodLabel")}</span>
                        <span className="text-sm font-bold text-foreground">{form.getValues("paymentMethod") === 'transfer' ? t("application.bankTransfer") : t("application.paymentLink")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t("application.totalLabel")}</span>
                        <span className="text-lg font-black text-accent">
                          {discountInfo?.valid 
                            ? `${((formationPrice - discountInfo.discountAmount) / 100).toFixed(2)} €` 
                            : `${(formationPrice / 100).toFixed(2)} €`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-3">
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-white dark:bg-card hover:border-accent cursor-pointer transition-colors">
                      <Checkbox checked={acceptedInfo} onCheckedChange={(checked) => setAcceptedInfo(!!checked)} className="mt-0.5" />
                      <span className="text-xs md:text-sm text-foreground leading-tight">{t("application.confirmInfo")}</span>
                    </label>
                    <label className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-white dark:bg-card hover:border-accent cursor-pointer transition-colors">
                      <Checkbox checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(!!checked)} className="mt-0.5" />
                      <span className="text-xs md:text-sm text-foreground leading-tight">
                        {t("application.acceptTerms")} <Link href="/legal/terminos" className="text-accent underline font-medium" target="_blank">{t("application.termsLink")}</Link>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={!acceptedInfo || !acceptedTerms || isSubmitting}
                    className="w-full bg-accent text-accent-foreground font-bold py-7 rounded-full text-base md:text-lg hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("application.submit")}
                  </Button>
                  <Button type="button" variant="outline" onClick={prevStep} className="rounded-full h-12 font-medium border-border">{t("application.back")}</Button>
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
