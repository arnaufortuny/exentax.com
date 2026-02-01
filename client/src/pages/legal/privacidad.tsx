import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection, LegalSubSection, LegalList, LegalHighlightBox } from "@/components/legal/legal-page-layout";

export default function Privacidad() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <LegalPageLayout
      title={isEnglish ? "Privacy" : "Política de"}
      titleHighlight={isEnglish ? "Policy" : "Privacidad"}
      lastUpdated={t("legal.lastUpdated")}
      pdfUrl="/legal/politica-privacidad.pdf"
    >
      <LegalSection number="01" title={isEnglish ? "General Information" : "Información General"}>
        <LegalSubSection title={isEnglish ? "Data Controller Identification" : "Identificación del Responsable del Tratamiento"}>
          <p>{isEnglish 
            ? "This Privacy Policy describes how Easy US LLC, operating under the legal name Fortuny Consulting LLC, collects, uses, stores, protects and shares the personal information of users of our services and platform."
            : "Esta Política de Privacidad describe cómo Easy US LLC, operando bajo la razón social Fortuny Consulting LLC, recopila, utiliza, almacena, protege y comparte la información personal de los usuarios de nuestros servicios y plataforma."
          }</p>
          <LegalHighlightBox>
            <p className="font-black text-brand-dark text-xs tracking-widest opacity-50">{isEnglish ? "Legal Entity" : "Entidad Responsable"}</p>
            <p className="font-black text-xl text-carbon-black">Fortuny Consulting LLC</p>
            <p>{isEnglish ? "Trade Name" : "Nombre Comercial"}: Easy US LLC</p>
            <p>{isEnglish ? "Registered Address" : "Domicilio Social"}: 1209 Mountain Road Place Northeast, STE R, Albuquerque, NM 87110, {isEnglish ? "United States" : "Estados Unidos"}</p>
            <p>Email: hola@easyusllc.com</p>
            <p>WhatsApp: +34 614 916 910</p>
          </LegalHighlightBox>
        </LegalSubSection>

        <LegalSubSection title={isEnglish ? "Privacy Commitment" : "Compromiso con la Privacidad"}>
          <p>{isEnglish 
            ? "Easy US LLC is committed to protecting the privacy and security of our users' personal data in accordance with industry best practices and applicable data protection laws, including:"
            : "Easy US LLC se compromete a proteger la privacidad y seguridad de los datos personales de sus usuarios conforme a las mejores prácticas de la industria y las leyes aplicables de protección de datos, incluyendo:"
          }</p>
          <LegalList items={isEnglish ? [
            "European Union General Data Protection Regulation (GDPR)",
            "California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA)",
            "Spain's Organic Law on Data Protection and Guarantee of Digital Rights (LOPDGDD)",
            "Other applicable data protection laws according to the user's jurisdiction"
          ] : [
            "Reglamento General de Protección de Datos de la Unión Europea (GDPR)",
            "California Consumer Privacy Act (CCPA) y California Privacy Rights Act (CPRA)",
            "Ley Orgánica de Protección de Datos y Garantía de Derechos Digitales (LOPDGDD) de España",
            "Otras leyes aplicables de protección de datos según la jurisdicción del usuario"
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="02" title={isEnglish ? "Information We Collect" : "Información que Recopilamos"}>
        <LegalSubSection title={isEnglish ? "Registration and Account Information" : "Información de Registro y Cuenta"}>
          <p>{isEnglish ? "When you create an account, we collect:" : "Cuando el usuario crea una cuenta, recopilamos:"}</p>
          <LegalList items={isEnglish ? [
            "Full name (first and last name)",
            "Email address",
            "Phone number with country code",
            "Password (stored encrypted)",
            "Country of residence",
            "Preferred language"
          ] : [
            "Nombre completo (nombre y apellidos)",
            "Dirección de correo electrónico",
            "Número de teléfono con código de país",
            "Contraseña (almacenada de forma encriptada)",
            "País de residencia",
            "Idioma preferido"
          ]} />
        </LegalSubSection>

        <LegalSubSection title={isEnglish ? "Identity Verification Information" : "Información de Verificación de Identidad"}>
          <p>{isEnglish 
            ? "To comply with AML/KYC regulations and the Corporate Transparency Act, we collect:"
            : "Para cumplir con regulaciones AML/KYC y la Corporate Transparency Act, recopilamos:"
          }</p>
          <LegalList items={isEnglish ? [
            "Official identification document (passport, ID card, driver's license)",
            "Document identification number",
            "Date of birth",
            "Nationality",
            "Proof of address",
            "Photo of identification document"
          ] : [
            "Documento de identidad oficial (pasaporte, DNI, cédula de identidad o licencia de conducir)",
            "Número de documento de identidad",
            "Fecha de nacimiento",
            "Nacionalidad",
            "Comprobante de domicilio",
            "Fotografía del documento de identidad"
          ]} />
        </LegalSubSection>

        <LegalSubSection title={isEnglish ? "LLC Formation Information" : "Información de la LLC a Constituir"}>
          <LegalList items={isEnglish ? [
            "Proposed name for the LLC",
            "Desired state of formation",
            "Business activity description",
            "Information about LLC members and managers",
            "Participation percentages",
            "LLC tax address",
            "LLC contact information"
          ] : [
            "Nombre propuesto para la LLC",
            "Estado de constitución deseado",
            "Descripción de la actividad empresarial",
            "Información de miembros y managers de la LLC",
            "Porcentajes de participación",
            "Dirección fiscal de la LLC",
            "Información de contacto de la LLC"
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="03" title={isEnglish ? "How We Use Information" : "Cómo Utilizamos la Información"}>
        <LegalSubSection title={isEnglish ? "Service Provision" : "Prestación de Servicios"}>
          <LegalList items={isEnglish ? [
            "Process LLC formation requests",
            "Submit documents to state and federal authorities",
            "Obtain EIN numbers from the IRS",
            "Prepare and file BOI Reports with FinCEN",
            "Provide Registered Agent services",
            "Prepare and file tax returns (Form 1120, Form 5472)",
            "Manage Annual Report filings",
            "Provide access to the platform and its tools"
          ] : [
            "Procesar solicitudes de constitución de LLC",
            "Presentar documentos ante autoridades estatales y federales",
            "Obtener números EIN ante el IRS",
            "Preparar y presentar BOI Reports ante FinCEN",
            "Proporcionar servicios de Registered Agent",
            "Preparar y presentar declaraciones fiscales (Form 1120, Form 5472)",
            "Gestionar presentaciones de Annual Reports",
            "Proporcionar acceso a la plataforma y sus herramientas"
          ]} />
        </LegalSubSection>

        <LegalSubSection title={isEnglish ? "Account Management and Communications" : "Gestión de Cuenta y Comunicaciones"}>
          <LegalList items={isEnglish ? [
            "Create and manage user accounts",
            "Authenticate platform access",
            "Send order and service confirmations",
            "Provide updates on contracted service status",
            "Respond to inquiries and support requests",
            "Send important notifications about service or policy changes",
            "Manage newsletter subscriptions"
          ] : [
            "Crear y gestionar la cuenta del usuario",
            "Autenticar el acceso a la plataforma",
            "Enviar confirmaciones de pedidos y servicios",
            "Proporcionar actualizaciones sobre el estado de servicios contratados",
            "Responder a consultas y solicitudes de soporte",
            "Enviar notificaciones importantes sobre cambios en servicios o políticas",
            "Gestionar suscripciones a newsletter"
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="04" title={isEnglish ? "Data Sharing" : "Compartición de Datos"}>
        <p>{isEnglish 
          ? "We may share personal information with the following third parties when necessary for service provision:"
          : "Podemos compartir información personal con los siguientes terceros cuando sea necesario para la prestación de servicios:"
        }</p>
        <LegalList items={isEnglish ? [
          "State government agencies (Secretary of State offices)",
          "Federal agencies (IRS, FinCEN)",
          "Registered Agent service providers",
          "Payment processing providers",
          "Banking partners for account opening",
          "Professional advisors when required"
        ] : [
          "Agencias gubernamentales estatales (Secretarías de Estado)",
          "Agencias federales (IRS, FinCEN)",
          "Proveedores de servicios de Registered Agent",
          "Proveedores de procesamiento de pagos",
          "Socios bancarios para apertura de cuentas",
          "Asesores profesionales cuando sea necesario"
        ]} />
      </LegalSection>

      <LegalSection number="05" title={isEnglish ? "Data Security" : "Seguridad de los Datos"}>
        <p>{isEnglish 
          ? "We implement appropriate technical and organizational measures to protect personal data, including:"
          : "Implementamos medidas técnicas y organizativas apropiadas para proteger los datos personales, incluyendo:"
        }</p>
        <LegalList items={isEnglish ? [
          "Encryption of data in transit and at rest",
          "Secure authentication systems",
          "Access controls and authorization protocols",
          "Regular security audits",
          "Employee training on data protection",
          "Incident response procedures"
        ] : [
          "Encriptación de datos en tránsito y en reposo",
          "Sistemas de autenticación seguros",
          "Controles de acceso y protocolos de autorización",
          "Auditorías de seguridad regulares",
          "Formación de empleados en protección de datos",
          "Procedimientos de respuesta a incidentes"
        ]} />
      </LegalSection>

      <LegalSection number="06" title={isEnglish ? "Your Rights" : "Tus Derechos"}>
        <p>{isEnglish 
          ? "Depending on your jurisdiction, you may have the following rights regarding your personal data:"
          : "Dependiendo de tu jurisdicción, puedes tener los siguientes derechos respecto a tus datos personales:"
        }</p>
        <LegalList items={isEnglish ? [
          "Right of access - obtain a copy of your personal data",
          "Right of rectification - correct inaccurate data",
          "Right of erasure - request deletion of your data",
          "Right to restriction of processing",
          "Right to data portability",
          "Right to object to processing",
          "Right to withdraw consent"
        ] : [
          "Derecho de acceso - obtener una copia de tus datos personales",
          "Derecho de rectificación - corregir datos inexactos",
          "Derecho de supresión - solicitar la eliminación de tus datos",
          "Derecho a la limitación del tratamiento",
          "Derecho a la portabilidad de datos",
          "Derecho de oposición al tratamiento",
          "Derecho a retirar el consentimiento"
        ]} />
        <p className="mt-4">{isEnglish 
          ? "To exercise these rights, contact us at hola@easyusllc.com"
          : "Para ejercer estos derechos, contáctanos en hola@easyusllc.com"
        }</p>
      </LegalSection>

      <LegalSection number="07" title={isEnglish ? "Data Retention" : "Retención de Datos"}>
        <p>{isEnglish 
          ? "We retain personal data for as long as necessary to provide services and comply with legal obligations. Retention periods vary based on the type of data and legal requirements."
          : "Conservamos los datos personales durante el tiempo necesario para prestar servicios y cumplir con las obligaciones legales. Los períodos de retención varían según el tipo de datos y los requisitos legales."
        }</p>
      </LegalSection>

      <LegalSection number="08" title={isEnglish ? "Contact" : "Contacto"}>
        <LegalHighlightBox variant="dark">
          <p>{isEnglish 
            ? "For questions about this Privacy Policy or to exercise your data protection rights, contact us at:"
            : "Para preguntas sobre esta Política de Privacidad o para ejercer tus derechos de protección de datos, contáctanos en:"
          }</p>
          <p className="mt-4">Email: hola@easyusllc.com</p>
          <p>WhatsApp: +34 614 916 910</p>
        </LegalHighlightBox>
      </LegalSection>
    </LegalPageLayout>
  );
}
