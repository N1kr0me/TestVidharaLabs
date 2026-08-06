import { cn } from '@/lib/utils'
import React from 'react'

/** Internal SVG coordinate space — scales with CSS size of the wrapper. */
const VB = 100

export interface CircleProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  maxValue: number
  /** Stroke width in viewBox units (default ~3.5% of diameter). */
  strokeWidth?: number
  getColor?: (fillPercentage: number) => string
  className?: string
  animationDuration?: number
  disableAnimation?: boolean
  useGradient?: boolean
  gradientColors?: string[]
  gradientId?: string
  counterClockwise?: boolean
  suffix?: string
}

/**
 * Animated circular progress ring (adapted from 21st.dev Circle Progress).
 * Fills its parent; center content is left empty for overlays.
 */
export function CircleProgress({
  value,
  maxValue,
  strokeWidth = 3.5,
  counterClockwise = false,
  getColor,
  className,
  animationDuration = 300,
  disableAnimation = false,
  useGradient = false,
  gradientColors = ['#10b981', '#f59e0b', '#ef4444'],
  gradientId,
  ...props
}: CircleProgressProps) {
  const [animatedValue, setAnimatedValue] = React.useState(
    disableAnimation ? value : 0,
  )
  const animatedValueRef = React.useRef(animatedValue)

  const uniqueGradientId = React.useRef(
    gradientId ||
      `circle-progress-gradient-${Math.random().toString(36).substring(2, 9)}`,
  ).current

  React.useEffect(() => {
    animatedValueRef.current = animatedValue
  }, [animatedValue])

  const radius = (VB - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillPercentage = Math.min(Math.max(animatedValue / maxValue, 0), 1)
  const strokeDashoffset = circumference * (1 - fillPercentage)

  const defaultGetColor = (percentage: number) => {
    if (percentage < 0.33) return 'stroke-ok'
    if (percentage < 0.66) return 'stroke-warn'
    return 'stroke-danger'
  }

  const currentColor = useGradient
    ? ''
    : getColor
      ? getColor(fillPercentage)
      : defaultGetColor(fillPercentage)

  React.useEffect(() => {
    if (disableAnimation) {
      setAnimatedValue(value)
      return
    }

    const start = animatedValueRef.current
    const end = Math.min(Math.max(value, 0), maxValue)
    const startTime = performance.now()
    if (start === end) return

    const animateProgress = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      const easeProgress = 1 - (1 - progress) * (1 - progress)
      setAnimatedValue(start + (end - start) * easeProgress)
      if (progress < 1) requestAnimationFrame(animateProgress)
    }

    const frame = requestAnimationFrame(animateProgress)
    return () => cancelAnimationFrame(frame)
  }, [value, maxValue, animationDuration, disableAnimation])

  const valueText =
    props['aria-valuetext'] ||
    `${Math.round(value)} out of ${maxValue}, ${Math.round(fillPercentage * 100)}%`

  return (
    <div
      className={cn('h-full w-full', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={maxValue}
      aria-valuetext={valueText}
      {...props}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VB} ${VB}`}
        className="block h-full w-full duration-300"
      >
        {useGradient ? (
          <defs>
            <linearGradient
              id={uniqueGradientId}
              gradientUnits="userSpaceOnUse"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              {gradientColors.map((color, index) => (
                <stop
                  key={color}
                  offset={`${(index / Math.max(gradientColors.length - 1, 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          </defs>
        ) : null}
        <circle
          cx={VB / 2}
          cy={VB / 2}
          r={radius}
          className="fill-transparent stroke-border"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={VB / 2}
          cy={VB / 2}
          r={radius}
          className={cn(
            'fill-transparent transition-colors',
            !useGradient && currentColor,
          )}
          style={
            useGradient
              ? { stroke: `url(#${uniqueGradientId})` }
              : undefined
          }
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={
            counterClockwise ? -strokeDashoffset : strokeDashoffset
          }
          transform={`rotate(-90 ${VB / 2} ${VB / 2})`}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
