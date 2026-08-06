import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/lamp-tooltip'
import { RankingFlipButton } from '@/components/ui/RankingFlipButton'
import {
  buildCombinedPortfolioDecision,
  rankDistrictsByAlert,
} from '@/lib/portfolio'
import { USER_ROLES } from '@/lib/roles'
import type { DistrictInsight } from '@/lib/productEngine'
import { cn } from '@/lib/utils'

type Props = {
  insights: DistrictInsight[]
  focusId: string
  onFocus: (id: string) => void
  className?: string
}

/** Right rail: ranking + combined portfolio decision. */
export function V5Sidebar({
  insights,
  focusId,
  onFocus,
  className,
}: Props) {
  const ranked = useMemo(() => rankDistrictsByAlert(insights), [insights])
  const combined = useMemo(
    () => buildCombinedPortfolioDecision(insights),
    [insights],
  )

  return (
    <aside
      className={cn(
        'flex min-h-0 w-full min-w-0 flex-col gap-2',
        className,
      )}
    >
      <section className="panel-edge flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-[#e9e3da] p-2 dark:bg-[#2d2d2d]">
        <h2 className="shrink-0 text-center font-serif text-base font-semibold text-ink">
          Ranking
        </h2>
        <p className="mt-0.5 shrink-0 text-center text-[11px] text-black dark:text-white">
          High alert → low across {insights.length} districts
        </p>
        <ol className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-x-hidden overflow-y-auto">
          {ranked.map(({ insight, status }, i) => {
            const id = insight.prediction.district.id
            return (
              <li key={id} className="min-w-0">
                <RankingFlipButton
                  rank={i + 1}
                  name={insight.prediction.district.name}
                  state={insight.prediction.district.state}
                  status={status}
                  active={id === focusId}
                  onSelect={() => onFocus(id)}
                />
              </li>
            )
          })}
        </ol>
      </section>

      <TooltipProvider delayDuration={80}>
        <Tooltip>
          <TooltipTrigger asChild>
            <section
              className={cn(
                'relative min-w-0 cursor-help rounded-lg p-2.5 outline-none',
                combined.tone === 'danger'
                  ? 'overflow-visible'
                  : 'overflow-hidden',
                combined.tone === 'ok' && 'solid-panel solid-panel-ok',
                combined.tone === 'warn' && 'solid-panel solid-panel-warn',
                combined.tone === 'danger' && 'solid-panel solid-panel-danger',
                combined.tone === 'neutral' &&
                  'solid-panel solid-panel-neutral',
              )}
            >
              <h2 className="relative z-10 -mt-[6px] text-center font-serif text-[23px] font-bold text-white dark:text-black">
                Final decision
              </h2>
              <p
                className={cn(
                  'relative z-10 mt-0.5 break-words text-center text-[12px] font-bold uppercase tracking-wider [overflow-wrap:anywhere]',
                  combined.tone === 'neutral'
                    ? 'text-ink'
                    : 'text-[#fffef8] dark:text-[#0a0a0a]',
                )}
              >
                {insights[0]
                  ? `${insights[0].company.shortLabel} · ${USER_ROLES.find((r) => r.id === insights[0].role)?.label ?? insights[0].role} · combined`
                  : 'Selected team · combined'}
              </p>
              <p
                className={cn(
                  'relative z-10 mt-2 break-words text-center font-serif text-lg font-semibold leading-snug [overflow-wrap:anywhere]',
                  combined.tone === 'neutral'
                    ? 'text-ink'
                    : 'text-[#fffef8] dark:text-[#0a0a0a]',
                )}
              >
                {combined.label}
              </p>
              <p
                className={cn(
                  'relative z-10 mt-1 break-words text-left text-xs leading-snug [overflow-wrap:anywhere]',
                  combined.tone === 'neutral'
                    ? 'text-ink/90'
                    : 'text-[#fffef8]/90 dark:text-[#0a0a0a]/90',
                )}
              >
                {combined.action}
              </p>
            </section>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[18rem]">
            <p className="text-center text-[13px] font-bold uppercase tracking-wider text-black dark:text-white">
              Reasoning
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink">
              {combined.reasoning}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  )
}
