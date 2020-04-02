import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import translation files
import infoPage_en from "./translations/en/infoPage.json";
import infoPage_cn from "./translations/cn/infoPage.json";


i18n
  .init({
    fallbackLng: 'en',
    debug: true,
    lng: 'en',                              // language to use, will change later when a button/auto detection will be used to set this
    resources: {
        en: {
            infoPage: infoPage_en               
            //the key to call the json is infoPage:dailyDistraction.title
        },
        cn: {
            infoPage: infoPage_cn
        },
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;