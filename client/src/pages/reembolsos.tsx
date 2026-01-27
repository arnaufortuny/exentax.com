import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { Download } from "lucide-react";

export default function Refunds() {
  const handleDownload = () => {
    window.open("/politica_reembolsos.pdf", "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-left selection:bg-brand-lime selection:text-brand-dark">
      <Navbar />
      
      <HeroSection 
        className="pt-20 sm:pt-24 lg:pt-28 pb-0"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black  tracking-tight text-brand-dark leading-[1.1] text-center sm:text-left">
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
                className="rounded-full border-brand-lime text-brand-dark hover:bg-brand-lime transition-all gap-3 h-14 sm:h-12 px-10 sm:px-8 font-black text-sm  tracking-wider w-full sm:w-auto shadow-sm"
              >
                <Download className="w-5 h-5 sm:w-4 sm:h-4" />
                Descargar PDF
              </Button>
            </div>

            <div className="space-y-12 text-brand-dark leading-relaxed">
              
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark  tracking-tighter">1. Naturaleza de los servicios</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>Easy US LLC presta servicios administrativos personalizados, que implican la revisión de información, preparación de documentación, gestión de trámites y actuaciones ante organismos públicos o terceros.</p>
                  <p>Estos servicios se consideran de <strong>ejecución inmediata</strong>, ya que comienzan a prestarse desde el momento en que el pago es confirmado.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark  tracking-tighter">2. Política general de no reembolso</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>Debido a la naturaleza de los servicios ofrecidos, no se admiten reembolsos, totales ni parciales, una vez iniciado el servicio. Se considera iniciado cuando:</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>Se recibe y confirma el pago</li>
                    <li>Se revisa la información proporcionada por el cliente</li>
                    <li>Se preparan documentos o se realizan gestiones internas/externas</li>
                  </ul>
                  <p>El cliente acepta expresamente esta condición al contratar cualquiera de nuestros servicios.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark  tracking-tighter">3. Casos en los que no procede el reembolso</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>No procederá el reembolso en los siguientes supuestos:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none font-medium">
                    <li>• Cambio de opinión tras el pago</li>
                    <li>• Falta de información/documentación</li>
                    <li>• Causas imputables al cliente</li>
                    <li>• Retrasos de terceros u organismos públicos</li>
                    <li>• Rechazo de bancos o fintech</li>
                    <li>• No obtención del resultado esperado</li>
                  </ul>
                  <p className="text-sm opacity-70">Easy US LLC no garantiza resultados, sino la correcta ejecución del servicio administrativo contratado.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark  tracking-tighter">4. Rechazo o suspensión de solicitudes</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>En caso de rechazo o suspensión por motivos de cumplimiento, incoherencias o falta de colaboración, no se generará derecho a reembolso si ya se han iniciado tareas o asumido costes administrativos.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark  tracking-tighter">5. Tasas y costes no recuperables</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Las tasas estatales, costes de registro y cualquier otro gasto administrativo ya asumido no son recuperables bajo ninguna circunstancia, incluso si el proceso no llega a completarse.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark  tracking-tighter">6. Chargebacks y disputas de pago</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>La iniciación de chargebacks o disputas contraviene esta política. Nos reservamos el derecho de suspender servicios, aportar pruebas de defensa y reclamar los costes derivados de dicha disputa.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark  tracking-tighter">7. Excepciones legales</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Esta política se aplica sin perjuicio de aquellos derechos que resulten irrenunciables conforme a la legislación aplicable.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark  tracking-tighter">8. Aceptación de la política</h2>
                </div>
                <div className="bg-brand-dark text-primary rounded-2xl p-8 sm:p-12">
                  <p className="text-sm sm:text-base leading-relaxed opacity-90 font-black">La contratación de cualquiera de los servicios ofrecidos por Easy US LLC implica que el cliente ha leído, comprendido y aceptado expresamente la presente Política de Reembolsos.</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
