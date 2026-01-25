import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Download } from "lucide-react";

export default function Privacy() {
  const handleDownload = () => {
    window.open("/assets/politica_privacidad.pdf", "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-left selection:bg-brand-lime selection:text-brand-dark">
      <Navbar />
      
      <HeroSection 
        className="pt-20 sm:pt-24 lg:pt-28 pb-0"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tight text-brand-dark leading-[1.1]">
            Política de <span className="text-brand-lime">Privacidad</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl text-brand-dark font-medium max-w-2xl mb-8">
            Easy US LLC - Última actualización: 25 de enero de 2026
          </p>
        }
      />
      
      <section className="py-8 sm:py-12 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center sm:justify-end mb-8">
              <Button 
                onClick={handleDownload}
                variant="outline" 
                className="rounded-full border-brand-lime text-brand-dark hover:bg-brand-lime transition-all gap-3 h-14 sm:h-12 px-10 sm:px-8 font-black text-sm uppercase tracking-wider w-full sm:w-auto shadow-sm"
              >
                <Download className="w-5 h-5 sm:w-4 sm:h-4" />
                Descargar PDF
              </Button>
            </div>

            <div className="space-y-12 text-brand-dark leading-relaxed">
              
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">1. Responsable del tratamiento</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>El responsable del tratamiento de los datos personales es:</p>
                  <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-8 space-y-2 font-medium">
                    <p className="font-black text-brand-dark uppercase text-xs tracking-widest opacity-50">Entidad Legal</p>
                    <p className="font-bold text-lg text-carbon-black">Fortuny Consulting LLC</p>
                    <p>Nombre comercial: Easy US LLC</p>
                    <p>EIN: 98-1906730</p>
                    <p><strong>Domicilio social:</strong> 1209 Mountain Road Pl NE, STE R, Albuquerque, New Mexico 87110, Estados Unidos</p>
                  </div>
                  <p>Correo electrónico: info@easyusllc.com | Teléfono: +34 614 916 910</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">2. Datos personales objeto de tratamiento</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>Easy US LLC podrá recopilar y tratar los siguientes datos personales:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none font-medium">
                    <li>• Nombre y apellidos</li>
                    <li>• Correo electrónico y teléfono</li>
                    <li>• Dirección de residencia</li>
                    <li>• Fecha de nacimiento</li>
                    <li>• DNI o Pasaporte</li>
                    <li>• Datos fiscales de la empresa</li>
                    <li>• Descripción de actividad económica</li>
                    <li>• Información de contacto y soporte</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">3. Finalidad del tratamiento</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>Los datos personales serán tratados con las siguientes finalidades:</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>Gestionar solicitudes de información y contacto</li>
                    <li>Prestar los servicios administrativos contratados</li>
                    <li>Tramitar constitución, mantenimiento o disolución de LLC</li>
                    <li>Presentar documentación ante organismos públicos</li>
                    <li>Cumplir con obligaciones legales y regulatorias</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">4. Base jurídica del tratamiento</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El tratamiento se realiza sobre la base de la ejecución de un contrato, el consentimiento expreso del usuario, el cumplimiento de obligaciones legales y el interés legítimo del responsable.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">5. Conservación de los datos</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Los datos se conservarán durante el tiempo necesario para cumplir las finalidades y los plazos exigidos por la normativa legal, fiscal y administrativa.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">6. Destinatarios y cesión de datos</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Los datos podrán ser comunicados a organismos públicos, Registered Agents, entidades bancarias y proveedores tecnológicos necesarios para la operativa del servicio.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">7. Transferencias internacionales</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Dada la naturaleza del servicio, los datos podrán ser tratados o almacenados en Estados Unidos, garantizando siempre un nivel adecuado de protección.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">8. Derechos del interesado</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El usuario puede ejercer sus derechos de acceso, rectificación, supresión y portabilidad mediante solicitud a <strong>info@easyusllc.com</strong>.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">9. Seguridad y comunicaciones</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Adoptamos medidas técnicas razonables para proteger la información. Las comunicaciones se realizarán preferentemente por medios electrónicos.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">10. Legislación aplicable</h2>
                </div>
                <div className="bg-brand-dark text-white rounded-2xl p-8 sm:p-12">
                  <p className="text-sm sm:text-base leading-relaxed opacity-90">Esta política se rige por el Reglamento General de Protección de Datos (RGPD) y la normativa estadounidense correspondiente.</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
