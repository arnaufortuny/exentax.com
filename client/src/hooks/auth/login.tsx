import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";
import { SocialLogin } from "@/components/auth/social-login";

const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

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
        toast({ title: "Bienvenido de nuevo", description: "Nos alegra verte otra vez" });
        setLocation("/dashboard");
      }
    } catch (err: any) {
      let errorMsg = "Error al iniciar sesión";
      if (err.message?.includes("401")) {
        errorMsg = "Email o contraseña incorrectos";
      } else if (err.message?.includes("404")) {
        errorMsg = "Usuario no encontrado";
      } else if (err.message) {
        errorMsg = err.message;
      }
      setLoginError(errorMsg);
      toast({ 
        title: "No hemos podido iniciar sesión", 
        description: "Revisa tu email o contraseña", 
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
              <span className="text-foreground">Iniciar</span> <span className="text-accent">sesión</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base text-center max-w-xs md:max-w-sm">Accede a tu espacio personal y gestiona tu LLC con total tranquilidad</p>
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
                  label="Email"
                  placeholder="Tu correo electrónico"
                  type="email"
                  inputMode="email"
                />

                <div className="relative">
                  <FormInput
                    control={form.control}
                    name="password"
                    label="Contraseña"
                    placeholder="Tu contraseña segura"
                    type={showPassword ? "text" : "password"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-[6px] h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar" : "Mostrar"}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="text-center">
                  <Link href="/auth/forgot-password">
                    <div className="text-accent hover:underline cursor-pointer" data-testid="link-forgot-password">
                      <p className="text-xs md:text-sm font-bold">¿Has olvidado tu contraseña?</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Recupérala fácilmente</p>
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
                      Entrando...
                    </>
                  ) : (
                    "Entrar a mi cuenta"
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
                  <p className="text-foreground text-xs md:text-sm font-bold">¿Todavía no tienes cuenta?</p>
                  <p className="text-accent text-[10px] md:text-xs">Crea tu cuenta gratis en unos segundos</p>
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
