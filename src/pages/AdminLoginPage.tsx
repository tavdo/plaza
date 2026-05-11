import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore, isAdminSessionValid } from '../stores/useAppStore'
import { useHydration } from '../hooks/useHydration'
import { useTranslation } from '../hooks/useTranslation'
import { validateAdminLogin } from '../lib/adminCredentials'
import type { Lang } from '../lib/i18n'

function langLabel(lang: Lang) {
  return lang === 'ka' ? 'KA' : 'EN'
}

export function AdminLoginPage() {
  const ready = useHydration()
  const { t, lang } = useTranslation()
  const session = useAppStore((s) => s.adminSession)
  const adminLogin = useAppStore((s) => s.adminLogin)
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (ready && isAdminSessionValid(session)) {
    return <Navigate to="/admin" replace />
  }

  if (!ready) {
    return null
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const role = validateAdminLogin(email, password)
    if (!role) {
      toast.error(t('admin.err.creds'))
      return
    }
    adminLogin(role)
    toast.success(t('admin.toast.entered'))
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gold-500/[0.08] via-transparent to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-[1] w-full max-w-md rounded-2xl border border-gold-500/25 bg-void-950/90 p-8 shadow-[0_0_60px_rgba(212,175,55,0.12)] backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-3xl text-gold-500" aria-hidden>
            ◆
          </div>
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-gold-500/90">{t('admin.login.kicker')}</p>
          <h1 className="mt-3 font-display text-xl font-bold uppercase tracking-widest text-zinc-100">{t('admin.login.title')}</h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">{t('admin.login.sub')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t('admin.login.email')}</label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ms-input w-full"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t('admin.login.password')}</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ms-input w-full"
              required
            />
          </div>
          <button type="submit" className="ms-btn-gold w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em]">
            {t('admin.login.cta')}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 text-[10px] text-zinc-600">
          <Link to="/" className="text-gold-500/80 transition hover:text-gold-400">
            {t('admin.login.backPublic')}
          </Link>
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wider">{t('ui.language')}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Lang)}
              className="rounded border border-white/10 bg-void-900 px-2 py-1 text-xs text-zinc-200 outline-none"
              aria-label={t('ui.language')}
            >
              <option value="en">EN</option>
              <option value="ka">KA</option>
            </select>
            <span className="text-zinc-500">{langLabel(lang)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
