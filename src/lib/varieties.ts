/**
 * Synthetic chilli variety catalogue (placeholder until real phenology / Kaggle-style tables land).
 * DAP = days after planting · DAT = days after transplanting · GDD = growing degree days (°C·d).
 */

export type ChilliVariety = {
  id: string
  name: string
  originHint: string
  /** Typical heat / colour lean for mock quality splits */
  heatLean: 'mild' | 'medium' | 'hot'
  colourLean: 'low' | 'medium' | 'high'
  oleoresinLean: 'low' | 'medium' | 'high'
  /** Mid-window estimates by growth stage */
  stages: {
    stage: string
    dap: number
    dat: number
    gdd: number
  }[]
}

export const CHILLI_VARIETIES: ChilliVariety[] = [
  {
    id: 'byadgi',
    name: 'Byadgi',
    originHint: 'Karnataka — high colour, mild heat',
    heatLean: 'mild',
    colourLean: 'high',
    oleoresinLean: 'medium',
    stages: [
      { stage: 'Vegetative', dap: 28, dat: 14, gdd: 320 },
      { stage: 'Flowering', dap: 48, dat: 34, gdd: 560 },
      { stage: 'Fruit development', dap: 75, dat: 61, gdd: 880 },
      { stage: 'Ripening', dap: 105, dat: 91, gdd: 1180 },
    ],
  },
  {
    id: 'guntur-sannam',
    name: 'Guntur Sannam',
    originHint: 'Andhra — commercial heat & colour balance',
    heatLean: 'hot',
    colourLean: 'medium',
    oleoresinLean: 'high',
    stages: [
      { stage: 'Vegetative', dap: 30, dat: 16, gdd: 340 },
      { stage: 'Flowering', dap: 50, dat: 36, gdd: 590 },
      { stage: 'Fruit development', dap: 78, dat: 64, gdd: 920 },
      { stage: 'Ripening', dap: 110, dat: 96, gdd: 1240 },
    ],
  },
  {
    id: 'teja',
    name: 'Teja',
    originHint: 'Telangana / AP — high pungency',
    heatLean: 'hot',
    colourLean: 'medium',
    oleoresinLean: 'medium',
    stages: [
      { stage: 'Vegetative', dap: 26, dat: 12, gdd: 300 },
      { stage: 'Flowering', dap: 46, dat: 32, gdd: 540 },
      { stage: 'Fruit development', dap: 72, dat: 58, gdd: 860 },
      { stage: 'Ripening', dap: 100, dat: 86, gdd: 1140 },
    ],
  },
  {
    id: 'kashmiri',
    name: 'Kashmiri',
    originHint: 'North — colour for culinary / paprika lean',
    heatLean: 'mild',
    colourLean: 'high',
    oleoresinLean: 'low',
    stages: [
      { stage: 'Vegetative', dap: 32, dat: 18, gdd: 280 },
      { stage: 'Flowering', dap: 55, dat: 41, gdd: 500 },
      { stage: 'Fruit development', dap: 85, dat: 71, gdd: 780 },
      { stage: 'Ripening', dap: 120, dat: 106, gdd: 1080 },
    ],
  },
  {
    id: 'bird-eye',
    name: 'Bird’s eye',
    originHint: 'Small fruit — very hot, lower bulk oleoresin',
    heatLean: 'hot',
    colourLean: 'low',
    oleoresinLean: 'low',
    stages: [
      { stage: 'Vegetative', dap: 24, dat: 10, gdd: 290 },
      { stage: 'Flowering', dap: 42, dat: 28, gdd: 510 },
      { stage: 'Fruit development', dap: 65, dat: 51, gdd: 760 },
      { stage: 'Ripening', dap: 90, dat: 76, gdd: 1020 },
    ],
  },
]

export const DEFAULT_VARIETY_ID = 'guntur-sannam'

export function getVariety(id: string): ChilliVariety {
  return CHILLI_VARIETIES.find((v) => v.id === id) ?? CHILLI_VARIETIES[1]
}

export function varietyStageMetrics(varietyId: string, stage: string) {
  const v = getVariety(varietyId)
  return (
    v.stages.find((s) => s.stage === stage) ??
    v.stages[v.stages.length - 1]
  )
}
