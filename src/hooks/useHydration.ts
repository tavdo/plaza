import { useEffect, useState } from 'react'
import { useAppStore } from '../stores/useAppStore'

/**
 * `false` on first client paint if `persist` has not rehydrated; `true` once localStorage is applied.
 */
export function useHydration() {
  const [ready, setReady] = useState(() => useAppStore.persist.hasHydrated())
  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      return
    }
    return useAppStore.persist.onFinishHydration(() => setReady(true))
  }, [])
  return ready
}
