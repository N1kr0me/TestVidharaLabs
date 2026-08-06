import {
  frameSourcingForRole,
  sourcingDecision,
  type DecisionResult,
  type YieldBand,
} from '@/lib/decisions'
import type { QualityBand } from '@/lib/features'
import type { DistrictInsight, RiskBand } from '@/lib/productEngine'
import {
  collectInsightDecisions,
  districtNeedsAttention,
  isUrgentDecision,
} from '@/lib/urgency'

export type DistrictStatus = 'alert' | 'watch' | 'normal'

const RISK_RANK: Record<RiskBand, number> = {
  Low: 0,
  Watch: 1,
  Elevated: 2,
}

const QUALITY_RANK: Record<QualityBand, number> = {
  'Below-normal': 0,
  Normal: 1,
  'Above-normal': 2,
}

const YIELD_RANK: Record<YieldBand, number> = {
  'Below-normal': 0,
  Normal: 1,
  'Above-normal': 2,
}

function worstRisk(bands: RiskBand[]): RiskBand {
  return bands.reduce(
    (a, b) => (RISK_RANK[b] > RISK_RANK[a] ? b : a),
    'Low',
  )
}

function worstQuality(bands: QualityBand[]): QualityBand {
  return bands.reduce(
    (a, b) => (QUALITY_RANK[b] < QUALITY_RANK[a] ? b : a),
    'Above-normal',
  )
}

function worstYield(bands: YieldBand[]): YieldBand {
  return bands.reduce(
    (a, b) => (YIELD_RANK[b] < YIELD_RANK[a] ? b : a),
    'Above-normal',
  )
}

export function districtStatus(insight: DistrictInsight): DistrictStatus {
  if (districtNeedsAttention(insight)) return 'alert'
  const decisions = collectInsightDecisions(insight)
  if (
    decisions.some(
      (d) =>
        d.tone === 'warn' ||
        d.label === 'Watch' ||
        d.label.toLowerCase().includes('watch'),
    )
  ) {
    return 'watch'
  }
  return 'normal'
}

export function portfolioStatusCounts(insights: DistrictInsight[]) {
  let alert = 0
  let watch = 0
  let normal = 0
  for (const ins of insights) {
    const s = districtStatus(ins)
    if (s === 'alert') alert++
    else if (s === 'watch') watch++
    else normal++
  }
  return { alert, watch, normal, sourcing: insights.length }
}

/** Combined L6-style decision across all selected districts. */
export function buildCombinedPortfolioDecision(
  insights: DistrictInsight[],
): DecisionResult {
  if (insights.length === 0) {
    return {
      label: 'No districts',
      tone: 'neutral',
      action: 'Select at least two sourcing districts.',
      reasoning: 'Portfolio decision requires a district selection.',
    }
  }

  const sample = insights[0]
  const p = insights.map((i) => i.prediction)
  const disease = worstRisk(p.map((x) => x.diseaseBand))
  const quality = worstQuality(p.map((x) => x.qualityBand))
  const contamination = worstRisk(p.map((x) => x.contaminationBand))
  const yieldBand = worstYield(p.map((x) => x.compoundYieldBand))

  const base = sourcingDecision(disease, quality, yieldBand, contamination)
  const alertNames = insights
    .filter(districtNeedsAttention)
    .map((i) => i.prediction.district.name)
  const names = insights.map((i) => i.prediction.district.name).join(', ')

  const framed = frameSourcingForRole(
    base,
    sample.role,
    sample.company,
    {
      place: `${insights.length} districts`,
      variety: 'portfolio',
      disease,
      quality,
      contamination,
      compliance: insights
        .map((i) => i.layer3.compliance.label)
        .join('/'),
      history: insights
        .map((i) => i.layer5.yieldVsHistory.label)
        .join('/'),
      yieldLabel: yieldBand,
    },
    'portfolio',
  )

  return {
    ...framed,
    action: `${framed.action} Districts in scope: ${names}.`,
    reasoning: `${framed.reasoning}${alertNames.length ? ` Alert districts: ${alertNames.join(', ')}.` : ' No alert districts in the current set.'}`,
  }
}

export type RankedDistrict = {
  insight: DistrictInsight
  status: DistrictStatus
  urgencyScore: number
}

export function rankDistrictsByAlert(insights: DistrictInsight[]): RankedDistrict[] {
  return insights
    .map((insight) => {
      const decisions = collectInsightDecisions(insight)
      const urgencyScore =
        decisions.filter(isUrgentDecision).length * 10 +
        decisions.filter((d) => d.tone === 'warn').length +
        insight.prediction.diseaseEsi / 100
      return {
        insight,
        status: districtStatus(insight),
        urgencyScore,
      }
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
}
