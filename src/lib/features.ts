export type GrowthStage =
  | 'Vegetative'
  | 'Flowering'
  | 'Fruit development'
  | 'Ripening'

export const GROWTH_STAGES: GrowthStage[] = [
  'Vegetative',
  'Flowering',
  'Fruit development',
  'Ripening',
]

/** Mid-window DAP estimates for chilli (demo defaults). */
export function estimateDap(stage: GrowthStage): number {
  switch (stage) {
    case 'Vegetative':
      return 28
    case 'Flowering':
      return 48
    case 'Fruit development':
      return 75
    case 'Ripening':
      return 105
  }
}

export type QualityBand = 'Below-normal' | 'Normal' | 'Above-normal'

export interface EnvironmentalFeatures {
  lat: number
  lon: number
  meanTempC: number
  maxTempC: number
  minTempC: number
  relativeHumidityPct: number
  rainfallEvents30d: number
  consecutiveWetDays: number
  soilMoisture: number
  soilPh: number
  /** Kept for type compat; not fetched live (no NDVI API in mock). */
  ndvi: number
  vapourPressureDeficit: number
  topographicWetnessIndex: number
  elevationM: number
  elevationSource: 'open-meteo-elevation' | 'synthetic'
  source: 'open-meteo+synthetic' | 'synthetic-fallback'
  fetchedAt: string
  /** Mean daily shortwave radiation sum (MJ/m²) when API provides it */
  shortwaveRadiationSum?: number
  consecutiveHighRhDays?: number
  heatStressDays?: number
  drySpellDays?: number
}

export interface Phase0Prediction {
  pdi: number
  dsi: number
  quality: QualityBand
  qualityScore: number
  rationale: string[]
}

/** Deterministic 0–1 seed from lat/lon. */
function seedFromCoords(lat: number, lon: number): number {
  const x = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function syntheticSoilSatellite(lat: number, lon: number) {
  const s = seedFromCoords(lat, lon)
  const s2 = seedFromCoords(lat + 1, lon - 1)
  return {
    soilMoisture: Number(lerp(0.18, 0.42, s).toFixed(3)),
    soilPh: Number(lerp(5.8, 7.8, s2).toFixed(1)),
    ndvi: Number(lerp(0.35, 0.72, (s + s2) / 2).toFixed(2)),
    topographicWetnessIndex: Number(lerp(4, 14, s).toFixed(1)),
    vapourPressureDeficit: Number(lerp(0.6, 2.4, 1 - s).toFixed(2)),
  }
}

async function fetchElevation(lat: number, lon: number): Promise<number | null> {
  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Elevation ${res.status}`)
  const data = await res.json()
  const elev = data.elevation?.[0]
  return typeof elev === 'number' ? Number(elev.toFixed(0)) : null
}

function syntheticElevation(lat: number, lon: number): number {
  const s = seedFromCoords(lat, lon)
  return Math.round(lerp(20, 450, s))
}

export async function fetchFeatures(
  lat: number,
  lon: number,
): Promise<EnvironmentalFeatures> {
  const synth = syntheticSoilSatellite(lat, lon)
  const fetchedAt = new Date().toISOString()

  const elevPromise = fetchElevation(lat, lon).catch(() => null)

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum,shortwave_radiation_sum,et0_fao_evapotranspiration` +
      `&hourly=vapour_pressure_deficit` +
      `&past_days=14&forecast_days=1&timezone=Asia%2FKolkata`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
    const data = await res.json()
    const daily = data.daily

    const temps = daily.temperature_2m_mean as number[]
    const maxes = daily.temperature_2m_max as number[]
    const mins = daily.temperature_2m_min as number[]
    const rhs = daily.relative_humidity_2m_mean as number[]
    const precip = daily.precipitation_sum as number[]
    const radiation = (daily.shortwave_radiation_sum as number[] | undefined) ?? []

    const meanTempC = avg(temps)
    const maxTempC = Math.max(...maxes)
    const minTempC = Math.min(...mins)
    const relativeHumidityPct = avg(rhs)
    const rainfallEvents30d = precip.filter((p: number) => p >= 1).length
    let consecutiveWetDays = 0
    let run = 0
    for (const p of precip) {
      if (p >= 1) {
        run++
        consecutiveWetDays = Math.max(consecutiveWetDays, run)
      } else {
        run = 0
      }
    }

    let consecutiveHighRhDays = 0
    let rhRun = 0
    for (const rh of rhs) {
      if (rh >= 80) {
        rhRun++
        consecutiveHighRhDays = Math.max(consecutiveHighRhDays, rhRun)
      } else {
        rhRun = 0
      }
    }

    const heatStressDays = maxes.filter((t) => t >= 35).length
    let drySpellDays = 0
    let dryRun = 0
    for (const p of precip) {
      if (p < 1) {
        dryRun++
        drySpellDays = Math.max(drySpellDays, dryRun)
      } else {
        dryRun = 0
      }
    }

    let vpd = synth.vapourPressureDeficit
    const hourlyVpd = data.hourly?.vapour_pressure_deficit as number[] | undefined
    if (hourlyVpd?.length) {
      const valid = hourlyVpd.filter((x) => typeof x === 'number' && !Number.isNaN(x))
      if (valid.length) vpd = Number(avg(valid).toFixed(2))
    }

    // Prefer API soil moisture if present on archive-style fields; else synthetic
    const soilMoisture = synth.soilMoisture

    const elevApi = await elevPromise
    const elevationM = elevApi ?? syntheticElevation(lat, lon)

    return {
      lat,
      lon,
      meanTempC: Number(meanTempC.toFixed(1)),
      maxTempC: Number(maxTempC.toFixed(1)),
      minTempC: Number(minTempC.toFixed(1)),
      relativeHumidityPct: Number(relativeHumidityPct.toFixed(0)),
      rainfallEvents30d,
      consecutiveWetDays,
      soilMoisture,
      soilPh: synth.soilPh,
      ndvi: 0,
      vapourPressureDeficit: vpd,
      topographicWetnessIndex: synth.topographicWetnessIndex,
      elevationM,
      elevationSource:
        elevApi != null ? 'open-meteo-elevation' : 'synthetic',
      source: 'open-meteo+synthetic',
      fetchedAt,
      shortwaveRadiationSum:
        radiation.length > 0 ? Number(avg(radiation).toFixed(1)) : undefined,
      consecutiveHighRhDays,
      heatStressDays,
      drySpellDays,
    }
  } catch {
    const s = seedFromCoords(lat, lon)
    const elevApi = await elevPromise
    const elevationM = elevApi ?? syntheticElevation(lat, lon)

    return {
      lat,
      lon,
      meanTempC: Number(lerp(24, 32, s).toFixed(1)),
      maxTempC: Number(lerp(28, 38, s).toFixed(1)),
      minTempC: Number(lerp(18, 26, s).toFixed(1)),
      relativeHumidityPct: Number(lerp(55, 92, 1 - s).toFixed(0)),
      rainfallEvents30d: Math.round(lerp(3, 14, s)),
      consecutiveWetDays: Math.round(lerp(1, 9, s)),
      soilMoisture: synth.soilMoisture,
      soilPh: synth.soilPh,
      ndvi: 0,
      vapourPressureDeficit: synth.vapourPressureDeficit,
      topographicWetnessIndex: synth.topographicWetnessIndex,
      elevationM,
      elevationSource:
        elevApi != null ? 'open-meteo-elevation' : 'synthetic',
      source: 'synthetic-fallback',
      fetchedAt,
      shortwaveRadiationSum: Number(lerp(12, 22, 1 - s).toFixed(1)),
      consecutiveHighRhDays: Math.round(lerp(1, 8, 1 - s)),
      heatStressDays: Math.round(lerp(1, 7, s)),
      drySpellDays: Math.round(lerp(2, 10, s)),
    }
  }
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/**
 * Phase 0 if-then rules from Unified Strategy (blended disease + directional quality).
 * Literature thresholds applied to features within growth-stage windows.
 */
export function predictPhase0(
  f: EnvironmentalFeatures,
  stage: GrowthStage,
  dap: number,
): Phase0Prediction {
  const rationale: string[] = []

  let anthracnose = 15
  let bacterialWilt = 15
  let leafCurl = 10

  const tempInAnth = f.meanTempC >= 24 && f.meanTempC <= 28
  if (tempInAnth && f.relativeHumidityPct >= 80) {
    anthracnose += 25
    rationale.push(
      'Anthracnose-favourable band: temp 24–28°C with RH ≥80%',
    )
  } else if (f.relativeHumidityPct >= 80) {
    anthracnose += 12
  }
  if (f.rainfallEvents30d >= 8) {
    anthracnose += 15
    rationale.push(
      `Rain-splash risk: ${f.rainfallEvents30d} rainfall events (≥1 mm)`,
    )
  }
  if (f.consecutiveWetDays >= 5) {
    anthracnose += 12
    rationale.push(
      `Sustained leaf wetness: ${f.consecutiveWetDays} consecutive wet days`,
    )
  }
  if (stage === 'Ripening') {
    anthracnose += 18
    rationale.push('Ripening stage — anthracnose rules weighted highest')
  } else if (stage === 'Fruit development') {
    anthracnose += 8
  }

  if (f.soilMoisture >= 0.3 && f.meanTempC >= 24) {
    bacterialWilt += 22
    rationale.push('Warm, moist soil favouring bacterial wilt')
  }
  if (f.soilPh < 7.2) {
    bacterialWilt += 12
    rationale.push(`Soil pH ${f.soilPh} (acidic/neutral favours wilt)`)
  } else {
    bacterialWilt -= 8
    rationale.push(`Alkaline soil pH ${f.soilPh} — wilt suppressed`)
  }
  if (f.topographicWetnessIndex >= 10) {
    bacterialWilt += 15
    rationale.push('High topographic wetness — waterlogging risk')
  }

  if (f.meanTempC >= 23 && f.meanTempC <= 28) {
    leafCurl += 20
    rationale.push('Temperature in whitefly-preferred band (~25°C)')
  }
  if (stage === 'Vegetative' || stage === 'Flowering') {
    leafCurl += 15
    rationale.push(`${stage} stage — leaf curl vector activity most relevant`)
  } else {
    leafCurl -= 5
  }

  anthracnose = clamp(anthracnose, 5, 95)
  bacterialWilt = clamp(bacterialWilt, 5, 95)
  leafCurl = clamp(leafCurl, 5, 95)

  const pdi = Number(
    (
      anthracnose * 0.4 +
      bacterialWilt * 0.35 +
      leafCurl * 0.25
    ).toFixed(1),
  )

  const stressBoost =
    (f.consecutiveWetDays / 10) * 0.8 + (f.relativeHumidityPct / 100) * 0.6
  const dsi = Number(
    clamp((pdi / 100) * 4.2 + stressBoost, 0.3, 5).toFixed(1),
  )

  let qualityScore = 50

  if (stage === 'Ripening' || stage === 'Fruit development') {
    if (f.meanTempC >= 22 && f.meanTempC <= 30 && f.maxTempC < 36) {
      qualityScore += 12
      rationale.push('Moderate ripening temperatures support ASTA colour')
    }
    if (f.maxTempC >= 38) {
      qualityScore -= 18
      rationale.push('Excess heat stress — colour fade risk')
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

  if (f.ndvi >= 0.55) {
    qualityScore += 8
    rationale.push(`Healthy canopy (NDVI ${f.ndvi})`)
  } else if (f.ndvi < 0.45) {
    qualityScore -= 10
  }

  if (pdi >= 55) {
    qualityScore -= 15
    rationale.push('Elevated disease-favourable conditions weigh on quality')
  }

  qualityScore = clamp(qualityScore, 10, 95)
  let quality: QualityBand = 'Normal'
  if (qualityScore < 40) quality = 'Below-normal'
  else if (qualityScore >= 65) quality = 'Above-normal'

  rationale.push(`Growth stage ${stage} · estimated DAP ${dap}`)

  return { pdi, dsi, quality, qualityScore, rationale }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Per-feature attention flag from strategy thresholds. */
export type FeatureWatch = 'OK' | 'Watch' | 'Elevated'

export interface FeatureRow {
  label: string
  value: string
  watch: FeatureWatch
}

/**
 * Build feature rows with Watch / Elevated badges when values cross
 * literature-aligned thresholds (anthracnose, wilt, heat, stress).
 */
export function buildFeatureRows(
  f: EnvironmentalFeatures,
  stage: GrowthStage,
): FeatureRow[] {
  const anthWindow =
    stage === 'Ripening' || stage === 'Fruit development'
  const vectorWindow =
    stage === 'Vegetative' || stage === 'Flowering'

  const meanTempWatch = (): FeatureWatch => {
    if (anthWindow && f.meanTempC >= 24 && f.meanTempC <= 28 && f.relativeHumidityPct >= 80) {
      return 'Elevated'
    }
    if (vectorWindow && f.meanTempC >= 23 && f.meanTempC <= 28) return 'Watch'
    if (f.meanTempC >= 24 && f.meanTempC <= 28) return 'Watch'
    return 'OK'
  }

  const maxTempWatch = (): FeatureWatch => {
    if (f.maxTempC >= 40) return 'Elevated'
    if (f.maxTempC >= 35) return 'Watch'
    return 'OK'
  }

  const rhWatch = (): FeatureWatch => {
    if (f.relativeHumidityPct >= 85) return 'Elevated'
    if (f.relativeHumidityPct >= 80) return 'Watch'
    return 'OK'
  }

  const rainWatch = (): FeatureWatch => {
    if (f.rainfallEvents30d >= 11) return 'Elevated'
    if (f.rainfallEvents30d >= 8) return 'Watch'
    return 'OK'
  }

  const wetWatch = (): FeatureWatch => {
    if (f.consecutiveWetDays >= 7) return 'Elevated'
    if (f.consecutiveWetDays >= 5) return 'Watch'
    return 'OK'
  }

  const moistureWatch = (): FeatureWatch => {
    if (f.soilMoisture >= 0.35 && f.meanTempC >= 24) return 'Elevated'
    if (f.soilMoisture >= 0.3 || f.soilMoisture < 0.2) return 'Watch'
    return 'OK'
  }

  const phWatch = (): FeatureWatch => {
    // Acidic/neutral favours bacterial wilt; alkaline suppresses
    if (f.soilPh < 6.5) return 'Watch'
    if (f.soilPh < 7.2) return 'Watch'
    return 'OK'
  }

  const vpdWatch = (): FeatureWatch => {
    if (f.vapourPressureDeficit >= 2.5) return 'Elevated'
    if (f.vapourPressureDeficit >= 2.2 || f.vapourPressureDeficit < 0.8) {
      return 'Watch'
    }
    return 'OK'
  }

  const twiWatch = (): FeatureWatch => {
    if (f.topographicWetnessIndex >= 12) return 'Elevated'
    if (f.topographicWetnessIndex >= 10) return 'Watch'
    return 'OK'
  }

  return [
    {
      label: 'Mean temp',
      value: `${f.meanTempC} °C`,
      watch: meanTempWatch(),
    },
    {
      label: 'Max / Min',
      value: `${f.maxTempC} / ${f.minTempC} °C`,
      watch: maxTempWatch(),
    },
    {
      label: 'Relative humidity',
      value: `${f.relativeHumidityPct} %`,
      watch: rhWatch(),
    },
    {
      label: 'Rainfall events (14d)',
      value: String(f.rainfallEvents30d),
      watch: rainWatch(),
    },
    {
      label: 'Consecutive wet days',
      value: String(f.consecutiveWetDays),
      watch: wetWatch(),
    },
    {
      label: 'Soil moisture',
      value: `${f.soilMoisture} m³/m³`,
      watch: moistureWatch(),
    },
    {
      label: 'Soil pH',
      value: String(f.soilPh),
      watch: phWatch(),
    },
    {
      label: 'Elevation',
      value: `${f.elevationM} m (${f.elevationSource === 'open-meteo-elevation' ? 'API' : 'synthetic'})`,
      watch: 'OK',
    },
    {
      label: 'Shortwave radiation',
      value:
        f.shortwaveRadiationSum != null
          ? `${f.shortwaveRadiationSum} MJ/m²`
          : '—',
      watch:
        f.shortwaveRadiationSum != null && f.shortwaveRadiationSum < 15
          ? 'Watch'
          : 'OK',
    },
    {
      label: 'Consecutive RH ≥80% days',
      value: String(f.consecutiveHighRhDays ?? '—'),
      watch:
        (f.consecutiveHighRhDays ?? 0) >= 7
          ? 'Elevated'
          : (f.consecutiveHighRhDays ?? 0) >= 5
            ? 'Watch'
            : 'OK',
    },
    {
      label: 'Heat-stress days (≥35°C)',
      value: String(f.heatStressDays ?? '—'),
      watch:
        (f.heatStressDays ?? 0) >= 5
          ? 'Elevated'
          : (f.heatStressDays ?? 0) >= 3
            ? 'Watch'
            : 'OK',
    },
    {
      label: 'VPD',
      value: `${f.vapourPressureDeficit} kPa`,
      watch: vpdWatch(),
    },
    {
      label: 'Topographic wetness',
      value: String(f.topographicWetnessIndex),
      watch: twiWatch(),
    },
  ]
}
