import { useEffect, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore, defaultApplicationDraft, isAgreementComplete, type ApplicationDraft } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'
import { useHydration } from '../hooks/useHydration'

const fullSchema = z.object({
  coinType: z.string().min(1, 'Select a coin type'),
  amount: z
    .number()
    .refine((n) => Number.isFinite(n) && n >= 0.01, 'Enter a positive amount'),
  ownerName: z.string().min(2, 'Required'),
  deliveryLine1: z.string().min(2, 'Required'),
  deliveryCity: z.string().min(2, 'Required'),
  deliveryPostal: z.string().min(2, 'Required'),
  contactPhone: z.string().min(6, 'Valid phone required'),
  additionalInfo: z.string().max(2000, 'Too long'),
})

type FormValues = z.infer<typeof fullSchema>

const coinOptions = [
  'MERGE SILVER',
  'MERGE GOLD',
  'MERGE PLATINUM',
  'CUSTOM BRAND COIN',
] as const

function mergeDraft(
  d: ApplicationDraft | null
): FormValues {
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

  const next = async () => {
    if (step === 0) {
      const ok = await trigger(['coinType', 'amount'] as const, { shouldFocus: true })
      if (ok) {
        const vals = getValues()
        draftSave(vals, 1)
        toast.message('Progress saved', { description: 'Autosaved to local storage.' })
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
        toast.success('Application received.')
        void navigate('/summary', { replace: true })
      } catch {
        toast.error('Unable to submit. Try again.')
      } finally {
        setSubmitting(false)
      }
    }, 800)
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="ms-glass ms-bg-animated rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-zinc-100 light:text-zinc-900">
              Brand coin application
            </h1>
            <span className="text-xs text-zinc-500">
              Step {step + 1} / 3
            </span>
          </div>
          <div className="mb-6 mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-void-950 light:bg-zinc-200">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
              initial={false}
              animate={{ width: `${((step + 1) / 3) * 100}%` }}
            />
          </div>

          <form
            onSubmit={step === 2 ? handleSubmit(onFinal) : (e) => e.preventDefault()}
            className="space-y-5"
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                >
                  <h2 className="text-sm font-medium text-amber-300/90">Product</h2>
                  <div>
                    <label className="text-xs text-zinc-400" htmlFor="coinType">
                      Coin type
                    </label>
                    <select id="coinType" className="ms-input mt-1" {...register('coinType')}>
                      {coinOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.coinType && (
                      <p className="mt-1 text-xs text-red-400">{errors.coinType.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400" htmlFor="amount">
                      Amount
                    </label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min={0.01}
                      className="ms-input mt-1"
                      {...register('amount', { valueAsNumber: true })}
                    />
                    {errors.amount && (
                      <p className="mt-1 text-xs text-red-400">{errors.amount.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                >
                  <h2 className="text-sm font-medium text-amber-300/90">Owner &amp; delivery</h2>
                  <div>
                    <label className="text-xs text-zinc-400" htmlFor="ownerName">
                      Owner name
                    </label>
                    <input id="ownerName" className="ms-input mt-1" {...register('ownerName')} />
                    {errors.ownerName && (
                      <p className="mt-1 text-xs text-red-400">{errors.ownerName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400" htmlFor="deliveryLine1">
                      Street address
                    </label>
                    <input
                      id="deliveryLine1"
                      className="ms-input mt-1"
                      {...register('deliveryLine1')}
                    />
                    {errors.deliveryLine1 && (
                      <p className="mt-1 text-xs text-red-400">{errors.deliveryLine1.message}</p>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-zinc-400" htmlFor="deliveryCity">
                        City
                      </label>
                      <input id="deliveryCity" className="ms-input mt-1" {...register('deliveryCity')} />
                      {errors.deliveryCity && (
                        <p className="mt-1 text-xs text-red-400">{errors.deliveryCity.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400" htmlFor="deliveryPostal">
                        Postal code
                      </label>
                      <input
                        id="deliveryPostal"
                        className="ms-input mt-1"
                        {...register('deliveryPostal')}
                      />
                      {errors.deliveryPostal && (
                        <p className="mt-1 text-xs text-red-400">{errors.deliveryPostal.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400" htmlFor="contactPhone">
                      Contact phone
                    </label>
                    <input
                      id="contactPhone"
                      className="ms-input mt-1"
                      type="tel"
                      {...register('contactPhone')}
                    />
                    {errors.contactPhone && (
                      <p className="mt-1 text-xs text-red-400">{errors.contactPhone.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                >
                  <h2 className="text-sm font-medium text-amber-300/90">Additional &amp; review</h2>
                  <div>
                    <label className="text-xs text-zinc-400" htmlFor="additionalInfo">
                      Additional information
                    </label>
                    <textarea
                      id="additionalInfo"
                      rows={4}
                      className="ms-input mt-1"
                      placeholder="Reference notes, handling instructions, et cetera"
                      {...register('additionalInfo')}
                    />
                    {errors.additionalInfo && (
                      <p className="mt-1 text-xs text-red-400">{errors.additionalInfo.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm text-zinc-200 light:border-zinc-300 light:text-zinc-800"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              {step < 2 ? (
                <button
                  type="button"
                  onClick={next}
                  className="ms-btn-gold"
                >
                  Next
                </button>
              ) : (
                <button type="submit" className="ms-btn-gold" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </PageFade>
  )
}
