import { useEffect } from 'react'
import { X } from 'lucide-react'
import { DistrictComparisonTable } from '@/components/DistrictComparisonTable'
import type { DistrictInsight } from '@/lib/productEngine'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  insights: DistrictInsight[]
  focusId: string
  onFocus: (id: string) => void
}

/** Compare matrix overlay — same shell pattern as EnvironmentTray. */
export function CompareTray({
  open,
  onClose,
  insights,
  focusId,
  onFocus,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[1050] bg-ink/35 backdrop-blur-[2px] transition-opacity duration-300',
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Districts decision table"
        aria-hidden={!open}
        className={cn(
          'fixed top-[3.75rem] left-1/2 z-[1060] w-[min(96vw,1200px)] -translate-x-1/2',
          'max-h-[min(82vh,calc(100dvh-4.5rem))] overflow-hidden rounded-b-2xl border border-t-0 border-border',
          'bg-surface shadow-xl transition-transform duration-300 ease-out',
          open
            ? 'pointer-events-auto translate-y-0'
            : 'pointer-events-none -translate-y-[110%]',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Table
            </p>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Decision matrix
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-border p-1.5 text-ink hover:bg-surface-2"
            aria-label="Close compare tray"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(78vh-3.5rem)] overflow-y-auto px-3 py-3">
          {insights.length > 0 ? (
            <DistrictComparisonTable
              insights={insights}
              focusId={focusId}
              onFocus={onFocus}
              className="[&>div:first-child]:hidden"
            />
          ) : (
            <p className="text-sm text-muted">Select districts to compare.</p>
          )}
        </div>
      </div>
    </>
  )
}
