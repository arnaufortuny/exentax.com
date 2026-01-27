import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Download } from "lucide-react";

export default function Cookies() {
  const handleDownload = () => {
    window.open("/politica_cookies.pdf", "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-left selection:bg-brand-lime selection:text-brand-dark">
      <Navbar />
      
      <HeroSection 
        className="pt-20 sm:pt-24 lg:pt-28 pb-0"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-brand-dark leading-[1.1] text-center sm:text-left">
            Aviso de <span className="text-brand-lime">Cookies</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl text-brand-dark font-medium max-w-2xl mb-8 text-center sm:text-left mx-auto sm:mx-0">
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
                className="rounded-full border-brand-lime text-brand-dark hover:bg-brand-lime transition-all gap-3 h-14 sm:h-12 px-10 sm:px-8 font-black text-sm tracking-wider w-full sm:w-auto shadow-sm no-default-hover-elevate"
              >
                <Download className="w-5 h-5 sm:w-4 sm:h-4" />
                Descargar PDF
              </Button>
            </div>

            <div className="space-y-16 text-brand-dark leading-relaxed">
              
              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">01</span> ¿Qué son las cookies?
                </h2>
                <div className="text-base sm:text-lg space-y-4">
                  <p>Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando visita un sitio web. Permiten, entre otras cosas, reconocer el dispositivo, recordar preferencias y mejorar la experiencia de navegación.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">02</span> Uso de cookies
                </h2>
                <div className="text-base sm:text-lg space-y-4">
                  <p>El sitio web de Easy US LLC utiliza cookies propias y de terceros con el fin de garantizar el correcto funcionamiento del sitio, mejorar la experiencia del usuario y analizar el uso que se hace del mismo.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">03</span> Tipos de cookies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl shadow-sm">
                    <h3 className="font-black text-brand-dark text-xs tracking-widest mb-4 opacity-70 uppercase">Necesarias</h3>
                    <p className="text-base font-medium"><strong>Cookies técnicas:</strong> Permiten la navegación y el uso de funciones básicas. Son imprescindibles.</p>
                  </div>
                  <div className="p-8 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl shadow-sm">
                    <h3 className="font-black text-brand-dark text-xs tracking-widest mb-4 opacity-70 uppercase">Rendimiento</h3>
                    <p className="text-base font-medium"><strong>Cookies de análisis:</strong> Analizan el comportamiento de los usuarios de forma anónima para mejorar el sitio.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">04</span> Actualización
                </h2>
                <div className="bg-brand-dark text-white rounded-2xl p-10 sm:p-12 shadow-xl">
                  <p className="text-lg sm:text-xl leading-relaxed opacity-90 font-medium">Easy US LLC se reserva el derecho de modificar el presente Aviso de Cookies para adaptarlo a cambios legales o técnicos. La versión vigente será siempre la publicada aquí.</p>
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
