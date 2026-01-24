import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Mail, Building2, Loader2, MessageCircle, Info, Upload, CreditCard, Calendar, User, Phone, Globe, MapPin, Briefcase, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertLlcApplicationSchema } from "@shared/schema";

const BUSINESS_CATEGORIES = [
  "Tecnología y Software (SaaS, desarrollo web/apps, IT services)",
  "E-commerce (tienda online, dropshipping, Amazon FBA)",
  "Consultoría y Servicios Profesionales (consultoría, coaching, asesoría)",
  "Marketing y Publicidad (agencia digital, social media, SEO/SEM)",
  "Educación y Formación (cursos online, academia digital, e-learning)",
  "Contenido Digital y Medios (producción audiovisual, podcast, influencer)",
  "Diseño y Creatividad (diseño gráfico, fotografía, web design)",
  "Servicios Financieros (contabilidad, gestión fiscal, inversiones)",
  "Salud y Bienestar (coaching wellness, nutrición online, fitness)",
  "Inmobiliaria (inversión, gestión de propiedades)",
  "Importación / Exportación (comercio internacional, distribución)",
  "Servicios Legales (preparación de documentos, servicios paralegal)",
  "Trading e Inversiones (forex, criptomonedas, bolsa)",
  "Entretenimiento (gaming, eventos, producción)",
  "Retail y Comercio (venta minorista, distribución de productos)",
  "Otra (especificar)"
];

const formSchema = z.object({
  ownerFullName: z.string().min(1, "Requerido"),
  ownerPhone: z.string().min(1, "Requerido"),
  ownerEmail: z.string().email("Email inválido"),
  ownerBirthDate: z.string().min(1, "Requerido"),
  ownerIdType: z.string().min(1, "Requerido"),
  ownerIdNumber: z.string().min(1, "Requerido"),
  ownerCountryResidency: z.string().min(1, "Requerido"),
  ownerAddress: z.string().min(1, "Requerido"),
  companyName: z.string().min(1, "Requerido"),
  businessActivity: z.string().min(1, "Requerido"),
  businessCategory: z.string().min(1, "Requerido"),
  needsBankAccount: z.string().min(1, "Requerido"),
  notes: z.string().optional(),
  otp: z.string().optional(),
  dataProcessingConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
  termsConsent: z.boolean().refine(val => val === true, "Debes aceptar"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApplicationWizard() {
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
      ownerPhone: "",
      ownerEmail: "",
      ownerBirthDate: "",
      ownerIdType: "DNI",
      ownerIdNumber: "",
      ownerCountryResidency: "",
      ownerAddress: "",
      companyName: "",
      businessActivity: "",
      businessCategory: "",
      needsBankAccount: "",
      notes: "",
      otp: "",
      dataProcessingConsent: false,
      termsConsent: false
    },
  });

  useEffect(() => {
    async function init() {
      try {
        const productId = stateFromUrl.includes("Wyoming") ? 2 : stateFromUrl.includes("Delaware") ? 3 : 1;
        const res = await apiRequest("POST", "/api/orders", { productId });
        const data = await res.json();
        setAppId(data.application.id);
      } catch (err) {
        console.error("Error initializing application:", err);
      }
    }
    init();
  }, [stateFromUrl]);

  const nextStep = async () => {
    const stepsValidation: Record<number, (keyof FormValues)[]> = {
      0: ["ownerFullName"],
      1: ["ownerPhone"],
      2: ["ownerEmail"],
      3: ["ownerBirthDate"],
      4: ["ownerIdType", "ownerIdNumber"],
      5: ["ownerCountryResidency"],
      6: ["ownerAddress"],
      7: ["companyName"],
      8: ["businessActivity"],
      9: ["businessCategory"],
      10: ["needsBankAccount"],
      11: ["notes"],
    };

    const fieldsToValidate = stepsValidation[step];
    if (fieldsToValidate) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (step === 12) {
      if (isEmailVerified) setStep(14);
      else setStep(13);
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const sendOtp = async () => {
    const email = form.getValues("ownerEmail");
    try {
      await apiRequest("POST", `/api/llc/${appId}/send-otp`, { email });
      setIsOtpSent(true);
      toast({ title: "Código enviado" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const verifyOtp = async () => {
    const otp = form.getValues("otp");
    try {
      await apiRequest("POST", `/api/llc/${appId}/verify-otp`, { otp });
      setIsEmailVerified(true);
      toast({ title: "Email verificado", variant: "success" });
      setStep(14);
    } catch {
      toast({ title: "Código incorrecto", variant: "destructive" });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await apiRequest("PUT", `/api/llc/${appId}`, { ...data, status: "submitted" });
      toast({ title: "Solicitud enviada", variant: "success" });
      setLocation("/contacto?success=true");
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans w-full">
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold uppercase mb-8 md:mb-12 text-primary leading-tight text-left">
          Constituir mi <span className="text-accent">LLC</span>
        </h1>
        
        <Form {...form}>
          <form className="space-y-6 md:space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {/* STEP 0: Nombre Completo */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <User className="w-6 h-6 text-accent" /> 1️⃣ ¿Cómo te llamas?
                </h2>
                <FormDescription>Tal y como aparece en tu documento oficial</FormDescription>
                <FormField control={form.control} name="ownerFullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      Nombre completo:
                    </FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" placeholder="Tu nombre" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={nextStep} className="w-full bg-[#6EDC8A] text-primary font-bold py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
              </motion.div>
            )}

            {/* STEP 1: Teléfono */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <Phone className="w-6 h-6 text-accent" /> 2️⃣ Teléfono de contacto
                </h2>
                <FormDescription>Para comunicarnos contigo rápidamente si hace falta</FormDescription>
                <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      Teléfono:
                    </FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" placeholder="+34..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Email */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <Mail className="w-6 h-6 text-accent" /> 3️⃣ Email
                </h2>
                <FormDescription>Aquí recibirás toda la documentación y avisos importantes</FormDescription>
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      Email:
                    </FormLabel>
                    <FormControl><Input {...field} type="email" inputMode="email" className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" placeholder="email@ejemplo.com" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-100 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all text-sm md:text-base">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Fecha de Nacimiento */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-accent" /> 4️⃣ Fecha de nacimiento
                </h2>
                <FormField control={form.control} name="ownerBirthDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      Fecha:
                    </FormLabel>
                    <FormControl><Input {...field} type="date" className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Documento de Identidad */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-accent" /> 5️⃣ Documento de identidad
                </h2>
                <div className="space-y-4">
                  <FormField control={form.control} name="ownerIdType" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-bold uppercase text-[10px]  text-primary">Tipo de documento:</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {["DNI", "Pasaporte"].map((opt) => (
                            <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                              <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-[#6EDC8A]" />
                              <span className="font-bold text-primary text-sm md:text-base">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ownerIdNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                        Número del documento:
                      </FormLabel>
                      <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" placeholder="Número DNI o Pasaporte" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: País de Residencia */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <Globe className="w-6 h-6 text-accent" /> 6️⃣ País de residencia
                </h2>
                <FormField control={form.control} name="ownerCountryResidency" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      País:
                    </FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" placeholder="España, México, Argentina..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Dirección Completa */}
            {step === 6 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-accent" /> 7️⃣ Dirección completa
                </h2>
                <FormDescription>Calle, número, ciudad, código postal y país</FormDescription>
                <FormField control={form.control} name="ownerAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      Dirección:
                    </FormLabel>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" placeholder="Dirección completa..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: Nombre LLC */}
            {step === 7 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-accent" /> 8️⃣ Nombre deseado para la LLC
                </h2>
                <FormDescription>Si tienes varias opciones, pon la principal aquí</FormDescription>
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                      Nombre deseado:
                    </FormLabel>
                    <FormControl><Input {...field} className="rounded-full h-14 px-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" placeholder="MI EMPRESA LLC" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 8: Actividad del Negocio */}
            {step === 8 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-accent" /> 9️⃣ Actividad del negocio
                </h2>
                <FormDescription>Explícanos brevemente a qué se dedicará tu empresa, con tus propias palabras</FormDescription>
                <FormField control={form.control} name="businessActivity" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-200 focus:border-[#6EDC8A] transition-all font-bold text-primary placeholder:text-primary/30 text-base" placeholder="Mi empresa se dedicará a..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 9: Categoría del Negocio */}
            {step === 9 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-accent" /> 🔟 Categoría del negocio
                </h2>
                <FormDescription>Marca la opción que mejor describa tu negocio</FormDescription>
                <FormField control={form.control} name="businessCategory" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {BUSINESS_CATEGORIES.map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-[#6EDC8A]" />
                            <span className="font-bold text-primary text-sm md:text-base">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 10: Banca */}
            {step === 10 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-accent/20 pb-2 leading-tight flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-accent" /> 1️⃣1️⃣ ¿Necesitas ayuda con la banca?
                </h2>
                <FormDescription>Te acompañamos durante el proceso si lo necesitas</FormDescription>
                <FormField control={form.control} name="needsBankAccount" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["Sí", "No", "Aún no lo sé"].map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 rounded-full border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                            <input type="radio" {...field} value={opt} checked={field.value === opt} className="w-5 h-5 accent-[#6EDC8A]" />
                            <span className="font-bold text-primary text-sm md:text-base">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 11: Notas */}
            {step === 11 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Info className="w-6 h-6 text-[#6EDC8A]" /> 1️⃣2️⃣ Información adicional
                </h2>
                <FormDescription>¿Algo que debamos saber antes de empezar? Dudas o peticiones especiales</FormDescription>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} className="rounded-[2rem] min-h-[120px] p-6 border-gray-200 focus:border-[#6EDC8A] font-bold text-primary placeholder:text-primary/30" placeholder="Notas adicionales..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Siguiente</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 12: Resumen Final */}
            {step === 12 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <Check className="w-6 h-6 text-[#6EDC8A]" /> Resumen Final
                </h2>
                <div className="bg-[#6EDC8A]/5 p-6 md:p-8 rounded-[2rem] border border-[#6EDC8A]/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <p className="flex justify-between md:block"><span className="opacity-50 text-[10px] md:text-xs uppercase font-bold text-primary">Email:</span> <span className="font-bold text-primary">{form.getValues("ownerEmail")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50 text-[10px] md:text-xs uppercase font-bold text-primary">LLC:</span> <span className="font-bold text-primary">{form.getValues("companyName")}</span></p>
                    <p className="flex justify-between md:block"><span className="opacity-50 text-[10px] md:text-xs uppercase font-bold text-primary">Estado:</span> <span className="font-bold text-primary">{stateFromUrl}</span></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Verificar email</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 13: Verificación OTP */}
            {step === 13 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#6EDC8A]" /> Verificación
                </h2>
                {!isOtpSent ? (
                  <Button type="button" onClick={sendOtp} className="w-full bg-[#6EDC8A] text-primary font-bold py-7 rounded-full text-lg shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Enviar código</Button>
                ) : (
                  <div className="space-y-4">
                    <FormField control={form.control} name="otp" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase text-[10px]  text-primary">Código de 6 dígitos:</FormLabel>
                        <FormControl><Input {...field} className="rounded-full h-14 px-6 text-center text-2xl border-gray-200 focus:border-[#6EDC8A] font-bold text-primary" placeholder="000000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {!isEmailVerified && <Button type="button" onClick={verifyOtp} className="w-full bg-primary text-white py-7 rounded-full font-bold text-lg active:scale-95 transition-all">Verificar</Button>}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 rounded-full h-14 font-bold border-gray-200 active:scale-95 transition-all text-sm md:text-base">Atrás</Button>
                  <Button type="button" onClick={nextStep} className="flex-2 bg-[#6EDC8A] text-primary font-bold rounded-full h-14 shadow-lg shadow-[#6EDC8A]/20 active:scale-95 transition-all">Verificar email</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 14: Confirmación y Pago */}
            {step === 14 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-primary border-b border-[#6EDC8A]/20 pb-2 leading-tight">✅ Confirmación</h2>
                <div className="space-y-3">
                  <FormField control={form.control} name="dataProcessingConsent" render={({ field }) => (
                    <FormItem className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-200 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" /></FormControl>
                      <span className="text-xs md:text-sm font-bold text-primary">Confirmo que la información proporcionada es correcta y autorizo la gestión de mi LLC.</span>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="termsConsent" render={({ field }) => (
                    <FormItem className="flex items-start gap-4 p-4 rounded-[2rem] border border-gray-200 bg-white hover:border-[#6EDC8A] cursor-pointer transition-all active:scale-[0.98]">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-200 data-[state=checked]:bg-[#6EDC8A] data-[state=checked]:border-[#6EDC8A]" /></FormControl>
                      <span className="text-xs md:text-sm font-bold text-primary">Acepto los términos del servicio y el tratamiento de mis datos.</span>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex flex-col gap-4 pt-4">
                  <Button type="submit" className="w-full bg-[#6EDC8A] text-primary font-bold py-8 rounded-full text-lg md:text-xl  hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#6EDC8A]/20">
                    🚀 Iniciar Constitución
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep(0)} className="text-primary/50 font-bold uppercase text-[10px] ">Reiniciar</Button>
                </div>
              </motion.div>
            )}
          </form>
        </Form>
      </main>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
