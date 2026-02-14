import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

interface PageTitleConfig {
  titleKey: string;
  descriptionKey: string;
  path: string;
}

const BASE_URL = "https://exentax.com";

const routeTitles: Record<string, PageTitleConfig> = {
  "/": {
    titleKey: "seo.home.title",
    descriptionKey: "seo.home.description",
    path: "/"
  },
  "/servicios": {
    titleKey: "seo.servicios.title",
    descriptionKey: "seo.servicios.description",
    path: "/servicios"
  },
  "/faq": {
    titleKey: "seo.faq.title",
    descriptionKey: "seo.faq.description",
    path: "/faq"
  },
  "/contacto": {
    titleKey: "seo.contacto.title",
    descriptionKey: "seo.contacto.description",
    path: "/contacto"
  },
  "/dashboard": {
    titleKey: "seo.dashboard.title",
    descriptionKey: "seo.dashboard.description",
    path: "/dashboard"
  },
  "/llc/formation": {
    titleKey: "seo.formation.title",
    descriptionKey: "seo.formation.description",
    path: "/llc/formation"
  },
  "/llc/maintenance": {
    titleKey: "seo.maintenance.title",
    descriptionKey: "seo.maintenance.description",
    path: "/llc/maintenance"
  },
  "/auth/login": {
    titleKey: "seo.login.title",
    descriptionKey: "seo.login.description",
    path: "/auth/login"
  },
  "/auth/register": {
    titleKey: "seo.register.title",
    descriptionKey: "seo.register.description",
    path: "/auth/register"
  },
  "/auth/forgot-password": {
    titleKey: "seo.forgotPassword.title",
    descriptionKey: "seo.forgotPassword.description",
    path: "/auth/forgot-password"
  },
  "/tools/invoice": {
    titleKey: "seo.invoice.title",
    descriptionKey: "seo.invoice.description",
    path: "/tools/invoice"
  },
  "/tools/price-calculator": {
    titleKey: "seo.calculator.title",
    descriptionKey: "seo.calculator.description",
    path: "/tools/price-calculator"
  },
  "/tools/operating-agreement": {
    titleKey: "seo.operatingAgreement.title",
    descriptionKey: "seo.operatingAgreement.description",
    path: "/tools/operating-agreement"
  },
  "/tools/csv-generator": {
    titleKey: "seo.csvGenerator.title",
    descriptionKey: "seo.csvGenerator.description",
    path: "/tools/csv-generator"
  },
  "/legal/terminos": {
    titleKey: "seo.legal.terminos.title",
    descriptionKey: "seo.legal.terminos.description",
    path: "/legal/terminos"
  },
  "/legal/privacidad": {
    titleKey: "seo.legal.privacidad.title",
    descriptionKey: "seo.legal.privacidad.description",
    path: "/legal/privacidad"
  },
  "/legal/reembolsos": {
    titleKey: "seo.legal.reembolsos.title",
    descriptionKey: "seo.legal.reembolsos.description",
    path: "/legal/reembolsos"
  },
  "/legal/cookies": {
    titleKey: "seo.legal.cookies.title",
    descriptionKey: "seo.legal.cookies.description",
    path: "/legal/cookies"
  },
  "/agendar-consultoria": {
    titleKey: "seo.asesoriaGratis.title",
    descriptionKey: "seo.asesoriaGratis.description",
    path: "/agendar-consultoria"
  },
  "/start": {
    titleKey: "seo.start.title",
    descriptionKey: "seo.start.description",
    path: "/start"
  },
  "/links": {
    titleKey: "seo.links.title",
    descriptionKey: "seo.links.description",
    path: "/links"
  }
};

function setMetaTag(selector: string, attribute: string, value: string) {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute(attribute, value);
  }
}

function updateSeoMeta(title: string, description: string, path: string, lang: string) {
  document.title = title;

  const canonicalUrl = `${BASE_URL}${path === "/" ? "" : path}`;

  setMetaTag('meta[name="description"]', "content", description);
  setMetaTag('link[rel="canonical"]', "href", canonicalUrl);

  setMetaTag('meta[property="og:title"]', "content", title);
  setMetaTag('meta[property="og:description"]', "content", description);
  setMetaTag('meta[property="og:url"]', "content", canonicalUrl);

  const ogLocaleMap: Record<string, string> = {
    es: "es_ES",
    en: "en_US",
    ca: "ca_ES",
    fr: "fr_FR",
    de: "de_DE",
    it: "it_IT",
    pt: "pt_PT"
  };
  setMetaTag('meta[property="og:locale"]', "content", ogLocaleMap[lang] || "es_ES");

  setMetaTag('meta[name="twitter:title"]', "content", title);
  setMetaTag('meta[name="twitter:description"]', "content", description);

  const htmlEl = document.documentElement;
  htmlEl.setAttribute("lang", lang);
  setMetaTag('meta[http-equiv="content-language"]', "content", lang);
}

export function usePageTitle(customTitle?: string, customDescription?: string) {
  const { t, i18n } = useTranslation();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  useEffect(() => {
    const config = routeTitles[pathname];

    if (customTitle) {
      const desc = customDescription || "";
      const path = config?.path || pathname;
      updateSeoMeta(customTitle, desc, path, i18n.language);
      return;
    }

    if (config) {
      const rawTitle = t(config.titleKey);
      const rawDescription = t(config.descriptionKey);
      const title = rawTitle && rawTitle !== config.titleKey ? rawTitle : "ExenTax";
      const description = rawDescription && rawDescription !== config.descriptionKey ? rawDescription : "";

      updateSeoMeta(title as string, description as string, config.path, i18n.language);
    } else {
      document.title = "ExenTax";
    }
  }, [pathname, i18n.language, customTitle, customDescription, t]);
}

const JSONLD_SCRIPT_ID = "dynamic-jsonld";

export function useJsonLd(data: Record<string, unknown> | null) {
  useEffect(() => {
    const existing = document.getElementById(JSONLD_SCRIPT_ID);
    if (existing) {
      existing.remove();
    }

    if (!data) return;

    const script = document.createElement("script");
    script.id = JSONLD_SCRIPT_ID;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", ...data });
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(JSONLD_SCRIPT_ID);
      if (el) el.remove();
    };
  }, [data]);
}

export function getPageTitle(pathname: string): string {
  const config = routeTitles[pathname];
  if (config) {
    const raw = i18next.t(config.titleKey) as string;
    return raw && raw !== config.titleKey ? raw : "ExenTax";
  }
  const homeTitle = i18next.t("seo.home.title") as string;
  return homeTitle && homeTitle !== "seo.home.title" ? homeTitle : "ExenTax";
}
