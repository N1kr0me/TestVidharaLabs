import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowCard } from './GlowCard'

type Option = string

type Props = {
  id: string
  label: string
  value: string
  options: readonly Option[]
  onChange: (value: string) => void
  hint?: ReactNode
  className?: string
}

/** Select chrome inside glowing-effect card */
export function StageSelect({
  id,
  label,
  value,
  options,
  onChange,
  hint,
  className,
}: Props) {
  return (
    <GlowCard className={className}>
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-wider text-muted"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-lg border border-border bg-bg px-3 py-2.5 pr-10',
            'text-sm font-medium text-ink outline-none transition',
            'focus:border-teal focus:ring-2 focus:ring-[var(--ring)]',
          )}
        >
          {options.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
      {hint ? <div className="mt-2 text-sm text-muted">{hint}</div> : null}
    </GlowCard>
  )
}
