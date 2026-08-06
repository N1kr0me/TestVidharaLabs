import { LayoutGrid, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RippleButton } from './RippleButton'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  environmentOpen: boolean
  onToggleEnvironment: () => void
  compareOpen: boolean
  onToggleCompare: () => void
}

/** V5 navbar — same controls on all viewports; stacks cleanly on phone. */
export function DashboardHeader({
  theme,
  onToggleTheme,
  environmentOpen,
  onToggleEnvironment,
  compareOpen,
  onToggleCompare,
}: Props) {
  return (
    <header className="sticky top-0 z-[1100] border-b-2 border-teal bg-chrome/95 backdrop-blur-md dark:border-lavender">
      <div className="relative mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:px-5 sm:py-2.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <img
            src="/brand/vidhara-mark.png"
            alt=""
            className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              VidharaLabs
            </p>
            <h1 className="truncate font-serif text-sm font-semibold leading-tight text-ink sm:text-lg">
              Predictive Quality · V5
            </h1>
          </div>
        </div>

        <ThemeToggle
          theme={theme}
          onToggle={onToggleTheme}
          className="shrink-0"
        />

        <nav
          className="order-3 flex w-full items-center justify-center gap-2 sm:absolute sm:top-1/2 sm:left-1/2 sm:order-none sm:w-auto sm:-translate-x-1/2 sm:-translate-y-1/2"
          aria-label="Overlays"
        >
          <RippleButton
            active={environmentOpen}
            onClick={onToggleEnvironment}
            aria-pressed={environmentOpen}
            className="h-10 px-3 sm:h-9 sm:px-3.5"
          >
            <Leaf
              className={cn(
                'mr-1.5 h-3.5 w-3.5 transition-transform',
                environmentOpen && 'rotate-12',
              )}
            />
            Environment
          </RippleButton>
          <RippleButton
            active={compareOpen}
            onClick={onToggleCompare}
            aria-pressed={compareOpen}
            className="h-10 px-3 sm:h-9 sm:px-3.5"
          >
            <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
            Table
          </RippleButton>
        </nav>
      </div>
    </header>
  )
}
