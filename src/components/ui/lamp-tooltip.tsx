import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

const LONG_PRESS_MS = 500
const MOVE_TOLERANCE_PX = 10

type TouchTooltipCtx = {
  /** True while a touch long-press is keeping the tooltip open. */
  touchHoldingRef: React.MutableRefObject<boolean>
  openFromTouch: () => void
  closeFromTouch: () => void
}

const TouchTooltipContext = React.createContext<TouchTooltipCtx | null>(null)

const TooltipProvider = TooltipPrimitive.Provider

/**
 * Tooltip root — desktop hover unchanged; on touch, long-press (~500ms)
 * shows the lamp tooltip and keeps it up until the finger lifts.
 */
function Tooltip({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  )
  const touchHoldingRef = React.useRef(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const openFromTouch = React.useCallback(() => {
    touchHoldingRef.current = true
    setOpen(true)
  }, [setOpen])

  const closeFromTouch = React.useCallback(() => {
    touchHoldingRef.current = false
    setOpen(false)
  }, [setOpen])

  const ctx = React.useMemo(
    () => ({ touchHoldingRef, openFromTouch, closeFromTouch }),
    [openFromTouch, closeFromTouch],
  )

  return (
    <TouchTooltipContext.Provider value={ctx}>
      <TooltipPrimitive.Root
        {...props}
        open={open}
        onOpenChange={(next) => {
          // While holding after long-press, ignore Radix close (pointer leave, etc.)
          if (touchHoldingRef.current && !next) return
          setOpen(next)
        }}
      >
        {children}
      </TooltipPrimitive.Root>
    </TouchTooltipContext.Provider>
  )
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerLeave, onClick, onContextMenu, ...props }, ref) => {
  const ctx = React.useContext(TouchTooltipContext)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const startRef = React.useRef<{ x: number; y: number } | null>(null)
  const armedRef = React.useRef(false)
  const suppressClickRef = React.useRef(false)

  const clearTimer = React.useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const endTouch = React.useCallback(
    (wasLongPress: boolean) => {
      clearTimer()
      armedRef.current = false
      startRef.current = null
      if (wasLongPress || ctx?.touchHoldingRef.current) {
        suppressClickRef.current = true
        ctx?.closeFromTouch()
      }
    },
    [clearTimer, ctx],
  )

  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      {...props}
      onPointerDown={(e) => {
        onPointerDown?.(e)
        if (e.defaultPrevented || !ctx) return
        if (e.pointerType !== 'touch') return

        armedRef.current = true
        startRef.current = { x: e.clientX, y: e.clientY }
        clearTimer()
        timerRef.current = setTimeout(() => {
          if (!armedRef.current) return
          try {
            navigator.vibrate?.(10)
          } catch {
            /* optional haptic */
          }
          ctx.openFromTouch()
        }, LONG_PRESS_MS)
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e)
        if (!armedRef.current || !startRef.current || e.pointerType !== 'touch')
          return
        const dx = e.clientX - startRef.current.x
        const dy = e.clientY - startRef.current.y
        if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) {
          // Treat as scroll / drag — cancel long-press; hide if already open
          const holding = ctx?.touchHoldingRef.current ?? false
          endTouch(holding)
        }
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e)
        if (e.pointerType !== 'touch') return
        const holding = ctx?.touchHoldingRef.current ?? false
        endTouch(holding)
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e)
        if (e.pointerType !== 'touch') return
        const holding = ctx?.touchHoldingRef.current ?? false
        endTouch(holding)
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e)
        // Don't close on leave while still holding — finger may leave the hit target
      }}
      onClick={(e) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false
          e.preventDefault()
          e.stopPropagation()
          return
        }
        onClick?.(e)
      }}
      onContextMenu={(e) => {
        // Avoid OS callout competing with long-press tooltips on buttons
        if (armedRef.current || ctx?.touchHoldingRef.current) {
          e.preventDefault()
        }
        onContextMenu?.(e)
      }}
    />
  )
})
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

/**
 * Lamp Tooltip — adapted from
 * https://21st.dev/@fanoflix/components/lamp-tooltip
 * Glow edge + portal content; themed for Vidhara ceramic/charcoal.
 * Touch: long-press hold-to-show (see Tooltip / TooltipTrigger).
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 14, onPointerDownOutside, ...props }, ref) => {
  const ctx = React.useContext(TouchTooltipContext)

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        onPointerDownOutside={(e) => {
          // Finger still down on the trigger during long-press — don't dismiss
          if (ctx?.touchHoldingRef.current) e.preventDefault()
          onPointerDownOutside?.(e)
        }}
        className={cn(
          'z-[1200] overflow-hidden rounded-md px-3 py-2 text-xs',
          'bg-surface text-ink shadow-md',
          // Outline matches district-card / mode edge
          'border-2 border-black dark:border-white/40',
          'data-[state=open]:animate-[lamp-in_160ms_ease-out]',
          'data-[state=closed]:animate-[lamp-out_120ms_ease-in]',
          // Lamp glow matches selected district card: teal (light) / lavender (dark)
          'data-[side=top]:shadow-[0_10px_28px_-6px_var(--glow)]',
          'data-[side=bottom]:shadow-[0_-10px_28px_-6px_var(--glow)]',
          'data-[side=right]:shadow-[-10px_0_28px_-6px_var(--glow)]',
          'data-[side=left]:shadow-[10px_0_28px_-6px_var(--glow)]',
          // Avoid text selection / callout while inspecting on touch
          'select-none touch-manipulation',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
