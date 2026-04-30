import { useEffect, useState } from 'react'
import { fetchUsdToGel } from '../lib/markets'

export function useUsdGelRate() {
  const [rate, setRate] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchUsdToGel().then((v) => {
      if (!cancelled) setRate(v)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return rate
}
