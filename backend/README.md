# Forge API

Production-ready backend for the Forge gym training app — Node.js, Express 4, MongoDB Atlas, Mongoose.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values below
npm run seed           # loads the 66-exercise global library (idempotent)
npm run dev            # nodemon, or: npm start
```

Server: `http://localhost:5000` · Health check: `GET /api/health`

Step-by-step external-service setup (Atlas, Cloudinary, Brevo SMTP) with
where every value comes from: [`../SETUP.md`](../SETUP.md).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | ✅ | Atlas connection string — include a DB name (`…mongodb.net/forge`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | ✅ | Sign tokens; generate 48-byte hex each |
| `JWT_ACCESS_EXPIRES` | | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES_DAYS` / `_SHORT` | | Refresh TTL: remember-me 30d / session 1d |
| `PORT`, `NODE_ENV`, `CLIENT_URL` | | Server basics; `CLIENT_URL` drives CORS + email links |
| `CLOUDINARY_*` | for uploads | Profile pictures & progress photos (503 if unset) |
| `SMTP_*`, `EMAIL_FROM` | for real email | Unset in dev → emails print to the console |

## Architecture

```
src/
  config/        env loading + validation, Mongo connection, Cloudinary
  constants/     shared enums (roles, muscles, goal types…) used by models AND validators
  models/        Mongoose schemas (User, Exercise, WorkoutPlan, WorkoutSession,
                 PersonalRecord, Measurement, ProgressPhoto, Goal, Reminder,
                 Notification, RefreshToken)
  validators/    express-validator rule sets per module
  middlewares/   auth (JWT), authorize (RBAC), ownership (per-doc privacy),
                 validate, upload (multer→memory), rate limiters, error handler
  controllers/   thin HTTP layer — no business logic
  services/      auth, user, stats (aggregations), records (PR engine),
                 upload (Cloudinary), email, notifications
  routes/        one router per module, mounted in routes/index.js
  jobs/          in-process reminder dispatcher (minute tick → notifications)
  emails/        HTML templates (verify / reset / password-changed)
  socket/        stub with the recipe for future socket.io live notifications
  scripts/       seedExercises.js
  app.js         middleware chain + routes
  server.js      bootstrap, graceful shutdown
```

## Security model

- **Auth:** short-lived access JWT (Bearer) + rotating refresh JWT in an httpOnly cookie scoped to `/api/auth`. Every refresh consumes the old token; reusing a consumed token revokes all sessions (theft detection). Password change/reset revokes everything.
- **Privacy:** every owned resource passes the `ownership` middleware — cross-user reads/updates/deletes return 403, list queries are always user-scoped. Verified by the E2E suite.
- **Hardening:** helmet, CORS allow-list + credentials, global + auth + email rate limits, express-mongo-sanitize, xss-clean, hpp, bcrypt(12), whitelist-only field copying, sensitive fields stripped in `toJSON`.

## API overview

All routes under `/api`. Full endpoint table: [`src/docs/api.md`](src/docs/api.md).

| Area | Base | Highlights |
|---|---|---|
| Auth | `/auth` | register, login (rememberMe), refresh, logout(-all), verify-email, forgot/reset/change password |
| Users | `/users` | `GET/PATCH /me`, `PATCH /me/preferences`, `PATCH /profile-picture`, `DELETE /me` (cascade), admin list/get/delete |
| Exercises | `/exercises` | global library + private custom; filter by muscle/equipment/difficulty/search |
| Plans | `/plans` | 7-day weekly splits & templates, `POST /:id/activate` |
| Workouts | `/workouts` | session lifecycle: create (from plan day / custom / empty), `GET /active`, live PATCH, `POST /:id/complete` (freezes totals, detects PRs, notifies) |
| Measurements | `/measurements` | daily upsert: weight, body-fat %, 10 tape sites |
| Photos | `/photos` | progress photos via Cloudinary |
| Records | `/records` | auto-tracked PRs: best weight, est-1RM (Epley), volume, reps |
| Stats | `/stats` | overview (+week streaks), weekly/monthly buckets, per-exercise progression, weight history |
| Goals | `/goals` | typed goals (weight, weekly-workouts, protein, water, calories, custom), auto-achieve |
| Reminders | `/reminders` | HH:mm + weekday schedule → notification job |
| Notifications | `/notifications` | list, unread-count, read one/all, delete |

## Response shape

```json
{ "success": true,  "data": { … } }
{ "success": false, "message": "…", "errors": [{ "field": "email", "message": "…" }] }
```

## Notes

- Weights are stored in **kg**; the client converts for `lb` users (single source of truth).
- Sessions snapshot exercise name/muscle at log time — renaming a library exercise never corrupts history.
- Warm-up sets are excluded from volume and PR evaluation.
- The frontend (`../client`) is currently localStorage-only; this API mirrors its data model so integration is a swap inside its storage hook.
