import { useCallback, useEffect, useState } from 'react'
import { CompareTray } from './components/CompareTray'
import { EnvironmentTray } from './components/EnvironmentTray'
import { DashboardHeader } from './components/ui/DashboardHeader'
import { V5DashboardView } from './components/V5DashboardView'
import {
  DEFAULT_COMPANY,
  type CompanyId,
} from './lib/companies'
import { DEFAULT_ROLE, type UserRoleId } from './lib/roles'
import type { GrowthStage } from './lib/features'
import type { DistrictInsight, ProductPrediction } from './lib/productEngine'

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('vidhara-v5-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('vidhara-v5-theme', theme)
  }, [theme])

  return {
    theme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  }
}

/**
 * Single V5 shell for desktop and phone — responsive layout, same components.
 * Phone-only MobileDashboard archived in dashboard/V5-desktop-baseline.
 */
function App() {
  const { theme, toggle } = useTheme()
  const [role, setRole] = useState<UserRoleId>(DEFAULT_ROLE)
  const [company, setCompany] = useState<CompanyId>(DEFAULT_COMPANY)
  const [envOpen, setEnvOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [stage, setStage] = useState<GrowthStage>('Fruit development')
  const [insights, setInsights] = useState<DistrictInsight[]>([])
  const [focusId, setFocusId] = useState('')

  const onFocusPrediction = useCallback((p: ProductPrediction | null) => {
    if (p) setFocusId(p.district.id)
  }, [])

  const toggleEnvironment = useCallback(() => {
    setEnvOpen((o) => {
      if (!o) setCompareOpen(false)
      return !o
    })
  }, [])

  const toggleCompare = useCallback(() => {
    setCompareOpen((o) => {
      if (!o) setEnvOpen(false)
      return !o
    })
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-chrome text-ink">
      <DashboardHeader
        theme={theme}
        onToggleTheme={toggle}
        environmentOpen={envOpen}
        onToggleEnvironment={toggleEnvironment}
        compareOpen={compareOpen}
        onToggleCompare={toggleCompare}
      />

      <EnvironmentTray
        open={envOpen}
        onClose={() => setEnvOpen(false)}
        predictions={insights.map((i) => i.prediction)}
        selectedId={focusId}
        onSelectDistrict={setFocusId}
        stage={stage}
      />

      <CompareTray
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        insights={insights}
        focusId={focusId}
        onFocus={setFocusId}
      />

      <V5DashboardView
        role={role}
        company={company}
        onRoleChange={setRole}
        onCompanyChange={setCompany}
        focusId={focusId}
        onFocusIdChange={setFocusId}
        onInsightsChange={setInsights}
        onFocusPrediction={onFocusPrediction}
        onStageChange={setStage}
      />
    </div>
  )
}

export default App
