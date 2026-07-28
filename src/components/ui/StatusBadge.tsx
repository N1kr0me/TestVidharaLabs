import { cn } from '@/lib/utils'

type Props = {
  label: string
  className?: string
}

function tone(label: string) {
  const l = label.toLowerCase()
  if (l.includes('elevated') || l.includes('below') || l.includes('high')) {
    return 'bg-danger/15 text-danger ring-danger/25'
  }
  if (l.includes('watch') || (l.includes('normal') && !l.includes('above') && !l.includes('below'))) {
    return 'bg-warn/15 text-warn ring-warn/25'
  }
  if (l.includes('low') || l.includes('above') || l.includes('ok')) {
    return 'bg-ok/15 text-ok ring-ok/25'
  }
  return 'bg-lavender/15 text-plum ring-lavender/25'
}

/** 21st: uniquesonu/status-badge-beautiful-accessible-status-indicators */
export function StatusBadge({ label, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1',
        tone(label),
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  )
}
