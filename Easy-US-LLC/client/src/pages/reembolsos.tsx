import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CTASection } from "@/components/layout/cta-section";
import { Button } from "@/components/ui/button";

import { HeroSection } from "@/components/layout/hero-section";

export default function Reembolsos() {
  return (
    <div className="min-h-screen bg-white font-sans text-left">
      <Navbar />
      
      <HeroSection 
        className="pt-24 sm:pt-32 lg:pt-40"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.1]">
            Política de <span className="text-brand-lime">Reembolsos</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl text-white/90 font-medium max-w-2xl">
            Fortuny Consulting LLC - 20 de enero de 2026
          </p>
        }
      />

      <section className="py-12 sm:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-16 text-brand-dark leading-relaxed">
              
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">1. Marco General del Servicio</h2>
                </div>
                <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-8 sm:p-12 space-y-6 text-sm sm:text-base font-medium relative overflow-hidden">
                  <p>Easy US LLC (Fortuny Consulting LLC) presta servicios de gestión administrativa personalizada y tramitación ante organismos gubernamentales de EE.UU. Debido a que las tasas estatales y el tiempo de procesamiento se devengan de forma inmediata, establecemos una política de <strong>NO REEMBOLSO</strong> absoluta una vez iniciado el trámite.</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40 border-t border-brand-lime/20 pt-6">El cliente acepta que el derecho de desistimiento no es aplicable a estos servicios por su naturaleza de ejecución inmediata y personalización extrema.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">2. Hitos de Inicio del Servicio</h2>
                </div>
                <div className="bg-white border-2 border-brand-lime/10 rounded-2xl p-8 sm:p-12 space-y-6">
                  <p className="font-bold">Se considera que el servicio ha sido ejecutado y por tanto no es reembolsable cuando ocurra cualquiera de los siguientes hitos:</p>
                  <ul className="space-y-4 text-sm sm:text-base text-brand-dark/80">
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 bg-brand-lime text-brand-dark rounded-full flex items-center justify-center shrink-0 font-black text-xs">1</span>
                      <span>Análisis y verificación técnica de la documentación de identidad del cliente por nuestro equipo.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 bg-brand-lime text-brand-dark rounded-full flex items-center justify-center shrink-0 font-black text-xs">2</span>
                      <span>Reserva o verificación de disponibilidad del nombre comercial ante el Secretary of State.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 bg-brand-lime text-brand-dark rounded-full flex items-center justify-center shrink-0 font-black text-xs">3</span>
                      <span>Redacción o preparación de Articles of Organization, Operating Agreement o formularios IRS.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 bg-brand-lime text-brand-dark rounded-full flex items-center justify-center shrink-0 font-black text-xs">4</span>
                      <span>Transcurso de 24 horas naturales desde la confirmación del pago en nuestra plataforma.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">3. Exclusiones Específicas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-brand-dark/5 p-8 rounded-2xl border border-brand-dark/10">
                    <h3 className="font-black text-sm uppercase mb-4 text-brand-dark">Bancos y Procesadores</h3>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed">Easy US LLC no controla las políticas de aprobación de Mercury, Relay, Stripe, PayPal o Amazon. Un rechazo por parte de estas entidades no da derecho a reembolso del servicio de formación de la LLC.</p>
                  </div>
                  <div className="bg-brand-dark/5 p-8 rounded-2xl border border-brand-dark/10">
                    <h3 className="font-black text-sm uppercase mb-4 text-brand-dark">Tiempos del Gobierno</h3>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed">Retrasos en el IRS para la emisión del EIN o demoras en la Secretaría de Estado son ajenos a nuestro control y no constituyen motivo de reembolso bajo ninguna circunstancia.</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">4. Procedimiento de Reclamación</h2>
                </div>
                <div className="bg-brand-lime/5 border-l-4 border-brand-lime p-8 sm:p-12">
                  <p className="text-sm sm:text-base mb-6">En el caso excepcional de que proceda un reembolso parcial por error técnico interno de Easy US LLC:</p>
                  <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm font-medium">
                    <li>Se deducirán todas las comisiones de pasarela de pago (Stripe/PayPal/Banco).</li>
                    <li>Se deducirán las tasas estatales ya abonadas.</li>
                    <li>El plazo de resolución es de 15 a 30 días hábiles.</li>
                  </ul>
                  <p className="mt-8 font-black text-brand-dark">Contacto: info@easyusallc.com</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24 border-t border-brand-lime/10">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight mb-4">
              ¿NECESITAS AYUDA?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl text-center">
              Estamos aquí para resolver todas tus dudas. Contáctanos sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
              <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="bg-brand-lime text-brand-dark font-black text-base px-8 border-0 w-full rounded-full h-14 shadow-lg hover:bg-brand-lime/90 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Envíanos un WhatsApp
                </Button>
              </a>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => {
                  const event = new CustomEvent('open-chatbot');
                  window.dispatchEvent(event);
                }}
                className="border-brand-dark text-brand-dark font-black text-base px-8 w-full sm:w-auto rounded-full h-14 hover:bg-brand-dark hover:text-white transition-colors"
              >
                Nuestro Asistente 24/7
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
