import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import translation files
import infoPage_en from "./translations/en/infoPage.json";
import homePage_en from "./translations/en/homePage.json";
import faq_en from "./translations/en/faq.json";
import nav_en from "./translations/en/nav.json"

import infoPage_zh from "./translations/zh/infoPage.json";
import homePage_zh from "./translations/zh/homePage.json";
import faq_zh from "./translations/zh/faq.json";
import nav_zh from "./translations/zh/nav.json"

import infoPage_ko from "./translations/ko/infoPage.json";
import homePage_ko from "./translations/ko/homePage.json";
import faq_ko from "./translations/ko/faq.json";
import nav_ko from "./translations/ko/nav.json"

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
            homePage: homePage_en,
            faq: faq_en,
            nav: nav_en           
            //the key to call the json is infoPage:dailyDistraction.title
        },
        zh: {
            infoPage: infoPage_zh,
            homePage: homePage_zh,
            faq: faq_zh,    
            nav: nav_zh 
        },
        ko: {
          infoPage: infoPage_ko,
          homePage: homePage_ko,
          faq: faq_ko,  
          nav: nav_ko   
        },        
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;