# Project Status

**Project**: Transcriptioneer — AI knowledge organizer (transcription, document
intelligence, semantic search, and chat over your own knowledge base).

## Current status

```
MILESTONE 0 — ARCHITECTURE / PRODUCT PHILOSOPHY — COMPLETE
MILESTONE 1 — PROJECT FOUNDATION — COMPLETE
MILESTONE 2 — DESIGN SYSTEM + DESIGN LAB — COMPLETE
MILESTONE 2.5 — VISUAL/PRODUCT REFINEMENT — COMPLETE (2026-07-29)
MILESTONE 3 — AUTHENTICATION — CORE SCOPE COMPLETE, VERIFIED LIVE
  (started 2026-07-29, verified end-to-end 2026-08-05): schema, API auth
  module, Google OAuth, and web login/register screens all done and
  confirmed working against the real production API/database/domain.
  Apple/Microsoft OAuth stubs and (dashboard) route protection remain,
  both explicitly deferred, non-blocking.
MILESTONE 4 — FILE UPLOADS — CORE SCOPE COMPLETE, VERIFIED LIVE
  (started and verified end-to-end 2026-08-07): SourceFile schema,
  presign/upload/confirm/list/download/delete API, real-magic-byte
  validation, and dashboard wiring all done and confirmed working
  against the real production API/database/storage.
MILESTONE 5 — AUDIO TRANSCRIPTION — CORE SCOPE COMPLETE, VERIFIED LIVE
  (started and verified end-to-end 2026-08-07): ProcessingJob/Transcript
  schema, LocalWhisperProvider (packages/ai), a BullMQ worker triggered
  automatically on upload confirmation, and dashboard polling/toast all
  done — verified against the real local Whisper install on the VPS
  with real synthesized speech, correctly transcribed end-to-end.
```

Milestone 2.5 is done: the founder resolved its one open question
(cosmic-by-default surface, ~10% brighter — see `VISUAL_IDENTITY.md` §2.1.1)
and, same day, expanded its scope to include shipping the real homepage
(previously deferred until after auth — see `MILESTONE_2.5_VISUAL_REFINEMENT.md`'s
"Addendum"). The `(dashboard)` route is now committed: a scribe-and-threshold
hero, sidebar/mobile nav, process tracker, recent-documents grid, and quick
insights, all driven by the same mock data `/design-lab` already used — no
backend or auth wiring added.

Milestone 3 has since started, same day: commit `f9a3c55` ("Milestone 3: real
Prisma schema") replaced the `HealthCheck` placeholder with the real
`User`/`Organization`/`OrganizationMember`/`RefreshToken` models and a
generated migration, and `dbea1ae` ("Milestone 3: shared auth types and Zod
schemas") added matching `packages/types`/`packages/validation` scaffolding
(see "Milestone 3 — Authentication (in progress)" below). Together these are
item 1 (schema) plus the type/validation halves of items 8–9 of
`MILESTONE_3_AUTH.md`'s 11-item scope — the API auth module
(register/login/refresh/logout), password hashing, guards, rate limiting, and
the web login/register screens are **not** written yet.

**As of this point, [`PRODUCT_PHILOSOPHY.md`](./PRODUCT_PHILOSOPHY.md) and
[`VISUAL_IDENTITY.md`](./VISUAL_IDENTITY.md) are the authoritative sources for
Transcriptioneer's human/product philosophy and character/aesthetic,
respectively.** Milestone 3 and every milestone after it must be evaluated
against both, not just against technical completeness.

## Completed milestones

### Milestone 1 — Project foundation
- pnpm workspace + Turborepo monorepo (`apps/{web,api}` + `packages/{types,validation,database,ai,ui,api-client,config}`).
- Next.js 16 web app and NestJS API, both booting; `GET /health` on the API returns `{ success, data: { status, service, timestamp } }` and degrades gracefully (HTTP 200, `status: "degraded"`) when the database is unreachable rather than crashing.
- Prisma schema wired to PostgreSQL + pgvector (`packages/database`), currently a single placeholder `HealthCheck` model — the real knowledge-graph schema starts at Milestone 3.
- `packages/ai` established as a structurally-enforced server-only boundary (never a dependency of `apps/web`/`apps/mobile`; `no-restricted-imports` ESLint rule backs this up).
- ESLint 9 (flat config), Prettier, TypeScript project references, Vitest (packages, web) / Jest (api) test infra, `.env.example`, `docker-compose.yml` (Postgres+pgvector, Redis, MinIO).
- `apps/mobile` is an intentional placeholder (README only) — real app starts Milestone 12.

### Milestone 2 — Design system
- Full design token system (`packages/ui/src/tokens.css`): warm-ink neutral scale, "signal" accent scale, 4 semantic hues (success/warning/error/info), role tokens (`--color-bg`, `--color-surface`, `--color-text`, ...) that light and dark mode map to *different* scale steps — not inverted values. (The accent scale originally shipped as a muted teal; it was re-derived to a blue matching `VISUAL_IDENTITY.md` §2.1's `#2884E8` signal-blue spec once that document entered scope — see the token file's own comment for the accessibility rationale.)
- ~30 reusable components in `packages/ui` (Radix UI primitives + `class-variance-authority`, `cmdk` command palette): Button, Input/Textarea/Select/Checkbox/RadioGroup/Switch/FormField, Card, Badge, Avatar, Tooltip, Dialog, AlertDialog, DropdownMenu, ContextMenu, Tabs, Toast/Toaster, Alert, Skeleton, Progress, Spinner, Separator, Breadcrumbs, EmptyState, Command palette, ThemeToggleButton.
- Product-specific components in `apps/web/src/components`: navigation (sidebar, mobile nav, top nav, search interface), document/audio/task/decision/person/topic/AI-insight cards, AI result renderers, file-processing-state badges/rows, upload dropzone/queue.
- Tactile/skeuomorphic pass per `VISUAL_IDENTITY.md` §2.2 (mandatory skeuomorphism directive, founder 2026-07-29): bevel/surface-gradient/inset-ring/chrome-dot tokens added to `tokens.css`, plus new components `PanelChromeHeader` (decorative macOS-style window chrome), `ScribeMark` (placeholder hooded-scribe character, non-mascot), `IntakeThreshold`, `ProcessStepper`, and `QuickInsightsPanel` — all showcased in `/design-lab` with mock data only, same scope as the rest of Milestone 2.
- `/design-lab` route: all 13 required sections (Brand, Typography, Buttons, Form elements, Cards, File states, AI results, Navigation, Feedback, Modals & overlays, Upload experience, Responsive, Light & dark), mock data only, `robots: noindex`.
- Light/dark mode via `next-themes`, visually verified live in a real browser (Chrome via automation): both themes, and every interactive component (Dialog, AlertDialog, Command palette, Toast, theme toggle).
- Two real bugs found and fixed during verification (not just cosmetic — see `ARCHITECTURE.md` §13–14 for full detail):
  1. `Button`'s `asChild` (Radix `Slot`) broke when a hidden loading-spinner slot was rendered alongside a single child.
  2. `packages/ui` had to be switched from CommonJS to ESM output — TypeScript's forced `"use strict"` prologue was shadowing `"use client"` directives, silently breaking every client component in the package under Next.js's static generation.

### Milestone 2.5 — Visual/product refinement (2026-07-29)
- Resolved the palette open question: cosmic/dark is now the default product
  surface everywhere (not hero-only), tuned ~10% brighter than the raw
  reference art via `color-mix()` in `tokens.css`'s `.dark` block;
  `next-themes`' `defaultTheme` is `"dark"`. Light mode remains available via
  the theme toggle. See `VISUAL_IDENTITY.md` §2.1.1.
- Replaced `BrandMark`'s ascending-bars icon with an original arched-doorway/
  portal glyph matching every reference mockup and the "threshold, not a
  button" framing. (`favicon.ico` is a follow-up — binary asset, not
  regenerated from the new SVG in this pass.)
- Shipped the real homepage (see below) — same-day scope addition beyond the
  original refinement-only plan.
- Extended tactile/skeuomorphic treatment to `AppSidebar`, `TopNav`,
  `MobileNav`, and the compact `UploadDropzone` (Card already had it from
  Milestone 2).
- Verified with a real headless-browser pass (Playwright + Chromium,
  installed for this session): desktop and mobile viewports, both theme
  directions, `/design-lab`'s Brand/Navigation/Upload-experience sections.
  Caught and fixed one real bug this way — a stale Design Lab description
  still describing the old ascending-bars mark.
- Commits were pushed directly to `master` (matching this repo's existing
  no-PR workflow), then independently reviewed via a GitHub PR
  (`Cubensis91/transcriptioneer#1`) opened against a throwaway
  `pre-milestone-2.5` baseline branch purely so the diff was reviewable.
  The review (8 parallel finder agents + direct verification) surfaced 8
  findings; the 4 real regressions were fixed in a follow-up commit
  (dropped Markdown support in `IntakeThreshold`/`UploadDropzone`,
  `IntakeThreshold` missing its `state` prop so `ScribeMark` could never
  reach its active/pulsing state on the live homepage, and `ProcessStepper`'s
  `kind` hardcoded to `"audio"` instead of derived from the mock document).
  PR #1 was then **closed without merging** — nothing to integrate, since
  `master` already had every commit — and `pre-milestone-2.5` was deleted.

### Milestone 3 — Authentication (in progress, started 2026-07-29)
- Prisma schema (`packages/database/prisma/schema.prisma`) replaces the
  Milestone 1 `HealthCheck` placeholder with `User`, `Organization`,
  `OrganizationMember` (role enum `OWNER`/`ADMIN`/`MEMBER`, multi-tenant from
  day one per `ARCHITECTURE.md` §7), and `RefreshToken` (hashed storage,
  rotation-with-reuse-detection via `replacedByTokenId`). Migration SQL
  (`20260729231129_init_auth`) was generated offline via `prisma migrate diff
  --from-empty --to-schema-datamodel` (no live Postgres in this sandbox —
  same Docker constraint noted below) — `db:generate` succeeds and `apps/api`
  still typechecks clean, but the migration has **not** been applied against
  a live database yet. `prisma migrate deploy` is still owed once Docker is
  available.
- `packages/types` gained `OrgRole`/`User`/`Organization`/`AuthSession`/
  `AuthenticatedUser`; `packages/validation` gained `registerSchema`/
  `loginSchema` (commit `dbea1ae`) — now actually consumed by the auth module
  below (previously typechecked clean but unused).
- **New 2026-08-04:** the `/api/v1/auth` module itself is built —
  `apps/api/src/auth/` (`auth.controller.ts`, `auth.service.ts`,
  `jwt.strategy.ts`, `jwt-auth.guard.ts`, `pipes/zod-validation.pipe.ts`).
  `register`/`login`/`refresh`/`logout` plus `GET /me` and
  `GET /organizations/:id` (the latter added to prove repository-layer org
  scoping). Argon2id password hashing; JWT access token (separate secret
  from refresh, both configurable via new `JWT_ACCESS_SECRET`/
  `JWT_REFRESH_SECRET`/`JWT_ACCESS_TTL_SECONDS`/`JWT_REFRESH_TTL_DAYS` env
  vars — see `.env.example`) delivered as an httpOnly cookie; refresh token
  is an opaque random value stored only as a SHA-256 hash, with
  rotation-with-reuse-detection actually implemented (reusing an
  already-rotated token revokes every live token for that user).
  `@nestjs/throttler` limits `register`/`login`/`refresh` to 5/min (global
  default elsewhere is 100/min). Tests: `auth.service.spec.ts` (register,
  login, refresh/rotation/reuse-detection, logout, cross-org rejection — 13
  tests) and `auth.security.spec.ts` (guard behavior + rate-limit 429 over
  real HTTP via supertest — 4 tests), all 17 passing against a **mocked**
  Prisma client (no live Postgres available, same constraint as the
  migration above). `pnpm turbo run typecheck lint test` green for
  `apps/api`. See `MILESTONE_3_AUTH.md` for the full item-by-item detail and
  updated acceptance-criteria checkboxes.
- **Update 2026-08-05: deployed and live-verified on the production VPS.**
  Pushed to `origin/master` (`4f62e25`), pulled/built/deployed on
  `93.127.211.218`, added the new JWT env vars to `apps/api/.env`, restarted
  the `transcriptioneer-api` PM2 process. `prisma migrate deploy` confirmed
  the auth migration was already live (from the 2026-08-01 verification —
  "No pending migrations to apply"). Exercised the entire flow with `curl`
  against the real API and real Postgres: register, `/me`, login (incl.
  wrong-password 401), refresh rotation, logout, refresh-after-logout 401,
  unauthenticated 401, and cross-org 403 — all correct. Test rows cleaned
  up afterward. See `MILESTONE_3_AUTH.md`'s "Live verification" section and
  updated acceptance-criteria checkboxes (now all checked except the web
  screens and OAuth stubs).
- **Update 2026-08-05 (same day): Google OAuth stub added.**
  `GoogleStrategy` (Passport) + `AuthService.loginOrRegisterWithOAuth` +
  `GET /api/v1/auth/google` / `.../google/callback`. Required a new schema
  model (`OAuthAccount`, generic across providers, migration
  `20260805023729_add_oauth_accounts`) generated offline the same way as
  the original auth migration, then confirmed applied on the live VPS
  database. The strategy is only registered when
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL` are all
  set — without them the app still boots and both routes return
  `501 Not Implemented` rather than crashing or erroring oddly. No real
  Google OAuth app is registered yet (that's an account-setup task, not
  code — see `MILESTONE_3_AUTH.md`'s "Deferred" section), so this is
  unit-tested (new-account creation, repeat sign-in, linking to an
  existing password account by email) but not yet exercised against the
  real Google consent screen.
- **Update 2026-08-05 (later still): real Google OAuth credentials live.**
  Registered a real OAuth client at console.cloud.google.com (redirect URI
  `https://app.transcriptioneer.online/api/v1/auth/google/callback`,
  consent screen in "Testing" mode) and deployed the client ID/secret to
  the VPS. Along the way, found and fixed a real bug: `AuthModule` checked
  `process.env.GOOGLE_CLIENT_ID` at module-file-evaluation time, which runs
  before `ConfigModule.forRoot()` loads `.env` — so it never saw the
  credentials and `GET /google` failed with "Unknown authentication
  strategy" even when correctly configured. Fixed by always registering
  `GoogleStrategy` and moving the real check into `GoogleAuthGuard` (via
  `ConfigService`, at request time). Confirmed live: `GET
  /api/v1/auth/google` now returns a real `302` to `accounts.google.com`
  with the correct `client_id`/`redirect_uri`. See `MILESTONE_3_AUTH.md`
  for the full bug writeup. Not yet walked through the full consent-to-
  callback flow with a real browser session.
- **Update 2026-08-05 (final pass): web login/register screens.**
  `apps/web/src/app/(auth)/{login,register}/page.tsx` + a shared
  `(auth)/layout.tsx`, built entirely from existing `packages/ui`
  components and brand assets (`BrandLockup`, `ScribeMark`, the same
  cosmic-hero background treatment as `IntakeThreshold`) — no new visual
  components invented, matching what was asked. Client-side validation
  reuses `registerSchema`/`loginSchema` from `packages/validation` (added
  as an `apps/web` dependency). New `lib/services/auth-service.ts` calls
  the real API with `credentials: "include"` — extended the shared
  `packages/api-client` with an optional `credentials` field rather than
  building a second client. "Continuar con Google" links to
  `GET /api/v1/auth/google`. Verified live in a real browser: both pages
  render correctly, validation blocks bad submissions with the exact zod
  messages, a network failure shows a clean error instead of crashing.
  **Two real bugs found and fixed along the way:** (1) `googleCallback`
  was returning JSON instead of redirecting the browser back to
  `WEB_APP_URL` — harmless for `fetch`-based endpoints, but this one is
  reached via a real full-page navigation, so a user finishing Google
  sign-in would've landed on raw JSON instead of back in the app; (2)
  Vitest here runs with `globals: false`, so `@testing-library/react`
  never self-registered its automatic per-test DOM cleanup — any test
  file with more than one `it()` leaked DOM across tests. Fixed globally
  in `vitest.setup.ts`, protecting every future multi-test file in
  `apps/web`, not just the two new ones. `typecheck`/`lint` clean; tests
  green except the same pre-existing, unrelated stale-copy failure in
  `(dashboard)/page.test.tsx`. See `MILESTONE_3_AUTH.md` for full detail.
- **Update 2026-08-05 (same day, final): `apps/web` deployed to production
  and the full flow verified end-to-end against the real API and real
  database.** This required actually standing up the web app on the VPS
  for the first time — previously only `apps/api` ran there
  (`app.transcriptioneer.online` proxied straight to it). Now: `next build`
  + `next start -p 3001` under PM2 (`transcriptioneer-web`, `pm2 save`d so
  it survives reboot), and `/etc/caddy/Caddyfile` rewritten to route
  `/api/*` and `/health` to the API (port 4000) and everything else to the
  web app (port 3001) — same origin, so the httpOnly session cookies work
  correctly (they wouldn't across two different domains/ports under
  `SameSite=Lax`, which is why this was worth doing properly rather than
  pointing a local dev server at the VPS API). Also fixed
  `NEXT_PUBLIC_API_URL`, which had `/api` appended in the VPS `.env.local`
  from an earlier session — harmless while unused, but would have doubled
  the prefix on every auth call; set to `""` for same-origin relative
  paths. Verified live in a real browser against
  `https://app.transcriptioneer.online`: register → real `User`/
  `Organization` rows created → cookie set → redirected to the dashboard;
  session survives a full page reload (`GET /me` succeeds); login with
  the wrong password shows a real error (see the exception-filter bug
  above); login with the right password succeeds; logout invalidates the
  session (`refresh` afterward returns 401). Test account deleted
  afterward — no leftover data in production. Google's "Continuar con
  Google" link confirmed still redirecting correctly post-deploy.
- **Not yet done:** Apple/Microsoft OAuth stubs (same pattern as Google,
  just not built), route protection on `(dashboard)` (no auth guard exists
  there yet — intentionally out of scope, see `MILESTONE_3_AUTH.md`), and
  walking the real Google consent screen with an actual Google account
  (requires the founder's own interactive login — not something that can
  be automated).
- Estimated completion: **Milestone 3's core scope is done and verified
  live end-to-end.** What remains is genuinely optional/deferred:
  Apple/Microsoft OAuth stubs and `(dashboard)` route protection (both
  explicitly out of scope for this pass), plus the founder personally
  clicking through the Google consent screen once to see it end-to-end.

### Milestone 4 — File uploads (core scope complete, verified live 2026-08-07)

- **Schema**: `SourceFile` (`packages/database/prisma/schema.prisma`) — the
  first knowledge-graph model beyond auth (`ARCHITECTURE.md` §4). Fields:
  `organizationId`/`uploadedById` (repository-layer scoping, same pattern as
  auth), `storageKey` (never exposed to clients), `originalName`,
  `mimeType`, `sizeBytes`, `status` (`PENDING`/`UPLOADED`/`FAILED`).
  Migration `20260807102306_add_source_file`, generated offline the same
  way as the auth migrations and applied to the live database.
- **API** (`apps/api/src/files/`): `POST /api/v1/files/presign` →
  `POST /api/v1/files/:id/complete` → `GET /api/v1/files` →
  `GET /api/v1/files/:id` → `GET /api/v1/files/:id/download-url` →
  `DELETE /api/v1/files/:id`, all guarded, all org-scoped. `StorageService`
  wraps an S3-compatible client (MinIO); every read/write goes through a
  short-lived presigned URL, never a public bucket ACL
  (`ARCHITECTURE.md` §7). The API server's own bytes are never in the
  upload path — the browser PUTs straight to storage.
- **Real magic-byte validation**: `confirmUpload` doesn't trust the
  client's declared mime type — it fetches the first ~4KB of the actual
  uploaded object and sniffs it (`file-type`, isolated behind
  `file-type-loader.ts` since it's ESM-only and apps/api is CommonJS). A
  mismatch (e.g. a `.exe` declared as `audio/mpeg`) deletes the storage
  object, marks the row `FAILED`, and rejects — **verified live**: uploaded
  a real Windows executable's magic bytes declared as `audio/mpeg`, got
  `"doesn't look like a audio/mpeg file (detected: application/x-msdownload)"`,
  confirmed the object was actually deleted from the bucket afterward.
- **apps/web**: new `lib/services/files-service.ts` (presign → XHR PUT
  with progress → confirm) wired into the dashboard's `IntakeThreshold` for
  the first time — selecting a file now does a real upload, not just UI.
- **Two real bugs found and fixed during live verification:**
  1. **`@UsePipes` validated `@CurrentUser()` too.** `presign()` combined a
     custom param decorator (`@CurrentUser()` — unlike `@Req`/`@Res`, not
     pipe-exempt) with a Zod validation pipe applied at the method level via
     `@UsePipes()`, which runs *every* parameter through the same pipe. The
     authenticated-user object got validated against the upload-request
     schema and always failed ("filename: Required, mimeType: Required,
     sizeBytes: Expected number, received nan") — a correctly-shaped
     request from a logged-in user still got rejected. Fixed by scoping the
     pipe to `@Body()` specifically in both `files.controller.ts` and
     (preventively) `auth.controller.ts`'s `register`/`login`. Added
     `files.security.spec.ts`, an HTTP-level regression test — a
     service-only unit test can't catch this class of bug, since it's
     about how the controller wires its params.
  2. **Presigned URLs pointed at `localhost:9000`.** `STORAGE_ENDPOINT` was
     set to MinIO's internal address for server-side operations, but that
     same endpoint is what the AWS SDK uses to build the presigned URL the
     *browser* has to PUT to — unreachable from outside the VPS. Tried
     routing `/storage/*` through the existing domain via Caddy first, but
     that breaks AWS SigV4 signature verification (the signed canonical
     path includes the `/storage` prefix; Caddy's `handle_path` strips it
     before forwarding, so MinIO sees a different path than what was
     signed → `SignatureDoesNotMatch`). Fixed properly: added a dedicated
     `storage.transcriptioneer.online` DNS `A` record (same VPS IP) and a
     separate Caddy site block reverse-proxying straight to MinIO with no
     path rewriting, so path-style S3 addressing works cleanly.
     `STORAGE_ENDPOINT` now points there. TLS certificate issued
     automatically on first Caddy reload.
- **Full live verification via `curl`** against
  `https://app.transcriptioneer.online` and the real database/storage:
  presign → real PUT to `storage.transcriptioneer.online` (200) → confirm
  (`UPLOADED`, correct size from storage) → list → download-url → actual
  file content retrieved correctly → delete (object removed from MinIO,
  row removed from Postgres) → magic-byte mismatch rejection (see above).
  Also registered a real account through the actual web UI
  (`/register` → dashboard) to confirm the route renders and the session
  works end-to-end; couldn't complete a real file-picker upload through
  the automated browser tooling specifically (browsers block
  programmatically setting `<input type="file">`'s value for security —
  a tooling limitation, not a code issue), so `IntakeThreshold`'s
  drag-and-drop/click path is wired correctly by inspection and the
  service layer is fully verified, but hasn't been clicked through by a
  real human yet. All test accounts/files/DNS-adjacent data cleaned up
  afterward — no leftover data in production.
- 8 new `FilesService` tests (creation, confirm success/type-mismatch/
  never-uploaded, text-file magic-byte exemption, cross-org scoping,
  deletion) + 2 new controller-wiring regression tests. `pnpm typecheck/
  lint/test` clean across the monorepo (except the same pre-existing,
  unrelated stale-copy test in `(dashboard)/page.test.tsx`).
- **Not yet done:** a real human clicking through the actual upload UI
  once; everything past "the file exists in storage" (transcription,
  processing, knowledge extraction — Milestone 5+); a `/library`-type
  screen listing a user's real uploaded files (currently `/library` is
  still mock-data-only, unrelated to this milestone).

### Milestone 5 — Audio transcription (core scope complete, verified live 2026-08-07)

- **Schema**: `ProcessingJob` (one row per `SourceFile` per pipeline run —
  `stage`: `QUEUED`/`TRANSCRIBING`/`COMPLETED`/`FAILED`, plus
  `errorMessage`/`attempts`) and `Transcript` (`text`, `language`,
  `segments` JSON — raw Whisper timestamp/speaker data preserved as-is,
  not normalized into rows yet). Migration
  `20260807201352_add_processing_job_and_transcript`, generated offline
  and applied to the live database, same pattern as every prior migration.
- **First real service in `packages/ai`**: `LocalWhisperProvider`,
  implementing a `TranscriptionProvider` interface so a future OpenAI/
  Gemini/Deepgram provider is a new class, not a rewrite of every caller
  (`WHISPER_SETUP.md`'s documented intent). Shells out to `transcribe.py`
  per its documented stdout-JSON contract; wraps the process with
  `ionice`/`nice` on Linux specifically because the VPS has 1 vCPU — a
  transcription job must never starve the API's own request handling on
  the same box.
- **API** (`apps/api/src/transcription/`): a BullMQ queue + `WorkerHost`
  processor, collocated in the same PM2 process as the API for now
  (splittable into its own process later per `ARCHITECTURE.md` §10, once
  load justifies it — not needed yet). `concurrency: 1` is load-bearing,
  not a style choice: Whisper's "base" model peaks at ~700MB RSS while
  loaded on a 3.8GB box (`WHISPER_SETUP.md`) — two transcriptions at once
  risks OOM. `FilesService.confirmUpload` enqueues a job automatically for
  audio/video `SourceFile`s only (Whisper decodes a video's audio track
  natively via ffmpeg, so no separate extraction step). New endpoints:
  `GET /api/v1/files/:id/job` and `GET /api/v1/files/:id/transcript`
  (both `null`, not 404, when not applicable — "no job" is an expected
  state for a PDF, not an error).
- **Resilience**: Redis, Whisper, and storage are all optional at boot —
  same pattern as Google OAuth — so the app never crashes for lack of any
  of them; a transcription job just fails with a clear `errorMessage`
  instead.
- **apps/web**: uploading now polls `GET /files/:id/job` every 4s (10-
  minute ceiling on the *tab watching*, not the job — it keeps running
  either way) and toasts a transcript preview or the real failure reason
  when it lands, wired into the dashboard's `IntakeThreshold`.
- **Full live verification** against `https://app.transcriptioneer.online`
  and the real VPS Whisper install: generated real synthesized speech
  (`espeak-ng` + `ffmpeg`, not a silent/empty file) — confirmed
  `transcribe.py` itself works directly first (16.7s for a 6s clip), then
  drove the *actual* pipeline via `curl`: register → presign → upload →
  confirm (auto-enqueues) → `GET /job` reached `COMPLETED` → `GET
  /transcript` returned the correct real text/language/segments matching
  the direct Whisper run. Also confirmed a `text/plain` upload correctly
  gets no `ProcessingJob` at all (`GET /job` → `null`). All test
  accounts/files/storage objects cleaned up afterward — no leftover data
  in production.
- 15 new tests: `LocalWhisperProvider` (subprocess success/failure/
  malformed-output/spawn-failure/nice-ionice-wrapping), `Transcription
  Processor` (success, unconfigured provider, Whisper failure + rethrow,
  vanished `SourceFile`), and `FilesService` (job enqueued for audio, not
  for non-audio). `pnpm typecheck/lint/test` clean across the monorepo
  (except the same pre-existing, unrelated stale-copy test).
- **Not yet done:** everything past "the transcript exists in Postgres" —
  showing it anywhere in the UI beyond a toast (no `/library`-type screen
  reads real data yet, Milestone 8+), retry logic for `FAILED` jobs
  (currently a dead end until someone re-uploads), and splitting the
  worker into its own process (fine to defer until load actually demands
  it).

### Repo history note
`main` (origin) and `master` (this branch) are unrelated git histories.
`VISUAL_IDENTITY.md`, including the founder's 2026-07-29 mandatory-skeuomorphism
directive, was reconciled onto `master` from `main`'s stash early on; nothing
else from `main` was merged in.

**Update:** `main` has since had its own independent Milestone 1 rebuild
pushed to it (a separate session, unaware `master` already had Milestones
1–2 complete), plus an unrelated Figma Make export
(`Complete Transcriptioneer Application/`) with no Transcriptioneer-specific
identity (generic logo/palette, no scribe, no doorway mark). Its copy of
`VISUAL_IDENTITY.md` is also older than `master`'s, missing the mandatory
skeuomorphism section. **`master` is the authoritative Transcriptioneer
source; `main` is an outdated parallel line and must not be merged into
`master` without explicit review.** A protective tag
(`transcriptioneer-pre-unification`) marks this branch's state before any
future unification decision.

## Fully implemented

- Monorepo tooling: install, build, typecheck, lint, test, dev — all verified green (`pnpm turbo run build typecheck lint test`, 32/32 tasks, reproduced from a clean cache).
- Web app boots, API boots, `/health` endpoint, design token system, component library, Design Lab route, and now a real committed homepage at `/` (see Milestone 2.5 above).
- **`apps/web` is deployed to production** (2026-08-05) — `https://app.transcriptioneer.online` serves the real Next.js build (PM2, `pm2 save`d) with Caddy routing `/api/*`/`/health` to `apps/api` and everything else to it, same origin (needed for the auth cookies to work at all — see Milestone 3 below).
- `packageManager` pin corrected to `pnpm@9.15.9` (matches `pnpm-lock.yaml`'s `lockfileVersion: '9.0'` and the Node 20 pinned by `.nvmrc`/README) — it was previously pinned to `pnpm@11.17.0`, which requires Node ≥22.13 and fails immediately under corepack on Node 20.

## Intentionally not implemented yet

- ~~Authentication (Milestone 3) — in progress, schema only~~ — **core
  scope done and verified live end-to-end 2026-08-05**; see above
- ~~File uploads (Milestone 4)~~ — **core scope done and verified live
  end-to-end 2026-08-07**; see above
- ~~Audio transcription (Milestone 5)~~ — **core scope done and verified
  live end-to-end 2026-08-07**; see above
- AI analysis / OpenAI integration (Milestone 5/6)
- Document processing (Milestone 7)
- Knowledge library, semantic search, AI chat (Milestones 8–10)
- ~~Real product screens beyond the homepage~~ — **done 2026-08-01, ahead of schedule:** founder decision to build the full product interface now (visually finished, data placeholder) rather than a "developer dashboard" MVP. `/library`, `/library/[id]` (Summary/Transcript/Ideas/Connections tabs), `/ask` (chat + citations), `/insights` (stats + weekly chart + surfaced insights), `/connections` (SVG graph), `/projects`, `/settings` all exist as real routes with production-quality components, wired through a `lib/services/` interface layer (`libraryService`, `askService`, `insightsService`, `connectionsService`, `projectsService`) so swapping mock implementations for real API calls later doesn't require touching any page. Seed data is believable domain content, not lorem ipsum. `pnpm typecheck/lint/test` clean; verified via `next build --webpack` + `next start` (see the webpack dev-mode HMR note below — build+start was used for the same pre-existing reason).
- Mobile app (Milestone 12+)
- The rest of the knowledge-graph Prisma schema beyond auth+files (`ProcessingJob`, `Transcript`, `Document`, `KnowledgeItem`, `Chunk`, `Conversation`, `Message`, etc.) — Milestone 5+, once a feature needs each entity. `SourceFile` is done (Milestone 4, see above). The `HealthCheck` placeholder itself is already gone, replaced by the auth models (see Milestone 3 above).

## Follow-ups noted but not done in Milestone 2.5

- `favicon.ico` still reflects the old brand mark — binary asset, not
  regenerated from the new doorway SVG in this pass.
- The mobile bottom-nav center "+" affordance seen in the reference art —
  flagged as a navigation/IA decision (what does it do?), not a visual one;
  intentionally not bundled into this milestone.
- A richer, illustrated scribe (matching the reference art's linework) beyond
  `ScribeMark`'s geometric silhouette — future character-art decision.
- "Ask the scribe" / chat has no backend — out of scope until the relevant
  product milestone.

## Infrastructure verification — DONE (2026-08-01)

The long-standing "never tested against a live database" blocker is resolved.
A real VPS (Hostinger KVM 1, Ubuntu 24.04, `93.127.211.218`) was provisioned
outside the dev sandbox specifically because Docker never worked there. On
that VPS: `docker compose up -d` (hardened — Postgres/Redis/MinIO bound to
`127.0.0.1` only, firewall via `ufw` on top since Docker bypasses `ufw`'s
filter chain for published ports, real generated passwords instead of the
compose file's dev defaults), then `prisma migrate deploy` applied
`20260729231129_init_auth` for the first time ever — `User`,
`Organization`, `OrganizationMember`, `RefreshToken`, `_prisma_migrations`
tables now exist for real. `apps/api` built and run under PM2
(`pm2 startup` + `pm2 save`, survives reboot); `GET /health` now returns
`"status":"ok"`, not `"degraded"`. The app is reachable at
`app.transcriptioneer.online` (DNS `A` record added; root domain left
pointed at the existing crowdfunding landing page on shared hosting).

This VPS is now the reference environment for finishing Milestone 3 below —
the sandbox's Docker limitation (see history retained below) no longer
applies to real verification work.

**Update (2026-08-01):** local Whisper (the `base` model, CPU-only PyTorch)
was installed and validated end-to-end on this same VPS, ahead of Milestone
5 — see [`WHISPER_SETUP.md`](./WHISPER_SETUP.md) for hardware findings
(1 vCPU is the binding constraint, not RAM), the `transcribe.py`
provider-interface contract the future BullMQ worker will call, and
maintenance/troubleshooting notes. Not yet wired into `apps/api` — that's
the next real Milestone 4/5 work, including the minimal test endpoint
discussed for connecting the local prototype frontend to it.

## Known pending infrastructure verification (historical — sandbox only)

**Docker is still not usable in this development environment**, though the
specific symptom has changed since the Milestone 2.5 session (2026-07-29): at
that time `docker.io` wasn't installed at all, and installing it manually hit
a network-controller init failure (`iptables --wait -t nat -N DOCKER:
Permission denied`, then `list bridge addresses failed: Wrong sender portid
..., expected 0` with `--iptables=false` — a netlink error characteristic of
this PRoot sandbox not emulating the netfilter/netlink syscalls Docker's
bridge networking needs). As of the 2026-07-29 audit, the `docker` CLI (v29.1.3)
is now present, but `docker ps`/`docker compose up -d` fail immediately with
"Cannot connect to the Docker daemon at unix:///var/run/docker.sock" — the
daemon isn't running, and starting it wasn't attempted during a read-only
audit, so whether it would hit the same netlink limitation is untested. Net
effect is the same as before: not fixable from inside the sandbox or by
editing `docker-compose.yml`. `docker-compose.yml` (PostgreSQL + pgvector,
Redis, MinIO) and the Milestone 1 and Milestone 3 (auth) Prisma migrations
are written and believed correct, but remain **unverified end-to-end against
a live database** — this needs a real Docker-capable machine (actual dev
environment or CI), not this sandbox. This is the first thing to verify
there:

```bash
docker compose up -d
pnpm --filter @transcriptioneer/database db:migrate
pnpm --filter @transcriptioneer/database db:generate
pnpm dev
curl http://localhost:4000/health   # expect "status":"ok", not "degraded"
```

## Known technical debt

- Resolved during Milestone 2.5: the homepage's mobile breakpoint (390×844,
  Playwright/Chromium) was verified with a real live narrow-viewport
  screenshot, including scroll behavior around the fixed bottom nav — the
  earlier session's browser tooling couldn't actually resize the viewport,
  this one could. `/design-lab`'s own Responsive section, and every route
  beyond the homepage, still hasn't had the same live check.
- **Sandbox-specific, not a code issue:** Turbopack (`next dev` / `next build`
  default) fails with a `TurbopackInternalError: Invalid symlink` in this
  PRoot-based sandbox — reproducible on an unmodified checkout, unrelated to
  any application code. `next build --webpack` / `next dev --webpack` (build
  mode only; webpack dev-mode HMR hits a separate, unrelated
  `import.meta.webpackHot` loader error in this sandbox) work fine and were
  used for all verification this session. Untested whether Turbopack works
  in the actual target dev/CI environment — likely yes, since this looks like
  a PRoot syscall-emulation gap, not a real Next.js 16 regression.
- Prisma flagged a major version update available (6 → 7) during Milestone 1;
  not acted on.
- `packages/ui`'s CommonJS→ESM story (see above) is a real but non-obvious
  trap — documented in `README.md` and `ARCHITECTURE.md` §14 so it isn't
  rediscovered the hard way if a similar package is added later.

## Next milestone

```
MILESTONE 6 — AI ANALYSIS
```

Milestone 5's core scope (`ProcessingJob`/`Transcript` schema,
`LocalWhisperProvider`, BullMQ worker, dashboard polling) is done and
verified live end-to-end against production, including a real
speech-to-text run through the actual Whisper install on the VPS — see
"Milestone 5 — Audio transcription" above. Per the product roadmap
(`ARCHITECTURE.md` §6/§12): `aiAnalysisService` — a structured-output call
(OpenAI, the first real use of an `OPENAI_API_KEY` in this repo) against a
Zod-validated schema matching the `KnowledgeItem` shape (summary, topics,
tasks, decisions, etc. — ARCHITECTURE.md §4), triggered once a
`Transcript` exists, same enqueue-on-completion pattern Milestone 5 already
established. Invalid model output gets one bounded retry with the
validation error fed back before failing.

## Exact recommended first task when development resumes

1. ~~Confirm Docker is now available; run the pending infrastructure
   verification~~ — **done 2026-08-01 on the VPS**, see above.
2. Re-run `pnpm turbo run build typecheck lint test` to confirm the repo is
   still green after any environment changes since this session.
3. ~~Continue Milestone 3~~ — **done 2026-08-05**, verified live end-to-end
   against production (see above). If picking Milestone 3 back up anyway:
   Apple/Microsoft OAuth stubs (same pattern as Google) and `(dashboard)`
   route protection are the only remaining, non-blocking items.
4. ~~Start Milestone 4 (file uploads)~~ — **done 2026-08-07**, verified live
   end-to-end against production (see above). One follow-up worth doing
   whenever convenient, not blocking: have an actual human click through
   `IntakeThreshold`'s real file picker once (the automated browser tooling
   can't set `<input type="file">` programmatically — a tooling limit, not
   a code gap; the service layer underneath is fully verified via curl).
5. ~~Start Milestone 5 (audio transcription)~~ — **done 2026-08-07**,
   verified live end-to-end against the real Whisper install on the VPS
   (see above). Not blocking, worth doing eventually: retry logic for
   `FAILED` jobs, and splitting the worker into its own PM2 process once
   load justifies it.
6. Start Milestone 6 (AI analysis) per `ARCHITECTURE.md` §4/§6: get a real
   `OPENAI_API_KEY` (still unset — `.env.example` has it commented out),
   `KnowledgeItem` + related Prisma models, and `aiAnalysisService` in
   `packages/ai` triggered on `Transcript` completion.
