export type IntelligenceLayerId =
  | 'quality-disease'
  | 'compliance'
  | 'compound-yield'
  | 'procurement'
  | 'role-decision'

export type IntelligenceLayerMeta = {
  id: IntelligenceLayerId
  number: 1 | 2 | 3 | 4 | 5
  title: string
  subtitle: string
}

export const INTELLIGENCE_LAYERS: IntelligenceLayerMeta[] = [
  {
    id: 'quality-disease',
    number: 1,
    title: 'Quality Index & Disease Index',
    subtitle:
      'Directional quality potential and disease-favourable conditions from Unified Strategy rules (bands vs regional history).',
  },
  {
    id: 'compliance',
    number: 2,
    title: 'Compliance readiness',
    subtitle:
      'Import readiness (0–10) by market — India, EU, China, Thailand, Bangladesh, USA, Indonesia, Sri Lanka, Malaysia — from contamination / aflatoxin pressure.',
  },
  {
    id: 'compound-yield',
    number: 3,
    title: 'Compound yield',
    subtitle:
      'Weather-based biomass/yield conduciveness × quality factor (0–10). No live NDVI.',
  },
  {
    id: 'procurement',
    number: 4,
    title: 'Procurement — sourcing reliability',
    subtitle:
      'Regional risk proxy (0–10) from L1–L3 signals — not validated delivery reliability.',
  },
  {
    id: 'role-decision',
    number: 5,
    title: 'Role-based decision summary',
    subtitle:
      'Same underlying prediction, translated for the active role (L5 persona engine).',
  },
]
