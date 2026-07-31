import { useEffect, useMemo, useState } from 'react'
import { DistrictPicker } from '@/components/DistrictPicker'
import { IntelligenceLayers } from '@/components/IntelligenceLayers'
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

type Props = { role: UserRoleId }

/** V1 — single district (no Top 5 chrome emphasis, still ranked in pool quietly). */
export function SingleDistrictView({ role }: Props) {
  const [selected, setSelected] = useState<District[]>([districts[0]])
  const [stage, setStage] = useState<GrowthStage>('Fruit development')
  const [prediction, setPrediction] = useState<ProductPrediction | null>(null)
  const [loading, setLoading] = useState(false)

  const district = selected[0] ?? districts[0]

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const p = await predictForDistrict(district, stage, true)
        if (!cancelled) setPrediction(p)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [district, stage])

  const ranked = useMemo(() => {
    const live = new Map<string, ProductPrediction>()
    if (prediction) live.set(prediction.district.id, prediction)
    return rankAllDistricts(stage, live)
  }, [stage, prediction])

  return (
    <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
      <li id="section-location" className="scroll-mt-24 md:col-span-8">
        <DistrictPicker
          selected={selected}
          max={1}
          onChange={setSelected}
          title="Selected location · V1 Single"
        />
      </li>
      <li className="md:col-span-4">
        <StageSelect
          className="h-full"
          id="growth-stage-v1"
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
      <li id="section-predictions" className="scroll-mt-24 md:col-span-12">
        {prediction ? (
          <IntelligenceLayers
            role={role}
            prediction={prediction}
            ranked={ranked}
            loading={loading}
            showRanks={false}
          />
        ) : (
          <p className="text-sm text-muted">Loading…</p>
        )}
      </li>
    </ul>
  )
}
