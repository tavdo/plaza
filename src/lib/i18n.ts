type Lang = 'en' | 'es'

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
  es: {
    'nav.home': 'Inicio',
    'nav.register': 'Registro',
    'nav.terms': 'Términos',
    'nav.application': 'Solicitud',
    'nav.summary': 'Resumen',
    'nav.dashboard': 'Panel',
    'ui.continue': 'Continuar',
    'ui.back': 'Atrás',
    'ui.submit': 'Enviar solicitud',
    'ui.loading': 'Espere…',
    'ui.language': 'Idioma',
  },
}

export function t(
  key: Key,
  lang: Lang
): string {
  return dict[lang][key] ?? dict.en[key] ?? key
}

export type { Lang, Key }
export { dict }
