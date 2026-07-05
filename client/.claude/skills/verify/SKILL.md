---
name: verify
description: Verify Forge (gym app) changes by driving the real app in a browser
---

# Verifying Forge

## Launch
```bash
cd client && npm run dev   # http://localhost:5173/gym-app/  (note the /gym-app base)
```

## Drive (no Playwright browsers installed — use system Edge)
`npm i playwright-core` in a scratch dir, then
`chromium.launch({ channel: "msedge", headless: true })`.
Mobile viewport 390×844 is the primary target; also check 320px
(`document.documentElement.scrollWidth - clientWidth` must be 0) and 1024px.

## Flows worth driving
1. Home → nav center disc → "Start today's workout" → fill kg/reps →
   tap set check (rest timer bar must appear) → Finish → celebration
   overlay with stats/PRs → Done → Home shows session + streak chip.
2. Reload mid-session: active workout and typed values must survive
   (everything persists via localStorage under `forge.*` keys).
3. Probes that must toast, not break: set-check with empty reps;
   Finish with zero completed sets; Discard is two-tap ("Sure?").
4. Progress: heatmap renders, PR auto-detected, weight logged twice
   same day replaces (needs 2 distinct days for the chart), goals.

## Gotchas
- App state lives in localStorage `forge.*` — clear it (or Profile →
  Reset) for a fresh-user run.
- Today's plan day depends on the real weekday (Mon-first index);
  Sunday is a rest day by default, so "Start today's workout" is absent.
