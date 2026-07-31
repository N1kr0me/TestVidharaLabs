/** Dashboard comparison versions — switcher in the header. */
export type ProductVersionId =
  | 'V1-single'
  | 'V2-compare-2'
  | 'V3-compare-5'
  | 'V4-ranking'

export type ProductVersion = {
  id: ProductVersionId
  label: string
  shortLabel: string
  description: string
}

export const PRODUCT_VERSIONS: ProductVersion[] = [
  {
    id: 'V1-single',
    label: 'V1 — Single district',
    shortLabel: 'V1 · 1 district',
    description: 'One district at a time (Phase 0–style baseline).',
  },
  {
    id: 'V2-compare-2',
    label: 'V2 — Compare 2',
    shortLabel: 'V2 · 2 districts',
    description: 'Select and compare two districts side by side.',
  },
  {
    id: 'V3-compare-5',
    label: 'V3 — Compare up to 5',
    shortLabel: 'V3 · ≤5 districts',
    description: 'Shortlist-style comparison of up to five districts.',
  },
  {
    id: 'V4-ranking',
    label: 'V4 — Full ranking',
    shortLabel: 'V4 · Ranking',
    description:
      'All districts ranked; selected district explained vs full ranks. Primary mockup path.',
  },
]

export const DEFAULT_VERSION: ProductVersionId = 'V4-ranking'
