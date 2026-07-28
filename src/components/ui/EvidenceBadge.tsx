import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  className?: string
}

/** 21st: serafimcloud/badge-delta — evidence strength as delta-style chip */
export function EvidenceBadge({ label, className }: Props) {
  const l = label.toLowerCase()
  const Icon = l.includes('established')
    ? TrendingUp
    : l.includes('gap')
      ? TrendingDown
      : Minus
  const color = l.includes('established')
    ? 'bg-ok/15 text-ok'
    : l.includes('gap')
      ? 'bg-danger/15 text-danger'
      : 'bg-warn/15 text-warn'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        color,
        className,
      )}
      title="Evidence strength"
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  )
}
