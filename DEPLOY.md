# Production Deploy Runbook — mozey.uz

This runbook is written to be executed by a single operator (human or agent) with the
required access. Follow steps in order. Every command is annotated with **where** it runs:
`[local]`, `[droplet]`, `[GitHub UI]`, `[Vercel UI]`, or `[DNS panel]`.

## Current production state (2026-06-18)

The platform is **live on `mozey.uz`** today. It is **not** served from this monorepo.

| Component | Where | URL | Source |
|---|---|---|---|
| API | droplet `157.230.225.147`, docker container `mozey-api-1` | `https://api.mozey.uz` | Flat `/opt/mozey/api/` on droplet (manual deploy, not git-tracked) |
| Admin | same droplet, container `mozey-admin-1` | `https://admin.mozey.uz` | Flat `/opt/mozey/admin/` on droplet |
| Landing | same droplet, container `mozey-landing-1` | `https://mozey.uz` | Flat `/opt/mozey/landing/` on droplet |
| Postgres + Redis + MinIO | same droplet, container infra | volumes `mozey_pg_data`, `mozey_redis_data`, `mozey_minio_data` |
| nginx + Let's Encrypt | droplet host | TLS for all 4 hostnames | `/etc/nginx/sites-enabled/mozey-{api,admin,landing}` |

The workflow `.github/workflows/deploy.yml` and the rest of this runbook describe the
*intended target* topology (monorepo at `/opt/mozey`, deploy via Actions). They are **not
yet wired to live prod** — see §11 for the gap.

## Architecture target (when the gap is closed)

| Component | Where | URL |
|---|---|---|
| API (NestJS) + Postgres + Redis + MinIO | DigitalOcean droplet `157.230.225.147`, docker-compose | `https://api.mozey.uz` |
| Admin Panel (Next.js) | Vercel — existing project `prj_uN3T4vUpqagRgOwU2iX9KMDi4arQ` | `https://admin.mozey.uz` |
| Landing (Next.js) | Vercel — project `prj_iatZo8BtWdFDHrLh63onVcoNeAIf` | `https://mozey.uz` |

Future deploys are triggered via `Actions → Deploy → Run workflow` (see `.github/workflows/deploy.yml`).
The workflow assumes PR #1 (`chore/deploy-pipeline-fixes`) is already merged.

---

## 0. Prerequisites — confirm before starting

- [ ] SSH access to `157.230.225.147` with a user that can run `docker compose` (in the `docker` group or via `sudo`)
- [ ] Owner/Admin on `Jamshidmirzo/mozey` GitHub repo (to set environment secrets)
- [ ] Member of the Vercel team that owns project `prj_uN3T4vUpqagRgOwU2iX9KMDi4arQ` (admin) — `team_mdFbpZV8XpH1ymkMJgtENnwl`
- [ ] DNS panel access for `mozey.uz`
- [ ] PR #1 (`chore/deploy-pipeline-fixes`) merged into `main`

If any of the above is missing, stop and resolve it first.

---

## 1. DNS records  `[DNS panel]`

Add these records at the `mozey.uz` registrar:

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `api` | `157.230.225.147` | 300 |
| CNAME | `admin` | `cname.vercel-dns.com.` | 300 |
| A | `@` (root) | `76.76.21.21` | 300 |
| CNAME | `www` | `cname.vercel-dns.com.` | 300 |

DNS may take 5–60 min to propagate. Verify  `[local]`:

```bash
dig +short api.mozey.uz       # expect 157.230.225.147
dig +short admin.mozey.uz     # expect cname.vercel-dns.com
dig +short mozey.uz           # expect a Vercel A record
```

Do not proceed to step 3 SSL until DNS is resolving correctly.

---

## 2. Initial droplet setup  `[droplet]`

SSH to the droplet:

```bash
ssh <user>@157.230.225.147
```

### 2.1 Clone the monorepo (if not already present)

```bash
sudo mkdir -p /opt/mozey
sudo chown "$USER:$USER" /opt/mozey
cd /opt/mozey
git clone https://github.com/Jamshidmirzo/mozey.git .
git checkout main
```

### 2.2 Create production `.env`

```bash
cp .env.example .env
```

Edit `.env` and set the following keys (use `openssl rand -hex 32` to generate the secrets):

```env
POSTGRES_USER=muzeylari
POSTGRES_PASSWORD=<openssl rand -hex 24>
POSTGRES_DB=muzeylari
DATABASE_URL=postgresql://muzeylari:<SAME_PASSWORD>@postgres:5432/muzeylari?schema=public

REDIS_URL=redis://redis:6379

APP_JWT_SECRET=<openssl rand -hex 32>
ADMIN_JWT_SECRET=<openssl rand -hex 32>
ADMIN_JWT_REFRESH_SECRET=<openssl rand -hex 32>

S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=<openssl rand -hex 12>
S3_SECRET_KEY=<openssl rand -hex 24>
S3_BUCKET=muzeylari
S3_PUBLIC_URL=https://api.mozey.uz/static/uploads

NODE_ENV=production
PORT=3000

CORS_ORIGINS=https://admin.mozey.uz,https://mozey.uz,https://www.mozey.uz
ADMIN_URL=https://admin.mozey.uz
LANDING_URL=https://mozey.uz
API_URL=https://api.mozey.uz

ADMIN_SEED_EMAIL=admin@mozey.uz
ADMIN_SEED_PASSWORD=<openssl rand -hex 16>
```

Save the `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` somewhere safe — it is the first admin login.

### 2.3 Bring up infra + API (only these services — admin/landing go to Vercel)

```bash
docker compose -f infra/docker-compose.yml up -d \
  postgres redis minio minio-init api
```

Wait ~30 seconds, then verify all healthy:

```bash
docker compose -f infra/docker-compose.yml ps
docker compose -f infra/docker-compose.yml logs --tail=20 api
```

### 2.4 Run migrations

```bash
docker compose -f infra/docker-compose.yml exec -T api \
  npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

### 2.5 Seed (only if the database is empty — skip on existing prod)

```bash
docker compose -f infra/docker-compose.yml exec -T api \
  npm run db:seed --workspace=apps/api
```

### 2.6 Smoke-test the API on localhost

```bash
curl -s http://localhost:3000/api/v1/regions | jq '.total'
# expect: 14
curl -s "http://localhost:3000/api/v1/museums?limit=1" | jq '.total'
# expect: > 0  (88 if you replayed the prod import; depends on your seed)
```

---

## 3. nginx + SSL on the droplet  `[droplet]`

### 3.1 Install nginx + certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3.2 Wire up our config

```bash
sudo cp /opt/mozey/infra/nginx.conf /etc/nginx/sites-available/mozey
sudo ln -sf /etc/nginx/sites-available/mozey /etc/nginx/sites-enabled/mozey
sudo rm -f /etc/nginx/sites-enabled/default     # remove default 'welcome' page
sudo mkdir -p /var/www/certbot
sudo nginx -t
sudo systemctl reload nginx
```

At this point the HTTPS server block will warn about a missing certificate. That's
expected — we issue it next.

### 3.3 Issue Let's Encrypt certificate

```bash
sudo certbot --nginx -d api.mozey.uz \
  --non-interactive --agree-tos -m admin@mozey.uz \
  --redirect
```

certbot will edit the nginx config to point at the new cert and reload. Verify:

```bash
sudo nginx -t
curl -sI https://api.mozey.uz/api/v1/regions
# expect: HTTP/2 200
curl -s https://api.mozey.uz/api/v1/regions | jq '.total'
# expect: 14
```

### 3.4 Confirm renewal works

```bash
sudo certbot renew --dry-run
```

---

## 4. Vercel setup  `[Vercel UI]`

### 4.1 Admin (existing project)

Project ID: `prj_uN3T4vUpqagRgOwU2iX9KMDi4arQ`, team: `team_mdFbpZV8XpH1ymkMJgtENnwl`

1. Settings → **Git** → connect to `Jamshidmirzo/mozey` if not already. Set root directory to `apps/admin`.
2. Settings → **Domains** → add `admin.mozey.uz`. Vercel will tell you to add a CNAME if not yet (already covered in step 1).
3. Settings → **Environment Variables** (Production scope only):
   - `API_URL` = `https://api.mozey.uz/api/v1`
   - `NEXT_PUBLIC_API_URL` = `https://api.mozey.uz/api/v1`
   - `NEXT_PUBLIC_APP_URL` = `https://admin.mozey.uz`

### 4.2 Landing (new project)

1. Create new Vercel project → Import `Jamshidmirzo/mozey`
2. **Root directory** = `apps/landing`, framework auto-detected as Next.js
3. Settings → **Domains** → add `mozey.uz` and `www.mozey.uz`
4. Settings → **Environment Variables** (Production):
   - `NEXT_PUBLIC_SITE_URL` = `https://mozey.uz`
   - `NEXT_PUBLIC_API_BASE` = `https://api.mozey.uz/api/v1`
   - `NEXT_PUBLIC_API_URL` = `https://api.mozey.uz`
5. **Copy the new project ID** (Settings → General → Project ID) — you need it for step 5.

### 4.3 First Vercel deploy (manual, one-time)

In each Vercel project, click **Deploy** to get the initial production deploy live.
From then on, the GitHub Actions workflow handles re-deploys.

---

## 5. GitHub Environment + secrets  `[GitHub UI]`

Repository → Settings → **Environments** → **New environment** → name: `production`.

Inside that environment, add the following secrets:

| Secret | Value |
|---|---|
| `DO_HOST` | `157.230.225.147` |
| `DO_USER` | the SSH user from step 2 (e.g. `root` or `deploy`) |
| `DO_SSH_KEY` | private key whose pubkey is in the droplet's `~/.ssh/authorized_keys` for `DO_USER` — paste the **whole** key including `-----BEGIN ...-----` and `-----END ...-----` lines |
| `DO_DEPLOY_PATH` | `/opt/mozey` (or wherever you cloned in step 2.1) |
| `DO_SSH_PORT` | optional, default 22 |
| `VERCEL_TOKEN` | from https://vercel.com/account/tokens (scope: full account) |
| `VERCEL_ORG_ID` | `team_mdFbpZV8XpH1ymkMJgtENnwl` |
| `VERCEL_ADMIN_PROJECT_ID` | `prj_uN3T4vUpqagRgOwU2iX9KMDi4arQ` |
| `VERCEL_LANDING_PROJECT_ID` | new project ID from step 4.2 |

Repeat for `staging` if you want a staging environment (substitute the staging values).

### 5.1 Sanity-check SSH from your machine  `[local]`

```bash
# paste DO_SSH_KEY content into a temp file
TMPKEY=$(mktemp); chmod 600 "$TMPKEY"
pbpaste > "$TMPKEY"   # or however you paste — must contain full PEM
ssh -i "$TMPKEY" -p ${DO_SSH_PORT:-22} <DO_USER>@<DO_HOST> \
  "cd <DO_DEPLOY_PATH> && git rev-parse HEAD"
rm -f "$TMPKEY"
```

You should get back a commit SHA. If git asks for credentials, the droplet clone is
over HTTPS and won't be able to pull privately — fix by either:
- making the repo public (it already is, so HTTPS pull just works for `main`), or
- switching the droplet remote to SSH: `git remote set-url origin git@github.com:Jamshidmirzo/mozey.git` and adding a deploy key.

---

## 6. Trigger the deploy  `[GitHub UI]`

After PR #1 is merged into `main`:

1. Actions → **Deploy** → **Run workflow**
2. environment: `production`
3. service: `all`
4. Click **Run workflow**

Expected job results:

| Job | What it does |
|---|---|
| `deploy-api` | SSH → `git reset --hard origin/main` → rebuild api container → run `prisma migrate deploy` |
| `deploy-admin` | `vercel pull --prod` → `vercel build --prod` → `vercel deploy --prebuilt --prod` against `VERCEL_ADMIN_PROJECT_ID` |
| `deploy-landing` | Same against `VERCEL_LANDING_PROJECT_ID` |

---

## 7. Verification (smoke test)  `[local]`

```bash
# API
curl -s https://api.mozey.uz/api/v1/regions | jq '.total'
# expect: 14
curl -s "https://api.mozey.uz/api/v1/museums?limit=1" | jq '.total'
# expect: > 0

# Admin
curl -sI https://admin.mozey.uz/
# expect: HTTP/2 200 or 307 redirect to /uz, /ru, /en

# Landing
curl -sI https://mozey.uz/
# expect: HTTP/2 200 or 307 redirect to /uz, /ru, /en
curl -sI https://www.mozey.uz/
# expect: 200 or 308 to https://mozey.uz/
```

Open in browser and click through admin login + a landing page section to confirm
e2e works.

---

## 8. Troubleshooting

### `deploy-api` SSH step fails with permission denied
- `DO_SSH_KEY` is the private key (must contain `BEGIN OPENSSH PRIVATE KEY` or `BEGIN RSA PRIVATE KEY`), not the public one.
- The corresponding **public** key is in `~/.ssh/authorized_keys` of `DO_USER` on the droplet.
- Reproduce locally with the steps in §5.1; fix until that works, then re-run the workflow.

### `docker compose exec api ...` fails with "service api is not running"
- Previous `up -d --no-deps api` step probably failed (build error). On the droplet:
  ```bash
  cd /opt/mozey
  docker compose -f infra/docker-compose.yml logs --tail=100 api
  ```

### Vercel deploy: "Project not found"
- `VERCEL_*_PROJECT_ID` must be visible to the `VERCEL_TOKEN`. Run locally:
  ```bash
  vercel projects ls --token=$VERCEL_TOKEN
  ```

### API works on `http://localhost:3000` but `https://api.mozey.uz` returns 502
- nginx config not loaded, or upstream wrong. On the droplet:
  ```bash
  sudo nginx -T | grep -A 5 api.mozey.uz
  sudo journalctl -u nginx --since "10 minutes ago" | tail -20
  ```

### Mobile app still hits `157.230.225.147:3000` after deploy
The Flutter app (`mp/museum_app`) bakes the API URL at build time. After domain cutover:
1. Update the constant or `--dart-define` flag in the Flutter project to `https://api.mozey.uz/api/v1`
2. Rebuild and re-release the iOS / Android binary

Until then, **keep the IP listening** alongside the new domain — nginx already does this since the API container still listens on `:3000` and the firewall is unchanged.

---

## 9. Rollback

### API rollback (droplet)

```bash
ssh <DO_USER>@<DO_HOST>
cd /opt/mozey
git log --oneline -10
git checkout <previous-good-sha>
docker compose -f infra/docker-compose.yml build api
docker compose -f infra/docker-compose.yml up -d --no-deps api
```

Do **not** re-run `prisma migrate deploy` on rollback unless you're certain the previous
schema is compatible. Schema migrations are one-way in Prisma by default.

### Admin / Landing rollback (Vercel)

Vercel UI → project → Deployments → previous good deployment → **... → Promote to Production**.

---

## 10. After a successful first deploy

- [ ] Document the actual `DO_USER` and `DO_DEPLOY_PATH` in this file (replace `<...>` placeholders)
- [ ] Add a Grafana / UptimeRobot probe for `https://api.mozey.uz/api/v1/regions` and `https://mozey.uz/`
- [ ] Schedule cert renewal monitoring: `sudo certbot renew --dry-run` in cron weekly
- [ ] Rotate `ADMIN_SEED_PASSWORD` — log in once, change it from the admin panel

---

## 11. Known divergence: monorepo vs live prod

The droplet does not run from this monorepo today. Before the workflow can be
used for real deploys, this gap has to close. Discovered 2026-06-18:

### Layout

- **Monorepo expects** `/opt/mozey/{apps/api, apps/admin, apps/landing}` + `/opt/mozey/infra/docker-compose.yml` + workspace `package.json` at root.
- **Droplet has** `/opt/mozey/{api, admin, landing}` (flat) + `/opt/mozey/docker-compose.yml` at root + no workspace setup.

### Source

- The droplet's three app directories are **not git repositories** — they were uploaded manually (likely scp/rsync) and have no remote. `git pull` does not work there.
- The monorepo on `Jamshidmirzo/mozey:main` has the same Prisma schema and the same migrations as the droplet's DB. Both notifications module files and migrations now exist in the monorepo (commit `767a4ea`).

### Dockerfile

- **Droplet `/opt/mozey/api/Dockerfile`**: single-context, `npm install` once, copies `firebase-service-account.json`, CMD runs `npx prisma migrate deploy && node dist/src/main.js` (migrations applied on container start).
- **Monorepo `infra/Dockerfile.api`**: multi-stage workspace build. **Currently broken** — `COPY --from=deps /app/packages/shared-types/node_modules` fails because `npm ci --workspace=packages/shared-types` does not create that directory when the package's only deps are devDeps that npm hoists. No Firebase service account handling. Migrations expected to run as a separate workflow step.

### Code

- Droplet's API imports `firebase-admin` for push notifications (`FIREBASE_SERVICE_ACCOUNT_PATH` env var is set in prod `.env`).
- Monorepo's notifications module (added in `767a4ea`) currently has only the controller/service skeleton. The firebase wiring on the droplet has not been audited against monorepo — they may or may not match.

### What to do before flipping the workflow on

1. Audit the diff between monorepo `apps/api/src` and droplet `/opt/mozey/api/src`. Sync any missing prod features into monorepo. Verify the firebase integration is present and identical.
2. Fix `infra/Dockerfile.api`: remove the broken `COPY .../shared-types/node_modules` line, or restructure so that path actually exists after `npm ci`. Add the Firebase service account copy step.
3. On the droplet, do a side-by-side cutover, **not** an in-place replacement, so the existing live containers serve traffic until the new ones are verified:
   - Clone monorepo to `/opt/mozey-mono`
   - Write `infra/docker-compose.override.yml` that uses `external: true` for network `mozey_default` so new api/admin/landing reach the existing postgres/redis/minio
   - Map host ports `3010/3110/3210` for new containers; old ones keep `3000/3100/3200`
   - Build, bring up, smoke-test the new ports
   - Flip nginx upstreams in `/etc/nginx/sites-enabled/mozey-{api,admin,landing}` from old ports to new
   - `sudo nginx -t && sudo systemctl reload nginx`
   - `docker compose -f /opt/mozey/docker-compose.yml stop api admin landing` (keep postgres/redis/minio running)
   - When stable for a few hours, `mv /opt/mozey /opt/mozey-legacy` and `mv /opt/mozey-mono /opt/mozey` so `DO_DEPLOY_PATH=/opt/mozey` lands on the monorepo.

Until §11 closes, **do not** trigger `gh workflow run deploy.yml -f environment=production -f service=api` — the workflow assumes monorepo layout at `DO_DEPLOY_PATH=/opt/mozey` and would either fail loudly (missing `infra/docker-compose.yml` at that path) or, worse, partially overwrite the working source.

The other two workflow jobs (`deploy-admin`, `deploy-landing`) deploy to Vercel and are safe to run — the Vercel projects are set up, domains attached, and env vars in place. They are currently dormant because DNS points all four hostnames at the droplet, not at Vercel; flipping to Vercel is a DNS change away.
