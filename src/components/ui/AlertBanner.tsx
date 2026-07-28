import type { ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
}

/** 21st: mdafsarx/banner — rainbow/gradient alert adapted to logo accents */
export function AlertBanner({ children, className }: Props) {
  const [open, setOpen] = useState(true)
  if (!open) return null

  return (
    <div
      role="status"
      className={cn(
        'banner-rainbow relative mx-auto max-w-[1400px] px-5 py-2.5',
        'flex items-start gap-3 rounded-none border-x-0 sm:mx-5 sm:mt-3 sm:rounded-xl sm:border-x',
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
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
  )
}
