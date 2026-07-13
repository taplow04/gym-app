# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

One monorepo (remote `https://github.com/taplow04/gym-app.git`, git root here) with two apps:

- `client/` — the React frontend, deployed to GitHub Pages via `npm run deploy` from inside `client/` (publishes to the repo's `gh-pages` branch). Run frontend npm commands from inside `client/`. ⚠️ The deployed build defaults its API URL to localhost — set `VITE_API_URL` in `client/.env` before deploying once the API is hosted.
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

**Auth:** accounts are optional. `context/AuthContext.jsx` owns the session (`booting → authed | guest | anon`): access JWT in memory only, refresh via httpOnly cookie (`lib/api.js` auto-refreshes on 401 and retries). Guest mode preserves the original no-account experience; `forge.authMode`/`forge.authUser` are the only persisted auth keys — never tokens. Auth pages live in `src/pages/auth/` (Login, Register 2-step, ForgotPassword, ResetPassword, VerifyEmail) on routes `/login /signup /forgot-password /reset-password/:token /verify-email`; app tabs are wrapped in `RequireAuth` (authed **or** guest), BottomNav hides on auth screens.

**Email verification is OTP-based** (no links): register emails a 6-digit code (HMAC-hashed on the User doc, 10-min TTL, 5 attempts, 60s resend cooldown — `POST /auth/verify-otp`, `/auth/resend-otp`); the `/verify-email` screen has six auto-advancing boxes and, from signup, continues to Register's "About you" step (`location.state.step === 2`). Register's `creating` ref stops its authed-guard from racing the redirect to the OTP screen.

**Exercise library:** `client/src/data/exercises.js` is the MASTER dataset (~230 exercises with muscle/equipment/difficulty/mechanics/pattern/aliases/rep+rest guidance/steps). The backend seed (`backend/src/scripts/seedExercises.js`) dynamically imports this same file — edit exercises in one place only. Exercise ids are frozen forever (plans/history reference them).

Stack constraint (user requirement): React + JavaScript + vanilla CSS only. Do **not** introduce TypeScript, Tailwind, or any UI/CSS framework or icon library.

## Architecture

- **Routing/shell:** `src/App.jsx` — HashRouter (required by GitHub Pages; paired with `base: "/gym-app/"` in `vite.config.js` — keep the trailing slash, `BASE_URL` builds the service-worker URL) + persistent `BottomNav` (5 tabs, center disc = start/resume workout). Auth pages + Timer are `React.lazy`; the shell has per-tab scroll memory (`ScrollMemory`) and an `OfflineBanner`.
- **PWA:** installable + offline. `public/manifest.webmanifest` (standalone, shortcuts), `public/icons/*` (generated from the zap mark), `public/sw.js` (hand-rolled: network-first navigations with cached-shell fallback, cache-first hashed assets, cached Google fonts, `/api/` never cached — bump `VERSION` to nuke caches). Registered in `main.jsx`, production only. Install prompt plumbing in `lib/install.js` → "Install app" card in Profile. Base/OS behaviors (no text selection on UI, no pull-to-refresh, 16px inputs against iOS zoom, `--safe-top` insets) live in `base.css`/`tokens.css` — don't undo them per-component.
- **Pages** (`src/pages/`): `Home` (dashboard: today's plan, streak + level chips, quick actions, water tracker, weekly tiles), `Workout` (the core loop + set types W/D, notes, templates, per-exercise history), `Plan` (weekly split editor), `Progress` (heatmap, auto-PRs, achievements/XP, muscle focus, measurements, weight chart + target, full history with repeat/delete, goals), `Profile` (settings, health calculators BMI/BMR/TDEE, backup/reset), `Timer` (standalone interval timer at `/timer`).
- **localStorage keys** (all `forge.*`): `profile plan history activeSession weights goals authMode authUser` + `favExercises templates measurements water timer`. Set shape: `{ weight, reps, done, type? }` where `type` is `"w"` (warm-up — excluded from volume/PRs) or `"d"` (drop set).
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
