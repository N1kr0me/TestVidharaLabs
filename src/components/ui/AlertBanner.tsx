import type { ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
}

/** 21st: mdafsarx/banner — full-width alert under header */
export function AlertBanner({ children, className }: Props) {
  const [open, setOpen] = useState(true)
  if (!open) return null

  return (
    <div
      role="status"
      className={cn(
        'banner-rainbow relative w-full border-x-0 border-y border-border',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-start gap-3 px-5 py-2.5">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-warn"
          aria-hidden
        />
        <p className="flex-1 text-center text-xs leading-relaxed text-ink sm:text-left">
          {children}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-ink"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
