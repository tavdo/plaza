import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppStore, isAdminSessionValid } from '../stores/useAppStore'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const session = useAppStore((s) => s.adminSession)
  const loc = useLocation()
  if (!isAdminSessionValid(session)) {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />
  }
  return children
}
