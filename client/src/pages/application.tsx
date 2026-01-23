import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Mail, Globe, MapPin, Building2, Loader2, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertLlcApplicationSchema } from "@shared/schema";

const BUSINESS_CATEGORIES = [
  "Tecnología y Software (SaaS, desarrollo web/apps, IT services)",
  "E-commerce (tienda online, dropshipping, Amazon FBA)",
  "Consultoría y Servicios Profesionales (business consulting, coaching, asesoría)",
  "Marketing y Publicidad (agencia digital, social media, SEO/SEM)",
  "Eduación y Formación (cursos online, academia digital, e-learning)",
  "Contenido Digital y Medios (producción audiovisual, podcasting, influencer)",
  "Diseño y Creatividad (diseño gráfico, fotografía, web design)",
  "Servicios Financieros (contabilidad, gestión fiscal, inversiones)",
  "Salud y Bienestar (coaching wellness, nutrición online, fitness)",
  "Inmobiliaria (inversión inmobiliaria, property management)",
  "Importación/Exportación (comercio internacional, distribución)",
  "Servicios Legales (preparación documentos, servicios paralegal)",
  "Trading e Inversiones (forex, criptomonedas, bolsa)",
  "Entretenimiento (gaming, eventos, producción)",
  "Retail y Comercio (venta minorista, distribución productos)",
  "Otra (especificar)"
];

const PAYMENT_METHODS = [
  { id: "stripe", label: "Tarjeta de Crédito / Débito (Stripe)", desc: "Pago seguro inmediato" },
  { id: "transfer", label: "Transferencia Bancaria", desc: "Te enviaremos los datos por email" },
  { id: "later", label: "Pagar más tarde", desc: "Contactaremos contigo para el cobro" }
];

const COUNTRY_PREFIXES = [
  { code: "+34", label: "España (+34)" },
  { code: "+1", label: "USA (+1)" },
  { code: "+52", label: "México (+52)" },
  { code: "+54", label: "Argentina (+54)" },
  { code: "+56", label: "Chile (+56)" },
  { code: "+57", label: "Colombia (+57)" },
  { code: "+51", label: "Perú (+51)" },
  { code: "+598", label: "Uruguay (+598)" },
  { code: "+58", label: "Venezuela (+58)" },
  { code: "+506", label: "Costa Rica (+506)" },
  { code: "+507", label: "Panamá (+507)" },
  { code: "+593", label: "Ecuador (+593)" },
  { code: "+591", label: "Bolivia (+591)" },
  { code: "+595", label: "Paraguay (+595)" },
  { code: "+502", label: "Guatemala (+502)" },
  { code: "+503", label: "El Salvador (+503)" },
  { code: "+504", label: "Honduras (+504)" },
  { code: "+505", label: "Nicaragua (+505)" },
  { code: "+1-809", label: "Rep. Dom. (+1-809)" },
  { code: "+53", label: "Cuba (+53)" },
  { code: "+501", label: "Belice (+501)" }
];

const STREET_TYPES = ["Calle", "Avenida", "Paseo", "Plaza", "Carretera", "Bulevar"];

const formSchema = insertLlcApplicationSchema.extend({
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

export default function ApplicationWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const stateFromUrl = params.get("state") || "New Mexico";

  const [selectedCountryPrefix, setSelectedCountryPrefix] = useState("+34");

  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes("America/Mexico")) setSelectedCountryPrefix("+52");
      else if (timezone.includes("America/Argentina")) setSelectedCountryPrefix("+54");
      else if (timezone.includes("America/Bogota")) setSelectedCountryPrefix("+57");
      else if (timezone.includes("America/Santiago")) setSelectedCountryPrefix("+56");
      else if (timezone.includes("America/Lima")) setSelectedCountryPrefix("+51");
      else if (timezone.includes("America/Caracas")) setSelectedCountryPrefix("+58");
    } catch (e) {
      console.error("Error detecting country:", e);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerAddress: "",
      ownerStreetType: "Calle",
      ownerCity: "",
      ownerCountry: "",
      ownerProvince: "",
      ownerPostalCode: "",
      companyName: "",
      companyNameOption2: "",
      state: stateFromUrl,
      companyDescription: "",
      status: "draft",
      otp: "",
      ownerBirthDate: "",
      ownerIdNumber: "",
      ownerIdType: "Passport",
      idLater: false,
      dataProcessingConsent: false,
      termsConsent: false,
      ageConfirmation: false,
      designator: "LLC",
      businessCategory: "",
      businessCategoryOther: "",
      notes: ""
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    async function init() {
      try {
        const productId = stateFromUrl.includes("Wyoming") ? 2 : stateFromUrl.includes("Delaware") ? 3 : 1;
        const res = await apiRequest("POST", "/api/orders", { productId });
        const data = await res.json();
        setAppId(data.application.id);
        setOrderNumber(data.application.requestCode || `#${data.application.id}`);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error initializing application:", err);
        }
      }
    }
    init();
  }, [stateFromUrl]);

  const nextStep = async () => {
    let fields: (keyof FormValues)[] = [];
    if (step === 0) {
      fields = ["ownerFullName", "ownerEmail", "ownerPhone", "ownerBirthDate", "termsConsent", "dataProcessingConsent"];
      const isValid = await form.trigger(fields);
      if (!isValid) return;
      
      const birthDateVal = form.getValues("ownerBirthDate");
      if (!birthDateVal) {
        toast({ title: "Fecha requerida", description: "Por favor, introduce tu fecha de nacimiento.", variant: "destructive" });
        return;
      }
      const birthDate = new Date(birthDateVal as string);
      if (isNaN(birthDate.getTime())) {
        toast({ title: "Fecha inválida", description: "La fecha introducida no es válida.", variant: "destructive" });
        return;
      }
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        toast({ title: "Edad no permitida", description: "Lo sentimos, debes tener al menos 18 años para constituir una LLC.", variant: "destructive" });
        return;
      }
      setStep(1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
      return;
    }
    else if (step === 1) {
      fields = ["companyName", "ownerIdNumber", "ownerIdType", "businessCategory", "companyDescription", "ownerCity", "ownerCountry"];
      const isValid = await form.trigger(fields);
      if (!isValid) return;
      setStep(2);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
      return;
    }
    else if (step === 2) {
      if (!isEmailVerified) {
        toast({ title: "Verificación requerida", description: "Debes verificar tu email antes de continuar.", variant: "destructive" });
        return;
      }
      setStep(3);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
      return;
    } else if (step === 3) {
      const notes = form.getValues("notes");
      if (!notes || !notes.includes("Método de pago seleccionado:")) {
        toast({ title: "Método de pago", description: "Por favor, selecciona un método de pago antes de continuar.", variant: "destructive" });
        return;
      }
      setStep(4);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
      return;
    } else if (step === 4) {
      form.handleSubmit(onSubmit)();
      return;
    }
    
    const isValid = await form.trigger(fields);
    if (isValid) {
      setStep(s => s + 1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
    }
  };

  const prevStep = () => {
    setStep(s => s - 1);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
  };

  const sendOtp = async () => {
    const email = form.getValues("ownerEmail");
    if (!email) {
      toast({ title: "Email faltante", description: "Por favor, introduce tu email." });
      return;
    }
    try {
      await apiRequest("POST", `/api/llc/${appId}/send-otp`, { email });
      setIsOtpSent(true);
      toast({ title: "Código enviado", description: "Revisa tu bandeja de entrada." });
    } catch {
      toast({ title: "Error", description: "No se pudo enviar el código", variant: "destructive" });
    }
  };

  const verifyOtp = async () => {
    const otp = form.getValues("otp");
    try {
      await apiRequest("POST", `/api/llc/${appId}/verify-otp`, { otp });
      setIsEmailVerified(true);
      toast({ title: "Email verificado", variant: "success" });
    } catch {
      toast({ title: "Código incorrecto", variant: "destructive" });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEmailVerified) {
      toast({ title: "Verificación requerida", description: "Debes verificar tu email.", variant: "destructive" });
      return;
    }
    if (!data.termsConsent) {
      toast({ title: "Consentimiento requerido", description: "Debes aceptar los términos.", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("PUT", `/api/llc/${appId}`, { ...data, status: "submitted" });
      toast({ title: "¡Solicitud enviada!", description: "Nos pondremos en contacto contigo pronto.", variant: "success" });
      setLocation("/contacto?success=true");
    } catch {
      toast({ title: "Error", description: "Hubo un problema al enviar la solicitud.", variant: "destructive" });
    }
  };

  const STEPS_DATA = [
    { n: 1, label: "Datos Personales", desc: "Información oficial del propietario legal." },
    { n: 2, label: "Tu Nueva LLC", desc: `Configuración en ${stateFromUrl}` },
    { n: 3, label: "Verificación", desc: "Código de seguridad enviado por email." },
    { n: 4, label: "Método de Pago", desc: "Selecciona cómo deseas abonar el servicio." },
    { n: 5, label: "Revisión Final", desc: "Confirma los detalles de tu solicitud." }
  ];

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar />
      
      <main className="relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-accent/5 to-transparent -z-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-32 pb-16 flex flex-col items-center justify-center text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tight text-primary mb-6 leading-[0.9] text-center"
            >
              VAMOS A <br /> CONSTITUIR TU <span className="text-accent">LLC</span>
            </motion.h1>
          </div>

          <div className="space-y-6 mb-20">
            <Form {...form}>
              <form className="space-y-6">
                {STEPS_DATA.map((s, i) => (
                  <div key={s.n} className="bg-background rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden transition-all duration-500">
                    <div 
                      className={`p-6 flex items-center gap-4 transition-colors cursor-default ${
                        step === i ? 'bg-accent/10' : 'bg-background'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                        step >= i ? 'bg-accent text-primary' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step > i ? <Check className="w-5 h-5 text-primary stroke-[3]" /> : s.n}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[11px] uppercase font-black tracking-widest block ${
                          step >= i ? 'text-primary' : 'text-gray-400'
                        }`}>
                          Paso {s.n}
                        </span>
                        <h3 className={`text-lg font-black uppercase tracking-tight ${
                          step >= i ? 'text-primary' : 'text-gray-300'
                        }`}>
                          {s.label}
                        </h3>
                      </div>
                      {step > i && <div className="text-accent font-black text-[10px] uppercase">Completado</div>}
                    </div>

                    <AnimatePresence>
                      {step === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          <div className="p-8 pt-2 md:p-12 md:pt-4 border-t border-gray-50">
                            {step === 0 && (
                              <div className="space-y-8">
                                <div className="grid grid-cols-1 gap-5">
                                  <FormField
                                    control={form.control}
                                    name="ownerFullName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Nombre Completo</FormLabel>
                                        <FormControl><Input {...field} value={field.value || ""} className="rounded-3xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-accent focus:ring-accent transition-all font-normal text-base" placeholder="" /></FormControl>
                                        <FormMessage className="font-bold text-[10px] mt-1.5" />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <FormField
                                      control={form.control}
                                      name="ownerEmail"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Email</FormLabel>
                                          <FormControl><Input {...field} value={field.value || ""} type="email" className="rounded-3xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-accent font-normal text-base" placeholder="" /></FormControl>
                                          <FormMessage className="font-bold text-[10px] mt-1.5" />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="ownerPhone"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Número de teléfono</FormLabel>
                                          <div className="flex gap-2">
                                            <div className="w-32">
                                              <Select 
                                                value={selectedCountryPrefix} 
                                                onValueChange={(val) => {
                                                  setSelectedCountryPrefix(val);
                                                  form.setValue("ownerPhone", val + (form.getValues("ownerPhone")?.replace(/^\+\d+/, "") || ""));
                                                }}
                                              >
                                                <SelectTrigger className="rounded-3xl border-gray-100 bg-background h-12 md:h-14 px-3 focus:ring-accent font-normal text-sm">
                                                  <SelectValue placeholder="+34" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-background max-h-60">
                                                  {COUNTRY_PREFIXES.map((country) => (
                                                    <SelectItem key={country.code} value={country.code}>
                                                      {country.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <FormControl className="flex-1"><Input {...field} value={field.value || ""} className="rounded-3xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-accent font-normal text-base" placeholder="" /></FormControl>
                                          </div>
                                          <FormMessage className="font-bold text-[10px] mt-1.5" />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div className="space-y-5 pt-6 border-t border-gray-100">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/30 flex items-center gap-2">
                                      <MapPin className="w-3.5 h-3.5" /> Dirección de Residencia
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                      <FormField
                                        control={form.control}
                                        name="ownerStreetType"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "Calle"}>
                                              <FormControl>
                                                <SelectTrigger className="rounded-3xl border-gray-100 bg-background h-12 md:h-14 px-4 focus:ring-accent font-normal text-base">
                                                  <SelectValue placeholder="Calle" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent className="bg-background">
                                                {STREET_TYPES.map(type => (
                                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="ownerAddress"
                                        render={({ field }) => (
                                          <FormItem className="sm:col-span-2">
                                            <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Nombre de Vía y Número</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-3xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-accent font-normal text-base" placeholder="" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                      <FormField
                                        control={form.control}
                                        name="ownerCity"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Ciudad</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-3xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-accent font-normal text-base" placeholder="" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="ownerProvince"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Provincia</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-3xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-accent font-normal text-base" placeholder="" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                      <FormField
                                        control={form.control}
                                        name="ownerPostalCode"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Código Postal</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-full border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="ownerCountry"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">País</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-full border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-4 pt-6">
                                    <FormField
                                      control={form.control}
                                      name="ownerBirthDate"
                                      render={({ field }) => (
                                        <FormItem className="max-w-[180px]">
                                          <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Fecha Nacimiento</FormLabel>
                                          <FormControl><Input {...field} value={field.value || ""} type="date" className="rounded-full border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-[13px] sm:text-base w-full" /></FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="termsConsent"
                                      render={({ field }) => (
                                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-2xl border border-gray-100 p-4 bg-gray-50/30">
                                          <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-tight">
                                              Acepto los términos y condiciones de servicio.
                                            </FormLabel>
                                          </div>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="dataProcessingConsent"
                                      render={({ field }) => (
                                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-2xl border border-gray-100 p-4 bg-gray-50/30">
                                          <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-tight">
                                              Consiento el tratamiento de mis datos personales para la gestión de mi solicitud.
                                            </FormLabel>
                                          </div>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {step === 1 && (
                              <div className="space-y-8">
                                <FormField
                                  control={form.control}
                                  name="companyName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Nombre para tu LLC (Debe terminar en LLC)</FormLabel>
                                      <FormControl><Input {...field} value={field.value || ""} className="rounded-full border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="Mi Empresa LLC" /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-gray-100">
                                  <FormField
                                    control={form.control}
                                    name="ownerIdType"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Tipo de Documento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || "Passport"}>
                                          <FormControl>
                                            <SelectTrigger className="rounded-full border-gray-100 bg-white h-12 md:h-14 px-4 focus:ring-brand-lime font-normal text-base">
                                              <SelectValue placeholder="Pasaporte" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent className="bg-white">
                                            <SelectItem value="Passport">Pasaporte</SelectItem>
                                            <SelectItem value="NationalID">DNI / NIE / Cédula</SelectItem>
                                            <SelectItem value="DriverLicense">Licencia de Conducir</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="ownerIdNumber"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Número de Documento</FormLabel>
                                        <FormControl><Input {...field} value={field.value || ""} className="rounded-full border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-gray-100">
                                  <FormField
                                    control={form.control}
                                    name="businessCategory"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Actividad de la LLC (Categoría)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                          <FormControl>
                                            <SelectTrigger className="rounded-full border-gray-100 bg-white h-12 md:h-14 px-4 focus:ring-brand-lime font-normal text-base">
                                              <SelectValue placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent className="bg-white max-h-60">
                                            {BUSINESS_CATEGORIES.map(cat => (
                                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="companyDescription"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Descripción detallada de la actividad</FormLabel>
                                        <FormControl><Input {...field} value={field.value || ""} className="rounded-full border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="Venta de servicios de marketing..." /></FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={form.control}
                                  name="notes"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="font-normal text-sm text-gray-500 mb-1.5 block uppercase tracking-tight">Nota adicional (Opcional)</FormLabel>
                                      <FormControl><Textarea {...field} value={field.value || ""} className="rounded-[1.5rem] border-gray-100 bg-gray-50/30 min-h-[100px] px-6 py-4 focus:border-brand-lime font-normal text-base" placeholder="¿Algo más que debamos saber?" /></FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}

                            {step === 2 && (
                              <div className="space-y-8 flex flex-col items-center py-4">
                                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                  <Mail className="w-10 h-10 text-accent" />
                                </div>
                                <div className="text-center space-y-3">
                                  <h3 className="text-2xl font-black uppercase tracking-tight text-primary">Verifica tu identidad</h3>
                                  <p className="text-gray-500 text-sm max-w-sm mx-auto">Para garantizar la seguridad de tu trámite, hemos enviado un código de verificación a: <br /><strong className="text-primary">{form.getValues("ownerEmail")}</strong></p>
                                </div>
                                <div className="w-full max-w-sm space-y-6">
                                  {!isOtpSent ? (
                                    <Button 
                                      type="button" 
                                      onClick={sendOtp} 
                                      className="w-full bg-accent text-primary font-sans font-medium text-[14px] sm:text-base h-14 rounded-full shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                      Enviar código de verificación
                                    </Button>
                                  ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                      <FormField
                                        control={form.control}
                                        name="otp"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input 
                                                {...field} 
                                                maxLength={6} 
                                                className="h-16 text-center text-3xl font-black tracking-[0.5em] rounded-2xl border-2 border-accent/30 focus:border-accent bg-white" 
                                                placeholder="000000" 
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <div className="flex flex-col gap-3">
                                        <Button 
                                          type="button" 
                                          onClick={verifyOtp} 
                                          className="w-full bg-accent text-primary font-sans font-medium text-[14px] sm:text-base h-14 rounded-full shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                          Verificar código
                                        </Button>
                                        <button 
                                          type="button" 
                                          onClick={sendOtp} 
                                          className="text-[10px] font-sans font-black uppercase tracking-[0.25em] text-accent hover:text-accent/80 underline"
                                        >
                                          Reenviar código
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {isEmailVerified && (
                                    <div className="flex items-center justify-center gap-2 text-accent font-black uppercase text-xs py-2 bg-accent/10 rounded-full animate-in zoom-in-50">
                                      <ShieldCheck className="w-4 h-4 text-accent" /> Email verificado correctamente
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {step === 3 && (
                              <div className="space-y-8">
                                <div className="text-center space-y-2 mb-8">
                                  <h4 className="text-xl font-black uppercase tracking-tight text-brand-dark">Selecciona tu método de pago</h4>
                                  <p className="text-gray-500 text-sm">Tu solicitud quedará registrada y procederemos con el trámite una vez confirmado el pago.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                  {PAYMENT_METHODS.map((method) => (
                                    <div 
                                      key={method.id}
                                      onClick={() => {
                                        form.setValue("notes", `Método de pago seleccionado: ${method.label}. ` + (form.getValues("notes")?.replace(/Método de pago seleccionado: [^.]+ \. /g, "") || ""));
                                        toast({ title: "Método seleccionado", description: method.label });
                                      }}
                                      className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-center justify-between ${
                                        form.getValues("notes")?.includes(method.label)
                                          ? "border-accent bg-accent/5 shadow-inner"
                                          : "border-gray-100 hover:border-accent/30"
                                      }`}
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            form.getValues("notes")?.includes(method.label)
                                              ? "border-accent bg-accent text-primary"
                                              : "border-gray-200"
                                          }`}>
                                            {form.getValues("notes")?.includes(method.label) && <div className="w-2 h-2 rounded-full bg-primary" />}
                                          </div>
                                          <h5 className="font-black uppercase tracking-tight text-brand-dark">{method.label}</h5>
                                        </div>
                                        <p className="text-gray-500 text-xs ml-9">{method.desc}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {step === 4 && (
                              <div className="space-y-8">
                                <div className="bg-brand-dark text-white p-8 rounded-[2rem] relative overflow-hidden mb-8">
                                  <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <ShieldCheck className="w-24 h-24 text-accent" />
                                  </div>
                                  <div className="relative z-10 text-center sm:text-left">
                                    <p className="text-accent font-black text-xs uppercase tracking-[0.2em] mb-2">Código de Pedido</p>
                                    <h4 className="text-4xl font-black uppercase tracking-tighter mb-4">{orderNumber}</h4>
                                    <p className="text-gray-400 text-sm max-w-md mx-auto sm:mx-0">Guarda este código para consultar el estado de tu solicitud en cualquier momento.</p>
                                  </div>
                                </div>
                                
                                <div className="bg-brand-lime/5 p-8 rounded-[2rem] border border-brand-lime/20 space-y-6">
                                  <div className="flex items-center justify-between border-b border-brand-lime/10 pb-4">
                                    <h4 className="font-black uppercase tracking-tight text-brand-dark">Resumen de la solicitud</h4>
                                    <span className="bg-brand-dark text-brand-lime font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest">PEDIDO: {orderNumber}</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 mb-1">Titular</p>
                                        <p className="font-bold text-brand-dark">{form.getValues("ownerFullName")}</p>
                                        <p className="text-gray-500">{form.getValues("ownerEmail")}</p>
                                        <Button type="button" variant="ghost" onClick={() => setStep(0)} className="h-8 px-0 text-[10px] uppercase font-sans font-black text-brand-lime hover:bg-transparent">Editar datos</Button>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 mb-1">Empresa</p>
                                        <p className="font-bold text-brand-dark">{form.getValues("companyName")}</p>
                                        <p className="text-gray-500">Estado: {form.getValues("state")}</p>
                                        <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-8 px-0 text-[10px] uppercase font-sans font-black text-brand-lime hover:bg-transparent">Editar empresa</Button>
                                      </div>
                                    </div>
                                    <div className="space-y-4 bg-white/50 p-6 rounded-2xl border border-brand-lime/10">
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 mb-1">Pago</p>
                                        <p className="font-bold text-brand-dark">{form.getValues("notes")?.split(".")[0]?.replace("Método de pago seleccionado: ", "")}</p>
                                      </div>
                                      <div className="pt-2">
                                        <p className="text-2xl font-black text-brand-dark">{stateFromUrl.includes("Wyoming") ? "799€" : stateFromUrl.includes("Delaware") ? "999€" : "639€"}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-lime">Impuestos y tasas incluidos</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-center p-4">
                                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto">Al hacer clic en "Enviar Solicitud", confirmas que toda la información proporcionada es veraz y correcta para proceder con el registro legal de tu LLC.</p>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center gap-4 mt-8">
                              {step > 0 && (
                                <Button 
                                  type="button" 
                                  onClick={prevStep} 
                                  className="rounded-full bg-accent text-primary font-sans font-medium h-12 md:h-14 px-8 md:px-12 text-[14px] md:text-base shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                  Atrás
                                </Button>
                              )}
                              <Button 
                                type="button" 
                                onClick={nextStep}
                                className="flex-1 bg-accent text-primary font-sans font-medium h-12 md:h-14 rounded-full text-[14px] md:text-base shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
                              >
                                {step === 4 ? (isSubmitting ? "Enviando..." : "Enviar Solicitud") : "Continuar"}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </form>
            </Form>
          </div>
        </div>
      </main>
      
      <NewsletterSection />
      <Footer />
    </div>
  );
}
