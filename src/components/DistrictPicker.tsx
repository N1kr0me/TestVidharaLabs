import { districts, type District } from '@/data/districts'
import { GlowCard } from '@/components/ui/GlowCard'

type Props = {
  selected: District[]
  max: number
  onChange: (next: District[]) => void
  title?: string
}

function grouped() {
  return districts.reduce<Record<string, District[]>>((acc, d) => {
    ;(acc[d.state] ??= []).push(d)
    return acc
  }, {})
}

export function DistrictPicker({
  selected,
  max,
  onChange,
  title = 'Districts',
}: Props) {
  const byState = grouped()
  const selectedIds = new Set(selected.map((d) => d.id))

  function toggle(d: District) {
    if (selectedIds.has(d.id)) {
      onChange(selected.filter((x) => x.id !== d.id))
      return
    }
    if (max === 1) {
      onChange([d])
      return
    }
    if (selected.length >= max) return
    onChange([...selected, d])
  }

  return (
    <GlowCard className="h-full">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {title}
      </p>
      <p className="mt-1 text-xs text-muted">
        {max === 1
          ? 'Select one district (state-grouped).'
          : `Select up to ${max} districts to compare.`}
      </p>

      {max === 1 ? (
        <label className="mt-3 flex flex-col gap-1 text-xs text-muted">
          District
          <select
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-teal"
            value={selected[0]?.id ?? ''}
            onChange={(e) => {
              const d = districts.find((x) => x.id === e.target.value)
              if (d) onChange([d])
            }}
          >
            {Object.entries(byState).map(([state, list]) => (
              <optgroup key={state} label={state}>
                {list.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      ) : (
        <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">
          {Object.entries(byState).map(([state, list]) => (
            <div key={state}>
              <p className="text-[10px] font-semibold uppercase text-plum">
                {state}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {list.map((d) => {
                  const on = selectedIds.has(d.id)
                  const disabled = !on && selected.length >= max
                  return (
                    <button
                      key={d.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggle(d)}
                      className={
                        on
                          ? 'rounded-full bg-teal/20 px-2.5 py-1 text-xs font-semibold text-teal'
                          : 'rounded-full border border-border px-2.5 py-1 text-xs text-muted disabled:opacity-40'
                      }
                    >
                      {d.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {selected.map((d) => (
            <div key={d.id} className="rounded-lg bg-bg px-3 py-2">
              <p className="font-semibold text-ink">{d.name}</p>
              <p className="text-[10px] text-muted">
                {d.state}
                {d.cluster ? ` · ${d.cluster}` : ''}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </GlowCard>
  )
}
