import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { RankBadge } from './RankBadge'
import { BandLegend, type BandLegendItem } from './BandLegend'

export type StatCard = {
  title: string
  subtitle: string
  value: string
  description: string
  tone: 'danger' | 'warn' | 'ok' | 'neutral'
  status?: string
  rank?: number
  rankOf?: number
  headerSlot?: ReactNode
  /** Full band scale legend (when value is a band) */
  bandLegend?: BandLegendItem[]
  footer?: ReactNode
}

type Props = {
  cards: StatCard[]
  className?: string
  heading?: string
  /** Force equal columns (default auto from count) */
  columns?: 1 | 2 | 3
  /** Center a single card in the row */
  centerSingle?: boolean
}

const valueClass = {
  danger: 'text-danger',
  warn: 'text-warn',
  ok: 'text-ok',
  neutral: 'text-ink',
}

export function StatisticsCards({
  cards,
  className,
  heading = 'Scores',
  columns,
  centerSingle = false,
}: Props) {
  const cols = columns ?? (cards.length === 1 ? 1 : cards.length === 2 ? 2 : 3)

  return (
    <div className={cn('w-full', className)}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
        {heading}
      </p>
      <div
        className={cn(
          'grid grid-cols-1 gap-3',
          cols === 2 && 'sm:grid-cols-2',
          cols === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
          centerSingle && cards.length === 1 && 'justify-items-center',
        )}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            className={cn(
              'flex w-full flex-col rounded-xl border border-border bg-bg/70 px-3.5 py-3',
              centerSingle && cards.length === 1 && 'max-w-md',
            )}
          >
            <div
              className={cn(
                'flex min-w-0 flex-wrap items-start gap-2',
                centerSingle && cards.length === 1
                  ? 'flex-col items-center text-center'
                  : 'justify-between',
              )}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-snug text-ink">
                  {card.title}
                </p>
                <p className="mt-0.5 text-[10px] text-muted">{card.subtitle}</p>
              </div>
              {card.headerSlot ? (
                <div className="shrink-0">{card.headerSlot}</div>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
              <p
                className={cn(
                  'font-serif text-5xl leading-none tracking-tight sm:text-5xl',
                  valueClass[card.tone],
                )}
              >
                {card.value}
              </p>
              <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                {card.rank != null ? (
                  <RankBadge rank={card.rank} of={card.rankOf} />
                ) : null}
                {card.status ? <StatusBadge label={card.status} /> : null}
              </div>
            </div>

            <p className="line-clamp-4 text-center text-[10px] leading-snug text-muted">
              {card.description}
            </p>
            {card.bandLegend && card.bandLegend.length > 0 ? (
              <div className="mt-2 border-t border-border/70 pt-2">
                <BandLegend items={card.bandLegend} active={card.value} />
              </div>
            ) : null}
            {card.footer ? (
              <div
                className={cn(
                  'mt-2 text-center',
                  card.bandLegend
                    ? 'border-t border-border/50 pt-2'
                    : 'border-t border-border/70 pt-2',
                )}
              >
                {card.footer}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
