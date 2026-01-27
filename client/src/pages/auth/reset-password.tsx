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
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";

const resetSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) {
      toast({ title: "Error", description: "Token inválido", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password,
      });
      const result = await res.json();
      
      if (result.success) {
        setIsReset(true);
      }
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "No se pudo restablecer la contraseña", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-24 pb-16 px-4 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-black text-primary mb-4">Enlace inválido</h1>
            <p className="text-muted-foreground mb-6">Este enlace no es válido o ha expirado.</p>
            <Link href="/forgot-password">
              <Button className="rounded-full px-8 font-black bg-[#6EDC8A] text-primary">
                Solicitar nuevo enlace
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isReset) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-24 pb-16 px-4 flex flex-col items-center justify-center min-h-[80vh]">
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
              <Button className="rounded-full px-8 font-black bg-[#6EDC8A] text-primary">
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
      <main className="pt-24 pb-16 px-4 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              Nueva <span className="text-accent">Contraseña</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Introduce tu nueva contraseña
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative">
                  <FormInput
                    control={form.control}
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
                  control={form.control}
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
