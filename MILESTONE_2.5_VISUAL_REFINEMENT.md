# Milestone 2.5 — Visual/Product Refinement

Status: **complete** (2026-07-29). Founder sign-off included resolving the
open question below and a same-day scope addition — see "Addendum" at the
bottom. This milestone exists because a visual/product gap
analysis (live `/` and `/design-lab` screenshots, compared against
`VISUAL_IDENTITY.md`, `PRODUCT_PHILOSOPHY.md`, and the reference art in
`references/` + the root-level mockup PNGs) found the implementation
technically complete but visually inconsistent — some surfaces clearly
"Transcriptioneer," most still generic SaaS. `PROJECT_STATUS.md`'s own
build-order principle (`VISUAL_IDENTITY.md` §6: feeling → character →
interface → AI meaning → architecture) is the reason this is proposed
*before* Milestone 3, not after.

This is a refinement of Milestone 2's existing components, not new scope —
no new routes, no backend, no auth-adjacent work. Everything here is CSS,
tokens, and swapping/relocating existing components.

## In scope

1. **Replace the brand mark.** The live sidebar/header mark is a generic
   blue "ascending bars" icon with no connection to Transcriptioneer's
   identity. Every reference image (the 9-screen mobile sheet, the
   fullscreen desktop mockup, both character shots) uses an arched-doorway/
   portal glyph instead. Replace `BrandMark`/`BrandLockup`
   (`apps/web/src/components/brand-mark.tsx`) with a mark derived from that
   doorway motif — original artwork, not a copy of the reference PNG.
2. **Bring the scribe onto the actual product surface.** `ScribeMark`
   currently only appears in `/design-lab`'s Brand section. `VISUAL_IDENTITY.md`
   §3 requires the scribe, the wordmark, and the intake area together on the
   home screen. Add it to `IntakeThreshold`
   (`apps/web/src/components/upload/intake-threshold.tsx`) and/or the
   dashboard hero, replacing the generic headphone-icon glyph currently
   shown there. Idle/active states already exist in code — this is
   placement, not new illustration work.
3. **Resolve the light-vs-dark/cosmic default direction — decision needed,
   not just implementation** (see "Open question" below). Once decided,
   apply consistently: either (a) make the cosmic/starfield treatment the
   default product surface per the reference art, or (b) keep near-white as
   the default surface and confirm the cosmic treatment is intentionally
   hero-only per `VISUAL_IDENTITY.md` §2.1's literal text. Whichever is
   confirmed, update `tokens.css`'s comments so the two documents (spec text
   vs. reference art) stop reading as if they disagree.
4. **Extend tactile/skeuomorphic treatment across the existing card
   library.** `PanelChromeHeader` and the intake hero got the bevel/
   surface-gradient treatment; `Basic card`, `Document card`, `Audio card`,
   `Task card`, `Decision card`, `Person card`, `Topic card`, and `AI insight
   card` (all in `packages/ui`/`apps/web/src/components/cards`) did not —
   they're currently flat bordered rectangles. Apply the same
   `--surface-gradient-raised`/`--bevel-highlight`/`--shadow-*` tokens
   already defined in `tokens.css` §2.2 consistently, rather than only on
   net-new components.
5. **Replace the generic "Drag and drop (compact)" dropzone** (dashed
   border + cloud icon) with a treatment consistent with `IntakeThreshold`'s
   "threshold, not a button" framing (§3) — doesn't need to be identical to
   the hero variant, but shouldn't read as a bare HTML file input styled
   with a dashed border.
6. **Sidebar/top-nav tactile pass.** `AppSidebar`, `TopNav`, and the search
   input currently have no bevel/surface treatment — flat white/dark with
   plain borders. Bring them in line with §2.2's "every primary control"
   requirement.

## Explicitly out of scope

- ~~Anything behind the `(dashboard)` route wiring becoming a real, committed
  screen~~ — **superseded by the founder directive dated 2026-07-29, see
  "Addendum" at the bottom of this document.** The homepage is now in scope
  and being committed as part of this milestone.
- New illustration/character art beyond what `ScribeMark` already has
  (idle/active silhouette) — a richer, more detailed scribe illustration
  (matching the reference art's linework) is a future decision, not this
  milestone's.
- Card *content*/copy changes (e.g. making mock data feel less like generic
  SaaS filler) — visual/material treatment only in this milestone; content
  tone is `PRODUCT_PHILOSOPHY.md` territory and can be addressed separately.
- Mobile bottom-nav center "+" affordance seen in the reference — worth
  doing, but it's a navigation/IA decision (what does it do, upload
  shortcut?) more than a visual one; flag for a follow-up, not bundled here.
- Any backend, auth, or `packages/database` schema work (Milestone 3+,
  unaffected by this milestone).

## Open question — RESOLVED 2026-07-29

`VISUAL_IDENTITY.md` §2.1's text said the *product surface* (post-hero) is
"calm, near-white, and legible... closer to pages on a desk," with cosmic
dark reserved for the hero/intake. But every reference mockup — including
ones explicitly labeled as the app's home/dashboard, not just a landing
hero — renders the *entire* screen in the dark cosmic palette, every panel
included. These two sources disagreed; implementation did not guess.

**Founder decision:** cosmic-by-default, product-wide, tuned ~10% brighter
than the raw reference art. See `VISUAL_IDENTITY.md` §2.1.1 for the full
rationale and the token-level implementation. Item 3 below is unblocked.

## Acceptance criteria

- [x] Brand mark replaced across `apps/web` (sidebar header) with a
      doorway/scribe-derived mark; `/design-lab`'s Brand section shows it
      alongside the wordmark/lockup. Favicon not regenerated — follow-up,
      see `PROJECT_STATUS.md`.
- [x] `ScribeMark` appears on the actual home page's intake area (not just
      `/design-lab`), in both idle (breathing) and active (pulsing) states,
      respecting `prefers-reduced-motion` (`useReducedMotion` gates both).
- [x] Open question above is resolved with an explicit founder decision,
      documented in `VISUAL_IDENTITY.md` §2.1.1.
- [x] All 8 existing card types in `/design-lab`'s Cards section show
      visible bevel/gradient treatment — this was already true from
      Milestone 2's `Card` primitive; verified visually this session
      (screenshot), not just "tokens exist in the file."
- [x] The compact "Drag and drop" dropzone (`UploadDropzone`) no longer
      reads as a bare dashed-border HTML input.
- [x] Sidebar, top nav, mobile nav, and search input show the same tactile
      treatment as the rest of the refreshed surfaces (`Input`/`SearchInput`
      already had an appropriate — recessed, not raised — treatment from
      Milestone 2).
- [x] `pnpm turbo run typecheck lint test` green across the monorepo.
      `build` green everywhere except `@transcriptioneer/web`'s, which fails
      under Turbopack (default) in this specific PRoot sandbox only —
      reproducible on an unmodified checkout, unrelated to any code in this
      milestone; `next build --webpack` succeeds cleanly and was used for
      all verification. See `PROJECT_STATUS.md`'s "Known technical debt."
- [x] A fresh set of `/` and `/design-lab` screenshots (light + dark,
      desktop + mobile) taken via a real headless browser (Playwright +
      Chromium, installed this session) and visually compared against this
      document's items — caught and fixed one real bug (a stale Design Lab
      description of the old brand mark).

### Deferred (decision-blocked, not code-blocked)

- ~~Item 3 (light/dark/cosmic default) cannot start until the open question
  above is answered~~ — resolved, see above.

## Addendum (2026-07-29): homepage shipped as part of this milestone

A same-day founder directive expanded this milestone's scope beyond the
original "components only, no committed route" boundary: the `(dashboard)`
route is now built and committed as the real homepage/entrance experience
(scribe + `IntakeThreshold` hero, sidebar, process stepper, recent-documents
grid, quick insights), reusing the same already-built, mock-data-driven
components `/design-lab` already showcases. This still does **not** add any
backend, auth, or database work — the homepage renders against
`lib/mock-data.ts` exactly like `/design-lab` does, with no real upload
processing behind it. Auth/backend remain Milestone 3+.
