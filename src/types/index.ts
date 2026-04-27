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
}
