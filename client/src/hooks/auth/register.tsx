import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SocialLogin } from "@/components/auth/social-login";
import { StepProgress } from "@/components/ui/step-progress";

const createRegisterSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(1, t("validation.required")),
  lastName: z.string().min(1, t("validation.required")),
  email: z.string().email(t("validation.invalidEmail")),
  phone: z.string().min(6, t("validation.required")),
  businessActivity: z.string().optional(),
  password: z.string().min(8, t("validation.minPassword")),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: t("validation.passwordMismatch"),
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

const TOTAL_STEPS = 6;

export default function Register() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toast } = useToast();

  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);

  const BUSINESS_ACTIVITIES = useMemo(() => [
    { key: "ecommerce", label: t("auth.register.businessActivities.ecommerce") },
    { key: "dropshipping", label: t("auth.register.businessActivities.dropshipping") },
    { key: "consulting", label: t("auth.register.businessActivities.consulting") },
    { key: "marketing", label: t("auth.register.businessActivities.marketing") },
    { key: "software", label: t("auth.register.businessActivities.software") },
    { key: "investments", label: t("auth.register.businessActivities.investments") },
    { key: "realestate", label: t("auth.register.businessActivities.realestate") },
    { key: "import", label: t("auth.register.businessActivities.import") },
    { key: "coaching", label: t("auth.register.businessActivities.coaching") },
    { key: "content", label: t("auth.register.businessActivities.content") },
    { key: "other", label: t("auth.register.businessActivities.other") },
  ], [t]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      businessActivity: "",
      password: "",
      confirmPassword: "",
    },
  });

  const stepsValidation: Record<number, (keyof RegisterFormValues)[]> = {
    0: ["firstName", "lastName"],
    1: ["email"],
    2: ["phone"],
    3: [],
    4: ["password", "confirmPassword"],
  };

  const nextStep = async () => {
    const fieldsToValidate = stepsValidation[step] || [];
    const valid = await form.trigger(fieldsToValidate);
    if (valid) {
      if (step < TOTAL_STEPS - 1) {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        businessActivity: data.businessActivity || null,
        password: data.password,
      });
      const result = await res.json();
      
      if (result.success) {
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        setIsRegistered(true);
        toast({ title: t("auth.register.accountCreated"), description: t("auth.register.accountCreatedDesc") });
      }
    } catch (err: any) {
      toast({ 
        title: t("auth.register.errorTitle"), 
        description: err.message || t("auth.register.errorDesc"), 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast({ title: t("auth.verify.codeMissing"), description: t("auth.verify.codeMissingDesc"), variant: "destructive" });
      return;
    }
    
    setIsVerifying(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-email", { code: verificationCode });
      const result = await res.json();
      
      if (result.success) {
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: t("auth.verify.verified"), description: t("auth.verify.verifiedDesc") });
        setLocation("/dashboard");
      }
    } catch (err: any) {
      toast({ 
        title: t("auth.verify.codeInvalid"), 
        description: t("auth.verify.codeInvalidDesc"), 
        variant: "destructive" 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    setIsResending(true);
    try {
      await apiRequest("POST", "/api/auth/resend-verification");
      toast({ title: t("auth.verify.codeSent"), description: t("auth.verify.codeSentDesc") });
    } catch (err) {
      toast({ title: t("auth.verify.sendError"), description: t("auth.verify.sendErrorDesc"), variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-background bg-green-gradient-subtle font-sans">
        <Navbar />
        <main className="pt-24 pb-16 px-5 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                {t("auth.verify.title")} <span className="text-accent">{t("auth.verify.titleHighlight")}</span>
              </h1>
              <p className="text-muted-foreground mt-2">{t("auth.verify.subtitleDesc")}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-border shadow-sm mb-6">
              <div className="space-y-2 text-sm text-foreground">
                <p className="flex items-start gap-2">
                  <span>1.</span>
                  <span>{t("auth.verify.tip1")}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span>2.</span>
                  <span>{t("auth.verify.tip2")}</span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-black text-primary block mb-2">{t("auth.verify.codeLabel")}</label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="rounded-full h-12 text-center text-2xl font-black border-2 border-gray-200 dark:border-zinc-700 focus:border-accent tracking-[0.5em] bg-white dark:bg-zinc-800"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  data-testid="input-verification-code"
                />
              </div>

              <Button
                onClick={verifyEmail}
                disabled={isVerifying || verificationCode.length < 6}
                size="lg"
                className="w-full bg-accent text-primary font-black rounded-full h-12"
                data-testid="button-verify"
              >
                {isVerifying ? <Loader2 className="animate-spin" /> : t("auth.verify.submit")}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{t("auth.verify.notReceived")}</p>
                <Button
                  variant="link"
                  onClick={resendCode}
                  disabled={isResending}
                  className="text-accent p-0 h-auto font-bold"
                  data-testid="button-resend-code"
                >
                  {isResending ? t("auth.verify.resending") : t("auth.verify.resend")}
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-gray-100 dark:border-zinc-700">
                <p className="text-sm text-muted-foreground mb-2">{t("auth.verify.verifyLaterDesc")}</p>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="rounded-full font-bold"
                    data-testid="button-verify-later"
                  >
                    {t("auth.verify.verifyLaterBtn")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-green-gradient-subtle font-sans">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-12 md:pb-16 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-sm md:max-w-md">
          <div className="text-center mb-6 md:mb-8 flex flex-col items-center justify-center w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-center w-full">
              <span className="text-foreground">{t("auth.register.title")}</span> <span className="text-accent">{t("auth.register.titleHighlight")}</span>
            </h1>
            <p className="text-accent font-semibold mt-2 text-sm md:text-base text-center">{t("auth.register.subtitleHighlight")}</p>
            <p className="text-muted-foreground mt-2 text-sm md:text-base text-center max-w-xs md:max-w-sm">{t("auth.register.subtitle")}</p>
          </div>

          {step > 0 && (
            <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} className="mb-6" />
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-border shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
              
                {step === 0 && (
                  <div key="step-0" className="space-y-4">
                    <div className="text-center mb-2">
                      <h2 className="text-base font-bold text-foreground">{t("auth.register.step0Title")}</h2>
                      <p className="text-xs text-muted-foreground">{t("auth.register.step0Subtitle")}</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:text-sm font-bold text-foreground">{t("auth.register.firstName")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("auth.register.firstNamePlaceholder")}
                              className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base placeholder:text-muted-foreground"
                              data-testid="input-firstName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:text-sm font-bold text-foreground">{t("auth.register.lastName")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("auth.register.lastNamePlaceholder")}
                              className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base placeholder:text-muted-foreground"
                              data-testid="input-lastName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div key="step-1" className="space-y-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">{t("auth.register.step1Title")}</h2>
                      <p className="text-sm text-muted-foreground">{t("auth.register.step1Subtitle")}</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">{t("auth.register.email")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              inputMode="email"
                              className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base placeholder:text-muted-foreground"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div key="step-2" className="space-y-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">{t("auth.register.step2Title")}</h2>
                      <p className="text-sm text-muted-foreground">{t("auth.register.step2Subtitle")}</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">{t("auth.register.phone")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              inputMode="tel"
                              placeholder={t("auth.register.phonePlaceholder")}
                              className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base placeholder:text-muted-foreground"
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div key="step-3" className="space-y-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">{t("auth.register.step3Title")}</h2>
                      <p className="text-sm text-muted-foreground">{t("auth.register.step3Subtitle")}</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="businessActivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:text-sm font-bold text-foreground">{t("auth.register.step3Label")}</FormLabel>
                          <FormDescription className="text-xs text-muted-foreground mb-2">
                            {t("auth.register.step3Description")}
                          </FormDescription>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20"
                              data-testid="select-businessActivity"
                            >
                              <option value="">{t("common.select")}</option>
                              {BUSINESS_ACTIVITIES.map((activity) => (
                                <option key={activity.key} value={activity.label}>
                                  {activity.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 4 && (
                  <div key="step-4" className="space-y-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">{t("auth.register.step4Title")}</h2>
                      <p className="text-sm text-muted-foreground">{t("auth.register.step4Subtitle")}</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">{t("auth.register.password")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className="rounded-full h-11 md:h-12 px-5 pr-12 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base placeholder:text-muted-foreground"
                                data-testid="input-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </Button>
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">{t("auth.register.passwordHint")}</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">{t("auth.register.confirmPassword")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base placeholder:text-muted-foreground"
                              data-testid="input-confirmPassword"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 5 && (
                  <div key="step-5" className="space-y-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">{t("auth.register.step5Title")}</h2>
                      <p className="text-sm text-muted-foreground">{t("auth.register.step5Subtitle")}</p>
                    </div>

                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-700">
                        <span className="text-sm text-muted-foreground">{t("auth.register.reviewName")}</span>
                        <span className="font-medium text-primary">{form.getValues("firstName")} {form.getValues("lastName")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-700">
                        <span className="text-sm text-muted-foreground">{t("auth.register.reviewEmail")}</span>
                        <span className="font-medium text-primary">{form.getValues("email")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-700">
                        <span className="text-sm text-muted-foreground">{t("auth.register.reviewPhone")}</span>
                        <span className="font-medium text-primary">{form.getValues("phone")}</span>
                      </div>
                      {form.getValues("businessActivity") && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">{t("auth.register.reviewActivity")}</span>
                          <span className="font-medium text-primary text-right max-w-[200px]">{form.getValues("businessActivity")}</span>
                        </div>
                      )}
                    </div>

                    <label className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl cursor-pointer hover:bg-accent/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded border-2 border-accent text-accent focus:ring-accent shrink-0"
                        data-testid="checkbox-terms"
                      />
                      <span className="text-sm text-foreground leading-relaxed">
                        {t("legal.termsAcceptance")}{" "}
                        <Link href="/legal/terminos" data-testid="link-terms">
                          <span className="text-accent underline font-medium">{t("legal.termsAndConditions")}</span>
                        </Link>{" "}
                        {t("legal.termsMiddle")}{" "}
                        <Link href="/legal/privacidad" data-testid="link-privacy">
                          <span className="text-accent underline font-medium">{t("legal.privacyPolicy")}</span>
                        </Link>
                      </span>
                    </label>
                  </div>
                )}
              

              <div className="flex gap-4 pt-4">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="rounded-full font-black px-6 h-12 text-sm border-border"
                    data-testid="button-prev"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("common.back")}
                  </Button>
                )}

                {step < TOTAL_STEPS - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-accent text-accent-foreground font-black rounded-full h-12 text-sm shadow-lg shadow-accent/20"
                    data-testid="button-next"
                  >
                    {t("common.next")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !acceptedTerms}
                    className="flex-1 bg-accent text-accent-foreground font-black rounded-full h-12 text-sm shadow-lg shadow-accent/20 disabled:opacity-50"
                    data-testid="button-register"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : t("auth.register.submit")}
                  </Button>
                )}
              </div>

              </form>
            </Form>

            {step === 0 && (
              <div className="mt-6 pt-5 border-t border-border">
                <SocialLogin mode="login" />
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-border text-center">
              <Link href="/auth/login">
                <div className="hover:underline cursor-pointer" data-testid="link-login">
                  <p className="text-foreground text-xs md:text-sm font-bold">{t("auth.register.hasAccount")}</p>
                  <p className="text-accent text-[10px] md:text-xs">{t("auth.register.login")}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
