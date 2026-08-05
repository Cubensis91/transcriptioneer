# Milestone 3 — Authentication

Status: **in progress, started 2026-07-29.** Item 1 (Prisma schema) is
committed (`f9a3c55`, "Milestone 3: real Prisma schema") — see
`PROJECT_STATUS.md`'s "Milestone 3 — Authentication (in progress)" for the
full detail, including what's still missing (the migration hasn't been
applied to a live database yet).

**Update 2026-08-04:** items 2–10 (the `/api/v1/auth` module itself —
register/login/refresh/logout, Argon2id hashing, JWT+rotating-refresh
sessions, guards with repository-layer org scoping, rate limiting,
validation, and tests) are implemented in `apps/api/src/auth/` and
unit-tested against a mocked Prisma client. **Update 2026-08-05:** deployed
to the production VPS and live-verified against the real database (see
"Live verification" under Acceptance criteria below) — 2026-08-04's
email+password work is now fully done end-to-end.

**Update 2026-08-05 (later the same day): Google OAuth stub added.**
`GoogleStrategy` (Passport, `passport-google-oauth20`) and
`AuthService.loginOrRegisterWithOAuth` are implemented — `GET
/api/v1/auth/google` and `GET /api/v1/auth/google/callback`. The strategy is
only registered as a Nest provider when `GOOGLE_CLIENT_ID`/
`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL` are all set; without them the
app still boots cleanly and both routes return `501 Not Implemented`
(`GoogleAuthGuard` checks this itself, rather than letting Passport fail on
an unregistered strategy). No real Google OAuth app has been registered yet
— see "Deferred" below — so this cannot be end-to-end tested against the
real Google consent screen, only unit-tested (account creation, repeat
sign-in returns the same account, linking to an existing password account by
email). Required a new Prisma model (`OAuthAccount`, generic across
providers) and migration (`20260805023729_add_oauth_accounts`), generated
offline the same way as the original auth migration and confirmed against
the live VPS database. Apple/Microsoft strategies are **not** built —
same pattern, not done yet; do them the same way once needed.

**Not yet done:** item 11 (web screens, sequenced last per this document's
own ordering), Apple/Microsoft OAuth strategies, and real Google OAuth
credentials (see "Deferred"). `ARCHITECTURE.md` §4 (entities), §5 (API
routes), and §7 (security model) remain the technical spec for *what* to
build; this document is the concrete, sign-off-able scope for *this*
milestone specifically — same role `MILESTONE_1_REBUILD.md` played for
Milestone 1.

This is where the real knowledge-graph Prisma schema begins replacing the
Milestone 1 `HealthCheck` placeholder (its own comment in `schema.prisma`
already says "superseded once real domain models land") — `User`,
`Organization`, `OrganizationMember` are the natural first models, since
every later entity (files, transcripts, knowledge items) is scoped to a user
and/or organization per §7.

## In scope

1. **Prisma schema** — `User`, `Organization`, `OrganizationMember` (role
   enum: `OWNER`/`ADMIN`/`MEMBER`), replacing `HealthCheck`. **Done:** schema
   and migration (`20260729231129_init_auth`) are committed; `RefreshToken`
   was added too (not originally listed here, but needed for item 4's
   rotating-refresh-token session model). **Not yet done:** the migration
   was generated offline (`prisma migrate diff --from-empty
   --to-schema-datamodel`, no live Postgres in this sandbox) and still needs
   to be applied for real (`prisma migrate deploy`) against a live database
   once Docker is available — this hasn't happened yet, so `GET /health`'s DB
   check (`health.service.ts`, raw `SELECT 1`, unaffected either way) hasn't
   been re-confirmed against the migrated schema.
2. **`/api/v1/auth`** (per §5): `register`, `login`, `refresh`, `logout`.
   **Done** (`apps/api/src/auth/auth.controller.ts` + `auth.service.ts`,
   2026-08-04): all four endpoints implemented, tokens delivered as
   httpOnly cookies (never in the JSON body), plus `GET /auth/me` and
   `GET /auth/organizations/:id` (the latter added specifically to prove
   item 5's scoping). OAuth callback **stub for Google done** (2026-08-05):
   `GET /auth/google` + `GET /auth/google/callback`, strategy registered
   only when real credentials are configured (501 otherwise) — see the
   2026-08-05 update above. **Apple/Microsoft stubs not yet built** — same
   pattern, do them the same way once needed.
3. **Password hashing** — Argon2id (§7). **Done** — `argon2.hash(...,
   { type: argon2.argon2id })` in `AuthService.register`.
4. **Sessions** — short-lived JWT access token + rotating refresh token,
   httpOnly+secure cookie on web (mobile secure storage is Milestone 12+,
   not relevant yet). **Done**: access token is a signed JWT (separate
   secret from refresh, §7's separation-of-secrets rationale); refresh
   token is an opaque random value, stored only as a SHA-256 hash
   (`RefreshToken.tokenHash`) — never the raw value. Rotation-with-reuse-
   detection is implemented: presenting an already-rotated (or logged-out)
   refresh token revokes every live token for that user, not just the one
   presented.
5. **Guards + org/user scoping** — a Nest guard protecting authenticated
   routes; every query scoped by `organizationId`/`userId` enforced at the
   repository layer. **Done**: `JwtAuthGuard` (Passport JWT strategy reading
   the `access_token` cookie, Bearer header as fallback) rejects
   unauthenticated requests; `AuthService.getOrganizationForUser` scopes its
   Prisma query itself (`members: { some: { userId } }`), not a
   fetch-then-check, so a non-member's request can't distinguish "wrong org"
   from "not found." A dedicated Prisma-middleware double-check (the
   belt-and-suspenders half of this item) is not yet added — there's only
   one org-scoped read so far; revisit once Milestone 4+ adds real
   org-scoped resources.
6. **Rate limiting** — `@nestjs/throttler` specifically on the auth
   endpoints (register/login/refresh), per §7. **Done** — global default
   100 req/min (`ThrottlerModule.forRoot` in `app.module.ts`), overridden to
   5 req/min on `register`/`login`/`refresh` via `@Throttle`.
7. **Validation** — Zod/class-validator at every auth controller boundary.
   **Done** via a small `ZodValidationPipe` wrapping the existing
   `packages/validation` schemas.
8. **`packages/validation`** — shared register/login Zod schemas, consumed
   by both `apps/api` and the web forms below. Schemas already existed
   (see item 9's note in `PROJECT_STATUS.md`); now actually **consumed** by
   `apps/api`'s auth controller for the first time.
9. **`packages/types`** — shared types for `User`/`Organization`/session/JWT
   payload shapes, matching the OpenAPI contract per §5. Types already
   existed; now actually **consumed** by `AuthService`/`AuthController`.
10. **Tests** — auth service (hashing, token issuance/refresh/rotation),
    guard behavior (protected vs. public routes), and cross-org access
    rejection (not just present in code — a test that actually proves it).
    **Done, against a mocked Prisma client** — no live Postgres in this
    sandbox (same constraint as item 1's migration), so these are unit/
    integration tests, not run against a real database yet:
    `auth.service.spec.ts` (register incl. duplicate-email rejection, login
    incl. same error message for wrong-password vs. nonexistent-email,
    refresh rotation, reuse-detection revoking the whole chain, logout,
    cross-org rejection) and `auth.security.spec.ts` (real HTTP via
    supertest: guard rejects missing/invalid token and accepts a valid one;
    rate limiting actually returns 429 on the 6th rapid request). 17/17
    passing; `pnpm turbo run typecheck lint test` green for `apps/api`.
11. **Web login/register/OAuth-callback screens** (`apps/web`), built with
    the already-committed `packages/ui` library and `VISUAL_IDENTITY.md`'s
    tactile/skeuomorphic direction — sequenced **last**, after items 1–10
    are complete and passing, per `PROJECT_STATUS.md`'s existing "before
    touching any web UI for login/register" ordering.

## Explicitly out of scope

- Apple/Microsoft OAuth callback stubs (strategy-pattern scaffolding, no
  real credentials) — Google's stub (2026-08-05) established the pattern;
  Apple/Microsoft are the same shape of work, just not done yet.
- Real OAuth provider integration (actual Google/Apple/Microsoft client
  IDs/secrets and end-to-end flows) — stubs/scaffolding only this milestone;
  see "Deferred" below for why.
- File uploads, transcription, AI analysis, document processing, library,
  search, chat (Milestones 4–10).
- Upload-flow and document-viewer screens — still not built.
- ~~Dashboard screen — the `(dashboard)` route currently sitting uncommitted
  in the working tree stays uncommitted until this milestone (auth) is
  actually done and merged~~ — **superseded by the same 2026-07-29 founder
  directive noted in `MILESTONE_2.5_VISUAL_REFINEMENT.md`'s Addendum**: the
  homepage was committed as part of Milestone 2.5 instead of waiting for
  auth, still rendering against `lib/mock-data.ts` with no backend/auth
  wiring. It exists now; this milestone doesn't need to (re)build it, only
  wire real auth-gated data into it later, if that's ever in scope.
- The rest of the knowledge-graph schema (`SourceFile`, `ProcessingJob`,
  `Transcript`, `Document`, `KnowledgeItem`, `Chunk`, `Conversation`,
  `Message`, etc.) — Milestone 4+, once there's a feature that needs them.
- Mobile app (Milestone 12+).

## Acceptance criteria

- [x] `pnpm --filter @transcriptioneer/database db:generate` succeeds
      (verified 2026-07-29).
- [x] Prisma migration applies cleanly against a **live** database
      (`User`/`Organization`/`OrganizationMember` created, `HealthCheck`
      removed). Already true as of the 2026-08-01 infrastructure
      verification (`PROJECT_STATUS.md`) — re-confirmed 2026-08-05:
      `prisma migrate deploy` reported "No pending migrations to apply,"
      and `\dt` on the live Postgres shows `User`/`Organization`/
      `OrganizationMember`/`RefreshToken`/`_prisma_migrations`.
- [x] `POST /api/v1/auth/register` creates `User` + `Organization` +
      `OrganizationMember` (role `OWNER`) in one transaction; duplicate
      email rejected with a clear, non-leaky error. Verified twice: unit
      tests against a mocked Prisma client, and live via `curl` against the
      real VPS database (2026-08-05) — row created, then deleted as
      cleanup (this was a manual smoke test, not seed data).
- [x] `POST /api/v1/auth/login` returns access + refresh tokens for valid
      credentials; rejects invalid credentials without revealing which
      field was wrong. Live-verified: correct login succeeded, wrong
      password returned 401.
- [x] `POST /api/v1/auth/refresh` rotates the refresh token (old one
      invalidated) and issues a new access token. Reuse of a rotated token
      additionally revokes the whole chain (reuse/theft detection). Live-
      verified for the base rotation case; reuse-detection verified only
      in the mocked unit test so far, not against the live DB.
- [x] `POST /api/v1/auth/logout` invalidates the refresh token. Live-
      verified: refresh after logout returned 401.
- [x] A protected route confirms the guard rejects unauthenticated requests
      and accepts valid ones. Live-verified: `GET /me` returned 200 with a
      valid cookie, 401 with none.
- [x] A test proves cross-org access is actually rejected at the repository
      layer, not just configured. Live-verified: a second registered user
      (different org) got 403 from `GET /organizations/:id` on the first
      user's org.
- [x] A test proves rate limiting actually triggers on repeated auth
      requests, not just configured. `auth.security.spec.ts` fires 6 rapid
      requests at `/login` (limit 5/min) and asserts a 429 appears
      (unit-tested only; not re-verified live to avoid hammering
      production).
- [x] `GET /health` still returns correctly after the migration (raw
      `SELECT 1`, unaffected by schema changes). Confirmed live:
      `{"status":"ok",...}`.
- [x] `pnpm turbo run typecheck lint test` green, full monorepo — for
      `apps/api` specifically; **note:** `@transcriptioneer/web`'s own test
      suite currently fails independently of this work (`(dashboard)/
      page.test.tsx` expects English copy, the app was translated to
      Spanish in the prior session) — confirmed pre-existing via `git
      stash`, unrelated to auth. `build` not re-run in the sandbox this
      session (no Turbopack fix applied there), but the VPS's own
      `nest build` for `apps/api` succeeded cleanly as part of deployment.
- [ ] Web login/register screens work against the real API (not mocked),
      styled per the committed design system.

### Live verification (2026-08-05, on the production VPS)

Deployed to `93.127.211.218` (`app.transcriptioneer.online`): pushed
`4f62e25` to `origin/master`, pulled on the VPS, `pnpm install` (argon2
compiled natively without issue), added `JWT_ACCESS_SECRET`/
`JWT_REFRESH_SECRET`/TTL vars to `apps/api/.env`, rebuilt (`nest build`),
restarted the `transcriptioneer-api` PM2 process. Exercised the full flow
with `curl` against the real API + real Postgres (not mocks): register →
`/me` → login → wrong-password rejection → refresh (rotation) → logout →
refresh-after-logout rejection → unauthenticated `/me` rejection →
cross-org 403. All behaved as expected. Test rows (2 users, 2 orgs) were
deleted afterward — production database has no leftover test data.

### Deferred (environment- or account-blocked, not code-blocked)

- **Docker is still unavailable in this sandbox** (same unresolved
  constraint carried from Milestone 1/2). The migration above must be run
  and verified against a live Postgres in a Docker-capable environment
  before this milestone can be marked closed.
- ~~**Real OAuth provider credentials**~~ — **done for Google, 2026-08-05.**
  A real OAuth client was registered at console.cloud.google.com (consent
  screen in "Testing" mode — only emails added as test users can sign in
  until it's published) with redirect URI
  `https://app.transcriptioneer.online/api/v1/auth/google/callback`.
  Deployed the client ID/secret to the VPS `.env` and confirmed
  `GET /api/v1/auth/google` now returns a real `302` to
  `accounts.google.com` with the correct `client_id`/`redirect_uri` —
  not yet walked through the full consent-screen-to-callback flow with a
  real browser session (that's the next thing to try). Apple/Microsoft
  remain deferred — no strategies built for them yet.

**Bug found and fixed during this deploy (2026-08-05):** `AuthModule` was
deciding whether to register `GoogleStrategy` by reading `process.env`
directly at module-file-evaluation time — but `auth.module.ts` is required
(via `AppModule`'s own import chain) *before* `ConfigModule.forRoot()`
(also inside `AppModule`) actually loads `.env`, so the check always saw
`undefined` regardless of real configuration, and `GET /google` failed with
`Unknown authentication strategy "google"` even with correct credentials
set. Fixed by always registering `GoogleStrategy` (with inert placeholder
values when unconfigured) and moving the actual configuration check into
`GoogleAuthGuard`, which runs at request time via `ConfigService` — after
Nest has genuinely finished loading config. Worth remembering for any
future conditionally-registered Nest provider: module-file-level
`process.env` checks run earlier than you'd expect.
