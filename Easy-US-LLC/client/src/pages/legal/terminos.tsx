import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";

export default function Terminos() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <Navbar />
      <HeroSection title="Términos y Condiciones" />
      <div className="container max-w-4xl mx-auto py-16 px-5 sm:px-8">
        <h2 className="text-2xl font-bold mb-6">1. Aceptación de los Términos</h2>
        <p className="mb-4 text-muted-foreground leading-relaxed">Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso.</p>
        <h2 className="text-2xl font-bold mb-6">2. Servicios</h2>
        <p className="mb-4 text-muted-foreground leading-relaxed">Easy US LLC proporciona servicios de consultoría para la formación de empresas en los Estados Unidos.</p>
      </div>
      <section className="py-8 sm:py-14 bg-muted/40">
        <div className="container max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-lg sm:text-2xl font-bold text-primary mb-4 uppercase">¿Necesitas ayuda?</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Si tienes dudas sobre nuestros términos y condiciones, 
            puedes contactar con nosotros o consultar nuestro asistente virtual.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button data-testid="button-whatsapp" className="bg-brand-lime text-brand-dark font-black rounded-full w-full border-0 h-12 hover:bg-brand-lime/90 active:bg-brand-lime transition-all">
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
              className="rounded-full w-full sm:w-auto h-12 font-black"
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
