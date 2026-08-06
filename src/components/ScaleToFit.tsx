import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /** Cap upscaling so ultrawide screens don’t blow up the design. */
  maxScale?: number
}

/**
 * Anchors fixed-layout content to the container width and scales it
 * uniformly so proportions stay constant across window sizes.
 */
export function ScaleToFit({
  children,
  className,
  maxScale = 1,
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [natural, setNatural] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const measure = () => {
      const avail = outer.clientWidth
      const w = inner.offsetWidth
      const h = inner.offsetHeight
      if (w <= 0 || avail <= 0) return
      setNatural({ w, h })
      setScale(Math.min(maxScale, avail / w))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    ro.observe(inner)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [maxScale])

  const scaledW = natural.w * scale
  const scaledH = natural.h * scale

  return (
    <div
      ref={outerRef}
      className={cn('flex w-full justify-center overflow-hidden', className)}
      style={{
        height: scaledH > 0 ? scaledH : undefined,
      }}
    >
      <div
        className="relative shrink-0"
        style={{
          width: scaledW > 0 ? scaledW : undefined,
          height: scaledH > 0 ? scaledH : undefined,
        }}
      >
        <div
          ref={innerRef}
          className="absolute top-0 left-0 w-max"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
