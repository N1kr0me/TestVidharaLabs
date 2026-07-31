import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export function AppFooter({ className }: Props) {
  return (
    <footer
      className={cn(
        'mt-auto border-t border-border bg-surface px-5 py-8',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/brand/vidhara-mark.png"
            alt=""
            className="h-8 w-8 object-contain"
          />
          <div>
            <p className="text-sm font-semibold text-ink">VidharaLabs</p>
            <p className="text-xs text-muted">Predict. Prepare. Procure</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <a
            href="https://www.vidharalabs.com"
            className="inline-flex items-center gap-1.5 transition hover:text-teal"
            target="_blank"
            rel="noreferrer"
          >
            <Globe className="h-3.5 w-3.5" />
            vidharalabs.com
          </a>
          <span>Full product mockup · synthetic / rule-based</span>
          <span>Decision-support only — not legal advice</span>
        </div>
      </div>
    </footer>
  )
}
