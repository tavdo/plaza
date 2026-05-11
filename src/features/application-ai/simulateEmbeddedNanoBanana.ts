/** Simulated Nano Banana job — FRONTEND ONLY. */
const DELAYS_MS = [650, 900, 750, 720, 880]

export const EMBEDDED_AI_STAGE_KEYS = [
  'app.ai.stage.concept',
  'app.ai.stage.geometry',
  'app.ai.stage.material',
  'app.ai.stage.structure',
  'app.ai.stage.preview',
] as const

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export type AiSimProgressPayload = {
  percent: number
  stageIndex: number
}

/**
 * Advances luxury loading stages until 100%.
 * TODO: Replace mock generation with real AI response (SSE / websocket from Nano Banana).
 */
export async function simulateEmbeddedNanoBanana(
  signal: AbortSignal,
  onProgress: (payload: AiSimProgressPayload) => void,
): Promise<void> {
  for (let i = 0; i < DELAYS_MS.length; i++) {
    if (signal.aborted) return
    const percentMid = Math.round(((i + 0.55) / DELAYS_MS.length) * 99)
    onProgress({ percent: percentMid, stageIndex: i })
    await delay(DELAYS_MS[i]!)
    if (signal.aborted) return
    onProgress({ percent: Math.round(((i + 1) / DELAYS_MS.length) * 100), stageIndex: i })
  }
  if (!signal.aborted) {
    onProgress({ percent: 100, stageIndex: DELAYS_MS.length - 1 })
  }
}
