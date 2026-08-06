import type { DecisionResult } from '@/lib/decisions'
import type { DistrictInsight } from '@/lib/productEngine'

/**
 * Urgent band labels that should pulse red (Elevated risk or low quality/history).
 */
export function isUrgentBandLabel(label: string): boolean {
  const l = label.toLowerCase().trim()
  return (
    l === 'elevated' ||
    l === 'below-normal' ||
    l === 'below-average' ||
    l.startsWith('below-')
  )
}

export function isUrgentDecision(decision: DecisionResult): boolean {
  return isUrgentBandLabel(decision.label)
}

/** All decision surfaces on a district card / matrix row. */
export function collectInsightDecisions(
  insight: DistrictInsight,
): DecisionResult[] {
  const { layer1: l1, layer2: l2, layer3: l3, layer4: l4, layer5: l5, layer6: l6 } =
    insight
  return [
    l1.plantDisease,
    l1.fungal,
    l1.bacterial,
    l1.viral,
    l2.quality,
    l2.moisture,
    l2.capsaicin,
    l2.asta,
    l3.contamination,
    l3.aflatoxin,
    l3.pesticide,
    l3.heavyMetal,
    l3.compliance,
    l4.yield,
    l5.yieldVsHistory,
    l6.decision,
  ]
}

export function districtNeedsAttention(insight: DistrictInsight): boolean {
  return collectInsightDecisions(insight).some(isUrgentDecision)
}

export function districtsNeedingAttention(
  insights: DistrictInsight[],
): string[] {
  return insights
    .filter(districtNeedsAttention)
    .map((i) => i.prediction.district.name)
}

export type LayerTabId = 1 | 2 | 3 | 4 | 5

/** True when any decision in that layer tab is Elevated / Below-*. */
export function layerHasAlert(
  insight: DistrictInsight,
  layer: LayerTabId,
): boolean {
  const { layer1: l1, layer2: l2, layer3: l3, layer4: l4, layer5: l5 } = insight
  const map: Record<LayerTabId, DecisionResult[]> = {
    1: [l1.plantDisease, l1.bacterial, l1.viral, l1.fungal],
    2: [l2.quality, l2.moisture, l2.capsaicin, l2.asta],
    3: [
      l3.contamination,
      l3.aflatoxin,
      l3.pesticide,
      l3.heavyMetal,
      l3.compliance,
    ],
    4: [l4.yield],
    5: [l5.yieldVsHistory],
  }
  return map[layer].some(isUrgentDecision)
}
