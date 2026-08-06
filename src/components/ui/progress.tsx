import { cn } from '@/lib/utils'

type ProgressType = 'default' | 'success' | 'warning' | 'error' | 'secondary'

type ProgressProps = {
  value: number
  max?: number
  /** Threshold → CSS color. Highest matching key ≤ value wins. */
  colors?: Record<number, string>
  type?: ProgressType
  className?: string
}

function resolveColor(
  value: number,
  type: ProgressType,
  colors?: Record<number, string>,
): string {
  if (colors) {
    const keys = Object.keys(colors)
      .map(Number)
      .sort((a, b) => a - b)
    let color = colors[keys[0]] ?? 'var(--teal)'
    for (const key of keys) {
      if (value >= key) color = colors[key]!
    }
    return color
  }
  switch (type) {
    case 'success':
      return 'var(--ok)'
    case 'error':
      return 'var(--danger)'
    case 'warning':
      return 'var(--warn)'
    case 'secondary':
      return 'var(--muted)'
    default:
      return 'var(--teal)'
  }
}

/**
 * Progress bar with dynamic colors — adapted from
 * https://21st.dev/@shugar/components/progress/dynamic-colors
 */
export function Progress({
  value,
  max = 100,
  colors,
  type = 'default',
  className,
}: ProgressProps) {
  const color = resolveColor(value, type, colors)

  return (
    <progress
      value={Math.min(Math.max(value, 0), max)}
      max={max}
      className={cn(
        'h-2.5 w-full appearance-none rounded-[5px]',
        // Outline so the track reads against light / dark card surfaces
        'border border-black dark:border-white/40',
        // Higher-contrast track than surface-2
        '[&::-webkit-progress-bar]:rounded-[4px] [&::-webkit-progress-bar]:bg-[#cfc6b8]',
        'dark:[&::-webkit-progress-bar]:bg-[#5a5a5a]',
        '[&::-webkit-progress-value]:rounded-[4px] [&::-webkit-progress-value]:bg-[var(--ds-progress-color)] [&::-webkit-progress-value]:transition-all',
        '[&::-moz-progress-bar]:rounded-[4px] [&::-moz-progress-bar]:bg-[var(--ds-progress-color)] [&::-moz-progress-bar]:transition-all',
        className,
      )}
      style={{ ['--ds-progress-color' as string]: color }}
    />
  )
}
