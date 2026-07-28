import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { GlowCard } from './GlowCard'

type Props = {
  items: string[]
  children?: ReactNode
  className?: string
}

/**
 * 21st: manuarora700/glowing-effect-card
 * Large shell: horizontal square stats on top, rationale list below.
 */
export function RationaleCard({ items, children, className }: Props) {
  return (
    <GlowCard padding="lg" className={cn('w-full', className)}>
      <div className="flex flex-col gap-5">
        {children}

        <div className="border-t border-border pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Prediction rationale
          </p>
          {items.length > 0 ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {items.map((r, i) => (
                <motion.li
                  key={r}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-2 text-sm leading-snug text-ink/90"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  <span>{r}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Load a district to see why scores fired.
            </p>
          )}
        </div>
      </div>
    </GlowCard>
  )
}
