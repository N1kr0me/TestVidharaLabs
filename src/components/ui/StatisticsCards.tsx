import { Activity, FlaskConical, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { EvidenceBadge } from './EvidenceBadge'

export type StatCard = {
  title: string
  subtitle: string
  value: string
  description: string
  tone: 'danger' | 'warn' | 'ok' | 'neutral'
  status?: string
  evidence?: string
}

type Props = {
  cards: StatCard[]
  className?: string
}

const icons = {
  danger: ShieldAlert,
  warn: Activity,
  ok: FlaskConical,
  neutral: Activity,
}

const valueClass = {
  danger: 'text-danger',
  warn: 'text-warn',
  ok: 'text-ok',
  neutral: 'text-ink',
}

/** Horizontal square metric tiles (inside rationale glow card) */
export function StatisticsCards({ cards, className }: Props) {
  return (
    <div className={cn('w-full', className)}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
        Phase 0 predictions
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = icons[card.tone]
          return (
            <div
              key={card.title}
              className={cn(
                'flex aspect-square flex-col justify-between rounded-xl border border-border bg-bg/70 p-3.5',
                'min-h-[9.5rem] sm:min-h-0',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-snug text-ink sm:text-sm">
                    {card.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted sm:text-xs">
                    {card.subtitle}
                  </p>
                </div>
                <Icon
                  className={cn('h-4 w-4 shrink-0', valueClass[card.tone])}
                  aria-hidden
                />
              </div>

              <div className="space-y-2">
                <p
                  className={cn(
                    'font-serif text-2xl tracking-tight sm:text-3xl',
                    valueClass[card.tone],
                  )}
                >
                  {card.value}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {card.status ? <StatusBadge label={card.status} /> : null}
                  {card.evidence ? (
                    <EvidenceBadge label={card.evidence} />
                  ) : null}
                </div>
                <p className="line-clamp-3 text-[10px] leading-snug text-muted sm:text-[11px]">
                  {card.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
