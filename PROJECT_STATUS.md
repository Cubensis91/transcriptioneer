# Project Status

**Project**: Transcriptioneer — AI knowledge organizer (transcription, document
intelligence, semantic search, and chat over your own knowledge base).

## Current status

```
MILESTONE 1 — COMPLETE
MILESTONE 2 — COMPLETE
MILESTONE 3 — NOT STARTED
```

Development is deliberately paused here, at the end of Milestone 2, per
explicit instruction. No code beyond Milestone 2 scope exists in this repo.

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
- `/design-lab` route: all 13 required sections (Brand, Typography, Buttons, Form elements, Cards, File states, AI results, Navigation, Feedback, Modals & overlays, Upload experience, Responsive, Light & dark), mock data only, `robots: noindex`.
- Light/dark mode via `next-themes`, visually verified live in a real browser (Chrome via automation): both themes, and every interactive component (Dialog, AlertDialog, Command palette, Toast, theme toggle).
- Two real bugs found and fixed during verification (not just cosmetic — see `ARCHITECTURE.md` §13–14 for full detail):
  1. `Button`'s `asChild` (Radix `Slot`) broke when a hidden loading-spinner slot was rendered alongside a single child.
  2. `packages/ui` had to be switched from CommonJS to ESM output — TypeScript's forced `"use strict"` prologue was shadowing `"use client"` directives, silently breaking every client component in the package under Next.js's static generation.

## Fully implemented

- Monorepo tooling: install, build, typecheck, lint, test, dev — all verified green (`pnpm turbo run build typecheck lint test`, 32/32 tasks, reproduced from a clean cache).
- Web app boots, API boots, `/health` endpoint, design token system, component library, Design Lab route.

## Intentionally not implemented yet

- Authentication (Milestone 3)
- File uploads (Milestone 4)
- Audio transcription (Milestone 5)
- AI analysis / OpenAI integration (Milestone 5/6)
- Document processing (Milestone 7)
- Knowledge library, semantic search, AI chat (Milestones 8–10)
- Real product screens (dashboard, upload flow, document viewer) — only the Design Lab exists as a UI surface so far
- Mobile app (Milestone 12+)
- The full knowledge-graph Prisma schema (`packages/database` still has only the placeholder `HealthCheck` model)

## Known pending infrastructure verification

**Docker is unavailable in this development environment.** `docker-compose.yml`
(PostgreSQL + pgvector, Redis, MinIO) and the first Prisma migration are
written and believed correct, but have **not** been run end-to-end against a
live database in this session. This is the first thing to verify in a
Docker-capable environment:

```bash
docker compose up -d
pnpm --filter @transcriptioneer/database db:migrate
pnpm --filter @transcriptioneer/database db:generate
pnpm dev
curl http://localhost:4000/health   # expect "status":"ok", not "degraded"
```

## Known technical debt

- Mobile/tablet responsive breakpoints were verified by code review of
  Tailwind responsive utilities, not a live narrow-viewport screenshot — this
  session's browser-automation tooling could not actually change the
  rendered viewport size (resize calls reported success but the viewport
  never changed across repeated attempts). Worth a manual check in a real
  browser or a working device-emulation environment.
- Prisma flagged a major version update available (6 → 7) during Milestone 1;
  not acted on.
- `packages/ui`'s CommonJS→ESM story (see above) is a real but non-obvious
  trap — documented in `README.md` and `ARCHITECTURE.md` §14 so it isn't
  rediscovered the hard way if a similar package is added later.

## Next milestone

```
MILESTONE 3 — AUTHENTICATION
```

Per the product roadmap (`ARCHITECTURE.md` §12): secure email/password
authentication, protected routes, user sessions, OAuth-ready architecture
(Google/Apple/Microsoft stubs). This is also where the real Prisma schema
begins replacing the Milestone 1 `HealthCheck` placeholder — `User`,
`Organization`, `OrganizationMember` are the natural first models, since
every later entity (files, transcripts, knowledge items) is scoped to a user
and/or organization.

## Exact recommended first task when development resumes

1. Confirm Docker is now available; run the pending infrastructure
   verification above (migrate, generate, confirm `/health` reports `"ok"`).
2. Re-run `pnpm turbo run build typecheck lint test` to confirm the repo is
   still green after any environment changes since this session.
3. Only then start Milestone 3: design the `User`/`Organization`/
   `OrganizationMember` Prisma models, then the auth module in `apps/api`
   (password hashing, JWT access + refresh tokens, guards), before touching
   any web UI for login/register.
