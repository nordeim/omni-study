# Deployment Guide

ORBITAL ships as a single Next.js **standalone** build with a SQLite file
database — one process, zero external services. This guide covers the
supported production paths and the environment contract.

## 1. Build

```bash
bun install
bun run build          # next build + standalone assembly (.next/standalone)
```

The build compiles the page shell and the 16 API route handlers, then copies
`.next/static` and `public/` into `.next/standalone/` (see the `build`
script in `package.json`). `next.config.ts` pins `outputFileTracingRoot` to
the repo root — keep it; the standalone trace depends on it.

## 2. Run

```bash
bun run start          # NODE_ENV=production bun .next/standalone/server.js
```

The server listens on port 3000 by default (`PORT` overrides). Always start
it from the repo root via the npm/bun script — the scripts guarantee the
working directory that the SQLite path resolution and the standalone trace
rely on. Behind a reverse proxy, forward `X-Forwarded-Proto` so cookie
attributes derive the right scheme.

## 3. Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. See §4. |
| `AUTH_SECRET` | **Yes in production** | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. An insecure dev constant is used when unset — never ship that. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public origin, used for metadata URLs and `sitemap.xml` (e.g. `https://orbital.example.com`). |

## 4. Database location (§4 — the `.env.example` reference)

`DATABASE_URL` accepts three forms:

1. **Relative `file:` URL (the default, zero-config local story).**
   ```
   DATABASE_URL="file:../db/custom.db"
   ```
   Relative URLs resolve against the **`prisma/` directory that owns
   `schema.prisma`** — exactly like the Prisma CLI — so this string points
   at `<repo>/db/custom.db` for `prisma db push`, `prisma/seed.ts`,
   `next build` and the running server alike, regardless of the process
   working directory. The resolution rule lives in
   `src/lib/db-path.ts` and is pinned by `tests/db-path.test.ts`.

2. **Absolute `file:` URL (recommended for production).**
   ```
   DATABASE_URL="file:/var/lib/orbital/custom.db"
   ```
   Absolute paths pass through untouched — immune to any working-directory
   ambiguity across service managers, containers, or cron wrappers. Point
   them at a persisted volume and back the file up.

3. **PostgreSQL.** Switch `provider = "postgresql"` in
   `prisma/schema.prisma`, set a `postgresql://` URL, then
   `bun run db:push && bun run db:seed`.

Initialize (or reset) the database with:

```bash
bun run db:push        # apply schema (db push — no migrations folder)
bun run db:seed        # idempotent demo workspace (wipes domain tables)
```

`db/*.db` is gitignored; every fresh clone recreates it from the two
commands above.

## 5. Updating

```bash
git pull
bun install
bunx prisma generate   # after schema changes
bun run db:push
bun run build
# restart the server process
```

## 6. Verification checklist

```bash
curl -s https://your-host/api/health          # {"status":"ok",...}
bun run lint && bun run typecheck && bun run test
./scripts/smoke-test.sh                       # 30 E2E checks (local)
bun run test:e2e                              # Playwright suite (local)
```

## 7. Common production issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error code 14: Unable to open the database file` | Server started from a directory that has no `prisma/schema.prisma` and no absolute `DATABASE_URL` | Start via `bun run start`, or set an absolute `file:` URL (§4) |
| Logins loop back to `/login` | `AUTH_SECRET` changed between restarts | Keep the secret stable across restarts |
| Rate-limited logins (429) | 10 attempts/IP/15 min fixed window | Wait for `Retry-After`, or restart to clear the in-memory buckets (single-node) |

## 8. Docker (one-command containerized deployment)

The repo ships a production `Dockerfile` + `docker-compose.yml`
(session-18). The container runs the same standalone server as
`bun run start` — the app code is unchanged by containerization; only
the environment contract moves (§4 form-2: the absolute `file:` URL).

```bash
# 1. First run — initialize the SQLite volume (schema + demo seed),
#    then start the app:
AUTH_SECRET="$(openssl rand -hex 32)" docker compose --profile init up -d

# 2. Subsequent runs:
docker compose up -d

# 3. Verify:
curl -s http://localhost:3000/api/health     # {"status":"ok","db":"up",...}
```

What the compose file does:

| Piece | Purpose |
|---|---|
| `studyflow` service | The standalone server on :3000 (`STUDYFLOW_PORT` remaps), `/data` volume for SQLite, healthcheck on `/api/health` |
| `init` service (`--profile init`) | One-shot `prisma db push` + the idempotent seed onto the same volume |
| `db-data` volume | The SQLite file (`file:/data/custom.db`) — survives container rebuilds |
| `AUTH_SECRET` | **Required** — compose refuses to boot with the placeholder (§3) |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical origin (read at serve time by metadata/sitemap) |

Notes:

- **The image carries no database bytes.** The build context ignores
  `db/`, the output tracer's stale `.next/standalone/db/` snapshot is
  removed in the runtime stage, and the absolute `DATABASE_URL` points
  at the volume regardless.
- **Validation status (honest caveat):** the layout was validated
  end-to-end OUTSIDE Docker (a local simulation of the exact runtime
  filesystem: prod-deps overlay + standalone + `src/lib` + `prisma/`,
  then `db push` → seed → boot → health/login/RUM checks — see
  `scripts/docker-layout-sim-s27.sh`), but the dev sandbox that
  authored it has no Docker daemon. The first
  `docker compose --profile init up` on a Docker host is the remaining
  verification step; report any divergence as an issue.
- **Schema updates:** re-run the init profile after `git pull` +
  rebuild (`docker compose build && docker compose --profile init run
  --rm init` — the push is additive/idempotent).
- **PostgreSQL** (§4 form-3) works in containers too: set the
  `DATABASE_URL` service environment to the postgres URL and leave the
  volume unmounted.

### 8.1 After deployment: see your field data

Once the app is up and you (or your users) have visited it, the RUM
beacon has been collecting real Core Web Vitals. The visible inspection
surface is the auth-gated **diagnostics panel at `/rum`** (session-19) —
sign in, then navigate to `https://your-host/rum`: the five metrics at
p75 with rating badges derived from the public CWV bounds, the samples
line, and the ten most recent events. The panel is URL-direct (it is
deliberately linked from nowhere — the app shell's parity is
byte-preserved) and themes with your account's dark mode + accent. The
scriptable contract remains `GET /api/rum` (same auth, JSON) for
curl/monitoring use.

Session-20 (v3) additions: each sampled card carries a **sparkline**
(the metric's 20 most recent samples, oldest → newest — the trend at a
glance: "is my LCP drifting?"), and the panel's **Export CSV** action
downloads your most recent 2000 events as a spreadsheet-ready CSV
(`GET /api/rum/export` — same auth, `text/csv`, RFC-4180 escaping, raw
values) for offline analysis.

### 8.2 After deployment: take your data with you

The full-data export (session-21) is the "own your data" exit: the
auth-gated **export page at `/export`** — sign in, then navigate to
`https://your-host/export` — previews the 20 content collections as a
count grid and documents the format. The **Download JSON** action (or
the scriptable `GET /api/export/data` — same auth, `application/json`)
returns the complete versioned envelope: every collection in
chronological order with ids and foreign keys intact, your profile
(without the password hash), uploaded files with their payloads, and a
per-collection count summary. VerificationToken/PasswordResetToken and
RUM telemetry are excluded by design (the RUM CSV on `/rum` is the
telemetry dump). The export is a point-in-time download, not a sync —
re-download after meaningful changes; the SQLite volume (§4) remains
the full-fidelity backup.
