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
 * Overlay action button (Environment / Table).
 * Combines plastic sheen + shiny border + glow (21st plastic / shiny-borders / glowing).
 *
 * Light: black text, solid teal fill, black border; teal glow on hover/active.
 * Dark: white text, solid lavender fill, white border; lavender glow on hover/active.
 * Active: darker fill + pressed inset shadow; glow stays until untoggled.
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
        'group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full',
        'px-3.5 text-xs font-semibold whitespace-nowrap',
        'border-2 transition-[transform,box-shadow,background-color,border-color] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.97]',
        // Light — solid teal, white text / district-card edge
        'border-[color:var(--panel-edge)] bg-teal text-white',
        'hover:shadow-[0_0_18px_6px_color-mix(in_oklab,var(--teal)_55%,transparent),0_0_4px_1px_color-mix(in_oklab,var(--teal)_80%,transparent)]',
        'focus-visible:ring-teal/60',
        active &&
          'bg-teal-deep shadow-[0_0_20px_7px_color-mix(in_oklab,var(--teal)_60%,transparent),inset_0_3px_8px_rgba(0,0,0,0.28),inset_0_-1px_0_rgba(255,255,255,0.12)]',
        // Dark — solid lavender, black text / district-card edge
        'dark:bg-lavender dark:text-black',
        'dark:hover:shadow-[0_0_18px_6px_color-mix(in_oklab,var(--lavender)_55%,transparent),0_0_4px_1px_color-mix(in_oklab,var(--lavender)_80%,transparent)]',
        'dark:focus-visible:ring-lavender/60',
        active &&
          'dark:bg-lavender-deep dark:shadow-[0_0_20px_7px_color-mix(in_oklab,var(--lavender)_65%,transparent),inset_0_3px_8px_rgba(0,0,0,0.35),inset_0_-1px_0_rgba(255,255,255,0.15)]',
        className,
      )}
      {...props}
    >
      {/* Plastic top sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 z-20 h-2/5 w-[78%] -translate-x-1/2 rounded-t-full bg-gradient-to-b from-white/35 to-transparent blur-[1.5px] dark:from-white/20"
      />
      {/* Shiny inner border ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_1.5px_0_rgba(255,255,255,0.28),inset_0_-2px_6px_rgba(0,0,0,0.12)]"
      />
      <span className="relative z-10 flex items-center">{children}</span>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute z-[5] rounded-full bg-white/40 dark:bg-white/30"
            style={{
              left: r.x,
              top: r.y,
              width: 8,
              height: 8,
              x: '-50%',
              y: '-50%',
            }}
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
