import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { StatusChip } from '@/components/ui/StatusChip'
import { cn } from '@/lib/utils'
import type { DistrictStatus } from '@/lib/portfolio'

const STATUS_LABEL: Record<DistrictStatus, string> = {
  alert: 'Alert',
  watch: 'Watch',
  normal: 'Normal',
}

type Props = {
  rank: number
  name: string
  state: string
  status: DistrictStatus
  active: boolean
  onSelect: () => void
}

/**
 * Ranking row — untoggled matches layer tab idle color; selected solid teal/lavender.
 * Soft bevel shading (no hard highlight oval). Flip in/out on selection.
 */
export function RankingFlipButton({
  rank,
  name,
  state,
  status,
  active,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="relative block w-full min-w-0 overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 dark:focus-visible:ring-lavender/50"
    >
      {/* Invisible sizer — keeps both flip faces the same size */}
      <div
        aria-hidden
        className="invisible flex w-full min-w-0 items-center gap-1.5 px-2 py-1.5"
      >
        <FaceContent
          rank={rank}
          name={name}
          state={state}
          status={status}
          selected={false}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden rounded-2xl [perspective:800px]">
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateX: active ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <PlasticFace className="bg-[linear-gradient(145deg,#d4c6b0_0%,#cabca6_48%,#b9aa93_100%)] dark:bg-[linear-gradient(145deg,#525252_0%,#474747_48%,#3c3c3c_100%)]">
            <FaceContent
              rank={rank}
              name={name}
              state={state}
              status={status}
              selected={false}
            />
          </PlasticFace>

          <PlasticFace className="[transform:rotateX(180deg)] bg-[linear-gradient(145deg,#4eaeae_0%,var(--teal)_48%,#2f7a7a_100%)] dark:bg-[linear-gradient(145deg,#9480b8_0%,var(--lavender)_48%,#5c4a80_100%)]">
            <FaceContent
              rank={rank}
              name={name}
              state={state}
              status={status}
              selected
            />
          </PlasticFace>
        </motion.div>
      </div>
    </button>
  )
}

function PlasticFace({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        /* plastic-depth (not plastic-tab): must stay position:absolute for flip */
        'plastic-depth absolute inset-0 flex min-w-0 items-center gap-1.5 rounded-2xl px-2 py-1.5 text-left',
        '[backface-visibility:hidden]',
        className,
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-1.5">
        {children}
      </div>
    </div>
  )
}

function FaceContent({
  rank,
  name,
  state,
  status,
  selected,
}: {
  rank: number
  name: string
  state: string
  status: DistrictStatus
  selected: boolean
}) {
  const labelTone = selected
    ? 'text-white dark:text-black'
    : 'text-black dark:text-white'

  return (
    <>
      <span
        className={cn(
          'relative z-10 shrink-0 tabular-nums text-xs font-medium',
          labelTone,
        )}
      >
        {rank}
      </span>
      <span className="relative z-10 min-w-0 flex-1 overflow-hidden">
        <span className={cn('block truncate text-sm font-medium', labelTone)}>
          {name}
        </span>
        <span className={cn('block truncate text-[10px]', labelTone)}>
          {state}
        </span>
      </span>
      <StatusChip
        label={STATUS_LABEL[status]}
        pulse={status === 'alert'}
        className="relative z-10 shrink-0"
      />
    </>
  )
}
