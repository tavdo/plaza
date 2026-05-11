import { useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppStore, isAgreementComplete } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'
import { useHydration } from '../hooks/useHydration'
import { formatMoney, useTranslation } from '../hooks/useTranslation'
import { displayCoinType, translateApplicationStatus, type Key } from '../lib/i18n'
import { LANDING_METALS } from '../lib/markets'

const sidebarDefs: { id: string; labelKey: Key; icon: string; active?: boolean; badge?: number }[] = [
  { id: 'dashboard', labelKey: 'dash.sidebar.dashboard', icon: '⊞', active: true },
  { id: 'profile', labelKey: 'dash.sidebar.profile', icon: '👤' },
  { id: 'applications', labelKey: 'dash.sidebar.applications', icon: '📄' },
  { id: 'orders', labelKey: 'dash.sidebar.orders', icon: '📦' },
  { id: 'coins', labelKey: 'dash.sidebar.coins', icon: '🪙' },
  { id: 'investments', labelKey: 'dash.sidebar.investments', icon: '📈' },
  { id: 'messages', labelKey: 'dash.sidebar.messages', icon: '💬', badge: 2 },
  { id: 'support', labelKey: 'dash.sidebar.support', icon: '🎧' },
  { id: 'settings', labelKey: 'dash.sidebar.settings', icon: '⚙️' },
  { id: 'logout', labelKey: 'dash.sidebar.logout', icon: '🚪' },
]

export function DashboardPage() {
  const ready = useHydration()
  const { t, lang } = useTranslation()
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const app = useAppStore((s) => s.application)
  const navigate = useNavigate()

  useEffect(() => {
    void app
  }, [app])

  if (!ready) {
    return null
  }
  if (!user) {
    return <Navigate to="/register" replace />
  }
  if (!isAgreementComplete(agreement)) {
    return <Navigate to="/terms" replace />
  }

  const metals = LANDING_METALS

  const handleLogout = () => {
    useAppStore.getState().resetAll()
    navigate('/')
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">

        <div className="flex flex-col gap-6 lg:flex-row">

          <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-void-900/80 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:w-64">
            <div className="border-b border-white/5 p-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center text-3xl text-gold-500" aria-hidden>
                ★
              </div>
              <div className="font-display text-lg font-bold leading-none tracking-widest text-zinc-100">MERGE</div>
              <div className="font-display text-sm font-medium leading-none tracking-[0.2em] text-zinc-400">STARS</div>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              {sidebarDefs.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={link.id === 'logout' ? handleLogout : undefined}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-xs font-bold tracking-wider transition-colors ${link.active ? 'border border-gold-500/20 bg-gold-500/10 text-gold-400' : 'text-zinc-500 hover:bg-void-800 hover:text-zinc-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{link.icon}</span>
                    {t(link.labelKey)}
                  </div>
                  {link.badge !== undefined ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {link.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 space-y-6">

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div>
                <p className="text-xs tracking-wider text-zinc-500">{t('dash.welcome')}</p>
                <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-zinc-100">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="mt-1 font-mono text-xs tracking-wider text-gold-400">
                  {t('dash.mergeId')} {user.personalId}
                </p>
              </div>
              <div className="flex items-center gap-4">
                 <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-void-950 text-zinc-400 hover:text-gold-400">
                   🔔
                 </button>
                 <div className="h-10 w-10 overflow-hidden rounded-full border border-gold-500/30">
                   <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt={t('dash.profileAlt')} className="h-full w-full object-cover" />
                 </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500">{t('dash.card.balance')}</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-zinc-100">12,450</span>
                  <span className="mb-1 text-xs font-bold text-gold-400">MGS</span>
                </div>
                <button type="button" className="ms-btn-outline mt-6 w-full border-gold-500/30 py-2 text-xs hover:bg-gold-500/10 hover:text-gold-400">
                  {t('dash.card.viewCoin')}
                </button>
              </div>

              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500">{t('dash.card.appStatus')}</h3>
                {app ? (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                      {translateApplicationStatus(app.status, lang)}
                    </div>
                    <p className="mt-3 text-[10px] leading-relaxed text-zinc-400">
                      {t('dash.card.processing')}
                    </p>
                    <Link to="/summary" className="ms-btn-outline mt-4 w-full border-white/10 py-2 text-xs">
                      {t('dash.card.viewDetails')}
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-zinc-400">{t('dash.card.noApp')}</div>
                    <Link to="/application" className="ms-btn-gold mt-6 w-full py-2 text-xs">
                      {t('dash.card.startNew')}
                    </Link>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500">{t('dash.card.investments')}</h3>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-zinc-100">{formatMoney(24850, lang)}</span>
                  <span className="mt-1 text-xs font-bold text-emerald-400">+14.6%</span>
                </div>
                <div className="mt-6 h-10 w-full rounded bg-gradient-to-r from-void-950 to-void-800" />
              </div>

              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500">{t('dash.card.quickActions')}</h3>
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={() => navigate('/application')} className="ms-btn-gold w-full justify-start py-2.5 text-xs text-left">
                    <span className="mr-3">📄</span> {t('dash.action.newApp')}
                  </button>
                  <button type="button" className="flex w-full items-center justify-start rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-xs font-bold text-zinc-300 hover:border-gold-500/30 hover:text-gold-400">
                    <span className="mr-3">📈</span> {t('dash.action.invest')}
                  </button>
                  <button type="button" className="flex w-full items-center justify-start rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-xs font-bold text-zinc-300 hover:border-gold-500/30 hover:text-gold-400">
                    <span className="mr-3">🛒</span> {t('dash.action.browse')}
                  </button>
                </div>
              </div>
            </div>

            {app?.aiPreview ? (
              <div className="flex flex-col gap-6 rounded-2xl border border-gold-500/25 bg-gradient-to-br from-gold-500/10 via-void-900/95 to-void-900 p-6 shadow-[0_0_40px_rgba(212,175,55,0.1)] backdrop-blur-xl sm:flex-row sm:items-start">
                {app.aiPreview.conceptImageUrl ? (
                  <div className="shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg sm:w-44">
                    <img
                      src={app.aiPreview.conceptImageUrl}
                      alt=""
                      className="aspect-square w-full object-cover object-center sm:h-36 sm:w-36"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold tracking-[0.2em] text-gold-400/95">{t('dash.embedAi.title')}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{app.aiPreview.prompt}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    {t(`app.ai.material.${app.aiPreview.coinTypeMetal}` as Key)} · {displayCoinType(app.coinType, lang)} ·{' '}
                    {app.aiPreview.polygonCount.toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-US')} {t('app.ai.polyShort')}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-3">

              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:col-span-2">
                <h3 className="mb-6 text-xs font-bold tracking-widest text-zinc-500">{t('dash.coin.title')}</h3>

                {app ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-void-950/50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/30 bg-void-900 text-xl text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                        🪙
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                          {displayCoinType(app.coinType, lang)}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-4 text-[10px] text-zinc-500">
                          <span>{t('dash.coin.qty')} {app.amount}</span>
                          <span>{t('dash.coin.purityLabel')} {t('app.label.purityPct')}</span>
                          <span>{t('dash.coin.statusLabel')} <span className="text-gold-400">{t('dash.coin.inProduction')}</span></span>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="ms-btn-outline border-gold-500/30 px-6 py-2 text-xs">
                      {t('dash.card.viewCoin')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-xs text-zinc-500">
                    {t('dash.coin.empty')}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-6 text-xs font-bold tracking-widest text-zinc-500">{t('dash.metals.title')}</h3>
                <div className="space-y-4">
                  {metals.map((metal, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-void-950/40 p-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${metal.up ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="text-xs font-bold text-zinc-300">{t(metal.key)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-zinc-100">
                          {metal.price} <span className="text-[10px] font-normal text-zinc-500">{t('dash.metal.perg')}</span>
                        </div>
                        <div className={`text-[10px] font-bold ${metal.up ? 'text-emerald-400' : 'text-red-400'}`}>
                          {metal.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </PageFade>
  )
}
