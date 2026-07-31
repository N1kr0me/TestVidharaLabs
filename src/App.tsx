import { useEffect, useState } from 'react'
import { AlertBanner } from './components/ui/AlertBanner'
import { AppFooter } from './components/ui/AppFooter'
import { DashboardHeader } from './components/ui/DashboardHeader'
import { GLOBAL_PROTOTYPE_BANNER } from './lib/disclaimers'
import {
  DEFAULT_VERSION,
  PRODUCT_VERSIONS,
  type ProductVersionId,
} from './lib/versions'
import { DEFAULT_ROLE, type UserRoleId } from './lib/roles'
import { RankingView } from './versions/V4-ranking/RankingView'
import { SingleDistrictView } from './versions/V1-single/SingleDistrictView'
import { CompareTwoView } from './versions/V2-compare-2/CompareTwoView'
import { CompareFiveView } from './versions/V3-compare-5/CompareFiveView'

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('vidhara-fp-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('vidhara-fp-theme', theme)
  }, [theme])

  return {
    theme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  }
}

function App() {
  const { theme, toggle } = useTheme()
  const [version, setVersion] = useState<ProductVersionId>(DEFAULT_VERSION)
  const [role, setRole] = useState<UserRoleId>(DEFAULT_ROLE)
  const versionMeta = PRODUCT_VERSIONS.find((v) => v.id === version)

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <DashboardHeader
        theme={theme}
        onToggleTheme={toggle}
        version={version}
        onVersionChange={setVersion}
        role={role}
        onRoleChange={setRole}
        activeSection="location"
      />

      <AlertBanner>{GLOBAL_PROTOTYPE_BANNER}</AlertBanner>

      <div className="border-b border-border bg-surface-2/60 px-5 py-2">
        <p className="mx-auto max-w-[1400px] text-xs text-muted">
          <span className="font-semibold text-ink">
            {versionMeta?.label ?? version}
          </span>
          {' — '}
          {versionMeta?.description}
        </p>
      </div>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-5">
        {version === 'V4-ranking' ? <RankingView role={role} /> : null}
        {version === 'V1-single' ? <SingleDistrictView role={role} /> : null}
        {version === 'V2-compare-2' ? <CompareTwoView role={role} /> : null}
        {version === 'V3-compare-5' ? <CompareFiveView role={role} /> : null}
      </main>

      <AppFooter />
    </div>
  )
}

export default App
