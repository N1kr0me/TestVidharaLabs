import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { BandProgressTable } from '@/components/BandProgressTable'
import { DecisionCell } from '@/components/DecisionCell'
import { GlowCard } from '@/components/ui/GlowCard'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/lamp-tooltip'
import {
  COMPLIANCE_MARKETS,
  type ComplianceMarket,
  type DistrictInsight,
} from '@/lib/productEngine'
import {
  layerHasAlert,
  type LayerTabId,
} from '@/lib/urgency'
import { varietyOptionsForDistrict } from '@/lib/districtVarieties'
import { getVariety } from '@/lib/varieties'
import { cn } from '@/lib/utils'

type Props = {
  insight: DistrictInsight
  selected?: boolean
  onSelect?: () => void
  onMarketChange?: (market: ComplianceMarket) => void
  onVarietyChange?: (varietyId: string) => void
  className?: string
  /** Denser layout for V5 2×3 grid cells. */
  compact?: boolean
}

const TABS: { id: LayerTabId; label: string; hover: string }[] = [
  { id: 1, label: 'Disease', hover: 'Plant Disease Potential' },
  { id: 2, label: 'Quality', hover: 'Quality' },
  { id: 3, label: 'Compliance', hover: 'Contamination Potential and Compliance' },
  { id: 4, label: 'Yield', hover: 'Yield' },
  { id: 5, label: 'Vs Avg', hover: 'Crop Yield vs 5 year avg' },
]

/**
 * One continuous lighting map for the open tab + layer panel polygon.
 * Bottom fade only — top sheen is a shared overlay on tab and panel (see TOP_SHEEN).
 */
const SURFACE_SHADE =
  'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) calc(100% - 36px), rgba(0,0,0,0.12) calc(100% - 16px), rgba(0,0,0,0.28) 100%)'

/** Identical top sheen for open tabs and the layer panel so the join matches. */
const TOP_SHEEN =
  'pointer-events-none absolute inset-x-0 top-0 z-[5] h-2.5 bg-gradient-to-b from-white/20 to-transparent dark:from-white/12'

/**
 * District card — L1–L5 tabbed panel + Layer 6 decision strip.
 */
export function DistrictBentoCard({
  insight,
  selected,
  onSelect,
  onMarketChange,
  onVarietyChange,
  className,
  compact = false,
}: Props) {
  const [active, setActive] = useState<LayerTabId>(1)
  const panelRef = useRef<HTMLDivElement>(null)
  const tabBtnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [shade, setShade] = useState({ height: 0, offsetY: 0 })

  const measureShade = useCallback(() => {
    const panel = panelRef.current
    const idx = TABS.findIndex((t) => t.id === active)
    const tab = tabBtnRefs.current[idx]
    if (!panel || !tab) return
    const pr = panel.getBoundingClientRect()
    const tr = tab.getBoundingClientRect()
    setShade({
      height: pr.height,
      offsetY: tr.top - pr.top,
    })
  }, [active])

  useLayoutEffect(() => {
    measureShade()
    const panel = panelRef.current
    if (!panel || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => measureShade())
    ro.observe(panel)
    window.addEventListener('resize', measureShade)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measureShade)
    }
  }, [measureShade])

  const p = insight.prediction
  const variety = getVariety(p.varietyId)
  const varietyOptions = varietyOptionsForDistrict(p.district.id)
  const l6 = insight.layer6
  const openShadeStyle =
    shade.height > 0
      ? {
          backgroundImage: SURFACE_SHADE,
          backgroundSize: `100% ${shade.height}px`,
          backgroundRepeat: 'no-repeat' as const,
        }
      : null
  const l6ReasonLines = l6.decision.reasoning
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return (
    <GlowCard
      id={`district-card-${p.district.id}`}
      edge="solid"
      className={cn(
        'mx-auto flex w-full max-w-full flex-col scroll-mt-28 transition-[box-shadow] duration-200',
        // No frame padding — glow is off, so border should sit flush on the body
        '!p-0',
        selected
          ? // Chosen: teal glow (light) / lavender glow (dark) — matches navbar buttons
            [
              'shadow-[0_0_22px_8px_color-mix(in_oklab,var(--teal)_35%,transparent),0_0_8px_2px_color-mix(in_oklab,var(--teal)_55%,transparent),inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_1.5px_0_rgba(255,255,255,0.28),inset_0_-2px_6px_rgba(0,0,0,0.12)]',
              'dark:shadow-[0_0_24px_9px_color-mix(in_oklab,var(--lavender)_35%,transparent),0_0_8px_2px_color-mix(in_oklab,var(--lavender)_55%,transparent),inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_1.5px_0_rgba(255,255,255,0.28),inset_0_-2px_6px_rgba(0,0,0,0.12)]',
            ]
          : 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_1.5px_0_rgba(255,255,255,0.28),inset_0_-2px_6px_rgba(0,0,0,0.12)]',
        className,
      )}
      padding="none"
      bodyClassName={cn(
        'flex min-h-0 flex-1 flex-col overflow-visible border-0 shadow-none',
        'rounded-[inherit] bg-[#e9e3da] dark:bg-[#2d2d2d]',
        compact ? 'p-1.5' : 'p-2',
      )}
    >
      <div className="relative mb-1.5 shrink-0">
        {onVarietyChange ? (
          <div className="absolute top-0 right-0 z-10 max-w-[46%]">
            <label className="sr-only" htmlFor={`variety-${p.district.id}`}>
              Chilli variety
            </label>
            <select
              id={`variety-${p.district.id}`}
              aria-label={`${p.district.name} chilli variety`}
              value={p.varietyId}
              disabled={varietyOptions.length <= 1}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onVarietyChange(e.target.value)}
              className="themed-select w-full truncate rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-black disabled:opacity-80 dark:bg-black dark:text-white"
            >
              {varietyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onSelect}
          className="mx-auto block w-full text-center outline-none"
        >
          <h3
            className={cn(
              'font-serif font-semibold leading-tight text-ink',
              compact ? 'text-lg' : 'text-xl',
            )}
          >
            {p.district.name}
          </h3>
          <p className="text-[10px] text-black dark:text-white">
            {p.district.state}
            {p.district.cluster ? ` · ${p.district.cluster}` : ''}
            {' · '}
            {variety.name}
            {' · '}
            {insight.company.shortLabel}
          </p>
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[4.75rem_minmax(0,1fr)] items-stretch gap-0 sm:grid-cols-[5.75rem_minmax(0,1fr)]">
        {/* OriginUI file-tabs, adapted to a vertical stack; panel opens to the right */}
        <TooltipProvider delayDuration={120}>
          <div
            className="relative z-10 flex h-full min-h-0 w-full flex-col gap-1 self-stretch overflow-visible"
            role="tablist"
            aria-label={`${p.district.name} layers`}
          >
            {TABS.map((tab, tabIndex) => {
              const alert = layerHasAlert(insight, tab.id)
              const isActive = active === tab.id
              return (
                <div key={tab.id} className="flex min-h-0 flex-1 overflow-visible">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={tab.hover}
                        ref={(el) => {
                          tabBtnRefs.current[tabIndex] = el
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActive(tab.id)
                        }}
                        style={{
                          width: 'calc(100% + 2px)',
                          flexShrink: 0,
                          ...(isActive && openShadeStyle
                            ? {
                                ...openShadeStyle,
                                backgroundPosition: `0px ${-shade.offsetY}px`,
                              }
                            : null),
                        }}
                        className={cn(
                          'relative flex h-full items-center justify-center overflow-visible',
                          'rounded-l-lg rounded-r-none px-1.5 text-center',
                          'text-[10px] font-bold leading-none whitespace-nowrap text-black',
                          'dark:text-white',
                          // Same inset shadow on every tab (open + closed) — matches Vs Avg
                          'shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.18)]',
                          'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-2px_5px_rgba(0,0,0,0.35)]',
                          // Spill 2px into the panel so tab edge matches district-card border width.
                          isActive
                            ? [
                                'z-20',
                                'border-2 border-black !border-r-0 dark:border-white/40',
                                'bg-[#fdfcfa] dark:bg-[#25251d]',
                              ]
                            : [
                                'z-10',
                                'border-2 border-black dark:border-white/40',
                                'bg-[linear-gradient(180deg,#d4c6b0_0%,#cabca6_50%,#b9aa93_100%)]',
                                'dark:bg-[linear-gradient(180deg,#525252_0%,#474747_50%,#3c3c3c_100%)]',
                              ],
                        )}
                      >
                        {/* Same local top sheen on every tab (open or closed), matching Disease */}
                        <span aria-hidden className={TOP_SHEEN} />
                        {alert ? (
                          <span
                            className="alert-edge-glow absolute inset-0 rounded-l-lg rounded-r-none [clip-path:inset(0_2px_0_0)]"
                            aria-hidden
                          />
                        ) : null}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[14rem]">
                      <p className="text-center text-[11px] font-medium text-ink">
                        {tab.hover}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )
            })}
          </div>
        </TooltipProvider>

        <div
          ref={panelRef}
          role="tabpanel"
          style={
            openShadeStyle
              ? {
                  ...openShadeStyle,
                  backgroundPosition: '0px 0px',
                }
              : undefined
          }
          className={cn(
            'relative z-0 min-h-[13rem] overflow-visible rounded-l-none rounded-r-lg border-2 border-black p-2',
            'dark:border-white/40',
            // Flat base + SURFACE_SHADE map (same as open tab). No inset box-shadow.
            'bg-[#fdfcfa] dark:bg-[#25251d]',
          )}
        >
          {/* Same TOP_SHEEN as the Disease/open tab so the join lighting matches */}
          <span aria-hidden className={cn(TOP_SHEEN, 'rounded-tr-lg')} />
          <div className="relative z-[2] h-full min-h-0">
            <LayerPanel
              active={active}
              insight={insight}
              onMarketChange={onMarketChange}
            />
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={80}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'relative mt-1.5 shrink-0 cursor-help rounded-2xl px-2.5 py-2 outline-none',
                l6.decision.tone === 'danger'
                  ? 'overflow-visible'
                  : 'overflow-hidden',
                'solid-panel solid-panel-l6',
              )}
            >
              {/* Depth / sheen from .solid-panel (matches navbar buttons) */}
              <p
                className={cn(
                  'relative z-10 text-center text-[12px] font-bold uppercase tracking-wider',
                  'text-[#fffef8] dark:text-[#0a0a0a]',
                )}
              >
                Decision
              </p>
              <p
                className={cn(
                  'relative z-10 mt-0.5 text-center font-serif text-base font-semibold leading-snug',
                  'text-[#fffef8] dark:text-[#0a0a0a]',
                )}
              >
                {l6.decision.label}
              </p>
              <p
                className={cn(
                  'relative z-10 mt-0.5 break-words text-left text-xs leading-snug [overflow-wrap:anywhere]',
                  'text-[#fffef8]/90 dark:text-[#0a0a0a]/90',
                )}
              >
                {l6.decision.action}
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[18rem]">
            <p className="text-center text-[13px] font-bold uppercase tracking-wider text-black dark:text-white">
              Reasoning
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink">
              {l6ReasonLines.join(' ')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </GlowCard>
  )
}

function LayerPanel({
  active,
  insight,
  onMarketChange,
}: {
  active: LayerTabId
  insight: DistrictInsight
  onMarketChange?: (market: ComplianceMarket) => void
}) {
  const p = insight.prediction
  const l1 = insight.layer1
  const l2 = insight.layer2
  const l3 = insight.layer3
  const l4 = insight.layer4
  const l5 = insight.layer5

  if (active === 1) {
    return (
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-stretch gap-1.5">
        <DecisionCell
          title="Plant disease potential"
          decision={l1.plantDisease}
          density="decision"
          className="h-full"
        />
        <BandProgressTable
          kind="risk"
          rows={[
            { name: 'Bacterial', decision: l1.bacterial, value: p.wiltEsi },
            { name: 'Viral', decision: l1.viral, value: p.leafCurlEsi },
            { name: 'Fungal', decision: l1.fungal, value: p.anthracnoseEsi },
          ]}
        />
      </div>
    )
  }

  if (active === 2) {
    return (
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-stretch gap-1.5">
        <DecisionCell
          title="Quality"
          decision={l2.quality}
          density="decision"
          className="h-full"
        />
        <BandProgressTable
          kind="quality"
          rows={[
            { name: 'Moisture', decision: l2.moisture, value: p.moistureScore },
            {
              name: 'Capsaicin',
              decision: l2.capsaicin,
              value: p.capsaicinScore,
            },
            { name: 'ASTA', decision: l2.asta, value: p.astaScore },
          ]}
        />
      </div>
    )
  }

  if (active === 3) {
    return (
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-stretch gap-1.5">
        <div className="flex min-h-0 flex-col justify-start gap-1.5 self-start">
          <DecisionCell
            title="Contamination potential"
            decision={l3.contamination}
            density="decision"
            noScroll
            className="shrink-0"
          />
          <DecisionCell
            title="Compliance"
            decision={l3.compliance}
            density="decision"
            noScroll
            className="shrink-0"
            headerSlot={
              onMarketChange ? (
                <select
                  aria-label="Compliance market"
                  value={insight.market}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    onMarketChange(e.target.value as ComplianceMarket)
                  }
                  className="themed-select mx-auto max-w-[92%] rounded border border-border bg-white px-1 py-0 text-[10px] font-medium leading-tight text-black dark:bg-black dark:text-white"
                >
                  {COMPLIANCE_MARKETS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : undefined
            }
          />
        </div>
        <BandProgressTable
          kind="risk"
          className="min-h-0"
          rows={[
            {
              name: 'Aflatoxin',
              decision: l3.aflatoxin,
              value: p.aflatoxinEsi,
            },
            {
              name: 'Pesticide residue',
              decision: l3.pesticide,
              value: p.pesticideEsi,
            },
            {
              name: 'Heavy metal',
              decision: l3.heavyMetal,
              value: p.heavyMetalEsi,
            },
          ]}
        />
      </div>
    )
  }

  if (active === 4) {
    return (
      <DecisionCell
        title="Yield"
        decision={l4.yield}
        density="decision"
        className="min-h-full"
      />
    )
  }

  return (
    <DecisionCell
      title="Crop yield vs 5 year avg"
      decision={l5.yieldVsHistory}
      density="decision"
      className="min-h-full"
    />
  )
}
