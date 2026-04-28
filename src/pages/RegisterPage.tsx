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
  phone: z.string().min(6, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 chars'),
})

type Form = z.infer<typeof schema>

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
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register')

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
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-20">
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-void-900/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-2">
            {/* LEFT SIDE - BRANDING */}
            <div className="relative hidden flex-col justify-between bg-void-950 p-10 lg:flex">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 to-transparent" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center text-3xl text-gold-500" aria-hidden>★</div>
                  <div className="flex flex-col">
                    <span className="font-display text-lg font-bold leading-none tracking-widest text-zinc-100">MERGE</span>
                    <span className="font-display text-sm font-medium leading-none tracking-[0.2em] text-zinc-400">STARS</span>
                  </div>
                </div>
                <h2 className="font-display text-3xl font-bold tracking-wide text-zinc-100">
                  Welcome Back to <br />
                  <span className="text-gold-400">MERGE STARS</span>
                </h2>
                <p className="mt-4 max-w-xs text-sm text-zinc-400">
                  Access your account and manage your luxury assets.
                </p>
                
                <div className="mt-12 space-y-6">
                  {[
                    { icon: '🔒', title: 'Secure Platform' },
                    { icon: '🛡️', title: 'Trusted by Crystals' },
                    { icon: '🌍', title: 'Global Community' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="text-gold-400">{item.icon}</div>
                      <span className="text-sm font-medium tracking-wide text-zinc-300">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative z-10 mt-20 text-xs text-zinc-500">
                Already have an account? <button onClick={() => setActiveTab('login')} className="text-gold-400 hover:underline">Login</button>
              </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="p-8 sm:p-12">
              {/* Tabs */}
              <div className="mb-8 flex gap-4 border-b border-white/10 pb-4">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`text-sm font-bold tracking-widest transition-colors ${activeTab === 'login' ? 'text-gold-400 border-b-2 border-gold-400 pb-4 -mb-[18px]' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  LOGIN
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`text-sm font-bold tracking-widest transition-colors ${activeTab === 'register' ? 'text-gold-400 border-b-2 border-gold-400 pb-4 -mb-[18px]' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {/* Progress Steps */}
              {activeTab === 'register' && (
                <div className="mb-10 flex items-center justify-between">
                  <div className="flex flex-col items-center gap-2 text-gold-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-400 bg-gold-400/20 text-xs font-bold">1</div>
                    <span className="text-[10px] uppercase tracking-wider">Personal Info</span>
                  </div>
                  <div className="h-[1px] flex-1 bg-white/10 mx-2" />
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-600 bg-transparent text-xs font-bold">2</div>
                    <span className="text-[10px] uppercase tracking-wider">Security</span>
                  </div>
                  <div className="h-[1px] flex-1 bg-white/10 mx-2" />
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-600 bg-transparent text-xs font-bold">3</div>
                    <span className="text-[10px] uppercase tracking-wider">Agreement</span>
                  </div>
                </div>
              )}

              {/* Form Content */}
              <form onSubmit={handleSubmit(submitRegistration)} noValidate>
                <div className="space-y-5">
                  {activeTab === 'register' && (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium tracking-wide text-zinc-400">First Name</label>
                          <input className="ms-input" placeholder="Enter your" autoComplete="given-name" {...register('firstName')} />
                          {errors.firstName && <p className="mt-1 text-[10px] text-red-400">{errors.firstName.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium tracking-wide text-zinc-400">Last Name</label>
                          <input className="ms-input" placeholder="Enter your" autoComplete="family-name" {...register('lastName')} />
                          {errors.lastName && <p className="mt-1 text-[10px] text-red-400">{errors.lastName.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium tracking-wide text-zinc-400">Personal ID Number</label>
                        <input className="ms-input" placeholder="Enter your ID" autoComplete="off" {...register('personalId')} />
                        {errors.personalId && <p className="mt-1 text-[10px] text-red-400">{errors.personalId.message}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium tracking-wide text-zinc-400">Phone Number</label>
                        <input className="ms-input" placeholder="Enter your phone number" type="tel" {...register('phone')} />
                        {errors.phone && <p className="mt-1 text-[10px] text-red-400">{errors.phone.message}</p>}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-medium tracking-wide text-zinc-400">Email</label>
                    <input className="ms-input" placeholder="Enter your email" type="email" {...register('email')} />
                    {errors.email && <p className="mt-1 text-[10px] text-red-400">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium tracking-wide text-zinc-400">Password</label>
                    <input className="ms-input" placeholder="Enter your password" type="password" {...register('password')} />
                    {errors.password && <p className="mt-1 text-[10px] text-red-400">{errors.password.message}</p>}
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                     <button
                        type="button"
                        onClick={() => { reset(demoUser); toast.info('Demo fields filled') }}
                        className="text-xs text-gold-400 hover:underline"
                      >
                        Fill Demo Data
                      </button>
                    <motion.button
                      type="submit"
                      className="ms-btn-outline border-gold-500/50 text-gold-400 hover:bg-gold-500/10 px-10"
                      disabled={loading}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Processing…' : 'NEXT STEP'}
                    </motion.button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </PageFade>
  )
}
