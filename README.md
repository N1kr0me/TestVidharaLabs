# VidharaLabs — Dashboard hosting (Vercel)

This folder is the **deploy root** for [TestVidharaLabs](https://github.com/N1kr0me/TestVidharaLabs.git).

Vercel builds from here. Do not put design-only notes (`Components/*.txt`) or local experiments here — only what the live dashboard needs.

## Current contents

- **Phase 0** Predictive Quality Intelligence dashboard (district map, features, predictions)
- Phase 1 / Phase 2 will be appended later in this same project (routes + phase switcher)

## Local check

```powershell
cd hosting
npm install
npm run build
npm run preview
```

## Update workflow (after each phase)

1. Develop in `F:\VidharaLabs\dashboard` (or update this folder directly).
2. Sync / rebuild the app files into `hosting`.
3. Commit and push to `main` on `N1kr0me/TestVidharaLabs`.
4. Vercel auto-deploys the new version.

## Vercel project settings

| Setting | Value |
|--------|--------|
| Root Directory | repo root (this folder) |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

## Git remote

```
origin → https://github.com/N1kr0me/TestVidharaLabs.git
```
