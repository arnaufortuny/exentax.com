import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { Download } from "lucide-react";

export default function Legal() {
  const handleDownload = () => {
    window.open("/assets/terminos_y_condiciones.pdf", "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-left">
      <Navbar />
      
      <HeroSection 
        className="pt-24 sm:pt-32 lg:pt-40"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tight text-brand-dark leading-[1.1]">
            Términos y <span className="text-brand-lime">Condiciones</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl text-brand-dark font-medium max-w-2xl mb-12 sm:mb-20">
            Fortuny Consulting LLC - Última actualización: 25 de enero de 2026
          </p>
        }
      />
      
      <section className="py-12 sm:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-end mb-12">
              <Button 
                onClick={handleDownload}
                variant="outline" 
                className="rounded-full border-brand-lime text-brand-dark hover:bg-brand-lime transition-all gap-2 h-12 px-6 font-bold"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
            </div>

            <div className="space-y-16 text-brand-dark leading-relaxed">
              
              <section className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">1. Identidad del prestador del servicio</h2>
                </div>
                <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-8 sm:p-12 space-y-4 text-sm sm:text-base font-medium relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/10 rounded-bl-full -mr-16 -mt-16" />
                  <p><strong className="font-black uppercase text-[10px] tracking-widest opacity-50 block mb-1">Entidad Legal</strong> Fortuny Consulting LLC</p>
                  <p><strong className="font-black uppercase text-[10px] tracking-widest opacity-50 block mb-1">Nombre Comercial</strong> Easy US LLC</p>
                  <p><strong className="font-black uppercase text-[10px] tracking-widest opacity-50 block mb-1">Identificación Fiscal (EIN)</strong> 98-1906730</p>
                  <p><strong className="font-black uppercase text-[10px] tracking-widest opacity-50 block mb-1">Número de Registro</strong> 0008072199</p>
                  <p><strong className="font-black uppercase text-[10px] tracking-widest opacity-50 block mb-1">Domicilio Legal</strong> 1209 Mountain Road Pl NE, STE R, Albuquerque, NM 87110, USA</p>
                </div>
                <p className="mt-6 text-[11px] text-brand-dark/50 font-bold uppercase tracking-widest leading-loose bg-brand-dark/5 p-4 rounded-xl border border-brand-dark/10">
                  Easy US LLC es un nombre comercial de Fortuny Consulting LLC. Prestamos servicios administrativos y de gestión empresarial. No somos un despacho de abogados ni una firma de asesoría regulada.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">2. Ámbito de actividad</h2>
                </div>
                <div className="space-y-6 text-sm sm:text-base bg-white border-2 border-brand-lime/10 rounded-2xl p-8 sm:p-10">
                  <p>Fortuny Consulting LLC presta servicios administrativos especializados en la constitución y mantenimiento de sociedades LLC en Estados Unidos. Toda la información facilitada tiene carácter administrativo e informativo.</p>
                  <p>El cliente es responsable de consultar con profesionales cualificados cuando su situación lo requiera.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">3. Servicios Ofrecidos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-brand-dark/5 border-2 border-brand-dark/10 rounded-2xl p-8">
                    <ul className="space-y-3 text-xs sm:text-sm font-medium opacity-80">
                      <li>• Constitución de LLC (NM, WY, DE)</li>
                      <li>• Gestión de Articles of Organization</li>
                      <li>• Elaboración del Operating Agreement</li>
                      <li>• Obtención del EIN ante el IRS</li>
                    </ul>
                  </div>
                  <div className="bg-brand-dark/5 border-2 border-brand-dark/10 rounded-2xl p-8">
                    <ul className="space-y-3 text-xs sm:text-sm font-medium opacity-80">
                      <li>• Presentación del BOI Report (FinCEN)</li>
                      <li>• Registered Agent (12 meses incluidos)</li>
                      <li>• Dirección administrativa asociada</li>
                      <li>• Asistencia en apertura de cuentas</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">4. Packs y Precios</h2>
                </div>
                <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-8 sm:p-12 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-brand-lime/20 text-center">
                      <p className="text-2xl font-black text-brand-dark">639€</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Pack New Mexico</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-brand-lime/20 text-center">
                      <p className="text-2xl font-black text-brand-dark">799€</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Pack Wyoming</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-brand-lime/20 text-center">
                      <p className="text-2xl font-black text-brand-dark">999€</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Pack Delaware</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-brand-dark/60 text-center">Los precios incluyen las tasas estatales de constitución y los servicios detallados en cada pack.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">5. Ejecución y No Reembolso</h2>
                </div>
                <div className="space-y-6 text-sm sm:text-base bg-white border-2 border-brand-lime/10 rounded-2xl p-8 sm:p-10">
                  <p><strong>5.1. Ejecución Inmediata:</strong> Los servicios tienen carácter personalizado y de ejecución inmediata una vez confirmado el pago. El servicio se considera iniciado desde la confirmación del pago.</p>
                  <p><strong>5.2. Política de No Reembolso:</strong> No se admiten reembolsos, totales ni parciales, una vez iniciado el proceso o realizados trámites ante organismos públicos.</p>
                  <p><strong>5.3. Disputas (Chargebacks):</strong> El cliente se compromete a no iniciar contracargos. La apertura de una disputa será considerada un incumplimiento grave de este contrato.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">6. Jurisdicción</h2>
                </div>
                <div className="bg-brand-dark text-white rounded-2xl p-8 sm:p-12">
                  <p className="text-sm sm:text-base leading-relaxed opacity-90">Este contrato se rige exclusivamente por las leyes del Estado de New Mexico, USA. Cualquier litigio será resuelto en los tribunales de Albuquerque, NM, renunciando el cliente a cualquier otro fuero.</p>
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
