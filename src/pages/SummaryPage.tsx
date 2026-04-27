import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore, isAgreementComplete } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'
import { useHydration } from '../hooks/useHydration'

const fmt = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

export function SummaryPage() {
  const ready = useHydration()
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const app = useAppStore((s) => s.application)

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

  const requested = Math.round(app.amount * 120 * 100) / 100

  return (
    <PageFade>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="ms-glass ms-bg-animated rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100 light:text-zinc-900">
                Application summary
              </h1>
              <p className="mt-1 text-sm text-zinc-500">Reference your application ID in support requests.</p>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
              Pending review
            </span>
          </div>

          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">Application ID</dt>
              <dd className="font-mono text-amber-200/90">{app.id}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">User ID</dt>
              <dd className="font-mono text-zinc-300 light:text-zinc-800">{app.userId}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">Coin</dt>
              <dd>{app.coinType}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">Quantity</dt>
              <dd>{app.amount}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">Owner</dt>
              <dd>{app.ownerName}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">Delivery</dt>
              <dd className="text-right">
                {app.deliveryLine1}, {app.deliveryCity} {app.deliveryPostal}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Contact</dt>
              <dd>{app.contactPhone}</dd>
            </div>
            {app.additionalInfo ? (
              <div className="pt-2">
                <dt className="text-zinc-500">Notes</dt>
                <dd className="mt-1 rounded-lg border border-white/5 bg-void-950/60 p-3 text-zinc-300 light:border-zinc-200 light:bg-zinc-50 light:text-zinc-800">
                  {app.additionalInfo}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-void-950/50 p-4 light:border-amber-200 light:bg-amber-50/60">
            <h2 className="text-sm font-semibold text-amber-200/90 light:text-amber-900">
              Mock invoice
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Requested (metal value, mock)</span>
                <span>{fmt(requested)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Service fee</span>
                <span>{fmt(app.serviceFee)}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-base font-semibold light:border-amber-200/80">
                <span>Total</span>
                <span>{fmt(app.totalAmount)}</span>
              </div>
            </div>
          </div>

          <motion.div className="mt-8" whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
            <Link
              to="/dashboard"
              className="ms-btn-gold inline-flex w-full items-center justify-center rounded-xl py-3 text-center"
            >
              Open status dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    </PageFade>
  )
}
