import { cn } from '@/lib/utils'

type Props = {
  label: string
  className?: string
  /** When true, danger chips pulse (e.g. Alert count > 0). Default: idle solid. */
  pulse?: boolean
}

function toneFromLabel(label: string): 'danger' | 'warn' | 'ok' | 'neutral' {
  const l = label.toLowerCase()
  if (
    l.includes('alert') ||
    l.includes('act') ||
    l.includes('elevated') ||
    l.includes('below') ||
    l.includes('high')
  ) {
    return 'danger'
  }
  if (l.includes('monitor') || l.includes('watch')) return 'warn'
  if (
    l.includes('stable') ||
    l.includes('normal') ||
    l.includes('low') ||
    l.includes('above') ||
    l.includes('ok')
  ) {
    return 'ok'
  }
  return 'neutral'
}

/**
 * Compact solid status chip — same plastic fill language as filter-bar StatChip.
 */
export function StatusChip({ label, className, pulse = false }: Props) {
  const tone = toneFromLabel(label)
  const solid = tone !== 'neutral'

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full px-2 py-0.5',
        'text-[12px] font-bold uppercase tracking-wide',
        solid && 'solid-panel plastic-pill',
        tone === 'danger' &&
          (pulse
            ? 'solid-panel-danger overflow-visible'
            : 'solid-panel-danger solid-panel-danger-idle'),
        tone === 'warn' && 'solid-panel-warn',
        tone === 'ok' && 'solid-panel-ok',
        tone === 'neutral' &&
          'border border-border bg-surface text-muted',
        className,
      )}
    >
      <span
        className={cn(
          'relative z-10',
          solid ? 'text-[#fffef8] dark:text-[#0a0a0a]' : 'text-muted',
        )}
      >
        {label}
      </span>
    </span>
  )
}
