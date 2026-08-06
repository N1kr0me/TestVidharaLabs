import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { GlowingEffect } from './GlowingEffect'

type Props = {
  children: ReactNode
  className?: string
  bodyClassName?: string
  padding?: 'md' | 'lg' | 'none'
  id?: string
  /**
   * Outer frame:
   * - theme: muted border token (default)
   * - solid: black (light) / white (dark) — matches navbar buttons
   */
  edge?: 'theme' | 'solid'
  /** Pointer-following edge glow. Off by default for solid edges. */
  glow?: boolean
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
  id,
  edge = 'theme',
  glow,
}: Props) {
  const pad =
    padding === 'lg' ? 'p-5 sm:p-6' : padding === 'none' ? 'p-0' : 'p-4'
  const solid = edge === 'solid'
  const showGlow = glow ?? !solid

  return (
    <div
      id={id}
      className={cn(
        'relative h-full min-h-0 rounded-lg p-2 md:p-3',
        solid
          ? 'panel-edge'
          : 'border border-border',
        className,
      )}
    >
      {showGlow ? (
        <GlowingEffect
          spread={40}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
          staticBorderClassName={
            solid ? 'border-[color:var(--panel-edge)]' : 'border-border'
          }
        />
      ) : null}
      <div
        className={cn(
          'relative flex h-full flex-col overflow-visible rounded-lg bg-surface text-ink',
          solid ? 'border-0 shadow-none' : 'border border-border shadow-sm',
          !solid && 'dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.35)]',
          pad,
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
