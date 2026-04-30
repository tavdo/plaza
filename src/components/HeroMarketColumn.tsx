import { motion } from 'framer-motion'
import { useTranslation } from '../hooks/useTranslation'
import { useUsdGelRate } from '../hooks/useUsdGelRate'
import { LANDING_METALS } from '../lib/markets'

/** Hero right column: USD/GEL course + compact metal prices (replaces feature cards). */
export function HeroMarketColumn() {
  const { t, lang } = useTranslation()
  const usdToGel = useUsdGelRate()

  const locale = lang === 'ka' ? 'ka-GE' : 'en-US'
  const formattedRate =
    usdToGel === null
      ? null
      : usdToGel.toLocaleString(locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 })

  return (
    <div id="markets" className="flex w-full max-w-md flex-col justify-center gap-4 lg:max-w-none lg:mx-0">
      <motion.div
        className="ms-glass rounded-xl border border-white/5 p-5 hover:border-gold-500/25"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xs font-bold tracking-widest text-zinc-300">{t('land.usd.title')}</h3>
            <p className="mt-1 text-[10px] leading-snug text-zinc-500">{t('land.usd.subtitle')}</p>
          </div>
          <span className="text-xl text-gold-400/90" aria-hidden>
            $
          </span>
        </div>
        <div className="mt-4 rounded-lg border border-gold-500/15 bg-void-950/50 px-4 py-3">
          {formattedRate === null ? (
            <p className="text-xs text-zinc-500">{t('land.usd.loading')}</p>
          ) : (
            <>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{t('land.usd.perUsd')}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-2 font-mono text-xl font-bold tabular-nums text-zinc-100 sm:text-2xl">
                <span>{formattedRate}</span>
                <span className="text-sm font-semibold text-gold-400/90">{t('land.usd.currency')}</span>
              </p>
              <p className="mt-2 text-[9px] leading-relaxed text-zinc-600">{t('land.usd.note')}</p>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        className="ms-glass rounded-xl border border-white/5 p-5 hover:border-gold-500/25"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.68, duration: 0.5 }}
      >
        <h3 className="font-display text-xs font-bold tracking-widest text-zinc-300">{t('dash.metals.title')}</h3>
        <div className="mt-4 space-y-2">
          {LANDING_METALS.map((metal, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-void-950/40 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${metal.up ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="truncate text-[11px] font-bold text-zinc-200">{t(metal.key)}</span>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[11px] font-bold text-zinc-100">
                  {metal.price}{' '}
                  <span className="text-[9px] font-normal text-zinc-500">{t('dash.metal.perg')}</span>
                </div>
                <div className={`text-[9px] font-bold ${metal.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metal.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
