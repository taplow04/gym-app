# Forge API — endpoint reference

Base URL: `/api` · 🔒 = Bearer access token required · 👑 = admin only

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | `{ name, email, password }` → 201, user + accessToken + refresh cookie; emails a 6-digit OTP |
| POST | `/login` | — | `{ email, password, rememberMe? }` → tokens (refresh 30d if rememberMe, else 1d) |
| POST | `/refresh` | cookie | Rotates the refresh token; reuse of a consumed token revokes all sessions |
| POST | `/logout` | cookie | Revokes the presented refresh token |
| POST | `/logout-all` | 🔒 | Revokes every session |
| POST | `/verify-otp` | 🔒 | Verifies the 6-digit email OTP (`{ code }`; attempt-limited, expiring) |
| POST | `/resend-otp` | 🔒 | Sends a fresh OTP, invalidating the previous one (60s cooldown + rate-limited) |
| POST | `/forgot-password` | — | `{ email }` → always 200 (no enumeration); emails 15-min reset link |
| POST | `/reset-password/:token` | — | `{ password }` → resets + revokes all sessions |
| POST | `/change-password` | 🔒 | `{ currentPassword, newPassword }` → changes + revokes all sessions |

## Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | 🔒 | Current profile (incl. derived `age`, preferences) |
| PATCH | `/me` | 🔒 | Profile fields (name, gender, DOB, height, weight, goal, levels, bio, location). Email/password/role rejected |
| PATCH | `/me/preferences` | 🔒 | units (kg/lb), theme, language, restSec, notification + privacy toggles |
| PATCH | `/profile-picture` | 🔒 | multipart `image` (JPEG/PNG/WebP ≤ 5 MB) → Cloudinary URL |
| DELETE | `/me` | 🔒 | Deletes account + every owned document (cascade) |
| GET | `/` | 👑 | Paginated user list |
| GET/DELETE | `/:id` | 👑 | Read / cascade-delete any user |

## Exercises — `/api/exercises`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 | Global library + own custom. Filters: `muscle, equipment, difficulty, category, search` |
| POST | `/` | 🔒 | Create custom exercise (admin + `global:true` → global entry) |
| GET | `/:id` | 🔒 | Global or own |
| PATCH/DELETE | `/:id` | 🔒 | Own custom only (admin: any) |

## Plans — `/api/plans`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 | Own plans, active first |
| POST | `/` | 🔒 | `{ name, days[7]: { focus, rest, exercises: [{ exercise, targetSets, targetReps, restSec }] }, isTemplate? }` |
| GET | `/:id` | 🔒 owner | Populated with exercise names/muscles |
| PATCH | `/:id` | 🔒 owner | Update name/description/days |
| POST | `/:id/activate` | 🔒 owner | Makes this the single active plan |
| DELETE | `/:id` | 🔒 owner | |

## Workouts — `/api/workouts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 | Own sessions; filters `from, to, status` + pagination |
| GET | `/active` | 🔒 | The one active session (resume flow) or null |
| POST | `/` | 🔒 | Start: `{ plan, dayIndex }` (seeded from plan) \| `{ entries }` \| `{}`. 409 if one is active |
| GET | `/:id` | 🔒 owner | |
| PATCH | `/:id` | 🔒 owner | Live sync `title/notes/entries` (sets: type normal/warmup/dropset/superset, weightKg, reps, durationSec, restSec, done; `supersetGroup` pairs entries) |
| POST | `/:id/complete` | 🔒 owner | Freezes duration/volume/sets (warm-ups excluded), updates PRs, creates notifications, returns `newPRs` |
| DELETE | `/:id` | 🔒 owner | |

## Measurements — `/api/measurements`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 | Own check-ins, `from/to` filters |
| POST | `/` | 🔒 | Daily upsert: `{ date?, weightKg?, bodyFatPct?, measurements{neck…rightCalf}?, note? }` — merges same-day; mirrors weight to profile |
| DELETE | `/:id` | 🔒 owner | |

## Photos — `/api/photos` · Records — `/api/records`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET/POST | `/photos` | 🔒 | List / upload (multipart `image` + pose/note/date) |
| DELETE | `/photos/:id` | 🔒 owner | Also removes the Cloudinary asset |
| GET | `/records` | 🔒 | PRs per exercise: bestWeight, bestEst1RM, bestVolume, bestReps |
| DELETE | `/records/:id` | 🔒 owner | |

## Stats — `/api/stats`

| Method | Path | Description |
|---|---|---|
| GET | `/overview` | Totals + current/best week streak |
| GET | `/weekly` | Last 7 days, daily buckets (workouts, volume, sets, duration) |
| GET | `/monthly` | Last 30 days, ISO-week buckets |
| GET | `/exercise?exercise=Name&limit=` | Best weight + volume per session over time |
| GET | `/weight` | Body-weight/body-fat history (chart-ready) |

## Goals · Reminders · Notifications

| Method | Path | Description |
|---|---|---|
| GET/POST | `/goals` | Types: weight, weekly-workouts, protein, water, calories, custom. Auto-achieves when `current ≥ target` (+notification) |
| PATCH/DELETE | `/goals/:id` | |
| GET/POST | `/reminders` | `{ type: workout/water/meal/rest, time: "HH:mm", days: [0-6 Mon-first], message? }` |
| PATCH/DELETE | `/reminders/:id` | |
| GET | `/notifications` | Paginated + `unread` count |
| GET | `/notifications/unread-count` | |
| PATCH | `/notifications/read-all` · `/:id/read` | |
| DELETE | `/notifications/:id` | |
