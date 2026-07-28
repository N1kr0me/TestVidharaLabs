import { motion } from 'framer-motion'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { FeatureRow } from '@/lib/features'
import { GlowCard } from './GlowCard'

type Props = {
  rows: FeatureRow[]
  caption?: string
  loading?: boolean
  className?: string
}

/** Features table inside glowing-effect card */
export function FeaturesTable({ rows, caption, loading, className }: Props) {
  return (
    <GlowCard className={className} bodyClassName="min-h-0">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Environmental features
        </p>
        {loading ? <span className="text-xs text-teal">Loading…</span> : null}
      </div>
      <div className="relative min-h-0 w-full flex-1 overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className="border-b border-border/70 transition-colors hover:bg-bg/80"
              >
                <td className="py-1.5 pr-2 text-muted">{row.label}</td>
                <td className="py-1.5 text-right font-medium tabular-nums text-ink">
                  {row.value}
                </td>
                <td className="py-1.5 pl-3 text-right">
                  <StatusBadge label={row.watch} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <p className="mt-2 text-[10px] text-muted">{caption}</p>
      ) : null}
    </GlowCard>
  )
}
