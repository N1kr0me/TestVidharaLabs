import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  theme: 'light' | 'dark'
  onToggle: () => void
  className?: string
}

/**
 * 21st: @ayushmxxn/theme-toggle — controlled for App theme state.
 */
export function ThemeToggle({ theme, onToggle, className }: Props) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex h-8 w-16 cursor-pointer items-center rounded-full border p-1 transition-all duration-300',
        isDark
          ? 'border-zinc-700 bg-zinc-950'
          : 'border-zinc-200 bg-white',
        className,
      )}
    >
      <div className="relative flex w-full items-center justify-between">
        <div
          className={cn(
            'absolute top-0 flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300',
            isDark
              ? 'translate-x-0 bg-zinc-800'
              : 'translate-x-8 bg-gray-200',
          )}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-white" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4 text-gray-700" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex h-6 w-6 items-center justify-center">
          <Moon
            className={cn(
              'h-4 w-4 transition-opacity',
              isDark ? 'opacity-0' : 'text-black opacity-100',
            )}
            strokeWidth={1.5}
          />
        </div>
        <div className="flex h-6 w-6 items-center justify-center">
          <Sun
            className={cn(
              'h-4 w-4 transition-opacity',
              isDark ? 'text-zinc-500 opacity-100' : 'opacity-0',
            )}
            strokeWidth={1.5}
          />
        </div>
      </div>
    </button>
  )
}
