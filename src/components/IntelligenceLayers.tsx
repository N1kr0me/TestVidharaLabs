import { useMemo, useState } from 'react'
import { FeaturesTable } from '@/components/ui/FeaturesTable'
import { RankBadge } from '@/components/ui/RankBadge'
import { StatisticsCards, type StatCard } from '@/components/ui/StatisticsCards'
import { LayerCard } from '@/layers/LayerCard'
import { INTELLIGENCE_LAYERS } from '@/layers/types'
import { buildFeatureRows } from '@/lib/features'
import {
  l5Summary,
  COMPLIANCE_MARKETS,
  type ComplianceMarket,
  type ProductPrediction,
  type RankedRow,
} from '@/lib/productEngine'
import type { UserRoleId } from '@/lib/roles'
import { USER_ROLES } from '@/lib/roles'

type Props = {
  role: UserRoleId
  prediction: ProductPrediction
  ranked: RankedRow[]
  loading?: boolean
  /** V4 only — per-score rank badges (full tables live in RankingView) */
  showRanks?: boolean
}

function toneForBand(band: string): StatCard['tone'] {
  const b = band.toLowerCase()
  if (b.includes('elevated') || b.includes('below')) return 'danger'
  if (b.includes('watch') || b.includes('normal')) return 'warn'
  if (b.includes('above') || b.includes('low')) return 'ok'
  return 'neutral'
}

export function IntelligenceLayers({
  role,
  prediction: p,
  ranked,
  loading,
  showRanks = false,
}: Props) {
  const total = ranked.length
  const row = ranked.find((r) => r.prediction.district.id === p.district.id)
  const ranks = showRanks ? row?.ranks : undefined
  const roleMeta = USER_ROLES.find((r) => r.id === role)
  const summary = l5Summary(role, p)
  const featureRows = buildFeatureRows(p.features, p.stage)

  const [market, setMarket] = useState<ComplianceMarket>('India')

  const selectedCompliance = useMemo(() => {
    return (
      p.compliance.find((c) => c.market === market) ?? p.compliance[0]
    )
  }, [p.compliance, market])

  const layer1: StatCard[] = [
    {
      title: 'Disease potential',
      subtitle: 'Blended ESI → band',
      value: p.diseaseBand,
      tone: toneForBand(p.diseaseBand),
      status: p.diseaseBand,
      evidence: 'Established',
      rank: ranks?.disease,
      rankOf: total,
      description: `Anthracnose ESI ${p.anthracnoseEsi.toFixed(0)} · Wilt ${p.wiltEsi.toFixed(0)} · Leaf curl ${p.leafCurlEsi.toFixed(0)}.${showRanks ? ' Rank #1 = lowest disease pressure.' : ''}`,
    },
    {
      title: 'Quality potential',
      subtitle: 'ASTA-leaning directional',
      value: p.qualityBand,
      tone: toneForBand(p.qualityBand),
      status: p.qualityBand,
      evidence: 'Assumption',
      rank: ranks?.quality,
      rankOf: total,
      description:
        'Colour / pungency / oleoresin conduciveness vs usual season — not a lab assay.',
    },
  ]

  const layer2: StatCard[] = [
    {
      title: 'Compliance readiness',
      subtitle: 'Selected market · 0–10',
      value: String(selectedCompliance.score),
      tone: 'ok',
      status: p.contaminationBand,
      evidence: 'Assumption',
      rank: ranks?.complianceBest,
      rankOf: total,
      headerSlot: (
        <select
          aria-label="Compliance market"
          value={market}
          onChange={(e) => setMarket(e.target.value as ComplianceMarket)}
          className="max-w-[9.5rem] rounded-lg border border-border bg-surface px-2 py-1 text-xs font-semibold text-ink outline-none focus:border-teal"
        >
          {COMPLIANCE_MARKETS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      ),
      description: `${market} readiness from contamination / aflatoxin pressure (ESI ${p.aflatoxinEsi.toFixed(0)}). Stricter markets score lower for the same pressure.`,
    },
    {
      title: 'Contamination potential',
      subtitle: 'Aflatoxin pathway band',
      value: p.contaminationBand,
      tone: toneForBand(p.contaminationBand),
      status: p.contaminationBand,
      evidence: 'Expert judgement',
      rank: ranks?.contamination,
      rankOf: total,
      description:
        'Pre-harvest environmental pressure only — drying/storage after harvest not observed.',
    },
  ]

  const layer3: StatCard[] = [
    {
      title: 'Compound yield',
      subtitle: 'Biomass × quality proxy',
      value: String(p.compoundYieldIndex),
      tone: 'neutral',
      evidence: 'Assumption',
      rank: ranks?.compoundYield,
      rankOf: total,
      description:
        'Weather-based yield conduciveness × quality factor. No live NDVI.',
    },
  ]

  const layer4: StatCard[] = [
    {
      title: 'Sourcing reliability',
      subtitle: 'Regional risk proxy',
      value: String(p.sourcingProxyIndex),
      tone: 'ok',
      evidence: 'Data gap',
      rank: ranks?.sourcing,
      rankOf: total,
      description:
        'Proxy from disease, quality, compliance, compound yield — not validated delivery reliability.',
    },
  ]

  const whyItems =
    role === 'agronomy' ? p.agronomyRationale : p.rationale

  return (
    <div className="flex flex-col gap-4">
      <LayerCard meta={INTELLIGENCE_LAYERS[0]} roleHint={roleMeta?.focus}>
        <StatisticsCards cards={layer1} heading="Layer 1 — bands" columns={2} />
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Why these scores
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {whyItems.slice(0, 6).map((r) => (
              <li key={r} className="flex gap-2 text-sm leading-snug text-ink/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </LayerCard>

      <LayerCard meta={INTELLIGENCE_LAYERS[1]} roleHint={roleMeta?.focus}>
        <StatisticsCards
          cards={layer2}
          heading="Layer 2 — compliance markets"
          columns={2}
        />
      </LayerCard>

      <LayerCard meta={INTELLIGENCE_LAYERS[2]}>
        <StatisticsCards
          cards={layer3}
          heading="Layer 3 — index 0–10"
          columns={1}
          centerSingle
        />
      </LayerCard>

      <LayerCard meta={INTELLIGENCE_LAYERS[3]}>
        <StatisticsCards
          cards={layer4}
          heading="Layer 4 — proxy 0–10"
          columns={1}
          centerSingle
        />
      </LayerCard>

      <LayerCard meta={INTELLIGENCE_LAYERS[4]} roleHint={roleMeta?.label}>
        <div className="space-y-2 text-sm text-ink/90">
          <p className="font-semibold text-ink">{summary.headline}</p>
          <p>
            <span className="font-semibold text-plum">Action: </span>
            {summary.action}
          </p>
          <p className="text-muted">{summary.detail}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {showRanks && ranks ? (
              <>
                <RankBadge rank={ranks.disease} of={total} />
                <RankBadge rank={ranks.quality} of={total} />
                <RankBadge rank={ranks.contamination} of={total} />
                <RankBadge rank={ranks.complianceBest} of={total} />
                <RankBadge rank={ranks.compoundYield} of={total} />
                <RankBadge rank={ranks.sourcing} of={total} />
              </>
            ) : null}
          </div>
        </div>
      </LayerCard>

      <div id="section-features" className="scroll-mt-24">
        <FeaturesTable
          rows={featureRows}
          loading={loading}
          caption={`Source: ${p.features.source} · ${new Date(p.features.fetchedAt).toLocaleString()} · NDVI omitted (no live API)`}
        />
      </div>
    </div>
  )
}
