import { useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore, isAgreementComplete } from '../stores/useAppStore'
import type { ApplicationStatus } from '../types'
import { PageFade } from '../components/AnimatedLayout'
import { useHydration } from '../hooks/useHydration'

const steps: { key: ApplicationStatus; label: string }[] = [
  { key: 'pending_review', label: 'Pending' },
  { key: 'under_review', label: 'Under review' },
  { key: 'sent_to_crystal', label: 'Sent to Crystal' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

function indexOfStatus(s: ApplicationStatus) {
  return steps.findIndex((x) => x.key === s)
}

const badge: Record<ApplicationStatus, string> = {
  pending_review: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  under_review: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  sent_to_crystal: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
  approved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-red-500/40 bg-red-500/10 text-red-200',
}

export function DashboardPage() {
  const ready = useHydration()
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const app = useAppStore((s) => s.application)
  const markSimulationStarted = useAppStore((s) => s.markSimulationStarted)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const a0 = useAppStore.getState().application
    if (!a0 || a0.id !== app?.id || a0.simulationStarted) {
      return
    }

    const t1 = window.setTimeout(() => {
      const base = useAppStore.getState().application
      if (!base) return
      const at = new Date().toISOString()
      const next: ApplicationStatus = 'under_review'
      useAppStore.getState().updateApplication({
        status: next,
        statusHistory: [
          ...base.statusHistory,
          { at, status: next, label: 'Application under review' },
        ],
      })
      toast.info('Status update: under review by MERGE STARS.')
    }, 3500)

    const t2 = window.setTimeout(() => {
      const base = useAppStore.getState().application
      if (!base) return
      const at = new Date().toISOString()
      const next: ApplicationStatus = 'sent_to_crystal'
      useAppStore.getState().updateApplication({
        status: next,
        statusHistory: [
          ...base.statusHistory,
          { at, status: next, label: 'Packet sent to financial partner' },
        ],
      })
      toast.message('Application sent to Crystal', {
        description: 'Partner is evaluating the request (simulated).',
      })
    }, 10000)

    const t3 = window.setTimeout(() => {
      const base = useAppStore.getState().application
      if (!base) return
      const at = new Date().toISOString()
      const next: ApplicationStatus = 'approved'
      useAppStore.getState().updateApplication({
        status: next,
        statusHistory: [
          ...base.statusHistory,
          { at, status: next, label: 'Funding approved' },
        ],
      })
      markSimulationStarted()
      toast.success('Partner approved the application (simulation).')
    }, 18000)

    timers.current = [t1, t2, t3]
    return () => {
      for (const id of timers.current) window.clearTimeout(id)
    }
  }, [app?.id, app?.simulationStarted, markSimulationStarted])

  if (!ready) {
    return null
  }
  if (!user) {
    return <Navigate to="/register" replace />
  }
  if (!isAgreementComplete(agreement)) {
    return <Navigate to="/terms" replace />
  }
  if (!app) {
    return <Navigate to="/application" replace />
  }

  const activeIndex = indexOfStatus(app.status) >= 0 ? indexOfStatus(app.status) : 0
  const progress = ((activeIndex + 1) / steps.length) * 100

  return (
    <PageFade>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="ms-glass ms-bg-animated rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100 light:text-zinc-900">
                Application status
              </h1>
              <p className="text-sm text-zinc-500">
                Application <span className="font-mono text-amber-200/80">{app.id}</span>
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${badge[app.status]}`}
            >
              {steps.find((s) => s.key === app.status)?.label ?? app.status}
            </span>
          </div>

          <div className="mt-8">
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-void-950 light:bg-zinc-200">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-300 to-amber-600"
                initial={false}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ type: 'spring', stiffness: 60, damping: 20 }}
              />
            </div>
            <ol className="mt-4 flex flex-col gap-3 sm:grid sm:grid-cols-5 sm:gap-1">
              {steps.map((s, i) => {
                const done = i <= activeIndex
                return (
                  <li
                    key={s.key}
                    className="flex items-center gap-2 sm:flex-col sm:items-stretch"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full sm:mx-auto ${
                        done ? 'bg-amber-400' : 'bg-zinc-600'
                      }`}
                    />
                    <span
                      className={`text-xs sm:text-center ${
                        done ? 'text-amber-100' : 'text-zinc-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="mt-10">
            <h2 className="text-sm font-medium text-zinc-400">Status history</h2>
            <ul className="mt-2 divide-y divide-white/5 light:divide-zinc-200/80">
              <AnimatePresence>
                {[...app.statusHistory].reverse().map((h) => (
                  <motion.li
                    key={h.at + h.status}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-xs text-zinc-500">
                      {new Date(h.at).toLocaleString()}
                    </span>
                    <span className="text-sm text-zinc-200 light:text-zinc-800">
                      {h.label}
                    </span>
                    <span className="text-xs font-mono text-amber-200/60">{h.status}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            Timed updates are simulated: ~3.5s review, then partner handoff, then approval. Reloading
            the page rehydrates from local storage; the simulation only runs once per application.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/summary"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 light:border-zinc-300 light:text-zinc-800"
            >
              View mock invoice
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </PageFade>
  )
}
