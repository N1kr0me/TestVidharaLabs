import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from 'react'
import { animate } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  blur?: number
  inactiveZone?: number
  proximity?: number
  spread?: number
  variant?: 'default' | 'white'
  glow?: boolean
  className?: string
  /** Always-on frame border (when glow is enabled). */
  staticBorderClassName?: string
  disabled?: boolean
  movementDuration?: number
  borderWidth?: number
}

/**
 * 21st / Aceternity: manuarora700/glowing-effect-card
 * Pointer-following border glow (Cursor-style).
 */
export const GlowingEffect = memo(function GlowingEffect({
  blur = 0,
  inactiveZone = 0.01,
  proximity = 64,
  spread = 40,
  variant = 'default',
  glow = true,
  className,
  staticBorderClassName,
  movementDuration = 2,
  borderWidth = 2,
  disabled = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPosition = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef(0)

  const handleMove = useCallback(
    (e?: PointerEvent | { x: number; y: number }) => {
      if (!containerRef.current) return
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const element = containerRef.current
        if (!element) return

        const { left, top, width, height } = element.getBoundingClientRect()
        const mouseX = e?.x ?? lastPosition.current.x
        const mouseY = e?.y ?? lastPosition.current.y
        if (e) lastPosition.current = { x: mouseX, y: mouseY }

        const center = [left + width * 0.5, top + height * 0.5]
        const distanceFromCenter = Math.hypot(
          mouseX - center[0],
          mouseY - center[1],
        )
        const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone

        if (distanceFromCenter < inactiveRadius) {
          element.style.setProperty('--active', '0')
          return
        }

        const isActive =
          mouseX > left - proximity &&
          mouseX < left + width + proximity &&
          mouseY > top - proximity &&
          mouseY < top + height + proximity

        element.style.setProperty('--active', isActive ? '1' : '0')
        if (!isActive) return

        const currentAngle =
          parseFloat(element.style.getPropertyValue('--start')) || 0
        const targetAngle =
          (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI +
          90
        const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180
        const newAngle = currentAngle + angleDiff

        animate(currentAngle, newAngle, {
          duration: movementDuration,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (value) => {
            element.style.setProperty('--start', String(value))
          },
        })
      })
    },
    [inactiveZone, proximity, movementDuration],
  )

  useEffect(() => {
    if (disabled) return
    const onScroll = () => handleMove()
    const onPointer = (e: PointerEvent) => handleMove(e)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.body.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      window.removeEventListener('scroll', onScroll)
      document.body.removeEventListener('pointermove', onPointer)
    }
  }, [handleMove, disabled])

  // Vidhara logo accents in the conic/radial glow
  const gradient =
    variant === 'white'
      ? `repeating-conic-gradient(from 236.84deg at 50% 50%, #fff, #fff calc(25% / var(--repeating-conic-gradient-times)))`
      : `radial-gradient(circle, #5ba8a8 10%, #5ba8a800 20%),
         radial-gradient(circle at 40% 40%, #8b7ba8 5%, #8b7ba800 15%),
         radial-gradient(circle at 60% 60%, #8ed0d4 10%, #8ed0d400 20%),
         radial-gradient(circle at 40% 60%, #45355e 10%, #45355e00 20%),
         repeating-conic-gradient(
           from 236.84deg at 50% 50%,
           #5ba8a8 0%,
           #8b7ba8 calc(25% / var(--repeating-conic-gradient-times)),
           #8ed0d4 calc(50% / var(--repeating-conic-gradient-times)),
           #45355e calc(75% / var(--repeating-conic-gradient-times)),
           #5ba8a8 calc(100% / var(--repeating-conic-gradient-times))
         )`

  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute -inset-px rounded-[inherit] border opacity-0 transition-opacity',
          staticBorderClassName ?? 'border-border',
          glow && 'opacity-100',
          disabled && 'block',
        )}
      />
      <div
        ref={containerRef}
        style={
          {
            '--blur': `${blur}px`,
            '--spread': spread,
            '--start': '0',
            '--active': '0',
            '--glowingeffect-border-width': `${borderWidth}px`,
            '--repeating-conic-gradient-times': '5',
            '--gradient': gradient,
          } as CSSProperties
        }
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity',
          blur > 0 && 'blur-[var(--blur)]',
          disabled && 'hidden',
          className,
        )}
      >
        <div
          className={cn(
            'glow h-full w-full rounded-[inherit]',
            "after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))] after:rounded-[inherit] after:content-['']",
            'after:[border:var(--glowingeffect-border-width)_solid_transparent]',
            'after:[background:var(--gradient)] after:[background-attachment:fixed]',
            'after:opacity-[var(--active)] after:transition-opacity after:duration-300',
            'after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]',
            'after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]',
          )}
        />
      </div>
    </>
  )
})
