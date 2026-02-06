import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esTranslations from '../locales/es.json';
import enTranslations from '../locales/en.json';
import caTranslations from '../locales/ca.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';
import itTranslations from '../locales/it.json';
import ptTranslations from '../locales/pt.json';

const resources = {
  es: { translation: esTranslations },
  en: { translation: enTranslations },
  ca: { translation: caTranslations },
  fr: { translation: frTranslations },
  de: { translation: deTranslations },
  it: { translation: itTranslations },
  pt: { translation: ptTranslations }
};

export const supportedLanguages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'ca', name: 'Català' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' }
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => {
        // Map language codes to supported languages
        if (lng.startsWith('ca')) return 'ca';
        if (lng.startsWith('en')) return 'en';
        if (lng.startsWith('fr')) return 'fr';
        if (lng.startsWith('de')) return 'de';
        if (lng.startsWith('it')) return 'it';
        if (lng.startsWith('pt')) return 'pt';
        if (lng.startsWith('es')) return 'es';
        return 'es'; // Default to Spanish
      }
    }
  });

export default i18n;
