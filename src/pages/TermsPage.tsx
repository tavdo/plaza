import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { isAgreementComplete, useAppStore } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'
import { useHydration } from '../hooks/useHydration'

const termsSchema = z
  .object({
    platformTerms: z.boolean(),
    privacyPolicy: z.boolean(),
    notLender: z.boolean(),
    partnerFunding: z.boolean(),
    fundingSubjectToEvaluation: z.boolean(),
    informationAccurate: z.boolean(),
  })
  .refine(
    (d) =>
      d.platformTerms &&
      d.privacyPolicy &&
      d.notLender &&
      d.partnerFunding &&
      d.fundingSubjectToEvaluation &&
      d.informationAccurate,
    { path: ['root'], message: 'Accept all items to continue' },
  )

type TermsForm = z.infer<typeof termsSchema>

const defaultValues: TermsForm = {
  platformTerms: false,
  privacyPolicy: false,
  notLender: false,
  partnerFunding: false,
  fundingSubjectToEvaluation: false,
  informationAccurate: false,
}

const items: { id: keyof TermsForm; text: string; hasLink?: boolean }[] = [
  { id: 'platformTerms', text: 'I agree to the Terms & Conditions', hasLink: true },
  { id: 'privacyPolicy', text: 'I agree to the Privacy Policy', hasLink: true },
  { id: 'notLender', text: 'I understand that MERGE STARS is not a lender or financial institution.' },
  { id: 'partnerFunding', text: 'I understand that funding is provided by our financial partner (Crystal).' },
  { id: 'fundingSubjectToEvaluation', text: 'I agree that funding approval is subject to evaluation and not guaranteed.' },
  { id: 'informationAccurate', text: 'I confirm that all information provided is accurate.' },
]

export function TermsPage() {
  const ready = useHydration()
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const setAgreement = useAppStore((s) => s.setAgreement)
  const [loading, setLoading] = useState(false)
  const application = useAppStore((s) => s.application)

  const { control, handleSubmit, reset } = useForm<TermsForm>({
    defaultValues: agreement
      ? {
          platformTerms: agreement.platformTerms,
          privacyPolicy: agreement.privacyPolicy,
          notLender: agreement.notLender,
          partnerFunding: agreement.partnerFunding,
          fundingSubjectToEvaluation: agreement.fundingSubjectToEvaluation,
          informationAccurate: agreement.fundingTerms || false, // Fallback for old schema
        }
      : defaultValues,
    resolver: zodResolver(termsSchema),
  })

  const watched = useWatch({ control })
  const allTrue = items.every((i) => watched?.[i.id] === true)

  useEffect(() => {
    if (agreement && isAgreementComplete(agreement)) {
      reset({
        platformTerms: agreement.platformTerms,
        privacyPolicy: agreement.privacyPolicy,
        notLender: agreement.notLender,
        partnerFunding: agreement.partnerFunding,
        fundingSubjectToEvaluation: agreement.fundingSubjectToEvaluation,
        informationAccurate: agreement.fundingTerms || false, // mapping old fundingTerms
      })
    }
  }, [agreement, reset])

  if (!ready) {
    return null
  }
  if (!user) {
    return <Navigate to="/register" replace />
  }
  if (isAgreementComplete(agreement) && application) {
    return <Navigate to="/dashboard" replace />
  }
  if (isAgreementComplete(agreement) && !application) {
    return <Navigate to="/application" replace />
  }

  const onValid = (data: TermsForm) => {
    setLoading(true)
    window.setTimeout(() => {
      // Map it back to the store schema
      setAgreement({
        platformTerms: data.platformTerms,
        privacyPolicy: data.privacyPolicy,
        fundingTerms: data.informationAccurate,
        notLender: data.notLender,
        partnerFunding: data.partnerFunding,
        fundingSubjectToEvaluation: data.fundingSubjectToEvaluation,
        acceptedAt: new Date().toISOString()
      })
      toast.success('Disclosures stored locally.')
      setLoading(false)
      void navigate('/application', { replace: true })
    }, 500)
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-20">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-void-900/80 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10">
          
          {/* Padlock Graphic (Background) */}
          <div className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 opacity-20 sm:opacity-40">
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-gold-500/10 blur-3xl" />
            <div className="absolute inset-0 flex items-center justify-center text-9xl text-gold-500 drop-shadow-[0_0_30px_rgba(212,175,55,0.8)]">
              🔒
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="font-display text-2xl font-bold tracking-wide text-zinc-100">
              AGREEMENT & DISCLOSURES
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Please read and agree to continue
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit(onValid)}>
              {items.map((item) => (
                <Controller
                  key={item.id}
                  name={item.id}
                  control={control}
                  render={({ field: { onChange, value, ref, name } }) => (
                    <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/5 bg-void-950/40 p-4 transition-colors hover:border-gold-500/30">
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${value ? 'border-gold-500 bg-gold-500' : 'border-zinc-600 bg-void-900'}`}>
                        {value && (
                          <svg className="h-3 w-3 text-void-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        name={name}
                        ref={ref}
                        className="sr-only"
                        checked={value === true}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                      <span className="flex-1 text-sm text-zinc-300">
                        {item.text}
                        {item.hasLink && (
                          <button type="button" className="ml-2 text-gold-400 hover:underline">View</button>
                        )}
                      </span>
                    </label>
                  )}
                />
              ))}

              <div className="pt-6">
                <motion.button
                  type="submit"
                  className="ms-btn-gold w-full text-sm tracking-widest"
                  disabled={!allTrue || loading}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? 'SAVING…' : 'I AGREE & CONTINUE'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageFade>
  )
}

