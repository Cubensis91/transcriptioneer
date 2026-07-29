# Transcriptioneer — Architecture (Milestone 0)

Status: proposal, approved. Milestone 1 (project foundation) and Milestone 2
(design system) are implemented — see §13 for where the real build diverged
from this proposal, and §14 for Milestone 2 specifics.

This document is authoritative for *how* the system is built. For *what it's
for and how it should feel* — the product philosophy governing every feature,
UX decision, and AI behavior from Milestone 3 onward — see
[`PRODUCT_PHILOSOPHY.md`](./PRODUCT_PHILOSOPHY.md).

## 1. What this product actually is

An AI knowledge organizer. Users feed it audio and documents; it turns them into
structured, searchable, conversable knowledge. The transcription/analysis step is
the intake mechanism, not the product — the product is the knowledge base and the
ability to query it. Every architectural decision below is made in service of that:
data has to be modeled so it composes across documents (people, projects, tasks,
dates are entities, not just tags), and retrieval has to be real (embeddings +
vector search), not a keyword-search relabeled as "AI search."

## 2. Technology choices (with reasons, not just names)

| Layer | Choice | Why |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Caching + task graph for a multi-app repo; pnpm is fast and strict about phantom deps, which matters once `packages/ai` must never leak into the web bundle. |
| Web | Next.js 14 (App Router) | Server components for the document/library views (data-heavy, SEO-irrelevant but perf-relevant), route handlers double as a thin BFF if ever needed. |
| Backend | NestJS (TypeScript) | The spec's own module list (Auth, Users, Files, Transcription, AI Analysis, Knowledge, Search, Chat, Billing, Admin) *is* a Nest module list. Nest gives DI, guards, interceptors, and a queue integration story for free — a plain Express app would just reinvent this. |
| DB | PostgreSQL + `pgvector` | One database for relational knowledge graph (people/orgs/tasks/decisions) *and* embeddings. Avoids standing up a second vector DB before there's evidence Postgres can't keep up (it comfortably handles this at single-tenant/small-team scale). Migration path to a dedicated vector store (Qdrant/Pinecone) stays open if retrieval quality or scale demands it later — isolated behind `retrievalService`.
| ORM | Prisma | Typed schema, real migrations, good Postgres support. `pgvector` needs a thin raw-SQL escape hatch for similarity queries (Prisma doesn't model vector ops natively) — isolated in `retrievalService`.
| Queue | BullMQ + Redis | The processing pipeline (upload → transcribe → analyze → embed → index) is fundamentally an async job chain. BullMQ gives retries, backoff, and per-stage status for free — matches the "every step must have a status" requirement directly. |
| File storage | S3-compatible, behind a `StorageDriver` interface | Local disk driver for dev, S3/R2/Spaces in prod, swappable without touching application code. Signed URLs for private file access. |
| AI | OpenAI SDK, isolated in `packages/ai` | Whisper/`gpt-4o-transcribe` for audio, `text-embedding-3-large` for embeddings, structured outputs (JSON schema mode) for analysis. Never imported outside the backend. |
| API style | REST, versioned `/api/v1` | Three clients (web, Android, iOS) with no shared JS runtime — REST + OpenAPI-generated types is the lowest-friction contract across all three. tRPC was considered and rejected: it only pays off when every client shares the TS runtime, which mobile doesn't in the same way. |
| Web UI | Tailwind + Radix primitives (shadcn-style) | Accessibility and keyboard/focus handling comes largely free from Radix; Tailwind + tokens keeps the "premium, not generic dashboard" visual system centralized in `packages/ui`. |
| Mobile | React Native + Expo | Explicitly requested; shares `packages/types` and the API client with web. |
| Deployment | Docker images for API + worker; Vercel for web; any container host for API/worker/Postgres/Redis | Cloud-agnostic on purpose — nothing here is AWS/Vercel-locked except the web app's hosting convenience. |

## 3. Monorepo layout

```
transcriptioneer/
  apps/
    web/          Next.js app
    api/          NestJS backend (HTTP API + BullMQ workers in-process to start;
                   split into a separate worker deployment once load requires it)
    mobile/       Expo app (Milestone 12+)
  packages/
    types/        Shared TS types + Zod schemas (API contracts, AI output schema)
    ui/            Design system: tokens, primitives, components (web-first;
                   tokens shared conceptually with mobile, components are not)
    ai/            transcriptionService, documentExtractionService, aiAnalysisService,
                   embeddingsService, retrievalService, chatService — backend-only
    config/        eslint, tsconfig, tailwind presets shared across apps
    validation/    Zod schemas shared by API request validation and web forms
  ARCHITECTURE.md
  .env.example
```

`packages/ai` has one rule enforced by lint/CI, not just convention: it must never
appear in `apps/web`'s or `apps/mobile`'s dependency graph. That's the "never
expose API keys to the browser" requirement made structural rather than aspirational.

## 4. Database schema (conceptual entities)

Core knowledge graph, not just file storage:

- **User**, **Organization**, **OrganizationMember** (role) — multi-tenant from day one, even before teams ship, so data isolation isn't retrofitted.
- **Project** — optional grouping users assign files to.
- **SourceFile** — the uploaded artifact (audio or document): storage key, mime type, size, checksum, status.
- **ProcessingJob** — one per SourceFile per pipeline run: current stage, status enum (`uploaded|validating|queued|processing|extracting|transcribing|analyzing|indexing|completed|failed`), error payload, retry count.
- **Transcript** — raw + cleaned text, timestamps/speaker segments (JSON) when available.
- **Document** — extracted text + structure (headings/paragraphs/tables as JSON) for non-audio sources.
- **KnowledgeItem** — the structured AI output, one per SourceFile: title, summary, detailedSummary, plus arrays modeled as related rows (not JSON blobs) for the entities that need to be queried across documents:
  - **Topic**, **Keyword**, **Tag** (many-to-many via join tables, shared/reusable across the org so "everything about Project X" is a real query)
  - **Person**, **Organization** (entity), **Location** — extracted mentions, deduplicated per-org so "what did Juan say" resolves across documents
  - **EventDate** — extracted dates
  - **Decision**, **Task** (status: open/done, optional assignee), **Question**, **OpenIssue**, **Fact**, **Quote**
- **Chunk** — normalized content chunks used for retrieval, each with an `embedding vector` column (pgvector), source pointer (SourceFile + char range) for citations.
- **Conversation**, **Message** — AI chat history; each assistant Message stores its source Chunk references for citation.

Everything above is created via Prisma migrations; no structure is inferred or
hardcoded in application code.

## 5. API architecture

- `/api/v1/auth` — register, login, refresh, logout, OAuth callback stubs (Google/Apple/Microsoft wired later, architecture ready now: strategy pattern via Passport).
- `/api/v1/files` — upload (presigned URL flow), list, get, delete.
- `/api/v1/jobs` — processing status polling (also pushed via SSE/WebSocket for live status — polling as the guaranteed fallback).
- `/api/v1/knowledge` — structured results per file: summary, entities, tasks, decisions, etc.
- `/api/v1/library` — search/filter/sort across the knowledge base (structured filters: tags, dates, projects, file type).
- `/api/v1/search` — semantic search endpoint (embeddings + pgvector).
- `/api/v1/chat` — conversations + messages, RAG pipeline.
- `/api/v1/admin` — org/user management (later milestone).

OpenAPI spec generated from Nest decorators; `packages/types` types are generated
from it so mobile and web consume the same contract without hand-copying.

## 6. AI pipeline (as an explicit job state machine)

```
uploaded → validating → queued → processing → (extracting | transcribing)
  → analyzing → indexing → completed
                     ↘ failed (at any stage, preserved with error + retry)
```

Implementation: one BullMQ queue per pipeline (`audio-pipeline`, `document-pipeline`),
each job updates `ProcessingJob.status` and emits an event the API relays to the
client (SSE). Stage services:

- `transcriptionService` — OpenAI transcription, preserves timestamps/speaker segments when the model returns them; never fabricates speaker identity.
- `documentExtractionService` — format-specific extractors (pdf-parse, mammoth for docx, plain read for txt/md) behind a common `Extractor` interface so new formats are additive.
- `aiAnalysisService` — single structured-output call (or chained calls if token limits require chunking) against a Zod-validated JSON schema matching the KnowledgeItem shape. Invalid output → one bounded retry with the validation error fed back to the model → else `failed` with the raw output preserved for debugging.
- `embeddingsService` — chunks normalized content, embeds each chunk, writes to `Chunk`.
- `retrievalService` — pgvector cosine-similarity query, org-scoped.
- `chatService` — query embedding → retrieval → context assembly → LLM call with citation-forcing prompt → response with source Chunk references. If retrieval returns nothing relevant, the model is instructed to say so rather than answer from parametric knowledge.

## 7. Security model

- Passwords: Argon2id. Sessions: short-lived JWT access token + rotating refresh token, httpOnly+secure cookie on web, secure storage (Keychain/Keystore) on mobile.
- Every query scoped by `organizationId`/`userId` at the repository layer (Nest guard + Prisma middleware double-check), not left to controller-level discipline.
- File access only via short-lived signed URLs, never public bucket ACLs.
- Rate limiting via `@nestjs/throttler` on auth and upload endpoints specifically.
- Input validation with Zod/class-validator at every controller boundary; file validation checks real mime/magic bytes, not just extension.
- Secrets via env vars, `.env.example` documents every required key, nothing OpenAI-related ships to a client bundle (enforced structurally per §3).

## 8. Web UX architecture

Landing (marketing) → Auth → Dashboard (recent activity, quick upload, stats) →
Upload (drag-drop, per-file progress + stage) → Document detail (tabs: transcript,
summary, entities, tasks) → Library (search/filter/grid/list) → Chat (RAG, source
citations linking back to Document detail). Design system built once in
`packages/ui` with light/dark tokens, then every screen consumes it — no
screen-local styling decisions.

## 9. Mobile UX architecture

Shares `packages/types` and the generated API client with web; no duplicated
business logic. Headline feature: Instant Voice Capture — one prominent record
button, tap-to-stop, background upload, push notification when analysis
completes. Bottom nav + FAB, native gestures, haptics — designed mobile-first,
not a shrunk web view.

## 10. Deployment strategy

- Web → Vercel (native Next.js fit).
- API + worker → Docker image, deployable to any container host (Railway/Fly/Render/self-hosted); worker split into its own process once queue load justifies it.
- Postgres (with pgvector) + Redis → managed instances, provider-agnostic.
- Object storage → S3-compatible (AWS S3 or Cloudflare R2), swappable via the `StorageDriver` interface.
- Three environments: development (local Docker Compose: Postgres+pgvector, Redis, MinIO for S3-compatible local storage), staging, production. Same Docker image promoted across environments, config via env vars only.

## 11. Key technical risks

1. **AI output reliability** — structured-output drift or hallucinated entities. Mitigated by Zod schema validation + bounded retry + preserving raw output on failure; never rendering unvalidated AI JSON directly in UI.
2. **Transcription cost/latency at scale** — long audio files are slow and costly. Mitigated by chunked processing + async job status rather than synchronous waits.
3. **Retrieval quality** — the whole "second brain" pitch collapses if semantic search is mediocre. Mitigated by keeping `retrievalService` behind an interface so pgvector can be swapped for a dedicated vector DB without touching callers, if evaluation shows it's needed.
4. **Multi-tenant data isolation** — the highest-consequence bug class for this product (leaking one user's transcripts to another). Mitigated by scoping enforced at the repository layer, not just controllers, plus test coverage specifically for cross-tenant access attempts.
5. **Speaker diarization** — OpenAI's transcription API support for this is inconsistent; architecture treats speaker labels as optional/nullable data from day one so the schema doesn't need to change when diarization quality improves.

## 12. Roadmap

Milestones 1–17 as specified in the product brief (foundation → design system →
auth → upload → transcription → AI analysis → document processing → library →
semantic search → chat → web polish → mobile foundation/core/voice/polish →
production readiness → release prep). Each milestone: implemented, tested,
type-checked, linted, built, and committed before the next begins.

## 13. Implementation notes (Milestone 1)

Where the actual foundation diverged from this proposal, and why:

- **Internal packages are compiled, not consumed as raw TS source.** §3
  didn't specify this. The first attempt shipped `packages/*` as raw
  TypeScript (`main`/`types` pointing at `src/index.ts`), relying on Next.js's
  `transpilePackages` to bundle them. That works for `apps/web` but breaks
  `apps/api`: NestJS's build emits plain `require()` calls resolved by Node
  at runtime, with no bundler to transpile a dependency's `.ts` source on the
  fly. Every `packages/*` now has a real `build` script (`tsc -p
  tsconfig.build.json` → `dist/*.js` + `.d.ts`), and `turbo.json` makes
  `build`/`typecheck`/`lint`/`test` depend on `^build` (all dependency
  packages) and the same package's own `build`.
- **`packages/ai` does not use the `server-only` npm package**, despite that
  being the obvious choice for a "must never run client-side" guard. That
  package unconditionally throws unless the *consuming* bundler sets Next.js's
  `react-server` export condition — outside Next's build (plain Node, Vitest,
  and specifically `apps/api`), requiring it always throws. Since
  `packages/ai` is meant to be imported by the NestJS API directly starting
  Milestone 5, that would have broken the API the moment it did. The real
  boundary is (a) never listing `@transcriptioneer/ai` as a dependency of
  `apps/web`/`apps/mobile` and (b) a `no-restricted-imports` ESLint rule in
  their configs; the package also self-checks `"window" in globalThis` at
  import time as defense-in-depth. See the comment in
  `packages/ai/src/index.ts`.
- **`packages/database`'s schema is a single placeholder `HealthCheck`
  model**, not the full knowledge graph from §4. The real entities arrive
  incrementally starting with auth (Milestone 3); building them now, before
  any consuming feature exists, risked modeling mistakes that would need
  rework anyway.
- **`apps/api` uses Jest** (Nest CLI's default), not Vitest — kept as the
  framework's own idiomatic choice rather than forcing consistency with the
  Vitest used everywhere else.
- **`apps/mobile` is a placeholder** (README only, no `package.json`, not a
  pnpm workspace member) until Milestone 12, per the roadmap in §12.
- **No live Postgres/Redis in the dev sandbox this was built in.** `/health`
  is designed to degrade gracefully (`status: "degraded"`, HTTP 200) rather
  than crash when the database is unreachable — this was exercised directly
  rather than assumed. `docker-compose.yml` (Postgres+pgvector, Redis, MinIO)
  and the first Prisma migration are provided but were not run end-to-end
  against a live database; running `pnpm --filter @transcriptioneer/database
  db:migrate` against `docker-compose up -d` postgres is the first thing to
  verify in an environment where Docker is available.

## 14. Milestone 2 (design system) — implementation notes

- **Token architecture**: `packages/ui/src/tokens.css` holds raw scales
  (11-step neutral, 11-step accent, 4 semantic hues) plus *role* tokens
  (`--color-bg`, `--color-surface`, `--color-text`, ...) that `:root`, `.dark`,
  and an explicit `.light` class each map to different scale steps. `.light`
  exists specifically so a subtree can force light mode even when nested
  inside an ancestor `.dark` (used by the Design Lab's side-by-side theme
  comparison) — custom properties otherwise just inherit down the cascade, so
  without it a nested "light" preview would silently show dark values.
  `apps/web/src/app/globals.css` imports the token file and re-exposes the
  role tokens as Tailwind v4 utilities via `@theme inline`, plus a `@source`
  directive so Tailwind scans `packages/ui`'s component source (which lives
  outside `apps/web`'s own directory tree and wouldn't otherwise be scanned).
- **Component stack**: Radix UI primitives (unstyled, accessible) restyled
  with Tailwind, `class-variance-authority` for variant props, `cmdk` for the
  command palette, `next-themes` for light/dark persistence — exactly the
  "Tailwind + Radix (shadcn-style)" approach proposed in §2, now implemented
  as ~30 components in `packages/ui`.
- **`packages/ui` builds to ESM, not CommonJS** (unlike every other shared
  package). Found the hard way: TypeScript's CommonJS emit always inserts a
  `"use strict"` prologue *before* any other statement, which shadows a
  `"use client"` directive — Next.js only recognizes `"use client"` as the
  literal first line of the file. With CommonJS output, every client
  component in the package (e.g. `Toaster`) silently stopped being treated as
  a client boundary, and Next's static generation failed with a generic
  "Element type is invalid...got undefined" for any page rendering it — a
  failure mode with no direct pointer back to the actual cause. Since
  `packages/ui` (unlike `packages/database`/`types`/`validation`) is only
  ever consumed by `apps/web`, a bundler-based app with no `require()`
  constraint, ESM output has no such prologue and was the correct fix. See
  `packages/ui/package.json`'s description and the comment in
  `packages/ui/src/components/toaster.tsx`.
- **Component placement**: genuinely product-agnostic primitives (Button,
  Card, Dialog, Select, Toast, ...) live in `packages/ui`; anything that
  encodes Transcriptioneer-specific concepts (file processing stages,
  document/audio/task/decision cards, the sidebar's nav items, mock AI
  results) lives in `apps/web/src/components`, per the Milestone 2 brief.
- **Verification gap**: this environment's browser-automation tooling could
  not actually change the rendered viewport size (resize calls reported
  success but screenshots stayed at the same resolution across repeated
  attempts), so mobile/tablet breakpoints were verified by code review of the
  Tailwind responsive utilities rather than a live narrow-viewport
  screenshot. Desktop light mode, dark mode, and every interactive component
  (Dialog, AlertDialog, Command palette, Toast, theme toggle) were confirmed
  working in an actual browser.
