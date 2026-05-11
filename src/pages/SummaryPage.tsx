import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore, isAgreementComplete } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'
import { useHydration } from '../hooks/useHydration'
import { formatMoney, useTranslation } from '../hooks/useTranslation'
import { displayCoinType } from '../lib/i18n'
import { ModelViewer } from '../features/ai-generator/components/ModelViewer'

export function SummaryPage() {
  const ready = useHydration()
  const { t, lang } = useTranslation()
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
                {t('sum.title')}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{t('sum.subtitle')}</p>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
              {t('sum.pending')}
            </span>
          </div>

          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">{t('sum.appId')}</dt>
              <dd className="font-mono text-amber-200/90">{app.id}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">{t('sum.userId')}</dt>
              <dd className="font-mono text-zinc-300 light:text-zinc-800">{app.userId}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">{t('sum.coin')}</dt>
              <dd>{displayCoinType(app.coinType, lang)}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">{t('sum.quantity')}</dt>
              <dd>{app.amount}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">{t('sum.owner')}</dt>
              <dd>{app.ownerName}</dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 light:border-zinc-200/80">
              <dt className="text-zinc-500">{t('sum.delivery')}</dt>
              <dd className="text-right">
                {app.deliveryLine1}, {app.deliveryCity} {app.deliveryPostal}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">{t('sum.contact')}</dt>
              <dd>{app.contactPhone}</dd>
            </div>
            {app.additionalInfo ? (
              <div className="pt-2">
                <dt className="text-zinc-500">{t('sum.notes')}</dt>
                <dd className="mt-1 rounded-lg border border-white/5 bg-void-950/60 p-3 text-zinc-300 light:border-zinc-200 light:bg-zinc-50 light:text-zinc-800">
                  {app.additionalInfo}
                </dd>
              </div>
            ) : null}
          </dl>

          {app.aiPreview ? (
            <div className="mt-8 space-y-5 rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/[0.07] via-void-950/55 to-black/80 p-5 light:border-amber-300/35 light:from-amber-50 light:via-white light:to-zinc-50">
              <div>
                <h2 className="text-lg font-semibold tracking-wide text-gold-200 light:text-amber-900">{t('sum.ai.sectionTitle')}</h2>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-600 light:text-zinc-500">{t('sum.ai.viewerCaption')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t('sum.ai.promptLabel')}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-200 light:text-zinc-800">{app.aiPreview.prompt}</p>
              </div>
              {app.aiPreview.conceptImageUrl ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t('sum.ai.nanoPlate')}</p>
                  <div className="overflow-hidden rounded-xl border border-white/10 light:border-zinc-200">
                    <img
                      src={app.aiPreview.conceptImageUrl}
                      alt=""
                      className="aspect-square w-full max-h-80 object-cover object-center sm:max-h-96"
                    />
                  </div>
                </div>
              ) : null}
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4 border-b border-white/10 pb-2 light:border-zinc-200">
                  <dt className="text-zinc-500">{t('sum.ai.polygons')}</dt>
                  <dd className="font-mono text-zinc-200 light:text-zinc-800">{app.aiPreview.polygonCount.toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-US')}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/10 pb-2 light:border-zinc-200">
                  <dt className="text-zinc-500">{t('sum.ai.qualityScore')}</dt>
                  <dd className="text-zinc-200 light:text-zinc-800">{app.aiPreview.aiQualityScore}</dd>
                </div>
                <div className="flex justify-between gap-4 pb-2 sm:col-span-2">
                  <dt className="text-zinc-500">{t('sum.ai.cost')}</dt>
                  <dd className="text-right text-gold-200/95 light:text-amber-900">
                    {app.aiPreview.estimatedProductionCostUsd.toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 2,
                    })}
                  </dd>
                </div>
              </dl>
              <div className="overflow-hidden rounded-xl border border-white/10 light:border-zinc-200">
                <p className="border-b border-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 light:border-zinc-200">
                  {app.aiPreview.conceptImageUrl ? t('app.ai.viewportGlb') : t('app.ai.preview.viewport')}
                </p>
                <div className="min-h-[240px] sm:min-h-[300px]">
                  <ModelViewer url={app.aiPreview.glbUrl} />
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-void-950/50 p-4 light:border-amber-200 light:bg-amber-50/60">
            <h2 className="text-sm font-semibold text-amber-200/90 light:text-amber-900">
              {t('sum.invoice.title')}
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('sum.invoice.requested')}</span>
                <span>{formatMoney(requested, lang)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('sum.invoice.fee')}</span>
                <span>{formatMoney(app.serviceFee, lang)}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-base font-semibold light:border-amber-200/80">
                <span>{t('sum.invoice.total')}</span>
                <span>{formatMoney(app.totalAmount, lang)}</span>
              </div>
            </div>
          </div>

          <motion.div className="mt-8" whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
            <Link
              to="/dashboard"
              className="ms-btn-gold inline-flex w-full items-center justify-center rounded-xl py-3 text-center"
            >
              {t('sum.openDashboard')}
            </Link>
          </motion.div>
        </div>
      </div>
    </PageFade>
  )
}
