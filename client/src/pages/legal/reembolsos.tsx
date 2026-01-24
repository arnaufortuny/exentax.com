import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { Button } from "@/components/ui/button";

export default function Reembolsos() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <Navbar />
      <HeroSection title="Política de Reembolsos" />
      <div className="container max-w-4xl mx-auto py-12 sm:py-16 px-5 sm:px-8 text-left">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">1. Condiciones Generales</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">Dada la naturaleza de los servicios de formación de LLC y las tasas gubernamentales involucradas, nuestra política de reembolsos es estricta para garantizar la viabilidad del servicio.</p>

          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">2. Tasas Estatales y Federales</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">Una vez que Easy US LLC ha iniciado el proceso de presentación ante el Secretario de Estado o el IRS, las tasas correspondientes no son reembolsables bajo ninguna circunstancia, ya que estos organismos no devuelven dichos importes.</p>

          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">3. Cancelación antes del Inicio</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">Si decide cancelar su pedido antes de que hayamos procesado cualquier documento, podrá recibir un reembolso parcial descontando una comisión de gestión administrativa del 15% del total pagado.</p>
          
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">4. Servicios de Mantenimiento</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">Los pagos anuales por servicios de mantenimiento (Annual Report, Registered Agent, etc.) no son reembolsables una vez que el servicio ha sido renovado para el periodo correspondiente.</p>
        </div>
      </div>
      <section className="py-8 sm:py-14 bg-muted/40">
        <div className="container max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-lg sm:text-2xl font-bold text-primary mb-4 uppercase">¿Necesitas ayuda?</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Si tienes dudas sobre nuestra política de reembolsos, 
            puedes contactar con nosotros o consultar nuestro asistente virtual.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button data-testid="button-whatsapp" className="bg-[#6EDC8A] text-[#0E1215] font-black rounded-full w-full border-0 h-12 hover:bg-[#6EDC8A]/90 active:scale-95 transition-all">
                Envíanos un WhatsApp
              </Button>
            </a>
            <Button 
              data-testid="button-chatbot" 
              variant="outline" 
              onClick={() => {
                const event = new CustomEvent('open-chatbot');
                window.dispatchEvent(event);
              }}
              className="rounded-full w-full sm:w-auto h-12 font-black border-2 active:scale-95 transition-all"
            >
              Nuestro Asistente 24/7
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
