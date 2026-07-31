import { cn } from '@/lib/utils'

type Props = {
  rank: number
  of?: number
  className?: string
}

/** Rank chip shown beside each prediction score. */
export function RankBadge({ rank, of, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-surface-2',
        'px-2 py-0.5 text-[10px] font-semibold tabular-nums text-plum',
        className,
      )}
      title={of != null ? `Rank ${rank} of ${of}` : `Rank ${rank}`}
    >
      Rank #{rank}
      {of != null ? (
        <span className="ml-1 font-normal text-muted">/ {of}</span>
      ) : null}
    </span>
  )
}
