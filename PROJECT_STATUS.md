# Project Status

**Project**: Transcriptioneer — AI knowledge organizer (transcription, document
intelligence, semantic search, and chat over your own knowledge base).

## Current status

```
MILESTONE 0 — ARCHITECTURE / PRODUCT PHILOSOPHY — COMPLETE
MILESTONE 1 — PROJECT FOUNDATION — COMPLETE
MILESTONE 2 — DESIGN SYSTEM + DESIGN LAB — COMPLETE
MILESTONE 2.5 — VISUAL/PRODUCT REFINEMENT — PROPOSED, NOT STARTED
MILESTONE 3 — AUTHENTICATION — NOT STARTED
```

Development is deliberately paused here, at the end of Milestone 2, per
explicit instruction. No code beyond Milestone 2 scope exists in this repo.
A visual/product gap analysis (comparing the live app and `/design-lab`
against `VISUAL_IDENTITY.md` and the reference art) proposed a Milestone 2.5
refinement — brand mark, scribe placement, light/dark-cosmic direction,
tactile consistency — which is awaiting founder review before Milestone 3
begins. `MILESTONE_3_AUTH.md` (scope proposal, also awaiting sign-off) exists
in the repo but no Milestone 3 code has been written.

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
- Web app boots, API boots, `/health` endpoint, design token system, component library, Design Lab route.
- `packageManager` pin corrected to `pnpm@9.15.9` (matches `pnpm-lock.yaml`'s `lockfileVersion: '9.0'` and the Node 20 pinned by `.nvmrc`/README) — it was previously pinned to `pnpm@11.17.0`, which requires Node ≥22.13 and fails immediately under corepack on Node 20.

## Intentionally not implemented yet

- Authentication (Milestone 3)
- File uploads (Milestone 4)
- Audio transcription (Milestone 5)
- AI analysis / OpenAI integration (Milestone 5/6)
- Document processing (Milestone 7)
- Knowledge library, semantic search, AI chat (Milestones 8–10)
- Real product screens (dashboard, upload flow, document viewer) — the new Milestone 2 components above are only wired into `/design-lab` so far. A real `(dashboard)` route exists in the working tree but is **deliberately uncommitted**, held back until Milestone 3 (auth) lands — see "Deferred work" below.
- Mobile app (Milestone 12+)
- The full knowledge-graph Prisma schema (`packages/database` still has only the placeholder `HealthCheck` model)

## Deferred work (uncommitted in the working tree, on purpose)

`apps/web/src/app/(dashboard)/page.tsx`, `layout.tsx`, `page.test.tsx`, and the
`nav-items.ts` change pointing "Dashboard" at `/` wire the new Milestone 2
components into a real, navigable home screen. That crosses the "real product
screens" line this document reserves for post-auth milestones, and
`ARCHITECTURE.md` §12 expects each milestone committed before the next begins.
These files are left as-is in the working tree — nothing discarded — to be
committed once Milestone 3 actually lands, not before.

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
MILESTONE 2.5 — VISUAL/PRODUCT REFINEMENT (proposed, awaiting founder review)
MILESTONE 3 — AUTHENTICATION (not started, not next until 2.5 is resolved)
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
