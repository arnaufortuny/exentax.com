import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection, LegalSubSection, LegalList, LegalHighlightBox } from "@/components/legal/legal-page-layout";

export default function Terminos() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <LegalPageLayout
      title={isEnglish ? "Terms and" : "Términos y"}
      titleHighlight={isEnglish ? "Conditions" : "Condiciones"}
      lastUpdated={t("legal.lastUpdated")}
      pdfUrl="/legal/terminos-condiciones.pdf"
    >
      <LegalSection number="01" title={isEnglish ? "Service Provider Identification" : "Identidad del prestador del servicio"}>
        <p>{isEnglish 
          ? "Easy US LLC is a trade name used for the provision of administrative and business management services. The legal entity responsible for the services is:"
          : "Easy US LLC es un nombre comercial utilizado para la prestación de servicios administrativos y de gestión empresarial. La entidad legal titular y responsable de los servicios es:"
        }</p>
        <LegalHighlightBox>
          <p className="font-black text-brand-dark text-xs tracking-widest opacity-50">{isEnglish ? "Legal Entity" : "Entidad Legal"}</p>
          <p className="font-black text-xl text-carbon-black">Fortuny Consulting LLC</p>
          <p>Domestic Limited Liability Company</p>
          <p>{isEnglish ? "Registration number" : "Número de registro"}: 0008072199</p>
          <p>EIN: 98-1906730</p>
          <p><strong>{isEnglish ? "Registered address" : "Domicilio social"}:</strong> 1209 Mountain Road Pl NE, STE R, Albuquerque, New Mexico 87110, {isEnglish ? "United States" : "Estados Unidos"}</p>
        </LegalHighlightBox>
        <p>{isEnglish 
          ? "Fortuny Consulting LLC operates under the trade name Easy US LLC for the provision of services to clients worldwide."
          : "Fortuny Consulting LLC opera bajo el nombre comercial Easy US LLC para la prestación de servicios a clientes de todo el mundo."
        }</p>
        <p>{isEnglish ? "Contact email" : "Correo electrónico de contacto"}: hola@easyusllc.com | {isEnglish ? "Contact phone" : "Teléfono de contacto"}: +34 614 916 910</p>
      </LegalSection>

      <LegalSection number="02" title={isEnglish ? "Scope of Activity" : "Ámbito de actividad"}>
        <p>{isEnglish 
          ? "Fortuny Consulting LLC, under the Easy US LLC brand, provides administrative, management and business support services, specializing in the formation and maintenance of limited liability companies (LLC) in the United States, aimed at national and international clients."
          : "Fortuny Consulting LLC, bajo la marca Easy US LLC, presta servicios administrativos, de gestión y acompañamiento empresarial, especializados en la constitución y mantenimiento de sociedades de responsabilidad limitada (LLC) en Estados Unidos, dirigidos a clientes nacionales e internacionales."
        }</p>
        <p>{isEnglish 
          ? "Easy US LLC is not a law firm, nor a regulated legal, tax or financial advisory firm, and does not provide legal representation or regulated professional advice. All information provided is administrative, informational and guidance-oriented. The client is responsible for consulting with qualified professionals (lawyers, tax advisors or accountants) when their situation requires it."
          : "Easy US LLC no es un despacho de abogados, ni una firma de asesoría legal, fiscal o financiera regulada, y no presta servicios de representación legal ni asesoramiento profesional regulado. Toda la información facilitada tiene carácter administrativo, informativo y orientativo. El cliente es responsable de consultar con profesionales cualificados (abogados, asesores fiscales o contables) cuando su situación lo requiera."
        }</p>
      </LegalSection>

      <LegalSection number="03" title={isEnglish ? "Services Offered" : "Servicios ofrecidos"}>
        <p>{isEnglish 
          ? "Easy US LLC offers, among others, the following administrative services:"
          : "Easy US LLC ofrece, entre otros, los siguientes servicios administrativos:"
        }</p>
        <LegalList items={isEnglish ? [
          "LLC Formation (NM, WY, DE)",
          "Processing and filing of Articles of Organization",
          "Preparation of the Operating Agreement",
          "Obtaining the EIN from the IRS",
          "Filing the BOI Report (FinCEN)",
          "Registered Agent (first 12 months)",
          "Associated administrative address",
          "Assistance in opening bank accounts",
          "Administrative support during the service period"
        ] : [
          "Constitución de LLC (NM, WY, DE)",
          "Gestión y presentación de Articles of Organization",
          "Elaboración del Operating Agreement",
          "Obtención del EIN ante el IRS",
          "Presentación del BOI Report (FinCEN)",
          "Registered Agent (primeros 12 meses)",
          "Dirección administrativa asociada",
          "Asistencia en apertura de cuentas bancarias",
          "Soporte administrativo durante la vigencia"
        ]} />
        <p className="text-sm opacity-70 italic mt-6">{isEnglish 
          ? "Services are provided on an administrative basis, based on information provided by the client."
          : "Los servicios se prestan con carácter administrativo, basándose en la información proporcionada por el cliente."
        }</p>
      </LegalSection>

      <LegalSection number="04" title={isEnglish ? "Formation Packages and Pricing" : "Packs de constitución y precios"}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-accent/20 text-center shadow-sm">
            <p className="text-3xl font-black text-brand-dark">739 €</p>
            <p className="text-xs font-black tracking-widest opacity-60 mt-2 uppercase">Pack New Mexico</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-accent/20 text-center shadow-sm">
            <p className="text-3xl font-black text-brand-dark">899 €</p>
            <p className="text-xs font-black tracking-widest opacity-60 mt-2 uppercase">Pack Wyoming</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-accent/20 text-center shadow-sm">
            <p className="text-3xl font-black text-brand-dark">1399 €</p>
            <p className="text-xs font-black tracking-widest opacity-60 mt-2 uppercase">Pack Delaware</p>
          </div>
        </div>
        <p className="text-base sm:text-lg opacity-80 mt-6">{isEnglish 
          ? "Prices shown include state formation fees, as well as the services detailed in each package at the time of contracting. Prices may be subject to update, without affecting services already contracted and paid for."
          : "Los precios indicados incluyen las tasas estatales de constitución, así como los servicios detallados en cada pack en el momento de la contratación. Los precios pueden estar sujetos a actualización, sin que ello afecte a servicios ya contratados y abonados."
        }</p>
      </LegalSection>

      <LegalSection number="05" title={isEnglish ? "Service Delivery Timeframes" : "Plazos de prestación del servicio"}>
        <p>{isEnglish 
          ? "Once all required information and documentation has been received correctly, the estimated timeframe for LLC formation is 2 to 3 business days, depending on the state and the agencies involved."
          : "Una vez recibida toda la información y documentación requerida de forma correcta, el plazo estimado de constitución de la LLC es de 2 a 3 días hábiles, dependiendo del estado y de los organismos implicados."
        }</p>
        <p>{isEnglish 
          ? "The client acknowledges that these timeframes are estimates and may be affected by delays caused by public authorities, state agencies, financial institutions or other third parties beyond Easy US LLC's control."
          : "El cliente reconoce que dichos plazos son estimaciones y que pueden verse afectados por retrasos derivados de autoridades públicas, organismos estatales, entidades financieras u otros terceros ajenos a Easy US LLC."
        }</p>
      </LegalSection>

      <LegalSection number="06" title={isEnglish ? "Service Duration" : "Duración del servicio"}>
        <p>{isEnglish 
          ? "Formation and maintenance packages have a duration of 12 months from the service activation date, unless expressly stated otherwise. Once this period ends, the client may contract additional maintenance packages, whose terms and conditions will be governed by those in effect at the time of contracting."
          : "Los packs de constitución y mantenimiento tienen una duración de 12 meses desde la fecha de activación del servicio, salvo que se indique expresamente lo contrario. Una vez finalizado dicho periodo, el cliente podrá contratar packs de mantenimiento adicionales, cuyos términos y condiciones se regirán por lo establecido en el momento de su contratación."
        }</p>
      </LegalSection>

      <LegalSection number="07" title={isEnglish ? "Registered Agent" : "Registered Agent"}>
        <p>{isEnglish 
          ? "Registered Agent service is included for the first 12 months in packages that indicate so. After this period ends, the client is responsible for renewing this service, either with Easy US LLC or with a provider of their choice."
          : "El servicio de Registered Agent se incluye durante los primeros 12 meses en los packs que así lo indiquen. Finalizado dicho periodo, el cliente será responsable de renovar este servicio, ya sea con Easy US LLC o con un proveedor de su elección."
        }</p>
        <p>{isEnglish 
          ? "Easy US LLC will not be responsible for penalties, fines or consequences arising from failure to renew the Registered Agent once the included period has ended."
          : "Easy US LLC no será responsable de sanciones, multas o consecuencias derivadas de la falta de renovación del Registered Agent una vez finalizado el periodo incluido."
        }</p>
      </LegalSection>

      <LegalSection number="08" title={isEnglish ? "Extended Timeframes and Right of Rejection" : "Plazos ampliados y derecho de rechazo"}>
        <p>{isEnglish 
          ? "The client acknowledges and accepts that, although the usual estimated timeframe for LLC formation is 2 to 3 business days, in certain cases the process may extend up to a maximum of 15 business days, due to additional verifications, information requirements, administrative workloads of competent agencies or any circumstance beyond Easy US LLC's control."
          : "El cliente reconoce y acepta que, si bien el plazo habitual estimado para la constitución de una LLC es de 2 a 3 días hábiles, en determinados casos el proceso puede extenderse hasta un máximo de 15 días hábiles, debido a verificaciones adicionales, requerimientos de información, cargas administrativas de los organismos competentes o cualquier circunstancia ajena al control de Easy US LLC."
        }</p>
        <p>{isEnglish 
          ? "Easy US LLC reserves the right to reject, suspend or not accept a request at its sole discretion, especially when the information provided is incomplete, inconsistent, inaccurate or does not meet the company's internal criteria. In these cases, Easy US LLC will not be obligated to justify the decision or continue with the process."
          : "Easy US LLC se reserva el derecho de rechazar, suspender o no aceptar una solicitud a su entera discreción, especialmente cuando la información facilitada sea incompleta, inconsistente, inexacta o no se ajuste a los criterios internos de la empresa. En estos casos, Easy US LLC no estará obligada a justificar la decisión ni a continuar con el proceso."
        }</p>
      </LegalSection>

      <LegalSection number="09" title={isEnglish ? "Payments and No Refund Policy" : "Pagos y política de no reembolso"}>
        <p>{isEnglish 
          ? "All services offered by Easy US LLC must be paid in advance. Payment implies express acceptance of these Terms and Conditions."
          : "Todos los servicios ofrecidos por Easy US LLC deberán ser abonados por adelantado. El pago implica la aceptación expresa de los presentes Términos y Condiciones."
        }</p>
        <p>{isEnglish 
          ? "Given that the services provided by Easy US LLC are administrative, personalized and of immediate execution, no refunds, total or partial, are accepted once the process has begun, documentation has been submitted to public bodies or procedures have been carried out on behalf of the client."
          : "Dado que los servicios prestados por Easy US LLC tienen carácter administrativo, personalizado y de ejecución inmediata, no se admiten reembolsos, totales ni parciales, una vez iniciado el proceso, presentada la documentación ante organismos públicos o realizados trámites en nombre del cliente."
        }</p>
        <p>{isEnglish 
          ? "The client understands that costs associated with state fees, official registrations, form filing and administrative management are non-recoverable."
          : "El cliente entiende que los costes asociados a tasas estatales, registros oficiales, presentación de formularios y gestión administrativa no son recuperables."
        }</p>
      </LegalSection>

      <LegalSection number="10" title={isEnglish ? "Banks, Fintech and Third Parties" : "Bancos, fintech y terceros"}>
        <p>{isEnglish 
          ? "Easy US LLC offers assistance and support in the process of opening bank accounts and financial platforms. However, the client acknowledges that:"
          : "Easy US LLC ofrece asistencia y acompañamiento en procesos de apertura de cuentas bancarias y plataformas financieras. No obstante, el cliente reconoce que:"
        }</p>
        <LegalList items={isEnglish ? [
          "Easy US LLC does not guarantee the approval of bank accounts or payment platforms.",
          "Final decisions depend exclusively on financial entities and independent third parties.",
          "Easy US LLC has no control over the internal criteria or risk policies of these entities.",
          "Easy US LLC will not be responsible for rejections, blocks, account closures or additional documentation requests."
        ] : [
          "Easy US LLC no garantiza la aprobación de cuentas bancarias o de plataformas de pago.",
          "Las decisiones finales dependen exclusivamente de las entidades financieras y terceros independientes.",
          "Easy US LLC no tiene control sobre los criterios internos o políticas de riesgo de dichas entidades.",
          "Easy US LLC no será responsable de rechazos, bloqueos, cierres de cuentas o solicitudes adicionales de documentación."
        ]} />
      </LegalSection>

      <LegalSection number="11" title={isEnglish ? "Client Obligations" : "Obligaciones del cliente"}>
        <p>{isEnglish ? "The client agrees to:" : "El cliente se compromete a:"}</p>
        <LegalList items={isEnglish ? [
          "Provide truthful, complete and up-to-date information at all times.",
          "Provide valid, current and legitimate documentation.",
          "Use the LLC and contracted services in accordance with applicable law.",
          "Not use the services for illicit, fraudulent purposes or contrary to current regulations."
        ] : [
          "Facilitar información veraz, completa y actualizada en todo momento.",
          "Proporcionar documentación válida, vigente y legítima.",
          "Utilizar la LLC y los servicios contratados conforme a la legalidad aplicable.",
          "No utilizar los servicios con fines ilícitos, fraudulentos o contrarios a la normativa vigente."
        ]} />
        <p>{isEnglish 
          ? "Easy US LLC will not be responsible for errors, delays or penalties resulting from incorrect or false information provided by the client."
          : "Easy US LLC no será responsable de errores, retrasos o sanciones derivadas de información incorrecta o falsa proporcionada por el cliente."
        }</p>
      </LegalSection>

      <LegalSection number="12" title={isEnglish ? "Applicable Law" : "Legislación aplicable"}>
        <LegalHighlightBox variant="dark">
          <p>{isEnglish 
            ? "These Terms and Conditions are governed by the laws in force in the United States of America, specifically in the states of New Mexico, Wyoming or Delaware, as applicable to the jurisdiction of formation of the entity. Any dispute will be resolved before the competent courts of that jurisdiction."
            : "Estos Términos y Condiciones se rigen por la legislación vigente en los Estados Unidos de América, específicamente en los estados de New Mexico, Wyoming o Delaware, según corresponda a la jurisdicción de constitución de la entidad. Cualquier controversia será resuelta ante los tribunales competentes de dicha jurisdicción."
          }</p>
        </LegalHighlightBox>
      </LegalSection>
    </LegalPageLayout>
  );
}
