import { createI18n } from 'vue-i18n'
import messages from './messages'

export const supportedLocales = ['en', 'id'] as const
export type SupportedLocale = (typeof supportedLocales)[number]
export const defaultLocale: SupportedLocale = 'en'
const STORAGE_KEY = 'ttm_locale'

const getBrowserLocale = (): SupportedLocale | null => {
  if (typeof navigator === 'undefined') return null
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  return supportedLocales.includes(lang as SupportedLocale) ? (lang as SupportedLocale) : null
}

export const getStoredLocale = (): SupportedLocale | null => {
  if (typeof localStorage === 'undefined') return null
  const value = localStorage.getItem(STORAGE_KEY)
  return supportedLocales.includes(value as SupportedLocale) ? (value as SupportedLocale) : null
}

export const setStoredLocale = (locale: SupportedLocale) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, locale)
}

export const detectLocale = (): SupportedLocale => {
  return getStoredLocale() ?? getBrowserLocale() ?? defaultLocale
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: defaultLocale,
  messages,
})

export default i18n
