import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FormInput } from "@/components/forms";

const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", data);
      setIsSubmitted(true);
    } catch (err) {
      toast({ title: "Error", description: "No se pudo procesar la solicitud", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mb-4">
              Revisa tu <span className="text-accent">Email</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
            </p>
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-full px-8 font-black"
              >
                Volver al Login
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
              Recuperar <span className="text-accent">Contraseña</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormInput
                  control={form.control}
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
                  data-testid="button-forgot-password"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Enviar Enlace"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link href="/login">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Volver al Login
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
