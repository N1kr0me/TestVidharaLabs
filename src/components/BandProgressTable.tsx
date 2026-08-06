import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/lamp-tooltip'
import type { DecisionResult } from '@/lib/decisions'
import { isUrgentDecision } from '@/lib/urgency'
import { cn } from '@/lib/utils'

export type BandKind = 'risk' | 'quality'

type Row = {
  name: string
  decision: DecisionResult
  /** Optional explicit 0–100 fill; otherwise derived from band. */
  value?: number
  /** Override metric label in tooltip (default: ESI for risk, Score for quality). */
  metric?: string
}

type Props = {
  rows: Row[]
  kind: BandKind
  className?: string
}

const RISK_COLORS: Record<number, string> = {
  0: 'var(--progress-ok)',
  33: 'var(--progress-warn)',
  66: 'var(--progress-danger)',
}

const QUALITY_COLORS: Record<number, string> = {
  0: 'var(--progress-danger)',
  40: 'var(--progress-warn)',
  65: 'var(--progress-ok)',
}

const TONE: Record<DecisionResult['tone'], string> = {
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
  neutral: 'text-ink',
}

function bandToValue(label: string, kind: BandKind): number {
  const l = label.toLowerCase()
  if (kind === 'risk') {
    if (l.includes('elevated')) return 85
    if (l.includes('watch')) return 55
    return 22
  }
  if (l.includes('above')) return 82
  if (l.includes('below')) return 22
  return 50
}

/**
 * Sub-band rows: "Name — Band" + progress bar.
 * Hover shows lamp-tooltip with ESI / score value.
 * Rows share height equally when the table fills its parent.
 */
export function BandProgressTable({ rows, kind, className }: Props) {
  const colors = kind === 'risk' ? RISK_COLORS : QUALITY_COLORS
  const defaultMetric = kind === 'risk' ? 'ESI' : 'Score'

  return (
    <TooltipProvider delayDuration={50}>
      <div
        className={cn(
          'flex h-full min-h-0 w-full flex-col overflow-visible rounded-lg bg-transparent px-2 py-0.5',
          className,
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {rows.map((row, i) => {
            const value =
              row.value ?? bandToValue(row.decision.label, kind)
            const metric = row.metric ?? defaultMetric
            const display = Math.round(value)
            const urgent = isUrgentDecision(row.decision)

            return (
              <div
                key={row.name}
                className={cn(
                  'relative flex min-h-0 flex-1 flex-col justify-center overflow-visible px-0.5',
                  i < rows.length - 1 &&
                    'border-b border-black/55 dark:border-white/30',
                )}
              >
                {urgent ? (
                  <span
                    className="alert-edge-glow absolute inset-0"
                    aria-hidden
                  />
                ) : null}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative z-10 w-full cursor-help outline-none">
                      <p className="mb-0.5 text-center text-[11px] leading-none">
                        <span className="font-semibold text-ink">
                          {row.name}
                        </span>
                        <span className="text-muted"> — </span>
                        <span
                          className={cn(
                            'font-serif text-xs',
                            TONE[row.decision.tone],
                          )}
                        >
                          {row.decision.label}
                        </span>
                      </p>
                      <Progress
                        value={value}
                        colors={colors}
                        className="h-1.5"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-center font-semibold text-ink">{row.name}</p>
                    <p className="mt-0.5 font-serif text-sm text-teal">
                      {metric} {display}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      Band: {row.decision.label}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
