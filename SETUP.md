# Forge — full setup guide

Everything needed to clone and run the app with working auth, image
uploads, and real email. Each service section says exactly where every
`.env` value comes from.

```
client/   React SPA (Vite) — http://localhost:5173/gym-app/
backend/  Express API      — http://localhost:5000/api
```

## 1. Quick start (no external accounts needed)

The app runs end-to-end with **only MongoDB configured**. Emails print
to the backend console, and profile-picture upload returns a friendly
error until Cloudinary is set up.

```bash
# API
cd backend
npm install
cp .env.example .env        # fill MONGODB_URI + both JWT secrets (see below)
npm run seed                # loads the exercise library (idempotent)
npm run dev                 # http://localhost:5000

# App (second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173/gym-app/
```

The frontend needs no `.env` for local dev — it defaults to
`http://localhost:5000/api`. To point it elsewhere, copy
`client/.env.example` to `client/.env` and set `VITE_API_URL`.

## 2. MongoDB Atlas

1. Create a free account at <https://www.mongodb.com/cloud/atlas/register>.
2. **Create a cluster** → choose the free M0 tier, any nearby region.
3. **Database Access** → Add New Database User → username + strong
   password, role "Read and write to any database".
4. **Network Access** → Add IP Address → "Add My Current IP Address"
   (or `0.0.0.0/0` for development only — never for production).
5. **Connect → Drivers** → copy the connection string and **insert a
   database name** before the `?`:

   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/forge?retryWrites=true&w=majority
   ```

Test it: `npm run dev` in `backend/` — startup fails fast with a clear
error if the URI is wrong. Then `curl http://localhost:5000/api/health`.

## 3. JWT secrets

Generate two **different** values:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Put one in `JWT_ACCESS_SECRET`, run it again for `JWT_REFRESH_SECRET`.

## 4. Cloudinary (profile pictures & progress photos)

Optional — uploads return 503 until configured; everything else works.

1. Sign up free at <https://cloudinary.com/users/register_free>.
2. After onboarding you land on the **Dashboard** (Programmable Media).
   The three values you need are right there under **Product Environment
   Credentials** (or Settings → API Keys):
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET` (click "Reveal")
3. Paste them into `backend/.env` and restart the API.

Test: log in to the app → Profile → tap the camera badge on the avatar →
pick an image. It's compressed client-side (≤512px JPEG), uploaded to the
`avatars/` folder in your Cloudinary media library, and the new picture
renders immediately.

## 5. Email / SMTP (verification + password reset)

**Development:** leave all `SMTP_*` empty. Emails are printed to the
backend console — the verification/reset links in the log are real and
clickable.

**Production — Brevo (recommended, free 300 emails/day):**

1. Create an account at <https://www.brevo.com>.
2. **Senders & Domains → Senders** → add and confirm the address you'll
   send from (this becomes `EMAIL_FROM`).
3. **SMTP & API → SMTP** → generate an SMTP key. The page shows all
   four values:

   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=<the login shown on that page, usually your account email>
   SMTP_PASS=<the generated SMTP key>
   EMAIL_FROM="Forge <you@yourdomain.com>"
   ```

**Gmail (development only):** enable 2FA, create an App Password
(Google Account → Security → App passwords), then
`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=you@gmail.com`,
`SMTP_PASS=<app password>`.

Test: register a new account in the app — a verification email should
arrive (or appear in the console). Templates live in
`backend/src/emails/templates.js`.

## 6. CLIENT_URL — read this one

Email links are built from `CLIENT_URL`, and CORS derives its allowed
origin from it. It must include the SPA's base path:

```
# local dev
CLIENT_URL=http://localhost:5173/gym-app
# production (GitHub Pages)
CLIENT_URL=https://taplow04.github.io/gym-app
```

## 7. Complete backend .env reference

| Variable | Required | Where it comes from |
|---|---|---|
| `NODE_ENV` | — | `development` locally, `production` when deployed |
| `PORT` | — | Any free port; default `5000` |
| `CLIENT_URL` | — | Frontend URL **including** `/gym-app` (section 6) |
| `MONGODB_URI` | ✅ | Atlas → Connect → Drivers (section 2) |
| `JWT_ACCESS_SECRET` | ✅ | Generated hex (section 3) |
| `JWT_REFRESH_SECRET` | ✅ | Generated hex, different from access (section 3) |
| `JWT_ACCESS_EXPIRES` | — | Access-token TTL, default `15m` |
| `JWT_REFRESH_EXPIRES_DAYS` | — | Remember-me refresh TTL, default `30` |
| `JWT_REFRESH_EXPIRES_DAYS_SHORT` | — | Non-remember-me TTL, default `1` |
| `CLOUDINARY_CLOUD_NAME` | uploads | Cloudinary dashboard (section 4) |
| `CLOUDINARY_API_KEY` | uploads | Cloudinary dashboard (section 4) |
| `CLOUDINARY_API_SECRET` | uploads | Cloudinary dashboard (section 4) |
| `SMTP_HOST` | real email | Brevo SMTP page (section 5) |
| `SMTP_PORT` | real email | `587` (STARTTLS) or `465` (TLS) |
| `SMTP_USER` | real email | Brevo SMTP login |
| `SMTP_PASS` | real email | Brevo SMTP key |
| `EMAIL_FROM` | real email | A confirmed sender, e.g. `"Forge <no-reply@you.com>"` |

Frontend (`client/.env`, optional):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL; defaults to `http://localhost:5000/api` |

## 8. Security note

Never commit `.env` (it's gitignored). If a database password or JWT
secret ever leaks — including being pasted into a chat or issue —
rotate it in Atlas (Database Access → Edit → Edit Password) and update
`MONGODB_URI`.
