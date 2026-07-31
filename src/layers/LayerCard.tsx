import type { ReactNode } from 'react'
import { GlowCard } from '@/components/ui/GlowCard'
import { DisclaimerLine } from './DisclaimerLine'
import type { IntelligenceLayerMeta } from './types'
import { cn } from '@/lib/utils'

type Props = {
  meta: IntelligenceLayerMeta
  children: ReactNode
  className?: string
  /** Optional role-specific one-liner above body */
  roleHint?: string
}

export function LayerCard({ meta, children, className, roleHint }: Props) {
  return (
    <GlowCard className={cn('w-full', className)} padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-plum">
            Layer {meta.number}
          </p>
          <h3 className="mt-0.5 font-serif text-xl text-ink">{meta.title}</h3>
          <p className="mt-1 max-w-3xl text-xs text-muted">{meta.subtitle}</p>
        </div>
      </div>
      {roleHint ? (
        <p className="mt-3 rounded-lg bg-bg px-3 py-2 text-xs text-ink/90">
          <span className="font-semibold text-plum">For this role: </span>
          {roleHint}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
      <DisclaimerLine />
    </GlowCard>
  )
}
