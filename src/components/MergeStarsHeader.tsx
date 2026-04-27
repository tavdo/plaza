import { Link, NavLink } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { t } from '../lib/i18n'
import clsx from 'clsx'

const nav = [
  { to: '/', label: 'nav.home' as const },
  { to: '/register', label: 'nav.register' as const },
  { to: '/terms', label: 'nav.terms' as const },
  { to: '/application', label: 'nav.application' as const },
  { to: '/summary', label: 'nav.summary' as const },
  { to: '/dashboard', label: 'nav.dashboard' as const },
]

export function MergeStarsHeader() {
  const theme = useAppStore((s) => s.theme)
  const language = useAppStore((s) => s.language)
  const setTheme = useAppStore((s) => s.setTheme)
  const setLanguage = useAppStore((s) => s.setLanguage)
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-void-900/80 backdrop-blur-md light:border-zinc-200/80 light:bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-100 light:text-zinc-900">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-600 text-void-900 shadow shadow-amber-500/20"
            aria-hidden
          >
            ★
          </span>
          <span className="hidden sm:inline">MERGE STARS</span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-lg px-2.5 py-1.5 text-xs font-medium sm:text-sm',
                  isActive
                    ? 'bg-white/5 text-amber-300 light:bg-amber-100 light:text-amber-900'
                    : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900',
                )
              }
            >
              {t(item.label, language)}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="lang">
            {t('ui.language', language)}
          </label>
          <select
            id="lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
            className="ms-input max-w-[5.5rem] py-1.5 text-xs"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 light:border-zinc-200 light:bg-zinc-100 light:text-zinc-800"
            aria-pressed={theme === 'light'}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  )
}
