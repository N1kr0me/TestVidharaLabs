import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { GlowingEffect } from './GlowingEffect'

type Props = {
  children: ReactNode
  className?: string
  bodyClassName?: string
  padding?: 'md' | 'lg' | 'none'
}

/**
 * 21st: manuarora700/glowing-effect-card
 * Card shell with pointer-following glow border.
 */
export function GlowCard({
  children,
  className,
  bodyClassName,
  padding = 'md',
}: Props) {
  const pad =
    padding === 'lg' ? 'p-5 sm:p-6' : padding === 'none' ? 'p-0' : 'p-4'

  return (
    <div
      className={cn(
        'relative h-full min-h-0 rounded-2xl border border-border p-2 md:rounded-3xl md:p-3',
        className,
      )}
    >
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <div
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface text-ink',
          'shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.35)]',
          pad,
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
