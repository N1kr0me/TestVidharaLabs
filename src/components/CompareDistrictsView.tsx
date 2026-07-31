import { useEffect, useMemo, useState } from 'react'
import { DistrictCompareBenchmarks } from '@/components/DistrictCompareBenchmarks'
import { DistrictPicker } from '@/components/DistrictPicker'
import { IntelligenceLayers } from '@/components/IntelligenceLayers'
import { GlowCard } from '@/components/ui/GlowCard'
import { StageSelect } from '@/components/ui/StageSelect'
import { districts, type District } from '@/data/districts'
import {
  GROWTH_STAGES,
  estimateDap,
  type GrowthStage,
} from '@/lib/features'
import {
  predictForDistrict,
  rankAllDistricts,
  type ProductPrediction,
} from '@/lib/productEngine'
import type { UserRoleId } from '@/lib/roles'

type Props = {
  role: UserRoleId
  maxSelect: 2 | 5
  versionLabel: string
  initialCount?: number
}

export function CompareDistrictsView({
  role,
  maxSelect,
  versionLabel,
  initialCount = 2,
}: Props) {
  const [selected, setSelected] = useState<District[]>(() =>
    districts.slice(0, Math.min(initialCount, maxSelect)),
  )
  const [focusId, setFocusId] = useState(districts[0].id)
  const [stage, setStage] = useState<GrowthStage>('Fruit development')
  const [preds, setPreds] = useState<ProductPrediction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selected.length === 0) return
    if (!selected.some((d) => d.id === focusId)) setFocusId(selected[0].id)
  }, [selected, focusId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const next = await Promise.all(
          selected.map((d) => predictForDistrict(d, stage, true)),
        )
        if (!cancelled) setPreds(next)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selected, stage])

  const ranked = useMemo(() => {
    const live = new Map<string, ProductPrediction>()
    for (const p of preds) live.set(p.district.id, p)
    return rankAllDistricts(stage, live)
  }, [stage, preds])

  const focus = preds.find((p) => p.district.id === focusId) ?? preds[0]

  return (
    <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
      <li id="section-location" className="scroll-mt-24 md:col-span-8">
        <DistrictPicker
          selected={selected}
          max={maxSelect}
          onChange={setSelected}
          title={`Compare · ${versionLabel}`}
        />
      </li>
      <li className="md:col-span-4">
        <StageSelect
          className="h-full"
          id={`growth-stage-${maxSelect}`}
          label="Growth stage"
          value={stage}
          options={GROWTH_STAGES}
          onChange={(v) => setStage(v as GrowthStage)}
          hint={
            <>
              Estimated DAP:{' '}
              <span className="font-semibold text-ink">
                {estimateDap(stage)} days
              </span>
            </>
          }
        />
      </li>

      {preds.length > 0 ? (
        <li className="md:col-span-12">
          <GlowCard padding="lg">
            <DistrictCompareBenchmarks
              predictions={preds}
              focusId={focusId}
              onFocus={setFocusId}
            />
          </GlowCard>
        </li>
      ) : null}

      <li id="section-predictions" className="scroll-mt-24 md:col-span-12">
        {focus ? (
          <IntelligenceLayers
            role={role}
            prediction={focus}
            ranked={ranked}
            loading={loading}
            showRanks={false}
          />
        ) : (
          <p className="text-sm text-muted">Select districts to compare.</p>
        )}
      </li>
    </ul>
  )
}
