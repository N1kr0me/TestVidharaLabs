import {
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Ripple = { id: number; x: number; y: number }

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  active?: boolean
}

/**
 * 21st: n38693842/ripple-button
 * Click ripple on ceramic / charcoal shell with logo accents.
 */
export function RippleButton({
  children,
  active = false,
  className,
  onClick,
  type = 'button',
  ...props
}: Props) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const spawnRipple = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const next: Ripple = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    setRipples((prev) => [...prev, next])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== next.id))
    }, 650)
  }, [])

  return (
    <button
      type={type}
      onClick={(e) => {
        spawnRipple(e)
        onClick?.(e)
      }}
      className={cn(
        'relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full',
        'border border-border bg-[#f3efe8] px-3.5 text-xs font-medium whitespace-nowrap',
        'text-[#45355e] transition-colors',
        'hover:border-teal hover:text-teal',
        'dark:bg-[#2a2a2a] dark:text-[#f3efe8] dark:hover:border-lavender dark:hover:text-lavender',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:pointer-events-none disabled:opacity-50',
        active &&
          'border-teal bg-[color-mix(in_oklab,#5ba8a8_14%,#f3efe8)] text-teal dark:border-teal dark:bg-[color-mix(in_oklab,#5ba8a8_18%,#2a2a2a)] dark:text-teal',
        className,
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute rounded-full bg-teal/35 dark:bg-lavender/35"
            style={{ left: r.x, top: r.y, width: 8, height: 8, x: '-50%', y: '-50%' }}
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 14, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </button>
  )
}
