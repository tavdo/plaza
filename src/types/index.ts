export type ApplicationStatus =
  | 'pending_review'
  | 'under_review'
  | 'sent_to_crystal'
  | 'approved'
  | 'rejected'

export type User = {
  id: string
  firstName: string
  lastName: string
  personalId: string
  phone: string
  email: string
  password: string
  createdAt: string
}

export type Agreement = {
  platformTerms: boolean
  privacyPolicy: boolean
  fundingTerms: boolean
  notLender: boolean
  partnerFunding: boolean
  fundingSubjectToEvaluation: boolean
  acceptedAt: string
}

export type AiGenerationStatus = 'idle' | 'generating' | 'complete' | 'error'

/** Persisted Nano Banana prep payload — snapped into `BrandCoinApplication` on submit. */
export type ApplicationAiPreviewSnapshot = {
  prompt: string
  objectDisplayName: string
  coinTypeMetal: 'gold' | 'silver' | 'platinum'
  glbFilename: string
  glbUrl: string
  polygonCount: number
  aiQualityScore: number
  renderQualityKey: string
  estimatedProductionCostUsd: number
  estimatedMetalWeightKg: number
  createdAt: string
  /** Populated when NanoBanana.generate-2 + record-info succeed (concept art; not CAD/GLB). */
  nanoBananaTaskId?: string | null
  conceptImageUrl?: string | null
}

/** Public CRM row — passwords never belong in admin ledgers. */
export type LedgerUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'personalId' | 'createdAt'>

/** Internal staff console — replace with SSO / JWT from your API in production. */
export type AdminRole = 'owner' | 'manager'

export type BrandCoinApplication = {
  id: string
  userId: string
  coinType: string
  amount: number
  ownerName: string
  deliveryLine1: string
  deliveryCity: string
  deliveryPostal: string
  contactPhone: string
  additionalInfo: string
  serviceFee: number
  totalAmount: number
  status: ApplicationStatus
  statusHistory: { at: string; status: ApplicationStatus; label: string }[]
  createdAt: string
  simulationStarted: boolean
  /** Optional AI-generated 3D preview metadata (Nano Banana placeholder). */
  aiPreview?: ApplicationAiPreviewSnapshot | null
}
