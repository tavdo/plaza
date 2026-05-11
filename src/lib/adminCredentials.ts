import type { AdminRole } from '../types'

const DEFAULT_OWNER_EMAIL = 'owner@merge-stars.lo'
const DEFAULT_OWNER_PASS = 'merge-owner-2026'
const DEFAULT_MANAGER_EMAIL = 'manager@merge-stars.lo'
const DEFAULT_MANAGER_PASS = 'merge-manager-2026'

/**
 * Demo-only SPA auth. VITE_* vars still ship to browsers — wire a real backend before production.
 * TODO: Exchange credentials for HTTP-only cookies via your Edge/API layer.
 */
export function validateAdminLogin(email: string, password: string): AdminRole | null {
  const e = email.trim().toLowerCase()
  const ownerEmail = (import.meta.env.VITE_MERGE_ADMIN_OWNER_EMAIL ?? DEFAULT_OWNER_EMAIL).toLowerCase()
  const ownerPass = import.meta.env.VITE_MERGE_ADMIN_OWNER_PASS ?? DEFAULT_OWNER_PASS
  const mgrEmail = (import.meta.env.VITE_MERGE_ADMIN_MANAGER_EMAIL ?? DEFAULT_MANAGER_EMAIL).toLowerCase()
  const mgrPass = import.meta.env.VITE_MERGE_ADMIN_MANAGER_PASS ?? DEFAULT_MANAGER_PASS

  if (e === ownerEmail && password === ownerPass) return 'owner'
  if (e === mgrEmail && password === mgrPass) return 'manager'
  return null
}
