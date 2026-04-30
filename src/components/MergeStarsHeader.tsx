import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import type { Key, Lang } from '../lib/i18n'
import { useTranslation } from '../hooks/useTranslation'
import clsx from 'clsx'

const nav: { to: string; labelKey: Key }[] = [
  { to: '/', labelKey: 'header.home' },
  { to: '#collection', labelKey: 'header.collection' },
  { to: '#technology', labelKey: 'header.technology' },
  { to: '#products', labelKey: 'header.products' },
  { to: '#invest', labelKey: 'header.invest' },
  { to: '#partnership', labelKey: 'header.partnership' },
  { to: '#about', labelKey: 'header.about' },
]

export function MergeStarsHeader() {
  const { t } = useTranslation()
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const navigate = useNavigate()
  
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-void-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center text-3xl text-gold-500 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" aria-hidden>
            ★
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display text-lg font-bold leading-none tracking-widest text-zinc-100">
              MERGE
            </span>
            <span className="font-display text-sm font-medium leading-none tracking-[0.2em] text-zinc-400">
              STARS
            </span>
          </div>
        </Link>
        
        {/* Center Nav */}
        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {nav.map((item) => (
             item.to.startsWith('#') ? (
              <a
                key={item.labelKey}
                href={item.to}
                className="text-xs font-semibold tracking-wider text-zinc-400 transition hover:text-gold-400"
              >
                {t(item.labelKey)}
              </a>
             ) : (
              <NavLink
                key={item.labelKey}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'text-xs font-semibold tracking-wider transition',
                    isActive ? 'text-zinc-100 border-b border-gold-500 pb-1' : 'text-zinc-400 hover:text-gold-400'
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
             )
          ))}
        </nav>
        
        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Lang)}
              className="bg-transparent text-xs font-semibold tracking-wider text-zinc-200 outline-none cursor-pointer"
              aria-label={t('ui.language')}
            >
              <option value="en" className="bg-void-900">EN</option>
              <option value="ka" className="bg-void-900">KA</option>
            </select>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="ms-btn-gold rounded-full px-5 py-2 text-xs font-bold tracking-wider"
          >
            <span className="mr-2">🔒</span> {t('header.dashboard')}
          </button>
        </div>
        
      </div>
    </header>
  )
}
