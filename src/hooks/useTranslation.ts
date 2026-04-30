import { useCallback } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { t, type Key, type Lang } from '../lib/i18n'

export function useTranslation() {
  const lang = useAppStore((s) => s.language)
  const translate = useCallback(
    (key: Key, vars?: Record<string, string | number>) => t(key, lang, vars),
    [lang],
  )
  return { t: translate, lang }
}

export function formatMoney(amount: number, lang: Lang): string {
  const locale = lang === 'ka' ? 'ka-GE' : undefined
  return amount.toLocaleString(locale, { style: 'currency', currency: 'USD' })
}
