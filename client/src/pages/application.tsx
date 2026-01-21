import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useLlcApplication, useUpdateLlcApplication } from "@/hooks/use-llc";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

import { HelpSection } from "@/components/layout/help-section";

const STATES = ["New Mexico", "Wyoming", "Delaware"];
const DESIGNATORS = ["LLC", "Limited Liability Company"];

const BUSINESS_CATEGORIES = [
  { id: "tech", label: "Tecnología y Software", description: "SaaS, desarrollo web/apps, IT services" },
  { id: "ecommerce", label: "E-commerce", description: "Tienda online, dropshipping, Amazon FBA" },
  { id: "consulting", label: "Consultoría y Servicios Profesionales", description: "Business consulting, coaching, asesoría" },
  { id: "marketing", label: "Marketing y Publicidad", description: "Agencia digital, social media, SEO/SEM" },
  { id: "education", label: "Educación y Formación", description: "Cursos online, academia digital, e-learning" },
  { id: "content", label: "Contenido Digital y Medios", description: "Producción audiovisual, podcasting, influencer" },
  { id: "design", label: "Diseño y Creatividad", description: "Diseño gráfico, fotografía, web design" },
  { id: "finance", label: "Servicios Financieros", description: "Contabilidad, gestión fiscal, inversiones" },
  { id: "wellness", label: "Salud y Bienestar", description: "Coaching wellness, nutrición online, fitness" },
  { id: "realestate", label: "Inmobiliaria", description: "Inversión inmobiliaria, property management" },
  { id: "import_export", label: "Importación/Exportación", description: "Comercio internacional, distribución" },
  { id: "legal", label: "Servicios Legales", description: "Preparación documentos, servicios paralegal" },
  { id: "trading", label: "Trading e Inversiones", description: "Forex, criptomonedas, bolsa" },
  { id: "entertainment", label: "Entretenimiento", description: "Gaming, eventos, producción" },
  { id: "retail", label: "Retail y Comercio", description: "Venta minorista, distribution productos" },
  { id: "other", label: "Otra", description: "Especificar en descripción" },
];

function generateRequestCode(state: string): string {
  const prefix = state === "Wyoming" ? "WY" : state === "New Mexico" ? "NM" : "DE";
  const part1 = Math.floor(1000 + Math.random() * 9000).toString();
  const part2 = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}-${part1}-${part2}`;
}

export default function ApplicationWizard() {
  const [, params] = useRoute("/application/:id");
  const id = parseInt(params?.id || "0");
  const { data: application, isLoading } = useLlcApplication(id);
  const { mutate: updateApplication, isPending: isSaving } = useUpdateLlcApplication();
  const { isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [step, setStep] = useState(1);
  const [requestCode, setRequestCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ownerFullName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerBirthDate: "",
    ownerAddress: "",
    ownerCity: "",
    ownerProvince: "",
    ownerCountry: "",
    ownerPostalCode: "",
    ownerIdNumber: "",
    ownerIdType: "DNI",
    idLater: false,
    dataProcessingConsent: false,
    ageConfirmation: false,
    companyName: "",
    companyNameOption2: "",
    designator: "LLC",
    companyDescription: "",
    businessCategory: "",
    state: "New Mexico",
  });

  useEffect(() => {
    if (application) {
      setFormData({
        ownerFullName: application.ownerFullName || "",
        ownerEmail: application.ownerEmail || "",
        ownerPhone: application.ownerPhone || "",
        ownerBirthDate: application.ownerBirthDate || "",
        ownerAddress: application.ownerAddress || "",
        ownerCity: application.ownerCity || "",
        ownerProvince: (application as any).ownerProvince || "",
        ownerCountry: application.ownerCountry || "",
        ownerPostalCode: application.ownerPostalCode || "",
        ownerIdNumber: application.ownerIdNumber || "",
        ownerIdType: application.ownerIdType || "DNI",
        idLater: (application as any).idLater || false,
        dataProcessingConsent: application.dataProcessingConsent || false,
        ageConfirmation: application.ageConfirmation || false,
        companyName: application.companyName || "",
        companyNameOption2: (application as any).companyNameOption2 || "",
        designator: application.designator || "LLC",
        companyDescription: application.companyDescription || "",
        businessCategory: application.businessCategory || "",
        state: application.state || "New Mexico",
      });
      if (application.requestCode) {
        setRequestCode(application.requestCode);
      }
    }
  }, [application]);

  const handleNext = () => {
    updateApplication({ id, data: formData }, {
      onSuccess: () => setStep(s => s + 1),
      onError: () => toast({ title: "Error", description: "Reinténtalo.", variant: "destructive" })
    });
  };

  const handleSubmit = () => {
    const code = generateRequestCode(formData.state);
    updateApplication({ 
      id, 
      data: { 
        ...formData, 
        requestCode: code,
        status: "submitted"
      } 
    }, {
      onSuccess: () => {
        setRequestCode(code);
        setStep(5);
        toast({ title: "¡Enviado!", description: "Solicitud recibida correctamente." });
      },
      onError: () => {
        toast({ title: "Error", description: "No se pudo enviar la solicitud. Reinténtalo.", variant: "destructive" });
      }
    });
  };

  const canProceed = () => {
    switch(step) {
      case 1:
        return !!(formData.ownerFullName && 
               formData.ownerEmail && 
               formData.ownerPhone && 
               formData.ownerBirthDate && 
               (formData.idLater || formData.ownerIdNumber) &&
               formData.dataProcessingConsent &&
               formData.ageConfirmation);
      case 2:
        return !!(formData.companyName && formData.businessCategory);
      case 3:
        return !!(formData.ownerAddress && formData.ownerCity && formData.ownerCountry && formData.ownerPostalCode);
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (isLoading || authLoading) return <div className="flex h-screen items-center justify-center bg-brand-cream"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-dark border-t-transparent" /></div>;
  if (!application) return <div className="flex h-screen items-center justify-center bg-brand-cream text-muted-foreground">Solicitud no encontrada</div>;

  const isReadOnly = application.status !== 'draft';

  return (
    <div className="min-h-screen bg-brand-cream font-sans flex flex-col">
      <Navbar />
      
      <HeroSection 
        className="pt-24 sm:pt-32 lg:pt-40"
        title={
          <h1 className="font-black uppercase tracking-tighter text-white mb-6 w-full block [text-wrap:balance] [word-break:keep-all] [overflow-wrap:break-word] font-heading" style={{ fontSize: 'clamp(32px, 6vw, 72px)', lineHeight: '1' }}>
            Vamos a constituir <span className="text-brand-lime">tu LLC</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium max-w-2xl leading-relaxed">
            Completa los datos a continuación para iniciar el proceso de formación de tu empresa en Estados Unidos.
          </p>
        }
      />

      <main className="container max-w-4xl py-12 sm:py-20 px-4 sm:px-6 flex-1 mx-auto -mt-16 relative z-30">
        {step < 5 ? (
          <div className="space-y-6">
            {/* Paso 1: Tus Datos Personales */}
            <div className="bg-white rounded-3xl border border-brand-dark/10 overflow-hidden shadow-2xl">
              <button 
                onClick={() => step > 1 && setStep(1)}
                className={`w-full px-5 py-6 sm:px-8 sm:py-8 text-left flex items-center justify-between transition-all ${step === 1 ? "bg-brand-lime/10" : "bg-white"}`}
              >
                <div className="flex items-center gap-3 sm:gap-5 min-h-[40px] sm:min-h-[56px]">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl shadow-inner transition-colors flex-shrink-0 ${step >= 1 ? "bg-brand-lime text-brand-dark" : "bg-gray-100 text-gray-400"}`}>
                    {step > 1 ? <Check className="w-5 h-5 sm:w-7 sm:h-7" /> : "1"}
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="text-lg sm:text-2xl font-black text-brand-dark uppercase tracking-tight leading-tight truncate sm:whitespace-normal">Tus Datos Personales</h3>
                    {step > 1 && <p className="text-[10px] sm:text-sm text-brand-dark/60 font-bold mt-0.5 leading-none">Completado ✓</p>}
                  </div>
                </div>
                {step > 1 && (
                  <div className="flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors font-black uppercase text-[10px] sm:text-sm flex-shrink-0 ml-2">
                    <span>Editar</span>
                  </div>
                )}
              </button>
              <AnimatePresence>
                {step === 1 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  >
                    <div className="p-4 pt-0 sm:p-8 sm:pt-0 space-y-4 sm:space-y-8">
                      <div className="pt-4 sm:pt-8 space-y-4 sm:space-y-6">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] sm:text-xs font-black text-brand-dark uppercase tracking-widest opacity-70">Nombre completo (como en tu DNI o pasaporte) *</Label>
                          <Input 
                            className="h-10 sm:h-12 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-[11px] sm:text-base font-medium" 
                            placeholder=""
                            value={formData.ownerFullName} 
                            onChange={(e) => setFormData({...formData, ownerFullName: e.target.value})} 
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] sm:text-xs font-black text-brand-dark uppercase tracking-widest opacity-70">Tu mejor email *</Label>
                          <Input 
                            type="email"
                            className="h-10 sm:h-12 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-[11px] sm:text-base font-medium" 
                            placeholder=""
                            value={formData.ownerEmail} 
                            onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} 
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-1.5">
                            <Label className="text-[9px] sm:text-xs font-black text-brand-dark uppercase tracking-widest opacity-70">Tipo de Identificación *</Label>
                            <Select 
                              value={formData.ownerIdType} 
                              onValueChange={(v) => setFormData({...formData, ownerIdType: v})}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="h-10 sm:h-12 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-[11px] sm:text-base">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="DNI">DNI</SelectItem>
                                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[9px] sm:text-xs font-black text-brand-dark uppercase tracking-widest opacity-70">Número de DNI o Pasaporte *</Label>
                            <Input 
                              className={`h-10 sm:h-12 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-[11px] sm:text-base font-medium ${formData.idLater ? "opacity-50" : ""}`} 
                              placeholder={formData.idLater ? "Se enviará más tarde" : ""}
                              value={formData.ownerIdNumber} 
                              onChange={(e) => setFormData({...formData, ownerIdNumber: e.target.value})} 
                              disabled={isReadOnly || formData.idLater}
                            />
                            <div className="flex items-center space-x-2 mt-1.5">
                              <Checkbox 
                                id="idLater" 
                                checked={formData.idLater}
                                onCheckedChange={(v) => {
                                  const checked = !!v;
                                  setFormData({
                                    ...formData, 
                                    idLater: checked,
                                    ownerIdNumber: checked ? "" : formData.ownerIdNumber
                                  });
                                }}
                                disabled={isReadOnly}
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 border-brand-lime data-[state=checked]:bg-brand-lime data-[state=checked]:text-brand-dark"
                              />
                              <Label htmlFor="idLater" className="text-[9px] sm:text-xs font-bold text-brand-dark/60 cursor-pointer uppercase tracking-tight">Prefiero enviar mi identificación más tarde</Label>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] sm:text-xs font-black text-brand-dark uppercase tracking-widest opacity-70">Teléfono de contacto (con prefijo +) *</Label>
                            <div className="flex gap-2">
                              <Select 
                                value={formData.ownerPhone.split(' ')[0].startsWith('+') ? formData.ownerPhone.split(' ')[0] : "+34"}
                                onValueChange={(v) => {
                                  const rest = formData.ownerPhone.split(' ').slice(1).join(' ');
                                  setFormData({...formData, ownerPhone: `${v} ${rest}`});
                                }}
                                disabled={isReadOnly}
                              >
                                <SelectTrigger className="h-10 sm:h-12 w-[80px] sm:w-[120px] rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-[10px] sm:text-base">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="+34">+34</SelectItem>
                                  <SelectItem value="+1">+1</SelectItem>
                                  <SelectItem value="+52">+52</SelectItem>
                                  <SelectItem value="+54">+54</SelectItem>
                                  <SelectItem value="+57">+57</SelectItem>
                                  <SelectItem value="+56">+56</SelectItem>
                                  <SelectItem value="+51">+51</SelectItem>
                                  <SelectItem value="+58">+58</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input 
                                type="tel"
                                className="h-10 sm:h-12 flex-1 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-xs sm:text-base font-medium" 
                                placeholder=""
                                value={formData.ownerPhone.split(' ').slice(1).join(' ')} 
                                onChange={(e) => {
                                  const prefix = formData.ownerPhone.split(' ')[0].startsWith('+') ? formData.ownerPhone.split(' ')[0] : "+34";
                                  setFormData({...formData, ownerPhone: `${prefix} ${e.target.value}`});
                                }} 
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] sm:text-xs font-black text-brand-dark uppercase tracking-widest opacity-70">Fecha de Nacimiento *</Label>
                            <Input 
                              type="date"
                              className="h-10 sm:h-12 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-[10px] sm:text-sm font-medium w-full max-w-[150px]" 
                              value={formData.ownerBirthDate} 
                              onChange={(e) => setFormData({...formData, ownerBirthDate: e.target.value})} 
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="space-y-4 pt-4">
                          <div className="flex items-start space-x-4 bg-brand-lime/5 p-3 rounded-xl border border-brand-lime/10">
                            <Checkbox 
                              id="processing" 
                              checked={formData.dataProcessingConsent}
                              onCheckedChange={(v) => setFormData({...formData, dataProcessingConsent: !!v})}
                              disabled={isReadOnly}
                              className="mt-0.5 h-3.5 w-3.5 border-brand-lime data-[state=checked]:bg-brand-lime data-[state=checked]:text-brand-dark"
                            />
                            <Label htmlFor="processing" className="text-[10px] sm:text-xs leading-snug font-medium text-brand-dark/70 cursor-pointer">
                              He leído y acepto el tratamiento de mis datos personales por parte de EASY US LLC conforme a la <Link href="/privacidad" className="underline font-bold text-brand-dark hover:text-brand-lime">Política de Privacidad</Link> y los <Link href="/legal" className="underline font-bold text-brand-dark hover:text-brand-lime">Términos y Condiciones</Link>.
                            </Label>
                          </div>
                          <div className="flex items-start space-x-4 bg-brand-lime/5 p-3 rounded-xl border border-brand-lime/10">
                            <Checkbox 
                              id="age" 
                              checked={formData.ageConfirmation}
                              onCheckedChange={(v) => setFormData({...formData, ageConfirmation: !!v})}
                              disabled={isReadOnly}
                              className="mt-0.5 h-3.5 w-3.5 border-brand-lime data-[state=checked]:bg-brand-lime data-[state=checked]:text-brand-dark"
                            />
                            <Label htmlFor="age" className="text-[10px] sm:text-xs leading-snug font-medium text-brand-dark/70 cursor-pointer">
                              Confirmo bajo mi responsabilidad que soy mayor de edad (mínimo 18 años) y que toda la información proporcionada en este formulario es veraz, correcta y no falsa.
                            </Label>
                          </div>
                        </div>
                        <div className="pt-4 sm:pt-6">
                          <Button 
                            onClick={handleNext} 
                            disabled={!canProceed() || isSaving}
                            className="w-full h-12 sm:h-14 bg-brand-lime text-brand-dark font-black text-base sm:text-lg rounded-full shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
                          >
                            Continuar →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Paso 2: Tu Nueva LLC */}
            <div className="bg-white rounded-3xl border border-brand-dark/10 overflow-hidden shadow-2xl">
              <button 
                onClick={() => step > 2 && setStep(2)}
                className={`w-full px-5 py-6 sm:px-8 sm:py-8 text-left flex items-center justify-between transition-all ${step === 2 ? "bg-brand-lime/10" : "bg-white"} ${step < 2 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={step < 2}
              >
                <div className="flex items-center gap-3 sm:gap-5 min-h-[40px] sm:min-h-[56px]">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl shadow-inner transition-colors flex-shrink-0 ${step >= 2 ? "bg-brand-lime text-brand-dark" : "bg-gray-100 text-gray-400"}`}>
                    {step > 2 ? <Check className="w-5 h-5 sm:w-7 sm:h-7" /> : "2"}
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="text-lg sm:text-2xl font-black text-brand-dark uppercase tracking-tight leading-tight truncate sm:whitespace-normal">Tu Nueva LLC</h3>
                    {step > 2 && <p className="text-[10px] sm:text-sm text-brand-dark/60 font-bold mt-0.5 leading-none">Completado ✓</p>}
                  </div>
                </div>
                {step > 2 && (
                  <div className="flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors font-black uppercase text-[10px] sm:text-sm flex-shrink-0 ml-2">
                    <span>Editar</span>
                  </div>
                )}
              </button>
              <AnimatePresence>
                {step === 2 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  >
                    <div className="p-8 pt-0 space-y-8">
                      <div className="pt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Nombre LLC (Opción 1) *</Label>
                            <Input 
                              className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg font-medium" 
                              placeholder="Mi Empresa"
                              value={formData.companyName} 
                              onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Nombre LLC (Opción 2)</Label>
                            <Input 
                              className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg font-medium" 
                              placeholder="Mi Empresa LLC"
                              value={formData.companyNameOption2} 
                              onChange={(e) => setFormData({...formData, companyNameOption2: e.target.value})} 
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Estado de Constitución *</Label>
                            <Select 
                              value={formData.state} 
                              onValueChange={(v) => setFormData({...formData, state: v})}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {STATES.map(s => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Terminación Legal *</Label>
                            <Select 
                              value={formData.designator} 
                              onValueChange={(v) => setFormData({...formData, designator: v})}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {DESIGNATORS.map(d => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Categoría de Negocio *</Label>
                          <Select 
                            value={formData.businessCategory} 
                            onValueChange={(v) => setFormData({...formData, businessCategory: v})}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg">
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent className="bg-white max-h-[300px]">
                              {BUSINESS_CATEGORIES.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex flex-col text-left">
                                    <span className="font-bold">{cat.label}</span>
                                    <span className="text-[10px] text-muted-foreground">{cat.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Descripción del Negocio (Opcional)</Label>
                          <Textarea 
                            className="rounded-2xl bg-white border-brand-lime/30 focus:border-brand-lime min-h-[100px] text-lg" 
                            placeholder="Breve descripción de lo que hará tu empresa..."
                            value={formData.companyDescription} 
                            onChange={(e) => setFormData({...formData, companyDescription: e.target.value})} 
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="pt-6">
                          <Button 
                            onClick={handleNext} 
                            disabled={!canProceed() || isSaving}
                            className="w-full h-16 bg-brand-lime text-brand-dark font-black text-xl rounded-full shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
                          >
                            Continuar →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Paso 3: Dirección Residencial */}
            <div className="bg-white rounded-3xl border border-brand-dark/10 overflow-hidden shadow-2xl">
              <button 
                onClick={() => step > 3 && setStep(3)}
                className={`w-full px-5 py-6 sm:px-8 sm:py-8 text-left flex items-center justify-between transition-all ${step === 3 ? "bg-brand-lime/10" : "bg-white"} ${step < 3 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={step < 3}
              >
                <div className="flex items-center gap-3 sm:gap-5 min-h-[40px] sm:min-h-[56px]">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl shadow-inner transition-colors flex-shrink-0 ${step >= 3 ? "bg-brand-lime text-brand-dark" : "bg-gray-100 text-gray-400"}`}>
                    {step > 3 ? <Check className="w-5 h-5 sm:w-7 sm:h-7" /> : "3"}
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="text-lg sm:text-2xl font-black text-brand-dark uppercase tracking-tight leading-tight truncate sm:whitespace-normal">Dirección Residencial</h3>
                    {step > 3 && <p className="text-[10px] sm:text-sm text-brand-dark/60 font-bold mt-0.5 leading-none">Completado ✓</p>}
                  </div>
                </div>
                {step > 3 && (
                  <div className="flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors font-black uppercase text-[10px] sm:text-sm flex-shrink-0 ml-2">
                    <span>Editar</span>
                  </div>
                )}
              </button>
              <AnimatePresence>
                {step === 3 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  >
                    <div className="p-8 pt-0 space-y-8">
                      <div className="pt-8 space-y-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Dirección Residencial Completa *</Label>
                          <Input 
                            className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg font-medium" 
                            placeholder="Calle, Número, Piso/Puerta"
                            value={formData.ownerAddress} 
                            onChange={(e) => setFormData({...formData, ownerAddress: e.target.value})} 
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Ciudad *</Label>
                            <Input 
                              className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg font-medium" 
                              value={formData.ownerCity} 
                              onChange={(e) => setFormData({...formData, ownerCity: e.target.value})} 
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Provincia / Estado *</Label>
                            <Input 
                              className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg font-medium" 
                              value={formData.ownerProvince} 
                              onChange={(e) => setFormData({...formData, ownerProvince: e.target.value})} 
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">País *</Label>
                            <Input 
                              className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg font-medium" 
                              value={formData.ownerCountry} 
                              onChange={(e) => setFormData({...formData, ownerCountry: e.target.value})} 
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-black text-brand-dark uppercase tracking-widest opacity-70">Código Postal *</Label>
                            <Input 
                              className="h-14 rounded-full bg-white border-brand-lime/30 focus:border-brand-lime text-lg font-medium" 
                              value={formData.ownerPostalCode} 
                              onChange={(e) => setFormData({...formData, ownerPostalCode: e.target.value})} 
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="pt-8">
                          <Button 
                            onClick={handleNext} 
                            disabled={!canProceed() || isSaving}
                            className="w-full h-16 bg-brand-lime text-brand-dark font-black text-xl rounded-full shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
                          >
                            Continuar →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Paso 4: Revisión Final */}
            <div className="bg-white rounded-3xl border border-brand-dark/10 overflow-hidden shadow-2xl">
              <button 
                onClick={() => step > 4 && setStep(4)}
                className={`w-full px-5 py-6 sm:px-8 sm:py-8 text-left flex items-center justify-between transition-all ${step === 4 ? "bg-brand-lime/10" : "bg-white"} ${step < 4 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={step < 4}
              >
                <div className="flex items-center gap-3 sm:gap-5 min-h-[40px] sm:min-h-[56px]">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl shadow-inner transition-colors flex-shrink-0 ${step >= 4 ? "bg-brand-lime text-brand-dark" : "bg-gray-100 text-gray-400"}`}>
                    4
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="text-lg sm:text-2xl font-black text-brand-dark uppercase tracking-tight leading-tight truncate sm:whitespace-normal">Revisión Final</h3>
                    {step > 4 && <p className="text-[10px] sm:text-sm text-brand-dark/60 font-bold mt-0.5 leading-none">Completado ✓</p>}
                  </div>
                </div>
                {step > 4 && (
                  <div className="flex items-center gap-2 text-brand-dark/40 hover:text-brand-dark transition-colors font-black uppercase text-[10px] sm:text-sm flex-shrink-0 ml-2">
                    <span>Editar</span>
                  </div>
                )}
              </button>
              <AnimatePresence>
                {step === 4 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  >
                    <div className="p-5 pt-0 sm:p-8 sm:pt-0 space-y-6 sm:space-y-8">
                      <div className="pt-6 sm:pt-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-brand-dark/5 rounded-2xl border border-brand-dark/5">
                            <p className="text-[10px] font-black uppercase text-brand-dark/40 tracking-widest mb-1">Empresa</p>
                            <p className="font-bold text-brand-dark">{formData.companyName} {formData.designator}</p>
                            <p className="text-xs text-brand-dark/60 mt-1">Alt: {formData.companyNameOption2}</p>
                            <p className="text-xs font-black text-brand-lime mt-1 uppercase">{formData.state}</p>
                          </div>
                          <div className="p-4 bg-brand-dark/5 rounded-2xl border border-brand-dark/5">
                            <p className="text-[10px] font-black uppercase text-brand-dark/40 tracking-widest mb-1">Propietario</p>
                            <p className="font-bold text-brand-dark">{formData.ownerFullName}</p>
                            <p className="text-xs text-brand-dark/60 mt-1">{formData.ownerEmail}</p>
                            <p className="text-xs text-brand-dark/60">{formData.ownerPhone}</p>
                          </div>
                          <div className="p-4 bg-brand-dark/5 rounded-2xl border border-brand-dark/5 sm:col-span-2">
                            <p className="text-[10px] font-black uppercase text-brand-dark/40 tracking-widest mb-1">Dirección Residencial y Detalles</p>
                            <p className="text-xs text-brand-dark/80 leading-relaxed">
                              {formData.ownerAddress}, {formData.ownerCity}, {formData.ownerProvince}, {formData.ownerCountry}, CP {formData.ownerPostalCode}
                            </p>
                            <p className="text-xs text-brand-dark/80 mt-2">
                              ID: {formData.ownerIdType} {formData.ownerIdNumber} | F. Nac: {formData.ownerBirthDate}
                            </p>
                            {formData.companyDescription && (
                              <p className="text-xs text-brand-dark/60 mt-2 italic border-t border-brand-dark/10 pt-2">
                                Desc: {formData.companyDescription}
                              </p>
                            )}
                          </div>
                          <div className="p-4 bg-brand-lime/10 rounded-2xl border border-brand-lime/20 sm:col-span-2">
                            <p className="text-[10px] font-black uppercase text-brand-dark/40 tracking-widest mb-1">Número de Pedido</p>
                            <p className="font-black text-xl text-brand-dark">ORD-{id.toString().padStart(6, '0')}</p>
                          </div>
                        </div>

                        <div className="pt-4 sm:pt-8">
                          <p className="text-xs text-center text-muted-foreground mb-6 font-medium">
                            Al hacer clic en enviar, confirmas que todos los datos anteriores son correctos. 
                            Nuestro equipo procesará tu solicitud en las próximas 24-48h.
                          </p>
                          <Button 
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="w-full h-14 sm:h-16 bg-brand-lime text-brand-dark font-black text-lg sm:text-xl rounded-full shadow-xl hover:scale-[1.02] transition-transform active:scale-95 border-0"
                          >
                            {isSaving ? "Enviando..." : "Confirmar y Enviar Solicitud →"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-8 sm:p-16 text-center border border-brand-lime shadow-2xl space-y-8"
          >
            <div className="h-20 w-20 sm:h-24 sm:w-24 bg-brand-lime rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check className="h-10 w-10 sm:h-12 sm:w-12 text-brand-dark" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-3xl sm:text-5xl font-black text-brand-dark uppercase tracking-tighter mb-4">¡Solicitud Recibida!</h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium">
                Tu proceso de formación ha comenzado. Hemos enviado un email de confirmación a <span className="text-brand-dark font-bold">{formData.ownerEmail}</span>.
              </p>
            </div>
            
            <div className="bg-brand-lime/5 rounded-3xl p-6 sm:p-8 border border-brand-lime/20 max-w-md mx-auto">
              <p className="text-xs sm:text-sm font-black text-brand-dark/40 uppercase tracking-widest mb-2">Código de Seguimiento</p>
              <p className="text-2xl sm:text-3xl font-black text-brand-dark tracking-wider">{requestCode}</p>
              <p className="text-xs text-brand-dark/60 mt-4 font-medium">Guarda este código para futuras consultas sobre tu trámite.</p>
            </div>
          </motion.div>
        )}
      </main>

      <HelpSection />
      <Footer />
    </div>
  );
}
