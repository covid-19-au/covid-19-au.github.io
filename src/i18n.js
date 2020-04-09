import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import translation files
import infoPage_en from "./translations/en/infoPage.json";
import infoPage_zh from "./translations/zh/infoPage.json";
import infoPage_ko from "./translations/ko/infoPage.json";


i18n
  .init({
    fallbackLng: 'en',
    debug: true,
    lng: 'ko',                              // language to use, will change later when a button/auto detection will be used to set this
    resources: {
        en: {
            infoPage: infoPage_en               
            //the key to call the json is infoPage:dailyDistraction.title
        },
        zh: {
            infoPage: infoPage_zh
        },
        ko: {
          infoPage: infoPage_ko
        },        
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;