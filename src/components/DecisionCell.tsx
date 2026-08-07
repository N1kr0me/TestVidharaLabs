import type { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/lamp-tooltip'
import { cn } from '@/lib/utils'
import type { DecisionResult } from '@/lib/decisions'

/** Highlight urgent band words in hover reason lines. */
function ReasonLine({ text }: { text: string }) {
  const parts = text.split(/\b(Elevated|Below-normal|Below-average|Alert|Act|Monitor)\b/g)
  if (parts.length === 1) return <>{text}</>
  return (
    <>
      {parts.map((part, i) =>
        part === 'Elevated' ||
        part === 'Below-normal' ||
        part === 'Below-average' ||
        part === 'Alert' ||
        part === 'Act' ? (
          <span key={`${part}-${i}`} className="font-medium text-danger">
            {part}
          </span>
        ) : part === 'Monitor' ? (
          <span key={`${part}-${i}`} className="font-medium text-warn">
            {part}
          </span>
        ) : (
          <span key={`${part}-${i}`}>{part}</span>
        ),
      )}
    </>
  )
}

const SOLID_PANEL: Record<DecisionResult['tone'], string> = {
  ok: 'solid-panel solid-panel-ok',
  warn: 'solid-panel solid-panel-warn',
  danger: 'solid-panel solid-panel-danger',
  neutral: 'solid-panel solid-panel-neutral',
}

/** Title: pure light / pure dark for max contrast on solid fills. */
const SOLID_TITLE = 'text-white dark:text-black'
const SOLID_LABEL = 'text-[#fffef8] dark:text-[#0a0a0a]'
const SOLID_BODY = 'text-[#fffef8]/90 dark:text-[#0a0a0a]/90'
const NEUTRAL_TITLE = 'text-ink'
const NEUTRAL_BODY = 'text-ink/90'

export type TileSize = 'sm' | 'md' | 'lg'

export const TILE_LG_HEIGHT = '9.5rem'
export const TILE_LG_WIDTH = '11rem'

export const TILE_SIZE: Record<TileSize, string> = {
  sm: '5.75rem',
  md: '6.5rem',
  lg: TILE_LG_HEIGHT,
}

export const TILE_WIDTH: Record<TileSize, string> = {
  sm: TILE_SIZE.sm,
  md: TILE_SIZE.md,
  lg: TILE_LG_WIDTH,
}

export const TILE_GAP = '0.3rem'

type Props = {
  title: string
  decision: DecisionResult
  emphasis?: boolean
  className?: string
  headerSlot?: ReactNode
  density?: 'compact' | 'decision' | 'roomy'
  /** Never scroll inside the cell. */
  noScroll?: boolean
}

/**
 * Band tile — solid plastic panel; reasoning on right-side hover.
 * Same look language as Layer 6 / Final decision.
 */
export function DecisionCell({
  title,
  decision,
  emphasis = false,
  className,
  headerSlot,
  density = 'compact',
  noScroll = false,
}: Props) {
  const showDecision = density === 'decision' || density === 'roomy'
  const tone = decision.tone
  const reasonLines = decision.reasoning
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return (
    <TooltipProvider delayDuration={80}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative box-border flex h-full w-full min-h-0 min-w-0 cursor-help flex-col rounded-2xl px-1.5 py-1 text-left outline-none',
              tone === 'danger' ? 'overflow-visible' : 'overflow-hidden',
              SOLID_PANEL[tone],
              emphasis && 'col-span-2 row-span-2',
              className,
            )}
          >
            <p
              className={cn(
                'relative z-10 shrink-0 text-center text-[12px] font-bold uppercase tracking-wider',
                tone === 'neutral' ? NEUTRAL_TITLE : SOLID_TITLE,
              )}
            >
              {title}
            </p>
            {headerSlot ? (
              <div className="relative z-10 mx-auto w-full max-w-full shrink-0 text-center">
                {headerSlot}
              </div>
            ) : null}
            <div
              className={cn(
                'relative z-10 flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-0.5',
                noScroll ? 'overflow-hidden' : 'overflow-y-auto',
              )}
            >
              <p
                className={cn(
                  'shrink-0 text-center font-serif font-semibold leading-tight',
                  showDecision || emphasis ? 'text-[29px]' : 'text-[27px]',
                  tone === 'neutral' ? NEUTRAL_TITLE : SOLID_LABEL,
                )}
              >
                {decision.label}
              </p>
              {showDecision ? (
                <p
                  className={cn(
                    'w-full break-words text-left text-[11px] leading-snug [overflow-wrap:anywhere]',
                    tone === 'neutral' ? NEUTRAL_BODY : SOLID_BODY,
                  )}
                >
                  {decision.action}
                </p>
              ) : null}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[16rem]">
            <p className="text-center text-[13px] font-bold uppercase tracking-wider text-black dark:text-white">
              Reasoning
            </p>
          <ul className="mt-1 list-none space-y-0.5 p-0">
            {reasonLines.map((line) => (
              <li
                key={line}
                className="text-[11px] leading-snug text-ink tabular-nums"
              >
                <ReasonLine text={line} />
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function SquareGrid({
  cols,
  size = 'sm',
  children,
  className,
}: {
  cols: number
  size?: TileSize
  children: ReactNode
  className?: string
}) {
  const row = TILE_SIZE[size]
  const col = TILE_WIDTH[size]
  return (
    <div
      className={cn(
        'mx-auto grid place-content-center justify-items-stretch',
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${col})`,
        gridAutoRows: row,
        gap: TILE_GAP,
      }}
    >
      {children}
    </div>
  )
}
