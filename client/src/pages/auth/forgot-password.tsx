import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

const resetSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleSendOtp = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", data);
      setEmail(data.email);
      setStep('otp');
      toast({ title: "Código enviado", description: "Revisa tu email para obtener el código de verificación" });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({ title: "Error", description: "Ingresa el código de 6 dígitos", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-reset-otp", { email, otp });
      const result = await res.json();
      if (result.success) {
        setStep('password');
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Código inválido o expirado", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetFormValues) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/reset-password", {
        email,
        otp,
        password: data.password,
      });
      const result = await res.json();
      if (result.success) {
        setStep('success');
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo restablecer la contraseña", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      toast({ title: "Código reenviado", description: "Revisa tu email" });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo reenviar el código", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-24 pb-16 px-5 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-16 h-16 bg-[#6EDC8A] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mb-4">
              Contraseña <span className="text-accent">Actualizada</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Tu contraseña ha sido restablecida correctamente.
            </p>
            <Link href="/login">
              <Button className="rounded-full px-8 font-black bg-[#6EDC8A] text-primary" data-testid="button-go-to-login">
                Iniciar Sesión
              </Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="pt-24 pb-16 px-5 sm:px-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              Recuperar <span className="text-accent">Contraseña</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {step === 'email' && "Te enviaremos un código de verificación"}
              {step === 'otp' && "Ingresa el código que enviamos a tu email"}
              {step === 'password' && "Ingresa tu nueva contraseña"}
            </p>
          </div>

          {step === 'email' && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-6">
                <FormInput
                  control={emailForm.control}
                  name="email"
                  label="Email"
                  type="email"
                  inputMode="email"
                  placeholder="tu@email.com"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all"
                  data-testid="button-send-otp"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Enviar Código"}
                </Button>
              </form>
            </Form>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">Código enviado a: <strong>{email}</strong></p>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  data-testid="input-otp"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all"
                data-testid="button-verify-otp"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Verificar Código"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="button-resend-otp"
                >
                  ¿No recibiste el código? Reenviar
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" /> Cambiar email
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
                    label="Nueva Contraseña"
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
                  control={resetForm.control}
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#6EDC8A] text-primary font-black py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all"
                  data-testid="button-reset-password"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Restablecer Contraseña"}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login">
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Volver al Login
              </span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
