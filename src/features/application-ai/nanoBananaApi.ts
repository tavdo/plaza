import type { ApplicationMetalTone } from './metalFromCoinType'

const DEFAULT_BASE = '/api/nanobanana'

function apiBase(): string {
  const b = import.meta.env.VITE_NANO_BANANA_API_BASE ?? DEFAULT_BASE
  return b.replace(/\/+$/, '')
}

/** Rich English prompt improves API output; NanoBanana is optimized for imagery, not GLB. */
export function buildNanoBananaImagePrompt(
  userPrompt: string,
  coinDisplayName: string,
  metalTone: ApplicationMetalTone,
): string {
  return [
    `Luxury Merge Stars bullion-derived product visualization (${coinDisplayName}, dominant ${metalTone} precious-metal grading).`,
    `Designer's brief: ${userPrompt.trim()}`,
    'Ultra-premium catalogue still life: sculpted metal object, gemstone micro-facet glints, controlled caustics, noir gradient background, cinematic three-point lighting, advertising hero shot, photoreal shading.',
    'Composition: centered hero piece, tactile metal grain, restrained depth-of-field.',
  ].join(' ')
}

type Generate2Json = {
  code?: number
  message?: string
  msg?: string
  data?: { taskId?: string }
}

type RecordInfoJson = {
  code?: number
  msg?: string
  data?: {
    successFlag?: number
    response?: { resultImageUrl?: string; originImageUrl?: string }
    errorMessage?: string
    taskId?: string
  }
}

/**
 * Starts NanoBanana 2 generation (text-to-image when imageUrls is empty).
 * TODO: Tune aspectRatio / resolution via user preferences once billing/UI allows.
 */
export async function nanoBananaGenerate2(args: {
  prompt: string
  signal?: AbortSignal
  aspectRatio?: string
  resolution?: '1K' | '2K' | '4K'
}): Promise<{ taskId: string }> {
  const res = await fetch(`${apiBase()}/generate-2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: args.prompt,
      imageUrls: [],
      aspectRatio: args.aspectRatio ?? '1:1',
      resolution: args.resolution ?? '1K',
      googleSearch: false,
      outputFormat: 'png',
    }),
    signal: args.signal,
  })
  const json = (await res.json()) as Generate2Json
  if (!res.ok || json.code !== 200 || !json.data?.taskId) {
    throw new Error(json.message ?? json.msg ?? `Nano Banana generate failed (${res.status})`)
  }
  return { taskId: json.data.taskId }
}

export async function nanoBananaFetchTaskRecord(args: { taskId: string; signal?: AbortSignal }): Promise<NonNullable<RecordInfoJson['data']>> {
  const qs = new URLSearchParams({ taskId: args.taskId })
  const res = await fetch(`${apiBase()}/record-info?${qs.toString()}`, {
    method: 'GET',
    signal: args.signal,
  })
  const json = (await res.json()) as RecordInfoJson
  if (!res.ok || json.code !== 200 || json.data === undefined || json.data === null) {
    throw new Error(json.msg ?? `Nano Banana record-info failed (${res.status})`)
  }
  return json.data
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Polls until NanoBanana task completes / fails / timeout.
 * TODO: Prefer callBackUrl + backend webhook in production instead of polling.
 */
export async function pollNanoBananaTask(args: {
  taskId: string
  signal: AbortSignal
  onProgressPercent: (percent: number) => void
  maxMs?: number
  pollIntervalMs?: number
}): Promise<string> {
  const maxMs = args.maxMs ?? 120_000
  const gap = args.pollIntervalMs ?? 2_600
  const start = Date.now()

  while (Date.now() - start < maxMs) {
    if (args.signal.aborted) throw new DOMException('Aborted', 'AbortError')

    const data = await nanoBananaFetchTaskRecord({ taskId: args.taskId, signal: args.signal })
    const flag = data.successFlag

    const elapsed = Date.now() - start
    args.onProgressPercent(Math.min(93, 15 + Math.round((elapsed / maxMs) * 78)))

    if (flag === 1) {
      const url = data.response?.resultImageUrl || data.response?.originImageUrl
      if (!url) throw new Error('Nano Banana returned no image URL')
      args.onProgressPercent(96)
      return url
    }
    if (flag === 2 || flag === 3) {
      throw new Error(data.errorMessage ?? 'Nano Banana generation failed')
    }

    await sleep(gap)
    if (args.signal.aborted) throw new DOMException('Aborted', 'AbortError')
  }
  throw new Error('Nano Banana task timed out')
}
