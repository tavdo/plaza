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
    fundingTerms: z.boolean(),
    notLender: z.boolean(),
    partnerFunding: z.boolean(),
    fundingSubjectToEvaluation: z.boolean(),
  })
  .refine(
    (d) =>
      d.platformTerms &&
      d.privacyPolicy &&
      d.fundingTerms &&
      d.notLender &&
      d.partnerFunding &&
      d.fundingSubjectToEvaluation,
    { path: ['root'], message: 'Accept all items to continue' },
  )

type TermsForm = z.infer<typeof termsSchema>

const defaultValues: TermsForm = {
  platformTerms: false,
  privacyPolicy: false,
  fundingTerms: false,
  notLender: false,
  partnerFunding: false,
  fundingSubjectToEvaluation: false,
}

const items: { id: keyof TermsForm; text: string }[] = [
  { id: 'platformTerms', text: 'I agree to the Platform Terms.' },
  { id: 'privacyPolicy', text: 'I agree to the Privacy Policy.' },
  { id: 'fundingTerms', text: 'I agree to the Funding Terms.' },
  { id: 'notLender', text: 'I understand MERGE STARS is not a lender.' },
  { id: 'partnerFunding', text: 'I understand funding is provided by a financial partner.' },
  { id: 'fundingSubjectToEvaluation', text: 'I understand approval is subject to partner evaluation.' },
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
          fundingTerms: agreement.fundingTerms,
          notLender: agreement.notLender,
          partnerFunding: agreement.partnerFunding,
          fundingSubjectToEvaluation: agreement.fundingSubjectToEvaluation,
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
        fundingTerms: agreement.fundingTerms,
        notLender: agreement.notLender,
        partnerFunding: agreement.partnerFunding,
        fundingSubjectToEvaluation: agreement.fundingSubjectToEvaluation,
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
      setAgreement({ ...data, acceptedAt: new Date().toISOString() })
      toast.success('Disclosures stored locally.')
      setLoading(false)
      void navigate('/application', { replace: true })
    }, 500)
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <div className="ms-glass ms-bg-animated rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-zinc-100 light:text-zinc-900">
            Terms &amp; conditions
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            You must check every item before the application step unlocks. Acceptance is written to
            local storage.
          </p>
          <form className="mt-6 space-y-3" onSubmit={handleSubmit(onValid)}>
            {items.map((item) => (
              <Controller
                key={item.id}
                name={item.id}
                control={control}
                render={({ field: { onChange, value, ref, name } }) => (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-void-950/40 p-3 light:border-zinc-200/80 light:bg-white/60">
                    <input
                      type="checkbox"
                      name={name}
                      ref={ref}
                      className="mt-0.5 h-4 w-4 rounded border-amber-500/50 text-amber-500 focus:ring-amber-500/40"
                      checked={value === true}
                      onChange={(e) => onChange(e.target.checked)}
                    />
                    <span className="text-sm text-zinc-300 light:text-zinc-800">{item.text}</span>
                  </label>
                )}
              />
            ))}
            <motion.button
              type="submit"
              className="ms-btn-gold mt-4 w-full"
              disabled={!allTrue || loading}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? 'Saving…' : 'I agree and continue'}
            </motion.button>
          </form>
        </div>
      </div>
    </PageFade>
  )
}
