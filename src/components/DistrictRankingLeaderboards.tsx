import { useMemo } from 'react'
import { LeaderboardCard } from '@/components/ui/leaderboard-card'
import { type RankKey, type RankedRow } from '@/lib/productEngine'
import { cn } from '@/lib/utils'

type MetricDef = {
  key: RankKey
  title: string
  hint: string
  valueOf: (row: RankedRow) => number
  valueLabelOf: (row: RankedRow) => string
  bylineOf: (row: RankedRow) => string
}

const METRICS: MetricDef[] = [
  {
    key: 'disease',
    title: 'Disease',
    hint: '#1 = lowest risk',
    valueOf: (r) => r.prediction.diseaseEsi,
    valueLabelOf: (r) => `ESI ${r.prediction.diseaseEsi.toFixed(0)}`,
    bylineOf: (r) =>
      `${r.prediction.district.state} · ${r.prediction.diseaseBand}`,
  },
  {
    key: 'quality',
    title: 'Quality',
    hint: 'Higher ranks first',
    valueOf: (r) => r.prediction.qualityScore,
    valueLabelOf: (r) => r.prediction.qualityScore.toFixed(1),
    bylineOf: (r) =>
      `${r.prediction.district.state} · ${r.prediction.qualityBand}`,
  },
  {
    key: 'complianceBest',
    title: 'Compliance',
    hint: 'Best market 0–10',
    valueOf: (r) => r.prediction.complianceRanked[0]?.score ?? 0,
    valueLabelOf: (r) =>
      `${r.prediction.complianceRanked[0]?.score ?? 0}/10`,
    bylineOf: (r) => {
      const m = r.prediction.complianceRanked[0]
      return `${r.prediction.district.state} · ${m?.market ?? '—'}`
    },
  },
  {
    key: 'compoundYield',
    title: 'Yield',
    hint: 'Compound 0–10',
    valueOf: (r) => r.prediction.compoundYieldIndex,
    valueLabelOf: (r) => `${r.prediction.compoundYieldIndex}/10`,
    bylineOf: (r) => `${r.prediction.district.state} · stage pool`,
  },
  {
    key: 'sourcing',
    title: 'Sourcing',
    hint: 'Proxy 0–10',
    valueOf: (r) => r.prediction.sourcingProxyIndex,
    valueLabelOf: (r) => `${r.prediction.sourcingProxyIndex}/10`,
    bylineOf: (r) => `${r.prediction.district.state} · proxy`,
  },
]

type Props = {
  ranked: RankedRow[]
  selectedId: string
  onSelect: (districtId: string) => void
  stageLabel?: string
  className?: string
}

/**
 * V4 full-pool ranking tables — paginated lists, no podium.
 * Five metrics on one horizontal row.
 */
export function DistrictRankingLeaderboards({
  ranked,
  selectedId,
  onSelect,
  stageLabel,
  className,
}: Props) {
  const cards = useMemo(() => {
    return METRICS.map((m) => {
      const ordered = [...ranked].sort(
        (a, b) => a.ranks[m.key] - b.ranks[m.key],
      )
      const rankings = ordered.map((r) => ({
        userId: r.prediction.district.id,
        rank: r.ranks[m.key],
        userName: r.prediction.district.name,
        byline: m.bylineOf(r),
        value: m.valueOf(r),
        valueLabel: m.valueLabelOf(r),
        initials: r.prediction.district.name.slice(0, 2).toUpperCase(),
        displayed: true,
      }))
      return { ...m, rankings }
    })
  }, [ranked])

  return (
    <div id="section-rankings" className={cn('w-full scroll-mt-24', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        Full pool rankings
      </p>
      <p className="mt-1 text-xs text-muted">
        Paginated peer pool per layer. Click a district to load layers above.
        {stageLabel ? ` · ${stageLabel}` : null}
      </p>

      <div className="mt-4 grid grid-cols-5 gap-2 lg:gap-3">
        {cards.map((c) => (
          <LeaderboardCard
            key={c.key}
            compact
            title={c.title}
            subtitle={c.hint}
            rankings={c.rankings}
            currentUserId={selectedId}
            onSelectUser={onSelect}
            pageSize={8}
            className="min-w-0"
          />
        ))}
      </div>
    </div>
  )
}
