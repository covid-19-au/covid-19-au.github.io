import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import translation files
import infoPage_en from "./translations/en/infoPage.json";
import info_en from "./translations/en/info.json";
import infoPage_zh from "./translations/zh/infoPage.json";
import info_zh from "./translations/zh/info.json";
import infoPage_ko from "./translations/ko/infoPage.json";
import info_ko from "./translations/ko/info.json";

const allowedLanguages = ['en', 'ko','zh'];

const defaultLng = 'ko';
let lng = defaultLng;

//language detection
const storageLanguage = localStorage.getItem('language');
if (storageLanguage && allowedLanguages.indexOf(storageLanguage) > -1) {
  lng = storageLanguage;
}

i18n
  .use(initReactI18next)
  .init({
    lng,
    fallbackLng: 'en',
    debug: true,                              
    resources: {
        en: {
            infoPage: infoPage_en,
            info: info_en               
            //the key to call the json is infoPage:dailyDistraction.title
        },
        zh: {
            infoPage: infoPage_zh,
            info: info_zh
        },
        ko: {
          infoPage: infoPage_ko,
          info: info_ko
        },        
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;