# apps/mobile (placeholder)

Deliberately empty for Milestone 1. Per the roadmap in `ARCHITECTURE.md`, the
mobile app (React Native + Expo) is built starting at **Milestone 12 — Mobile
Foundation**, after the web app and API are stable.

This directory reserves the path so the monorepo layout matches the approved
structure (`apps/{web,api,mobile}`). It is intentionally excluded from the
pnpm workspace and from `turbo run *` until Milestone 12 adds a real
`package.json` here.

When that milestone starts:

- Scaffold with Expo (`npx create-expo-app`).
- Depend on `@transcriptioneer/types` and `@transcriptioneer/api-client` (already built for this — see their package.json).
- Never depend on `@transcriptioneer/ai` — it is server-only (see `packages/ai`).
- Add an ESLint `no-restricted-imports` boundary rule for `@transcriptioneer/ai`, mirroring the one in `apps/web/eslint.config.mjs`.
