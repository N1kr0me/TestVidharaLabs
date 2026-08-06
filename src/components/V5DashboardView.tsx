import { useEffect, useMemo, useState } from 'react'
import { DistrictBentoCard } from '@/components/DistrictBentoCard'
import { V5FilterBar } from '@/components/V5FilterBar'
import { V5Sidebar } from '@/components/V5Sidebar'
import { districts, type District } from '@/data/districts'
import type { CompanyId } from '@/lib/companies'
import { inferCropSeason, type CropSeason } from '@/lib/cropSeason'
import {
  defaultVarietyForDistrict,
  resolveDistrictVariety,
} from '@/lib/districtVarieties'
import { type GrowthStage } from '@/lib/features'
import {
  buildDistrictInsight,
  predictForDistrict,
  type ComplianceMarket,
  type DistrictInsight,
  type ProductPrediction,
} from '@/lib/productEngine'
import type { UserRoleId } from '@/lib/roles'

const MIN_SELECT = 2
const MAX_SELECT = 4
const GRID_SLOTS = 4

type Props = {
  role: UserRoleId
  company: CompanyId
  onRoleChange: (id: UserRoleId) => void
  onCompanyChange: (id: CompanyId) => void
  focusId: string
  onFocusIdChange: (id: string) => void
  onInsightsChange: (insights: DistrictInsight[]) => void
  onFocusPrediction?: (p: ProductPrediction | null) => void
  onStageChange?: (stage: GrowthStage) => void
}

function initialVarietyMap(list: District[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const d of list) map[d.id] = defaultVarietyForDistrict(d.id)
  return map
}

/** V5 wireframe dashboard — 2×2 card grid + sidebar. */
export function V5DashboardView({
  role,
  company,
  onRoleChange,
  onCompanyChange,
  focusId,
  onFocusIdChange,
  onInsightsChange,
  onFocusPrediction,
  onStageChange,
}: Props) {
  const [selected, setSelected] = useState<District[]>(() =>
    districts.slice(0, Math.min(MAX_SELECT, districts.length)),
  )
  const [stage, setStage] = useState<GrowthStage>('Fruit development')
  const [varietyByDistrict, setVarietyByDistrict] = useState<
    Record<string, string>
  >(() => initialVarietyMap(districts.slice(0, MAX_SELECT)))
  const [cropSeason, setCropSeason] = useState<CropSeason>(() =>
    inferCropSeason(),
  )
  const [market, setMarket] = useState<ComplianceMarket>('India')
  const [preds, setPreds] = useState<ProductPrediction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onStageChange?.(stage)
  }, [stage, onStageChange])

  useEffect(() => {
    if (selected.length === 0) return
    if (!selected.some((d) => d.id === focusId)) {
      onFocusIdChange(selected[0].id)
    }
  }, [selected, focusId, onFocusIdChange])

  // Keep variety map in sync when selection changes
  useEffect(() => {
    setVarietyByDistrict((prev) => {
      const next = { ...prev }
      for (const d of selected) {
        next[d.id] = resolveDistrictVariety(d.id, prev[d.id])
      }
      return next
    })
  }, [selected])

  const varietyKey = selected
    .map((d) => `${d.id}:${varietyByDistrict[d.id] ?? ''}`)
    .join('|')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const next = await Promise.all(
          selected.map((d) =>
            predictForDistrict(
              d,
              stage,
              true,
              resolveDistrictVariety(d.id, varietyByDistrict[d.id]),
            ),
          ),
        )
        if (!cancelled) setPreds(next)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // varietyKey encodes per-district variety choices
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, stage, varietyKey])

  const insights = useMemo(
    () => preds.map((p) => buildDistrictInsight(p, company, role, market)),
    [preds, company, role, market],
  )

  useEffect(() => {
    onInsightsChange(insights)
  }, [insights, onInsightsChange])

  const focus =
    insights.find((i) => i.prediction.district.id === focusId) ?? insights[0]

  useEffect(() => {
    onFocusPrediction?.(focus?.prediction ?? null)
  }, [focus, onFocusPrediction])

  const emptySlots = Math.max(0, GRID_SLOTS - insights.length)

  function onVarietyChange(districtId: string, varietyId: string) {
    setVarietyByDistrict((prev) => ({
      ...prev,
      [districtId]: resolveDistrictVariety(districtId, varietyId),
    }))
  }

  return (
    <>
      <V5FilterBar
        company={company}
        onCompanyChange={onCompanyChange}
        role={role}
        onRoleChange={onRoleChange}
        selected={selected}
        minSelect={MIN_SELECT}
        maxSelect={MAX_SELECT}
        onSelectedChange={setSelected}
        stage={stage}
        onStageChange={setStage}
        cropSeason={cropSeason}
        onCropSeasonChange={setCropSeason}
        insights={insights}
      />

      {/* Full-bleed horizontal accent — end to end */}
      <div className="h-0.5 w-full bg-teal dark:bg-lavender" aria-hidden />

      {/* Content + vertical accent (T-stem meets the horizontal above).
          Phone: same blocks stacked (cards → ranking). Desktop: side-by-side. */}
      <div className="flex w-full flex-1 flex-col lg:flex-row">
        {/* District stage — white (light) / black (dark) */}
        <div className="min-w-0 flex-1 bg-bg px-3 py-3 sm:px-5 lg:pr-3">
          <div className="mx-auto max-w-[1600px] lg:ml-auto lg:mr-0">
            {loading && insights.length === 0 ? (
              <p className="text-sm text-muted">Loading live season signals…</p>
            ) : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-rows-2 sm:gap-2">
              {insights.map((ins) => {
                const id = ins.prediction.district.id
                return (
                  <DistrictBentoCard
                    key={id}
                    insight={ins}
                    selected={id === focusId}
                    onSelect={() => onFocusIdChange(id)}
                    onMarketChange={setMarket}
                    onVarietyChange={(vid) => onVarietyChange(id, vid)}
                    compact
                    className="h-full min-h-[22rem] sm:min-h-[26rem]"
                  />
                )
              })}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="hidden min-h-[26rem] rounded-lg border border-dashed border-border/50 bg-chrome/40 sm:block dark:bg-chrome/60"
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="hidden w-0.5 shrink-0 bg-teal dark:bg-lavender lg:block"
          aria-hidden
        />
        {/* Phone: horizontal rule where the desktop T-stem would be */}
        <div
          className="h-0.5 w-full bg-teal lg:hidden dark:bg-lavender"
          aria-hidden
        />

        {/* Ranking / final decision — below cards on phone, right rail on lg+ */}
        <div className="bg-chrome px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 lg:w-[18rem] lg:min-w-[18rem] lg:shrink-0 lg:px-3 lg:pb-3">
          <V5Sidebar
            insights={insights}
            focusId={focusId}
            onFocus={onFocusIdChange}
            className="lg:sticky lg:top-[8.5rem] lg:self-start"
          />
        </div>
      </div>
    </>
  )
}
