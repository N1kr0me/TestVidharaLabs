import * as React from 'react'
import { RiCheckLine, RiCloseLine, RiSparkling2Line } from '@remixicon/react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DistrictInsight } from '@/lib/productEngine'
import { isUrgentBandLabel } from '@/lib/urgency'
import { cn } from '@/lib/utils'

type CellValue = boolean | string

type Feature = {
  label: string
  values: CellValue[]
}

type FeatureGroup = {
  section: string
  features: Feature[]
}

type Props = {
  insights: DistrictInsight[]
  focusId: string
  onFocus: (id: string) => void
  className?: string
}

function Cell({
  value,
  highlighted,
}: {
  value: CellValue
  highlighted: boolean
}) {
  if (typeof value === 'boolean') {
    return value ? (
      <span
        className={cn(
          'mx-auto flex size-5 items-center justify-center rounded-sm',
          highlighted ? 'bg-teal' : 'bg-ink/80',
        )}
      >
        <RiCheckLine
          className={cn(
            'size-3.5',
            highlighted ? 'text-white' : 'text-bg',
          )}
          aria-hidden
        />
        <span className="sr-only">Yes</span>
      </span>
    ) : (
      <span className="mx-auto flex size-5 items-center justify-center rounded-sm bg-surface-2">
        <RiCloseLine className="size-3.5 text-muted" aria-hidden />
        <span className="sr-only">No</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'relative z-10 text-sm font-medium',
        highlighted ? 'text-ink' : 'text-muted',
      )}
    >
      {value}
    </span>
  )
}

/**
 * Compact district comparison — adapted from comparison-3.
 * Columns = districts; rows = decision labels (low verbosity).
 */
export function DistrictComparisonTable({
  insights,
  focusId,
  onFocus,
  className,
}: Props) {
  if (insights.length === 0) return null

  const groups: FeatureGroup[] = [
    {
      section: 'Layer 1 — Plant disease',
      features: [
        {
          label: 'Disease potential',
          values: insights.map((i) => i.layer1.plantDisease.label),
        },
        {
          label: 'Fungal',
          values: insights.map((i) => i.layer1.fungal.label),
        },
        {
          label: 'Bacterial',
          values: insights.map((i) => i.layer1.bacterial.label),
        },
        {
          label: 'Viral',
          values: insights.map((i) => i.layer1.viral.label),
        },
      ],
    },
    {
      section: 'Layer 2 — Quality',
      features: [
        {
          label: 'Quality',
          values: insights.map((i) => i.layer2.quality.label),
        },
        {
          label: 'Moisture',
          values: insights.map((i) => i.layer2.moisture.label),
        },
        {
          label: 'Capsaicin',
          values: insights.map((i) => i.layer2.capsaicin.label),
        },
        {
          label: 'ASTA',
          values: insights.map((i) => i.layer2.asta.label),
        },
      ],
    },
    {
      section: 'Layer 3 — Contamination',
      features: [
        {
          label: 'Contamination',
          values: insights.map((i) => i.layer3.contamination.label),
        },
        {
          label: 'Aflatoxin',
          values: insights.map((i) => i.layer3.aflatoxin.label),
        },
        {
          label: 'Pesticide',
          values: insights.map((i) => i.layer3.pesticide.label),
        },
        {
          label: 'Heavy metal',
          values: insights.map((i) => i.layer3.heavyMetal.label),
        },
        {
          label: 'Compliance',
          values: insights.map((i) => i.layer3.compliance.label),
        },
      ],
    },
    {
      section: 'Layers 4–6',
      features: [
        {
          label: 'Yield (extractible)',
          values: insights.map((i) => i.layer4.yield.label),
        },
        {
          label: 'Yield vs 5-yr',
          values: insights.map((i) => i.layer5.yieldVsHistory.label),
        },
        {
          label: 'L6 decision',
          values: insights.map((i) => i.layer6.decision.label),
        },
      ],
    },
  ]

  const focusIndex = Math.max(
    0,
    insights.findIndex((i) => i.prediction.district.id === focusId),
  )

  return (
    <section className={cn('w-full text-ink', className)}>
      <div className="mb-4 max-w-2xl">
        <Badge variant="outline" className="mb-3 gap-1">
          <RiSparkling2Line className="size-3.5" />
          Compare districts
        </Badge>
        <h2 className="font-serif text-2xl text-ink sm:text-3xl">
          Decision matrix
        </h2>
        <p className="mt-2 text-sm text-muted">
          Compact labels only — open a district card below for full reasoning.
          Click a column header to focus.
        </p>
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-border">
        <Table className="min-w-[640px] table-fixed text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-20 w-[28%] border-b border-border bg-surface">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Decision
                </span>
              </TableHead>
              {insights.map((ins, i) => {
                const highlighted = i === focusIndex
                return (
                  <TableHead
                    key={ins.prediction.district.id}
                    className={cn(
                      'border-b border-border text-center',
                      highlighted ? 'bg-teal/10' : 'bg-surface',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onFocus(ins.prediction.district.id)}
                      className="flex w-full flex-col items-center gap-0.5 py-2 outline-none"
                    >
                      <span className="text-sm font-semibold text-ink">
                        {ins.prediction.district.name}
                      </span>
                      <span className="text-[10px] font-normal text-muted">
                        {ins.prediction.district.state}
                      </span>
                    </button>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {groups.map((group) => (
              <React.Fragment key={group.section}>
                <TableRow className="bg-surface-2/80 hover:bg-surface-2/80">
                  <TableCell
                    colSpan={insights.length + 1}
                    className="py-2 text-xs font-semibold uppercase tracking-wide text-ink"
                  >
                    {group.section}
                  </TableCell>
                </TableRow>
                {group.features.map((feature) => (
                  <TableRow key={`${group.section}-${feature.label}`}>
                    <TableCell className="sticky left-0 z-10 bg-surface py-2 font-medium text-ink">
                      {feature.label}
                    </TableCell>
                    {feature.values.map((value, i) => {
                      const urgent =
                        typeof value === 'string' &&
                        isUrgentBandLabel(value)
                      return (
                        <TableCell
                          key={`${feature.label}-${insights[i].prediction.district.id}`}
                          className={cn(
                            'relative overflow-hidden py-2 text-center',
                            i === focusIndex && !urgent && 'bg-teal/5',
                          )}
                        >
                          {urgent ? (
                            <span
                              className="alert-edge-glow absolute inset-0"
                              aria-hidden
                            />
                          ) : null}
                          <Cell
                            value={value}
                            highlighted={i === focusIndex}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
