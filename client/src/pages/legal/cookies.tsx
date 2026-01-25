import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";

export default function Cookies() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <Navbar />
      <HeroSection 
        title="Política de Cookies" 
        subtitle={
          <p className="text-lg sm:text-xl text-brand-dark font-medium max-w-2xl mb-8">
            Easy US LLC - Última actualización: 25 de enero de 2026
          </p>
        }
      />
      <div className="container max-w-4xl mx-auto py-12 sm:py-16 px-5 sm:px-8 text-left">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">1. ¿Qué son las Cookies?</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">Las cookies son pequeños archivos de texto que se almacenan en su navegador cuando visita nuestro sitio web. Ayudan a que el sitio funcione correctamente y a mejorar su experiencia de navegación.</p>

          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">2. Tipos de Cookies que Utilizamos</h2>
          <ul className="list-disc pl-6 mb-8 text-sm sm:text-base text-muted-foreground space-y-4">
            <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio, como la autenticación de usuarios y la seguridad.</li>
            <li><strong>Cookies de Análisis:</strong> Nos ayudan a entender cómo los visitantes interactúan con el sitio mediante la recopilación de información anónima.</li>
            <li><strong>Cookies de Preferencia:</strong> Permiten que el sitio recuerde información que cambia la forma en que el sitio se comporta o se ve.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">3. Gestión de Cookies</h2>
          <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">Usted puede controlar y/o eliminar las cookies según desee a través de la configuración de su navegador. Tenga en cuenta que si deshabilita las cookies, algunas funciones de este sitio pueden no estar disponibles.</p>
        </div>
      </div>
      <NewsletterSection />
      <Footer />
    </div>
  );
}
