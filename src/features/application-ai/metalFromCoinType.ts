/** Maps stored English coin SKU (from canonical EN translations) → metal preset for Nano Banana UX. */

export type ApplicationMetalTone = 'gold' | 'silver' | 'platinum'

export function metalToneFromCoinType(coinType: string): ApplicationMetalTone {
  const upper = coinType.toUpperCase()
  if (upper.includes('GOLD')) return 'gold'
  if (upper.includes('SILVER')) return 'silver'
  if (upper.includes('PLATINUM')) return 'platinum'
  return 'silver'
}
