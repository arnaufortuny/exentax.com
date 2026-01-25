import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Download } from "lucide-react";

export default function Cookies() {
  const handleDownload = () => {
    // In a real scenario, this would point to the actual PDF asset
    window.open("/assets/politica_cookies.pdf", "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-left selection:bg-brand-lime selection:text-brand-dark">
      <Navbar />
      
      <HeroSection 
        className="pt-20 sm:pt-24 lg:pt-28 pb-0"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tight text-brand-dark leading-[1.1]">
            Aviso de <span className="text-brand-lime">Cookies</span>
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
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">1. ¿Qué son las cookies?</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando visita un sitio web. Permiten, entre otras cosas, reconocer el dispositivo, recordar preferencias y mejorar la experiencia de navegación.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">2. Uso de cookies en este sitio web</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El sitio web de Easy US LLC utiliza cookies propias y de terceros con el fin de garantizar el correcto funcionamiento del sitio, mejorar la experiencia del usuario y analizar el uso que se hace del mismo.</p>
                  <p>Al acceder y navegar por este sitio web, el usuario acepta el uso de cookies conforme a lo establecido en el presente Aviso de Cookies, salvo que configure su navegador o panel de preferencias para rechazarlas.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">3. Tipos de cookies utilizadas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl">
                    <h3 className="font-black text-brand-dark uppercase text-xs tracking-widest mb-3 opacity-70">Necesarias</h3>
                    <p className="text-sm font-medium"><strong>Cookies técnicas:</strong> Permiten la navegación y el uso de funciones básicas. Son imprescindibles y no requieren consentimiento previo.</p>
                  </div>
                  <div className="p-6 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl">
                    <h3 className="font-black text-brand-dark uppercase text-xs tracking-widest mb-3 opacity-70">Experiencia</h3>
                    <p className="text-sm font-medium"><strong>Cookies de personalización:</strong> Permiten recordar preferencias como idioma o configuración regional.</p>
                  </div>
                  <div className="p-6 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl">
                    <h3 className="font-black text-brand-dark uppercase text-xs tracking-widest mb-3 opacity-70">Rendimiento</h3>
                    <p className="text-sm font-medium"><strong>Cookies de análisis o medición:</strong> Analizan el comportamiento de los usuarios de forma agregada y anónima para mejorar contenidos.</p>
                  </div>
                  <div className="p-6 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl">
                    <h3 className="font-black text-brand-dark uppercase text-xs tracking-widest mb-3 opacity-70">Externas</h3>
                    <p className="text-sm font-medium"><strong>Cookies de terceros:</strong> Proveedores externos (análisis o herramientas técnicas) que actúan bajo sus propias políticas.</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">4. Cookies utilizadas</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Easy US LLC podrá utilizar cookies relacionadas con el funcionamiento, seguridad, gestión de formularios y análisis estadístico. La información obtenida no se utiliza para identificar personalmente al usuario salvo autorización expresa.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">5. Base legal</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El uso de cookies técnicas se basa en el interés legítimo para el funcionamiento del sitio. Las cookies no necesarias se basan en el consentimiento del usuario.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">6. Gestión y configuración</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El usuario puede permitir, bloquear o eliminar las cookies mediante la configuración de su navegador. La desactivación puede afectar a algunas funcionalidades del sitio web.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">7. Transferencias internacionales</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Algunas cookies de terceros pueden implicar transferencias a Estados Unidos, adoptando siempre las medidas necesarias para garantizar la protección de datos.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">8. Actualización</h2>
                </div>
                <div className="bg-brand-dark text-white rounded-2xl p-8 sm:p-12">
                  <p className="text-sm sm:text-base leading-relaxed opacity-90 font-bold">Easy US LLC se reserva el derecho de modificar el presente Aviso de Cookies para adaptarlo a cambios legales o técnicos. La versión vigente será siempre la publicada en el sitio web.</p>
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
