import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SocialLogin } from "@/components/auth/social-login";
import { StepProgress } from "@/components/ui/step-progress";

const registerSchema = z.object({
  firstName: z.string().min(1, "Este campo es obligatorio"),
  lastName: z.string().min(1, "Este campo es obligatorio"),
  email: z.string().email("Introduce un email válido"),
  phone: z.string().min(6, "Este campo es obligatorio"),
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
        toast({ title: "Cuenta creada", description: "Te hemos enviado un código para confirmar tu email" });
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
      toast({ title: "Falta el código", description: "Introduce el código de 6 dígitos", variant: "destructive" });
      return;
    }
    
    setIsVerifying(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-email", { code: verificationCode });
      const result = await res.json();
      
      if (result.success) {
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Email verificado", description: "Perfecto. Ya puedes continuar" });
        setLocation("/dashboard");
      }
    } catch (err: any) {
      toast({ 
        title: "Código incorrecto", 
        description: "El código no es válido o ha caducado", 
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
      toast({ title: "Código enviado", description: "Revisa tu correo, te esperamos aquí" });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
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
                Comprobación rápida de <span className="text-accent">seguridad</span>
              </h1>
              <p className="text-muted-foreground mt-3">Vamos a verificar tu email para proteger tu cuenta.</p>
              <p className="text-muted-foreground mt-1">Te hemos enviado un código de verificación.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-border shadow-sm mb-6">
              <div className="space-y-2 text-sm text-foreground">
                <p className="flex items-start gap-2">
                  <span>👉</span>
                  <span>Revisa tu bandeja de entrada.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span>👉</span>
                  <span>Si no lo ves, comprueba también SPAM o Promociones.</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Es solo un paso rápido y seguimos.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-black text-primary block mb-2">Código de verificación</label>
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
                {isVerifying ? <Loader2 className="animate-spin" /> : "Verificar mi email"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">¿No has recibido el código?</p>
                <Button
                  variant="link"
                  onClick={resendCode}
                  disabled={isResending}
                  className="text-accent p-0 h-auto font-bold"
                  data-testid="button-resend-code"
                >
                  {isResending ? "Enviando..." : "Reenviar código"}
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-gray-100 dark:border-zinc-700">
                <p className="text-sm text-muted-foreground mb-2">Puedes verificarlo más tarde desde tu área de cliente</p>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="rounded-full font-bold"
                    data-testid="button-verify-later"
                  >
                    Ir a mi nueva área de cliente
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
              <span className="text-foreground">Crea tu</span> <span className="text-accent">cuenta</span>
            </h1>
            <p className="text-accent font-semibold mt-2 text-sm md:text-base text-center">Empieza en menos de 1 minuto</p>
            <p className="text-muted-foreground mt-2 text-sm md:text-base text-center max-w-xs md:max-w-sm">Tu LLC en EE. UU., fácil y acompañada.</p>
          </div>

          {step > 0 && (
            <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} className="mb-6" />
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-border shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
              
                {step === 0 && (
                  <div
                    key="step-0"
                    className="space-y-4"
                  >
                    <div className="text-center mb-2">
                      <h2 className="text-base font-bold text-foreground">¿Cómo te llamas?</h2>
                      <p className="text-xs text-muted-foreground">Así podremos dirigirnos a ti correctamente.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:text-sm font-bold text-foreground">Nombre</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Escribe tu nombre"
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
                          <FormLabel className="text-xs md:text-sm font-bold text-foreground">Apellido</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Escribe tu apellido"
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
                  <div
                    key="step-1"
                    className="space-y-6"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">Tu correo electrónico</h2>
                      <p className="text-sm text-muted-foreground">Lo usaremos para que puedas acceder a tu cuenta y recibir actualizaciones</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">Correo electrónico</FormLabel>
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
                  <div
                    key="step-2"
                    className="space-y-6"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">Tu teléfono</h2>
                      <p className="text-sm text-muted-foreground">Solo lo usaremos para contactarte si es necesario</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">Número de teléfono con prefijo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              inputMode="tel"
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
                  <div
                    key="step-3"
                    className="space-y-6"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">Tu actividad</h2>
                      <p className="text-sm text-muted-foreground">Opcional, pero nos ayuda a adaptar mejor el servicio a ti</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="businessActivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:text-sm font-bold text-foreground">¿A qué te dedicas?</FormLabel>
                          <FormDescription className="text-xs text-muted-foreground mb-2">
                            Elige la opción que mejor describe tu negocio
                          </FormDescription>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-zinc-700 focus:border-accent bg-white dark:bg-zinc-800 transition-all font-medium text-foreground text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20"
                              data-testid="select-businessActivity"
                            >
                              <option value="">Selecciona una opción</option>
                              {BUSINESS_ACTIVITIES.map((activity) => (
                                <option key={activity} value={activity}>
                                  {activity}
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
                  <div
                    key="step-4"
                    className="space-y-6"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">Tu contraseña</h2>
                      <p className="text-sm text-muted-foreground">Elige una contraseña segura para proteger tu cuenta</p>
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
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </Button>
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">Mínimo 8 caracteres</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-primary">Confirmar contraseña</FormLabel>
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
                  <div
                    key="step-5"
                    className="space-y-6"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-primary">Confirmar registro</h2>
                      <p className="text-sm text-muted-foreground">Revisa tus datos antes de continuar</p>
                    </div>

                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-700">
                        <span className="text-sm text-muted-foreground">Nombre</span>
                        <span className="font-medium text-primary">{form.getValues("firstName")} {form.getValues("lastName")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-700">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-medium text-primary">{form.getValues("email")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-zinc-700">
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
                  </div>
                )}
              

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
                    Volver
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
                    Continuar
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

            {step === 0 && (
              <div className="mt-6 pt-5 border-t border-border">
                <SocialLogin mode="login" />
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-border text-center">
              <Link href="/auth/login">
                <div className="hover:underline cursor-pointer" data-testid="link-login">
                  <p className="text-foreground text-xs md:text-sm font-bold">¿Ya tienes una cuenta?</p>
                  <p className="text-accent text-[10px] md:text-xs">Inicia sesión aquí</p>
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
