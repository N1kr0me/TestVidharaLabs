import { useCallback, useEffect, useState } from 'react'
import { IndiaMap } from './components/IndiaMap'
import { AlertBanner } from './components/ui/AlertBanner'
import { AppFooter } from './components/ui/AppFooter'
import { DashboardHeader } from './components/ui/DashboardHeader'
import { FeaturesTable } from './components/ui/FeaturesTable'
import { GlowCard } from './components/ui/GlowCard'
import { RationaleCard } from './components/ui/RationaleCard'
import { StageSelect } from './components/ui/StageSelect'
import { StatisticsCards } from './components/ui/StatisticsCards'
import { districts, type District } from './data/districts'
import {
  GROWTH_STAGES,
  buildFeatureRows,
  estimateDap,
  fetchFeatures,
  predictPhase0,
  type EnvironmentalFeatures,
  type GrowthStage,
  type Phase0Prediction,
} from './lib/features'

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('vidhara-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('vidhara-theme', theme)
  }, [theme])

  return {
    theme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  }
}

function qualityBand(q: Phase0Prediction['quality'] | undefined) {
  if (q === 'Above-normal') return 'Above-normal'
  if (q === 'Below-normal') return 'Below-normal'
  if (q === 'Normal') return 'Normal'
  return undefined
}

function dsiBand(dsi: number | undefined) {
  if (dsi == null) return undefined
  if (dsi >= 3.5) return 'Elevated'
  if (dsi >= 2) return 'Watch'
  return 'Low'
}

function App() {
  const { theme, toggle } = useTheme()
  const [selected, setSelected] = useState<District>(districts[0])
  const [lat, setLat] = useState(districts[0].lat)
  const [lon, setLon] = useState(districts[0].lon)
  const [stage, setStage] = useState<GrowthStage>('Fruit development')
  const [features, setFeatures] = useState<EnvironmentalFeatures | null>(null)
  const [prediction, setPrediction] = useState<Phase0Prediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activeSection, setActiveSection] = useState<
    'map' | 'features' | 'predictions'
  >('map')

  useEffect(() => {
    const ids = [
      ['section-map', 'map'],
      ['section-features', 'features'],
      ['section-predictions', 'predictions'],
    ] as const

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible?.target?.id) return
        const match = ids.find(([id]) => id === visible.target.id)
        if (match) setActiveSection(match[1])
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    )

    for (const [id] of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const dap = estimateDap(stage)

  const load = useCallback(async (la: number, lo: number, st: GrowthStage) => {
    setLoading(true)
    setError(null)
    try {
      const f = await fetchFeatures(la, lo)
      setFeatures(f)
      setPrediction(predictPhase0(f, st, estimateDap(st)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load features')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(lat, lon, stage)
  }, [lat, lon, stage, load])

  function pickDistrict(d: District) {
    setSelected(d)
    setLat(d.lat)
    setLon(d.lon)
  }

  const featureRows = features ? buildFeatureRows(features, stage) : []

  const predictionCards = [
    {
      title: 'Percent Disease Incidence',
      subtitle: 'Blended Phase 0 signal',
      value: prediction ? `${prediction.pdi}%` : '—',
      tone: 'danger' as const,
      status: dsiBand(prediction?.dsi),
      evidence: 'Expert judgement',
      description:
        'Share of the crop expected to show disease under current conditions — not a single named pathogen.',
    },
    {
      title: 'Disease Severity Index',
      subtitle: 'Intensity on affected plants',
      value: prediction ? `${prediction.dsi} / 5` : '—',
      tone: 'warn' as const,
      status: dsiBand(prediction?.dsi),
      evidence: 'Expert judgement',
      description:
        'How intense the disease pressure is (0 = negligible, 5 = severe).',
    },
    {
      title: 'Possible Quality',
      subtitle: 'Directional outlook',
      value: prediction?.quality ?? '—',
      tone:
        prediction?.quality === 'Above-normal'
          ? ('ok' as const)
          : prediction?.quality === 'Below-normal'
            ? ('danger' as const)
            : ('neutral' as const),
      status: qualityBand(prediction?.quality),
      evidence: 'Data gap',
      description:
        'Colour, pungency, oleoresin potential vs usual season — not a lab value. Split ASTA / Capsaicin / Oleoresin in Phase 1.',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <DashboardHeader
        theme={theme}
        onToggleTheme={toggle}
        activeSection={activeSection}
      />

      <AlertBanner>
        Prototype with illustrative logic for investors &amp; customers.
        Weather via Open-Meteo; soil/satellite synthetic. Not production
        predictions.
      </AlertBanner>

      {/*
        Bento layout inspired by vaib215/live-sales-dashboard —
        map replaces charts; card order preserved.
      */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-5">
        <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-[auto_auto_auto_auto] lg:gap-5">
          {/* 1. Map (chart slot in live-sales bento) */}
          <li
            id="section-map"
            className="scroll-mt-24 md:col-span-8 md:row-span-2"
          >
            <GlowCard className="h-full min-h-[420px]" padding="none">
              <div className="flex h-full min-h-[420px] flex-col">
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      Select a district
                    </h2>
                    <p className="text-xs text-muted">
                      Click a district outline, or use the list
                    </p>
                  </div>
                  <select
                    className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-teal focus:ring-2 focus:ring-[var(--ring)]"
                    value={selected.id}
                    onChange={(e) => {
                      const d = districts.find((x) => x.id === e.target.value)
                      if (d) pickDistrict(d)
                    }}
                  >
                    {Object.entries(
                      districts.reduce<Record<string, District[]>>((acc, d) => {
                        ;(acc[d.state] ??= []).push(d)
                        return acc
                      }, {}),
                    ).map(([state, list]) => (
                      <optgroup key={state} label={state}>
                        {list.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="relative min-h-[360px] flex-1">
                  <IndiaMap selected={selected} onPickDistrict={pickDistrict} />
                </div>
                <p className="border-t border-border px-4 py-2 text-[11px] text-muted">
                  Outlines use open district boundaries. Newer splits map to
                  parent shapes — use the dropdown for the exact name.
                </p>
              </div>
            </GlowCard>
          </li>

          {/* 2. Location */}
          <li className="md:col-span-4">
            <GlowCard className="h-full">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Selected location
              </p>
              <h2 className="mt-1 font-serif text-2xl text-ink">
                {selected.name}
              </h2>
              <p className="text-sm text-muted">
                {selected.state}
                {selected.cluster ? ` · ${selected.cluster}` : ''}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-bg px-3 py-2">
                  <p className="text-[10px] uppercase text-muted">Latitude</p>
                  <p className="font-semibold tabular-nums text-ink">{lat}</p>
                </div>
                <div className="rounded-lg bg-bg px-3 py-2">
                  <p className="text-[10px] uppercase text-muted">Longitude</p>
                  <p className="font-semibold tabular-nums text-ink">{lon}</p>
                </div>
              </div>
            </GlowCard>
          </li>

          {/* 3. Growth stage */}
          <li className="md:col-span-4">
            <StageSelect
              className="h-full"
              id="growth-stage"
              label="Growth stage"
              value={stage}
              options={GROWTH_STAGES}
              onChange={(v) => setStage(v as GrowthStage)}
              hint={
                <>
                  Estimated DAP:{' '}
                  <span className="font-semibold text-ink">{dap} days</span>
                  <span> after planting</span>
                </>
              }
            />
          </li>

          {/* 4. Environmental features */}
          <li id="section-features" className="scroll-mt-24 md:col-span-12">
            {error ? (
              <p className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </p>
            ) : null}
            {features ? (
              <FeaturesTable
                rows={featureRows}
                loading={loading}
                caption={`Source: ${features.source} · ${new Date(features.fetchedAt).toLocaleString()}`}
              />
            ) : (
              <GlowCard>
                <p className="text-sm text-muted">
                  Select a location to load features.
                </p>
              </GlowCard>
            )}
          </li>

          {/* 5. Rationale + horizontal square stats */}
          <li id="section-predictions" className="scroll-mt-24 md:col-span-12">
            <RationaleCard items={prediction?.rationale.slice(0, 7) ?? []}>
              <StatisticsCards cards={predictionCards} />
            </RationaleCard>
          </li>
        </ul>
      </main>

      <AppFooter />
    </div>
  )
}

export default App
