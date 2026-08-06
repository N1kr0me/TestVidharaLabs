import { cn } from '@/lib/utils'

type Props = {
  label: string
  className?: string
  /** Stronger fill/ring — e.g. on selected ranking rows */
  emphasis?: boolean
}

function tone(label: string, emphasis: boolean) {
  const l = label.toLowerCase()

  if (
    l.includes('alert') ||
    l.includes('elevated') ||
    l.includes('below') ||
    l.includes('high')
  ) {
    return emphasis
      ? 'bg-danger/50 text-danger ring-danger/65'
      : 'bg-danger/15 text-danger ring-danger/25'
  }
  if (l.includes('watch')) {
    return emphasis
      ? 'bg-warn/50 text-warn ring-warn/65'
      : 'bg-warn/15 text-warn ring-warn/25'
  }
  if (
    l.includes('normal') ||
    l.includes('low') ||
    l.includes('above') ||
    l.includes('ok')
  ) {
    return emphasis
      ? 'bg-ok/50 text-ok ring-ok/65'
      : 'bg-ok/15 text-ok ring-ok/25'
  }
  return emphasis
    ? 'bg-lavender/50 text-plum ring-lavender/65'
    : 'bg-lavender/15 text-plum ring-lavender/25'
}

/** 21st: uniquesonu/status-badge-beautiful-accessible-status-indicators */
export function StatusBadge({ label, className, emphasis = false }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1',
        tone(label, emphasis),
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  )
}
