import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { useHydration } from '../hooks/useHydration'

export function RequireApplication({ children }: { children: React.ReactNode }) {
  const application = useAppStore((s) => s.application)
  const ready = useHydration()
  const loc = useLocation()
  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-400">
        Loading…
      </div>
    )
  }
  if (!application) {
    return <Navigate to="/application" state={{ from: loc }} replace />
  }
  return <>{children}</>
}
