import { cn } from '@/lib/utils'

export type RankTier = 'top' | 'mid' | 'low'

/** Split pool into thirds by rank (1 = best). */
export function rankTier(rank: number, of: number): RankTier {
  if (of <= 0) return 'mid'
  const topCut = Math.ceil(of / 3)
  const midCut = Math.ceil((2 * of) / 3)
  if (rank <= topCut) return 'top'
  if (rank <= midCut) return 'mid'
  return 'low'
}

const TIER_CLASS: Record<RankTier, string> = {
  top: 'border-ok/40 bg-ok/15 text-ok',
  mid: 'border-warn/40 bg-warn/15 text-warn',
  low: 'border-danger/40 bg-danger/15 text-danger',
}

const TIER_LABEL: Record<RankTier, string> = {
  top: 'Top third of pool',
  mid: 'Middle third of pool',
  low: 'Lowest third of pool',
}

type Props = {
  rank: number
  of?: number
  className?: string
}

/**
 * Rank chip beside each prediction score.
 * Color: green = top third · yellow = mid · red = lowest third.
 */
export function RankBadge({ rank, of, className }: Props) {
  const tier = of != null && of > 0 ? rankTier(rank, of) : null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5',
        'text-[10px] font-semibold tabular-nums',
        tier ? TIER_CLASS[tier] : 'border-border bg-surface-2 text-plum',
        className,
      )}
      title={
        of != null
          ? `Rank ${rank} of ${of}${tier ? ` · ${TIER_LABEL[tier]}` : ''}`
          : `Rank ${rank}`
      }
    >
      Rank #{rank}
      {of != null ? (
        <span className="ml-1 font-normal opacity-80">/ {of}</span>
      ) : null}
    </span>
  )
}
