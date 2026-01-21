import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CTASection } from "@/components/layout/cta-section";
import { Button } from "@/components/ui/button";

import { HeroSection } from "@/components/layout/hero-section";

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-white font-sans text-left">
      <Navbar />
      
      <HeroSection 
        className="pt-24 sm:pt-32 lg:pt-40"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.1]">
            Política de <span className="text-brand-lime">Privacidad</span>
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
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">1. Responsable del Tratamiento</h2>
                </div>
                <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-8 sm:p-12 space-y-4 text-sm sm:text-base font-medium">
                  <p>El responsable del tratamiento de sus datos personales es <strong>Fortuny Consulting LLC</strong> (bajo la marca comercial Easy US LLC), con domicilio en 1209 Mountain Road Place Northeast, STE R, Albuquerque, NM 87110, USA.</p>
                  <p className="text-brand-dark/60">Contacto DPO: info@easyusallc.com</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">2. Categoría de Datos</h2>
                </div>
                <div className="bg-white border-2 border-brand-lime/10 rounded-2xl p-8 sm:p-12 space-y-6">
                  <p>Para la constitución de su LLC y el cumplimiento de la normativa KYC (Know Your Customer) de EE.UU., procesamos:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-brand-lime/5 p-4 rounded-xl border border-brand-lime/10">
                      <span className="text-brand-lime font-black">✓</span>
                      <span className="text-sm font-bold uppercase tracking-tight">Identidad Oficial</span>
                    </div>
                    <div className="flex items-center gap-3 bg-brand-lime/5 p-4 rounded-xl border border-brand-lime/10">
                      <span className="text-brand-lime font-black">✓</span>
                      <span className="text-sm font-bold uppercase tracking-tight">Datos de Contacto</span>
                    </div>
                    <div className="flex items-center gap-3 bg-brand-lime/5 p-4 rounded-xl border border-brand-lime/10">
                      <span className="text-brand-lime font-black">✓</span>
                      <span className="text-sm font-bold uppercase tracking-tight">Información de Negocio</span>
                    </div>
                    <div className="flex items-center gap-3 bg-brand-lime/5 p-4 rounded-xl border border-brand-lime/10">
                      <span className="text-brand-lime font-black">✓</span>
                      <span className="text-sm font-bold uppercase tracking-tight">Datos Transaccionales</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">3. Finalidad Legal</h2>
                </div>
                <div className="space-y-6 text-sm sm:text-base">
                  <div className="bg-brand-dark text-white rounded-2xl p-8 sm:p-10 space-y-4">
                    <p>Sus datos se utilizan exclusivamente para la gestión ante la Secretaría de Estado correspondiente y el IRS. Fortuny Consulting LLC no vende ni cede sus datos a terceros con fines publicitarios.</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">4. Sus Derechos</h2>
                </div>
                <div className="bg-brand-lime/5 border-l-4 border-brand-lime p-8 sm:p-12 space-y-4">
                  <p>Puede ejercer sus derechos de acceso, rectificación, supresión y limitación enviando un correo a <strong>info@easyusallc.com</strong> junto a una copia de su documento de identidad.</p>
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
