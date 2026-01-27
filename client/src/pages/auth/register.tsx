import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";

const registerSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Teléfono requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      const result = await res.json();
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setIsRegistered(true);
        toast({ title: "Cuenta creada", description: "Revisa tu email para el código de verificación" });
      }
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Error al crear la cuenta", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast({ title: "Código inválido", variant: "destructive" });
      return;
    }
    
    setIsVerifying(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-email", { code: verificationCode });
      const result = await res.json();
      
      if (result.success) {
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Email verificado", variant: "success" });
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      toast({ 
        title: "Código incorrecto", 
        description: "Inténtalo de nuevo o solicita un nuevo código", 
        variant: "destructive" 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    try {
      await apiRequest("POST", "/api/auth/resend-verification");
      toast({ title: "Código enviado", description: "Revisa tu email" });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-24 pb-16 px-4 flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#6EDC8A] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                Verifica tu <span className="text-accent">Email</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Te hemos enviado un código de verificación
              </p>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 space-y-6">
              <div>
                <label className="text-sm font-black text-primary block mb-2">Código de verificación</label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="rounded-full h-14 px-6 text-center text-2xl font-black border-gray-200 focus:border-[#6EDC8A]"
                  placeholder="000000"
                  maxLength={6}
                  data-testid="input-verification-code"
                />
              </div>

              <Button
                onClick={verifyEmail}
                disabled={isVerifying}
                className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all"
                data-testid="button-verify"
              >
                {isVerifying ? <Loader2 className="animate-spin" /> : "Verificar Email"}
              </Button>

              <div className="text-center">
                <button
                  onClick={resendCode}
                  className="text-sm font-medium text-accent hover:underline"
                  data-testid="button-resend-code"
                >
                  Reenviar código
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-100">
                <button
                  onClick={() => setLocation("/dashboard")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Verificar más tarde
                </button>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="pt-24 pb-16 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              Crear <span className="text-accent">Cuenta</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Regístrate para gestionar tu LLC
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="firstName"
                    label="Nombre"
                    placeholder="Tu nombre"
                  />
                  <FormInput
                    control={form.control}
                    name="lastName"
                    label="Apellido"
                    placeholder="Tu apellido"
                  />
                </div>

                <FormInput
                  control={form.control}
                  name="email"
                  label="Email"
                  type="email"
                  inputMode="email"
                  placeholder="tu@email.com"
                />

                <FormInput
                  control={form.control}
                  name="phone"
                  label="Teléfono"
                  type="tel"
                  inputMode="tel"
                  placeholder="+34 600 000 000"
                />

                <div className="relative">
                  <FormInput
                    control={form.control}
                    name="password"
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
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
                  control={form.control}
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all mt-6"
                  data-testid="button-register"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Crear Cuenta"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login">
                  <span className="font-black text-primary hover:text-accent transition-colors cursor-pointer">
                    Inicia Sesión
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
