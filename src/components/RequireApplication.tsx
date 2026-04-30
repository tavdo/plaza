import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { useHydration } from '../hooks/useHydration'
import { useTranslation } from '../hooks/useTranslation'

export function RequireApplication({ children }: { children: React.ReactNode }) {
  const application = useAppStore((s) => s.application)
  const ready = useHydration()
  const { t } = useTranslation()
  const loc = useLocation()
  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-400">
        {t('ui.loading')}
      </div>
    )
  }
  if (!application) {
    return <Navigate to="/application" state={{ from: loc }} replace />
  }
  return <>{children}</>
}
