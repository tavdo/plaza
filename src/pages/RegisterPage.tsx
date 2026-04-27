import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore, isAgreementComplete } from '../stores/useAppStore'
import { PageFade } from '../components/AnimatedLayout'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  personalId: z.string().min(1, 'Required'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
})

type Form = z.infer<typeof schema>

/** Pre-filled test profile (local only — not sent to a real server). */
export const demoUser: Form = {
  firstName: 'Alex',
  lastName: 'Demo',
  personalId: 'DEMO-0001',
  phone: '+1-555-0100',
  email: 'demo@mergestars.test',
  password: 'DemoTest1!',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const application = useAppStore((s) => s.application)
  const registerUser = useAppStore((s) => s.registerUser)
  const [loading, setLoading] = useState(false)

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema), mode: 'onBlur' })

  useEffect(() => {
    if (!user) return
    if (!isAgreementComplete(agreement)) {
      void navigate('/terms', { replace: true })
    } else if (!application) {
      void navigate('/application', { replace: true })
    } else {
      void navigate('/dashboard', { replace: true })
    }
  }, [user, agreement, application, navigate])

  const submitRegistration = (data: Form) => {
    setLoading(true)
    window.setTimeout(() => {
      try {
        const created = registerUser({
          firstName: data.firstName,
          lastName: data.lastName,
          personalId: data.personalId,
          phone: data.phone,
          email: data.email,
          password: data.password,
        })
        toast.success(`Account created. User ID: ${created.id}`)
        void navigate('/terms', { replace: true })
      } catch (e) {
        toast.error('Could not create account. Try again.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 1100)
  }

  if (user) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-zinc-400">
        Redirecting…
      </div>
    )
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="ms-glass ms-bg-animated rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-zinc-100 light:text-zinc-900">
            Create your profile
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            We validate in the client and simulate a secure signup request.
          </p>
          <ul className="mb-6 mt-4 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">
            <li className="text-amber-400">1. Details</li>
            <li className="text-zinc-500">2. Terms</li>
            <li className="text-zinc-500">3. Application</li>
          </ul>
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-amber-500/20 bg-void-950/50 p-3 text-xs light:border-amber-200/40 light:bg-amber-50/40">
            <span className="w-full text-zinc-500 sm:w-auto">Try the app quickly:</span>
            <button
              type="button"
              onClick={() => reset(demoUser)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-amber-200/90 light:border-zinc-300 light:bg-white light:text-zinc-800"
            >
              Fill demo fields
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                reset(demoUser)
                submitRegistration(demoUser)
              }}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-200 disabled:opacity-50"
            >
              Register with demo
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(submitRegistration)} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-zinc-400" htmlFor="firstName">
                  First name
                </label>
                <input id="firstName" className="ms-input mt-1" autoComplete="given-name" {...register('firstName')} />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-zinc-400" htmlFor="lastName">
                  Last name
                </label>
                <input id="lastName" className="ms-input mt-1" autoComplete="family-name" {...register('lastName')} />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400" htmlFor="personalId">
                Personal ID
              </label>
              <input id="personalId" className="ms-input mt-1" autoComplete="off" {...register('personalId')} />
              {errors.personalId && (
                <p className="mt-1 text-xs text-red-400">{errors.personalId.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-zinc-400" htmlFor="phone">
                Phone number
              </label>
              <input id="phone" className="ms-input mt-1" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
              {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="text-xs text-zinc-400" htmlFor="email">
                Email
              </label>
              <input id="email" className="ms-input mt-1" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs text-zinc-400" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="ms-input mt-1"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <motion.button
              type="submit"
              className="ms-btn-gold relative w-full"
              disabled={loading}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-void-900/30 border-t-void-900" />
                  Processing…
                </span>
              ) : (
                'Continue to terms'
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </PageFade>
  )
}
