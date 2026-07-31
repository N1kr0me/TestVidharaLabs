import * as React from 'react'
import { ChevronLeft, ChevronRight, Crown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LeaderboardRankingItem = {
  userId: string
  rank: number
  userName: string
  byline?: string
  value: number
  valueLabel?: string
  avatarUrl?: string
  initials?: string
  displayed?: boolean
}

type Props = {
  rankings: LeaderboardRankingItem[]
  currentUserId?: string
  showPagination?: boolean
  defaultPageSize?: number
  className?: string
  onSelect?: (userId: string) => void
  compact?: boolean
}

const CROWN: Record<number, string> = {
  1: 'text-[#b8860b]',
  2: 'text-[#6b7280]',
  3: 'text-[#a16207]',
}

function formatValue(n: number, label?: string) {
  if (label) return label
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function RowAvatar({
  name,
  initials,
  avatarUrl,
  compact,
}: {
  name: string
  initials?: string
  avatarUrl?: string
  compact?: boolean
}) {
  const letters =
    initials ??
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')

  const size = compact ? 'h-7 w-7 text-[9px]' : 'h-9 w-9 text-xs'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={cn('shrink-0 rounded-full object-cover', size)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-bold text-plum',
        size,
      )}
    >
      {letters || <MapPin className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
    </div>
  )
}

/**
 * Adapted from 21st: trophyso/leaderboard-rankings
 * Paginated rank rows; top-3 crowns; current row outline.
 */
export function LeaderboardRankings({
  rankings,
  currentUserId,
  showPagination = true,
  defaultPageSize = 10,
  className,
  onSelect,
  compact = false,
}: Props) {
  const visible = rankings.filter((r) => r.displayed !== false)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)
  const [page, setPage] = React.useState(1)

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const safePage = Math.min(page, totalPages)

  React.useEffect(() => {
    setPage(1)
  }, [pageSize, rankings])

  const slice = visible.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  return (
    <div className={cn('w-full', className)}>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {slice.map((row) => {
          const isCurrent = row.userId === currentUserId
          return (
            <li key={row.userId}>
              <button
                type="button"
                onClick={() => onSelect?.(row.userId)}
                className={cn(
                  'flex w-full items-center text-left transition-colors hover:bg-surface-2/60',
                  compact ? 'gap-1.5 px-2 py-1.5' : 'gap-2.5 px-3 py-2.5',
                  isCurrent &&
                    'bg-teal/10 ring-2 ring-inset ring-ink dark:ring-teal',
                )}
              >
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-0.5',
                    compact ? 'w-7' : 'w-9',
                  )}
                >
                  <span
                    className={cn(
                      'font-bold tabular-nums text-ink',
                      compact ? 'text-[11px]' : 'text-sm',
                    )}
                  >
                    {row.rank}
                  </span>
                  {row.rank <= 3 ? (
                    <Crown
                      className={cn(
                        compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
                        CROWN[row.rank],
                      )}
                      strokeWidth={2.25}
                    />
                  ) : null}
                </span>
                <RowAvatar
                  name={row.userName}
                  initials={row.initials}
                  avatarUrl={row.avatarUrl}
                  compact={compact}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate font-semibold text-ink',
                      compact ? 'text-[11px]' : 'text-sm',
                    )}
                  >
                    {row.userName}
                    {isCurrent && !compact ? (
                      <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-teal">
                        Selected
                      </span>
                    ) : null}
                  </span>
                  {row.byline && !compact ? (
                    <span className="block truncate text-[11px] text-muted">
                      {row.byline}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    'shrink-0 font-bold tabular-nums text-ink',
                    compact ? 'text-[11px]' : 'text-sm',
                  )}
                >
                  {formatValue(row.value, row.valueLabel)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {showPagination && visible.length > 0 ? (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-1',
            compact ? 'mt-2' : 'mt-3 gap-2',
          )}
        >
          <label className="flex items-center gap-1 text-[10px] text-muted">
            Show
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink outline-none focus:border-teal"
            >
              {[5, 10, 15, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-border p-1 text-ink disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[4.5rem] text-center text-[10px] text-muted">
              {safePage}/{totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-border p-1 text-ink disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
