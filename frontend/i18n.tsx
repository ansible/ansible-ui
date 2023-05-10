import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { getLanguageWithoutRegionCode } from './common/utils/language';

const params = new URLSearchParams(window.location.search);
const pseudolocalizationEnabled = params.get('pseudolocalization') === 'true';
const language = params.get('lang') || getLanguageWithoutRegionCode(navigator) || 'en';

void i18n
  .use({
    type: 'postProcessor',
    name: 'pseudolocalization',
    process: function (value: string | string[]) {
      if (!pseudolocalizationEnabled) {
        return value;
      }
      if (Array.isArray(value)) {
        return ['»', ...value, '«'];
      } else {
        return `»${value}«`;
      }
    },
  })
  .use(backend)
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: language,
    fallbackLng: 'en', // use en if detected lng is not available
    supportedLngs: ['en', 'es', 'fr', 'ja', 'ko', 'nl', 'zh', 'zu'],
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    postProcess: ['pseudolocalization'],
  });
