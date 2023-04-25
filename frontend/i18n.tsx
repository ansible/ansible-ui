import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

void i18n
  .use(backend)
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'en', // use en if detected lng is not available
    supportedLngs: ['en', 'fr'],
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });
