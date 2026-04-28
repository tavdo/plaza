import { useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore, isAgreementComplete } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'
import { useHydration } from '../hooks/useHydration'

const sidebarLinks = [
  { id: 'dashboard', label: 'DASHBOARD', icon: '⊞', active: true },
  { id: 'profile', label: 'MY PROFILE', icon: '👤', active: false },
  { id: 'applications', label: 'MY APPLICATIONS', icon: '📄', active: false },
  { id: 'orders', label: 'MY ORDERS', icon: '📦', active: false },
  { id: 'coins', label: 'MY COINS', icon: '🪙', active: false },
  { id: 'investments', label: 'MY INVESTMENTS', icon: '📈', active: false },
  { id: 'messages', label: 'MESSAGES', icon: '💬', badge: 2, active: false },
  { id: 'support', label: 'SUPPORT', icon: '🎧', active: false },
  { id: 'settings', label: 'SETTINGS', icon: '⚙️', active: false },
  { id: 'logout', label: 'LOGOUT', icon: '🚪', active: false },
]

export function DashboardPage() {
  const ready = useHydration()
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const app = useAppStore((s) => s.application)
  const navigate = useNavigate()

  useEffect(() => {
    // If we have an app, it will trigger the simulation logic in useAppStore or we can just leave it as is.
    // The simulation logic from the original dashboard is now moved to the summary page (Application Status).
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

  const handleLogout = () => {
    useAppStore.getState().logout()
    navigate('/')
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        
        <div className="flex flex-col gap-6 lg:flex-row">
          
          {/* SIDEBAR */}
          <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-void-900/80 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:w-64">
            <div className="p-6 text-center border-b border-white/5">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center text-3xl text-gold-500" aria-hidden>★</div>
              <div className="font-display text-lg font-bold leading-none tracking-widest text-zinc-100">MERGE</div>
              <div className="font-display text-sm font-medium leading-none tracking-[0.2em] text-zinc-400">STARS</div>
            </div>
            
            <nav className="flex flex-col gap-1 p-4">
              {sidebarLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={link.id === 'logout' ? handleLogout : undefined}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-xs font-bold tracking-wider transition-colors ${link.active ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-zinc-500 hover:bg-void-800 hover:text-zinc-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                  </div>
                  {link.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {link.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 space-y-6">
            
            {/* Header / Welcome */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div>
                <p className="text-xs tracking-wider text-zinc-500">Welcome back,</p>
                <h1 className="font-display text-2xl font-bold tracking-widest text-zinc-100 uppercase">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="mt-1 text-xs font-mono tracking-wider text-gold-400">YOUR MERGE ID: {user.personalId}</p>
              </div>
              <div className="flex items-center gap-4">
                 <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-void-950 text-zinc-400 hover:text-gold-400">
                   🔔
                 </button>
                 <div className="h-10 w-10 overflow-hidden rounded-full border border-gold-500/30">
                   <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="h-full w-full object-cover" />
                 </div>
              </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {/* MERGE COIN BALANCE */}
              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500">MERGE COIN BALANCE</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-zinc-100">12,450</span>
                  <span className="mb-1 text-xs font-bold text-gold-400">MGS</span>
                </div>
                <button className="ms-btn-outline mt-6 w-full border-gold-500/30 py-2 text-xs hover:bg-gold-500/10 hover:text-gold-400">
                  VIEW COIN
                </button>
              </div>

              {/* APPLICATION STATUS */}
              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500">APPLICATION STATUS</h3>
                {app ? (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 uppercase">
                      {app.status.replace('_', ' ')}
                    </div>
                    <p className="mt-3 text-[10px] leading-relaxed text-zinc-400">
                      Your application is currently being processed.
                    </p>
                    <Link to="/summary" className="ms-btn-outline mt-4 w-full border-white/10 py-2 text-xs">
                      VIEW DETAILS
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-zinc-400">No active application</div>
                    <Link to="/application" className="ms-btn-gold mt-6 w-full py-2 text-xs">
                      START NEW
                    </Link>
                  </>
                )}
              </div>

              {/* TOTAL INVESTMENTS */}
              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500">TOTAL INVESTMENTS</h3>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-zinc-100">$ 24,850 <span className="text-sm text-zinc-500">.00</span></span>
                  <span className="mt-1 text-xs font-bold text-emerald-400">+14.6%</span>
                </div>
                {/* Mini chart placeholder */}
                <div className="mt-6 h-10 w-full rounded bg-gradient-to-r from-void-950 to-void-800" />
              </div>

              {/* QUICK ACTIONS */}
              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500">QUICK ACTIONS</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={() => navigate('/application')} className="ms-btn-gold w-full justify-start py-2.5 text-xs text-left">
                    <span className="mr-3">📄</span> NEW APPLICATION
                  </button>
                  <button className="flex w-full items-center justify-start rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-xs font-bold text-zinc-300 hover:border-gold-500/30 hover:text-gold-400">
                    <span className="mr-3">📈</span> INVEST NOW
                  </button>
                  <button className="flex w-full items-center justify-start rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-xs font-bold text-zinc-300 hover:border-gold-500/30 hover:text-gold-400">
                    <span className="mr-3">🛒</span> BROWSE PRODUCTS
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              
              {/* MY MERGE COIN (List) */}
              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:col-span-2">
                <h3 className="mb-6 text-xs font-bold tracking-widest text-zinc-500">MY MERGE COIN</h3>
                
                {app ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-void-950/50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/30 bg-void-900 text-xl text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                        🪙
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-wider text-zinc-200 uppercase">{app.coinType}</h4>
                        <div className="mt-1 flex gap-4 text-[10px] text-zinc-500">
                          <span>Quantity: {app.amount}</span>
                          <span>Purity: 99.9%</span>
                          <span>Status: <span className="text-gold-400">In Production</span></span>
                        </div>
                      </div>
                    </div>
                    <button className="ms-btn-outline border-gold-500/30 px-6 py-2 text-xs">
                      VIEW COIN
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-xs text-zinc-500">
                    No coins found. Start an application first.
                  </div>
                )}
              </div>

              {/* LIVE METAL PRICES */}
              <div className="rounded-2xl border border-white/5 bg-void-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <h3 className="mb-6 text-xs font-bold tracking-widest text-zinc-500">LIVE METAL PRICES</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Silver (Ag)', price: '$ 0.897', unit: '/g', change: '+1.23%', up: true },
                    { name: 'Gold (Au)', price: '$ 67.42', unit: '/g', change: '+0.85%', up: true },
                    { name: 'Platinum', price: '$ 32.15', unit: '/g', change: '-0.42%', up: false },
                  ].map((metal, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-void-950/40 p-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${metal.up ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="text-xs font-bold text-zinc-300">{metal.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-zinc-100">
                          {metal.price} <span className="text-[10px] font-normal text-zinc-500">{metal.unit}</span>
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
