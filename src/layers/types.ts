export type IntelligenceLayerId =
  | 'contamination'
  | 'quality'
  | 'compliance'
  | 'compound-yield'
  | 'sourcing-summary'

export type IntelligenceLayerMeta = {
  id: IntelligenceLayerId
  number: 1 | 2 | 3 | 4 | 5
  title: string
  subtitle: string
}

export const INTELLIGENCE_LAYERS: IntelligenceLayerMeta[] = [
  {
    id: 'contamination',
    number: 1,
    title: 'Contamination decision',
    subtitle:
      'Overall contamination decision with fungal, bacterial, viral, heavy metal, and pesticide residue pathways.',
  },
  {
    id: 'quality',
    number: 2,
    title: 'Quality decision',
    subtitle:
      'Company-weighted quality from ASTA colour, capsaicin, and oleoresin leans.',
  },
  {
    id: 'compliance',
    number: 3,
    title: 'Compliance decision (MRL mock)',
    subtitle:
      'Destination readiness from pesticide + aflatoxin pressure vs mock MRL path. Exact formulae TBD.',
  },
  {
    id: 'compound-yield',
    number: 4,
    title: 'Compound yield',
    subtitle:
      'Weather × quality yield conduciveness as a band decision (no live NDVI).',
  },
  {
    id: 'sourcing-summary',
    number: 5,
    title: 'Sourcing decision & role summary',
    subtitle:
      'Sourcing decision table from disease, quality, and yield — role explains the same underlying decisions.',
  },
]
