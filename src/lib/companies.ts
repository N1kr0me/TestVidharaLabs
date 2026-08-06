/**
 * Buyer / company profiles — weights affect decision outcomes (Primary=3, Secondary=1, N/A=0).
 * Merged from spice/extraction/nutra/food-colour table + processors/exporters brief.
 */

export type CompanyId =
  | 'spice-processors'
  | 'extraction'
  | 'nutraceutical'
  | 'food-colour'
  | 'exporters'

export type WeightLevel = 'primary' | 'secondary' | 'na'

export type MetricKey =
  | 'disease'
  | 'asta'
  | 'capsaicin'
  | 'moisture'
  | 'oleoresin'
  | 'compoundYield'
  | 'sourcing'
  | 'contamination'
  | 'compliance'

export type CompanyProfile = {
  id: CompanyId
  label: string
  shortLabel: string
  focus: string
  weights: Record<MetricKey, WeightLevel>
  /** Food-colour: lower capsaicin is best; higher is ignored in the decision path */
  capsaicinMode?: 'normal' | 'low-is-best'
}

export const WEIGHT_VALUE: Record<WeightLevel, number> = {
  primary: 3,
  secondary: 1,
  na: 0,
}

export const COMPANIES: CompanyProfile[] = [
  {
    id: 'spice-processors',
    label: 'Spice processors',
    shortLabel: 'Spice',
    focus:
      'Whole/ground chilli — disease, ASTA colour, contamination & sourcing primary; culinary compliance lean.',
    weights: {
      disease: 'primary',
      asta: 'primary',
      capsaicin: 'secondary',
      moisture: 'secondary',
      oleoresin: 'na',
      compoundYield: 'na',
      sourcing: 'primary',
      contamination: 'primary',
      compliance: 'secondary',
    },
  },
  {
    id: 'extraction',
    label: 'Extraction',
    shortLabel: 'Extraction',
    focus:
      'Bulk extraction — compound yield & sourcing primary; disease/ASTA/capsaicin/moisture secondary.',
    weights: {
      disease: 'secondary',
      asta: 'secondary',
      capsaicin: 'secondary',
      moisture: 'secondary',
      oleoresin: 'na',
      compoundYield: 'primary',
      sourcing: 'primary',
      contamination: 'secondary',
      compliance: 'secondary',
    },
  },
  {
    id: 'nutraceutical',
    label: 'Nutraceutical',
    shortLabel: 'Nutra',
    focus:
      'Purified capsaicin — capsaicin & yield primary; sourcing weighted heavily; ASTA N/A; batch consistency matters.',
    weights: {
      disease: 'secondary',
      asta: 'na',
      capsaicin: 'primary',
      moisture: 'secondary',
      oleoresin: 'na',
      compoundYield: 'primary',
      sourcing: 'primary',
      contamination: 'secondary',
      compliance: 'secondary',
    },
  },
  {
    id: 'food-colour',
    label: 'Food-colour',
    shortLabel: 'Colour',
    focus:
      'Paprika / carotenoid — ASTA & colour-yield primary; lower capsaicin best, higher ignored.',
    weights: {
      disease: 'secondary',
      asta: 'primary',
      capsaicin: 'secondary',
      moisture: 'secondary',
      oleoresin: 'na',
      compoundYield: 'primary',
      sourcing: 'primary',
      contamination: 'secondary',
      compliance: 'secondary',
    },
    capsaicinMode: 'low-is-best',
  },
  {
    id: 'exporters',
    label: 'Exporters',
    shortLabel: 'Export',
    focus:
      'Market readiness — compliance / MRL & contamination primary; disease & quality secondary.',
    weights: {
      disease: 'secondary',
      asta: 'secondary',
      capsaicin: 'secondary',
      moisture: 'secondary',
      oleoresin: 'na',
      compoundYield: 'secondary',
      sourcing: 'secondary',
      contamination: 'primary',
      compliance: 'primary',
    },
  },
]

export const DEFAULT_COMPANY: CompanyId = 'spice-processors'

export function getCompany(id: CompanyId): CompanyProfile {
  return COMPANIES.find((c) => c.id === id) ?? COMPANIES[0]
}

export function weightOf(company: CompanyProfile, key: MetricKey): number {
  return WEIGHT_VALUE[company.weights[key]]
}
