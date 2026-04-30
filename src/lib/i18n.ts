type Lang = 'en' | 'ka'

type Key =
  | 'nav.home'
  | 'nav.register'
  | 'nav.terms'
  | 'nav.application'
  | 'nav.summary'
  | 'nav.dashboard'
  | 'ui.continue'
  | 'ui.back'
  | 'ui.submit'
  | 'ui.loading'
  | 'ui.language'

const dict: Record<Lang, Record<Key, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.register': 'Register',
    'nav.terms': 'Terms',
    'nav.application': 'Application',
    'nav.summary': 'Summary',
    'nav.dashboard': 'Dashboard',
    'ui.continue': 'Continue',
    'ui.back': 'Back',
    'ui.submit': 'Submit application',
    'ui.loading': 'Please wait…',
    'ui.language': 'Language',
  },
  ka: {
    'nav.home': 'მთავარი',
    'nav.register': 'რეგისტრაცია',
    'nav.terms': 'წესები',
    'nav.application': 'განაცხადი',
    'nav.summary': 'შეჯამება',
    'nav.dashboard': 'დაფა',
    'ui.continue': 'გაგრძელება',
    'ui.back': 'უკან',
    'ui.submit': 'განაცხადის გაგზავნა',
    'ui.loading': 'გთხოვთ დაელოდოთ…',
    'ui.language': 'ენა',
  },
}

export function t(key: Key, lang: Lang): string {
  const row = dict[lang]
  return row[key] ?? dict.en[key] ?? key
}

export type { Lang, Key }
export { dict }
