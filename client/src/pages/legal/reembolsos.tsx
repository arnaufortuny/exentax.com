import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection, LegalSubSection, LegalList, LegalHighlightBox } from "@/components/legal/legal-page-layout";

export default function Reembolsos() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <LegalPageLayout
      title={isEnglish ? "Refund" : "Política de"}
      titleHighlight={isEnglish ? "Policy" : "Reembolsos"}
      lastUpdated={t("legal.lastUpdated")}
      pdfUrl="/legal/politica-reembolsos.pdf"
    >
      <LegalSection number="01" title={isEnglish ? "General Principles" : "Principios Generales"}>
        <p>{isEnglish 
          ? "Given the administrative, personalized, and immediate execution nature of the services provided by Easy US LLC, under the legal entity Fortuny Consulting LLC, refunds are generally not accepted once the service process has begun."
          : "Dado el carácter administrativo, personalizado y de ejecución inmediata de los servicios prestados por Easy US LLC, bajo la entidad legal Fortuny Consulting LLC, generalmente no se aceptan reembolsos una vez iniciado el proceso del servicio."
        }</p>
        <p>{isEnglish 
          ? "The client understands and accepts that the costs associated with state fees, official registrations, form filing, and administrative management are non-recoverable."
          : "El cliente entiende y acepta que los costes asociados a tasas estatales, registros oficiales, presentación de formularios y gestión administrativa no son recuperables."
        }</p>
      </LegalSection>

      <LegalSection number="02" title={isEnglish ? "Non-Refundable Services" : "Servicios No Reembolsables"}>
        <p>{isEnglish 
          ? "The following services and fees are non-refundable under any circumstances:"
          : "Los siguientes servicios y tasas no son reembolsables bajo ninguna circunstancia:"
        }</p>
        <LegalList items={isEnglish ? [
          "State fees paid to government agencies",
          "Articles of Organization filing fees",
          "EIN application processing",
          "BOI Report filing with FinCEN",
          "Registered Agent services once activated",
          "Annual Report filings",
          "Any service where documentation has been submitted to public bodies"
        ] : [
          "Tasas estatales pagadas a agencias gubernamentales",
          "Tasas de presentación de Articles of Organization",
          "Procesamiento de solicitud de EIN",
          "Presentación de BOI Report ante FinCEN",
          "Servicios de Registered Agent una vez activados",
          "Presentación de Annual Reports",
          "Cualquier servicio donde se haya presentado documentación ante organismos públicos"
        ]} />
      </LegalSection>

      <LegalSection number="03" title={isEnglish ? "Exceptional Cases" : "Casos Excepcionales"}>
        <p>{isEnglish 
          ? "In exceptional circumstances, partial refunds may be considered:"
          : "En circunstancias excepcionales, se pueden considerar reembolsos parciales:"
        }</p>
        <LegalList items={isEnglish ? [
          "If the client cancels before any documentation is prepared or submitted",
          "If Easy US LLC is unable to complete the service due to internal reasons",
          "If there is a documented error on our part that prevents service completion"
        ] : [
          "Si el cliente cancela antes de que se prepare o presente cualquier documentación",
          "Si Easy US LLC no puede completar el servicio por razones internas",
          "Si hay un error documentado por nuestra parte que impida la finalización del servicio"
        ]} />
        <p className="mt-4">{isEnglish 
          ? "Each case will be evaluated individually. Any approved refund will exclude state fees and third-party costs already incurred."
          : "Cada caso será evaluado individualmente. Cualquier reembolso aprobado excluirá las tasas estatales y costes de terceros ya incurridos."
        }</p>
      </LegalSection>

      <LegalSection number="04" title={isEnglish ? "Service Rejection" : "Rechazo del Servicio"}>
        <p>{isEnglish 
          ? "Easy US LLC reserves the right to reject, suspend, or not accept a request at its sole discretion, especially when:"
          : "Easy US LLC se reserva el derecho de rechazar, suspender o no aceptar una solicitud a su entera discreción, especialmente cuando:"
        }</p>
        <LegalList items={isEnglish ? [
          "The information provided is incomplete, inconsistent, or inaccurate",
          "The documentation does not meet required standards",
          "The request does not meet the company's internal criteria",
          "There are suspicions of fraudulent or illegal activity"
        ] : [
          "La información proporcionada es incompleta, inconsistente o inexacta",
          "La documentación no cumple con los estándares requeridos",
          "La solicitud no cumple con los criterios internos de la empresa",
          "Existen sospechas de actividad fraudulenta o ilegal"
        ]} />
        <p className="mt-4">{isEnglish 
          ? "In cases of rejection before service initiation, a refund may be processed minus any administrative fees incurred."
          : "En casos de rechazo antes del inicio del servicio, se puede procesar un reembolso menos cualquier tasa administrativa incurrida."
        }</p>
      </LegalSection>

      <LegalSection number="05" title={isEnglish ? "Bank Account Opening" : "Apertura de Cuentas Bancarias"}>
        <p>{isEnglish 
          ? "Easy US LLC provides assistance in the bank account opening process. However:"
          : "Easy US LLC proporciona asistencia en el proceso de apertura de cuentas bancarias. Sin embargo:"
        }</p>
        <LegalList items={isEnglish ? [
          "We do not guarantee the approval of bank accounts or payment platforms",
          "Final decisions depend exclusively on financial entities",
          "Rejection by a bank or financial institution does not entitle to a refund",
          "Additional documentation requests from banks do not constitute grounds for refund"
        ] : [
          "No garantizamos la aprobación de cuentas bancarias o plataformas de pago",
          "Las decisiones finales dependen exclusivamente de las entidades financieras",
          "El rechazo por parte de un banco o institución financiera no da derecho a reembolso",
          "Solicitudes adicionales de documentación por parte de bancos no constituyen motivo de reembolso"
        ]} />
      </LegalSection>

      <LegalSection number="06" title={isEnglish ? "How to Request a Review" : "Cómo Solicitar una Revisión"}>
        <p>{isEnglish 
          ? "If you believe you have a valid case for a refund review, please contact us:"
          : "Si crees que tienes un caso válido para una revisión de reembolso, contáctanos:"
        }</p>
        <LegalHighlightBox>
          <p>Email: hola@easyusllc.com</p>
          <p>WhatsApp: +34 614 916 910</p>
          <p className="mt-4 text-sm opacity-70">{isEnglish 
            ? "Please include your order number and a detailed explanation of your situation."
            : "Por favor incluye tu número de pedido y una explicación detallada de tu situación."
          }</p>
        </LegalHighlightBox>
        <p className="mt-4">{isEnglish 
          ? "We will respond within 5 business days with our decision."
          : "Responderemos en un plazo de 5 días hábiles con nuestra decisión."
        }</p>
      </LegalSection>

      <LegalSection number="07" title={isEnglish ? "Acceptance" : "Aceptación"}>
        <LegalHighlightBox variant="dark">
          <p>{isEnglish 
            ? "By contracting our services and making payment, the client expressly accepts this Refund Policy and acknowledges understanding that the services are non-refundable once the process has begun."
            : "Al contratar nuestros servicios y realizar el pago, el cliente acepta expresamente esta Política de Reembolsos y reconoce entender que los servicios no son reembolsables una vez iniciado el proceso."
          }</p>
        </LegalHighlightBox>
      </LegalSection>
    </LegalPageLayout>
  );
}
