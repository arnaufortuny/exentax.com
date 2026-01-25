import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Terminos() {
  const handleDownload = () => {
    window.open("/assets/terminos_y_condiciones.pdf", "_blank");
  };

  return (
    <div className="min-h-screen font-sans bg-white">
      <Navbar />
      <HeroSection title="Términos y Condiciones" />
      <div className="container max-w-4xl mx-auto py-12 sm:py-16 px-5 sm:px-8 text-left">
        <div className="flex justify-end mb-8">
          <Button 
            onClick={handleDownload}
            variant="outline" 
            className="rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-colors gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">1. Identidad del prestador del servicio</h2>
            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-4">
              <p>Easy US LLC es un nombre comercial utilizado para la prestación de servicios administrativos y de gestión empresarial. La entidad legal titular y responsable de los servicios es:</p>
              <div className="bg-soft-gray/30 p-4 rounded-xl border border-soft-gray/50">
                <p className="font-bold text-carbon-black">Fortuny Consulting LLC</p>
                <p>Número de registro: 0008072199</p>
                <p>EIN: 98-1906730</p>
                <p>Domicilio social: 1209 Mountain Road Pl NE, STE R, Albuquerque, New Mexico 87110, Estados Unidos</p>
              </div>
              <p>Correo electrónico: info@easyusllc.com | Teléfono: +34 614 916 910</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">2. Ámbito de actividad</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Fortuny Consulting LLC presta servicios administrativos especializados en la constitución y mantenimiento de sociedades LLC en Estados Unidos. <strong>Easy US LLC no es un despacho de abogados</strong>, ni una firma de asesoría legal, fiscal o financiera regulada. Toda la información facilitada tiene carácter administrativo e informativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">3. Servicios ofrecidos</h2>
            <ul className="list-disc pl-6 text-sm sm:text-base text-muted-foreground space-y-2">
              <li>Constitución de LLC (NM, WY, DE)</li>
              <li>Gestión de Articles of Organization y Operating Agreement</li>
              <li>Obtención de EIN ante el IRS</li>
              <li>Presentación de BOI Report ante FinCEN</li>
              <li>Servicio de Registered Agent (primeros 12 meses)</li>
              <li>Asistencia en apertura de cuentas bancarias y plataformas financieras</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">4. Packs de constitución y precios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-4 border border-soft-gray rounded-xl text-center">
                <p className="font-bold text-primary">Pack New Mexico</p>
                <p className="text-xl font-black text-carbon-black">639 €</p>
              </div>
              <div className="p-4 border border-soft-gray rounded-xl text-center">
                <p className="font-bold text-primary">Pack Wyoming</p>
                <p className="text-xl font-black text-carbon-black">799 €</p>
              </div>
              <div className="p-4 border border-soft-gray rounded-xl text-center">
                <p className="font-bold text-primary">Pack Delaware</p>
                <p className="text-xl font-black text-carbon-black">999 €</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">Los precios incluyen las tasas estatales de constitución correspondientes.</p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">5. Plazos y Ejecución</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              El plazo estimado de constitución es de 2 a 3 días hábiles tras recibir la documentación, aunque en casos excepcionales puede extenderse hasta 15 días hábiles.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              El cliente reconoce que los servicios tienen carácter personalizado y de <strong>ejecución inmediata</strong> una vez confirmado el pago, por lo que el servicio se considera iniciado desde dicho momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">6. Política de no reembolso y disputas</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              Dada la naturaleza administrativa y la ejecución inmediata de los trámites, <strong>no se admiten reembolsos totales ni parciales</strong> una vez iniciado el proceso.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              El cliente se compromete a no iniciar contracargos (chargebacks) o disputas de pago. Cualquier disputa será considerada un incumplimiento grave de estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary">7. Limitación de responsabilidad</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Easy US LLC no garantiza la aprobación de cuentas bancarias (cuya decisión depende exclusivamente de las entidades financieras) ni es responsable de consecuencias fiscales o legales derivadas del uso de la LLC. La responsabilidad máxima queda limitada al importe abonado por el servicio.
            </p>
          </section>
        </div>
      </div>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
