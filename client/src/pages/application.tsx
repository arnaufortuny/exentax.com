import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Mail, Globe, MapPin, Building2, Loader2 } from "lucide-react";
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

          <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden mb-20">
            <div className="p-8 md:p-14">
              <div className="flex justify-between items-center mb-16 relative max-w-2xl mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-[2px] bg-brand-lime -translate-y-1/2 z-0 transition-all duration-700 ease-in-out" 
                  style={{ width: `${(step / 3) * 100}%` }} 
                />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 border-4 ${
                      step >= i - 1 
                        ? 'bg-brand-lime border-brand-lime text-brand-dark scale-110 shadow-[0_0_20px_rgba(217,255,0,0.4)]' 
                        : 'bg-white border-gray-100 text-gray-300'
                    }`}>
                      {i}
                    </div>
                  </div>
                ))}
              </div>

              <Form {...form}>
                <form className="space-y-12">
                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                      >
                        <div className="space-y-3">
                          <h2 className="text-4xl font-black uppercase tracking-tight text-brand-dark">1. Datos Personales</h2>
                          <p className="text-muted-foreground font-medium text-lg">Información oficial del propietario legal.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-8">
                          <FormField
                            control={form.control}
                            name="ownerFullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Nombre Completo (DNI/Pasaporte)</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime focus:ring-brand-lime transition-all font-normal text-lg" placeholder="" /></FormControl>
                                <FormMessage className="font-bold text-xs mt-2" />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <FormField
                              control={form.control}
                              name="ownerEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Email de contacto</FormLabel>
                                  <FormControl><Input {...field} value={field.value || ""} type="email" className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg" placeholder="" /></FormControl>
                                  <FormMessage className="font-bold text-xs mt-2" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="ownerPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">WhatsApp / Teléfono</FormLabel>
                                  <div className="flex gap-3">
                                    <div className="w-28">
                                      <Select defaultValue="+34">
                                        <SelectTrigger className="rounded-2xl border-gray-100 bg-white h-16 px-6 focus:ring-brand-lime font-normal text-lg">
                                          <SelectValue placeholder="+34" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                          <SelectItem value="+34">+34 (ES)</SelectItem>
                                          <SelectItem value="+1">+1 (US)</SelectItem>
                                          <SelectItem value="+52">+52 (MX)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <FormControl className="flex-1"><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg" placeholder="" /></FormControl>
                                  </div>
                                  <FormMessage className="font-bold text-xs mt-2" />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-6 pt-10 border-t border-gray-100">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-brand-dark/30 mb-4 flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> Dirección de Residencia
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <FormField
                                control={form.control}
                                name="ownerStreetType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Tipo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "Calle"}>
                                      <FormControl>
                                        <SelectTrigger className="rounded-2xl border-gray-100 bg-white h-16 px-6 focus:ring-brand-lime font-normal text-lg">
                                          <SelectValue placeholder="Selecciona" />
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
                                    <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Nombre de Vía y Número</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg" placeholder="" /></FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="ownerCity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Ciudad</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg" placeholder="" /></FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="ownerProvince"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Provincia / Estado</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg" placeholder="" /></FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="ownerPostalCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Código Postal</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg" placeholder="" /></FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="ownerCountry"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">País</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg" placeholder="" /></FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="ownerBirthDate"
                            render={({ field }) => (
                              <FormItem className="pt-10 border-t border-gray-100">
                                <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Fecha Nacimiento</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} type="date" className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg" /></FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                      >
                        <div className="space-y-3">
                          <h2 className="text-4xl font-black uppercase tracking-tight text-brand-dark">2. Tu Nueva LLC</h2>
                          <p className="text-muted-foreground font-medium text-lg">Configuración de la entidad en {stateFromUrl}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Nombre Deseado (Prioridad 1)</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg uppercase" placeholder="" /></FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="companyNameOption2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Nombre Alternativo (Prioridad 2)</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 h-16 px-8 focus:border-brand-lime font-normal text-lg uppercase" placeholder="" /></FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="businessCategory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Categoría de Negocio</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-2xl border-gray-100 bg-white h-16 px-8 focus:ring-brand-lime font-normal text-lg">
                                      <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[300px] bg-white">
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
                                <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Actividad Detallada</FormLabel>
                                <FormControl><Textarea {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 min-h-[150px] px-8 py-6 focus:border-brand-lime font-normal text-lg resize-none" placeholder="" /></FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2 block">Notas Adicionales</FormLabel>
                                <FormControl><Textarea {...field} value={field.value || ""} className="rounded-2xl border-gray-100 bg-gray-50/50 min-h-[100px] px-8 py-6 focus:border-brand-lime font-normal text-lg resize-none" placeholder="" /></FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12 text-center py-10"
                      >
                        <div className="w-32 h-32 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                          <Mail className="w-14 h-14 text-brand-dark" />
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-4xl font-black uppercase tracking-tight text-brand-dark">3. Verificación</h2>
                          <p className="text-muted-foreground font-medium text-xl px-4">Hemos enviado un código seguro a: <br/><span className="font-black text-brand-dark text-2xl mt-2 block">{form.getValues("ownerEmail")}</span></p>
                        </div>
                        
                        {!isOtpSent ? (
                          <Button 
                            type="button" 
                            onClick={sendOtp} 
                            className="bg-brand-lime text-brand-dark rounded-full px-20 h-20 font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-2xl shadow-brand-lime/40"
                          >
                            Enviar Código OTP
                          </Button>
                        ) : (
                          <div className="space-y-8 max-w-sm mx-auto">
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
                                      className="text-center text-5xl font-black tracking-[0.6em] h-24 rounded-3xl border-4 border-brand-lime bg-white shadow-xl focus:ring-brand-lime" 
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
                              className={`w-full rounded-2xl h-20 font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl ${
                                isEmailVerified ? "bg-green-500 text-white" : "bg-brand-lime text-brand-dark hover:bg-brand-lime/90"
                              }`}
                            >
                              {isEmailVerified ? "Verificado Correctamente ✓" : "Validar Código"}
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                      >
                        <div className="space-y-3 text-center">
                          <h2 className="text-4xl font-black uppercase tracking-tight text-brand-dark">4. Revisión Final</h2>
                          <p className="text-muted-foreground font-medium text-lg">Tu solicitud está lista para ser procesada.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                          <div className="bg-brand-dark text-white rounded-[2rem] p-8 flex justify-between items-center shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-48 h-full bg-brand-lime/5 transform skew-x-12 translate-x-16" />
                             <div className="relative z-10">
                                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-brand-lime/70 mb-2">Orden de Solicitud</p>
                                <p className="text-4xl font-black font-mono">#{orderNumber.toString().padStart(5, '0')}</p>
                             </div>
                             <div className="w-16 h-16 bg-brand-lime rounded-2xl flex items-center justify-center rotate-6 relative z-10 shadow-lg">
                                <ShieldCheck className="w-8 h-8 text-brand-dark" />
                             </div>
                          </div>

                          <div className="bg-gray-50/50 rounded-[2rem] p-10 border border-gray-100 space-y-8">
                            <div className="flex justify-between items-center border-b border-gray-200/50 pb-6">
                              <h4 className="text-sm font-black uppercase tracking-widest text-brand-dark flex items-center gap-3">
                                <Globe className="w-5 h-5 text-brand-lime" /> Datos del Socio
                              </h4>
                              <Button type="button" variant="ghost" onClick={() => setStep(0)} className="h-10 px-6 text-[11px] uppercase font-black text-brand-lime hover:bg-brand-lime/10 rounded-full">Editar</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Titular Legal</p>
                                <p className="font-bold text-brand-dark text-xl">{form.getValues("ownerFullName") || "---"}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Email Confirmado</p>
                                <p className="font-bold text-brand-dark text-xl truncate">{form.getValues("ownerEmail") || "---"}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50/50 rounded-[2rem] p-10 border border-gray-100 space-y-8">
                            <div className="flex justify-between items-center border-b border-gray-200/50 pb-6">
                              <h4 className="text-sm font-black uppercase tracking-widest text-brand-dark flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-brand-lime" /> La Empresa
                              </h4>
                              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-10 px-6 text-[11px] uppercase font-black text-brand-lime hover:bg-brand-lime/10 rounded-full">Editar</Button>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Nombre Reservado</p>
                              <p className="font-black text-3xl text-brand-dark uppercase tracking-tight">{form.getValues("companyName")}</p>
                            </div>
                          </div>

                          <div className="space-y-6 pt-6">
                            <div className="flex items-start gap-4 p-6 bg-brand-lime/5 rounded-2xl border border-brand-lime/10">
                              <Checkbox 
                                id="terms" 
                                checked={form.watch("termsConsent")}
                                onCheckedChange={(checked) => form.setValue("termsConsent", checked as boolean)}
                                className="mt-1 w-6 h-6 rounded-lg border-2 border-gray-200 data-[state=checked]:bg-brand-lime data-[state=checked]:border-brand-lime data-[state=checked]:text-brand-dark shadow-sm"
                              />
                              <label htmlFor="terms" className="text-base font-medium leading-relaxed text-gray-600 cursor-pointer">
                                Confirmo que los datos son correctos y acepto los <Link href="/legal" className="text-brand-dark font-black underline decoration-brand-lime decoration-[3px] underline-offset-4">Términos de Servicio</Link> y la Política de Privacidad.
                              </label>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-gray-100">
                    {step > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="w-full sm:w-1/3 h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all"
                      >
                        Atrás
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isSubmitting || (step === 2 && !isEmailVerified)}
                      className={`h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-2xl flex-1 ${
                        step === 3 
                          ? "bg-brand-dark text-white hover:bg-brand-dark/95" 
                          : "bg-brand-lime text-brand-dark hover:bg-brand-lime/90 shadow-brand-lime/30"
                      }`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : step === 3 ? (
                        "Enviar Solicitud"
                      ) : (
                        "Continuar"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      
      <NewsletterSection />
      <Footer />
    </div>
  );
}
