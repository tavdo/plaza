import type { Key } from './i18n'

/** Demo spot quotes for landing / dashboard-style widgets (USD per gram). */
export const LANDING_METALS: { key: Key; price: string; change: string; up: boolean }[] = [
  { key: 'dash.metal.silver', price: '$ 0.897', change: '+1.23%', up: true },
  { key: 'dash.metal.gold', price: '$ 67.42', change: '+0.85%', up: true },
  { key: 'dash.metal.platinum', price: '$ 32.15', change: '-0.42%', up: false },
]

export async function fetchUsdToGel(): Promise<number> {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!r.ok) throw new Error('rate')
    const d = (await r.json()) as { result?: string; rates?: { GEL?: number } }
    const v = d.result === 'success' ? d.rates?.GEL : undefined
    if (typeof v === 'number' && Number.isFinite(v)) return v
  } catch {
    /* fallback */
  }
  return 2.705
}
