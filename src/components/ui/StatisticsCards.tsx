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

/** Compact metric tiles — large centered value, less empty space */
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
              className="flex flex-col rounded-xl border border-border bg-bg/70 px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-snug text-ink">
                    {card.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">{card.subtitle}</p>
                </div>
                <Icon
                  className={cn('h-4 w-4 shrink-0', valueClass[card.tone])}
                  aria-hidden
                />
              </div>

              <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
                <p
                  className={cn(
                    'font-serif text-4xl leading-none tracking-tight sm:text-5xl',
                    valueClass[card.tone],
                  )}
                >
                  {card.value}
                </p>
                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                  {card.status ? <StatusBadge label={card.status} /> : null}
                  {card.evidence ? (
                    <EvidenceBadge label={card.evidence} />
                  ) : null}
                </div>
              </div>

              <p className="line-clamp-2 text-center text-[10px] leading-snug text-muted">
                {card.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
