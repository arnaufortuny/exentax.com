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
  const [orderNumber, setOrderNumber] = useState<number>(0);
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
        setOrderNumber(data.id);
      } catch (err) {
        console.error("Error initializing application:", err);
      }
    }
    init();
  }, [stateFromUrl]);

  const nextStep = async () => {
    let fields: (keyof FormValues)[] = [];
    if (step === 0) fields = ["ownerFullName", "ownerEmail", "ownerPhone", "ownerAddress", "ownerStreetType", "ownerCity", "ownerCountry", "ownerProvince", "ownerPostalCode", "ownerBirthDate"];
    else if (step === 1) fields = ["companyName", "companyNameOption2", "companyDescription", "businessCategory", "businessCategoryOther"];
    else if (step === 2) {
      if (!isEmailVerified) {
        toast({ title: "Verificación requerida", description: "Debes verificar tu email antes de continuar.", variant: "destructive" });
        return;
      }
      setStep(3);
      return;
    } else if (step === 3) {
      form.handleSubmit(onSubmit)();
      return;
    }
    
    const isValid = await form.trigger(fields);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

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
    { n: 4, label: "Revisión Final", desc: "Confirma los detalles de tu solicitud." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />
      
      <main className="relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-lime/5 to-transparent -z-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-32 pb-16 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tight text-brand-dark mb-6 leading-[0.9]"
            >
              VAMOS A <br /> CONSTITUIR TU <span className="text-brand-lime">LLC</span>
            </motion.h1>
          </div>

          <div className="space-y-6 mb-20">
            <Form {...form}>
              <form className="space-y-6">
                {STEPS_DATA.map((s, i) => (
                  <div key={s.n} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden transition-all duration-500">
                    {/* Header de la casilla */}
                    <div 
                      className={`p-6 flex items-center gap-4 transition-colors cursor-default ${
                        step === i ? 'bg-brand-lime/10' : 'bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                        step >= i ? 'bg-brand-lime text-brand-dark' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step > i ? <Check className="w-5 h-5" /> : s.n}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[11px] uppercase font-black tracking-widest block ${
                          step >= i ? 'text-brand-dark' : 'text-gray-400'
                        }`}>
                          Paso {s.n}
                        </span>
                        <h3 className={`text-lg font-black uppercase tracking-tight ${
                          step >= i ? 'text-brand-dark' : 'text-gray-300'
                        }`}>
                          {s.label}
                        </h3>
                      </div>
                      {step > i && <div className="text-brand-lime font-black text-[10px] uppercase">Completado</div>}
                    </div>

                    {/* Contenido desplegado si es el paso actual */}
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
                                        <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Nombre Completo</FormLabel>
                                        <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime focus:ring-brand-lime transition-all font-normal text-base" placeholder="" /></FormControl>
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
                                          <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Email</FormLabel>
                                          <FormControl><Input {...field} value={field.value || ""} type="email" className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
                                          <FormMessage className="font-bold text-[10px] mt-1.5" />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="ownerPhone"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">WhatsApp</FormLabel>
                                          <div className="flex gap-2">
                                            <div className="w-24">
                                              <Select defaultValue="+34">
                                                <SelectTrigger className="rounded-xl border-gray-100 bg-white h-12 md:h-14 px-4 focus:ring-brand-lime font-normal text-base">
                                                  <SelectValue placeholder="+34" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                  <SelectItem value="+34">+34 (ES)</SelectItem>
                                                  <SelectItem value="+1">+1 (US)</SelectItem>
                                                  <SelectItem value="+52">+52 (MX)</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <FormControl className="flex-1"><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
                                          </div>
                                          <FormMessage className="font-bold text-[10px] mt-1.5" />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div className="space-y-5 pt-6 border-t border-gray-100">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-dark/30 flex items-center gap-2">
                                      <MapPin className="w-3.5 h-3.5" /> Dirección de Residencia
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                      <FormField
                                        control={form.control}
                                        name="ownerStreetType"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "Calle"}>
                                              <FormControl>
                                                <SelectTrigger className="rounded-xl border-gray-100 bg-white h-12 md:h-14 px-4 focus:ring-brand-lime font-normal text-base">
                                                  <SelectValue placeholder="Calle" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent className="bg-white">
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
                                            <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Nombre de Vía y Número</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
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
                                            <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Ciudad</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="ownerProvince"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Provincia</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
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
                                            <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Código Postal</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="ownerCountry"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">País</FormLabel>
                                            <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" placeholder="" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>

                                  <FormField
                                    control={form.control}
                                    name="ownerBirthDate"
                                    render={({ field }) => (
                                      <FormItem className="pt-6 border-t border-gray-100">
                                        <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Fecha Nacimiento</FormLabel>
                                        <FormControl><Input {...field} value={field.value || ""} type="date" className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base" /></FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            )}

                            {step === 1 && (
                              <div className="space-y-8">
                                <div className="grid grid-cols-1 gap-5">
                                  <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Nombre (Opción 1)</FormLabel>
                                        <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base uppercase" placeholder="" /></FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="companyNameOption2"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Nombre (Opción 2)</FormLabel>
                                        <FormControl><Input {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 h-12 md:h-14 px-6 focus:border-brand-lime font-normal text-base uppercase" placeholder="" /></FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="businessCategory"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Categoría de Negocio</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                          <FormControl>
                                            <SelectTrigger className="rounded-xl border-gray-100 bg-white h-12 md:h-14 px-6 focus:ring-brand-lime font-normal text-base">
                                              <SelectValue placeholder="Selecciona categoría" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent className="max-h-[250px] bg-white">
                                            {BUSINESS_CATEGORIES.map(cat => (
                                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="companyDescription"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Actividad</FormLabel>
                                        <FormControl><Textarea {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 min-h-[120px] px-6 py-4 focus:border-brand-lime font-normal text-base resize-none" placeholder="" /></FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Notas (Opcional)</FormLabel>
                                        <FormControl><Textarea {...field} value={field.value || ""} className="rounded-xl border-gray-100 bg-gray-50/30 min-h-[80px] px-6 py-4 focus:border-brand-lime font-normal text-base resize-none" placeholder="" /></FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            )}

                            {step === 2 && (
                              <div className="space-y-8 text-center py-6">
                                <div className="w-24 h-24 bg-brand-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                  <Mail className="w-10 h-10 text-brand-dark" />
                                </div>
                                <div className="space-y-3">
                                  <p className="text-muted-foreground font-medium text-base px-2">Introduce el código enviado a: <br/><span className="font-black text-brand-dark text-lg mt-1 block truncate">{form.getValues("ownerEmail")}</span></p>
                                </div>
                                
                                {!isOtpSent ? (
                                  <Button 
                                    type="button" 
                                    onClick={sendOtp} 
                                    className="bg-brand-lime text-brand-dark rounded-full px-12 h-14 font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-brand-lime/30"
                                  >
                                    Recibir Código
                                  </Button>
                                ) : (
                                  <div className="space-y-6 max-w-xs mx-auto">
                                    <FormField
                                      control={form.control}
                                      name="otp"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input 
                                              {...field} 
                                              value={field.value || ""} 
                                              maxLength={6} 
                                              className="text-center text-4xl font-black tracking-[0.5em] h-16 md:h-20 rounded-2xl border-2 border-brand-lime bg-white shadow-lg focus:ring-brand-lime" 
                                              placeholder="000000" 
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <Button 
                                      type="button" 
                                      onClick={verifyOtp} 
                                      disabled={isEmailVerified} 
                                      className={`w-full rounded-xl h-14 font-black uppercase tracking-widest text-xs transition-all ${
                                        isEmailVerified ? "bg-green-500 text-white" : "bg-brand-lime text-brand-dark hover:bg-brand-lime/90"
                                      }`}
                                    >
                                      {isEmailVerified ? "Completado ✓" : "Validar"}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {step === 3 && (
                              <div className="space-y-8">
                                <div className="grid grid-cols-1 gap-6">
                                  <div className="bg-brand-dark text-white rounded-2xl p-6 flex justify-between items-center shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-full bg-brand-lime/5 transform skew-x-12 translate-x-12" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-lime/70 mb-1">Nº Solicitud</p>
                                        <p className="text-2xl font-black font-mono">#{orderNumber.toString().padStart(5, '0')}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-brand-lime rounded-xl flex items-center justify-center rotate-6 relative z-10">
                                        <ShieldCheck className="w-6 h-6 text-brand-dark" />
                                    </div>
                                  </div>

                                  <div className="bg-gray-50/40 rounded-2xl p-6 border border-gray-100 space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-200/50 pb-4">
                                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-dark flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-brand-lime" /> Socio
                                      </h4>
                                      <Button type="button" variant="ghost" onClick={() => setStep(0)} className="h-8 px-4 text-[10px] uppercase font-black text-brand-lime hover:bg-brand-lime/10 rounded-full">Editar</Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase text-gray-400">Titular</p>
                                        <p className="font-bold text-brand-dark text-base">{form.getValues("ownerFullName") || "---"}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase text-gray-400">Email</p>
                                        <p className="font-bold text-brand-dark text-base truncate">{form.getValues("ownerEmail") || "---"}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50/40 rounded-2xl p-6 border border-gray-100 space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-200/50 pb-4">
                                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-dark flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-brand-lime" /> Entidad
                                      </h4>
                                      <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-8 px-4 text-[10px] uppercase font-black text-brand-lime hover:bg-brand-lime/10 rounded-full">Editar</Button>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold uppercase text-gray-400">Nombre</p>
                                      <p className="font-black text-xl text-brand-dark uppercase">{form.getValues("companyName")}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-4 pt-4">
                                    <div className="flex items-start gap-3 p-4 bg-brand-lime/5 rounded-xl border border-brand-lime/10">
                                      <Checkbox 
                                        id="terms" 
                                        checked={form.watch("termsConsent")}
                                        onCheckedChange={(checked) => form.setValue("termsConsent", checked as boolean)}
                                        className="mt-1 w-5 h-5 rounded border-2 border-gray-200 data-[state=checked]:bg-brand-lime data-[state=checked]:border-brand-lime data-[state=checked]:text-brand-dark shadow-sm"
                                      />
                                      <label htmlFor="terms" className="text-xs md:text-sm font-medium leading-relaxed text-gray-600 cursor-pointer">
                                        Confirmo que los datos son correctos y acepto los <Link href="/legal" className="text-brand-dark font-black underline decoration-brand-lime decoration-[2px] underline-offset-4">Términos de Servicio</Link> y la Política de Privacidad.
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Botones de navegación dentro de la casilla desplegada */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-gray-50">
                              {step > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={prevStep}
                                  className="w-full sm:w-1/3 h-14 md:h-16 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] border-2 border-gray-100 hover:bg-gray-50 transition-all"
                                >
                                  Atrás
                                </Button>
                              )}
                              <Button
                                type="button"
                                onClick={nextStep}
                                disabled={isSubmitting || (step === 2 && !isEmailVerified)}
                                className={`h-14 md:h-16 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] transition-all shadow-xl flex-1 ${
                                  step === 3 
                                    ? "bg-brand-dark text-white hover:bg-brand-dark/95" 
                                    : "bg-brand-lime text-brand-dark hover:bg-brand-lime/90 shadow-brand-lime/20"
                                }`}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : step === 3 ? (
                                  "FINALIZAR SOLICITUD"
                                ) : (
                                  "CONTINUAR"
                                )}
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
