# Milestone 3 — Authentication

Status: **in progress, started 2026-07-29.** Item 1 below (Prisma schema) is
committed (`f9a3c55`, "Milestone 3: real Prisma schema") — see
`PROJECT_STATUS.md`'s "Milestone 3 — Authentication (in progress)" for the
full detail, including what's still missing (the migration hasn't been
applied to a live database yet). Items 2–11 — the actual `/api/v1/auth`
module, hashing, sessions, guards, rate limiting, validation wiring, tests,
and web screens — have not been started. `ARCHITECTURE.md` §4 (entities), §5
(API routes), and §7 (security model) remain the technical spec for *what* to
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
2. **`/api/v1/auth`** (per §5): `register`, `login`, `refresh`, `logout`,
   plus OAuth callback **stubs** for Google/Apple/Microsoft (strategy
   pattern via Passport, wired but not requiring real provider credentials
   yet — see "Deferred" below).
3. **Password hashing** — Argon2id (§7).
4. **Sessions** — short-lived JWT access token + rotating refresh token,
   httpOnly+secure cookie on web (mobile secure storage is Milestone 12+,
   not relevant yet).
5. **Guards + org/user scoping** — a Nest guard protecting authenticated
   routes; every query scoped by `organizationId`/`userId` enforced at the
   repository layer (guard + Prisma middleware double-check per §7), not
   left to controller-level discipline.
6. **Rate limiting** — `@nestjs/throttler` specifically on the auth
   endpoints (register/login/refresh), per §7.
7. **Validation** — Zod/class-validator at every auth controller boundary.
8. **`packages/validation`** — shared register/login Zod schemas, consumed
   by both `apps/api` and the web forms below.
9. **`packages/types`** — shared types for `User`/`Organization`/session/JWT
   payload shapes, matching the OpenAPI contract per §5.
10. **Tests** — auth service (hashing, token issuance/refresh/rotation),
    guard behavior (protected vs. public routes), and cross-org access
    rejection (not just present in code — a test that actually proves it).
11. **Web login/register/OAuth-callback screens** (`apps/web`), built with
    the already-committed `packages/ui` library and `VISUAL_IDENTITY.md`'s
    tactile/skeuomorphic direction — sequenced **last**, after items 1–10
    are complete and passing, per `PROJECT_STATUS.md`'s existing "before
    touching any web UI for login/register" ordering.

## Explicitly out of scope

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
- [ ] Prisma migration applies cleanly against a **live** database
      (`User`/`Organization`/`OrganizationMember` created, `HealthCheck`
      removed) — not yet run; no live Postgres available in this sandbox.
- [ ] `POST /api/v1/auth/register` creates `User` + `Organization` +
      `OrganizationMember` (role `OWNER`) in one transaction; duplicate
      email rejected with a clear, non-leaky error.
- [ ] `POST /api/v1/auth/login` returns access + refresh tokens for valid
      credentials; rejects invalid credentials without revealing which
      field was wrong.
- [ ] `POST /api/v1/auth/refresh` rotates the refresh token (old one
      invalidated) and issues a new access token.
- [ ] `POST /api/v1/auth/logout` invalidates the refresh token.
- [ ] A protected route confirms the guard rejects unauthenticated requests
      and accepts valid ones.
- [ ] A test proves cross-org access is actually rejected at the repository
      layer, not just configured.
- [ ] A test proves rate limiting actually triggers on repeated auth
      requests, not just configured.
- [ ] `GET /health` still returns correctly after the migration (raw
      `SELECT 1`, unaffected by schema changes — confirm, don't assume).
- [ ] `pnpm turbo run build typecheck lint test` green, full monorepo,
      clean Turbo cache.
- [ ] Web login/register screens work against the real API (not mocked),
      styled per the committed design system.

### Deferred (environment- or account-blocked, not code-blocked)

- **Docker is still unavailable in this sandbox** (same unresolved
  constraint carried from Milestone 1/2). The migration above must be run
  and verified against a live Postgres in a Docker-capable environment
  before this milestone can be marked closed.
- **Real OAuth provider credentials** — registering actual Google/Apple/
  Microsoft OAuth apps requires a real (or at least stable staging) callback
  URL and provider-side account setup, which isn't a coding task and doesn't
  block writing the strategy-pattern scaffolding now. Wire real credentials
  once there's a URL worth registering.
