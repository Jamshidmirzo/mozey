# O'zbekiston Muzeylari — Stage 2 Project Specification

## PROJECT CONTEXT

**Current State (Stage 1 — complete, in production):**
- Flutter app (Dart ^3.6.1) with Clean Architecture + BLoC + Freezed + GetIt
- 281 museums and 101 historical places hardcoded in `lib/core/data/data.dart` and `lib/core/data/data_historical.dart`
- 3 languages (uz, ru, en) via easy_localization
- Likes/saved stored in SharedPreferences
- Google Maps, dark/light theme, search, random feature
- Fully offline — no internet required

**Stage 2 Goal:** Turn the static app into a living platform with managed content, so content changes don't require app store releases.

**Stage 2 Deliverables:**
1. **Backend** (NestJS + Prisma + PostgreSQL 16) — single source of truth
2. **Admin Panel** (Next.js 14 + shadcn/ui) — content management without programmers
3. **Landing Page** (Next.js 14 SSG) — marketing, store links, SEO
4. **Offline-first sync in Flutter** — app works without internet, syncs when online

---

## ARCHITECTURE PRINCIPLES (non-negotiable)

1. **API-first**: Always define OpenAPI contract before implementation.
2. **Append-only for user actions**: No UPDATE/DELETE on likes/saves — only new events. Simplifies offline merge.
3. **Source of truth = PostgreSQL**: Flutter and admin have no hidden state.
4. **Idempotent endpoints**: Repeated submission of the same event must not break data. Use `client_event_id` (UUID).
5. **Multilingual fields = JSONB**: Always `{"uz": "...", "ru": "...", "en": "..."}`. Never flat strings.
6. **Soft delete**: `deleted_at` timestamp, never physical deletion (needed for sync).
7. **Delta sync via `?since=` parameter**: Server returns only items updated after the given timestamp, plus a `deleted` array of soft-deleted IDs.

---

## TECH STACK (locked)

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js 20 LTS |
| Backend Framework | NestJS 10 |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh) + bcrypt |
| File Storage | S3-compatible (MinIO / Cloudflare R2 / AWS S3) |
| Cache (optional) | Redis 7 |
| API Docs | @nestjs/swagger (OpenAPI) |
| Tests | Vitest + supertest |
| Admin Panel | Next.js 14 (App Router) + TypeScript + shadcn/ui + Tailwind CSS + TanStack Query + React Hook Form + Zod + next-intl |
| Landing | Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + next-intl |
| Flutter local DB | Drift (replaces SharedPreferences for content data) |
| Flutter HTTP | Dio |
| Flutter connectivity | connectivity_plus |
| Containerization | Docker + docker-compose |
| CI/CD | GitHub Actions |

---

## DATA MODEL (PostgreSQL)

- `museums` — UUID PK, legacy_id (INT UNIQUE), name/description/ticket_price as JSONB, lat/lng, city, is_published, created_at, updated_at, deleted_at (soft delete). Index on updated_at.
- `museum_photos` — UUID PK, museum_id FK CASCADE, url (S3), order_idx, created_at.
- `historical_places` — identical structure to museums.
- `historical_place_photos` — identical to museum_photos.
- `app_users` — UUID PK, device_id (TEXT UNIQUE), locale, app_version, created_at, last_seen_at.
- `user_actions` — UUID PK, user_id FK, entity_type ('museum'|'historical'), entity_id, action_type ('like'|'unlike'|'save'|'unsave'), client_event_id (TEXT, UNIQUE per user), created_at. Index on (user_id, entity_type, entity_id, created_at DESC).
- `admins` — UUID PK, email (CITEXT UNIQUE), password_hash, role ('superadmin'|'editor'), created_at.
- `audit_log` — UUID PK, admin_id FK, action, entity_type, entity_id, diff (JSONB), created_at.

---

## API ENDPOINTS (v1)

Base prefix: `/api/v1`. All responses JSON, all dates ISO 8601 UTC.

**Public (mobile app):**
- `POST /auth/device` — register device, return app_token
- `GET /museums` — list (supports `?since=ISO_DATE`)
- `GET /museums/:id` — single museum
- `GET /historical-places` — list (with `?since`)
- `GET /historical-places/:id` — single place
- `POST /sync/actions` — batch upload of like/save events
- `GET /sync/manifest` — hashes/updated_at of all entities

**Admin (JWT required):**
- `POST /admin/auth/login`, `POST /admin/auth/refresh`
- `GET/POST /admin/museums`, `PATCH/DELETE /admin/museums/:id`
- `POST /admin/museums/:id/photos`, `DELETE /admin/photos/:id`
- Same for `/admin/historical-places`
- `GET /admin/audit-log` (superadmin)
- `GET/POST/DELETE /admin/admins` (superadmin)

**Response format for GET /museums?since=...:**
```json
{
  "items": [/* museum objects with photos array */],
  "deleted": ["uuid1", "uuid2"],
  "server_time": "ISO8601",
  "next_since": "ISO8601"
}
```

---

## OFFLINE SYNC STRATEGY

**Core principle:** "App always reads from local DB. Network only makes local DB fresher."

**Pull sync (content):**
1. If no network -> exit.
2. Read `last_sync_at` from prefs.
3. `GET /museums?since=last_sync_at`
4. UPSERT each item into local Drift DB.
5. Mark items in `deleted` array as isDeleted=true.
6. Repeat for `/historical-places`.
7. Save `response.next_since` as new `last_sync_at`.

**Push sync (user actions):**
1. User action -> write to `pending_actions` table with `client_event_id = UUID()`.
2. UI updates instantly (optimistic).
3. Background: batch pending actions, `POST /sync/actions`.
4. On 2xx -> mark `is_synced=true`.
5. On 5xx -> exponential backoff (5s, 30s, 2m, 10m, 1h).
6. On 4xx -> mark as failed, log, don't retry forever.

**Sync triggers:** App start, foreground resume, network change (connectivity_plus), 30-min timer.

**Conflicts:** Content = server always wins (read-only for client). Actions = append-only, no conflicts.

**First launch optimization:** Include hardcoded data.dart as bootstrap snapshot imported into Drift on first start. Network only needed for deltas.

---

## SPRINT PLAN (2-week sprints)

- **Sprint 1**: Backend MVP — NestJS + Prisma + Docker, migrations, data.dart import script, public GET endpoints, Swagger, staging deploy
- **Sprint 2**: Auth & admin CRUD — JWT auth, all admin endpoints, S3 photo upload via presigned URLs, audit log, tests
- **Sprint 3**: Sync API + Flutter SyncManager — POST /sync/actions, POST /auth/device, Flutter migration to Drift, RemoteDataSource, SyncManager, pending_actions queue
- **Sprint 4**: Admin panel MVP — Next.js + shadcn/ui, login, museum table + search + pagination, edit form with language tabs, photo upload
- **Sprint 5**: Admin finish + Landing — historical places CRUD, bulk actions, CSV import, audit log UI, landing page with SEO
- **Sprint 6**: Polish & release — E2E tests, load testing (k6, 500 RPS), editor docs, Flutter store release

---

## ACCEPTANCE CRITERIA (Stage 2 is done when)

1. Editor can change a museum description in admin and see it in-app within 5 minutes.
2. Offline user sees all 281 museums and 101 places as before.
3. Like made in airplane mode appears on backend after connecting to Wi-Fi.
4. Duplicate sync request doesn't create duplicate in DB (idempotency test).
5. Landing loads in <=2s on 4G, Lighthouse >=90.
6. All 3 languages work correctly across admin, landing, and app.
7. Audit log records every content change.
8. CI is green, e2e tests pass.
9. Editor documentation written and verified by non-technical person.
