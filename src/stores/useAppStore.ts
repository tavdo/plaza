import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Agreement, BrandCoinApplication, User } from '../types'
import { generateId } from '../lib/ids'
import type { Lang } from '../lib/i18n'

type AppState = {
  theme: 'dark' | 'light'
  language: Lang
  user: User | null
  agreement: Agreement | null
  application: BrandCoinApplication | null
  applicationDraft: ApplicationDraft | null
  setTheme: (t: 'dark' | 'light') => void
  setLanguage: (l: Lang) => void
  registerUser: (u: Omit<User, 'id' | 'createdAt'>) => User
  setAgreement: (a: Agreement) => void
  setApplicationDraft: (d: ApplicationDraft | null) => void
  submitApplication: (payload: {
    coinType: string
    amount: number
    ownerName: string
    deliveryLine1: string
    deliveryCity: string
    deliveryPostal: string
    contactPhone: string
    additionalInfo: string
  }) => BrandCoinApplication
  updateApplication: (p: Partial<BrandCoinApplication>) => void
  markSimulationStarted: () => void
  resetAll: () => void
}

export type ApplicationDraft = {
  coinType: string
  amount: number
  ownerName: string
  deliveryLine1: string
  deliveryCity: string
  deliveryPostal: string
  contactPhone: string
  additionalInfo: string
  step: 0 | 1 | 2
}

export const defaultApplicationDraft: ApplicationDraft = {
  coinType: 'MERGE SILVER',
  amount: 1,
  ownerName: '',
  deliveryLine1: '',
  deliveryCity: '',
  deliveryPostal: '',
  contactPhone: '',
  additionalInfo: '',
  step: 0,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'en' as Lang,
      user: null,
      agreement: null,
      application: null,
      applicationDraft: null,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      registerUser: (u) => {
        const id = generateId('USR')
        const user: User = {
          id,
          firstName: u.firstName,
          lastName: u.lastName,
          personalId: u.personalId,
          phone: u.phone,
          email: u.email,
          password: u.password,
          createdAt: new Date().toISOString(),
        }
        set({ user, applicationDraft: { ...defaultApplicationDraft } })
        return user
      },
      setAgreement: (a) => set({ agreement: a }),
      setApplicationDraft: (d) => set({ applicationDraft: d }),
      submitApplication: (payload) => {
        const { user } = get()
        if (!user) throw new Error('No user')
        const serviceFee = Math.round(payload.amount * 120 * 0.04 * 100) / 100
        const subtotal = Math.round(payload.amount * 120 * 100) / 100
        const totalAmount = Math.round((subtotal + serviceFee) * 100) / 100
        const id = generateId('APP')
        const now = new Date().toISOString()
        const app: BrandCoinApplication = {
          id,
          userId: user.id,
          coinType: payload.coinType,
          amount: payload.amount,
          ownerName: payload.ownerName,
          deliveryLine1: payload.deliveryLine1,
          deliveryCity: payload.deliveryCity,
          deliveryPostal: payload.deliveryPostal,
          contactPhone: payload.contactPhone,
          additionalInfo: payload.additionalInfo,
          serviceFee,
          totalAmount,
          status: 'pending_review',
          statusHistory: [
            {
              at: now,
              status: 'pending_review',
              label: 'Application submitted',
            },
          ],
          createdAt: now,
          simulationStarted: false,
        }
        set({ application: app, applicationDraft: null })
        return app
      },
      updateApplication: (p) => {
        const cur = get().application
        if (!cur) return
        set({ application: { ...cur, ...p } })
      },
      markSimulationStarted: () => {
        const cur = get().application
        if (!cur) return
        if (cur.simulationStarted) return
        set({
          application: { ...cur, simulationStarted: true },
        })
      },
      resetAll: () =>
        set({
          user: null,
          agreement: null,
          application: null,
          applicationDraft: null,
        }),
    }),
    {
      name: 'merge-stars',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        language: s.language,
        user: s.user,
        agreement: s.agreement,
        application: s.application,
        applicationDraft: s.applicationDraft,
      }),
    }
  )
)

export function isAgreementComplete(a: Agreement | null): boolean {
  if (!a) return false
  return (
    a.platformTerms &&
    a.privacyPolicy &&
    a.fundingTerms &&
    a.notLender &&
    a.partnerFunding &&
    a.fundingSubjectToEvaluation
  )
}
