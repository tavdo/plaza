import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore, defaultApplicationDraft, isAgreementComplete, type ApplicationDraft } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'
import { useHydration } from '../hooks/useHydration'
import { useTranslation } from '../hooks/useTranslation'
import { COIN_OPTION_KEYS, displayCoinType, t as translateStatic, type Key, type Lang } from '../lib/i18n'

type FormValues = z.infer<ReturnType<typeof buildFullSchema>>

function buildFullSchema(tr: (k: Key) => string) {
  return z.object({
    coinType: z.string().min(1, tr('val.selectCoin')),
    amount: z.number().refine((n) => Number.isFinite(n) && n >= 0.01, tr('val.amount')),
    ownerName: z.string().min(2, tr('val.required')),
    deliveryLine1: z.string().min(2, tr('val.required')),
    deliveryCity: z.string().min(2, tr('val.required')),
    deliveryPostal: z.string().min(2, tr('val.required')),
    contactPhone: z.string().min(6, tr('val.phoneApp')),
    additionalInfo: z.string().max(2000, tr('val.tooLong')),
  })
}

function mergeDraft(d: ApplicationDraft | null): FormValues {
  const base: FormValues = {
    coinType: d?.coinType ?? defaultApplicationDraft.coinType,
    amount: d?.amount ?? defaultApplicationDraft.amount,
    ownerName: d?.ownerName ?? '',
    deliveryLine1: d?.deliveryLine1 ?? '',
    deliveryCity: d?.deliveryCity ?? '',
    deliveryPostal: d?.deliveryPostal ?? '',
    contactPhone: d?.contactPhone ?? '',
    additionalInfo: d?.additionalInfo ?? '',
  }
  return base
}

export function ApplicationPage() {
  const { t, lang } = useTranslation()
  const language = lang
  const ready = useHydration()
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const application = useAppStore((s) => s.application)
  const applicationDraft = useAppStore((s) => s.applicationDraft)
  const setApplicationDraft = useAppStore((s) => s.setApplicationDraft)
  const submitApplication = useAppStore((s) => s.submitApplication)
  const [submitting, setSubmitting] = useState(false)
  const saveTimer = useRef<number | undefined>(undefined)
  const formInit = useRef(false)
  const step = (applicationDraft?.step ?? 0) as ApplicationDraft['step']

  const fullSchema = useMemo(() => buildFullSchema(t), [t, language])

  const stepsList = useMemo(
    () =>
      [
        { id: 0, labelKey: 'app.step.coin' as const },
        { id: 1, labelKey: 'app.step.personal' as const },
        { id: 2, labelKey: 'app.step.review' as const },
      ] as const,
    [],
  )

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: mergeDraft(applicationDraft),
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (!ready) {
      return
    }
    if (formInit.current) {
      return
    }
    formInit.current = true
    reset(mergeDraft(applicationDraft))
  }, [ready, applicationDraft, reset])

  useEffect(() => {
    if (application) {
      void navigate('/summary', { replace: true })
    }
  }, [application, navigate])

  const draftSave = (vals: FormValues, nextStep: ApplicationDraft['step']) => {
    setApplicationDraft({
      ...vals,
      step: nextStep,
    })
  }

  const watched = useWatch({ control })
  useEffect(() => {
    if (!ready) return
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      const vals = getValues()
      const currentStep = useAppStore.getState().applicationDraft?.step ?? 0
      setApplicationDraft({
        ...vals,
        step: currentStep as ApplicationDraft['step'],
      })
    }, 500)
    return () => window.clearTimeout(saveTimer.current)
  }, [watched, ready, getValues, setApplicationDraft])

  if (!ready) {
    return null
  }
  if (!user) {
    return <Navigate to="/register" replace />
  }
  if (!isAgreementComplete(agreement)) {
    return <Navigate to="/terms" replace />
  }

  const canonicalLang: Lang = 'en'

  const next = async () => {
    if (step === 0) {
      const ok = await trigger(['coinType', 'amount', 'additionalInfo'] as const, { shouldFocus: true })
      if (ok) {
        const vals = getValues()
        draftSave(vals, 1)
        toast.message(t('toast.progressSaved.title'), { description: t('toast.progressSaved.desc') })
      }
    } else if (step === 1) {
      const ok = await trigger(
        ['ownerName', 'deliveryLine1', 'deliveryCity', 'deliveryPostal', 'contactPhone'] as const,
        { shouldFocus: true },
      )
      if (ok) {
        const vals = getValues()
        draftSave(vals, 2)
      }
    }
  }

  const back = () => {
    const vals = getValues()
    if (step === 1) {
      draftSave(vals, 0)
    } else if (step === 2) {
      draftSave(vals, 1)
    }
  }

  const onFinal = (data: FormValues) => {
    setSubmitting(true)
    window.setTimeout(() => {
      try {
        submitApplication(data)
        setApplicationDraft(null)
        toast.success(t('toast.applicationReceived'))
        void navigate('/summary', { replace: true })
      } catch {
        toast.error(t('toast.submitFail'))
      } finally {
        setSubmitting(false)
      }
    }, 800)
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-void-900/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-12">

            <div className="border-r border-white/5 bg-void-950 p-6 lg:col-span-4 lg:p-10">
              <h2 className="mb-8 font-display text-lg font-bold tracking-widest text-zinc-100">
                {t('app.formTitle')}
              </h2>

              <div className="flex flex-col gap-6">
                {stepsList.map((s) => (
                  <div key={s.id} className="relative flex items-center gap-4">
                    {s.id !== stepsList.length - 1 && (
                      <div className="absolute left-4 top-10 h-10 w-[1px] bg-white/10" />
                    )}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${step === s.id ? 'border-gold-400 bg-gold-400/20 text-gold-400' : step > s.id ? 'border-gold-500 bg-gold-500 text-void-950' : 'border-zinc-700 bg-transparent text-zinc-500'}`}>
                      {step > s.id ? '✓' : s.id + 1}
                    </div>
                    <span className={`text-sm tracking-wider transition-colors ${step === s.id ? 'font-bold text-zinc-100' : step > s.id ? 'font-medium text-zinc-300' : 'text-zinc-500'}`}>
                      {t(s.labelKey)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 lg:col-span-8 lg:p-10">
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold tracking-wide text-zinc-100 uppercase">
                  {t(stepsList[step].labelKey)}
                </h1>
                <p className="mt-1 text-xs text-zinc-500 tracking-widest uppercase">
                  {t('app.stepOf', { n: step + 1 })}
                </p>
              </div>

              <form onSubmit={step === 2 ? handleSubmit(onFinal) : (e) => e.preventDefault()}>
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">

                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.coinType')}</label>
                        <select className="ms-input" {...register('coinType')}>
                          {COIN_OPTION_KEYS.map((key) => {
                            const value = translateStatic(key, canonicalLang)
                            return (
                              <option key={value} value={value} className="bg-void-900">
                                {t(key)}
                              </option>
                            )
                          })}
                        </select>
                        {errors.coinType && <p className="mt-1 text-xs text-red-400">{errors.coinType.message}</p>}
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.quantity')}</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0.01}
                              className="ms-input"
                              {...register('amount', { valueAsNumber: true })}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-center pr-4 text-right">
                              <span className="text-[10px] text-zinc-500">{t('app.label.coinWeight')}</span>
                              <span className="text-xs font-bold text-zinc-300">{t('app.label.grams1000')}</span>
                            </div>
                          </div>
                          {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount.message}</p>}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.metalPurity')}</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="ms-input"
                              key={`metal-label-${language}`}
                              value={t('app.label.silverAg')}
                              disabled
                              readOnly
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-center pr-4 text-right">
                              <span className="text-[10px] text-zinc-500">{t('app.label.purity')}</span>
                              <span className="text-xs font-bold text-zinc-300">{t('app.label.purityPct')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.specialRequest')}</label>
                        <textarea
                          rows={4}
                          className="ms-input resize-none"
                          placeholder={t('app.ph.specialRequest')}
                          {...register('additionalInfo')}
                        />
                        {errors.additionalInfo && <p className="mt-1 text-xs text-red-400">{errors.additionalInfo.message}</p>}
                      </div>

                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.fullName')}</label>
                          <input className="ms-input" placeholder={t('app.ph.ownerName')} {...register('ownerName')} />
                          {errors.ownerName && <p className="mt-1 text-xs text-red-400">{errors.ownerName.message}</p>}
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.contactPhone')}</label>
                          <input className="ms-input" placeholder={t('app.ph.phone')} type="tel" {...register('contactPhone')} />
                          {errors.contactPhone && <p className="mt-1 text-xs text-red-400">{errors.contactPhone.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.street')}</label>
                        <input className="ms-input" placeholder={t('app.ph.address')} {...register('deliveryLine1')} />
                        {errors.deliveryLine1 && <p className="mt-1 text-xs text-red-400">{errors.deliveryLine1.message}</p>}
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.city')}</label>
                          <input className="ms-input" placeholder={t('app.ph.city')} {...register('deliveryCity')} />
                          {errors.deliveryCity && <p className="mt-1 text-xs text-red-400">{errors.deliveryCity.message}</p>}
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">{t('app.label.postal')}</label>
                          <input className="ms-input" placeholder={t('app.ph.postal')} {...register('deliveryPostal')} />
                          {errors.deliveryPostal && <p className="mt-1 text-xs text-red-400">{errors.deliveryPostal.message}</p>}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">

                       <div className="rounded-xl border border-white/5 bg-void-950/50 p-6">
                         <h3 className="mb-4 text-sm font-bold tracking-wider text-gold-400">{t('app.summary.title')}</h3>
                         <div className="space-y-3 text-sm">
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-zinc-500">{t('app.summary.coinType')}</span>
                             <span className="font-medium text-zinc-200">{watched?.coinType ? displayCoinType(watched.coinType, lang) : ''}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-zinc-500">{t('app.summary.quantity')}</span>
                             <span className="font-medium text-zinc-200">{watched?.amount}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-zinc-500">{t('app.summary.name')}</span>
                             <span className="font-medium text-zinc-200">{watched?.ownerName}</span>
                           </div>
                           <div className="flex justify-between pb-2">
                             <span className="text-zinc-500">{t('app.summary.address')}</span>
                             <span className="font-medium text-zinc-200 text-right">
                               {watched?.deliveryLine1}
                               <br />
                               {watched?.deliveryCity}, {watched?.deliveryPostal}
                             </span>
                           </div>
                         </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
                  {step > 0 ? (
                    <button type="button" onClick={back} className="ms-btn-outline px-8">
                      {t('ui.back')}
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 2 ? (
                    <button type="button" onClick={next} className="ms-btn-gold px-10">
                      {t('ui.nextStep')}
                    </button>
                  ) : (
                    <button type="submit" className="ms-btn-gold px-10" disabled={submitting}>
                      {submitting ? t('ui.submitting') : t('app.submitBtn')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageFade>
  )
}