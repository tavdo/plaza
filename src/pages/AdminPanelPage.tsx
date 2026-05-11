import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ApplicationStatus, BrandCoinApplication } from '../types'
import { useAppStore, isAdminSessionValid } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'
import { useTranslation, formatMoney } from '../hooks/useTranslation'
import { displayCoinType, translateApplicationStatus, type Key, type Lang } from '../lib/i18n'

const ALL_STATUSES: ApplicationStatus[] = [
  'pending_review',
  'under_review',
  'sent_to_crystal',
  'approved',
  'rejected',
]

function managerMaySelectStatus(s: ApplicationStatus): boolean {
  return s !== 'approved' && s !== 'rejected'
}

export function AdminPanelPage() {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const session = useAppStore((s) => s.adminSession)
  const adminLogout = useAppStore((s) => s.adminLogout)
  const applications = useAppStore((s) => s.adminApplicationLedger)
  const clients = useAppStore((s) => s.adminUserLedger)
  const setAdminApplicationStatus = useAppStore((s) => s.setAdminApplicationStatus)

  const [tab, setTab] = useState<'overview' | 'applications' | 'clients'>('overview')

  const role = isAdminSessionValid(session) ? session.role : null

  const stats = useMemo(() => {
    const pending = applications.filter((a) => a.status === 'pending_review').length
    const volume = applications.reduce((s, a) => s + a.totalAmount, 0)
    return {
      clients: clients.length,
      applications: applications.length,
      pending,
      volume,
    }
  }, [applications, clients])

  if (!role) {
    return null
  }

  const logout = () => {
    adminLogout()
    void navigate('/admin/login', { replace: true })
  }

  const pill = (active: boolean) =>
    `rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition ${active ? 'border border-gold-500/35 bg-gold-500/15 text-gold-300' : 'border border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`

  return (
    <PageFade>
      <div className="min-h-dvh bg-gradient-to-b from-void-950 via-void-900 to-black px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div>
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-gold-500/90">{t('admin.panel.kicker')}</p>
              <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-widest text-zinc-100">{t('admin.panel.title')}</h1>
              <p className="mt-2 max-w-xl text-xs text-zinc-500">{t('admin.panel.sub')}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
                {t('admin.panel.role')}: {role === 'owner' ? t('admin.role.owner') : t('admin.role.manager')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void navigate('/')} className="rounded-full border border-white/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 transition hover:border-white/25 hover:text-zinc-200">
                {t('admin.panel.publicSite')}
              </button>
              <button type="button" onClick={logout} className="ms-btn-outline border-red-500/30 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-300 hover:border-red-400/50 hover:bg-red-500/10">
                {t('admin.panel.logout')}
              </button>
            </div>
          </header>

          <div className="mb-8 flex flex-wrap gap-2">
            {(
              [
                ['overview', 'admin.tab.overview'],
                ['applications', 'admin.tab.applications'],
                ['clients', 'admin.tab.clients'],
              ] as const
            ).map(([id, key]) => (
              <button key={id} type="button" className={pill(tab === id)} onClick={() => setTab(id)}>
                {t(key)}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { k: 'admin.stat.clients', v: stats.clients },
                { k: 'admin.stat.apps', v: stats.applications },
                { k: 'admin.stat.pending', v: stats.pending },
                { k: 'admin.stat.volume', v: formatMoney(stats.volume, lang), money: true },
              ].map((card) => (
                <motion.div
                  key={card.k}
                  layout
                  className="rounded-2xl border border-white/5 bg-void-900/75 p-6 shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t(card.k as Key)}</p>
                  <p className={`mt-4 font-display text-3xl font-bold tracking-tight ${card.money ? 'text-gold-200' : 'text-zinc-100'}`}>{card.v}</p>
                </motion.div>
              ))}
              <div className="sm:col-span-2 xl:col-span-4 rounded-2xl border border-gold-500/15 bg-black/35 p-6 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400/95">{t('admin.disclaimer.title')}</p>
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t('admin.disclaimer.body')}</p>
              </div>
            </div>
          )}

          {tab === 'applications' && (
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-void-900/70 shadow-inner backdrop-blur-xl">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3">{t('admin.col.id')}</th>
                    <th className="px-4 py-3">{t('admin.col.client')}</th>
                    <th className="px-4 py-3">{t('admin.col.coin')}</th>
                    <th className="px-4 py-3">{t('admin.col.qty')}</th>
                    <th className="px-4 py-3">{t('admin.col.total')}</th>
                    <th className="px-4 py-3">{t('admin.col.status')}</th>
                    <th className="px-4 py-3">{t('admin.col.ai')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-xs text-zinc-500">
                        {t('admin.empty.apps')}
                      </td>
                    </tr>
                  ) : (
                    applications.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 text-zinc-300 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono text-[11px] text-gold-200/90">{row.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-100">{row.ownerName}</div>
                          <div className="text-[10px] text-zinc-500">{row.contactPhone}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">{displayCoinType(row.coinType, lang)}</td>
                        <td className="px-4 py-3">{row.amount}</td>
                        <td className="px-4 py-3 text-gold-200/90">{formatMoney(row.totalAmount, lang)}</td>
                        <td className="px-4 py-3">
                          <StatusSelect
                            row={row}
                            role={role}
                            lang={lang}
                            onChange={(next) => {
                              const label = translateApplicationStatus(next, lang)
                              setAdminApplicationStatus(row.id, next, label)
                            }}
                            ariaStatus={t('admin.col.status')}
                          />
                        </td>
                        <td className="px-4 py-3 text-[10px] text-zinc-500">{row.aiPreview?.conceptImageUrl ? t('admin.badge.aiYes') : t('admin.badge.aiNo')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'clients' && (
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-void-900/70 backdrop-blur-xl">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3">{t('admin.col.userId')}</th>
                    <th className="px-4 py-3">{t('admin.col.name')}</th>
                    <th className="px-4 py-3">{t('admin.col.email')}</th>
                    <th className="px-4 py-3">{t('admin.col.phone')}</th>
                    <th className="px-4 py-3">{t('admin.col.joined')}</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-xs text-zinc-500">
                        {t('admin.empty.clients')}
                      </td>
                    </tr>
                  ) : (
                    clients.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 text-zinc-300 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono text-[11px] text-gold-200/90">{u.id}</td>
                        <td className="px-4 py-3">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="px-4 py-3 text-xs">{u.email}</td>
                        <td className="px-4 py-3 text-xs">{u.phone}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-500">{new Date(u.createdAt).toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-US')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageFade>
  )
}

function StatusSelect({
  row,
  role,
  lang,
  onChange,
  ariaStatus,
}: {
  row: BrandCoinApplication
  role: 'owner' | 'manager'
  lang: Lang
  onChange: (s: ApplicationStatus) => void
  ariaStatus: string
}) {
  return (
    <select
      value={row.status}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className="max-w-[11rem] rounded-lg border border-white/10 bg-void-950 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-200 outline-none focus:border-gold-500/40"
      aria-label={ariaStatus}
    >
      {ALL_STATUSES.map((s) => {
        const mayPick = role === 'owner' || managerMaySelectStatus(s)
        return (
          <option key={s} value={s} disabled={!mayPick && s !== row.status}>
            {translateApplicationStatus(s, lang)}
          </option>
        )
      })}
    </select>
  )
}
