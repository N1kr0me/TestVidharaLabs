# VidharaLabs — Hosting (Vercel)

Deploy root for **Full Product Mock-up** (V1–V4 + roles). Replaces the former Phase 0 demo.

**Repo:** [N1kr0me/TestVidharaLabs](https://github.com/N1kr0me/TestVidharaLabs)  
**Live:** Vercel project pointed at this repo’s `main` branch.

## What’s deployed

- **Product:** Full Product Mock-up (`dashboard/Full product Mock up` synced here)
- **Versions:** V1 single · V2 compare-2 · V3 compare-≤5 · **V4 ranking** (default)
- **Roles:** Quality Head · Agronomy Team · Procurement Head (mock dropdown)
- **Layers:** Disease/Quality bands · Compliance 0–10 (8 markets) + Contamination · Compound yield 0–10 · Sourcing proxy · Short role summary
- **Data:** Open-Meteo (live + archive) for selected AP chilli districts; peer ranks via seasonal proxies
- **Stack:** Vite + React + TypeScript + Tailwind + Leaflet

Phase 0 lives under `dashboard/Phase 0/` in the main workspace (not deployed from this folder).

## Local commands

```powershell
cd F:\VidharaLabs\hosting
npm install
npm run build
npm run preview
```

## Sync from product source (before deploy)

```powershell
# From workspace: copy Full product Mock up → hosting (preserve vercel.json)
$src = "F:\VidharaLabs\dashboard\Full product Mock up"
$dst = "F:\VidharaLabs\hosting"
Remove-Item "$dst\src","$dst\public" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$src\src","$dst\src" -Recurse
Copy-Item "$src\public","$dst\public" -Recurse
Copy-Item "$src\index.html","$src\package.json","$src\package-lock.json","$src\vite.config.ts","$src\tsconfig.json","$src\tsconfig.app.json","$src\tsconfig.node.json","$src\eslint.config.js" $dst -Force
```

Then `npm install`, `npm run build`, commit, push `main`.

## Vercel

- `vercel.json` — Vite framework, `npm run build`, output `dist`
- Push to `origin/main` triggers production deploy

## Notes

- No API keys required for Open-Meteo.
- Disclaimer on every intelligence layer: AI/ML-generated data.
- Scores do not change by role; L5 wording/actions do.
