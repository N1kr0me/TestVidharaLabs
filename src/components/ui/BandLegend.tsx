import { cn } from '@/lib/utils'

export type BandLegendItem = {
  label: string
  /** Visual tone matching StatusBadge / score colors */
  tone: 'ok' | 'warn' | 'danger' | 'neutral'
  /** Short meaning, e.g. "lower pressure" */
  meaning?: string
}

const TONE: Record<BandLegendItem['tone'], string> = {
  ok: 'bg-ok/15 text-ok ring-ok/25',
  warn: 'bg-warn/15 text-warn ring-warn/25',
  danger: 'bg-danger/15 text-danger ring-danger/25',
  neutral: 'bg-lavender/15 text-plum ring-lavender/25',
}

/** Disease / contamination three-band scale (decision posture). */
export const RISK_BAND_LEGEND: BandLegendItem[] = [
  { label: 'Stable', tone: 'ok', meaning: 'lower pressure (low)' },
  { label: 'Monitor', tone: 'warn', meaning: 'elevating conditions (medium)' },
  { label: 'Alert', tone: 'danger', meaning: 'higher pressure (high)' },
]

/** Quality three-band scale (decision posture). */
export const QUALITY_BAND_LEGEND: BandLegendItem[] = [
  { label: 'Act', tone: 'danger', meaning: 'below-normal — take action' },
  { label: 'Monitor', tone: 'warn', meaning: 'in-season typical' },
  { label: 'Stable', tone: 'ok', meaning: 'above-normal lean' },
]

type Props = {
  items: BandLegendItem[]
  /** Currently displayed band — highlighted */
  active?: string
  className?: string
  caption?: string
}

/**
 * Compact legend of all bands for a score card so the active value
 * is readable against the full scale.
 */
export function BandLegend({
  items,
  active,
  className,
  caption = 'Band scale',
}: Props) {
  return (
    <div className={cn('w-full text-left', className)}>
      <p className="mb-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-muted">
        {caption}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive =
            active != null &&
            active.toLowerCase() === item.label.toLowerCase()
          return (
            <li
              key={item.label}
              className={cn(
                'flex items-center gap-2 rounded-md px-1.5 py-0.5',
                isActive && 'bg-surface ring-1 ring-border',
              )}
            >
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1',
                  TONE[item.tone],
                  isActive && 'ring-2',
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-current"
                  aria-hidden
                />
                {item.label}
              </span>
              {item.meaning ? (
                <span
                  className={cn(
                    'min-w-0 truncate text-[10px] text-muted',
                    isActive && 'font-medium text-ink',
                  )}
                >
                  {item.meaning}
                  {isActive ? ' · current' : ''}
                </span>
              ) : isActive ? (
                <span className="text-[10px] font-medium text-ink">current</span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
