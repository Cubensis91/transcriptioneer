/**
 * Server-only boundary. This package wraps the OpenAI SDK and secrets and
 * must never execute in a browser or mobile client.
 *
 * Deliberately NOT using the `server-only` npm package here: that package
 * unconditionally throws unless the *consuming* bundler sets Next.js's
 * "react-server" export condition (see its package.json). This package is
 * also consumed directly by apps/api, a plain Node/NestJS process with no
 * such bundler — `server-only` would throw there too, breaking the API the
 * moment it imported anything from here. The real enforcement is (a) never
 * listing @transcriptioneer/ai as a dependency of apps/web or apps/mobile,
 * and (b) the `no-restricted-imports` ESLint rule in their configs. This
 * runtime check is defense-in-depth for the one case those two can't catch:
 * code that actually executes inside a real browser tab.
 *
 * Milestone 1 scope: boundary + package wiring only. The OpenAI SDK and the
 * real services (transcriptionService, documentExtractionService,
 * aiAnalysisService, embeddingsService, retrievalService, chatService —
 * see ARCHITECTURE.md §6) land incrementally starting at Milestone 5.
 */
// `"window" in globalThis` (rather than `typeof window`) so this typechecks
// under this package's Node-only `lib` (no DOM types) while still detecting
// a real browser at runtime.
if ("window" in globalThis) {
  throw new Error(
    "@transcriptioneer/ai is server-only and must never run in a browser. " +
      "It wraps the OpenAI SDK and secrets that must never reach a client bundle.",
  );
}

export const AI_PACKAGE_BOUNDARY = "server-only" as const;
