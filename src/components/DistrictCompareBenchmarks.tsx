import { MapPin } from 'lucide-react'
import {
  PerformanceBenchmarkCard,
  type ScoreRow,
} from '@/components/ui/PerformanceBenchmarkCard'
import type { ProductPrediction } from '@/lib/productEngine'
import { cn } from '@/lib/utils'

type Props = {
  predictions: ProductPrediction[]
  focusId: string
  onFocus: (id: string) => void
  className?: string
}

function diseaseNumeric(band: string): number {
  if (band === 'Elevated') return 9
  if (band === 'Watch') return 5
  return 2
}

function qualityNumeric(band: string): number {
  if (band === 'Above-normal') return 9
  if (band === 'Below-normal') return 3
  return 6
}

function scoreRowsFor(p: ProductPrediction): ScoreRow[] {
  const best = p.complianceRanked[0]
  return [
    {
      label: 'Disease potential',
      display: p.diseaseBand,
      value: diseaseNumeric(p.diseaseBand),
    },
    {
      label: 'Quality potential',
      display: p.qualityBand,
      value: qualityNumeric(p.qualityBand),
    },
    {
      label: 'Contamination potential',
      display: p.contaminationBand,
      value: diseaseNumeric(p.contaminationBand),
    },
    {
      label: `Compliance · ${best.market}`,
      display: `${best.score} / 10`,
      value: best.score,
    },
    {
      label: 'Compound yield',
      display: `${p.compoundYieldIndex} / 10`,
      value: p.compoundYieldIndex,
    },
    {
      label: 'Sourcing reliability (proxy)',
      display: `${p.sourcingProxyIndex} / 10`,
      value: p.sourcingProxyIndex,
    },
  ]
}

const LEVELS = [
  { label: '0', value: 3, color: 'bg-danger' },
  { label: '3', value: 6, color: 'bg-warn' },
  { label: '6', value: 8, color: 'bg-teal/70' },
  { label: '10', value: 10, color: 'bg-ok' },
]

/**
 * V2/V3 comparison strip — one benchmark card per district, evenly spaced.
 * Adapted from 21st Performance Benchmark Card.
 */
export function DistrictCompareBenchmarks({
  predictions,
  focusId,
  onFocus,
  className,
}: Props) {
  const n = predictions.length
  if (n === 0) return null

  const avgSourcing =
    predictions.reduce((s, p) => s + p.sourcingProxyIndex, 0) / n

  return (
    <div className={cn('w-full', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        District comparison
      </p>
      <p className="mt-1 text-xs text-muted">
        Each card lists every score by name. Click a district to open full layers
        below.
      </p>
      <div
        className={cn(
          'mt-4 grid gap-4',
          n === 1 && 'grid-cols-1 max-w-md',
          n === 2 && 'grid-cols-1 sm:grid-cols-2',
          n === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          n === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          n >= 5 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        )}
      >
        {predictions.map((p) => {
          const peers = predictions
            .filter((x) => x.district.id !== p.district.id)
            .map((x) => ({
              name: x.district.name,
              value: x.sourcingProxyIndex,
              valueLabel: `${x.sourcingProxyIndex}/10 sourcing`,
              icon: <MapPin className="h-3.5 w-3.5" />,
            }))
          const delta = Number(
            (
              ((p.sourcingProxyIndex - avgSourcing) / Math.max(avgSourcing, 0.1)) *
              100
            ).toFixed(1),
          )
          return (
            <PerformanceBenchmarkCard
              key={p.district.id}
              title={p.district.name}
              subtitle={p.district.state}
              headerIcon={<MapPin className="h-4 w-4" />}
              mainValue={p.sourcingProxyIndex}
              mainDisplay={String(p.sourcingProxyIndex)}
              mainCaption="Sourcing reliability proxy (0–10)"
              percentageChange={delta}
              benchmarkAverage={Number(avgSourcing.toFixed(1))}
              benchmarkLabel="Compare avg"
              peers={peers}
              scoreRows={scoreRowsFor(p)}
              performanceLevels={LEVELS}
              selected={p.district.id === focusId}
              onSelect={() => onFocus(p.district.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
