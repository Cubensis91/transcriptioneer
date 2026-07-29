# Transcriptioneer

AI knowledge organizer — transcription, document intelligence, semantic search,
and chat over your own knowledge base. See [`ARCHITECTURE.md`](./ARCHITECTURE.md)
for the full design and roadmap.

Transcription is the intake mechanism, not the product — the product is
helping people understand, organize, connect, and remember what they entrust
to it. [`PRODUCT_PHILOSOPHY.md`](./PRODUCT_PHILOSOPHY.md) is the authoritative
source for this human experience and product philosophy; every feature, UX
decision, and piece of AI/product copy from Milestone 3 onward is evaluated
against it. [`VISUAL_IDENTITY.md`](./VISUAL_IDENTITY.md) is the authoritative
source for the brand character, aesthetic direction, and the narrative shape
of the signature intake interface.

**Status: Milestone 2 — design system.** No authentication, uploads,
transcription, AI analysis, or document processing yet. What exists: the
monorepo foundation (Milestone 1), plus a full design token system, a
reusable component library, and a `/design-lab` route showcasing every
component and state with mock data.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Web**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **API**: NestJS, TypeScript
- **Database**: PostgreSQL + pgvector, Prisma
- **Design system**: Radix UI primitives + `class-variance-authority`, `cmdk` (command palette), `next-themes` (light/dark)
- **Shared packages**: `types`, `validation`, `database`, `ai`, `ui`, `api-client`

## Prerequisites

- Node.js 20+ (`.nvmrc` pins this)
- pnpm (`corepack enable` or `npm install -g pnpm`)
- Docker (for local Postgres/Redis/MinIO) — optional if you point
  `DATABASE_URL` at an existing Postgres instance instead

## Setup

```bash
pnpm install

# Start local Postgres (pgvector) + Redis + MinIO
docker compose up -d

# Copy env vars and adjust if needed (defaults match docker-compose.yml)
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```

`apps/api` reads its env file via `@nestjs/config` (`apps/api/.env`); `apps/web`
reads its own via Next.js's convention (`apps/web/.env.local`, and only
`NEXT_PUBLIC_*` vars are exposed to the browser). Copying the same
`.env.example` into both is the simplest option since the two apps' variables
don't overlap — Next.js ignores the API-only ones and vice versa.

Apply the first database migration once Postgres is up:

```bash
pnpm --filter @transcriptioneer/database db:migrate
```

## Development

```bash
pnpm dev          # builds shared packages once, then runs web + api dev servers
```

- Web: http://localhost:3000
- API: http://localhost:4000 (`GET /health` returns `{ success, data: { status, service, timestamp } }`)

Or run one app at a time:

```bash
pnpm --filter @transcriptioneer/web dev
pnpm --filter @transcriptioneer/api dev
```

## Design Lab

An internal, dev-only route showcasing every reusable component and state —
brand, typography, buttons, form elements, cards, file processing states, AI
result presentation, navigation, feedback, modals/overlays, the upload
experience, responsive behavior, and light/dark mode side by side. All mock
data; nothing here calls the API.

```bash
pnpm --filter @transcriptioneer/web dev
# then open http://localhost:3000/design-lab
```

The theme toggle in the "Top navigation" example (and the moon/sun icon
anywhere else it appears) switches the whole page between light and dark —
`next-themes` persists the choice and respects the OS preference on first
load. It's excluded from search engines (`robots: noindex`) since it isn't
part of the product surface end users see.

## Verification commands

```bash
pnpm build       # turbo run build   — builds every shared package, then both apps
pnpm typecheck   # turbo run typecheck
pnpm lint        # turbo run lint
pnpm test        # turbo run test
pnpm format      # prettier --write across the repo
```

Each shared package (`packages/*`) builds to `dist/` and is consumed by the
apps as a normal compiled dependency — not as raw TypeScript source. This
matters specifically for `apps/api`: NestJS's build is plain Node `require()`
at runtime (unlike Next.js, which bundles and can transpile workspace source
directly), so anything it depends on has to already be compiled JS with
`.d.ts` files, or it fails at runtime. `turbo.json` encodes this: `build`,
`typecheck`, `test`, and `lint` all depend on `^build` (every dependency
package's build) and same-package `build` running first.

`packages/ui` is the one exception to "compiled CommonJS": it builds to ESM
instead. It's only ever consumed by `apps/web`, and TypeScript's CommonJS
output always emits a `"use strict"` prologue before anything else in the
file — which shadows a `"use client"` directive (Next.js only recognizes it
as the literal first line), silently breaking every client component in the
package. ESM doesn't have that forced prologue. See the comment at the top of
`packages/ui/package.json` and `packages/ui/src/components/toaster.tsx`.

## Design tokens

`packages/ui/src/tokens.css` defines the full palette (warm "ink" neutrals, a
muted teal "signal" accent, semantic success/warning/error/info) as CSS
custom properties, plus role tokens (`--color-bg`, `--color-surface`,
`--color-text`, ...) that light and dark mode map to *different* steps of
those scales — not inverted values. `apps/web/src/app/globals.css` imports it
and exposes the role tokens as Tailwind utilities (`bg-bg`, `text-text-muted`,
`bg-accent-solid`, etc.) via `@theme inline`.

## Repository structure

```
apps/
  web/
    src/app/design-lab/    Design Lab route (13 sections — see "Design Lab" above)
    src/components/        Product-specific components (nav, cards, AI results, file states, upload)
    src/lib/mock-data.ts   Mock content used only by the Design Lab
  api/      NestJS app
  mobile/   placeholder — real app starts at Milestone 12 (see apps/mobile/README.md)
packages/
  types/         Shared TS types (ApiResponse envelope, etc.)
  validation/    Shared Zod schemas
  database/      Prisma schema + client singleton (PostgreSQL + pgvector)
  ai/            Server-only boundary for future OpenAI services (Milestone 5+)
  ui/            Design system: tokens.css, cn(), and ~30 Radix-based components (Button, Card, Dialog, Toast, Select, Command palette, ...)
  api-client/    Typed fetch wrapper shared by web (and later mobile)
  config/        Shared ESLint/TypeScript/Prettier presets
docker-compose.yml   Local Postgres (pgvector) + Redis + MinIO
ARCHITECTURE.md      Full design doc and milestone roadmap
```

## Security boundary: `packages/ai`

`packages/ai` will hold the OpenAI SDK and every AI service once Milestone 5+
lands. It must never be imported by `apps/web` or `apps/mobile`. This is
enforced two ways, not just by convention:

1. It is never listed as a dependency of `apps/web` or `apps/mobile`.
2. `no-restricted-imports` in `apps/web/eslint.config.mjs` fails the build if
   anything there imports `@transcriptioneer/ai` (the same rule must be added
   to `apps/mobile`'s config once it has real source, at Milestone 12).

(`packages/ai`'s own runtime also throws if it ever detects `window`, e.g. if
it were bundled into a real browser tab — but the two rules above are the
actual line of defense; see the comment in `packages/ai/src/index.ts` for why
the popular `server-only` npm package doesn't work here — it would break the
NestJS API too, since that package only no-ops under Next.js's own bundler.)
