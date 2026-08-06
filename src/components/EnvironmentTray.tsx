import { useEffect } from 'react'
import { X } from 'lucide-react'
import { FeaturesTable } from '@/components/ui/FeaturesTable'
import { buildFeatureRows, type GrowthStage } from '@/lib/features'
import type { ProductPrediction } from '@/lib/productEngine'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  /** Predictions for currently selected districts (2–4). */
  predictions: ProductPrediction[]
  selectedId: string
  onSelectDistrict: (id: string) => void
  stage: GrowthStage
}

/** Compact top-anchored environment tray under the navbar. */
export function EnvironmentTray({
  open,
  onClose,
  predictions,
  selectedId,
  onSelectDistrict,
  stage,
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

  const prediction =
    predictions.find((p) => p.district.id === selectedId) ??
    predictions[0] ??
    null

  const rows = prediction
    ? buildFeatureRows(prediction.features, stage)
    : []

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
        aria-label="Environmental features"
        aria-hidden={!open}
        className={cn(
          'fixed top-[3.75rem] left-1/2 z-[1060] w-[min(96vw,36rem)] -translate-x-1/2',
          'max-h-[min(70vh,calc(100dvh-4.5rem))] overflow-hidden rounded-b-2xl border border-t-0 border-border',
          'bg-surface shadow-xl transition-transform duration-300 ease-out',
          open
            ? 'pointer-events-auto translate-y-0'
            : 'pointer-events-none -translate-y-[110%]',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-plum">
              Environment
            </p>
            {predictions.length > 0 ? (
              <label className="mt-0.5 flex min-w-0 flex-col gap-0.5">
                <span className="sr-only">District</span>
                <select
                  aria-label="Selected district"
                  value={prediction?.district.id ?? ''}
                  onChange={(e) => onSelectDistrict(e.target.value)}
                  className="themed-select max-w-full truncate rounded-md border border-border bg-surface px-2 py-1 font-serif text-base text-ink"
                >
                  {predictions.map((p) => (
                    <option key={p.district.id} value={p.district.id}>
                      {p.district.name}
                      {p.district.state ? ` · ${p.district.state}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <h2 className="truncate font-serif text-base text-ink">
                Select a district
              </h2>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-border p-1.5 text-ink hover:bg-surface-2"
            aria-label="Close environment tray"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(62vh-3.25rem)] overflow-y-auto px-3 py-2.5">
          {prediction ? (
            <FeaturesTable
              bare
              rows={rows}
              caption={`${prediction.features.source} · ${new Date(prediction.features.fetchedAt).toLocaleString()}`}
            />
          ) : (
            <p className="text-sm text-muted">No environmental payload yet.</p>
          )}
        </div>
      </div>
    </>
  )
}
