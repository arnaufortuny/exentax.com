import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, MessageCircle } from "@/components/icons";
import { useTranslation } from "react-i18next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";
import { SuccessCheckmark } from "@/components/ui/success-checkmark";
import { PasswordStrength } from "@/components/ui/password-strength";
import { usePageTitle } from "@/hooks/use-page-title";

const createEmailSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t("validation.email")),
  fullName: z.string().min(2, t("auth.forgotPassword.nameRequired")),
});

const createResetSchema = (t: (key: string) => string) => z.object({
  password: z.string().min(8, t("validation.passwordMin")),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: t("validation.passwordMatch"),
  path: ["confirmPassword"],
});

type Step = 'email' | 'otp' | 'password' | 'success';
type NameMatch = 'idle' | 'checking' | 'exact' | 'partial' | 'none' | 'error';

export default function ForgotPassword() {
  const { t } = useTranslation();
  usePageTitle();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const [nameMatch, setNameMatch] = useState<NameMatch>('idle');

  const emailSchema = createEmailSchema(t);
  const resetSchema = createResetSchema(t);

  type EmailFormValues = z.infer<typeof emailSchema>;
  type ResetFormValues = z.infer<typeof resetSchema>;

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", fullName: "" },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const watchedEmail = emailForm.watch("email");
  const watchedName = emailForm.watch("fullName");

  const checkNameMatch = useCallback(async (emailVal: string, nameVal: string) => {
    if (!emailVal || !nameVal || nameVal.length < 2) {
      setNameMatch('idle');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      setNameMatch('idle');
      return;
    }
    setNameMatch('checking');
    try {
      const res = await apiRequest("POST", "/api/password-reset/verify-name", { email: emailVal, fullName: nameVal });
      const data = await res.json();
      setNameMatch(data.match || 'none');
    } catch {
      setNameMatch('error');
    }
  }, []);

  useEffect(() => {
    if (watchedEmail && watchedName && watchedName.length >= 2) {
      const timer = setTimeout(() => checkNameMatch(watchedEmail, watchedName), 800);
      return () => clearTimeout(timer);
    } else {
      setNameMatch('idle');
    }
  }, [watchedEmail, watchedName, checkNameMatch]);

  const handleSendOtp = async (data: { email: string; fullName: string }) => {
    setIsLoading(true);
    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/password-reset/send-otp", { email: data.email, fullName: data.fullName });
      if (res.ok) {
        const result = await res.json();
        if (result.deactivated) {
          setFormMessage({ type: 'error', text: t("auth.accountDeactivated.passwordResetBlocked") || "Your account has been deactivated. Password recovery is not available. Contact support for more information." });
        } else {
          setEmail(data.email);
          setFullName(data.fullName);
          setStep('otp');
          setFormMessage({ type: 'success', text: t("auth.forgotPassword.codeSentDesc") });
        }
      } else {
        const result = await res.json();
        setFormMessage({ type: 'error', text: result.message || t("auth.forgotPassword.errorSendCode") });
      }
    } catch (err) {
      setFormMessage({ type: 'error', text: t("auth.forgotPassword.errorSendCode") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setFormMessage(null);
    if (otp.length !== 6) {
      setFormMessage({ type: 'error', text: t("auth.forgotPassword.errorEnterCode") });
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async (data: { password: string; confirmPassword: string }) => {
    setIsLoading(true);
    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/password-reset/confirm", {
        email,
        otp,
        newPassword: data.password,
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setStep('success');
      } else {
        setFormMessage({ type: 'error', text: result.message || t("auth.forgotPassword.errorInvalidCode") });
      }
    } catch (err: any) {
      setFormMessage({ type: 'error', text: err.message || t("auth.forgotPassword.errorResetPassword") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/password-reset/send-otp", { email, fullName });
      if (res.ok) {
        setFormMessage({ type: 'success', text: t("auth.forgotPassword.codeResentDesc") });
      } else {
        setFormMessage({ type: 'error', text: t("auth.forgotPassword.errorSendCode") });
      }
    } catch (err) {
      setFormMessage({ type: 'error', text: t("auth.forgotPassword.errorSendCode") });
    } finally {
      setIsLoading(false);
    }
  };

  const getNameMatchIndicator = () => {
    if (nameMatch === 'idle') return null;
    if (nameMatch === 'error') {
      return (
        <div className="flex items-center gap-2 text-xs text-destructive mt-1.5 px-1" data-testid="status-name-error">
          <XCircle className="w-3.5 h-3.5" />
          <span>{t("auth.forgotPassword.nameError")}</span>
        </div>
      );
    }
    if (nameMatch === 'checking') {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 px-1" data-testid="status-name-checking">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{t("auth.forgotPassword.nameChecking")}</span>
        </div>
      );
    }
    if (nameMatch === 'exact') {
      return (
        <div className="flex items-center gap-2 text-xs text-accent mt-1.5 px-1" data-testid="status-name-exact">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t("auth.forgotPassword.nameExact")}</span>
        </div>
      );
    }
    if (nameMatch === 'partial') {
      return (
        <div className="flex items-center gap-2 text-xs text-amber-500 mt-1.5 px-1" data-testid="status-name-partial">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t("auth.forgotPassword.namePartial")}</span>
        </div>
      );
    }
    if (nameMatch === 'none') {
      return (
        <div className="mt-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20" data-testid="status-name-none">
          <div className="flex items-center gap-2 text-xs text-destructive font-medium">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{t("auth.forgotPassword.nameNoMatchIdentity")}</span>
          </div>
          <Link href="/contacto">
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2.5 rounded-full text-xs font-bold gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
              data-testid="button-contact-team"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {t("auth.forgotPassword.contactTeam")}
            </Button>
          </Link>
        </div>
      );
    }
    return null;
  };

  const canSubmitEmail = nameMatch === 'exact' || nameMatch === 'partial';

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6">
          <div className="w-full max-w-md flex flex-col items-center text-center">
            <SuccessCheckmark size={100} className="mb-4" />
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mb-3">
              {t("auth.forgotPassword.successTitle")} <span className="text-accent">{t("auth.forgotPassword.successTitleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mb-10">
              {t("auth.forgotPassword.successDescription")}
            </p>
            <Link href="/auth/login">
              <Button className="rounded-full px-8 font-black bg-accent text-primary" data-testid="button-go-to-login">
                {t("auth.forgotPassword.goToLogin")}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="pt-24 sm:pt-24 pb-12 md:pb-16 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-sm md:max-w-md">
          <div className="text-center mb-6 md:mb-8 mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-center">
              <span className="text-foreground">{t("auth.forgotPassword.title")}</span>{" "}
              <span className="text-accent">{t("auth.forgotPassword.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-sm md:text-base text-center max-w-sm mx-auto">
              {step === 'email' && t("auth.forgotPassword.descriptionEmail")}
              {step === 'otp' && t("auth.forgotPassword.descriptionOtp")}
              {step === 'password' && t("auth.forgotPassword.descriptionPassword")}
            </p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
            {formMessage && (
              <div className={`mb-5 p-3 rounded-xl text-center text-sm font-medium ${
                formMessage.type === 'error' 
                  ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
                  : formMessage.type === 'success'
                  ? 'bg-accent/10 border border-accent/20 text-accent'
                  : 'bg-accent/5 dark:bg-accent/10 border border-accent/20 dark:border-accent/30 text-accent dark:text-accent'
              }`} data-testid="form-message">
                {formMessage.text}
              </div>
            )}

            {step === 'email' && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-5">
                  <div className="space-y-2">
                    <FormInput
                      control={emailForm.control}
                      name="email"
                      label={t("auth.forgotPassword.emailLabel")}
                      type="email"
                      inputMode="email"
                      placeholder={t("auth.forgotPassword.emailPlaceholder")}
                      className="[&_input]:rounded-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <FormInput
                      control={emailForm.control}
                      name="fullName"
                      label={t("auth.forgotPassword.fullNameLabel")}
                      type="text"
                      placeholder={t("auth.forgotPassword.fullNamePlaceholder")}
                      className="[&_input]:rounded-full"
                    />
                    {getNameMatchIndicator()}
                    <p className="text-[10px] md:text-xs text-muted-foreground px-1 mt-1">
                      {t("auth.forgotPassword.fullNameHelp")}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !canSubmitEmail}
                    className="w-full bg-accent text-primary font-black h-11 md:h-12 rounded-full text-sm md:text-base shadow-lg shadow-accent/20 active:scale-95 transition-all"
                    data-testid="button-send-otp"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : t("auth.forgotPassword.sendCode")}
                  </Button>
                  {nameMatch === 'none' && (
                    <Link href="/contacto">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 rounded-full text-sm font-bold gap-2"
                        data-testid="button-contact-team-bottom"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t("auth.forgotPassword.contactTeam")}
                      </Button>
                    </Link>
                  )}
                </form>
              </Form>
            )}

            {step === 'otp' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground text-center">{t("auth.forgotPassword.codeSentTo")} <strong className="text-foreground">{email}</strong></p>
                  <div className="w-full">
                    <label className="text-xs font-bold text-foreground mb-2 block text-center">{t("auth.forgotPassword.enterCode")}</label>
                    <Input maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="h-14 text-center text-2xl md:text-3xl tracking-[0.5em] font-black border-2 border-border dark:border-border focus:border-accent bg-white dark:bg-card rounded-full"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      data-testid="input-otp"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-accent text-primary font-black h-11 md:h-12 rounded-full text-sm md:text-base shadow-lg shadow-accent/20 active:scale-95 transition-all"
                  data-testid="button-verify-otp"
                >
                  {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : t("auth.forgotPassword.verify")}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm text-accent font-semibold hover:underline transition-colors"
                    data-testid="button-resend-otp"
                  >
                    {t("auth.forgotPassword.noCodeReceived")}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" /> {t("auth.forgotPassword.changeEmail")}
                </button>
              </div>
            )}

            {step === 'password' && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-5">
                  <div className="relative">
                    <FormInput
                      control={resetForm.control}
                      name="password"
                      label={t("auth.forgotPassword.newPassword")}
                      type={showPassword ? "text" : "password"}
                      className="[&_input]:rounded-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[42px] text-muted-foreground hover:text-primary transition-colors"
                      data-testid="button-toggle-password-visibility"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <PasswordStrength 
                      password={resetForm.watch("password")} 
                      className="mt-2"
                    />
                  </div>
                  <FormInput
                    control={resetForm.control}
                    name="confirmPassword"
                    label={t("auth.forgotPassword.confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    className="[&_input]:rounded-full"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent text-primary font-black h-11 md:h-12 rounded-full text-sm md:text-base shadow-lg shadow-accent/20 active:scale-95 transition-all"
                    data-testid="button-reset-password"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : t("auth.forgotPassword.resetPassword")}
                  </Button>
                </form>
              </Form>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link href="/auth/login">
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t("auth.forgotPassword.backToLogin")}
              </span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
