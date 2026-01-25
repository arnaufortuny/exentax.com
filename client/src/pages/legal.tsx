import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
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

            <div className="space-y-12 text-brand-dark leading-relaxed">
              
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">1. Identidad del prestador del servicio</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>Easy US LLC es un nombre comercial utilizado para la prestación de servicios administrativos y de gestión empresarial. La entidad legal titular y responsable de los servicios es:</p>
                  <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-8 space-y-2 font-medium">
                    <p className="font-black text-brand-dark uppercase text-xs tracking-widest opacity-50">Entidad Legal</p>
                    <p className="font-bold text-lg text-carbon-black">Fortuny Consulting LLC</p>
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
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">2. Ámbito de actividad</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>Fortuny Consulting LLC, bajo la marca Easy US LLC, presta servicios administrativos, de gestión y acompañamiento empresarial, especializados en la constitución y mantenimiento de sociedades de responsabilidad limitada (LLC) en Estados Unidos, dirigidos a clientes nacionales e internacionales.</p>
                  <p>Easy US LLC no es un despacho de abogados, ni una firma de asesoría legal, fiscal o financiera regulada, y no presta servicios de representación legal ni asesoramiento profesional regulado. Toda la información facilitada tiene carácter administrativo, informativo y orientativo. El cliente es responsable de consultar con profesionales cualificados (abogados, asesores fiscales o contables) cuando su situación lo requiera.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">3. Servicios ofrecidos</h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p>Easy US LLC ofrece, entre otros, los siguientes servicios administrativos:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none font-medium">
                    <li>• Constitución de LLC (NM, WY, DE)</li>
                    <li>• Gestión y presentación de Articles of Organization</li>
                    <li>• Elaboración del Operating Agreement</li>
                    <li>• Obtención del EIN ante el IRS</li>
                    <li>• Presentación del BOI Report (FinCEN)</li>
                    <li>• Registered Agent (primeros 12 meses)</li>
                    <li>• Dirección administrativa asociada</li>
                    <li>• Asistencia en apertura de cuentas bancarias</li>
                    <li>• Soporte administrativo durante la vigencia</li>
                  </ul>
                  <p className="text-xs opacity-70 italic">Los servicios se prestan con carácter administrativo, basándose en la información proporcionada por el cliente.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">4. Packs de constitución y precios</h2>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border-2 border-brand-lime/20 text-center">
                      <p className="text-2xl font-black text-brand-dark">639 €</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Pack New Mexico</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border-2 border-brand-lime/20 text-center">
                      <p className="text-2xl font-black text-brand-dark">799 €</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Pack Wyoming</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border-2 border-brand-lime/20 text-center">
                      <p className="text-2xl font-black text-brand-dark">999 €</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Pack Delaware</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-80">Los precios indicados incluyen las tasas estatales de constitución, así como los servicios detallados en cada pack en el momento de la contratación. Los precios pueden estar sujetos a actualización, sin que ello afecte a servicios ya contratados y abonados.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">5. Plazos de prestación del servicio</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Una vez recibida toda la información y documentación requerida de forma correcta, el plazo estimado de constitución de la LLC es de 2 a 3 días hábiles, dependiendo del estado y de los organismos implicados.</p>
                  <p>El cliente reconoce que dichos plazos son estimaciones y que pueden verse afectados por retrasos derivados de autoridades públicas, organismos estatales, entidades financieras u otros terceros ajenos a Easy US LLC.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">6. Duración del servicio</h2>
                </div>
                <div className="text-sm sm:text-base">
                  <p>Los packs de constitución y mantenimiento tienen una duración de 12 meses desde la fecha de activación del servicio, salvo que se indique expresamente lo contrario. Una vez finalizado dicho periodo, el cliente podrá contratar packs de mantenimiento adicionales, cuyos términos y condiciones se regirán por lo establecido en el momento de su contratación.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">7. Registered Agent</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El servicio de Registered Agent se incluye durante los primeros 12 meses en los packs que así lo indiquen. Finalizado dicho periodo, el cliente será responsable de renovar este servicio, ya sea con Easy US LLC o con un proveedor de su elección.</p>
                  <p>Easy US LLC no será responsable de sanciones, multas o consecuencias derivadas de la falta de renovación del Registered Agent una vez finalizado el periodo incluido.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">8. Plazos ampliados y derecho de rechazo</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El cliente reconoce y acepta que, si bien el plazo habitual estimado para la constitución de una LLC es de 2 a 3 días hábiles, en determinados casos el proceso puede extenderse hasta un máximo de 15 días hábiles, debido a verificaciones adicionales, requerimientos de información, cargas administrativas de los organismos competentes o cualquier circunstancia ajena al control de Easy US LLC.</p>
                  <p>Easy US LLC se reserva el derecho de rechazar, suspender o no aceptar una solicitud a su entera discreción, especialmente cuando la información facilitada sea incompleta, inconsistente, inexacta o no se ajuste a los criterios internos de la empresa. En estos casos, Easy US LLC no estará obligada a justificar la decisión ni a continuar con el proceso.</p>
                  <p>Asimismo, Easy US LLC no asume responsabilidad alguna cuando el cliente actúe en nombre de terceros sin haber informado previamente de dicha circunstancia. El cliente será el único responsable de la veracidad y legalidad de la información proporcionada.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">9. Pagos y política de no reembolso</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Todos los servicios ofrecidos por Easy US LLC deberán ser abonados por adelantado. El pago implica la aceptación expresa de los presentes Términos y Condiciones.</p>
                  <p>Dado que los servicios prestados por Easy US LLC tienen carácter administrativo, personalizado y de <strong>ejecución inmediata</strong>, no se admiten reembolsos, totales ni parciales, una vez iniciado el proceso, presentada la documentación ante organismos públicos o realizados trámites en nombre del cliente.</p>
                  <p>El cliente entiende que los costes asociados a tasas estatales, registros oficiales, presentación de formularios y gestión administrativa no son recuperables.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">10. Bancos, fintech y terceros</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Easy US LLC ofrece asistencia y acompañamiento en procesos de apertura de cuentas bancarias y plataformas financieras. No obstante, el cliente reconoce que:</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>Easy US LLC no garantiza la aprobación de cuentas bancarias o de plataformas de pago.</li>
                    <li>Las decisiones finales dependen exclusivamente de las entidades financieras y terceros independientes.</li>
                    <li>Easy US LLC no tiene control sobre los criterios internos o políticas de riesgo de dichas entidades.</li>
                    <li>Easy US LLC no será responsable de rechazos, bloqueos, cierres de cuentas o solicitudes adicionales de documentación.</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">11. Obligaciones del cliente</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El cliente se compromete a:</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>Facilitar información veraz, completa y actualizada en todo momento.</li>
                    <li>Proporcionar documentación válida, vigente y legítima.</li>
                    <li>Utilizar la LLC y los servicios contratados conforme a la legalidad aplicable.</li>
                    <li>No utilizar los servicios con fines ilícitos, fraudulentos o contrarios a la normativa vigente.</li>
                  </ul>
                  <p>Easy US LLC no será responsable de errores, retrasos o sanciones derivadas de información incorrecta o falsa proporcionada por el cliente.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">12. Uso indebido y actividades no permitidas</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Queda expresamente prohibido utilizar los servicios para actividades ilegales, no declaradas o fraudulentas. En caso de detectar indicios razonables de uso indebido, Easy US LLC se reserva el derecho de suspender inmediatamente el servicio y poner los hechos en conocimiento de las autoridades competentes, sin derecho a reembolso.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">13. Limitación de responsabilidad</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>En ningún caso Easy US LLC será responsable de:</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium">
                    <li>Pérdidas económicas, lucro cesante o daños indirectos.</li>
                    <li>Consecuencias fiscales, legales o financieras derivadas del uso de la LLC.</li>
                    <li>Decisiones adoptadas por el cliente basadas en la información proporcionada.</li>
                    <li>Actuaciones u omisiones de terceros, organismos públicos o bancos.</li>
                  </ul>
                  <p>La responsabilidad máxima de Easy US LLC quedará limitada al importe efectivamente abonado por el cliente por el servicio contratado.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">14. Ejecución inmediata del servicio</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El cliente reconoce que los servicios prestados por Easy US LLC tienen carácter personalizado y de ejecución inmediata una vez confirmado el pago. Desde ese momento, se inician tareas administrativas, revisión de información y preparación de documentación.</p>
                  <p>Por este motivo, el cliente acepta que el servicio se considera iniciado desde la confirmación del pago, con independencia del estado posterior del proceso.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">15. Chargebacks y disputas de pago</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El cliente se compromete expresamente a no iniciar chargebacks, contracargos o disputas de pago ante bancos o emisores de tarjetas una vez iniciado el servicio. La apertura de una disputa será considerada un incumplimiento grave de los presentes Términos y Condiciones.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">16. Procedimiento en caso de disputa</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>En caso de chargeback, Easy US LLC se reserva el derecho de suspender cualquier servicio y aportar a la entidad correspondiente toda la documentación necesaria para la defensa de la operación, incluyendo registros de comunicación y evidencias del trabajo realizado.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">17. Costes derivados de disputas</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El cliente será responsable de todas las comisiones, penalizaciones y costes derivados de chargebacks o disputas iniciadas sin causa justificada. Easy US LLC se reserva el derecho de reclamar dichos importes al cliente por los medios legalmente disponibles.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">18. Documentación y trazabilidad del servicio</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Easy US LLC mantiene registros internos de los procesos, comunicaciones, formularios y documentos generados o recibidos durante la prestación del servicio, con fines administrativos, legales y de cumplimiento.</p>
                  <p>El cliente reconoce que dichos registros podrán ser utilizados como prueba válida en procedimientos de reclamación, disputa de pago o requerimiento legal.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">19. Actuación en nombre propio y terceros</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El cliente declara actuar en nombre propio. Easy US LLC no asume responsabilidad alguna cuando el cliente actúe en nombre de terceros sin haberlo comunicado de forma expresa y previa.</p>
                  <p>Cualquier consecuencia legal, fiscal o administrativa derivada de dicha actuación será responsabilidad exclusiva del cliente.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">20. Bancos, fintech y terceros independientes</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Easy US LLC presta únicamente asistencia y acompañamiento administrativo en procesos relacionados con bancos y plataformas financieras. Las decisiones finales corresponden exclusivamente a dichas entidades.</p>
                  <p>Easy US LLC no garantiza aprobaciones ni será responsable de rechazos, bloqueos, limitaciones, cierres de cuentas o requerimientos adicionales de documentación por parte de terceros.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">21. Uso indebido y suspensión del servicio</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>Queda prohibido el uso de los servicios para actividades ilegales, fraudulentas o contrarias a la normativa aplicable. En caso de detectar indicios razonables de uso indebido, Easy US LLC podrá suspender o cancelar el servicio de forma inmediata, sin que ello genere derecho a reembolso.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">22. Obligaciones de colaboración del cliente</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El cliente se compromete a colaborar activamente durante la prestación del servicio, facilitando la información y documentación solicitada en tiempo y forma. La falta de respuesta, retrasos injustificados o negativa a aportar información requerida podrá afectar a los plazos y al correcto desarrollo del servicio.</p>
                  <p>Easy US LLC no será responsable de retrasos, suspensiones o imposibilidad de completar el servicio derivados de la falta de colaboración del cliente.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">23. Veracidad de la información proporcionada</h2>
                </div>
                <div className="text-sm sm:text-base space-y-4">
                  <p>El cliente declara que toda la información y documentación facilitada es veraz, exacta y completa. Cualquier error o falsedad en la misma será responsabilidad exclusiva del cliente, quien asumirá las consecuencias legales o administrativas que pudieran derivarse.</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-2 h-10 bg-brand-lime rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">24. Jurisdicción y Ley Aplicable</h2>
                </div>
                <div className="bg-brand-dark text-white rounded-2xl p-8 sm:p-12">
                  <p className="text-sm sm:text-base leading-relaxed opacity-90">Este contrato se rige exclusivamente por las leyes del Estado de New Mexico, USA. Cualquier litigio será resuelto en los tribunales de Albuquerque, NM, renunciando el cliente a cualquier otro fuero que pudiera corresponderle.</p>
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
