import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/lamp-tooltip'
import { districts, type District } from '@/data/districts'
import { COMPANIES, type CompanyId } from '@/lib/companies'
import { GROWTH_STAGES, type GrowthStage } from '@/lib/features'
import {
  CROP_SEASONS,
  cropSeasonHint,
  type CropSeason,
} from '@/lib/cropSeason'
import type { DistrictInsight } from '@/lib/productEngine'
import { portfolioStatusCounts } from '@/lib/portfolio'
import { USER_ROLES, type UserRoleId } from '@/lib/roles'
import {
  formatLiveClock,
  formatSessionElapsed,
  getSessionNumber,
  getSessionStartMs,
} from '@/lib/sessionClock'
import { cn } from '@/lib/utils'

/** Idle chrome — same hues, item-card soft diagonal volume. */
const TAB_IDLE_FILL =
  'plastic-tab bg-[linear-gradient(145deg,#d4c6b0_0%,#cabca6_48%,#b9aa93_100%)] dark:bg-[linear-gradient(145deg,#525252_0%,#474747_48%,#3c3c3c_100%)]'

const TAB_IDLE_TEXT = 'text-black dark:text-white'

/** Chooser title — centered; white (light) / black (dark). */
const CHOOSER_TITLE =
  'relative z-10 text-center text-[9px] font-bold uppercase tracking-wider text-white dark:text-black'

type Props = {
  company: CompanyId
  onCompanyChange: (id: CompanyId) => void
  role: UserRoleId
  onRoleChange: (id: UserRoleId) => void
  selected: District[]
  minSelect: number
  maxSelect: number
  onSelectedChange: (next: District[]) => void
  stage: GrowthStage
  onStageChange: (stage: GrowthStage) => void
  cropSeason: CropSeason
  onCropSeasonChange: (season: CropSeason) => void
  insights: DistrictInsight[]
}

/** Combined meta + filter / KPI strip. */
export function V5FilterBar({
  company,
  onCompanyChange,
  role,
  onRoleChange,
  selected,
  minSelect,
  maxSelect,
  onSelectedChange,
  stage,
  onStageChange,
  cropSeason,
  onCropSeasonChange,
  insights,
}: Props) {
  const [now, setNow] = useState(() => new Date())
  const [districtOpen, setDistrictOpen] = useState(false)
  const sessionNumber = getSessionNumber()
  const sessionStart = getSessionStartMs()
  const counts = useMemo(() => portfolioStatusCounts(insights), [insights])
  const selectedIds = new Set(selected.map((d) => d.id))
  const companyMeta = COMPANIES.find((c) => c.id === company)!
  const roleMeta = USER_ROLES.find((r) => r.id === role)!

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const byState = useMemo(
    () =>
      districts.reduce<Record<string, District[]>>((acc, d) => {
        ;(acc[d.state] ??= []).push(d)
        return acc
      }, {}),
    [],
  )

  function toggleDistrict(d: District) {
    if (selectedIds.has(d.id)) {
      if (selected.length <= minSelect) return
      onSelectedChange(selected.filter((x) => x.id !== d.id))
      return
    }
    if (selected.length >= maxSelect) return
    onSelectedChange([...selected, d])
  }

  return (
    <div className="border-b border-border bg-chrome px-3 py-1.5 sm:px-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-1.5">
        {/* Meta: clock/session · company/role — 2-col grid on phone, split row on sm+ */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch sm:justify-between">
          <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-stretch">
            <MetaBox label="Date and time" className="min-w-0">
              <span className="tabular-nums text-[11px] font-medium sm:text-sm">
                {formatLiveClock(now)}
              </span>
            </MetaBox>
            <MetaBox label="Sessions and session time" className="min-w-0">
              <span className="tabular-nums text-[11px] font-medium sm:text-sm">
                Session {sessionNumber}
                <span className="opacity-70"> · </span>
                {formatSessionElapsed(now.getTime() - sessionStart)}
              </span>
            </MetaBox>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-stretch sm:justify-end">
            <SelectBox
              label="Company"
              value={company}
              display={companyMeta.label}
              onChange={(v) => onCompanyChange(v as CompanyId)}
              options={COMPANIES.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
            />
            <SelectBox
              label="Role"
              value={role}
              display={roleMeta.label}
              onChange={(v) => onRoleChange(v as UserRoleId)}
              options={USER_ROLES.map((r) => ({
                value: r.id,
                label: r.label,
              }))}
            />
          </div>
        </div>

        {/* Filters / KPIs — same controls; wrap / grid for narrow screens */}
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-stretch">
          <StatChip label="Sourcing districts" value={counts.sourcing} />
          <StatChip label="To watch" value={counts.watch} tone="warn" />
          <StatChip label="Normal" value={counts.normal} tone="ok" />
          <StatChip label="Alert" value={counts.alert} tone="danger" />

          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative col-span-2 min-w-0 sm:min-w-[9rem] sm:flex-[1.2]">
                  <button
                    type="button"
                    onClick={() => setDistrictOpen((o) => !o)}
                    aria-expanded={districtOpen}
                    className={cn(
                      'chooser-panel relative flex h-full w-full flex-col justify-center rounded-2xl px-2.5 py-1.5 text-left sm:py-1',
                      districtOpen && 'chooser-panel-open z-[1002]',
                    )}
                  >
                    <span className={CHOOSER_TITLE}>District</span>
                    <span className="relative z-10 mt-px flex items-center justify-between gap-1 text-xs font-medium sm:text-sm">
                      <span className="truncate">
                        {selected.length > 0
                          ? `${selected.length} selected`
                          : 'Select districts'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    </span>
                    <span className="relative z-10 text-[9px] leading-tight text-white/75 dark:text-black/65">
                      Select up to {maxSelect} at a time
                    </span>
                  </button>
                  {districtOpen ? (
                    <>
                      <div
                        className="fixed inset-0 z-[1000]"
                        aria-hidden
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setDistrictOpen(false)
                        }}
                      />
                      <div className="panel-edge absolute top-full right-0 left-0 z-[1001] mt-1 max-h-[min(16rem,50vh)] overflow-y-auto rounded-2xl bg-white p-2.5 text-black shadow-[0_12px_32px_-8px_rgba(0,0,0,0.28),0_4px_12px_-2px_rgba(0,0,0,0.12)] dark:bg-black dark:text-white dark:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.55),0_4px_14px_-2px_rgba(0,0,0,0.35)]">
                        {Object.entries(byState).map(([state, list]) => (
                          <div key={state} className="mb-2 last:mb-0">
                            <p className="text-[10px] font-medium uppercase text-black/55 dark:text-white/55">
                              {state}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {list.map((d) => {
                                const on = selectedIds.has(d.id)
                                const disabled =
                                  (!on && selected.length >= maxSelect) ||
                                  (on && selected.length <= minSelect)
                                return (
                                  <button
                                    key={d.id}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => toggleDistrict(d)}
                                    className={cn(
                                      'min-h-8 rounded-full px-2.5 py-1 text-[11px] font-medium',
                                      on
                                        ? 'bg-teal text-white dark:bg-lavender dark:text-black'
                                        : 'border border-black/25 text-black dark:border-white/30 dark:text-white',
                                      disabled && 'opacity-40',
                                    )}
                                  >
                                    {d.name}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[14rem] text-center">
                Choose a minimum of {minSelect} and a maximum of {maxSelect}{' '}
                districts.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ChooserSelectCard
            label="Growth stage"
            className="min-w-0 sm:min-w-[10rem] sm:flex-1"
            hint="Variety is set per district card"
            value={stage}
            onChange={(v) => onStageChange(v as GrowthStage)}
            options={GROWTH_STAGES.map((s) => ({ value: s, label: s }))}
            aria-label="Growth stage"
          />

          <ChooserSelectCard
            label="Crop season"
            className="min-w-0 sm:min-w-[7.5rem] sm:flex-1"
            hint={cropSeasonHint(cropSeason)}
            value={cropSeason}
            onChange={(v) => onCropSeasonChange(v as CropSeason)}
            options={CROP_SEASONS.map((s) => ({
              value: s,
              label: s,
            }))}
            aria-label="Crop season"
          />
        </div>
      </div>
    </div>
  )
}

function MetaBox({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl px-2.5 py-1',
        TAB_IDLE_FILL,
        TAB_IDLE_TEXT,
        className,
      )}
    >
      <p className="relative z-10 text-[9px] font-medium uppercase tracking-wider">
        {label}
      </p>
      <div className="relative z-10 mt-px leading-tight">{children}</div>
    </div>
  )
}

/**
 * Native <select> keeps focus after the OS menu closes (e.g. second click).
 * Track open from open/close gestures, not from focus alone.
 */
function useChooserMenuOpen() {
  const [open, setOpen] = useState(false)

  return {
    open,
    onMenuMouseDown: () => {
      setOpen((wasOpen) => !wasOpen)
    },
    onMenuBlur: () => setOpen(false),
    onMenuChange: () => setOpen(false),
    onMenuKeyDown: (e: KeyboardEvent<HTMLSelectElement>) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (
        e.key === ' ' ||
        e.key === 'Enter' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp'
      ) {
        setOpen(true)
      }
    },
  }
}

function SelectBox({
  label,
  value,
  display,
  onChange,
  options,
}: {
  label: string
  value: string
  display: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const menu = useChooserMenuOpen()

  return (
    <div
      className={cn(
        'chooser-panel relative min-w-0 rounded-2xl px-2.5 py-1.5 sm:min-w-[8.5rem] sm:py-1',
        menu.open && 'chooser-panel-open',
      )}
    >
      <p className={CHOOSER_TITLE}>{label}</p>
      <div className="relative z-10 mt-px flex items-center justify-between gap-1 leading-tight">
        <span className="truncate text-xs font-medium sm:text-sm">{display}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
      </div>
      <select
        aria-label={label}
        aria-expanded={menu.open}
        value={value}
        onMouseDown={menu.onMenuMouseDown}
        onBlur={menu.onMenuBlur}
        onKeyDown={menu.onMenuKeyDown}
        onChange={(e) => {
          onChange(e.target.value)
          menu.onMenuChange()
        }}
        className="absolute inset-0 z-20 cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Native select wrapped in chooser chrome — toggled only while the menu is open. */
function ChooserSelectCard({
  label,
  hint,
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  className,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  'aria-label': string
  className?: string
}) {
  const menu = useChooserMenuOpen()

  return (
    <div
      className={cn(
        'chooser-panel relative flex flex-col justify-center rounded-2xl px-2.5 py-1',
        menu.open && 'chooser-panel-open',
        className,
      )}
    >
      <p className={CHOOSER_TITLE}>{label}</p>
      <select
        aria-label={ariaLabel}
        aria-expanded={menu.open}
        value={value}
        onMouseDown={menu.onMenuMouseDown}
        onBlur={menu.onMenuBlur}
        onKeyDown={menu.onMenuKeyDown}
        onChange={(e) => {
          onChange(e.target.value)
          menu.onMenuChange()
        }}
        className="relative z-10 mt-0.5 w-full rounded-xl border border-[color:var(--panel-edge)] bg-white px-1.5 py-0.5 text-xs font-medium text-black themed-select dark:bg-black dark:text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="relative z-10 mt-px text-[9px] leading-tight text-white/75 dark:text-black/65">
        {hint}
      </p>
    </div>
  )
}

function StatChip({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number
  tone?: 'neutral' | 'warn' | 'ok' | 'danger'
}) {
  const solid = tone === 'warn' || tone === 'ok' || tone === 'danger'

  return (
    <div
      className={cn(
        'relative flex min-w-0 flex-col items-center justify-center rounded-2xl px-2 py-1.5 sm:min-w-[5rem] sm:flex-1 sm:px-2.5 sm:py-1',
        solid && 'solid-panel',
        tone === 'danger' &&
          (value > 0
            ? 'solid-panel-danger'
            : 'solid-panel-danger solid-panel-danger-idle'),
        tone === 'warn' && 'solid-panel-warn',
        tone === 'ok' && 'solid-panel-ok',
        !solid && TAB_IDLE_FILL,
      )}
    >
      <p
        className={cn(
          'relative z-10 -mt-[6px] text-center text-[11px] font-bold uppercase tracking-wider',
          solid
            ? 'text-[#fffef8] dark:text-[#0a0a0a]'
            : TAB_IDLE_TEXT,
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'relative z-10 text-center font-serif text-[21px] font-semibold leading-none tabular-nums',
          solid ? 'text-[#fffef8] dark:text-[#0a0a0a]' : TAB_IDLE_TEXT,
        )}
      >
        {value}
      </p>
    </div>
  )
}
