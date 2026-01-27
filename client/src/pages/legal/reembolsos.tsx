import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Download } from "lucide-react";

export default function Reembolsos() {
  const handleDownload = () => {
    window.open("/politica_reembolsos.pdf", "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-left selection:bg-brand-lime selection:text-brand-dark">
      <Navbar />
      
      <HeroSection 
        className="pt-20 sm:pt-24 lg:pt-28 pb-0"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-brand-dark leading-[1.1] text-center sm:text-left">
            Política de <span className="text-brand-lime">Reembolsos</span>
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
                  <span className="text-brand-lime mr-4">01</span> Naturaleza del servicio
                </h2>
                <div className="space-y-4 text-base sm:text-lg">
                  <p>Dado que los servicios prestados por Easy US LLC tienen carácter administrativo, personalizado y de <strong>ejecución inmediata</strong>, no se admiten reembolsos, totales ni parciales, una vez iniciado el proceso, presentada la documentación ante organismos públicos o realizados trámites en nombre del cliente.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">02</span> Gastos no recuperables
                </h2>
                <div className="space-y-4 text-base sm:text-lg">
                  <p>El cliente entiende que los costes asociados a tasas estatales, registros oficiales, presentación de formularios y gestión administrativa no son recuperables una vez que se han abonado a las autoridades correspondientes.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">03</span> Excepciones
                </h2>
                <div className="space-y-4 text-base sm:text-lg font-medium">
                  <p>Easy US LLC solo considerará solicitudes de reembolso en casos donde el servicio no haya sido iniciado de ninguna forma. Una vez que nuestro equipo administrativo comienza la revisión de sus datos, el servicio se considera en ejecución.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">04</span> Compromiso de calidad
                </h2>
                <div className="bg-brand-dark text-white rounded-2xl p-10 sm:p-12 shadow-xl">
                  <p className="text-lg sm:text-xl leading-relaxed opacity-90 font-medium">Nos comprometemos a realizar todos los trámites con la máxima diligencia y profesionalidad para asegurar que su LLC sea constituida correctamente siguiendo los estándares legales de cada estado.</p>
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
