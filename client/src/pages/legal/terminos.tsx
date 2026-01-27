import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { Download } from "lucide-react";

export default function Terminos() {
  const handleDownload = () => {
    window.open("/terminos_y_condiciones.pdf", "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-left selection:bg-brand-lime selection:text-brand-dark">
      <Navbar />
      
      <HeroSection 
        className="pt-20 sm:pt-24 lg:pt-28 pb-0"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-brand-dark leading-[1.1] text-center sm:text-left">
            Términos y <span className="text-brand-lime">Condiciones</span>
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
                  <span className="text-brand-lime mr-4">01</span> Identidad del prestador del servicio
                </h2>
                <div className="space-y-4 text-base sm:text-lg">
                  <p>Easy US LLC es un nombre comercial utilizado para la prestación de servicios administrativos y de gestión empresarial. La entidad legal titular y responsable de los servicios es:</p>
                  <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-8 space-y-2 font-medium">
                    <p className="font-black text-brand-dark text-xs tracking-widest opacity-50">Entidad Legal</p>
                    <p className="font-black text-xl text-carbon-black">Fortuny Consulting LLC</p>
                    <p>Domestic Limited Liability Company</p>
                    <p>Número de registro: 0008072199</p>
                    <p>EIN: 98-1906730</p>
                    <p><strong>Domicilio social:</strong> 1209 Mountain Road Pl NE, STE R, Albuquerque, New Mexico 87110, Estados Unidos</p>
                  </div>
                  <p>Fortuny Consulting LLC opera bajo el nombre comercial Easy US LLC para la prestación de servicios a clientes de todo el mundo.</p>
                  <p>Correo electrónico de contacto: info@easyusllc.com | Teléfono de contacto: +34 614 916 910</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">02</span> Ámbito de actividad
                </h2>
                <div className="space-y-4 text-base sm:text-lg">
                  <p>Fortuny Consulting LLC, bajo la marca Easy US LLC, presta servicios administrativos, de gestión y acompañamiento empresarial, especializados en la constitución y mantenimiento de sociedades de responsabilidad limitada (LLC) en Estados Unidos, dirigidos a clientes nacionales e internacionales.</p>
                  <p>Easy US LLC no es un despacho de abogados, ni una firma de asesoría legal, fiscal o financiera regulada, y no presta servicios de representación legal ni asesoramiento profesional regulado. Toda la información facilitada tiene carácter administrativo, informativo y orientativo. El cliente es responsable de consultar con profesionales cualificados (abogados, asesores fiscales o contables) cuando su situación lo requiera.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">03</span> Servicios ofrecidos
                </h2>
                <div className="space-y-4 text-base sm:text-lg">
                  <p>Easy US LLC ofrece, entre otros, los siguientes servicios administrativos:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 list-none font-medium">
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Constitución de LLC (NM, WY, DE)</li>
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Gestión y presentación de Articles of Organization</li>
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Elaboración del Operating Agreement</li>
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Obtención del EIN ante el IRS</li>
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Presentación del BOI Report (FinCEN)</li>
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Registered Agent (primeros 12 meses)</li>
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Dirección administrativa asociada</li>
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Asistencia en apertura de cuentas bancarias</li>
                    <li className="flex gap-3"><span className="text-brand-lime font-black">•</span> Soporte administrativo durante la vigencia</li>
                  </ul>
                  <p className="text-sm opacity-70 italic mt-6">Los servicios se prestan con carácter administrativo, basándose en la información proporcionada por el cliente.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">04</span> Packs de constitución y precios
                </h2>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl border-2 border-brand-lime/20 text-center shadow-sm">
                      <p className="text-3xl font-black text-brand-dark">639 €</p>
                      <p className="text-xs font-black tracking-widest opacity-60 mt-2 uppercase">Pack New Mexico</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border-2 border-brand-lime/20 text-center shadow-sm">
                      <p className="text-3xl font-black text-brand-dark">799 €</p>
                      <p className="text-xs font-black tracking-widest opacity-60 mt-2 uppercase">Pack Wyoming</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border-2 border-brand-lime/20 text-center shadow-sm">
                      <p className="text-3xl font-black text-brand-dark">999 €</p>
                      <p className="text-xs font-black tracking-widest opacity-60 mt-2 uppercase">Pack Delaware</p>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg opacity-80">Los precios indicados incluyen las tasas estatales de constitución, así como los servicios detallados en cada pack en el momento de la contratación. Los precios pueden estar sujetos a actualización, sin que ello afecte a servicios ya contratados y abonados.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">05</span> Plazos de prestación del servicio
                </h2>
                <div className="text-base sm:text-lg space-y-4">
                  <p>Una vez recibida toda la información y documentación requerida de forma correcta, el plazo estimado de constitución de la LLC es de 2 a 3 días hábiles, dependiendo del estado y de los organismos implicados.</p>
                  <p>El cliente reconoce que dichos plazos son estimaciones y que pueden verse afectados por retrasos derivados de autoridades públicas, organismos estatales, entidades financieras u otros terceros ajenos a Easy US LLC.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">06</span> Duración del servicio
                </h2>
                <div className="text-base sm:text-lg">
                  <p>Los packs de constitución y mantenimiento tienen una duración de 12 meses desde la fecha de activación del servicio, salvo que se indique expresamente lo contrario. Una vez finalizado dicho periodo, el cliente podrá contratar packs de mantenimiento adicionales, cuyos términos y condiciones se regirán por lo establecido en el momento de su contratación.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">07</span> Registered Agent
                </h2>
                <div className="text-base sm:text-lg space-y-4">
                  <p>El servicio de Registered Agent se incluye durante los primeros 12 meses en los packs que así lo indiquen. Finalizado dicho periodo, el cliente será responsable de renovar este servicio, ya sea con Easy US LLC o con un proveedor de su elección.</p>
                  <p>Easy US LLC no será responsable de sanciones, multas o consecuencias derivadas de la falta de renovación del Registered Agent una vez finalizado el periodo incluido.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">08</span> Plazos ampliados y derecho de rechazo
                </h2>
                <div className="text-base sm:text-lg space-y-4">
                  <p>El cliente reconoce y acepta que, si bien el plazo habitual estimado para la constitución de una LLC es de 2 a 3 días hábiles, en determinados casos el proceso puede extenderse hasta un máximo de 15 días hábiles, debido a verificaciones adicionales, requerimientos de información, cargas administrativas de los organismos competentes o cualquier circunstancia ajena al control de Easy US LLC.</p>
                  <p>Easy US LLC se reserva el derecho de rechazar, suspender o no aceptar una solicitud a su entera discreción, especialmente cuando la información facilitada sea incompleta, inconsistente, inexacta o no se ajuste a los criterios internos de la empresa. En estos casos, Easy US LLC no estará obligada a justificar la decisión ni a continuar con el proceso.</p>
                  <p>Asimismo, Easy US LLC no asume responsabilidad alguna cuando el cliente actúe en nombre de terceros sin haber informado previamente de dicha circunstancia. El cliente será el único responsable de la veracidad y legalidad de la información proporcionada.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">09</span> Pagos y política de no reembolso
                </h2>
                <div className="text-base sm:text-lg space-y-4">
                  <p>Todos los servicios ofrecidos por Easy US LLC deberán ser abonados por adelantado. El pago implica la aceptación expresa de los presentes Términos y Condiciones.</p>
                  <p>Dado que los servicios prestados por Easy US LLC tienen carácter administrativo, personalizado y de <strong>ejecución inmediata</strong>, no se admiten reembolsos, totales ni parciales, una vez iniciado el proceso, presentada la documentación ante organismos públicos o realizados trámites en nombre del cliente.</p>
                  <p>El cliente entiende que los costes asociados a tasas estatales, registros oficiales, presentación de formularios y gestión administrativa no son recuperables.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">10</span> Bancos, fintech y terceros
                </h2>
                <div className="text-base sm:text-lg space-y-4">
                  <p>Easy US LLC ofrece asistencia y acompañamiento en procesos de apertura de cuentas bancarias y plataformas financieras. No obstante, el cliente reconoce que:</p>
                  <ul className="list-disc pl-8 space-y-2 font-medium">
                    <li>Easy US LLC no garantiza la aprobación de cuentas bancarias o de plataformas de pago.</li>
                    <li>Las decisiones finales dependen exclusivamente de las entidades financieras y terceros independientes.</li>
                    <li>Easy US LLC no tiene control sobre los criterios internos o políticas de riesgo de dichas entidades.</li>
                    <li>Easy US LLC no será responsable de rechazos, bloqueos, cierres de cuentas o solicitudes adicionales de documentación.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">11</span> Obligaciones del cliente
                </h2>
                <div className="text-base sm:text-lg space-y-4">
                  <p>El cliente se compromete a:</p>
                  <ul className="list-disc pl-8 space-y-2 font-medium">
                    <li>Facilitar información veraz, completa y actualizada en todo momento.</li>
                    <li>Proporcionar documentación válida, vigente y legítima.</li>
                    <li>Utilizar la LLC y los servicios contratados conforme a la legalidad aplicable.</li>
                    <li>No utilizar los servicios con fines ilícitos, fraudulentos o contrarios a la normativa vigente.</li>
                  </ul>
                  <p>Easy US LLC no será responsable de errores, retrasos o sanciones derivadas de información incorrecta o falsa proporcionada por el cliente.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6">
                  <span className="text-brand-lime mr-4">12</span> Legislación aplicable
                </h2>
                <div className="bg-brand-dark text-white rounded-2xl p-10 sm:p-12 shadow-xl">
                  <p className="text-lg sm:text-xl leading-relaxed opacity-90 font-medium">Estos Términos y Condiciones se rigen por la legislación vigente en los Estados Unidos de América, específicamente en los estados de New Mexico, Wyoming o Delaware, según corresponda a la jurisdicción de constitución de la entidad. Cualquier controversia será resuelta ante los tribunales competentes de dicha jurisdicción.</p>
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
