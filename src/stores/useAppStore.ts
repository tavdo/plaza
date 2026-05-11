import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AdminRole,
  Agreement,
  AiGenerationStatus,
  ApplicationAiPreviewSnapshot,
  ApplicationStatus,
  BrandCoinApplication,
  LedgerUser,
  User,
} from '../types'
import { generateId } from '../lib/ids'
import { DEFAULT_COIN_TYPE_VALUE, type Lang } from '../lib/i18n'

const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000

/** Not persisted — cleared on reload. TODO: Backend session cookie. */
export type AdminSession = { role: AdminRole; expiresAt: number } | null

export function isAdminSessionValid(s: AdminSession): s is { role: AdminRole; expiresAt: number } {
  return s !== null && typeof s.expiresAt === 'number' && s.expiresAt > Date.now()
}

function toLedgerUser(user: User): LedgerUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    personalId: user.personalId,
    createdAt: user.createdAt,
  }
}

type AppState = {
  theme: 'dark' | 'light'
  language: Lang
  user: User | null
  agreement: Agreement | null
  application: BrandCoinApplication | null
  applicationDraft: ApplicationDraft | null
  /** Ephemeral console session */
  adminSession: AdminSession
  /** Persisted CRM — mirrored from submits for owner/manager review */
  adminApplicationLedger: BrandCoinApplication[]
  adminUserLedger: LedgerUser[]
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
    aiPreview?: ApplicationAiPreviewSnapshot | null
  }) => BrandCoinApplication
  updateApplication: (p: Partial<BrandCoinApplication>) => void
  markSimulationStarted: () => void
  adminLogin: (role: AdminRole) => void
  adminLogout: () => void
  setAdminApplicationStatus: (applicationId: string, status: ApplicationStatus, label: string) => void
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
  aiPrompt: string
  aiGenerationStatus: AiGenerationStatus
  aiProgressPercent: number
  aiPreviewSnapshot: ApplicationAiPreviewSnapshot | null
}

export const defaultApplicationDraft: ApplicationDraft = {
  coinType: DEFAULT_COIN_TYPE_VALUE,
  amount: 1,
  ownerName: '',
  deliveryLine1: '',
  deliveryCity: '',
  deliveryPostal: '',
  contactPhone: '',
  additionalInfo: '',
  step: 0,
  aiPrompt: '',
  aiGenerationStatus: 'idle',
  aiProgressPercent: 0,
  aiPreviewSnapshot: null,
}

function isAiGenerationStatus(v: unknown): v is AiGenerationStatus {
  return v === 'idle' || v === 'generating' || v === 'complete' || v === 'error'
}

function coerceDraft(ai: Partial<ApplicationDraft> | ApplicationDraft): ApplicationDraft {
  const snap =
    ai.aiPreviewSnapshot !== undefined &&
    ai.aiPreviewSnapshot !== null &&
    typeof ai.aiPreviewSnapshot === 'object' &&
    'glbUrl' in ai.aiPreviewSnapshot
      ? (ai.aiPreviewSnapshot as ApplicationAiPreviewSnapshot)
      : null

  return {
    ...defaultApplicationDraft,
    ...ai,
    aiPrompt: typeof ai.aiPrompt === 'string' ? ai.aiPrompt : defaultApplicationDraft.aiPrompt,
    aiGenerationStatus: isAiGenerationStatus(ai.aiGenerationStatus)
      ? ai.aiGenerationStatus
      : defaultApplicationDraft.aiGenerationStatus,
    aiProgressPercent:
      typeof ai.aiProgressPercent === 'number' &&
      Number.isFinite(ai.aiProgressPercent) &&
      ai.aiProgressPercent >= 0
        ? ai.aiProgressPercent
        : defaultApplicationDraft.aiProgressPercent,
    aiPreviewSnapshot: snap,
  }
}

function coerceLedgerApplications(x: unknown): BrandCoinApplication[] {
  return Array.isArray(x) ? (x as BrandCoinApplication[]) : []
}

function coerceLedgerUsers(x: unknown): LedgerUser[] {
  return Array.isArray(x) ? (x as LedgerUser[]) : []
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'ka' as Lang,
      user: null,
      agreement: null,
      application: null,
      applicationDraft: null,
      adminSession: null,
      adminApplicationLedger: [],
      adminUserLedger: [],
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
        const entry = toLedgerUser(user)
        set((state) => ({
          user,
          applicationDraft: { ...defaultApplicationDraft },
          adminUserLedger: state.adminUserLedger.some((row) => row.id === entry.id)
            ? state.adminUserLedger
            : [entry, ...state.adminUserLedger],
        }))
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
          aiPreview: payload.aiPreview ?? null,
        }
        set((state) => ({
          application: app,
          applicationDraft: null,
          adminApplicationLedger: [app, ...state.adminApplicationLedger],
        }))
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
      adminLogin: (role) =>
        set({
          adminSession: { role, expiresAt: Date.now() + ADMIN_SESSION_MS },
        }),
      adminLogout: () => set({ adminSession: null }),
      setAdminApplicationStatus: (applicationId, status, label) => {
        const sess = get().adminSession
        if (!isAdminSessionValid(sess)) return
        if (sess.role === 'manager' && (status === 'approved' || status === 'rejected')) {
          return
        }
        const now = new Date().toISOString()
        const patch = (app: BrandCoinApplication): BrandCoinApplication => ({
          ...app,
          status,
          statusHistory: [...app.statusHistory, { at: now, status, label }],
        })
        set((s) => {
          const ledger = s.adminApplicationLedger.map((a) => (a.id === applicationId ? patch(a) : a))
          const curApp = s.application?.id === applicationId ? patch(s.application) : s.application
          return { adminApplicationLedger: ledger, application: curApp }
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
      version: 5,
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== 'object') return persistedState as never
        let out = { ...(persistedState as Record<string, unknown>) }

        if (version < 2 && out.language === 'es') {
          out = { ...out, language: 'ka' satisfies Lang }
        }

        if (version < 4) {
          for (const k of ['generatedModels', 'aiGenerationHistory', 'aiPreferences', 'aiSelectedModelId']) {
            delete out[k]
          }
          if (out.applicationDraft && typeof out.applicationDraft === 'object') {
            out.applicationDraft = coerceDraft(out.applicationDraft as ApplicationDraft)
          }
          if (out.application && typeof out.application === 'object') {
            const appObj = out.application as BrandCoinApplication
            const nextApp = appObj.aiPreview === undefined ? { ...appObj, aiPreview: null } : appObj
            out.application = nextApp
          }
        }

        if (version < 5) {
          let appsLedger = coerceLedgerApplications(out.adminApplicationLedger)
          let usersLedger = coerceLedgerUsers(out.adminUserLedger)
          const app = out.application as BrandCoinApplication | null | undefined
          const usr = out.user as User | null | undefined
          if (usr && typeof usr === 'object' && usr.id && !usersLedger.some((u) => u.id === usr.id)) {
            usersLedger = [toLedgerUser(usr as User), ...usersLedger]
          }
          if (app && typeof app === 'object' && app.id && !appsLedger.some((a) => a.id === app.id)) {
            appsLedger = [app, ...appsLedger]
          }
          out.adminApplicationLedger = appsLedger
          out.adminUserLedger = usersLedger
        }

        return out as never
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        language: s.language,
        user: s.user,
        agreement: s.agreement,
        application: s.application,
        applicationDraft: s.applicationDraft,
        adminApplicationLedger: s.adminApplicationLedger,
        adminUserLedger: s.adminUserLedger,
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
