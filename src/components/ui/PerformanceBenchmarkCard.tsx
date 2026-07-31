import * as React from 'react'
import { motion, useSpring, useTransform, useInView } from 'framer-motion'
import { BarChartHorizontal, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BenchmarkPeer = {
  name: string
  valueLabel: string
  value: number
  icon?: React.ReactNode
}

export type PerformanceLevel = {
  label: string
  value: number
  color: string
}

export type ScoreRow = {
  /** Clear human label, e.g. "Disease potential" */
  label: string
  /** Display text, e.g. "Elevated" or "7.2 / 10" */
  display: string
  /** Numeric for bar (normalized 0–maxScale) */
  value: number
}

type Props = {
  title: string
  subtitle?: string
  headerIcon?: React.ReactNode
  /** Large headline figure (numeric animates; use displayValue for bands) */
  mainValue: number
  mainDisplay?: string
  mainCaption?: string
  percentageChange?: number
  benchmarkAverage: number
  benchmarkLabel?: string
  peers?: BenchmarkPeer[]
  scoreRows: ScoreRow[]
  performanceLevels: PerformanceLevel[]
  selected?: boolean
  onSelect?: () => void
  className?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) =>
    Number.isInteger(value)
      ? Math.round(current).toLocaleString()
      : current.toFixed(1),
  )

  React.useEffect(() => {
    if (isInView) spring.set(value)
  }, [spring, value, isInView])

  return <motion.span ref={ref}>{display}</motion.span>
}

/**
 * Adapted from 21st: kavikatiyar/performance-benchmark-card
 * Uses project tokens; no shadcn Card/Select dependency.
 */
export function PerformanceBenchmarkCard({
  title,
  subtitle,
  headerIcon,
  mainValue,
  mainDisplay,
  mainCaption,
  percentageChange,
  benchmarkAverage,
  benchmarkLabel = 'Pool average',
  peers = [],
  scoreRows,
  performanceLevels,
  selected,
  onSelect,
  className,
}: Props) {
  const cardRef = React.useRef<HTMLButtonElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: '-80px' })
  const maxValue = Math.max(
    mainValue,
    benchmarkAverage,
    ...peers.map((c) => c.value),
    ...scoreRows.map((r) => r.value),
    1,
  )
  const totalLevelValue =
    performanceLevels[performanceLevels.length - 1]?.value ?? 10

  return (
    <button
      type="button"
      ref={cardRef}
      onClick={onSelect}
      className={cn(
        'flex h-full w-full flex-col rounded-2xl border bg-surface p-4 text-left transition',
        selected
          ? 'border-teal ring-2 ring-teal/30'
          : 'border-border hover:border-teal/40',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-muted">
          {headerIcon ?? <MapPin className="h-4 w-4 shrink-0" />}
          <span className="truncate font-semibold text-ink">{title}</span>
        </div>
        {subtitle ? (
          <span className="shrink-0 rounded-full bg-bg px-2 py-0.5 text-[10px] text-muted">
            {subtitle}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-serif text-4xl font-bold tracking-tight text-ink">
            {mainDisplay ?? <AnimatedNumber value={mainValue} />}
          </p>
          {mainCaption ? (
            <p className="mt-1 text-[10px] font-medium text-muted">{mainCaption}</p>
          ) : null}
          {percentageChange != null ? (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                percentageChange >= 0 ? 'text-ok' : 'text-danger',
              )}
            >
              {percentageChange >= 0 ? '▲' : '▼'} {Math.abs(percentageChange)}%
              vs pool avg
            </p>
          ) : null}
        </div>
        <div className="w-1/2 min-w-[7rem]">
          <div className="relative h-2 rounded-full bg-bg">
            <motion.div
              className="absolute h-2 rounded-full bg-teal"
              initial={{ width: 0 }}
              animate={{
                width: isInView ? `${(mainValue / maxValue) * 100}%` : 0,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-ink"
              style={{ left: `${(benchmarkAverage / maxValue) * 100}%` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: isInView ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>{benchmarkLabel}</span>
            <span>{benchmarkAverage.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-border pt-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Scores (labeled)
        </h3>
        {scoreRows.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium text-ink">{row.label}</span>
              <span className="tabular-nums text-muted">{row.display}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg">
              <motion.div
                className="h-full rounded-full bg-plum/70"
                initial={{ width: 0 }}
                animate={{
                  width: isInView
                    ? `${Math.min(100, (row.value / maxValue) * 100)}%`
                    : 0,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      {peers.length > 0 ? (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-medium text-ink">Compared districts</h3>
          {peers.map((peer) => (
            <div key={peer.name} className="flex items-center gap-2 text-xs">
              <span className="text-muted">{peer.icon}</span>
              <span className="flex-1 text-ink/90">{peer.name}</span>
              <span className="font-medium tabular-nums text-ink">
                {peer.valueLabel}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        <h3 className="flex items-center gap-2 text-xs font-medium text-ink">
          <BarChartHorizontal className="h-3.5 w-3.5 text-muted" />
          Benchmark levels
        </h3>
        <div className="relative flex h-2 w-full overflow-hidden rounded-full">
          {performanceLevels.map((level, i) => {
            const prev = i > 0 ? performanceLevels[i - 1].value : 0
            const width = ((level.value - prev) / totalLevelValue) * 100
            return (
              <div
                key={level.label}
                className={level.color}
                style={{ width: `${width}%` }}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted">
          {performanceLevels.map((level) => (
            <span key={level.label}>{level.label}</span>
          ))}
        </div>
      </div>
    </button>
  )
}
