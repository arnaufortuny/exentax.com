import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";

const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
};

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
        toast({ title: "Bienvenido de nuevo", description: "Sesión iniciada correctamente" });
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
        title: "Error de autenticación", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="pt-24 pb-16 px-5 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div 
          className="w-full max-w-md"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              Iniciar <span className="text-accent">Sesión</span>
            </h1>
            <p className="text-muted-foreground mt-2">Accede a tu área de cliente</p>
          </div>

          {loginError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-center"
            >
              <p className="text-destructive font-medium text-sm">{loginError}</p>
            </motion.div>
          )}

          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                  <FormInput
                    control={form.control}
                    name="email"
                    label="Email"
                    type="email"
                    inputMode="email"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <FormInput
                      control={form.control}
                      name="password"
                      label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <Link href="/forgot-password">
                    <Button variant="link" className="text-accent p-0 h-auto" data-testid="link-forgot-password">
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-accent text-primary font-black rounded-full text-lg shadow-lg shadow-accent/20"
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 w-5 h-5" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                ¿No tienes cuenta?{" "}
                <Link href="/register">
                  <span className="font-black text-primary hover:text-accent transition-colors cursor-pointer" data-testid="link-register">
                    Regístrate gratis
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
