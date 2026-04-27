import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { useHydration } from '../hooks/useHydration'

export function RequireUser({ children }: { children: React.ReactNode }) {
  const user = useAppStore((s) => s.user)
  const ready = useHydration()
  const loc = useLocation()
  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-400">
        Loading…
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/register" state={{ from: loc }} replace />
  }
  return <>{children}</>
}
