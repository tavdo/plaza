import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'
import { isAgreementComplete } from '../stores/useAppStore'

export function LandingPage() {
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const application = useAppStore((s) => s.application)

  const dashboardTo =
    user && isAgreementComplete(agreement) && application
      ? '/dashboard'
      : user && isAgreementComplete(agreement)
        ? '/application'
        : user
          ? '/terms'
          : '/register'

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
            MERGE STARS
          </p>
          <motion.h1
            className="mt-4 text-4xl font-semibold leading-tight text-zinc-100 light:text-zinc-900 sm:text-5xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            The next era of luxury fintech, simulated end-to-end in your browser.
          </motion.h1>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-zinc-400 light:text-zinc-600">
            Onboard, accept partner disclosures, request a brand coin, review your mock invoice, and
            track status on a live timeline. No server required: persistence uses local storage with
            realistic delays and toasts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={user ? dashboardTo : '/register'}
              className="ms-btn-gold inline-flex items-center justify-center rounded-xl px-8 py-3 text-sm"
            >
              {user ? 'Open dashboard' : 'Get started'}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 light:border-zinc-300 light:bg-white light:text-zinc-800"
            >
              Register
            </Link>
          </div>
        </div>
        <motion.div
          className="relative flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.45 }}
        >
          <div className="relative h-64 w-64 sm:h-80 sm:w-80">
            <div className="absolute inset-0 rounded-full border border-amber-500/20 shadow-[0_0_80px_rgb(212_175_55_/_0.25)]" />
            <motion.div
              className="absolute inset-4 flex items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-b from-void-800 to-void-900 light:from-amber-50 light:to-zinc-100"
              animate={{ rotate: 360 }}
              transition={{ duration: 48, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              <span className="text-6xl text-amber-400 drop-shadow-md sm:text-7xl" aria-hidden>
                ★
              </span>
            </motion.div>
            <motion.div
              className="absolute -inset-2 rounded-full border border-dashed border-amber-500/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
