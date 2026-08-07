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
 * Item-card volume (soft diagonal fill + bloom) on existing teal / lavender hues.
 *
 * Light: white text, teal fill; teal glow on hover/active.
 * Dark: black text, lavender fill; lavender glow on hover/active.
 * Active: deeper fill + pressed inset; glow stays until untoggled.
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
        'group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-2xl',
        'px-3.5 text-xs font-semibold whitespace-nowrap',
        'border-2 transition-[transform,box-shadow,background,border-color] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.97]',
        // Light — teal item-card volume (same teal hues)
        'border-[color:var(--panel-edge)] text-white',
        'bg-[linear-gradient(145deg,color-mix(in_oklab,var(--teal)_88%,white)_0%,var(--teal)_48%,color-mix(in_oklab,var(--teal)_78%,black)_100%)]',
        'shadow-[0_10px_28px_-8px_color-mix(in_oklab,var(--teal)_35%,transparent),0_4px_12px_-2px_color-mix(in_oklab,var(--teal)_22%,transparent)]',
        'hover:shadow-[0_0_18px_6px_color-mix(in_oklab,var(--teal)_55%,transparent),0_0_4px_1px_color-mix(in_oklab,var(--teal)_80%,transparent)]',
        'focus-visible:ring-teal/60',
        active &&
          'bg-[linear-gradient(145deg,color-mix(in_oklab,var(--teal-deep)_88%,white)_0%,var(--teal-deep)_48%,color-mix(in_oklab,var(--teal-deep)_78%,black)_100%)] shadow-[0_0_20px_7px_color-mix(in_oklab,var(--teal)_60%,transparent),inset_0_3px_8px_rgba(0,0,0,0.28),inset_0_-1px_0_rgba(255,255,255,0.12)]',
        // Dark — lavender item-card volume
        'dark:text-black',
        'dark:bg-[linear-gradient(145deg,color-mix(in_oklab,var(--lavender)_88%,white)_0%,var(--lavender)_48%,color-mix(in_oklab,var(--lavender)_78%,black)_100%)]',
        'dark:shadow-[0_10px_28px_-8px_color-mix(in_oklab,var(--lavender)_40%,transparent),0_4px_12px_-2px_color-mix(in_oklab,var(--lavender)_25%,transparent)]',
        'dark:hover:shadow-[0_0_18px_6px_color-mix(in_oklab,var(--lavender)_55%,transparent),0_0_4px_1px_color-mix(in_oklab,var(--lavender)_80%,transparent)]',
        'dark:focus-visible:ring-lavender/60',
        active &&
          'dark:bg-[linear-gradient(145deg,color-mix(in_oklab,var(--lavender-deep)_88%,white)_0%,var(--lavender-deep)_48%,color-mix(in_oklab,var(--lavender-deep)_78%,black)_100%)] dark:shadow-[0_0_20px_7px_color-mix(in_oklab,var(--lavender)_65%,transparent),inset_0_3px_8px_rgba(0,0,0,0.35),inset_0_-1px_0_rgba(255,255,255,0.15)]',
        className,
      )}
      {...props}
    >
      {/* Item-card bloom */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-[30%] -left-[18%] z-[15] h-[70%] w-[70%] rounded-full bg-white/14 blur-[36px] dark:bg-white/10"
      />
      {/* Plastic top sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 z-20 h-2/5 w-[78%] -translate-x-1/2 rounded-t-full bg-gradient-to-b from-white/35 to-transparent blur-[1.5px] dark:from-white/20"
      />
      {/* Shiny inner border ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_1.5px_0_rgba(255,255,255,0.28),inset_0_-2px_6px_rgba(0,0,0,0.12)]"
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
