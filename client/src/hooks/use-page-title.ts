import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

interface PageTitleConfig {
  titleKey: string;
  descriptionKey: string;
}

const routeTitles: Record<string, PageTitleConfig> = {
  "/": {
    titleKey: "seo.home.title",
    descriptionKey: "seo.home.description"
  },
  "/servicios": {
    titleKey: "seo.servicios.title",
    descriptionKey: "seo.servicios.description"
  },
  "/faq": {
    titleKey: "seo.faq.title",
    descriptionKey: "seo.faq.description"
  },
  "/contacto": {
    titleKey: "seo.contacto.title",
    descriptionKey: "seo.contacto.description"
  },
  "/dashboard": {
    titleKey: "seo.dashboard.title",
    descriptionKey: "seo.dashboard.description"
  },
  "/llc/formation": {
    titleKey: "seo.formation.title",
    descriptionKey: "seo.formation.description"
  },
  "/llc/maintenance": {
    titleKey: "seo.maintenance.title",
    descriptionKey: "seo.maintenance.description"
  },
  "/auth/login": {
    titleKey: "seo.login.title",
    descriptionKey: "seo.login.description"
  },
  "/auth/register": {
    titleKey: "seo.register.title",
    descriptionKey: "seo.register.description"
  },
  "/auth/forgot-password": {
    titleKey: "seo.forgotPassword.title",
    descriptionKey: "seo.forgotPassword.description"
  },
  "/tools/invoice": {
    titleKey: "seo.invoice.title",
    descriptionKey: "seo.invoice.description"
  },
  "/tools/price-calculator": {
    titleKey: "seo.calculator.title",
    descriptionKey: "seo.calculator.description"
  },
  "/tools/operating-agreement": {
    titleKey: "seo.operatingAgreement.title",
    descriptionKey: "seo.operatingAgreement.description"
  },
  "/tools/csv-generator": {
    titleKey: "seo.csvGenerator.title",
    descriptionKey: "seo.csvGenerator.description"
  },
  "/legal/terminos": {
    titleKey: "seo.legal.terminos.title",
    descriptionKey: "seo.legal.terminos.description"
  },
  "/legal/privacidad": {
    titleKey: "seo.legal.privacidad.title",
    descriptionKey: "seo.legal.privacidad.description"
  },
  "/legal/reembolsos": {
    titleKey: "seo.legal.reembolsos.title",
    descriptionKey: "seo.legal.reembolsos.description"
  },
  "/legal/cookies": {
    titleKey: "seo.legal.cookies.title",
    descriptionKey: "seo.legal.cookies.description"
  },
  "/agendar-consultoria": {
    titleKey: "seo.asesoriaGratis.title",
    descriptionKey: "seo.asesoriaGratis.description"
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
      const rawTitle = t(config.titleKey);
      const rawDescription = t(config.descriptionKey);
      const title = rawTitle && rawTitle !== config.titleKey ? rawTitle : 'Exentax';
      const description = rawDescription && rawDescription !== config.descriptionKey ? rawDescription : '';
      
      document.title = title as string;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && description) {
        metaDescription.setAttribute("content", description as string);
      }
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", title as string);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription && description) {
        ogDescription.setAttribute("content", description as string);
      }
    } else {
      document.title = 'Exentax';
    }
  }, [pathname, i18n.language, customTitle, t]);
}

export function getPageTitle(pathname: string): string {
  const config = routeTitles[pathname];
  if (config) {
    const raw = i18next.t(config.titleKey) as string;
    return raw && raw !== config.titleKey ? raw : 'Exentax';
  }
  const homeTitle = i18next.t("seo.home.title") as string;
  return homeTitle && homeTitle !== "seo.home.title" ? homeTitle : 'Exentax';
}
