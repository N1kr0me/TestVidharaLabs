import { ChevronDown, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RippleButton } from './RippleButton'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  /** Active section for nav highlight */
  activeSection?: 'map' | 'features' | 'predictions'
}

const NAV = [
  { id: 'map' as const, label: 'District map', href: '#section-map' },
  { id: 'features' as const, label: 'Features', href: '#section-features' },
  {
    id: 'predictions' as const,
    label: 'Predictions',
    href: '#section-predictions',
  },
]

function scrollToSection(href: string) {
  const el = document.querySelector(href)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/** 21st: sshahaider/navigation-menu — nav uses ripple-button */
export function DashboardHeader({
  theme,
  onToggleTheme,
  activeSection = 'map',
}: Props) {
  return (
    <header className="sticky top-0 z-[1100] border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/brand/vidhara-mark.png"
            alt=""
            className="h-9 w-9 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-plum">
              VidharaLabs
            </p>
            <h1 className="truncate font-serif text-lg leading-tight text-ink">
              Predictive Quality Intelligence
            </h1>
          </div>
        </div>

        <nav
          className="hidden items-center gap-2 text-sm md:flex"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <RippleButton
              key={item.id}
              active={activeSection === item.id}
              onClick={() => scrollToSection(item.href)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              {item.label}
            </RippleButton>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <select
              disabled
              value="0"
              aria-label="Dashboard phase (coming soon)"
              title="Phase switcher disabled until Phase 1 and Phase 2 mockups are ready"
              className={cn(
                'appearance-none rounded-full border border-border bg-surface-2',
                'py-1 pl-2.5 pr-7 text-[11px] font-semibold text-plum',
                'cursor-not-allowed opacity-70',
              )}
            >
              <option value="0">Phase 0 — Directional MVP</option>
              <option value="1">Phase 1 — Validated Pilot</option>
              <option value="2">Phase 2 — Commercial Scale</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-plum opacity-60"
              aria-hidden
            />
          </div>

          <RippleButton
            className="h-9 w-9 !px-0"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </RippleButton>
        </div>
      </div>
    </header>
  )
}
