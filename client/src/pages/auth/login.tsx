import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Eye, EyeOff } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";
import { SocialLogin } from "@/components/auth/social-login";

const createLoginSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t("validation.invalidEmail")),
  password: z.string().min(1, t("validation.required")),
});

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const [requiresSecurityOtp, setRequiresSecurityOtp] = useState(false);
  const [securityOtp, setSecurityOtp] = useState("");
  const [isAccountDeactivated, setIsAccountDeactivated] = useState(false);

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setFormMessage(null);
    try {
      const token = await (await import("@/lib/queryClient")).getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["X-CSRF-Token"] = token;
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...data,
          securityOtp: requiresSecurityOtp ? securityOtp : undefined
        }),
        credentials: "include",
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        if (res.status === 403) {
          setIsAccountDeactivated(true);
          return;
        }
        if (res.status === 401 && result.hint === "no_account") {
          setFormMessage({ type: 'info', text: t("auth.login.noAccountFound") + '. ' + t("auth.login.redirectToRegister") });
          setTimeout(() => {
            setLocation(`/auth/register?email=${encodeURIComponent(data.email)}`);
          }, 1500);
          return;
        }
        setFormMessage({ type: 'error', text: t("auth.login.invalidCredentials") });
        return;
      }
      
      if (result.requiresSecurityOtp) {
        setRequiresSecurityOtp(true);
        setFormMessage({ type: 'info', text: t("auth.login.securityOtpSent") + ': ' + t("auth.login.securityOtpDesc") });
        return;
      }
      
      if (result.success) {
        if (result.user?.preferredLanguage && result.user.preferredLanguage !== i18n.language) {
          await i18n.changeLanguage(result.user.preferredLanguage);
          localStorage.setItem('i18nextLng', result.user.preferredLanguage);
        }
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setFormMessage({ type: 'error', text: t("auth.login.genericError") });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAccountDeactivated) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-20 md:pt-24 pb-12 md:pb-16 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
                <circle cx="60" cy="60" r="50" fill="#FEE2E2" stroke="#EF4444" strokeWidth="4"/>
                <path d="M60 35V65" stroke="#EF4444" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="60" cy="80" r="5" fill="#EF4444"/>
              </svg>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {t("auth.accountDeactivated.title")}
              </h1>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base">
                {t("auth.accountDeactivated.description")}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const infoFeatureKeys = [
    { titleKey: "auth.login.infoCard.feature1.title", descKey: "auth.login.infoCard.feature1.desc" },
    { titleKey: "auth.login.infoCard.feature2.title", descKey: "auth.login.infoCard.feature2.desc" },
    { titleKey: "auth.login.infoCard.feature3.title", descKey: "auth.login.infoCard.feature3.desc" },
    { titleKey: "auth.login.infoCard.feature4.title", descKey: "auth.login.infoCard.feature4.desc" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-12 md:pb-16 px-4 sm:px-6 flex flex-col items-center lg:items-start justify-center min-h-[80vh] lg:px-16 xl:px-24">
        <div className="w-full max-w-sm md:max-w-md lg:max-w-5xl">
          <div className="text-center mb-6 md:mb-8 flex flex-col items-center justify-center w-full lg:hidden">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-center w-full">
              <span className="text-foreground">{t("auth.login.title")}</span> <span className="text-accent">{t("auth.login.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base text-center max-w-xs md:max-w-sm">{t("auth.login.subtitle")}</p>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-stretch">
            <div className="lg:flex lg:flex-col">
              <div className="hidden lg:block mb-5">
                <h1 className="text-2xl xl:text-3xl font-black tracking-tight">
                  <span className="text-foreground">{t("auth.login.title")}</span> <span className="text-accent">{t("auth.login.titleHighlight")}</span>
                </h1>
                <p className="text-muted-foreground mt-1.5 text-xs">{t("auth.login.subtitle")}</p>
              </div>

          {formMessage && (
            <div className={`mb-4 p-3 rounded-xl text-center ${
              formMessage.type === 'error' 
                ? 'bg-destructive/10 border border-destructive/20' 
                : formMessage.type === 'success'
                ? 'bg-accent/10 border border-accent/20'
                : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
            }`} data-testid="form-message">
              <p className={`font-medium text-xs md:text-sm ${
                formMessage.type === 'error' ? 'text-destructive' 
                : formMessage.type === 'success' ? 'text-accent'
                : 'text-blue-700 dark:text-blue-300'
              }`}>{formMessage.text}</p>
            </div>
          )}

          <div className="bg-white dark:bg-card rounded-2xl md:rounded-3xl p-5 md:p-8 border border-border shadow-sm lg:border-0 lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:p-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormInput
                  control={form.control}
                  name="email"
                  label={t("auth.login.email")}
                  placeholder={t("auth.login.emailPlaceholder")}
                  type="email"
                  inputMode="email"
                />

                <div className="relative">
                  <FormInput
                    control={form.control}
                    name="password"
                    label={t("auth.login.password")}
                    placeholder={t("auth.login.passwordPlaceholder")}
                    type={showPassword ? "text" : "password"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-[6px] h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? t("common.close") : t("common.search")}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                {requiresSecurityOtp && (
                  <div className="space-y-2">
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 text-center mb-3">
                      <p className="text-sm font-bold text-foreground mb-1">{t("auth.login.securityVerification")}</p>
                      <p className="text-xs text-muted-foreground">{t("auth.login.securityVerificationDesc")}</p>
                    </div>
                    <label className="text-xs font-bold text-foreground tracking-wide block">
                      {t("auth.login.securityCode")}
                    </label>
                    <Input
                      type="text"
                      value={securityOtp}
                      onChange={(e) => setSecurityOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="h-12 text-center text-xl tracking-[0.5em] font-bold rounded-full"
                      data-testid="input-security-otp"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Link href="/auth/forgot-password">
                    <span className="text-accent hover:underline cursor-pointer text-xs font-bold" data-testid="link-forgot-password">
                      {t("auth.login.forgotPassword")}
                    </span>
                  </Link>
                  <Link href="/auth/register">
                    <span className="text-muted-foreground hover:text-foreground cursor-pointer text-xs" data-testid="link-register">
                      {t("auth.login.noAccount")}
                    </span>
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent text-accent-foreground font-black rounded-full h-11 text-sm shadow-lg shadow-accent/20"
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 w-4 h-4" />
                      {t("auth.login.submitting")}
                    </>
                  ) : (
                    t("auth.login.submit")
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-5 pt-4 border-t border-border lg:border-foreground/10">
              <SocialLogin mode="login" />
            </div>
          </div>
            </div>

            <div className="hidden lg:flex lg:flex-col">
              <div className="bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-2xl p-7 xl:p-8 flex-1 flex flex-col justify-center">
                <div className="mb-5">
                  <h2 className="text-2xl xl:text-3xl font-black text-foreground tracking-tight">
                    {t("auth.login.infoCard.title")}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    {t("auth.login.infoCard.subtitle")}
                  </p>
                </div>

                <div className="space-y-0">
                  {infoFeatureKeys.map((feature, idx) => (
                    <div key={idx} data-testid={`info-feature-${idx}`}>
                      {idx > 0 && <div className="border-t border-accent/15 my-3" />}
                      <p className="text-sm font-bold text-foreground leading-tight">{t(feature.titleKey)}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{t(feature.descKey)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
