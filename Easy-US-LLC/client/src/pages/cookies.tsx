import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CTASection } from "@/components/layout/cta-section";
import { Button } from "@/components/ui/button";

import { HeroSection } from "@/components/layout/hero-section";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      
      <HeroSection 
        className="pt-24 sm:pt-32 lg:pt-40"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-8xl leading-[1.1] sm:leading-tight font-black uppercase tracking-tight text-white">
            Aviso de <span className="text-brand-lime">Cookies</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl text-white/90 font-medium max-w-2xl">
            Easy US LLC - Última actualización: 16 de enero de 2026
          </p>
        }
      />

      <section className="py-12 sm:py-20">
        <div className="container max-w-full mx-auto px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-12 text-brand-dark leading-relaxed">
              
              <section>
                <h2 className="text-sm sm:text-base font-black text-brand-dark mb-4 flex items-center gap-3 uppercase tracking-tight">
                  <span className="w-2 h-6 bg-brand-lime" />
                  1. ¿Qué son?
                </h2>
                <div className="space-y-4 text-sm font-medium">
                  <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o móvil) cuando visitas un sitio web. Permiten que el sitio recuerde tus acciones y preferencias durante un período de tiempo.</p>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-black text-brand-dark mb-4 flex items-center gap-3 uppercase tracking-tight">
                  <span className="w-2 h-6 bg-brand-lime" />
                  2. Cookies que Utilizamos
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-brand-lime/5 border-l-4 border-brand-lime p-8 space-y-3">
                    <h3 className="font-black text-brand-dark uppercase text-xs tracking-widest">Esenciales</h3>
                    <p className="text-[11px] text-brand-dark/60 font-medium">Necesarias para el funcionamiento básico y seguridad.</p>
                    <ul className="space-y-1 text-[12px]">
                      <li className="flex items-center gap-2"><span className="text-brand-lime font-black">•</span> Sesión de usuario</li>
                      <li className="flex items-center gap-2"><span className="text-brand-lime font-black">•</span> Seguridad SSL</li>
                      <li className="flex items-center gap-2"><span className="text-brand-lime font-black">•</span> Pagos seguros</li>
                    </ul>
                  </div>

                  <div className="bg-brand-lime/5 border-l-4 border-brand-lime p-8 space-y-3">
                    <h3 className="font-black text-brand-dark uppercase text-xs tracking-widest">Analíticas</h3>
                    <p className="text-[11px] text-brand-dark/60 font-medium">Nos ayudan a mejorar tu experiencia en el sitio.</p>
                    <ul className="space-y-1 text-[12px]">
                      <li className="flex items-center gap-2"><span className="text-brand-lime font-black">•</span> Páginas visitadas</li>
                      <li className="flex items-center gap-2"><span className="text-brand-lime font-black">•</span> Rendimiento</li>
                      <li className="flex items-center gap-2"><span className="text-brand-lime font-black">•</span> Origen del tráfico</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-brand-green mb-2">3. Cookies de Terceros</h2>
                <div className="space-y-2">
                  <p>Utilizamos servicios de terceros que pueden establecer sus propias cookies:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-[11px]">
                    <li><strong>Procesadores de pago:</strong> Stripe y otros procesadores para transacciones seguras</li>
                    <li><strong>Análisis:</strong> Para comprender el uso del sitio web</li>
                    <li><strong>Seguridad:</strong> Para protección contra fraude y ataques</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-brand-green mb-2">4. Duración de las Cookies</h2>
                <div className="space-y-2">
                  <ul className="list-disc list-inside space-y-1 ml-2 text-[11px]">
                    <li><strong>Cookies de sesión:</strong> Se eliminan al cerrar el navegador</li>
                    <li><strong>Cookies persistentes:</strong> Permanecen hasta su fecha de expiración o hasta que las elimines manualmente</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-brand-green mb-2">5. Cómo Gestionar las Cookies</h2>
                <div className="space-y-2">
                  <p>Puedes controlar y/o eliminar las cookies según desees. Puedes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-[11px]">
                    <li>Eliminar todas las cookies de tu navegador</li>
                    <li>Configurar tu navegador para bloquear cookies</li>
                    <li>Aceptar cookies de sitios específicos</li>
                    <li>Navegar en modo privado/incógnito</li>
                  </ul>
                  <p className="mt-2 text-[10px] text-muted-foreground">Ten en cuenta que desactivar las cookies puede afectar la funcionalidad del sitio web.</p>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-brand-green mb-2">6. Configuración por Navegador</h2>
                <div className="space-y-2">
                  <p>Cada navegador ofrece opciones para gestionar cookies:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-[11px]">
                    <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                    <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
                    <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
                    <li><strong>Edge:</strong> Configuración → Privacidad y servicios → Cookies</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-brand-green mb-2">7. Consentimiento</h2>
                <div className="space-y-2">
                  <p>Al continuar navegando en nuestro sitio web, aceptas el uso de cookies conforme a esta política.</p>
                  <p>Las cookies esenciales son necesarias para el funcionamiento del sitio y no requieren consentimiento adicional.</p>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-brand-green mb-2">8. Actualizaciones</h2>
                <div className="space-y-2">
                  <p>Podemos actualizar esta política de cookies en cualquier momento. Te recomendamos revisarla periódicamente.</p>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-brand-green mb-2">9. Contacto</h2>
                <div className="bg-muted/30 p-6">
                  <div className="space-y-1 text-sm">
                    <p><strong>Email:</strong> info@easyusallc.com</p>
                    <p><strong>Web:</strong> www.easyusallc.com</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24 border-t border-brand-lime/10">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark text-center uppercase tracking-tight mb-4">
              ¿NECESITAS AYUDA?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl text-center">
              Estamos aquí para resolver todas tus dudas. Contáctanos sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
              <a href="https://wa.me/34614916910" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="bg-brand-lime text-brand-dark font-black text-base px-8 border-0 w-full rounded-full h-14 shadow-lg hover:bg-brand-lime/90 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Envíanos un WhatsApp
                </Button>
              </a>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => {
                  const event = new CustomEvent('open-chatbot');
                  window.dispatchEvent(event);
                }}
                className="border-brand-dark text-brand-dark font-black text-base px-8 w-full sm:w-auto rounded-full h-14 hover:bg-brand-dark hover:text-white transition-colors"
              >
                Nuestro Asistente 24/7
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
