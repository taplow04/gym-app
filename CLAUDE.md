# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

Two sibling apps:

- `client/` — the React frontend. Has its own git repository (`client/.git`, remote `https://github.com/taplow04/gym-app.git`, deployed to GitHub Pages). Run frontend npm/git commands from inside `client/`.
- `backend/` — the Forge API (Node 4-layer Express app, MongoDB Atlas). See `backend/README.md` for setup/env, `../SETUP.md` for external-service setup (Atlas/Cloudinary/Brevo), and `backend/src/docs/api.md` for the endpoint table. `npm run dev|start|seed` from inside `backend/`. Secrets live in `backend/.env` (gitignored — never commit it). The frontend calls this API for **auth + account only** (`client/src/lib/api.js`, `context/AuthContext.jsx`); workout/plan/progress data is still localStorage-only. The API's data model deliberately mirrors the frontend's (sessions/entries/sets, 7-day Monday-first plans, kg storage) so data integration is a swap inside `useLocalStorage`. `CLIENT_URL` must include the `/gym-app` base path (email links); CORS derives the bare origin from it.

There is no test suite in either app: verification = drive the running app/API (see `client/.claude/skills/verify/SKILL.md`; for the API there's a full E2E script pattern — register→plan→session→complete→stats→privacy probes — hit `http://localhost:5000/api`).

## Commands

Run from `client/`:

- `npm run dev` — Vite dev server at `http://localhost:5173/gym-app/` (note the base path)
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint flat config; `react/prop-types` is off (vanilla-JS app, no PropTypes)
- `npm run preview` — serve the built `dist/` locally
- `npm run deploy` — build then publish `dist/` to GitHub Pages via `gh-pages`

No test suite. Verification is done by driving the running app — see `client/.claude/skills/verify/SKILL.md` for the recipe (Playwright-core + system Edge, key flows, gotchas).

## What this app is

**Forge** — a local-first, mobile-first gym training PWA-style SPA (React 18 + Vite + vanilla CSS, dark-only premium theme, volt-lime accent). **All training state persists in `localStorage` under `forge.*` keys** via `src/hooks/useLocalStorage.js`. Never hold user data in bare `useState` — routing unmounts pages.

**Auth:** accounts are optional. `context/AuthContext.jsx` owns the session (`booting → authed | guest | anon`): access JWT in memory only, refresh via httpOnly cookie (`lib/api.js` auto-refreshes on 401 and retries). Guest mode preserves the original no-account experience; `forge.authMode`/`forge.authUser` are the only persisted auth keys — never tokens. Auth pages live in `src/pages/auth/` (Login, Register 2-step, ForgotPassword, ResetPassword, VerifyEmail) on routes `/login /signup /forgot-password /reset-password/:token /verify-email/:token`; app tabs are wrapped in `RequireAuth` (authed **or** guest), BottomNav hides on auth screens.

Stack constraint (user requirement): React + JavaScript + vanilla CSS only. Do **not** introduce TypeScript, Tailwind, or any UI/CSS framework or icon library.

## Architecture

- **Routing/shell:** `src/App.jsx` — HashRouter (required by GitHub Pages; paired with `base: "/gym-app"` in `vite.config.js`, keep in sync) + persistent `BottomNav` (5 tabs, center disc = start/resume workout).
- **Pages** (`src/pages/`): `Home` (dashboard: today's plan, streak, weekly tiles), `Workout` (the core loop), `Plan` (weekly split editor), `Progress` (heatmap, auto-PRs, weight chart, goals), `Profile` (settings, backup/reset).
- **The core loop** lives in `Workout.jsx`: the active session is itself stored in localStorage (`activeSession`), so it survives reload/navigation. Finish → sets are filtered to `done`, PRs detected against history (`lib/stats.js` `detectPRs`, Epley est-1RM), session prepended to `history`, celebration overlay shown.
- **Data model:** a session is `{ id, dateKey, title, startedAt, finishedAt, entries: [{ exId, name, muscle, sets: [{ weight, reps, done }] }] }`. Entries copy `name`/`muscle` from `src/data/exercises.js` at log time so library edits never corrupt history. The weekly plan (`data/defaultPlan.js` seed) stores exercise ids only.
- **Derived, never stored:** PRs, streaks, volumes, heatmap levels are all computed from `history` in `src/lib/stats.js`. The streak is weeks-based (consecutive weeks with ≥1 session; current untrained week doesn't break it).
- **Dates:** `src/lib/dates.js` — local-timezone `YYYY-MM-DD` keys, Monday-first weekday indexing everywhere (`weekdayIndex`).
- **Design system:** `src/styles/` in load order `tokens.css` (all color/type/space/radius/motion tokens — components consume roles, never hex) → `base.css` → `components.css` (btn/card/input/chip/stat-tile/sheet/toast/skeleton/empty-state vocabulary) → `pages.css`. Icons are hand-drawn inline SVGs in `components/Icon.jsx`.
- **Charts:** heatmap uses the validated sequential volt ramp (`--heat-0..5` tokens, monotonic lightness); the weight chart is a hand-built single-series SVG line (2px line, 10% area wash, hairline grid, crosshair+tooltip). Follow these mark specs for any new chart; never dual-axis, never color-alone.

## Conventions

- Touch targets ≥ 44px (`--touch`); every icon-only button gets an `aria-label`; feedback via `useToast()`, never `alert()`; destructive actions use the two-tap "armed" confirm pattern.
- Mobile-first: design at 390px, verify 320px has zero horizontal overflow.
- `prefers-reduced-motion` is globally honored in `base.css`; animations must stay decorative.
