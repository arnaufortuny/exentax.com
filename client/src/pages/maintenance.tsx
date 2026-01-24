import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Mail, Building2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMaintenanceApplicationSchema } from "@shared/schema";

const formSchema = insertMaintenanceApplicationSchema.extend({
  otp: z.string().length(6, "El código debe tener 6 dígitos"),
}).omit({ 
  orderId: true,
  requestCode: true,
  submittedAt: true,
  emailOtp: true,
  emailOtpExpires: true,
  emailVerified: true
});

type FormValues = z.infer<typeof formSchema>;

export default function MaintenanceApplication() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const stateFromUrl = params.get("state") || "New Mexico";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
      companyName: "",
      ein: "",
      state: stateFromUrl,
      status: "draft",
      otp: "",
      notes: ""
    },
  });

  useEffect(() => {
    async function init() {
      try {
        const productId = stateFromUrl.includes("Wyoming") ? 2 : stateFromUrl.includes("Delaware") ? 3 : 1;
        const res = await apiRequest("POST", "/api/maintenance/orders", { productId, state: stateFromUrl });
        const data = await res.json();
        setAppId(data.application.id);
      } catch (err) {
        console.error("Error initializing maintenance application:", err);
      }
    }
    init();
  }, [stateFromUrl]);

  const nextStep = async () => {
    if (step === 0) {
      const isValid = await form.trigger(["ownerFullName", "ownerEmail", "ownerPhone"]);
      if (isValid) setStep(1);
    } else if (step === 1) {
      const isValid = await form.trigger(["companyName", "ein", "state"]);
      if (isValid) setStep(2);
    } else if (step === 2) {
      if (isEmailVerified) setStep(3);
      else toast({ title: "Verificación requerida", description: "Verifica tu email primero." });
    }
  };

  const sendOtp = async () => {
    const email = form.getValues("ownerEmail");
    try {
      await apiRequest("POST", `/api/maintenance/${appId}/send-otp`, { email });
      setIsOtpSent(true);
      toast({ title: "Código enviado" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const verifyOtp = async () => {
    const otp = form.getValues("otp");
    try {
      await apiRequest("POST", `/api/maintenance/${appId}/verify-otp`, { otp });
      setIsEmailVerified(true);
      toast({ title: "Email verificado", variant: "success" });
    } catch {
      toast({ title: "Código incorrecto", variant: "destructive" });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await apiRequest("PUT", `/api/maintenance/${appId}`, { ...data, status: "submitted" });
      toast({ title: "Solicitud enviada", variant: "success" });
      setLocation("/contacto?success=true");
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-32 pb-16 max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-black uppercase mb-12 text-primary">Solicitud de <span className="text-accent">Mantenimiento</span></h1>
        
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">1. Datos de Contacto</h2>
                <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                  <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-accent text-primary font-black">Siguiente</Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">2. Datos de la LLC</h2>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem><FormLabel>Nombre de la LLC</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ein" render={({ field }) => (
                  <FormItem><FormLabel>EIN (Employer Identification Number)</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="New Mexico">New Mexico</SelectItem><SelectItem value="Wyoming">Wyoming</SelectItem><SelectItem value="Delaware">Delaware</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-1 bg-accent text-primary font-black">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">3. Verificación de Email</h2>
                {!isOtpSent ? (
                  <Button type="button" onClick={sendOtp} className="w-full bg-accent text-primary font-black">Enviar código al email</Button>
                ) : (
                  <div className="space-y-4">
                    <FormField control={form.control} name="otp" render={({ field }) => (
                      <FormItem><FormLabel>Código de 6 dígitos</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    {!isEmailVerified && <Button type="button" onClick={verifyOtp} className="w-full bg-primary text-white">Verificar Código</Button>}
                  </div>
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Atrás</Button>
                  <Button type="button" onClick={nextStep} disabled={!isEmailVerified} className="flex-1 bg-accent text-primary font-black">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-black uppercase text-primary border-b border-accent/20 pb-2">4. Revisión y Notas</h2>
                <div className="bg-accent/5 p-6 rounded-2xl border border-accent/20 space-y-2">
                  <p><strong>Propietario:</strong> {form.getValues("ownerFullName")}</p>
                  <p><strong>LLC:</strong> {form.getValues("companyName")}</p>
                  <p><strong>Estado:</strong> {form.getValues("state")}</p>
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Notas Adicionales (Opcional)</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">Atrás</Button>
                  <Button type="submit" className="flex-1 bg-accent text-primary font-black">Enviar Solicitud</Button>
                </div>
              </motion.div>
            )}
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
