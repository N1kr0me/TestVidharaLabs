# Full product Mock up

End-state **product dashboard mockup** for investor/customer demos. Quick-data only (Open-Meteo), Unified Strategy rules, role-aware L5 copy.

## Run locally

```powershell
cd "F:\VidharaLabs\dashboard\Full product Mock up"
npm install
npm run dev -- --port 5175
```

Do **not** deploy to Vercel until you ask to host.

## Versions (header switcher)

| Version | Behaviour |
|---------|-----------|
| V1 | Single district |
| V2 | Compare 2 |
| V3 | Compare ≤5 |
| **V4** | Full ranking + Top 5 + per-score rank badges (**V4 only**) |

## Roles

Quality Head · Agronomy Team · Procurement Head (dropdown simulates account role).

## Layers

1. Disease + Quality **bands**  
2. Compliance **India/EU** indexes 0–10 (#1 big, #2 below) + contamination band  
3. Compound yield **0–10** (weather × quality; no NDVI)  
4. Sourcing **proxy** 0–10  
5. Short role-flavoured summary  

Disclaimer on every layer: exact AI informational / user-responsibility line.

See `docs/TEMP_NOTES.md` for locked decisions.
