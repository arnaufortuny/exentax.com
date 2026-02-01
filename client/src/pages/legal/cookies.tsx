import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection, LegalSubSection, LegalList, LegalHighlightBox } from "@/components/legal/legal-page-layout";

export default function Cookies() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <LegalPageLayout
      title={isEnglish ? "Cookie" : "Aviso de"}
      titleHighlight={isEnglish ? "Policy" : "Cookies"}
      lastUpdated={t("legal.lastUpdated")}
      pdfUrl="/legal/politica-cookies.pdf"
    >
      <LegalSection number="01" title={isEnglish ? "What Are Cookies?" : "¿Qué son las Cookies?"}>
        <p>{isEnglish 
          ? "Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform."
          : "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a proporcionarte una mejor experiencia al recordar tus preferencias y entender cómo utilizas nuestra plataforma."
        }</p>
      </LegalSection>

      <LegalSection number="02" title={isEnglish ? "Types of Cookies We Use" : "Tipos de Cookies que Utilizamos"}>
        <LegalSubSection title={isEnglish ? "Essential Cookies" : "Cookies Esenciales"}>
          <p>{isEnglish 
            ? "These cookies are necessary for the website to function properly and cannot be disabled. They include:"
            : "Estas cookies son necesarias para que el sitio web funcione correctamente y no pueden desactivarse. Incluyen:"
          }</p>
          <LegalList items={isEnglish ? [
            "Authentication and session management",
            "Security features (CSRF protection)",
            "User preferences (language, theme)",
            "Shopping cart functionality"
          ] : [
            "Autenticación y gestión de sesiones",
            "Funciones de seguridad (protección CSRF)",
            "Preferencias del usuario (idioma, tema)",
            "Funcionalidad del carrito de compras"
          ]} />
        </LegalSubSection>

        <LegalSubSection title={isEnglish ? "Functional Cookies" : "Cookies Funcionales"}>
          <p>{isEnglish 
            ? "These cookies enable enhanced functionality and personalization:"
            : "Estas cookies permiten funcionalidad mejorada y personalización:"
          }</p>
          <LegalList items={isEnglish ? [
            "Remember form data for easier completion",
            "Store draft applications locally",
            "Maintain user interface preferences"
          ] : [
            "Recordar datos de formularios para facilitar su completado",
            "Almacenar borradores de solicitudes localmente",
            "Mantener preferencias de interfaz de usuario"
          ]} />
        </LegalSubSection>

        <LegalSubSection title={isEnglish ? "Analytics Cookies" : "Cookies de Análisis"}>
          <p>{isEnglish 
            ? "We use analytics cookies to understand how visitors interact with our website:"
            : "Utilizamos cookies de análisis para entender cómo los visitantes interactúan con nuestro sitio web:"
          }</p>
          <LegalList items={isEnglish ? [
            "Google Analytics - to analyze website traffic and user behavior",
            "Performance monitoring - to identify and fix issues",
            "Usage statistics - to improve our services"
          ] : [
            "Google Analytics - para analizar el tráfico del sitio web y el comportamiento del usuario",
            "Monitoreo de rendimiento - para identificar y corregir problemas",
            "Estadísticas de uso - para mejorar nuestros servicios"
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="03" title={isEnglish ? "Third-Party Cookies" : "Cookies de Terceros"}>
        <p>{isEnglish 
          ? "Some cookies are placed by third-party services that appear on our pages:"
          : "Algunas cookies son colocadas por servicios de terceros que aparecen en nuestras páginas:"
        }</p>
        <LegalList items={isEnglish ? [
          "Google Analytics (analytics)",
          "Stripe (payment processing)",
          "Google OAuth (authentication)"
        ] : [
          "Google Analytics (análisis)",
          "Stripe (procesamiento de pagos)",
          "Google OAuth (autenticación)"
        ]} />
        <p className="mt-4">{isEnglish 
          ? "These third parties have their own privacy policies governing the use of their cookies."
          : "Estos terceros tienen sus propias políticas de privacidad que rigen el uso de sus cookies."
        }</p>
      </LegalSection>

      <LegalSection number="04" title={isEnglish ? "Cookie Duration" : "Duración de las Cookies"}>
        <LegalSubSection title={isEnglish ? "Session Cookies" : "Cookies de Sesión"}>
          <p>{isEnglish 
            ? "These are temporary cookies that are deleted when you close your browser. They are used for maintaining your session while you navigate our website."
            : "Son cookies temporales que se eliminan cuando cierras tu navegador. Se utilizan para mantener tu sesión mientras navegas por nuestro sitio web."
          }</p>
        </LegalSubSection>

        <LegalSubSection title={isEnglish ? "Persistent Cookies" : "Cookies Persistentes"}>
          <p>{isEnglish 
            ? "These cookies remain on your device for a set period or until you delete them. They are used for:"
            : "Estas cookies permanecen en tu dispositivo durante un período determinado o hasta que las elimines. Se utilizan para:"
          }</p>
          <LegalList items={isEnglish ? [
            "Remembering login status",
            "Storing language and theme preferences",
            "Keeping draft application data"
          ] : [
            "Recordar el estado de inicio de sesión",
            "Almacenar preferencias de idioma y tema",
            "Mantener datos de borradores de solicitudes"
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="05" title={isEnglish ? "Managing Cookies" : "Gestión de Cookies"}>
        <p>{isEnglish 
          ? "You can control and manage cookies in several ways:"
          : "Puedes controlar y gestionar las cookies de varias formas:"
        }</p>
        <LegalList items={isEnglish ? [
          "Browser settings - most browsers allow you to refuse or delete cookies",
          "Device settings - you can adjust privacy settings on your device",
          "Third-party opt-outs - you can opt out of analytics tracking"
        ] : [
          "Configuración del navegador - la mayoría de los navegadores te permiten rechazar o eliminar cookies",
          "Configuración del dispositivo - puedes ajustar la configuración de privacidad en tu dispositivo",
          "Exclusión de terceros - puedes excluirte del seguimiento analítico"
        ]} />
        <LegalHighlightBox>
          <p>{isEnglish 
            ? "Please note that disabling essential cookies may affect the functionality of our website and prevent you from using certain features."
            : "Ten en cuenta que desactivar las cookies esenciales puede afectar la funcionalidad de nuestro sitio web e impedirte utilizar ciertas características."
          }</p>
        </LegalHighlightBox>
      </LegalSection>

      <LegalSection number="06" title={isEnglish ? "Local Storage" : "Almacenamiento Local"}>
        <p>{isEnglish 
          ? "In addition to cookies, we use local storage for:"
          : "Además de las cookies, utilizamos almacenamiento local para:"
        }</p>
        <LegalList items={isEnglish ? [
          "Saving draft LLC and maintenance applications",
          "Storing theme preferences (light/dark mode)",
          "Caching certain data for performance"
        ] : [
          "Guardar borradores de solicitudes de LLC y mantenimiento",
          "Almacenar preferencias de tema (modo claro/oscuro)",
          "Almacenar en caché ciertos datos para mejorar el rendimiento"
        ]} />
      </LegalSection>

      <LegalSection number="07" title={isEnglish ? "Updates to This Policy" : "Actualizaciones de esta Política"}>
        <p>{isEnglish 
          ? "We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. The date of the last update is shown at the top of this page."
          : "Podemos actualizar este Aviso de Cookies de vez en cuando para reflejar cambios en nuestras prácticas o por otras razones operativas, legales o regulatorias. La fecha de la última actualización se muestra en la parte superior de esta página."
        }</p>
      </LegalSection>

      <LegalSection number="08" title={isEnglish ? "Contact" : "Contacto"}>
        <LegalHighlightBox variant="dark">
          <p>{isEnglish 
            ? "If you have questions about our use of cookies, please contact us:"
            : "Si tienes preguntas sobre nuestro uso de cookies, contáctanos:"
          }</p>
          <p className="mt-4">Email: hola@easyusllc.com</p>
          <p>WhatsApp: +34 614 916 910</p>
        </LegalHighlightBox>
      </LegalSection>
    </LegalPageLayout>
  );
}
