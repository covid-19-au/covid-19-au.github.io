import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import translation files
import infoPage_en from "./translations/en/infoPage.json";
import homePage_en from "./translations/en/homePage.json";
import faq_en from "./translations/en/faq.json";
import nav_en from "./translations/en/nav.json";

import infoPage_zh from "./translations/zh/infoPage.json";
import homePage_zh from "./translations/zh/homePage.json";
import faq_zh from "./translations/zh/faq.json";
import nav_zh from "./translations/zh/nav.json";

import infoPage_tw from "./translations/zh-tw/infoPage.json";
import homePage_tw from "./translations/zh-tw/homePage.json";
import faq_tw from "./translations/zh-tw/faq.json";
import nav_tw from "./translations/zh-tw/nav.json";

import infoPage_ko from "./translations/ko/infoPage.json";
import homePage_ko from "./translations/ko/homePage.json";
import faq_ko from "./translations/ko/faq.json";
import nav_ko from "./translations/ko/nav.json";

import infoPage_ja from "./translations/ja/infoPage.json";
import homePage_ja from "./translations/ja/homePage.json";
import faq_ja from "./translations/ja/faq.json";
import nav_ja from "./translations/ja/nav.json";

import infoPage_es from "./translations/es/infoPage.json";
import homePage_es from "./translations/es/homePage.json";
import faq_es from "./translations/es/faq.json";
import nav_es from "./translations/es/nav.json";

import infoPage_vi from "./translations/vi/infoPage.json";
import homePage_vi from "./translations/vi/homePage.json";
import faq_vi from "./translations/vi/faq.json";
import nav_vi from "./translations/vi/nav.json";

const allowedLanguages = ['en','ko','zh','tw','ja','es','vi'];

const defaultLng = 'en';
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
        tw: {
          infoPage: infoPage_tw,
          homePage: homePage_tw,
          faq: faq_tw,    
          nav: nav_tw 
        },
        ko: {
          infoPage: infoPage_ko,
          homePage: homePage_ko,
          faq: faq_ko,  
          nav: nav_ko   
        },
        ja: {
          infoPage: infoPage_ja,
          homePage: homePage_ja,
          faq: faq_ja,  
          nav: nav_ja   
        }, 
        es: {
          infoPage: infoPage_es,
          homePage: homePage_es,
          faq: faq_es,  
          nav: nav_es   
        }, 
        vi: {
          infoPage: infoPage_vi,
          homePage: homePage_vi,
          faq: faq_vi,  
          nav: nav_vi   
        },         
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;