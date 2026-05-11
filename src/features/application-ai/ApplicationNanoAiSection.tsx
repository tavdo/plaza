import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { ApplicationDraft } from '../../stores/useAppStore'
import { ModelViewer } from '../ai-generator/components/ModelViewer'
import { hashPrompt } from './hashPrompt'
import { buildEmbeddedAiPreviewPayload } from './buildApplicationAiPreview'
import type { ApplicationMetalTone } from './metalFromCoinType'
import { EMBEDDED_AI_STAGE_KEYS, simulateEmbeddedNanoBanana } from './simulateEmbeddedNanoBanana'
import {
  buildNanoBananaImagePrompt,
  nanoBananaGenerate2,
  pollNanoBananaTask,
} from './nanoBananaApi'
import type { Key } from '../../lib/i18n'
import { displayCoinType } from '../../lib/i18n'
import { useTranslation } from '../../hooks/useTranslation'

const AI_PROMPT_MAX = 2000

const EXAMPLE_PROMPT_KEYS: Key[] = ['app.ai.ph.ring', 'app.ai.ph.mask', 'app.ai.ph.sculpture', 'app.ai.ph.necklace']

const SUG_KEYS: Key[] = ['app.ai.suggestion1', 'app.ai.suggestion2', 'app.ai.suggestion3', 'app.ai.suggestion4']

type Props = {
  coinType: string
  amount: number
  langMetalLabel: ApplicationMetalTone
  draftAi: Pick<ApplicationDraft, 'aiPrompt' | 'aiGenerationStatus' | 'aiProgressPercent' | 'aiPreviewSnapshot'>
  onPatchDraftAi: (
    patch: Partial<
      Pick<ApplicationDraft, 'aiPrompt' | 'aiGenerationStatus' | 'aiProgressPercent' | 'aiPreviewSnapshot'>
    >,
  ) => void
}

function metalShellClass(metal: ApplicationMetalTone) {
  if (metal === 'gold')
    return 'border-gold-500/35 shadow-[inset_0_0_40px_rgba(212,175,55,0.12)] shadow-gold-500/10'
  if (metal === 'silver')
    return 'border-slate-300/25 shadow-[inset_0_0_40px_rgba(226,232,240,0.08)] shadow-slate-400/15'
  return 'border-slate-200/20 shadow-[inset_0_0_40px_rgba(245,247,251,0.08)] shadow-white/10'
}

function metalAccentClass(metal: ApplicationMetalTone) {
  if (metal === 'gold') return 'text-gold-300'
  if (metal === 'silver') return 'text-slate-200'
  return 'text-slate-50'
}

function metalGlowClass(metal: ApplicationMetalTone) {
  if (metal === 'gold') return 'from-gold-500/35 via-transparent to-transparent'
  if (metal === 'silver') return 'from-slate-200/35 via-transparent to-transparent'
  return 'from-white/25 via-transparent to-transparent'
}

export function ApplicationNanoAiSection({
  coinType,
  amount,
  langMetalLabel,
  draftAi,
  onPatchDraftAi,
}: Props) {
  const { t, lang } = useTranslation()
  const abortRef = useRef<AbortController | null>(null)
  const [focus, setFocus] = useState(false)
  const [rotPlaceholder, setRotPlaceholder] = useState(0)

  useEffect(() => {
    const iv = window.setInterval(() => setRotPlaceholder((r) => (r + 1) % EXAMPLE_PROMPT_KEYS.length), 7000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const busy = draftAi.aiGenerationStatus === 'generating'
  const hasPreview = Boolean(draftAi.aiPreviewSnapshot) && draftAi.aiGenerationStatus === 'complete'

  const applyPrompt = useCallback(
    (p: string) => {
      onPatchDraftAi({ aiPrompt: p.slice(0, AI_PROMPT_MAX) })
    },
    [onPatchDraftAi],
  )

  const runGenerate = useCallback(async () => {
    const raw = draftAi.aiPrompt.trim()
    if (!raw) {
      toast.error(t('app.ai.err.emptyPrompt'))
      return
    }
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    onPatchDraftAi({ aiGenerationStatus: 'generating', aiProgressPercent: 8, aiPreviewSnapshot: null })
    try {
      let apiConcept: { taskId: string; imageUrl: string } | null = null
      const coinDisplayName = displayCoinType(coinType, lang)
      try {
        const nbPrompt = buildNanoBananaImagePrompt(raw, coinDisplayName, langMetalLabel)
        const { taskId } = await nanoBananaGenerate2({ prompt: nbPrompt, signal: ac.signal })
        onPatchDraftAi({ aiGenerationStatus: 'generating', aiProgressPercent: 14 })
        const imageUrl = await pollNanoBananaTask({
          taskId,
          signal: ac.signal,
          onProgressPercent: (p) => {
            onPatchDraftAi({ aiGenerationStatus: 'generating', aiProgressPercent: p })
          },
        })
        apiConcept = { taskId, imageUrl }
      } catch {
        await simulateEmbeddedNanoBanana(ac.signal, ({ percent }) => {
          onPatchDraftAi({
            aiProgressPercent: percent,
            aiGenerationStatus: 'generating',
          })
        })
        toast.message(t('app.ai.toast.mockFallback'))
      }
      if (ac.signal.aborted) return
      const snap = buildEmbeddedAiPreviewPayload({
        prompt: raw,
        metal: langMetalLabel,
        amountKg: amount,
        coinDisplayName,
      })
      const mergedSnap =
        apiConcept !== null
          ? {
              ...snap,
              nanoBananaTaskId: apiConcept.taskId,
              conceptImageUrl: apiConcept.imageUrl,
              renderQualityKey: 'app.ai.render.nanoApi',
              aiQualityScore: Math.min(99, snap.aiQualityScore + 5),
            }
          : snap
      onPatchDraftAi({
        aiPreviewSnapshot: mergedSnap,
        aiGenerationStatus: 'complete',
        aiProgressPercent: 100,
      })
      toast.success(apiConcept ? t('app.ai.toast.nanoReady') : t('app.ai.toast.ready'))
    } catch {
      if (ac.signal.aborted) return
      onPatchDraftAi({ aiGenerationStatus: 'error', aiProgressPercent: 0 })
      toast.error(t('app.ai.err.generic'))
    }
  }, [draftAi.aiPrompt, amount, coinType, lang, langMetalLabel, onPatchDraftAi, t])

  const randomPrompt = useCallback(() => {
    const idx = hashPrompt(`${Date.now()}`) % EXAMPLE_PROMPT_KEYS.length
    applyPrompt(t(EXAMPLE_PROMPT_KEYS[idx]!))
    toast.message(t('app.ai.toast.seed'))
  }, [applyPrompt, t])

  const prog = draftAi.aiProgressPercent
  const stageIdx = Math.min(EMBEDDED_AI_STAGE_KEYS.length - 1, Math.max(0, Math.ceil(prog / 20) - 1))

  const toneLabelKey: Key =
    langMetalLabel === 'gold'
      ? 'app.ai.material.gold'
      : langMetalLabel === 'silver'
        ? 'app.ai.material.silver'
        : 'app.ai.material.platinum'

  const particlesKey = useMemo(() => [...Array(6)].map((_, i) => i), [])

  return (
    <div
      className={`relative mt-10 overflow-hidden rounded-2xl border px-6 py-6 transition-colors lg:px-8 ${metalShellClass(langMetalLabel)}`}
    >
      <motion.div
        className={`pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-gradient-to-br opacity-65 blur-3xl ${metalGlowClass(langMetalLabel)}`}
        animate={{ rotate: busy ? [0, 360] : 0 }}
        transition={{ duration: 28, repeat: busy ? Infinity : 0, ease: 'linear' }}
      />
      <div className="relative z-[1]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.38em] text-zinc-500">
              {t('app.ai.nanoKicker')}
            </p>
            <h3 className={`mt-2 font-display text-base font-bold uppercase tracking-wider text-zinc-100 ${metalAccentClass(langMetalLabel)}`}>
              {t('app.ai.title')}
            </h3>
            <p className="mt-2 max-w-lg text-[11px] leading-relaxed text-zinc-500">{t('app.ai.subtitle')}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gold-500/80">
              {t('app.ai.linkedMetal')}: {t(toneLabelKey)}
            </p>
          </div>
          <motion.div aria-hidden className="flex shrink-0 gap-1 opacity-55">
            {particlesKey.map((i) => (
              <motion.span
                key={i}
                className={`inline-block h-8 w-[2px] rounded-full bg-gradient-to-b opacity-65 ${
                  langMetalLabel === 'gold'
                    ? 'from-gold-500 to-transparent'
                    : langMetalLabel === 'silver'
                      ? 'from-slate-200 to-transparent'
                      : 'from-zinc-100 to-transparent'
                }`}
                animate={{ opacity: busy ? [0.3, 0.95, 0.3] : 0.35, scaleY: busy ? [0.7, 1.3, 0.7] : 1 }}
                transition={{ repeat: Infinity, duration: 1.55 + i * 0.12 }}
              />
            ))}
          </motion.div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {SUG_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => applyPrompt(t(k))}
              className={`rounded-full border border-white/10 bg-void-950/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition hover:border-white/25 ${metalAccentClass(langMetalLabel)}`}
            >
              {t(k)}
            </button>
          ))}
          <button
            type="button"
            onClick={randomPrompt}
            className="rounded-full border border-gold-500/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-300 transition hover:bg-gold-500/10"
          >
            {t('app.ai.action.random')}
          </button>
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort()
              onPatchDraftAi({
                aiPrompt: '',
                aiPreviewSnapshot: null,
                aiGenerationStatus: 'idle',
                aiProgressPercent: 0,
              })
            }}
            disabled={busy}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
          >
            {t('app.ai.action.clear')}
          </button>
        </div>

        <div className="relative mt-6">
          <motion.label
            className={`pointer-events-none absolute left-4 top-3 text-[10px] font-bold uppercase tracking-wider transition ${focus ? 'text-gold-400' : 'text-zinc-500'}`}
            animate={{ scale: focus || draftAi.aiPrompt.length > 0 ? 0.9 : 1, y: focus || draftAi.aiPrompt.length > 0 ? -2 : 0 }}
          >
            {t('app.ai.promptLabel')}
          </motion.label>
          <motion.span
            className={`pointer-events-none absolute inset-[-1px] rounded-2xl opacity-70 ${focus ? 'opacity-100' : ''}`}
            animate={{
              background: focus ? `linear-gradient(120deg, rgba(212,175,55,0.35), transparent, rgba(255,255,255,0.1))` : 'transparent',
            }}
          />
          <textarea
            value={draftAi.aiPrompt}
            disabled={busy}
            maxLength={AI_PROMPT_MAX}
            placeholder={t(EXAMPLE_PROMPT_KEYS[rotPlaceholder]!)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            className={`relative mt-7 min-h-[7.5rem] w-full resize-y rounded-xl border bg-void-950/70 pb-12 pt-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-gold-500/55 ${
              langMetalLabel === 'gold'
                ? 'border-gold-500/20'
                : langMetalLabel === 'silver'
                  ? 'border-slate-400/25'
                  : 'border-white/15'
            }`}
            onChange={(e) => applyPrompt(e.target.value)}
          />
          <span className="pointer-events-none absolute bottom-3 right-4 text-[10px] text-zinc-600">
            {draftAi.aiPrompt.length} / {AI_PROMPT_MAX}
          </span>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {busy ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="rounded-xl border border-white/5 bg-void-950/60 p-4"
              >
                <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className={metalAccentClass(langMetalLabel)}>
                    {t(EMBEDDED_AI_STAGE_KEYS[Math.min(stageIdx, EMBEDDED_AI_STAGE_KEYS.length - 1)]!)}
                  </span>
                  <span className="text-zinc-500">{prog}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/40">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${
                      langMetalLabel === 'gold'
                        ? 'from-gold-900 to-gold-400'
                        : langMetalLabel === 'silver'
                          ? 'from-slate-600 to-slate-200'
                          : 'from-zinc-500 to-white'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${prog}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
                <motion.p
                  className="mt-3 text-[10px] text-zinc-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                >
                  {t('app.ai.phaseWait')}
                </motion.p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            type="button"
            disabled={busy || draftAi.aiPrompt.trim().length < 8}
            onClick={() => void runGenerate()}
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            className="ms-btn-gold mt-4 flex w-full items-center justify-center gap-2 px-10 py-4 font-display text-[11px] font-bold uppercase tracking-[0.2em] shadow-[0_0_24px_rgba(212,175,55,0.18)] disabled:opacity-55"
          >
            {busy ? t('app.ai.cta.running') : t('app.ai.cta.generate')}
          </motion.button>

          {(hasPreview || draftAi.aiGenerationStatus === 'complete') && draftAi.aiPreviewSnapshot ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-3">
                {draftAi.aiPreviewSnapshot.conceptImageUrl ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t('app.ai.nanoConcept')}</p>
                    <div className={`relative overflow-hidden rounded-2xl border ${metalShellClass(langMetalLabel)}`}>
                      <img
                        src={draftAi.aiPreviewSnapshot.conceptImageUrl}
                        alt=""
                        className="aspect-square w-full object-cover object-center sm:aspect-[4/5]"
                      />
                      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/35" aria-hidden />
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">{t('app.ai.nanoConceptNote')}</p>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {draftAi.aiPreviewSnapshot.conceptImageUrl ? t('app.ai.viewportGlb') : t('app.ai.preview.viewport')}
                  </p>
                  <div className={`overflow-hidden rounded-2xl border ${metalShellClass(langMetalLabel)}`}>
                    <div className="min-h-[220px] sm:min-h-[280px]">
                      {/* TODO: Stream actual CAD/GLB from Nano Banana (or downstream mesh vendor) once available. */}
                      <ModelViewer url={draftAi.aiPreviewSnapshot.glbUrl} />
                    </div>
                  </div>
                </div>
              </div>
              <motion.div layout className="lg:col-span-5 rounded-2xl border border-white/5 bg-black/35 p-5 backdrop-blur-sm">
                <h4 className="font-display text-[10px] font-bold uppercase tracking-[0.26em] text-gold-500/90">{t('app.ai.card.title')}</h4>
                <dl className="mt-4 space-y-2 text-[11px]">
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
                    <dt className="text-zinc-500">{t('app.ai.card.object')}</dt>
                    <dd className="text-right font-medium text-zinc-100">{draftAi.aiPreviewSnapshot.objectDisplayName}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
                    <dt className="text-zinc-500">{t('app.ai.card.material')}</dt>
                    <dd>{t(toneLabelKey)}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
                    <dt className="text-zinc-500">{t('app.ai.card.weightEstimate')}</dt>
                    <dd>
                      {draftAi.aiPreviewSnapshot.estimatedMetalWeightKg.toLocaleString(
                        lang === 'ka' ? 'ka-GE' : 'en-US',
                        { maximumFractionDigits: 4 },
                      )}{' '}
                      {t('app.ai.unit.kg')}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
                    <dt className="text-zinc-500">{t('app.ai.card.polygons')}</dt>
                    <dd>{draftAi.aiPreviewSnapshot.polygonCount.toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-US')}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
                    <dt className="text-zinc-500">{t('app.ai.card.score')}</dt>
                    <dd>{draftAi.aiPreviewSnapshot.aiQualityScore}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/5 pb-2">
                    <dt className="text-zinc-500">{t('app.ai.card.renderQuality')}</dt>
                    <dd>{t(draftAi.aiPreviewSnapshot.renderQualityKey as Key)}</dd>
                  </div>
                  <div className="flex justify-between gap-2 pb-2">
                    <dt className="text-zinc-500">{t('app.ai.card.productionEstimate')}</dt>
                    <dd className="text-gold-200/95">
                      {draftAi.aiPreviewSnapshot.estimatedProductionCostUsd.toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 2,
                      })}
                    </dd>
                  </div>
                </dl>
                <p className="mt-5 text-[9px] leading-relaxed uppercase tracking-[0.12em] text-zinc-600">{t('app.ai.disclaimer')}</p>
              </motion.div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
