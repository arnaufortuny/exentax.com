import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface PageTitleConfig {
  titleKey?: string;
  descriptionKey?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

const routeTitles: Record<string, PageTitleConfig> = {
  "/": {
    titleKey: "seo.home.title",
    descriptionKey: "seo.home.description",
    fallbackTitle: "Easy US LLC | Constituye tu LLC en Estados Unidos",
    fallbackDescription: "En Easy US LLC ayudamos a emprendedores y negocios digitales a constituir y gestionar su LLC en Estados Unidos de forma simple."
  },
  "/servicios": {
    titleKey: "seo.servicios.title",
    descriptionKey: "seo.servicios.description",
    fallbackTitle: "Servicios y Precios | Easy US LLC",
    fallbackDescription: "Descubre nuestros packs de formación de LLC en New Mexico, Wyoming y Delaware. Precios transparentes desde 739€."
  },
  "/faq": {
    titleKey: "seo.faq.title",
    descriptionKey: "seo.faq.description",
    fallbackTitle: "Preguntas Frecuentes | Easy US LLC",
    fallbackDescription: "Resuelve todas tus dudas sobre la formación de LLC en Estados Unidos. Centro de ayuda completo."
  },
  "/contacto": {
    titleKey: "seo.contacto.title",
    descriptionKey: "seo.contacto.description",
    fallbackTitle: "Contacto | Easy US LLC",
    fallbackDescription: "Contacta con nuestro equipo de expertos en formación de LLC en Estados Unidos."
  },
  "/dashboard": {
    titleKey: "seo.dashboard.title",
    descriptionKey: "seo.dashboard.description",
    fallbackTitle: "Mi Panel | Easy US LLC",
    fallbackDescription: "Gestiona tu LLC, documentos y servicios desde tu panel personal."
  },
  "/llc/formation": {
    titleKey: "seo.formation.title",
    descriptionKey: "seo.formation.description",
    fallbackTitle: "Crear LLC | Easy US LLC",
    fallbackDescription: "Inicia el proceso de creación de tu LLC en Estados Unidos. Formulario simple y seguro."
  },
  "/llc/maintenance": {
    titleKey: "seo.maintenance.title",
    descriptionKey: "seo.maintenance.description",
    fallbackTitle: "Mantenimiento LLC | Easy US LLC",
    fallbackDescription: "Renueva el mantenimiento anual de tu LLC. Agente registrado y cumplimiento incluido."
  },
  "/auth/login": {
    titleKey: "seo.login.title",
    descriptionKey: "seo.login.description",
    fallbackTitle: "Iniciar Sesión | Easy US LLC",
    fallbackDescription: "Accede a tu cuenta de Easy US LLC para gestionar tu empresa."
  },
  "/auth/register": {
    titleKey: "seo.register.title",
    descriptionKey: "seo.register.description",
    fallbackTitle: "Crear Cuenta | Easy US LLC",
    fallbackDescription: "Crea tu cuenta gratuita en Easy US LLC."
  },
  "/auth/forgot-password": {
    titleKey: "seo.forgotPassword.title",
    descriptionKey: "seo.forgotPassword.description",
    fallbackTitle: "Recuperar Contraseña | Easy US LLC",
    fallbackDescription: "Recupera el acceso a tu cuenta de Easy US LLC."
  },
  "/tools/invoice": {
    titleKey: "seo.invoice.title",
    descriptionKey: "seo.invoice.description",
    fallbackTitle: "Generador de Facturas | Easy US LLC",
    fallbackDescription: "Crea facturas profesionales para tu LLC de forma gratuita."
  },
  "/tools/price-calculator": {
    titleKey: "seo.calculator.title",
    descriptionKey: "seo.calculator.description",
    fallbackTitle: "Calculadora de Ahorro Fiscal | Easy US LLC",
    fallbackDescription: "Calcula cuánto puedes ahorrar en impuestos con una LLC en Estados Unidos."
  },
  "/tools/operating-agreement": {
    titleKey: "seo.operatingAgreement.title",
    descriptionKey: "seo.operatingAgreement.description",
    fallbackTitle: "Generador Operating Agreement | Easy US LLC",
    fallbackDescription: "Genera el Operating Agreement de tu LLC de forma automática."
  },
  "/legal/terminos": {
    titleKey: "seo.legal.terminos.title",
    descriptionKey: "seo.legal.terminos.description",
    fallbackTitle: "Términos y Condiciones | Easy US LLC",
    fallbackDescription: "Consulta los términos y condiciones de uso de Easy US LLC."
  },
  "/legal/privacidad": {
    titleKey: "seo.legal.privacidad.title",
    descriptionKey: "seo.legal.privacidad.description",
    fallbackTitle: "Política de Privacidad | Easy US LLC",
    fallbackDescription: "Consulta nuestra política de privacidad y protección de datos."
  },
  "/legal/reembolsos": {
    titleKey: "seo.legal.reembolsos.title",
    descriptionKey: "seo.legal.reembolsos.description",
    fallbackTitle: "Política de Reembolsos | Easy US LLC",
    fallbackDescription: "Consulta nuestra política de reembolsos y devoluciones."
  },
  "/legal/cookies": {
    titleKey: "seo.legal.cookies.title",
    descriptionKey: "seo.legal.cookies.description",
    fallbackTitle: "Política de Cookies | Easy US LLC",
    fallbackDescription: "Información sobre el uso de cookies en Easy US LLC."
  }
};

export function usePageTitle(customTitle?: string) {
  const { t, i18n } = useTranslation();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  useEffect(() => {
    const config = routeTitles[pathname];
    
    if (customTitle) {
      document.title = customTitle;
      return;
    }

    if (config) {
      const title = config.titleKey ? t(config.titleKey, { defaultValue: config.fallbackTitle }) : config.fallbackTitle;
      const description = config.descriptionKey ? t(config.descriptionKey, { defaultValue: config.fallbackDescription }) : config.fallbackDescription;
      
      if (title) {
        document.title = title as string;
      }
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && description) {
        metaDescription.setAttribute("content", description as string);
      }
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && title) {
        ogTitle.setAttribute("content", title as string);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription && description) {
        ogDescription.setAttribute("content", description as string);
      }
    }
  }, [pathname, i18n.language, customTitle, t]);
}

export function getPageTitle(pathname: string): string {
  const config = routeTitles[pathname];
  return config?.fallbackTitle || "Easy US LLC | Constituye tu LLC en Estados Unidos";
}
