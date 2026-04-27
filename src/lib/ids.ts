export function generateId(prefix: string): string {
  const part =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : String(Math.random()).slice(2, 10)
  return `${prefix}-${part.toUpperCase()}`
}
