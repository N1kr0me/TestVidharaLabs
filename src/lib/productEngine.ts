import type { District } from '@/data/districts'
import { districts } from '@/data/districts'
import {
  estimateDap,
  fetchFeatures,
  type EnvironmentalFeatures,
  type GrowthStage,
  type QualityBand,
} from '@/lib/features'

export type RiskBand = 'Low' | 'Watch' | 'Elevated'

/** Domestic + major chilli export destinations (mock compliance set). */
export const COMPLIANCE_MARKETS = [
  'India',
  'EU',
  'China',
  'Thailand',
  'Bangladesh',
  'USA',
  'Indonesia',
  'Sri Lanka',
  'Malaysia',
] as const

export type ComplianceMarket = (typeof COMPLIANCE_MARKETS)[number]

export type MarketScore = {
  market: ComplianceMarket
  score: number
}

export type ProductPrediction = {
  district: District
  stage: GrowthStage
  features: EnvironmentalFeatures
  /** Internal ESI-style scores for ranking (higher = more disease pressure) */
  diseaseEsi: number
  anthracnoseEsi: number
  wiltEsi: number
  leafCurlEsi: number
  aflatoxinEsi: number
  qualityScore: number
  diseaseBand: RiskBand
  qualityBand: QualityBand
  contaminationBand: RiskBand
  compliance: MarketScore[]
  /** Sorted high → low */
  complianceRanked: MarketScore[]
  compoundYieldIndex: number
  sourcingProxyIndex: number
  rationale: string[]
  agronomyRationale: string[]
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/**
 * Relative regulatory / buyer-spec friction (higher = harder to clear).
 * Used only to differentiate mock 0–10 readiness from the same aflatoxin ESI.
 */
const MARKET_STRICTNESS: Record<ComplianceMarket, number> = {
  India: 0.15,
  China: 0.35,
  Thailand: 0.4,
  Bangladesh: 0.3,
  Indonesia: 0.4,
  'Sri Lanka': 0.38,
  Malaysia: 0.42,
  USA: 0.7,
  EU: 1.0,
}

function complianceScoreForMarket(
  aflatoxinEsi: number,
  contaminationBand: RiskBand,
  market: ComplianceMarket,
): number {
  const base = 10 - aflatoxinEsi / 10
  const strict = MARKET_STRICTNESS[market]
  const bandHit =
    contaminationBand === 'Elevated'
      ? 1.4 * strict
      : contaminationBand === 'Watch'
        ? 0.6 * strict
        : 0
  return Number(clamp(base - bandHit - strict * 0.9 + 0.5, 0, 10).toFixed(1))
}

function seedFromCoords(lat: number, lon: number): number {
  const x = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Band from score vs implied regional thirds (0–100 scale). */
export function riskBandFromScore(score: number): RiskBand {
  if (score >= 66) return 'Elevated'
  if (score >= 33) return 'Watch'
  return 'Low'
}

export function qualityBandFromScore(score: number): QualityBand {
  if (score < 40) return 'Below-normal'
  if (score >= 65) return 'Above-normal'
  return 'Normal'
}

/**
 * Unified Strategy rule book → disease / quality / contamination ESIs.
 */
export function computePrediction(
  district: District,
  f: EnvironmentalFeatures,
  stage: GrowthStage,
): ProductPrediction {
  const dap = estimateDap(stage)
  const rationale: string[] = []
  const agronomyRationale: string[] = []

  let anthracnose = 15
  let bacterialWilt = 15
  let leafCurl = 10
  let aflatoxin = 12

  const tempInAnth = f.meanTempC >= 24 && f.meanTempC <= 28
  const highRh = f.relativeHumidityPct >= 80
  const consecutiveHighRh = f.consecutiveHighRhDays ?? f.consecutiveWetDays

  if (tempInAnth && highRh) {
    anthracnose += 22
    agronomyRationale.push(
      `Anthracnose ESI↑ — temp ${f.meanTempC}°C in 24–28°C band with RH ${f.relativeHumidityPct}% (≥80%)`,
    )
  } else if (highRh) {
    anthracnose += 10
  }
  if (consecutiveHighRh >= 5) {
    anthracnose += 12 + Math.min(10, (consecutiveHighRh - 5) * 2)
    agronomyRationale.push(
      `${consecutiveHighRh} consecutive high-RH / wet days — leaf-wetness window for Colletotrichum`,
    )
  }
  if (f.rainfallEvents30d >= 8) {
    anthracnose += 12
    agronomyRationale.push(
      `Rain-splash risk: ${f.rainfallEvents30d} rainfall events (≥1 mm) in window`,
    )
  }
  if (stage === 'Ripening') {
    anthracnose += 16
    agronomyRationale.push('Ripening stage — anthracnose rules weighted highest')
  } else if (stage === 'Fruit development') {
    anthracnose += 8
  }

  if (f.soilMoisture >= 0.3 && f.meanTempC >= 24) {
    bacterialWilt += 22
    agronomyRationale.push('Warm moist soil — bacterial wilt favourable')
  }
  if (f.soilPh < 7.2) {
    bacterialWilt += 12
    agronomyRationale.push(`Soil pH ${f.soilPh} (acidic/neutral favours wilt)`)
  } else {
    bacterialWilt -= 8
    agronomyRationale.push(`Alkaline soil pH ${f.soilPh} — wilt suppressed`)
  }
  if (f.topographicWetnessIndex >= 10) {
    bacterialWilt += 15
    agronomyRationale.push('High TWI — waterlogging propensity')
  }

  if (f.meanTempC >= 23 && f.meanTempC <= 28) {
    leafCurl += 20
    agronomyRationale.push('Whitefly-preferred temperature band (~25°C)')
  }
  if (stage === 'Vegetative' || stage === 'Flowering') {
    leafCurl += 15
  } else {
    leafCurl -= 5
  }

  // Aflatoxin: warm humid + rain events in ripening; drying caveat
  if (highRh && f.meanTempC >= 25) {
    aflatoxin += 18
  }
  if (f.rainfallEvents30d >= 8) aflatoxin += 14
  if (stage === 'Ripening') {
    aflatoxin += 16
    agronomyRationale.push(
      'Aflatoxin ESI↑ at ripening — pre-harvest signal only; drying/storage not observed',
    )
  }
  if (f.maxTempC >= 35 && highRh) aflatoxin += 8

  anthracnose = clamp(anthracnose, 5, 95)
  bacterialWilt = clamp(bacterialWilt, 5, 95)
  leafCurl = clamp(leafCurl, 5, 95)
  aflatoxin = clamp(aflatoxin, 5, 95)

  const diseaseEsi = Number(
    (anthracnose * 0.4 + bacterialWilt * 0.35 + leafCurl * 0.25).toFixed(1),
  )

  // Quality — ASTA colour leaning (ripening radiation + heat)
  let qualityScore = 50
  const radiation = f.shortwaveRadiationSum ?? null

  if (stage === 'Ripening' || stage === 'Fruit development') {
    if (f.meanTempC >= 22 && f.meanTempC <= 30 && f.maxTempC < 36) {
      qualityScore += 12
      rationale.push('Moderate ripening temperatures support ASTA colour')
    }
    if (f.maxTempC >= 38) {
      qualityScore -= 18
      rationale.push('Excess heat stress — colour fade risk')
    }
    if (radiation != null) {
      if (radiation < 15) {
        qualityScore -= 14
        rationale.push(
          `Reduced ripening-stage radiation exposure (${radiation.toFixed(1)} MJ/m²) — ASTA colour pressure`,
        )
        agronomyRationale.push(
          `Radiation ${radiation.toFixed(1)} MJ/m² below favourable ripening window`,
        )
      } else if (radiation >= 18) {
        qualityScore += 8
      }
    } else if (f.maxTempC < 32 && !highRh) {
      qualityScore += 4
    }
  }

  if (stage === 'Fruit development' || stage === 'Flowering') {
    if (f.vapourPressureDeficit >= 1.5 && f.vapourPressureDeficit <= 2.2) {
      qualityScore += 6
    }
    if (f.maxTempC >= 40) {
      qualityScore -= 10
      rationale.push('Severe heat — uneven fruit set / inconsistent heat')
    }
  }

  if (f.soilMoisture >= 0.22 && f.soilMoisture <= 0.32) {
    qualityScore += 8
  } else if (f.soilMoisture < 0.2) {
    qualityScore -= 12
    rationale.push('Severe water stress — oleoresin/yield risk')
  }

  if (diseaseEsi >= 55) {
    qualityScore -= 15
    rationale.push('Elevated disease-favourable conditions weigh on quality')
  }

  qualityScore = clamp(qualityScore, 10, 95)
  const diseaseBand = riskBandFromScore(diseaseEsi)
  const qualityBand = qualityBandFromScore(qualityScore)
  const contaminationBand = riskBandFromScore(aflatoxin)

  // L2 Compliance readiness (0–10) per market — same aflatoxin ESI, different strictness
  const compliance: MarketScore[] = COMPLIANCE_MARKETS.map((market) => ({
    market,
    score: complianceScoreForMarket(aflatoxin, contaminationBand, market),
  }))
  const complianceRanked = [...compliance].sort((a, b) => b.score - a.score)

  // L3 Compound yield — weather biomass proxy × quality factor (no NDVI)
  let yieldCond = 6.5
  const heatDays = f.heatStressDays ?? (f.maxTempC >= 35 ? 4 : 1)
  const drySpell = f.drySpellDays ?? (f.soilMoisture < 0.2 ? 6 : 2)
  yieldCond -= Math.min(3, heatDays * 0.35)
  yieldCond -= Math.min(2.5, Math.max(0, drySpell - 3) * 0.3)
  if (f.rainfallEvents30d >= 12) yieldCond -= 1.2
  if (f.vapourPressureDeficit >= 1.2 && f.vapourPressureDeficit <= 2.0) {
    yieldCond += 0.8
  }
  if (f.soilMoisture >= 0.22 && f.soilMoisture <= 0.35) yieldCond += 0.7
  yieldCond = clamp(yieldCond, 1, 10)
  const qFactor =
    qualityBand === 'Above-normal' ? 1.15 : qualityBand === 'Below-normal' ? 0.7 : 1.0
  const compoundYieldIndex = Number(clamp(yieldCond * qFactor, 0, 10).toFixed(1))

  // L4 sourcing proxy
  const diseasePenalty =
    diseaseBand === 'Elevated' ? 3.2 : diseaseBand === 'Watch' ? 1.4 : 0
  const qualityBoost =
    qualityBand === 'Above-normal' ? 1.5 : qualityBand === 'Below-normal' ? -1.2 : 0.3
  const complianceAvg =
    compliance.reduce((s, c) => s + c.score, 0) / compliance.length
  const sourcingProxyIndex = Number(
    clamp(
      5.5 - diseasePenalty + qualityBoost + complianceAvg * 0.25 + compoundYieldIndex * 0.15,
      0,
      10,
    ).toFixed(1),
  )

  if (diseaseBand === 'Elevated') {
    rationale.push(
      `Disease potential Elevated (blended ESI ${diseaseEsi}) — anthracnose-weighted`,
    )
  } else if (diseaseBand === 'Watch') {
    rationale.push(`Disease potential Watch (blended ESI ${diseaseEsi})`)
  } else {
    rationale.push(`Disease potential Low (blended ESI ${diseaseEsi})`)
  }
  rationale.push(`Quality potential ${qualityBand}`)
  rationale.push(
    `Contamination (aflatoxin ESI) ${contaminationBand} · best market ${complianceRanked[0].market} ${complianceRanked[0].score}/10`,
  )
  rationale.push(`Growth stage ${stage} · estimated DAP ${dap}`)

  return {
    district,
    stage,
    features: f,
    diseaseEsi,
    anthracnoseEsi: anthracnose,
    wiltEsi: bacterialWilt,
    leafCurlEsi: leafCurl,
    aflatoxinEsi: aflatoxin,
    qualityScore,
    diseaseBand,
    qualityBand,
    contaminationBand,
    compliance,
    complianceRanked,
    compoundYieldIndex,
    sourcingProxyIndex,
    rationale,
    agronomyRationale:
      agronomyRationale.length > 0 ? agronomyRationale : rationale.slice(0, 4),
  }
}

/**
 * Seasonal climate proxy for peer ranking (no API). Live fetch overlays selected districts.
 */
export function seasonalProxyFeatures(
  lat: number,
  lon: number,
): EnvironmentalFeatures {
  const s = seedFromCoords(lat, lon)
  const month = new Date().getMonth() + 1
  // Rough India monsoon / post-monsoon tilt
  const monsoon = month >= 6 && month <= 9
  const meanTempC = Number(lerp(monsoon ? 26 : 24, monsoon ? 32 : 30, s).toFixed(1))
  const maxTempC = Number((meanTempC + lerp(4, 10, s)).toFixed(1))
  const minTempC = Number((meanTempC - lerp(4, 8, 1 - s)).toFixed(1))
  const relativeHumidityPct = Number(
    lerp(monsoon ? 70 : 45, monsoon ? 95 : 75, s).toFixed(0),
  )
  const rainfallEvents30d = Math.round(lerp(monsoon ? 6 : 1, monsoon ? 16 : 8, s))
  const consecutiveWetDays = Math.round(lerp(monsoon ? 2 : 0, monsoon ? 10 : 4, s))
  const soilMoisture = Number(lerp(monsoon ? 0.22 : 0.14, monsoon ? 0.42 : 0.28, s).toFixed(3))
  const soilPh = Number(lerp(5.8, 7.8, seedFromCoords(lat + 1, lon - 1)).toFixed(1))
  const vpd = Number(lerp(0.6, 2.6, 1 - s).toFixed(2))
  const twi = Number(lerp(4, 14, s).toFixed(1))
  const elev = Math.round(lerp(20, 450, s))
  const radiation = Number(lerp(12, 24, 1 - (monsoon ? s * 0.6 : s * 0.3)).toFixed(1))
  const consecutiveHighRhDays =
    relativeHumidityPct >= 80 ? consecutiveWetDays + Math.round(s * 3) : Math.round(s * 2)
  const heatStressDays = maxTempC >= 35 ? Math.round(lerp(2, 9, s)) : Math.round(s * 2)
  const drySpellDays = rainfallEvents30d < 4 ? Math.round(lerp(4, 12, s)) : Math.round(s * 3)

  return {
    lat,
    lon,
    meanTempC,
    maxTempC,
    minTempC,
    relativeHumidityPct,
    rainfallEvents30d,
    consecutiveWetDays,
    soilMoisture,
    soilPh,
    ndvi: 0,
    vapourPressureDeficit: vpd,
    topographicWetnessIndex: twi,
    elevationM: elev,
    elevationSource: 'synthetic',
    source: 'synthetic-fallback',
    fetchedAt: new Date().toISOString(),
    shortwaveRadiationSum: radiation,
    consecutiveHighRhDays,
    heatStressDays,
    drySpellDays,
  }
}

export async function predictForDistrict(
  district: District,
  stage: GrowthStage,
  live = true,
): Promise<ProductPrediction> {
  const features = live
    ? await fetchFeatures(district.lat, district.lon)
    : seasonalProxyFeatures(district.lat, district.lon)
  return computePrediction(district, features, stage)
}

export type RankKey =
  | 'disease'
  | 'quality'
  | 'contamination'
  | 'complianceBest'
  | 'compoundYield'
  | 'sourcing'

export type RankedRow = {
  prediction: ProductPrediction
  ranks: Record<RankKey, number>
}

function rankMap(
  rows: { id: string; value: number }[],
  higherIsBetter: boolean,
): Map<string, number> {
  const sorted = [...rows].sort((a, b) =>
    higherIsBetter ? b.value - a.value : a.value - b.value,
  )
  const map = new Map<string, number>()
  sorted.forEach((r, i) => map.set(r.id, i + 1))
  return map
}

/** Rank all districts using seasonal proxies (fast). Overlay live predictions when provided. */
export function rankAllDistricts(
  stage: GrowthStage,
  liveById?: Map<string, ProductPrediction>,
): RankedRow[] {
  const preds = districts.map((d) => {
    const live = liveById?.get(d.id)
    if (live) return live
    return computePrediction(d, seasonalProxyFeatures(d.lat, d.lon), stage)
  })

  const diseaseRanks = rankMap(
    preds.map((p) => ({ id: p.district.id, value: p.diseaseEsi })),
    false,
  )
  const qualityRanks = rankMap(
    preds.map((p) => ({ id: p.district.id, value: p.qualityScore })),
    true,
  )
  const contamRanks = rankMap(
    preds.map((p) => ({ id: p.district.id, value: p.aflatoxinEsi })),
    false,
  )
  const complianceRanks = rankMap(
    preds.map((p) => ({
      id: p.district.id,
      value: p.complianceRanked[0]?.score ?? 0,
    })),
    true,
  )
  const compoundRanks = rankMap(
    preds.map((p) => ({ id: p.district.id, value: p.compoundYieldIndex })),
    true,
  )
  const sourcingRanks = rankMap(
    preds.map((p) => ({ id: p.district.id, value: p.sourcingProxyIndex })),
    true,
  )

  return preds.map((prediction) => ({
    prediction,
    ranks: {
      disease: diseaseRanks.get(prediction.district.id) ?? preds.length,
      quality: qualityRanks.get(prediction.district.id) ?? preds.length,
      contamination: contamRanks.get(prediction.district.id) ?? preds.length,
      complianceBest: complianceRanks.get(prediction.district.id) ?? preds.length,
      compoundYield: compoundRanks.get(prediction.district.id) ?? preds.length,
      sourcing: sourcingRanks.get(prediction.district.id) ?? preds.length,
    },
  }))
}

export function topN(
  ranked: RankedRow[],
  key: RankKey,
  n = 5,
): RankedRow[] {
  return [...ranked].sort((a, b) => a.ranks[key] - b.ranks[key]).slice(0, n)
}

export function l5Summary(
  role: 'quality-head' | 'agronomy' | 'procurement',
  p: ProductPrediction,
): { headline: string; action: string; detail: string } {
  const place = p.district.name
  if (role === 'quality-head') {
    return {
      headline:
        p.qualityBand === 'Below-normal'
          ? `${place}: ASTA colour trending below normal — driven by ripening heat/radiation stress.`
          : `${place}: Quality potential ${p.qualityBand}.`,
      action:
        p.qualityBand === 'Below-normal' || p.diseaseBand === 'Elevated'
          ? 'Recommend enhanced colorimetric / lot testing on incoming lots; flag for spec-sensitive customer allocation.'
          : 'Standard QC sampling; prioritise premium allocation if Above-normal.',
      detail: p.rationale.slice(0, 3).join(' '),
    }
  }
  if (role === 'agronomy') {
    return {
      headline: `${place}: Disease ${p.diseaseBand} (anthracnose ESI ${p.anthracnoseEsi.toFixed(0)}) · Contamination ${p.contaminationBand}.`,
      action:
        'Confirm / override the flag; request field verification if local treatment or outbreak is known.',
      detail: p.agronomyRationale.slice(0, 3).join(' '),
    }
  }
  // procurement
  const shift =
    p.diseaseBand === 'Elevated' && p.qualityBand === 'Below-normal'
  return {
    headline: `${place}: ${p.diseaseBand} risk this season.`,
    action: shift
      ? 'Recommend shifting 15–20% of planned volume to an alternate region, or budget for enhanced testing.'
      : p.diseaseBand === 'Elevated'
        ? 'Budget for enhanced testing before committing volume; monitor supplier more closely.'
        : p.diseaseBand === 'Watch'
          ? 'Flag for monitoring; no volume change yet; re-check closer to harvest.'
          : 'Standard sourcing plan.',
    detail: `Best compliance market: ${p.complianceRanked[0].market} (${p.complianceRanked[0].score}/10). Sourcing proxy ${p.sourcingProxyIndex}/10.`,
  }
}
