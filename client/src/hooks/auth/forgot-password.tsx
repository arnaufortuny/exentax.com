import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const createEmailSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t("validation.email")),
});

const createResetSchema = (t: (key: string) => string) => z.object({
  password: z.string().min(8, t("validation.passwordMin")),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: t("validation.passwordMatch"),
  path: ["confirmPassword"],
});

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const emailSchema = createEmailSchema(t);
  const resetSchema = createResetSchema(t);

  type EmailFormValues = z.infer<typeof emailSchema>;
  type ResetFormValues = z.infer<typeof resetSchema>;

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleSendOtp = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/password-reset/send-otp", data);
      if (res.ok) {
        setEmail(data.email);
        setStep('otp');
        toast({ title: t("auth.forgotPassword.codeSentTitle"), description: t("auth.forgotPassword.codeSentDesc") });
      } else {
        const result = await res.json();
        toast({ title: t("auth.forgotPassword.errorTitle"), description: result.message || t("auth.forgotPassword.errorSendCode"), variant: "destructive" });
      }
    } catch (err) {
      toast({ title: t("auth.forgotPassword.errorTitle"), description: t("auth.forgotPassword.errorSendCode"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({ title: t("auth.forgotPassword.errorTitle"), description: t("auth.forgotPassword.errorEnterCode"), variant: "destructive" });
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async (data: { password: string; confirmPassword: string }) => {
    setIsLoading(true);
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
        toast({ title: t("auth.forgotPassword.errorTitle"), description: result.message || t("auth.forgotPassword.errorInvalidCode"), variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: t("auth.forgotPassword.errorTitle"), description: err.message || t("auth.forgotPassword.errorResetPassword"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/password-reset/send-otp", { email });
      if (res.ok) {
        toast({ title: t("auth.forgotPassword.codeResentTitle"), description: t("auth.forgotPassword.codeResentDesc") });
      } else {
        toast({ title: t("auth.forgotPassword.errorTitle"), description: t("auth.forgotPassword.errorSendCode"), variant: "destructive" });
      }
    } catch (err) {
      toast({ title: t("auth.forgotPassword.errorTitle"), description: t("auth.forgotPassword.errorSendCode"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-24 pb-16 px-5 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mb-4">
              {t("auth.forgotPassword.successTitle")} <span className="text-accent">{t("auth.forgotPassword.successTitleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mb-8">
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
    <div className="min-h-screen bg-background bg-green-gradient-subtle font-sans">
      <Navbar />
      <main className="pt-12 md:pt-16 pb-12 md:pb-16 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-sm md:max-w-md">
          <div className="text-center mb-6 md:mb-8 mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tight text-center">
              {t("auth.forgotPassword.title")} <span className="text-accent">{t("auth.forgotPassword.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-sm md:text-base text-center max-w-sm mx-auto">
              {step === 'email' && t("auth.forgotPassword.descriptionEmail")}
              {step === 'otp' && t("auth.forgotPassword.descriptionOtp")}
              {step === 'password' && t("auth.forgotPassword.descriptionPassword")}
            </p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
            {step === 'email' && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-6">
                  <div className="space-y-2">
                    <FormInput
                      control={emailForm.control}
                      name="email"
                      label={t("auth.forgotPassword.emailLabel")}
                      type="email"
                      inputMode="email"
                      placeholder={t("auth.forgotPassword.emailPlaceholder")}
                    />
                    <p className="text-[10px] md:text-xs text-muted-foreground px-1">
                      {t("auth.forgotPassword.emailHelp")}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent text-primary font-black h-11 md:h-12 rounded-full text-sm md:text-base shadow-lg shadow-accent/20 active:scale-95 transition-all"
                    data-testid="button-send-otp"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : t("auth.forgotPassword.sendCode")}
                  </Button>
                </form>
              </Form>
            )}

            {step === 'otp' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground">{t("auth.forgotPassword.codeSentTo")} <strong>{email}</strong></p>
                  <div className="w-full">
                    <Input
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="h-12 text-center text-xl tracking-[0.5em] font-bold rounded-full"
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
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
                <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-6">
                  <div className="relative">
                    <FormInput
                      control={resetForm.control}
                      name="password"
                      label={t("auth.forgotPassword.newPassword")}
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[42px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <FormInput
                    control={resetForm.control}
                    name="confirmPassword"
                    label={t("auth.forgotPassword.confirmPassword")}
                    type={showPassword ? "text" : "password"}
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
