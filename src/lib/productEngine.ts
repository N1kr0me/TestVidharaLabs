import type { District } from '@/data/districts'
import { districts } from '@/data/districts'
import type { CompanyId, CompanyProfile } from '@/lib/companies'
import { getCompany } from '@/lib/companies'
import {
  complianceDecisionMock,
  contaminationPotentialDecision,
  extractibleYieldDecision,
  frameSourcingForRole,
  pathwayDecision,
  plantDiseasePotentialDecision,
  qualityDecisionForCompany,
  qualityPathwayDecision,
  sourcingDecision,
  yieldBandFromIndex,
  yieldVsHistoryDecision,
  type DecisionResult,
  type HistoryTrendBand,
  type YieldBand,
} from '@/lib/decisions'
import {
  fetchFeatures,
  type EnvironmentalFeatures,
  type GrowthStage,
  type QualityBand,
} from '@/lib/features'
import type { UserRoleId } from '@/lib/roles'
import {
  getVariety,
  varietyStageMetrics,
  type ChilliVariety,
} from '@/lib/varieties'

export type RiskBand = 'Low' | 'Watch' | 'Elevated'

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
  varietyId: string
  features: EnvironmentalFeatures
  diseaseEsi: number
  anthracnoseEsi: number
  wiltEsi: number
  leafCurlEsi: number
  aflatoxinEsi: number
  heavyMetalEsi: number
  pesticideEsi: number
  contaminationEsi: number
  qualityScore: number
  astaScore: number
  capsaicinScore: number
  moistureScore: number
  /** Kept for legacy; always unused in UI (oleoresin dropped). */
  oleoresinScore: number
  diseaseBand: RiskBand
  fungalBand: RiskBand
  bacterialBand: RiskBand
  viralBand: RiskBand
  aflatoxinBand: RiskBand
  heavyMetalBand: RiskBand
  pesticideBand: RiskBand
  qualityBand: QualityBand
  astaBand: QualityBand
  capsaicinBand: QualityBand
  moistureBand: QualityBand
  oleoresinBand: QualityBand
  contaminationBand: RiskBand
  compliance: MarketScore[]
  complianceRanked: MarketScore[]
  yieldIndex: number
  yieldBand: YieldBand
  biomassIndex: number
  biomassBand: YieldBand
  compoundYieldIndex: number
  compoundYieldBand: YieldBand
  yieldVsHistoryDeltaPct: number
  yieldVsHistoryBand: HistoryTrendBand
  sourcingProxyIndex: number
  rationale: string[]
  agronomyRationale: string[]
  qualityDrivers: string[]
  contaminationDrivers: string[]
  phenology: { dap: number; dat: number; gdd: number }
}

export type DistrictInsight = {
  prediction: ProductPrediction
  company: CompanyProfile
  role: UserRoleId
  market: ComplianceMarket
  layer1: {
    plantDisease: DecisionResult
    fungal: DecisionResult
    bacterial: DecisionResult
    viral: DecisionResult
  }
  layer2: {
    quality: DecisionResult
    moisture: DecisionResult
    capsaicin: DecisionResult
    asta: DecisionResult
  }
  layer3: {
    contamination: DecisionResult
    aflatoxin: DecisionResult
    pesticide: DecisionResult
    heavyMetal: DecisionResult
    compliance: DecisionResult
  }
  layer4: {
    /** Single card — extractible yield potential (compound × biomass). */
    yield: DecisionResult
  }
  layer5: {
    yieldVsHistory: DecisionResult
  }
  layer6: {
    /** Narrative then decision — single card. */
    summary: string
    decision: DecisionResult
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

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

function leanAdjust(lean: 'low' | 'medium' | 'high', base: number): number {
  if (lean === 'high') return base + 8
  if (lean === 'low') return base - 8
  return base
}

export function computePrediction(
  district: District,
  f: EnvironmentalFeatures,
  stage: GrowthStage,
  varietyId = 'guntur-sannam',
): ProductPrediction {
  const variety = getVariety(varietyId)
  const pheno = varietyStageMetrics(varietyId, stage)
  const rationale: string[] = []
  const agronomyRationale: string[] = []

  let anthracnose = 15
  let bacterialWilt = 15
  let leafCurl = 10
  let aflatoxin = 12
  let heavyMetal = 18
  let pesticide = 16

  const tempInAnth = f.meanTempC >= 24 && f.meanTempC <= 28
  const highRh = f.relativeHumidityPct >= 80
  const consecutiveHighRh = f.consecutiveHighRhDays ?? f.consecutiveWetDays

  if (tempInAnth && highRh) {
    anthracnose += 22
    agronomyRationale.push(
      `Fungal pressure — temp ${f.meanTempC}°C · RH ${f.relativeHumidityPct}%`,
    )
  } else if (highRh) {
    anthracnose += 10
  }
  if (consecutiveHighRh >= 5) {
    anthracnose += 12 + Math.min(10, (consecutiveHighRh - 5) * 2)
  }
  if (f.rainfallEvents30d >= 8) anthracnose += 12
  if (stage === 'Ripening') anthracnose += 16
  else if (stage === 'Fruit development') anthracnose += 8
  if (pheno.gdd < 500 && stage !== 'Vegetative') anthracnose += 4

  if (f.soilMoisture >= 0.3 && f.meanTempC >= 24) {
    bacterialWilt += 22
    agronomyRationale.push('Warm moist soil — bacterial wilt favourable')
  }
  if (f.soilPh < 7.2) bacterialWilt += 12
  else bacterialWilt -= 8
  if (f.topographicWetnessIndex >= 10) bacterialWilt += 15

  if (f.meanTempC >= 23 && f.meanTempC <= 28) {
    leafCurl += 20
    agronomyRationale.push('Whitefly temperature band — viral vector activity')
  }
  if (stage === 'Vegetative' || stage === 'Flowering') leafCurl += 15
  else leafCurl -= 5

  if (highRh && f.meanTempC >= 25) aflatoxin += 18
  if (f.rainfallEvents30d >= 8) aflatoxin += 14
  if (stage === 'Ripening') aflatoxin += 16
  if (f.maxTempC >= 35 && highRh) aflatoxin += 8

  heavyMetal += f.topographicWetnessIndex >= 11 ? 12 : 0
  heavyMetal += f.elevationM < 80 ? 8 : 0
  heavyMetal += seedFromCoords(district.lat, district.lon) > 0.7 ? 10 : 0

  pesticide += f.rainfallEvents30d >= 10 ? 14 : 6
  pesticide += stage === 'Fruit development' || stage === 'Ripening' ? 10 : 0
  pesticide += highRh ? 8 : 0

  const contaminationDrivers: string[] = []
  if (highRh && f.meanTempC >= 25) {
    contaminationDrivers.push(
      `Warm humid air — aflatoxin favourable (${f.meanTempC}°C · RH ${f.relativeHumidityPct}%)`,
    )
  }
  if (stage === 'Ripening' && highRh) {
    contaminationDrivers.push('Ripening under high RH — mycotoxin watch')
  }
  if (f.rainfallEvents30d >= 10) {
    contaminationDrivers.push(
      `${f.rainfallEvents30d} rain events/30d — residue wash / spray pressure`,
    )
  }
  if (f.topographicWetnessIndex >= 11 || f.elevationM < 80) {
    contaminationDrivers.push('Wet / low-elevation soils — heavy-metal lean')
  }

  anthracnose = clamp(anthracnose, 5, 95)
  bacterialWilt = clamp(bacterialWilt, 5, 95)
  leafCurl = clamp(leafCurl, 5, 95)
  aflatoxin = clamp(aflatoxin, 5, 95)
  heavyMetal = clamp(heavyMetal, 5, 95)
  pesticide = clamp(pesticide, 5, 95)

  const diseaseEsi = Number(
    (anthracnose * 0.4 + bacterialWilt * 0.35 + leafCurl * 0.25).toFixed(1),
  )

  let astaScore = leanAdjust(variety.colourLean, 50)
  let capsaicinScore = leanAdjust(
    variety.heatLean === 'hot'
      ? 'high'
      : variety.heatLean === 'mild'
        ? 'low'
        : 'medium',
    50,
  )
  const radiation = f.shortwaveRadiationSum ?? null

  if (stage === 'Ripening' || stage === 'Fruit development') {
    if (f.meanTempC >= 22 && f.meanTempC <= 30 && f.maxTempC < 36) {
      astaScore += 12
      rationale.push('Moderate ripening temperatures support ASTA colour')
    }
    if (f.maxTempC >= 38) {
      astaScore -= 18
      rationale.push('Excess heat stress — colour fade risk')
    }
    if (radiation != null) {
      if (radiation < 15) {
        astaScore -= 14
        rationale.push(
          `Reduced radiation (${radiation.toFixed(1)} MJ/m²) — ASTA pressure`,
        )
      } else if (radiation >= 18) astaScore += 8
    }
  }

  if (stage === 'Fruit development' || stage === 'Flowering') {
    if (f.vapourPressureDeficit >= 1.5 && f.vapourPressureDeficit <= 2.2) {
      capsaicinScore += 8
    }
    if (f.maxTempC >= 40) {
      capsaicinScore -= 10
    }
  }

  // Moisture potential (literature lean: RH↑ / rain↑ / soil moisture↑ raise
  // retained moisture; high temp & ripening stage lower it; NDVI as vigor proxy)
  let moistureScore = 48
  const moistureDrivers: string[] = []
  if (f.relativeHumidityPct >= 80) {
    moistureScore += 14
    moistureDrivers.push(`High RH ${f.relativeHumidityPct}%`)
  } else if (f.relativeHumidityPct >= 65) {
    moistureScore += 5
  } else {
    moistureScore -= 8
    moistureDrivers.push(`Lower RH ${f.relativeHumidityPct}%`)
  }
  if (f.rainfallEvents30d >= 10) {
    moistureScore += 10
    moistureDrivers.push(`${f.rainfallEvents30d} rain events/30d`)
  } else if (f.rainfallEvents30d <= 3) {
    moistureScore -= 8
  }
  if (f.soilMoisture >= 0.28) {
    moistureScore += 12
    moistureDrivers.push(`Soil moisture ${f.soilMoisture.toFixed(2)}`)
  } else if (f.soilMoisture < 0.2) {
    moistureScore -= 12
    moistureDrivers.push('Dry soil — lower fruit moisture lean')
  }
  if (f.meanTempC >= 32) {
    moistureScore -= 10
    moistureDrivers.push(`Warm mean ${f.meanTempC}°C`)
  }
  if (stage === 'Vegetative' || stage === 'Flowering') {
    moistureScore += 8
    moistureDrivers.push(`${stage} — greener / higher moisture lean`)
  } else if (stage === 'Ripening') {
    moistureScore -= 6
    moistureDrivers.push('Ripening — lower moisture lean vs green fruit')
  }
  if (f.ndvi > 0.45) {
    moistureScore += 4
    moistureDrivers.push(`NDVI ${f.ndvi.toFixed(2)} vigor proxy`)
  } else if (f.ndvi > 0 && f.ndvi < 0.25) {
    moistureScore -= 4
  }

  if (diseaseEsi >= 55) {
    astaScore -= 12
    rationale.push('Elevated disease-favourable conditions weigh on quality')
  }

  astaScore = clamp(astaScore, 10, 95)
  capsaicinScore = clamp(capsaicinScore, 10, 95)
  moistureScore = clamp(moistureScore, 10, 95)
  const oleoresinScore = 50 // dropped from UI / quality blend
  const qualityScore = Number(
    (astaScore * 0.4 + capsaicinScore * 0.3 + moistureScore * 0.3).toFixed(1),
  )

  const fungalBand = riskBandFromScore(anthracnose)
  const bacterialBand = riskBandFromScore(bacterialWilt)
  const viralBand = riskBandFromScore(leafCurl)
  const aflatoxinBand = riskBandFromScore(aflatoxin)
  const heavyMetalBand = riskBandFromScore(heavyMetal)
  const pesticideBand = riskBandFromScore(pesticide)
  const diseaseBand = riskBandFromScore(diseaseEsi)
  const contaminationEsi = Number(
    (aflatoxin * 0.45 + pesticide * 0.35 + heavyMetal * 0.2).toFixed(1),
  )
  const contaminationBand = riskBandFromScore(contaminationEsi)
  const astaBand = qualityBandFromScore(astaScore)
  const capsaicinBand = qualityBandFromScore(capsaicinScore)
  const moistureBand = qualityBandFromScore(moistureScore)
  const oleoresinBand = qualityBandFromScore(oleoresinScore)
  const qualityBand = qualityBandFromScore(qualityScore)

  const compliance: MarketScore[] = COMPLIANCE_MARKETS.map((market) => ({
    market,
    score: complianceScoreForMarket(aflatoxin, contaminationBand, market),
  }))
  const complianceRanked = [...compliance].sort((a, b) => b.score - a.score)

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
  yieldCond += clamp((pheno.gdd - 900) / 400, -0.6, 0.8)
  yieldCond = clamp(yieldCond, 1, 10)
  const yieldIndex = Number(yieldCond.toFixed(1))
  const yieldBand = yieldBandFromIndex(yieldIndex)

  // Biomass — NDVI + GDD + stage lean (synthetic)
  let biomass = 5.5
  if (f.ndvi > 0) biomass += clamp((f.ndvi - 0.35) * 8, -2, 2.5)
  else biomass += clamp((pheno.gdd - 900) / 500, -1, 1.2)
  if (stage === 'Fruit development' || stage === 'Ripening') biomass += 0.6
  if (diseaseEsi >= 60) biomass -= 1.2
  biomass = clamp(biomass, 1, 10)
  const biomassIndex = Number(biomass.toFixed(1))
  const biomassBand = yieldBandFromIndex(biomassIndex)

  const qFactor =
    qualityBand === 'Above-normal' ? 1.15 : qualityBand === 'Below-normal' ? 0.7 : 1.0
  const compoundYieldIndex = Number(
    clamp(yieldIndex * 0.55 + biomassIndex * 0.45 * qFactor, 0, 10).toFixed(1),
  )
  const compoundYieldBand = yieldBandFromIndex(compoundYieldIndex)

  // Mock 5-year average baseline ~5.5; delta% from current compound index
  const histBase = 5.5 + (seedFromCoords(district.lat, district.lon) - 0.5) * 0.6
  const yieldVsHistoryDeltaPct = Number(
    (((compoundYieldIndex - histBase) / histBase) * 100).toFixed(1),
  )
  let yieldVsHistoryBand: HistoryTrendBand = 'Near-average'
  if (yieldVsHistoryDeltaPct <= -8) yieldVsHistoryBand = 'Below-average'
  else if (yieldVsHistoryDeltaPct >= 8) yieldVsHistoryBand = 'Above-average'

  const diseasePenalty =
    diseaseBand === 'Elevated' ? 3.2 : diseaseBand === 'Watch' ? 1.4 : 0
  const qualityBoost =
    qualityBand === 'Above-normal' ? 1.5 : qualityBand === 'Below-normal' ? -1.2 : 0.3
  const complianceAvg =
    compliance.reduce((s, c) => s + c.score, 0) / compliance.length
  const sourcingProxyIndex = Number(
    clamp(
      5.5 -
        diseasePenalty +
        qualityBoost +
        complianceAvg * 0.25 +
        compoundYieldIndex * 0.15,
      0,
      10,
    ).toFixed(1),
  )

  rationale.push(
    `Variety ${variety.name} · DAP ${pheno.dap} · DAT ${pheno.dat} · GDD ${pheno.gdd}`,
  )
  rationale.push(`Disease ${diseaseBand} (blended ESI ${diseaseEsi})`)
  rationale.push(
    `Quality ${qualityBand} (ASTA ${astaBand} · Capsaicin ${capsaicinBand} · Moisture ${moistureBand})`,
  )
  if (moistureDrivers.length) {
    rationale.push(`Moisture drivers: ${moistureDrivers.slice(0, 3).join('; ')}`)
  }

  const qualityDrivers = [
    ...moistureDrivers.slice(0, 2),
    ...rationale
      .filter(
        (r) =>
          r.includes('ASTA') ||
          r.includes('colour') ||
          r.includes('heat') ||
          r.includes('Capsaicin'),
      )
      .slice(0, 1),
  ]

  return {
    district,
    stage,
    varietyId,
    features: f,
    diseaseEsi,
    anthracnoseEsi: anthracnose,
    wiltEsi: bacterialWilt,
    leafCurlEsi: leafCurl,
    aflatoxinEsi: aflatoxin,
    heavyMetalEsi: heavyMetal,
    pesticideEsi: pesticide,
    contaminationEsi,
    qualityScore,
    astaScore,
    capsaicinScore,
    moistureScore,
    oleoresinScore,
    diseaseBand,
    fungalBand,
    bacterialBand,
    viralBand,
    aflatoxinBand,
    heavyMetalBand,
    pesticideBand,
    qualityBand,
    astaBand,
    capsaicinBand,
    moistureBand,
    oleoresinBand,
    contaminationBand,
    compliance,
    complianceRanked,
    yieldIndex,
    yieldBand,
    biomassIndex,
    biomassBand,
    compoundYieldIndex,
    compoundYieldBand,
    yieldVsHistoryDeltaPct,
    yieldVsHistoryBand,
    sourcingProxyIndex,
    rationale,
    agronomyRationale:
      agronomyRationale.length > 0 ? agronomyRationale : rationale.slice(0, 4),
    qualityDrivers,
    contaminationDrivers,
    phenology: { dap: pheno.dap, dat: pheno.dat, gdd: pheno.gdd },
  }
}

export function buildDistrictInsight(
  prediction: ProductPrediction,
  companyId: CompanyId,
  role: UserRoleId,
  market: ComplianceMarket = 'India',
): DistrictInsight {
  const company = getCompany(companyId)
  const p = prediction

  const fungal = pathwayDecision(
    'Fungal',
    p.fungalBand,
    `Anthracnose ESI ${p.anthracnoseEsi.toFixed(0)}.`,
  )
  const bacterial = pathwayDecision(
    'Bacterial',
    p.bacterialBand,
    `Wilt ESI ${p.wiltEsi.toFixed(0)}.`,
  )
  const viral = pathwayDecision(
    'Viral',
    p.viralBand,
    `Leaf curl / vector ESI ${p.leafCurlEsi.toFixed(0)}.`,
  )
  const plantDisease = plantDiseasePotentialDecision(
    p.diseaseBand,
    p.diseaseEsi,
    p.fungalBand,
    p.bacterialBand,
    p.viralBand,
    p.anthracnoseEsi,
    p.wiltEsi,
    p.leafCurlEsi,
    company,
    p.agronomyRationale,
  )

  const moisture = qualityPathwayDecision(
    'Moisture',
    p.moistureBand,
    `Moisture score ${p.moistureScore.toFixed(0)} from RH, rainfall, soil moisture, stage and NDVI proxy.`,
  )
  const asta = qualityPathwayDecision(
    'ASTA',
    p.astaBand,
    `ASTA score ${p.astaScore.toFixed(0)} — variety colour lean + ripening environment.`,
  )
  const capsaicin = qualityPathwayDecision(
    'Capsaicin',
    p.capsaicinBand,
    company.capsaicinMode === 'low-is-best'
      ? `Capsaicin score ${p.capsaicinScore.toFixed(0)} — food-colour favours lower heat.`
      : `Capsaicin score ${p.capsaicinScore.toFixed(0)} — variety heat lean + VPD/heat.`,
  )
  const quality = qualityDecisionForCompany(
    p.astaBand,
    p.capsaicinBand,
    p.moistureBand,
    company,
    p.astaScore,
    p.capsaicinScore,
    p.moistureScore,
    p.qualityDrivers,
  )

  const aflatoxin = pathwayDecision(
    'Aflatoxin',
    p.aflatoxinBand,
    `Aflatoxin ESI ${p.aflatoxinEsi.toFixed(0)}.`,
  )
  const pesticide = pathwayDecision(
    'Pesticide residue',
    p.pesticideBand,
    `Pesticide-pressure ESI ${p.pesticideEsi.toFixed(0)}.`,
  )
  const heavyMetal = pathwayDecision(
    'Heavy metal',
    p.heavyMetalBand,
    `Heavy-metal pressure ESI ${p.heavyMetalEsi.toFixed(0)}.`,
  )
  const contamination = contaminationPotentialDecision(
    p.aflatoxinBand,
    p.pesticideBand,
    p.heavyMetalBand,
    p.aflatoxinEsi,
    p.pesticideEsi,
    p.heavyMetalEsi,
    p.contaminationEsi,
    company,
    p.contaminationDrivers,
  )
  const compliance = complianceDecisionMock(
    p.pesticideBand,
    p.aflatoxinBand,
    p.heavyMetalBand,
    p.contaminationBand,
    market,
    company,
  )

  const yieldDec = extractibleYieldDecision(
    p.compoundYieldBand,
    p.compoundYieldIndex,
    p.biomassBand,
    p.biomassIndex,
    company,
  )

  const histDrivers = [
    `Extractible yield ${yieldDec.label}`,
    `Compound ${p.compoundYieldBand} (${p.compoundYieldIndex.toFixed(1)})`,
    `Biomass ${p.biomassBand} (${p.biomassIndex.toFixed(1)})`,
  ]
  const yieldVsHistory = yieldVsHistoryDecision(
    p.yieldVsHistoryBand,
    p.yieldVsHistoryDeltaPct,
    p.compoundYieldIndex,
    histDrivers,
  )

  let diseaseForSourcing = p.diseaseBand
  if (company.weights.disease === 'na') diseaseForSourcing = 'Low'

  let qualityForSourcing: QualityBand = p.qualityBand
  if (quality.band && quality.label !== 'Not applicable') {
    qualityForSourcing = quality.band as QualityBand
  }

  let yieldForSourcing = p.compoundYieldBand
  if (company.weights.compoundYield === 'na') yieldForSourcing = 'Normal'

  let contaminationForSourcing = p.contaminationBand
  if (company.weights.contamination === 'na') contaminationForSourcing = 'Low'

  const decisionBase = sourcingDecision(
    diseaseForSourcing,
    qualityForSourcing,
    yieldForSourcing,
    contaminationForSourcing,
  )

  const decision = frameSourcingForRole(
    decisionBase,
    role,
    company,
    {
      place: p.district.name,
      variety: getVariety(p.varietyId).name,
      disease: plantDisease.label,
      quality: quality.label,
      contamination: contamination.label,
      compliance: compliance.label,
      history: yieldVsHistory.label,
      yieldLabel: yieldDec.label,
    },
    'district',
  )

  const summary = buildLayer6Summary(
    role,
    p,
    company,
    plantDisease,
    quality,
    contamination,
    compliance,
    yieldVsHistory,
    decision,
  )

  return {
    prediction: p,
    company,
    role,
    market,
    layer1: { plantDisease, fungal, bacterial, viral },
    layer2: { quality, moisture, capsaicin, asta },
    layer3: {
      contamination,
      aflatoxin,
      pesticide,
      heavyMetal,
      compliance,
    },
    layer4: { yield: yieldDec },
    layer5: { yieldVsHistory },
    layer6: { summary, decision },
  }
}

function buildLayer6Summary(
  role: UserRoleId,
  p: ProductPrediction,
  company: CompanyProfile,
  disease: DecisionResult,
  quality: DecisionResult,
  contamination: DecisionResult,
  compliance: DecisionResult,
  history: DecisionResult,
  decision: DecisionResult,
): string {
  const place = p.district.name
  const variety = getVariety(p.varietyId).name
  const stack = `Plant disease ${disease.label} · Quality ${quality.label} · Contamination ${contamination.label} · Compliance ${compliance.label} · Yield vs 5-yr ${history.label} (${p.yieldVsHistoryDeltaPct >= 0 ? '+' : ''}${p.yieldVsHistoryDeltaPct.toFixed(0)}%).`

  if (role === 'quality-head') {
    return `${place} (${variety}) for ${company.shortLabel}. ${stack} Quality lens: ${quality.action} ${quality.reasoning} Recommended posture: ${decision.label}.`
  }
  if (role === 'agronomy') {
    return `${place} agronomy view. ${stack} Field drivers: ${p.agronomyRationale.slice(0, 3).join(' ')} Disease: ${disease.reasoning} Recommended posture: ${decision.label}.`
  }
  return `${place} · ${company.shortLabel} procurement view. ${stack} ${contamination.reasoning} Recommended posture: ${decision.label}.`
}


export function seasonalProxyFeatures(
  lat: number,
  lon: number,
): EnvironmentalFeatures {
  const s = seedFromCoords(lat, lon)
  const month = new Date().getMonth() + 1
  const monsoon = month >= 6 && month <= 9
  const meanTempC = Number(
    lerp(monsoon ? 26 : 24, monsoon ? 32 : 30, s).toFixed(1),
  )
  const maxTempC = Number((meanTempC + lerp(4, 10, s)).toFixed(1))
  const minTempC = Number((meanTempC - lerp(4, 8, 1 - s)).toFixed(1))
  const relativeHumidityPct = Number(
    lerp(monsoon ? 70 : 45, monsoon ? 95 : 75, s).toFixed(0),
  )
  const rainfallEvents30d = Math.round(lerp(monsoon ? 6 : 1, monsoon ? 16 : 8, s))
  const consecutiveWetDays = Math.round(lerp(monsoon ? 2 : 0, monsoon ? 10 : 4, s))
  const soilMoisture = Number(
    lerp(monsoon ? 0.22 : 0.14, monsoon ? 0.42 : 0.28, s).toFixed(3),
  )
  const soilPh = Number(
    lerp(5.8, 7.8, seedFromCoords(lat + 1, lon - 1)).toFixed(1),
  )
  const vpd = Number(lerp(0.6, 2.6, 1 - s).toFixed(2))
  const twi = Number(lerp(4, 14, s).toFixed(1))
  const elev = Math.round(lerp(20, 450, s))
  const radiation = Number(
    lerp(12, 24, 1 - (monsoon ? s * 0.6 : s * 0.3)).toFixed(1),
  )
  const consecutiveHighRhDays =
    relativeHumidityPct >= 80
      ? consecutiveWetDays + Math.round(s * 3)
      : Math.round(s * 2)
  const heatStressDays =
    maxTempC >= 35 ? Math.round(lerp(2, 9, s)) : Math.round(s * 2)
  const drySpellDays =
    rainfallEvents30d < 4 ? Math.round(lerp(4, 12, s)) : Math.round(s * 3)

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
  varietyId = 'guntur-sannam',
): Promise<ProductPrediction> {
  const features = live
    ? await fetchFeatures(district.lat, district.lon)
    : seasonalProxyFeatures(district.lat, district.lon)
  return computePrediction(district, features, stage, varietyId)
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

export function rankAllDistricts(
  stage: GrowthStage,
  liveById?: Map<string, ProductPrediction>,
  varietyId = 'guntur-sannam',
): RankedRow[] {
  const preds = districts.map((d) => {
    const live = liveById?.get(d.id)
    if (live) return live
    return computePrediction(
      d,
      seasonalProxyFeatures(d.lat, d.lon),
      stage,
      varietyId,
    )
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
      complianceBest:
        complianceRanks.get(prediction.district.id) ?? preds.length,
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

export function l6Summary(
  role: UserRoleId,
  p: ProductPrediction,
  companyId: CompanyId = 'spice-processors',
): { summary: string; decision: DecisionResult } {
  const insight = buildDistrictInsight(p, companyId, role)
  return insight.layer6
}

/** @deprecated use l6Summary */
export function l5Summary(
  role: UserRoleId,
  p: ProductPrediction,
  companyId: CompanyId = 'spice-processors',
): { headline: string; action: string; detail: string } {
  const { summary, decision } = l6Summary(role, p, companyId)
  return { headline: summary, action: decision.action, detail: decision.reasoning }
}

export type { ChilliVariety, DecisionResult }
