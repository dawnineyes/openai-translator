import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

import ENtranslation from './i18n/locales/en/translation.json'
import JAtranslation from './i18n/locales/ja/translation.json'
import zhHanstranslation from './i18n/locales/zh-Hans/translation.json'
import zhHanttranslation from './i18n/locales/zh-Hant/translation.json'

const resources = {
    'zh-Hans': {
        translation: zhHanstranslation,
    },
    'zh-Hant': {
        translation: zhHanttranslation,
    },
    'en': {
        translation: ENtranslation,
    },
    'ja': {
        translation: JAtranslation,
    },
}

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: true,

        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
