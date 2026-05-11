import type { ApplicationAiPreviewSnapshot } from '../../types/index'
import type { ApplicationMetalTone } from './metalFromCoinType'
import { hashPrompt } from './hashPrompt'

const GLB_MAP: Record<ApplicationMetalTone, string> = {
  gold: '/models/gold_ring.glb',
  silver: '/models/silver_helmet.glb',
  platinum: '/models/platinum_vase.glb',
}

const FILES: Record<ApplicationMetalTone, string> = {
  gold: 'gold_ring.glb',
  silver: 'silver_helmet.glb',
  platinum: 'platinum_vase.glb',
}

/**
 * Builds a deterministic mock Nano Banana preview for the embedded application flow.
 * TODO: Connect Nano Banana API here — replace with signed GLB URLs + authoritative stats.
 */
export function buildEmbeddedAiPreviewPayload(args: {
  prompt: string
  metal: ApplicationMetalTone
  amountKg: number
  coinDisplayName: string
}): ApplicationAiPreviewSnapshot {
  const now = new Date().toISOString()
  const h = hashPrompt(args.prompt.trim() + args.metal)
  const poly = Math.round((820_000 + (h % 240_000)) * (args.metal === 'platinum' ? 1.04 : args.metal === 'gold' ? 0.98 : 1))
  const aiScore = 84 + ((h >>> 5) % 15)
  const cost = Math.round(args.amountKg * 120 * (args.metal === 'gold' ? 1.7 : args.metal === 'platinum' ? 2.05 : 1.2) + 450 + (h % 180))

  return {
    prompt: args.prompt.trim(),
    objectDisplayName: summarizeObjectName(args.prompt),
    coinTypeMetal: args.metal,
    glbFilename: FILES[args.metal],
    glbUrl: GLB_MAP[args.metal],
    polygonCount: poly,
    aiQualityScore: aiScore,
    renderQualityKey: 'app.ai.render.exec',
    estimatedProductionCostUsd: cost / 100,
    estimatedMetalWeightKg: Math.round(amountKgEstimate(args.amountKg, h) * 1000) / 1000,
    createdAt: now,
  }
}

function amountKgEstimate(amount: number, h: number) {
  return Math.min(850, Math.max(0.025, amount * (0.8 + ((h >>> 9) % 40) / 100)))
}

function summarizeObjectName(prompt: string) {
  const p = prompt.trim()
  const short = p.length > 64 ? `${p.slice(0, 61)}…` : p
  return short || 'Concept'
}
