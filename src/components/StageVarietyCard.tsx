import { ChevronDown } from 'lucide-react'
import { GlowCard } from '@/components/ui/GlowCard'
import { GROWTH_STAGES, type GrowthStage } from '@/lib/features'
import { CHILLI_VARIETIES } from '@/lib/varieties'
import { cn } from '@/lib/utils'

type Props = {
  stage: GrowthStage
  onStageChange: (stage: GrowthStage) => void
  varietyId: string
  onVarietyChange: (id: string) => void
  className?: string
}

/** Growth stage + chilli variety (phenology used in engine; DAP/DAT/GDD not shown yet). */
export function StageVarietyCard({
  stage,
  onStageChange,
  varietyId,
  onVarietyChange,
  className,
}: Props) {
  const variety = CHILLI_VARIETIES.find((v) => v.id === varietyId)

  return (
    <GlowCard className={className} padding="md">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        Crop window
      </p>
      <h3 className="mt-0.5 font-serif text-lg text-ink">Stage & variety</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field
          id="growth-stage"
          label="Growth stage"
          value={stage}
          onChange={(v) => onStageChange(v as GrowthStage)}
          options={GROWTH_STAGES.map((s) => ({ value: s, label: s }))}
        />
        <Field
          id="chilli-variety"
          label="Chilli variety"
          value={varietyId}
          onChange={onVarietyChange}
          options={CHILLI_VARIETIES.map((v) => ({
            value: v.id,
            label: v.name,
          }))}
        />
      </div>

      {variety ? (
        <p className="mt-2 text-xs text-muted">{variety.originHint}</p>
      ) : null}
    </GlowCard>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-wider text-muted"
      >
        {label}
      </label>
      <div className="relative mt-1.5">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-lg border border-border bg-bg px-3 py-2.5 pr-10',
            'text-sm font-medium text-ink outline-none',
            'focus:border-teal focus:ring-2 focus:ring-[var(--ring)]',
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
    </div>
  )
}
