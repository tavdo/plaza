/** Deterministic string hash — used for mock mesh selection and jitter. */

export function hashPrompt(input: string): number {
  let h = 2_166_136_261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 1_677_761_33)
    h >>>= 0
  }
  return h
}
