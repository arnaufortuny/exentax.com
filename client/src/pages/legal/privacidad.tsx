import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { Button } from "@/components/ui/button";

export default function Privacidad() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <Navbar />
      <HeroSection title="Política de Privacidad" />
      <div className="container max-w-4xl mx-auto py-12 sm:py-16 px-5 sm:px-8 text-left">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">1. Recopilación de Información</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">Easy US LLC recopila información personal cuando usted se registra en nuestro sitio o solicita formación de una LLC. Esto incluye su nombre, dirección de correo electrónico, número de teléfono y detalles de la empresa.</p>

          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">2. Uso de la Información</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">La información que recopilamos se utiliza para procesar transacciones, enviar correos electrónicos periódicos y mejorar nuestro servicio de atención al cliente. Sus datos no serán vendidos ni transferidos a terceros sin su consentimiento, excepto para el cumplimiento de los servicios solicitados (como gestiones ante el IRS o Secretarios de Estado).</p>

          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">3. Seguridad de Datos</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">Implementamos una variedad de medidas de seguridad para mantener la seguridad de su información personal cuando realiza un pedido o ingresa, envía o accede a su información personal.</p>
        </div>
      </div>
      <section className="py-8 sm:py-14 bg-muted/40">
        <div className="container max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-lg sm:text-2xl font-bold text-primary mb-4 uppercase">¿Necesitas ayuda?</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Si tienes dudas sobre nuestra política de privacidad, 
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
