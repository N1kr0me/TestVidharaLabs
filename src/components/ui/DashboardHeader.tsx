import { ChevronDown, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RippleButton } from './RippleButton'
import {
  PRODUCT_VERSIONS,
  type ProductVersionId,
} from '@/lib/versions'
import { USER_ROLES, type UserRoleId } from '@/lib/roles'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  version: ProductVersionId
  onVersionChange: (id: ProductVersionId) => void
  role: UserRoleId
  onRoleChange: (id: UserRoleId) => void
  activeSection?: 'location' | 'predictions' | 'features' | 'rankings'
}

const NAV = [
  { id: 'location' as const, label: 'Location', href: '#section-location' },
  {
    id: 'predictions' as const,
    label: 'Layers',
    href: '#section-predictions',
  },
  { id: 'features' as const, label: 'Features', href: '#section-features' },
  {
    id: 'rankings' as const,
    label: 'Top 5',
    href: '#section-rankings',
    v4Only: true,
  },
]

function scrollToSection(href: string) {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Header with version + role switchers (replaces Phase 0 phase dropdown). */
export function DashboardHeader({
  theme,
  onToggleTheme,
  version,
  onVersionChange,
  role,
  onRoleChange,
  activeSection = 'location',
}: Props) {
  const nav = NAV.filter(
    (item) => !('v4Only' in item && item.v4Only) || version === 'V4-ranking',
  )
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
              Full Product Mockup
            </h1>
          </div>
        </div>

        <nav
          className="hidden items-center gap-2 text-sm lg:flex"
          aria-label="Primary"
        >
          {nav.map((item) => (
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

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative">
            <select
              value={version}
              onChange={(e) =>
                onVersionChange(e.target.value as ProductVersionId)
              }
              aria-label="Dashboard version"
              className={cn(
                'appearance-none rounded-full border border-border bg-surface-2',
                'max-w-[11rem] py-1 pl-2.5 pr-7 text-[11px] font-semibold text-plum sm:max-w-none',
              )}
            >
              {PRODUCT_VERSIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.shortLabel}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-plum"
              aria-hidden
            />
          </div>

          <div className="relative">
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value as UserRoleId)}
              aria-label="User role"
              className={cn(
                'appearance-none rounded-full border border-border bg-surface-2',
                'max-w-[9rem] py-1 pl-2.5 pr-7 text-[11px] font-semibold text-ink sm:max-w-none',
              )}
            >
              {USER_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-muted"
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
