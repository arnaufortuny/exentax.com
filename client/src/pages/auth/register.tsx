import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Eye, EyeOff, CheckCircle2, User, Mail, Phone, Briefcase, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const registerSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Teléfono requerido"),
  businessActivity: z.string().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const BUSINESS_ACTIVITIES = [
  "E-commerce / Tienda online",
  "Dropshipping",
  "Consultoría / Servicios profesionales",
  "Marketing digital / Agencia",
  "Desarrollo de software / IT",
  "Inversiones / Trading",
  "Bienes raíces / Real estate",
  "Importación / Exportación",
  "Coaching / Formación online",
  "Creador de contenido / Influencer",
  "Otro",
];

const TOTAL_STEPS = 6;

export default function Register() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

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
      toast({ title: "Introduce el código de 6 dígitos", variant: "destructive" });
      return;
    }
    
    setIsVerifying(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-email", { code: verificationCode });
      const result = await res.json();
      
      if (result.success) {
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Email verificado correctamente" });
        setLocation("/dashboard");
      }
    } catch (err: any) {
      toast({ 
        title: "Código incorrecto", 
        description: err.message || "Inténtalo de nuevo o solicita un nuevo código", 
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
      toast({ title: "Código enviado", description: "Revisa tu email" });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
    } finally {
      setIsResending(false);
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
              <p className="text-muted-foreground mt-2">Te hemos enviado un código de verificación</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-black text-primary block mb-2">Código de verificación</label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="rounded-full text-center text-2xl font-black border-gray-200 focus:border-accent tracking-[0.5em]"
                  placeholder="000000"
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
                className="w-full bg-accent text-primary font-black rounded-full"
                data-testid="button-verify"
              >
                {isVerifying ? <Loader2 className="animate-spin" /> : "Verificar Email"}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={resendCode}
                  disabled={isResending}
                  className="text-accent"
                  data-testid="button-resend-code"
                >
                  {isResending ? "Enviando..." : "Reenviar código"}
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-gray-100">
                <Link href="/dashboard">
                  <Button
                    variant="link"
                    className="text-muted-foreground"
                    data-testid="button-verify-later"
                  >
                    Verificar más tarde
                  </Button>
                </Link>
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
            <p className="text-muted-foreground mt-2">Regístrate para gestionar tu LLC</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-[#6EDC8A]" : i < step ? "w-2 bg-[#6EDC8A]" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#6EDC8A]/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#6EDC8A]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-primary">¿Cómo te llamas?</h2>
                        <p className="text-sm text-muted-foreground">Tu nombre completo</p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">Nombre</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-full border-gray-200 focus:border-accent"
                              placeholder="Tu nombre"
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
                          <FormLabel className="font-black text-primary">Apellido</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="rounded-full border-gray-200 focus:border-accent"
                              placeholder="Tu apellido"
                              data-testid="input-lastName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#6EDC8A]/20 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-[#6EDC8A]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-primary">Tu email</h2>
                        <p className="text-sm text-muted-foreground">Para acceder a tu cuenta</p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              inputMode="email"
                              className="rounded-full border-gray-200 focus:border-accent"
                              placeholder="tu@email.com"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#6EDC8A]/20 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#6EDC8A]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-primary">Tu teléfono</h2>
                        <p className="text-sm text-muted-foreground">Para contactarte si es necesario</p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">Teléfono</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              inputMode="tel"
                              className="rounded-full border-gray-200 focus:border-accent"
                              placeholder="+34 600 000 000"
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#6EDC8A]/20 rounded-full flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-[#6EDC8A]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-primary">Tu actividad</h2>
                        <p className="text-sm text-muted-foreground">Opcional - Ayuda a personalizar tu experiencia</p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="businessActivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">¿A qué te dedicas?</FormLabel>
                          <FormDescription className="text-sm text-muted-foreground mb-3">
                            Selecciona la opción que mejor describa tu negocio
                          </FormDescription>
                          <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {BUSINESS_ACTIVITIES.map((activity) => (
                              <Button
                                key={activity}
                                type="button"
                                variant="outline"
                                onClick={() => form.setValue("businessActivity", activity)}
                                className={`w-full justify-start text-left rounded-xl toggle-elevate ${
                                  field.value === activity ? "toggle-elevated border-accent bg-accent/10" : ""
                                }`}
                                data-testid={`button-activity-${activity.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                              >
                                {activity}
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#6EDC8A]/20 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-[#6EDC8A]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-primary">Tu contraseña</h2>
                        <p className="text-sm text-muted-foreground">Mínimo 8 caracteres</p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                className="rounded-full pr-12 border-gray-200 focus:border-accent"
                                placeholder="Mínimo 8 caracteres"
                                data-testid="input-password"
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">Confirmar Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="rounded-full border-gray-200 focus:border-accent"
                              placeholder="Repite tu contraseña"
                              data-testid="input-confirmPassword"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#6EDC8A]/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#6EDC8A]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-primary">Confirmar registro</h2>
                        <p className="text-sm text-muted-foreground">Revisa tus datos</p>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-muted-foreground">Nombre</span>
                        <span className="font-medium text-primary">{form.getValues("firstName")} {form.getValues("lastName")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-medium text-primary">{form.getValues("email")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-muted-foreground">Teléfono</span>
                        <span className="font-medium text-primary">{form.getValues("phone")}</span>
                      </div>
                      {form.getValues("businessActivity") && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Actividad</span>
                          <span className="font-medium text-primary text-right max-w-[200px]">{form.getValues("businessActivity")}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Al registrarte aceptas nuestros{" "}
                      <Link href="/legal/terminos" data-testid="link-terms">
                        <span className="text-accent underline cursor-pointer">Términos y Condiciones</span>
                      </Link>{" "}
                      y{" "}
                      <Link href="/legal/privacidad" data-testid="link-privacy">
                        <span className="text-accent underline cursor-pointer">Política de Privacidad</span>
                      </Link>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-4">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={prevStep}
                    className="flex-1 rounded-full font-black"
                    data-testid="button-prev"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atrás
                  </Button>
                )}

                {step < TOTAL_STEPS - 1 ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={nextStep}
                    className="flex-1 bg-accent text-primary font-black rounded-full"
                    data-testid="button-next"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="flex-1 bg-accent text-primary font-black rounded-full"
                    data-testid="button-register"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Crear Cuenta"}
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" data-testid="link-login">
                <span className="font-black text-primary underline cursor-pointer">
                  Inicia Sesión
                </span>
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
