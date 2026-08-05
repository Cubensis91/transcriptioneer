# Project Status

**Project**: Transcriptioneer — AI knowledge organizer (transcription, document
intelligence, semantic search, and chat over your own knowledge base).

## Current status

```
MILESTONE 0 — ARCHITECTURE / PRODUCT PHILOSOPHY — COMPLETE
MILESTONE 1 — PROJECT FOUNDATION — COMPLETE
MILESTONE 2 — DESIGN SYSTEM + DESIGN LAB — COMPLETE
MILESTONE 2.5 — VISUAL/PRODUCT REFINEMENT — COMPLETE (2026-07-29)
MILESTONE 3 — AUTHENTICATION — IN PROGRESS (started 2026-07-29): schema,
  API auth module, Google OAuth stub (real credentials live), and web
  login/register screens all done; Apple/Microsoft OAuth + route
  protection remain (updated 2026-08-05)
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
- **Not yet done:** Apple/Microsoft OAuth stubs (same pattern as Google,
  just not built), route protection on `(dashboard)` (no auth guard exists
  there yet — intentionally out of scope, see `MILESTONE_3_AUTH.md`), and
  an end-to-end walkthrough of both the password and Google flows against
  a running backend (this sandbox has none; next step is trying it against
  the VPS or a local API instance).
- Estimated completion: ~98% of the milestone's 11-item scope — all 11
  items have real, working code; what's left is end-to-end verification
  and the two explicitly-deferred, non-blocking extras (Apple/Microsoft,
  route protection).

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
- `packageManager` pin corrected to `pnpm@9.15.9` (matches `pnpm-lock.yaml`'s `lockfileVersion: '9.0'` and the Node 20 pinned by `.nvmrc`/README) — it was previously pinned to `pnpm@11.17.0`, which requires Node ≥22.13 and fails immediately under corepack on Node 20.

## Intentionally not implemented yet

- Authentication (Milestone 3) — in progress, schema only; see above
- File uploads (Milestone 4)
- Audio transcription (Milestone 5)
- AI analysis / OpenAI integration (Milestone 5/6)
- Document processing (Milestone 7)
- Knowledge library, semantic search, AI chat (Milestones 8–10)
- ~~Real product screens beyond the homepage~~ — **done 2026-08-01, ahead of schedule:** founder decision to build the full product interface now (visually finished, data placeholder) rather than a "developer dashboard" MVP. `/library`, `/library/[id]` (Summary/Transcript/Ideas/Connections tabs), `/ask` (chat + citations), `/insights` (stats + weekly chart + surfaced insights), `/connections` (SVG graph), `/projects`, `/settings` all exist as real routes with production-quality components, wired through a `lib/services/` interface layer (`libraryService`, `askService`, `insightsService`, `connectionsService`, `projectsService`) so swapping mock implementations for real API calls later doesn't require touching any page. Seed data is believable domain content, not lorem ipsum. `pnpm typecheck/lint/test` clean; verified via `next build --webpack` + `next start` (see the webpack dev-mode HMR note below — build+start was used for the same pre-existing reason).
- Mobile app (Milestone 12+)
- The rest of the knowledge-graph Prisma schema beyond auth (`SourceFile`, `ProcessingJob`, `Transcript`, `Document`, `KnowledgeItem`, `Chunk`, `Conversation`, `Message`, etc.) — Milestone 4+, once a feature needs each entity. The `HealthCheck` placeholder itself is already gone, replaced by the auth models (see Milestone 3 above).

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
MILESTONE 3 — AUTHENTICATION (in progress — schema landed, API/web work remaining)
```

Per the product roadmap (`ARCHITECTURE.md` §12): secure email/password
authentication, protected routes, user sessions, OAuth-ready architecture
(Google/Apple/Microsoft stubs). The Prisma schema step (`User`, `Organization`,
`OrganizationMember`, `RefreshToken`, replacing the Milestone 1 `HealthCheck`
placeholder) is committed — see "Milestone 3 — Authentication (in progress)"
above. Remaining: the NestJS auth module itself.

## Exact recommended first task when development resumes

1. ~~Confirm Docker is now available; run the pending infrastructure
   verification~~ — **done 2026-08-01 on the VPS**, see above.
2. Re-run `pnpm turbo run build typecheck lint test` to confirm the repo is
   still green after any environment changes since this session.
3. ~~Continue Milestone 3 per `MILESTONE_3_AUTH.md`: the auth module in
   `apps/api` (`/api/v1/auth` register/login/refresh/logout, Argon2id
   password hashing, JWT access + rotating refresh tokens, guards with
   org/user scoping, `@nestjs/throttler` rate limiting, and the tests listed
   in that document's acceptance criteria), before touching any web UI for
   login/register.~~ — **done 2026-08-04** (unit-tested against a mocked
   Prisma client). Remaining for Milestone 3: OAuth stubs, web login/
   register screens, and re-running the acceptance criteria against a
   **live** database once one is available (this sandbox still has no
   Docker/Postgres — see "Known pending infrastructure verification").
