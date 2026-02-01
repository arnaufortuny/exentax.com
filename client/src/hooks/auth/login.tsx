import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const res = await apiRequest("POST", "/api/auth/login", data);
      const result = await res.json();
      
      if (result.success) {
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: t("auth.login.welcomeBack"), description: t("auth.login.welcomeBackDesc") });
        setLocation("/dashboard");
      }
    } catch (err: any) {
      let errorMsg = t("auth.login.genericError");
      if (err.message?.includes("401")) {
        errorMsg = t("auth.login.invalidCredentials");
      } else if (err.message?.includes("404")) {
        errorMsg = t("auth.login.userNotFound");
      } else if (err.message) {
        errorMsg = err.message;
      }
      setLoginError(errorMsg);
      toast({ 
        title: t("auth.login.errorTitle"), 
        description: t("auth.login.errorDesc"), 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-green-gradient-subtle font-sans">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-12 md:pb-16 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-sm md:max-w-md">
          <div className="text-center mb-6 md:mb-8 flex flex-col items-center justify-center w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-center w-full">
              <span className="text-foreground">{t("auth.login.title")}</span> <span className="text-accent">{t("auth.login.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base text-center max-w-xs md:max-w-sm">{t("auth.login.subtitle")}</p>
          </div>

          {loginError && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
              <p className="text-destructive font-medium text-xs md:text-sm">{loginError}</p>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-border shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
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

                <div className="text-center">
                  <Link href="/auth/forgot-password">
                    <div className="text-accent hover:underline cursor-pointer" data-testid="link-forgot-password">
                      <p className="text-xs md:text-sm font-bold">{t("auth.login.forgotPassword")}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{t("auth.login.forgotPasswordHelp")}</p>
                    </div>
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent text-accent-foreground font-black rounded-full h-11 md:h-12 text-sm md:text-base shadow-lg shadow-accent/20"
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

            <div className="mt-6 pt-5 border-t border-border">
              <SocialLogin mode="login" />
            </div>

            <div className="mt-6 pt-5 border-t border-border text-center">
              <Link href="/auth/register">
                <div className="hover:underline cursor-pointer" data-testid="link-register">
                  <p className="text-foreground text-xs md:text-sm font-bold">{t("auth.login.noAccount")}</p>
                  <p className="text-accent text-[10px] md:text-xs">{t("auth.login.noAccountHelp")}</p>
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
