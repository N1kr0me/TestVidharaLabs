import type { CompanyProfile } from '@/lib/companies'
import { weightOf } from '@/lib/companies'
import type { QualityBand } from '@/lib/features'
import type { RiskBand } from '@/lib/productEngine'
import type { UserRoleId } from '@/lib/roles'

export type YieldBand = 'Below-normal' | 'Normal' | 'Above-normal'
export type DecisionTone = 'ok' | 'warn' | 'danger' | 'neutral'
export type HistoryTrendBand = 'Below-average' | 'Near-average' | 'Above-average'

/** Display posture on Decision cards — Low / Medium / High → Stable / Monitor / Act|Alert */
export type DecisionPosture = 'Stable' | 'Monitor' | 'Act' | 'Alert'

export type DecisionResult = {
  /** Band or short decision shown as primary value */
  label: string
  band?: string
  tone: DecisionTone
  /**
   * Decision line — how to read / what to do.
   * For primary cards: interpretation of the band.
   */
  action: string
  /**
   * Why this band — ESI/score + main driving features.
   */
  reasoning: string
}

/** Risk Low → Stable · Watch → Monitor · Elevated → Alert */
export function riskPostureLabel(band: RiskBand): DecisionPosture {
  if (band === 'Elevated') return 'Alert'
  if (band === 'Watch') return 'Monitor'
  return 'Stable'
}

/** Quality / yield: Above → Stable · Normal → Monitor · Below → Act */
export function qualityPostureLabel(
  band: QualityBand | YieldBand,
): DecisionPosture {
  if (band === 'Below-normal') return 'Act'
  if (band === 'Above-normal') return 'Stable'
  return 'Monitor'
}

/** History: Above → Stable · Near → Monitor · Below → Act */
export function historyPostureLabel(band: HistoryTrendBand): DecisionPosture {
  if (band === 'Below-average') return 'Act'
  if (band === 'Above-average') return 'Stable'
  return 'Monitor'
}

export function yieldBandFromIndex(index: number): YieldBand {
  if (index < 4) return 'Below-normal'
  if (index >= 7) return 'Above-normal'
  return 'Normal'
}

export function riskTone(b: RiskBand): DecisionTone {
  if (b === 'Elevated') return 'danger'
  if (b === 'Watch') return 'warn'
  return 'ok'
}

export function qualityTone(b: QualityBand): DecisionTone {
  if (b === 'Below-normal') return 'danger'
  if (b === 'Above-normal') return 'ok'
  return 'warn'
}

export function historyTone(b: HistoryTrendBand): DecisionTone {
  if (b === 'Below-average') return 'danger'
  if (b === 'Above-average') return 'ok'
  return 'warn'
}

/** Compact pathway / sub-band chip. */
export function pathwayDecision(
  title: string,
  band: RiskBand,
  reasoning: string,
): DecisionResult {
  const label = riskPostureLabel(band)
  return {
    label,
    band,
    tone: riskTone(band),
    action:
      band === 'Elevated'
        ? `${title}: elevated pressure — flag for attention.`
        : band === 'Watch'
          ? `${title}: watch conditions.`
          : `${title}: lower pressure.`,
    reasoning,
  }
}

export function qualityPathwayDecision(
  title: string,
  band: QualityBand,
  reasoning: string,
): DecisionResult {
  const label = qualityPostureLabel(band)
  return {
    label,
    band,
    tone: qualityTone(band),
    action:
      band === 'Above-normal'
        ? `${title}: above-normal lean for this window.`
        : band === 'Below-normal'
          ? `${title}: below-normal lean — reset expectations.`
          : `${title}: in a normal seasonal band.`,
    reasoning,
  }
}

/**
 * L1 Plant Disease Potential — drivers + attention (pathway ESI lives on hover).
 */
export function plantDiseasePotentialDecision(
  diseaseBand: RiskBand,
  _diseaseEsi: number,
  fungal: RiskBand,
  bacterial: RiskBand,
  viral: RiskBand,
  _fungalEsi: number,
  _bacterialEsi: number,
  _viralEsi: number,
  _company: CompanyProfile,
  agronomyDrivers: string[],
): DecisionResult {
  const attention: string[] = []
  if (bacterial !== 'Low') attention.push(`Attention: Bacterial ${bacterial}`)
  if (viral !== 'Low') attention.push(`Attention: Viral ${viral}`)
  if (fungal !== 'Low') attention.push(`Attention: Fungal ${fungal}`)

  const topEnv = agronomyDrivers.slice(0, 2)
  const action =
    diseaseBand === 'Elevated'
      ? 'Read as elevated plant-disease potential — intensify scouting / lot testing before commitment.'
      : diseaseBand === 'Watch'
        ? 'Read as watch-band disease potential — monitor pathways; confirm if buying soon.'
        : 'Read as lower disease potential for this window — routine monitoring is enough.'

  return {
    label: riskPostureLabel(diseaseBand),
    band: diseaseBand,
    tone: riskTone(diseaseBand),
    action,
    reasoning: [
      ...(topEnv.length
        ? topEnv.map((d) => `Driver: ${d}`)
        : ['Driver: No strong field driver flagged']),
      ...(attention.length ? attention : ['Attention: none']),
    ].join('\n'),
  }
}

/**
 * L2 Quality Potential — drivers + attention (trait scores live on hover).
 */
export function qualityDecisionForCompany(
  asta: QualityBand,
  capsaicin: QualityBand,
  moisture: QualityBand,
  company: CompanyProfile,
  _astaScore: number,
  _capsaicinScore: number,
  _moistureScore: number,
  qualityDrivers: string[] = [],
): DecisionResult {
  const scoreQ = (b: QualityBand) =>
    b === 'Above-normal' ? 2 : b === 'Normal' ? 1 : 0

  let astaW = weightOf(company, 'asta')
  let capsW = weightOf(company, 'capsaicin')
  const moistW = weightOf(company, 'moisture')

  let capsBand = capsaicin
  let capsNote = ''
  if (company.capsaicinMode === 'low-is-best') {
    if (capsaicin === 'Below-normal' || capsaicin === 'Normal') {
      capsBand = capsaicin === 'Below-normal' ? 'Above-normal' : 'Normal'
      capsNote = 'Capsaicin low→favoured for colour.'
    } else {
      capsW = 0
      capsNote = 'High capsaicin ignored for food-colour.'
    }
  }

  const totalW = astaW + capsW + moistW
  if (totalW === 0) {
    return {
      label: 'Not applicable',
      tone: 'neutral',
      action: 'Quality traits N/A for this company profile.',
      reasoning: 'Driver: quality weights N/A for this company.',
    }
  }

  const weighted =
    (scoreQ(asta) * astaW +
      scoreQ(capsBand) * capsW +
      scoreQ(moisture) * moistW) /
    totalW

  let band: QualityBand = 'Normal'
  if (weighted >= 1.55) band = 'Above-normal'
  else if (weighted < 0.75) band = 'Below-normal'

  const attention: string[] = []
  if (moisture === 'Below-normal') attention.push('Attention: Moisture Below-normal')
  if (asta === 'Below-normal') attention.push('Attention: ASTA Below-normal')
  if (company.capsaicinMode === 'low-is-best') {
    if (capsaicin === 'Above-normal')
      attention.push('Attention: Capsaicin high (colour buyers)')
  } else if (capsaicin === 'Below-normal') {
    attention.push('Attention: Capsaicin Below-normal')
  }

  return {
    label: qualityPostureLabel(band),
    band,
    tone: qualityTone(band),
    action:
      band === 'Above-normal'
        ? 'Read as above-normal quality potential for this buyer type — supports premium / spec-sensitive allocation.'
        : band === 'Below-normal'
          ? 'Read as below-normal quality potential — reset colour / heat / moisture expectations before commitment.'
          : 'Read as in-season typical quality potential for this buyer type.',
    reasoning: [
      ...(qualityDrivers.length
        ? qualityDrivers.slice(0, 2).map((d) => `Driver: ${d}`)
        : capsNote
          ? [`Driver: ${capsNote}`]
          : ['Driver: Seasonal colour / heat / moisture lean']),
      ...(attention.length ? attention : ['Attention: none']),
    ].join('\n'),
  }
}

/**
 * L3 Contamination Potential — drivers + attention (pathway ESI lives on hover).
 */
export function contaminationPotentialDecision(
  aflatoxin: RiskBand,
  pesticide: RiskBand,
  heavyMetal: RiskBand,
  _aflatoxinEsi: number,
  _pesticideEsi: number,
  _heavyMetalEsi: number,
  _contaminationEsi: number,
  company: CompanyProfile,
  contaminationDrivers: string[] = [],
): DecisionResult {
  const score = (b: RiskBand) =>
    b === 'Elevated' ? 2 : b === 'Watch' ? 1 : 0
  const paths = [
    { band: aflatoxin, w: 1.2, name: 'Aflatoxin' },
    { band: pesticide, w: 1.1, name: 'Pesticide residue' },
    { band: heavyMetal, w: 1.0, name: 'Heavy metal' },
  ]
  let sum = 0
  let wSum = 0
  const attention: string[] = []
  for (const p of paths) {
    sum += score(p.band) * p.w
    wSum += p.w
    if (p.band !== 'Low') attention.push(`Attention: ${p.name} ${p.band}`)
  }
  const avg = sum / wSum
  const companyBoost = weightOf(company, 'contamination') / 3
  const adjusted = avg * (0.7 + 0.3 * companyBoost)

  let band: RiskBand = 'Low'
  if (adjusted >= 1.15) band = 'Elevated'
  else if (adjusted >= 0.45) band = 'Watch'

  return {
    label: riskPostureLabel(band),
    band,
    tone: riskTone(band),
    action:
      band === 'Elevated'
        ? 'Read as elevated contamination potential — escalate residue / mycotoxin checks before commitment.'
        : band === 'Watch'
          ? 'Read as watch-band contamination — schedule confirmatory sampling if buying soon.'
          : 'Read as contained contamination potential for this window.',
    reasoning: [
      ...(contaminationDrivers.length
        ? contaminationDrivers.slice(0, 2).map((d) => `Driver: ${d}`)
        : ['Driver: No strong contamination driver flagged']),
      ...(attention.length ? attention : ['Attention: none']),
    ].join('\n'),
  }
}

/** Mock destination acceptable limits (MRL-style) — not district ESI. */
export const MARKET_ACCEPTABLE_LIMITS: Record<
  string,
  { aflatoxin: string; pesticide: string; heavyMetal: string }
> = {
  India: {
    aflatoxin: 'Aflatoxin ≤ 15 µg/kg (FSSAI)',
    pesticide: 'Pesticide ≤ FSSAI schedule',
    heavyMetal: 'Pb ≤ 2.5 · As ≤ 1.1 mg/kg',
  },
  EU: {
    aflatoxin: 'Aflatoxin B1 ≤ 5 · total ≤ 10 µg/kg',
    pesticide: 'Pesticide ≤ EU MRL set',
    heavyMetal: 'Pb ≤ 0.10 · Cd ≤ 0.050 mg/kg',
  },
  China: {
    aflatoxin: 'Aflatoxin ≤ 5 µg/kg (GB)',
    pesticide: 'Pesticide ≤ GB 2763',
    heavyMetal: 'Pb ≤ 0.2 · As ≤ 0.5 mg/kg',
  },
  Thailand: {
    aflatoxin: 'Aflatoxin ≤ 20 µg/kg',
    pesticide: 'Pesticide ≤ Thai FDA MRL',
    heavyMetal: 'Pb ≤ 1.0 · As ≤ 0.5 mg/kg',
  },
  Bangladesh: {
    aflatoxin: 'Aflatoxin ≤ 20 µg/kg',
    pesticide: 'Pesticide ≤ BSTI / Codex',
    heavyMetal: 'Pb ≤ 2.0 · As ≤ 1.0 mg/kg',
  },
  USA: {
    aflatoxin: 'Aflatoxin ≤ 20 µg/kg (FDA)',
    pesticide: 'Pesticide ≤ US EPA / FDA',
    heavyMetal: 'Pb ≤ 0.1 · As ≤ 0.1 mg/kg',
  },
  Indonesia: {
    aflatoxin: 'Aflatoxin ≤ 20 µg/kg',
    pesticide: 'Pesticide ≤ BPOM MRL',
    heavyMetal: 'Pb ≤ 1.0 · As ≤ 0.5 mg/kg',
  },
  'Sri Lanka': {
    aflatoxin: 'Aflatoxin ≤ 10 µg/kg',
    pesticide: 'Pesticide ≤ SLSI / Codex',
    heavyMetal: 'Pb ≤ 1.0 · As ≤ 0.5 mg/kg',
  },
  Malaysia: {
    aflatoxin: 'Aflatoxin ≤ 10 µg/kg',
    pesticide: 'Pesticide ≤ Food Reg. MRL',
    heavyMetal: 'Pb ≤ 1.0 · As ≤ 0.5 mg/kg',
  },
}

/** L3 Compliance — sibling of contamination; market-targeted mock MRL. */
export function complianceDecisionMock(
  pesticide: RiskBand,
  aflatoxin: RiskBand,
  heavyMetal: RiskBand,
  contaminationBand: RiskBand,
  market: string,
  company: CompanyProfile,
): DecisionResult {
  const p = pesticide === 'Elevated' ? 2 : pesticide === 'Watch' ? 1 : 0
  const a = aflatoxin === 'Elevated' ? 2 : aflatoxin === 'Watch' ? 1 : 0
  const h = heavyMetal === 'Elevated' ? 2 : heavyMetal === 'Watch' ? 1 : 0
  const c = contaminationBand === 'Elevated' ? 1.2 : contaminationBand === 'Watch' ? 0.5 : 0
  const w = weightOf(company, 'compliance')
  const risk = (p * 1.1 + a * 1.2 + h * 0.8 + c) * (0.6 + 0.4 * (w / 3))

  let label: DecisionPosture = 'Stable'
  let tone: DecisionTone = 'ok'
  let action = `Read as likely clear for ${market}: residue / mycotoxin pressure looks manageable against mock destination limits.`
  if (risk >= 2.4) {
    label = 'Alert'
    tone = 'danger'
    action = `Read as MRL caution for ${market}: contamination-linked residue pressure is elevated — do not treat as cleared.`
  } else if (risk >= 1.1) {
    label = 'Monitor'
    tone = 'warn'
    action = `Read as verify-MRL for ${market}: check pesticide, aflatoxin and heavy metal against destination limits before shipping.`
  }

  const limits =
    MARKET_ACCEPTABLE_LIMITS[market] ?? MARKET_ACCEPTABLE_LIMITS.India

  return {
    label,
    tone,
    action,
    reasoning: [
      `Market ${market} acceptable`,
      limits.aflatoxin,
      limits.pesticide,
      limits.heavyMetal,
    ].join('\n'),
  }
}

export function compoundYieldDecision(yieldBand: YieldBand): DecisionResult {
  return {
    label: qualityPostureLabel(yieldBand),
    band: yieldBand,
    tone: qualityTone(yieldBand as QualityBand),
    action:
      yieldBand === 'Above-normal'
        ? 'Compound yield conduciveness above normal for this window.'
        : yieldBand === 'Below-normal'
          ? 'Compound yield expectations should be reset for this district/window.'
          : 'Compound yield conduciveness in a normal seasonal band.',
    reasoning: `Compound yield from weather × quality factor (no live NDVI).`,
  }
}

/**
 * L4 single card — Extractible yield potential from compound yield + biomass.
 */
export function extractibleYieldDecision(
  compoundBand: YieldBand,
  compoundIndex: number,
  biomassBand: YieldBand,
  biomassIndex: number,
  company: CompanyProfile,
): DecisionResult {
  const score = (b: YieldBand) =>
    b === 'Above-normal' ? 2 : b === 'Normal' ? 1 : 0
  // Weight compound slightly higher; company compoundYield weight nudges severity
  const w = Math.max(weightOf(company, 'compoundYield'), 1)
  const blended =
    (score(compoundBand) * 1.15 + score(biomassBand) * 0.85) / 2
  const adjusted = blended * (0.85 + 0.15 * (w / 3))

  let band: YieldBand = 'Normal'
  if (adjusted >= 1.55) band = 'Above-normal'
  else if (adjusted < 0.75) band = 'Below-normal'

  return {
    label: qualityPostureLabel(band),
    band,
    tone: qualityTone(band as QualityBand),
    action:
      band === 'Above-normal'
        ? 'Read as above-normal extractible yield potential — biomass and compound yield both support a stronger recoverable-output lean.'
        : band === 'Below-normal'
          ? 'Read as below-normal extractible yield potential — reset volume / extraction expectations for this window.'
          : 'Read as normal extractible yield potential for this season window.',
    reasoning: [
      `Compound ${compoundBand} (index ${compoundIndex.toFixed(1)})`,
      `Biomass ${biomassBand} (index ${biomassIndex.toFixed(1)})`,
    ].join('\n'),
  }
}

export function yieldComponentDecision(
  title: string,
  band: YieldBand,
  score: number,
  reasoning: string,
): DecisionResult {
  return {
    label: qualityPostureLabel(band),
    band,
    tone: qualityTone(band as QualityBand),
    action:
      band === 'Above-normal'
        ? `${title}: above-normal lean.`
        : band === 'Below-normal'
          ? `${title}: below-normal lean.`
          : `${title}: normal lean.`,
    reasoning: `${reasoning} (index ${score.toFixed(1)}).`,
  }
}

/** L5 — crop yield vs 5-year average: trend band + detailed explanation. */
export function yieldVsHistoryDecision(
  band: HistoryTrendBand,
  deltaPct: number,
  compoundYieldIndex: number,
  drivers: string[],
): DecisionResult {
  const signed = deltaPct >= 0 ? `+${deltaPct.toFixed(0)}%` : `${deltaPct.toFixed(0)}%`
  return {
    label: historyPostureLabel(band),
    band,
    tone: historyTone(band),
    action:
      band === 'Above-average'
        ? `Read as above the mock 5-year yield baseline (${signed}).`
        : band === 'Below-average'
          ? `Read as below the mock 5-year yield baseline (${signed}).`
          : `Read as near the mock 5-year yield baseline (${signed}).`,
    reasoning: [
      `Delta ${signed}`,
      `Compound index ${compoundYieldIndex.toFixed(1)}`,
      ...drivers.slice(0, 2).map((d) => `Driver: ${d}`),
    ].join('\n'),
  }
}

/**
 * L6 — single summary card: narrative summary, then sourcing decision (no separate label card).
 */
export function sourcingDecision(
  disease: RiskBand,
  quality: QualityBand,
  yieldBand: YieldBand,
  contamination: RiskBand,
): DecisionResult {
  if (
    disease === 'Elevated' &&
    (quality === 'Below-normal' || contamination === 'Elevated') &&
    yieldBand === 'Below-normal'
  ) {
    return {
      label: 'Alert',
      tone: 'danger',
      action:
        'Diversify volume away; prioritise enhanced testing on remaining lots.',
      reasoning: `Disease ${disease} · Quality ${quality} · Contamination ${contamination} · Yield ${yieldBand}`,
    }
  }
  if (disease === 'Elevated' || contamination === 'Elevated') {
    return {
      label: 'Act',
      tone: 'warn',
      action:
        'Enhanced testing recommended — not an automatic volume cut if commercial metrics still look usable.',
      reasoning: `Disease ${disease} · Contamination ${contamination} · Quality ${quality} · Yield ${yieldBand}`,
    }
  }
  if (
    disease === 'Low' &&
    contamination === 'Low' &&
    quality === 'Above-normal' &&
    yieldBand === 'Above-normal'
  ) {
    return {
      label: 'Stable',
      tone: 'ok',
      action:
        'Maintain or increase commitment; flag as a premium-matching opportunity.',
      reasoning: `Disease ${disease} · Contamination ${contamination} · Quality ${quality} · Yield ${yieldBand}`,
    }
  }
  if (quality === 'Below-normal' && yieldBand === 'Below-normal') {
    return {
      label: 'Act',
      tone: 'warn',
      action:
        'Reset quality/yield expectations with this supplier (conversation, not only testing escalation).',
      reasoning: `Disease ${disease} · Quality ${quality} · Yield ${yieldBand}`,
    }
  }
  return {
    label: 'Monitor',
    tone: 'warn',
    action: 'Routine monitoring; no aggressive volume move yet.',
    reasoning: `Mixed signals — Disease ${disease} · Quality ${quality} · Contamination ${contamination} · Yield ${yieldBand}`,
  }
}

export type SourcingFrameContext = {
  place: string
  variety: string
  disease: string
  quality: string
  contamination: string
  compliance: string
  history: string
  yieldLabel: string
}

/**
 * Reframe L6 / portfolio decision copy for the active role + company.
 * Label/tone stay (band outcome); action + reasoning are role/company inference prose
 * (synthesis of L1–L5 — not a datapoint dump).
 */
export function frameSourcingForRole(
  base: DecisionResult,
  role: UserRoleId,
  company: CompanyProfile,
  ctx: SourcingFrameContext,
  scope: 'district' | 'portfolio' = 'district',
): DecisionResult {
  const focus = company.focus
  const where =
    scope === 'portfolio'
      ? `Portfolio for ${company.label}`
      : `${ctx.place} (${ctx.variety}) · ${company.label}`

  const layered =
    `Layered read: disease ${ctx.disease}, quality ${ctx.quality}, contamination ${ctx.contamination}, compliance ${ctx.compliance}, yield ${ctx.yieldLabel}, vs 5-yr ${ctx.history}.`

  if (role === 'quality-head') {
    const inference =
      base.label === 'Stable'
        ? `${layered} For Quality Head (${focus}), specs look workable — favour allocation that clears colour / heat / moisture for ${company.shortLabel}, with lot testing only where a pathway is soft.`
        : base.label === 'Alert' || base.label === 'Act'
          ? `${layered} For Quality Head (${focus}), do not waive inbound gates: escalate lab / colourimetric checks before customer allocation on this window.`
          : `${layered} For Quality Head (${focus}), hold commitment to inbound QC and watch moisture / ASTA drift against ${company.shortLabel} tolerances before any volume lift.`
    return {
      ...base,
      action:
        base.label === 'Stable'
          ? `${where}: ${base.action} Quality Head — favour lots that clear colour / heat / moisture specs for ${company.shortLabel}; use enhanced lot testing only where bands warrant.`
          : base.label === 'Alert' || base.label === 'Act'
            ? `${where}: ${base.action} Quality Head — escalate lab / colourimetric checks before customer allocation; do not waive specs on alert districts.`
            : `${where}: ${base.action} Quality Head — hold commitment tight to inbound QC gates; watch moisture and ASTA drift against ${company.shortLabel} tolerances.`,
      reasoning: `${inference} Posture: ${base.label}.`,
    }
  }

  if (role === 'agronomy') {
    const inference =
      base.label === 'Stable'
        ? `${layered} For Agronomy (${focus}), the field window looks workable — keep phenology and ESI drivers under review at the next stage gate.`
        : base.label === 'Alert' || base.label === 'Act'
          ? `${layered} For Agronomy (${focus}), disease or contamination pressure dominates — brief growers on stage-window risk and sampling intensity.`
          : `${layered} For Agronomy (${focus}), treat this as a watch window — re-check ESI drivers and growth-stage fit before any volume move.`
    return {
      ...base,
      action:
        base.label === 'Stable'
          ? `${where}: ${base.action} Agronomy — field window looks workable; keep phenology / ESI drivers under review for the next stage gate.`
          : base.label === 'Alert' || base.label === 'Act'
            ? `${where}: ${base.action} Agronomy — disease or contamination pressure dominates; brief growers on stage-window risk and sampling intensity.`
            : `${where}: ${base.action} Agronomy — treat as a watch window; re-check ESI drivers and growth-stage fit before any volume move.`,
      reasoning: `${inference} Posture: ${base.label}.`,
    }
  }

  // procurement
  const inference =
    base.label === 'Stable'
      ? `${layered} For Procurement (${focus}), commercial terms permitting, this window supports maintaining or lifting volume for ${company.shortLabel}.`
      : base.label === 'Alert'
        ? `${layered} For Procurement (${focus}), divert volume and keep only testable residual lots.`
        : base.label === 'Act'
          ? `${layered} For Procurement (${focus}), do not cut volume automatically — price and schedule enhanced testing into the buy.`
          : `${layered} For Procurement (${focus}), no aggressive volume move yet — keep the supplier conversation open and hedges ready.`
  return {
    ...base,
    action:
      base.label === 'Stable'
        ? `${where}: ${base.action} Procurement — suitable to maintain or lift volume for ${company.shortLabel} if commercial terms hold.`
        : base.label === 'Alert'
          ? `${where}: ${base.action} Procurement — divert volume; keep only testable residual lots.`
          : base.label === 'Act'
            ? `${where}: ${base.action} Procurement — do not cut volume automatically; price and schedule enhanced testing into the buy.`
            : `${where}: ${base.action} Procurement — no aggressive volume move; keep supplier conversation open and hedges ready.`,
    reasoning: `${inference} Posture: ${base.label}.`,
  }
}
