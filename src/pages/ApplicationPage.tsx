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
  'MERGE SILVER COIN (1KG)',
  'MERGE GOLD COIN (1KG)',
  'MERGE PLATINUM COIN (1KG)',
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

const stepsList = [
  { id: 0, label: 'Coin Details' },
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Review & Submit' }
]

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
      const ok = await trigger(['coinType', 'amount', 'additionalInfo'] as const, { shouldFocus: true })
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
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-void-900/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-12">
            
            {/* Sidebar Steps */}
            <div className="border-r border-white/5 bg-void-950 p-6 lg:col-span-4 lg:p-10">
              <h2 className="mb-8 font-display text-lg font-bold tracking-widest text-zinc-100">
                APPLICATION FORM
              </h2>
              
              <div className="flex flex-col gap-6">
                {stepsList.map((s) => (
                  <div key={s.id} className="relative flex items-center gap-4">
                    {/* Line connecting steps */}
                    {s.id !== stepsList.length - 1 && (
                      <div className="absolute left-4 top-10 h-10 w-[1px] bg-white/10" />
                    )}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${step === s.id ? 'border-gold-400 bg-gold-400/20 text-gold-400' : step > s.id ? 'border-gold-500 bg-gold-500 text-void-950' : 'border-zinc-700 bg-transparent text-zinc-500'}`}>
                      {step > s.id ? '✓' : s.id + 1}
                    </div>
                    <span className={`text-sm tracking-wider transition-colors ${step === s.id ? 'font-bold text-zinc-100' : step > s.id ? 'font-medium text-zinc-300' : 'text-zinc-500'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Area */}
            <div className="p-6 lg:col-span-8 lg:p-10">
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold tracking-wide text-zinc-100 uppercase">
                  {stepsList[step].label}
                </h1>
                <p className="mt-1 text-xs text-zinc-500 tracking-widest uppercase">
                  Step {step + 1} of 3
                </p>
              </div>

              <form onSubmit={step === 2 ? handleSubmit(onFinal) : (e) => e.preventDefault()}>
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                      
                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">Select Coin Type</label>
                        <select className="ms-input" {...register('coinType')}>
                          {coinOptions.map((c) => (
                            <option key={c} value={c} className="bg-void-900">{c}</option>
                          ))}
                        </select>
                        {errors.coinType && <p className="mt-1 text-xs text-red-400">{errors.coinType.message}</p>}
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">Quantity</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0.01}
                              className="ms-input"
                              {...register('amount', { valueAsNumber: true })}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-center pr-4 text-right">
                              <span className="text-[10px] text-zinc-500">Coin Weight</span>
                              <span className="text-xs font-bold text-zinc-300">1,000 grams</span>
                            </div>
                          </div>
                          {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount.message}</p>}
                        </div>
                        
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">Metal Purity</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="ms-input"
                              value="Silver (Ag)"
                              disabled
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-center pr-4 text-right">
                              <span className="text-[10px] text-zinc-500">Purity</span>
                              <span className="text-xs font-bold text-zinc-300">99.9%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">Special Request (Optional)</label>
                        <textarea
                          rows={4}
                          className="ms-input resize-none"
                          placeholder="Enter any special request"
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
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">Full Name</label>
                          <input className="ms-input" placeholder="Owner Name" {...register('ownerName')} />
                          {errors.ownerName && <p className="mt-1 text-xs text-red-400">{errors.ownerName.message}</p>}
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">Contact Phone</label>
                          <input className="ms-input" placeholder="Phone" type="tel" {...register('contactPhone')} />
                          {errors.contactPhone && <p className="mt-1 text-xs text-red-400">{errors.contactPhone.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">Street Address</label>
                        <input className="ms-input" placeholder="Address Line 1" {...register('deliveryLine1')} />
                        {errors.deliveryLine1 && <p className="mt-1 text-xs text-red-400">{errors.deliveryLine1.message}</p>}
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">City</label>
                          <input className="ms-input" placeholder="City" {...register('deliveryCity')} />
                          {errors.deliveryCity && <p className="mt-1 text-xs text-red-400">{errors.deliveryCity.message}</p>}
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-400 uppercase">Postal Code</label>
                          <input className="ms-input" placeholder="ZIP / Postal" {...register('deliveryPostal')} />
                          {errors.deliveryPostal && <p className="mt-1 text-xs text-red-400">{errors.deliveryPostal.message}</p>}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                       
                       <div className="rounded-xl border border-white/5 bg-void-950/50 p-6">
                         <h3 className="mb-4 text-sm font-bold tracking-wider text-gold-400">Order Summary</h3>
                         <div className="space-y-3 text-sm">
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-zinc-500">Coin Type</span>
                             <span className="font-medium text-zinc-200">{watched.coinType}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-zinc-500">Quantity</span>
                             <span className="font-medium text-zinc-200">{watched.amount}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-zinc-500">Name</span>
                             <span className="font-medium text-zinc-200">{watched.ownerName}</span>
                           </div>
                           <div className="flex justify-between pb-2">
                             <span className="text-zinc-500">Address</span>
                             <span className="font-medium text-zinc-200 text-right">{watched.deliveryLine1}<br/>{watched.deliveryCity}, {watched.deliveryPostal}</span>
                           </div>
                         </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={back}
                      className="ms-btn-outline px-8"
                    >
                      BACK
                    </button>
                  ) : (
                    <div />
                  )}
                  
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={next}
                      className="ms-btn-gold px-10"
                    >
                      NEXT STEP
                    </button>
                  ) : (
                    <button type="submit" className="ms-btn-gold px-10" disabled={submitting}>
                      {submitting ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}
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

