import { useEffect, useMemo, useState } from 'react'
import { DistrictComparisonTable } from '@/components/DistrictComparisonTable'
import { DistrictBentoCard } from '@/components/DistrictBentoCard'
import { DistrictPicker } from '@/components/DistrictPicker'
import { StageVarietyCard } from '@/components/StageVarietyCard'
import { GlowCard } from '@/components/ui/GlowCard'
import { districts, type District } from '@/data/districts'
import type { CompanyId } from '@/lib/companies'
import { type GrowthStage } from '@/lib/features'
import {
  buildDistrictInsight,
  predictForDistrict,
  type ComplianceMarket,
  type ProductPrediction,
} from '@/lib/productEngine'
import type { UserRoleId } from '@/lib/roles'
import {
  districtsNeedingAttention,
} from '@/lib/urgency'
import { DEFAULT_VARIETY_ID } from '@/lib/varieties'

export type DistrictSelectionStatus = {
  selectedNames: string[]
  alertNames: string[]
}

type Props = {
  role: UserRoleId
  company: CompanyId
  maxSelect?: 2 | 5
  onFocusPrediction?: (p: ProductPrediction | null) => void
  onStageChange?: (stage: GrowthStage) => void
  onSelectionStatus?: (status: DistrictSelectionStatus) => void
}

export function CompareDistrictsView({
  role,
  company,
  maxSelect = 5,
  onFocusPrediction,
  onStageChange,
  onSelectionStatus,
}: Props) {
  const [selected, setSelected] = useState<District[]>(() =>
    districts.slice(0, Math.min(3, maxSelect)),
  )
  const [focusId, setFocusId] = useState(districts[0].id)
  const [stage, setStage] = useState<GrowthStage>('Fruit development')
  const [varietyId, setVarietyId] = useState(DEFAULT_VARIETY_ID)
  const [market, setMarket] = useState<ComplianceMarket>('India')
  const [preds, setPreds] = useState<ProductPrediction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onStageChange?.(stage)
  }, [stage, onStageChange])

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
          selected.map((d) => predictForDistrict(d, stage, true, varietyId)),
        )
        if (!cancelled) setPreds(next)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selected, stage, varietyId])

  const insights = useMemo(
    () => preds.map((p) => buildDistrictInsight(p, company, role, market)),
    [preds, company, role, market],
  )

  const focus =
    insights.find((i) => i.prediction.district.id === focusId) ?? insights[0]

  useEffect(() => {
    onFocusPrediction?.(focus?.prediction ?? null)
  }, [focus, onFocusPrediction])

  useEffect(() => {
    onSelectionStatus?.({
      selectedNames: selected.map((d) => d.name),
      alertNames: districtsNeedingAttention(insights),
    })
  }, [selected, insights, onSelectionStatus])

  return (
    <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
      <li id="section-location" className="scroll-mt-24 md:col-span-7">
        <DistrictPicker
          selected={selected}
          max={maxSelect}
          onChange={setSelected}
          title="Compare districts · V3"
        />
      </li>
      <li className="md:col-span-5">
        <StageVarietyCard
          className="h-full"
          stage={stage}
          onStageChange={setStage}
          varietyId={varietyId}
          onVarietyChange={setVarietyId}
        />
      </li>

      {insights.length > 0 ? (
        <li id="section-compare" className="scroll-mt-24 md:col-span-12">
          <GlowCard padding="lg">
            <DistrictComparisonTable
              insights={insights}
              focusId={focusId}
              onFocus={setFocusId}
            />
          </GlowCard>
        </li>
      ) : null}

      <li id="section-predictions" className="scroll-mt-24 md:col-span-12">
        {loading && insights.length === 0 ? (
          <p className="text-sm text-muted">Loading live season signals…</p>
        ) : null}
        {/* Full-width stack — each card scales to keep proportions */}
        <div className="flex w-full flex-col items-stretch gap-3">
          {insights.map((ins) => (
            <DistrictBentoCard
              key={ins.prediction.district.id}
              insight={ins}
              selected={ins.prediction.district.id === focusId}
              onSelect={() => setFocusId(ins.prediction.district.id)}
              onMarketChange={setMarket}
              className="w-full"
            />
          ))}
        </div>
      </li>
    </ul>
  )
}
