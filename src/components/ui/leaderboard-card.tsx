import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  LeaderboardRankings,
  type LeaderboardRankingItem,
} from '@/components/ui/leaderboard-rankings'

export type LeaderboardCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
  subtitle?: string
  rankings: LeaderboardRankingItem[]
  currentUserId?: string
  onSelectUser?: (userId: string) => void
  pageSize?: number
  compact?: boolean
}

/**
 * Adapted from 21st: trophyso/leaderboard-card
 * Paginated rankings only (no podium / top-3 display).
 */
export const LeaderboardCard = React.forwardRef<
  HTMLDivElement,
  LeaderboardCardProps
>(function LeaderboardCard(
  {
    className,
    title = 'Leaderboard',
    subtitle,
    rankings,
    currentUserId,
    onSelectUser,
    pageSize = 8,
    compact = false,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface shadow-sm',
        compact ? 'p-2.5 sm:p-3' : 'p-4 sm:p-5',
        className,
      )}
      {...props}
    >
      <div className={cn('min-w-0', compact ? 'mb-2' : 'mb-4')}>
        <h3
          className={cn(
            'truncate font-serif text-ink',
            compact ? 'text-sm leading-tight' : 'text-lg sm:text-xl',
          )}
          title={title}
        >
          {title}
        </h3>
        {subtitle ? (
          <p
            className={cn(
              'text-muted',
              compact
                ? 'mt-0.5 line-clamp-2 text-[10px] leading-snug'
                : 'text-xs sm:text-sm',
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      <LeaderboardRankings
        rankings={rankings}
        currentUserId={currentUserId}
        showPagination
        defaultPageSize={pageSize}
        onSelect={onSelectUser}
        compact={compact}
      />
    </div>
  )
})

export type { LeaderboardRankingItem }
