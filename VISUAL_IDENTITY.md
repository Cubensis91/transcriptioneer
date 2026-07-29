# Transcriptioneer — Visual & Brand Identity

This document is the authoritative source for Transcriptioneer's character,
aesthetic direction, and the narrative shape of its signature interface. It
is a companion to [`PRODUCT_PHILOSOPHY.md`](./PRODUCT_PHILOSOPHY.md), which
remains authoritative for product/AI *behavior* (tone, trust, provenance,
what "understanding" means). This document is authoritative for how that
philosophy is *seen and felt* — the character, materials, and the emotional
arc of the interface. `ARCHITECTURE.md` remains authoritative for technical
implementation; where this document describes an interface state, it should
map onto real system states (see "Interface as narrative" below), not be
purely decorative.

## 1. The character — a scribe, not a mascot

The product's visual identity centers on an original character: a small,
mysterious, hooded scribe. It must not resemble any existing copyrighted
character (e.g. Veigar, Jawas, or other hooded/robed archetypes) — it is its
own design.

The scribe wears headphones. While it listens, it writes — pages flow out
rapidly as it works. The pages represent words, ideas, memories, knowledge,
and conversations being captured and organized. It does not get distracted
and does not stop; it works quietly while the user goes on with their life.

**It is not a mascot.** A mascot is decoration bolted onto a product. This
character *is* the product's visual representation of listening, writing,
organizing, and remembering. The intended user mental model is not "I'm
talking to an AI" — it's "I gave this to Transcriptioneer, and its scribe
will take care of it." This reframing should inform interaction and copy
design, not just illustration: the scribe reacting to an upload is product
behavior, not decoration.

The wordmark "TRANSCRIPTIONEER" pairs with the character, conceptually in a
curved composition around or above it (direction, not final layout). The
name itself carries "transcription" blended with "engineer / pioneer /
scribe" — someone who works with information and language — without needing
to spell that out anywhere in the product.

## 2. Aesthetic direction — "Tactile AI Fantasy"

Named direction: **Tactile AI Fantasy** ("Tecnología táctil con alma de
fantasía"). It combines two references without literally copying either:

- **Tactility**, drawn from classic Mac OS X Leopard/Aqua-era design:
  depth, soft dimensional surfaces, subtle reflections, layered materials,
  gentle gradients, controls that feel physical, soft lighting. Not a
  recreation of Apple's actual icons or layouts — the *feeling* of objects
  that seem to exist, not the specific assets.
- **Fantasy and mystery**, layered on top: a cosmic, "knowledge as night
  sky" quality — intelligence and craft rather than corporate polish.

Target feel: modern, tactile, calm, intelligent, premium, human, mysterious
— closer to "a digital object with a soul" than an app.

**Explicitly avoid**: neon gradients, generic purple/violet "AI" color
schemes, infinite generic cards, glassmorphism as the *sole* visual language
(it may layer as a secondary material over skeuomorphic depth — see §2.2 —
but never replace it), ChatGPT-clone visual language, anonymous SaaS
admin-panel feel. Transcriptioneer should feel like *a place*, not a
dashboard.

**2026-07-29 update — macOS window chrome (traffic-light dots) reversed:**
the earlier decision above (2026-07-28) excluding literal macOS traffic-light
window controls is **superseded**. The founder reviewed a follow-up mockup
(`Inicio.dc.html` / `33a33ced-e847-4194-ae30-57006fc6af6c.png`) that includes
them in the title bar and confirmed they should carry into the real product
after all. Treat traffic-light window chrome as an accepted part of the
visual language going forward, styled with the same bevel/reflection/shadow
treatment as every other control per §2.2.

### 2.2 Skeuomorphism (mandatory, founder directive 2026-07-29)

Skeuomorphism is a **hard project requirement**, not a stylistic option.
Every primary control — buttons, cards, panels, progress bars, upload/intake
boxes, side menus/nav, and indicators — must show volume, material, bevels,
reflections, shadows, fine textures, and tactile feel. Reference point is
Mac OS X Leopard, reinterpreted with 2026 visual standards, not a literal
skeuomorphic copy. **Flat design must never be the primary visual language**
anywhere in the product. This sharpens (does not replace) the "Tactility"
half of Tactile AI Fantasy above into an explicit, non-negotiable constraint
to check any UI component against.

### 2.1 Palette (2026-07-28, supersedes earlier sunset-toned direction)

A reference mockup (`f282fa59-ee98-45d2-91c7-9f37a65b007c.png`, kept in the
repo root) replaced the earlier warm sunset amber/forest-green direction with
a cooler, cosmic palette. This is now the authoritative palette direction;
the values below were sampled directly from that mockup, not invented, and
should still be treated as a *starting point* for `packages/ui/src/tokens.css`
during the Milestone 2 rebuild — final tokens should be picked/adjusted with
real design tooling for contrast/accessibility, not copied verbatim:

| Role | Approx. value | Where it appears in the mockup |
|---|---|---|
| Hero backdrop (cosmic gradient) | `#9AE5EE` → `#47A2D3` → `#6184C3`, with a warm `#EDE0C7` horizon band | Full-bleed hero/landing background behind the scribe and wordmark |
| Scribe robe / character material | `#132B46` (deep navy, near-black) | The scribe character across all screens |
| App surface / card background | `~#EDF1F8` (cool near-white, e.g. `#E9EEF6`–`#F2F7FB`) | Screen backgrounds, cards, panels in the product UI (post-hero) |
| Soft highlight / active state fill | `~#D7E4F4` | Active nav item pill, "sources" chip background |
| Accent / signal blue (primary action) | `~#2884E8` | Primary buttons ("View knowledge"), send action, links |
| Character glow (eyes, headphone accents) | Icy white-blue | Scribe's eyes/details across all states — the one recurring "alive" accent |

Reasoning (superseded below): the *hero* stays cosmic/mysterious (deep sky,
stars, the scribe working alone in vast space — reinforcing "a memory of what
matters to you" as something vast and worth safeguarding), while the
*product surface* itself is calm, near-white, and legible — closer to "pages
on a desk lit by that same sky" than a dark dashboard. The warm horizon band
in the hero gradient is the one remaining warmth cue and should not be lost
when this is formalized into tokens — it's the visual bridge between the
cosmic hero and the human, tactile product surface.

#### 2.1.1 Founder decision (2026-07-29): cosmic is the product-wide default

`MILESTONE_2.5_VISUAL_REFINEMENT.md` flagged that the paragraph above (hero
cosmic, product surface near-white) disagreed with every reference mockup,
which render the *entire* screen — sidebar, panels, cards included — in the
dark cosmic palette, not just a hero band. The founder has now resolved this
explicitly: **the cosmic/dark palette is the default product surface,
product-wide, not hero-scoped.** The near-white palette (this section's
`:root`/`.light` tokens in `packages/ui/src/tokens.css`) remains available as
an explicit, user-selectable light mode — it is no longer the default a new
visitor sees.

Additionally, the cosmic palette as implemented is tuned **~10% brighter**
than the raw reference-mockup values above (via `color-mix(in srgb, <value>
90%, white 10%)` on `--color-bg`, `--color-surface`, `--color-surface-raised`,
`--surface-gradient-raised`/`-pressed`, and `--hero-gradient-cosmic` in
`tokens.css`'s `.dark` block) — deliberately never pure white, but not as
murky as the source art either. `next-themes`' `defaultTheme` is `"dark"`
(see `apps/web/src/components/theme-provider.tsx`).

## 3. The signature intake experience

The homepage/main interface centers on three elements together: the scribe
character, the wordmark, and a large, visually dominant central file-intake
area beneath the logo.

That intake area is **not a button — it is a threshold** ("no es un botón,
es una especie de umbral"). It is explicitly not a generic "Upload File"
control. The user should feel like they are placing something into the care
of someone who will look after it, not submitting a form field.

Flow: the user brings something → Transcriptioneer receives it → listens/
reads → understands → organizes → connects → helps the user remember it.
The user is not "uploading a file" — they are entrusting information. That
reframing should shape the interaction model, not just the microcopy.

Supports drag-and-drop and file selection for audio (MP3, WAV, M4A, OGG,
FLAC, and video where audio can be extracted) and documents (PDF, DOC, DOCX,
TXT) — the exact supported formats are a technical-architecture decision,
not fixed by this concept. Conceptual (non-final) microcopy directions:
"What would you like me to remember?", "Give me something worth
remembering.", "Let me listen.", "Drop something here. I'll take care of the
rest."

The character should visually respond to user actions — listening, writing,
pages appearing, organizing, completing — subtly and purposefully, not with
excessive animation.

## 4. Interface as narrative

The interface should visibly progress through emotional/narrative states,
not just technical ones. This arc should map onto real processing-job
states (`ARCHITECTURE.md` §6's job state machine: `uploaded → validating →
queued → processing → (extracting | transcribing) → analyzing → indexing →
completed`) rather than being purely decorative — each backend stage
transition should have a corresponding narrative beat, not a generic
spinner:

1. **Idle** — the scribe is waiting. The tray conceptually asks: "¿Qué
   quieres que recuerde?" ("What do you want me to remember?")
2. **Intake** — the user drags in a file; the character visibly reacts
   (e.g. puts on headphones) and begins "listening."
3. **Processing** — the scribe writes, pages appear. Status copy should
   read as "Estoy escuchando" (I'm listening), not a generic
   "Processing... 37%" progress bar.
4. **Comprehension** — pages organize themselves; concepts, people, topics,
   decisions, and tasks visibly emerge.
5. **Result** — the content stops being "an audio file" or "a document" and
   becomes **knowledge** — now searchable, connectable, and conversable.

## 5. Brand voice

Tagline: **"Don't just listen. Understand."** / *"No solo escuché.
Entendí."*

One-sentence definition (EN): "Transcriptioneer is an AI-powered companion
that listens to the things that matter to you, understands them, organizes
them into knowledge, and helps you remember them when you need them."

One-sentence definition (ES): "Transcriptioneer es un compañero de IA que
escucha aquello que importa, lo comprende, lo organiza como conocimiento y
te ayuda a recordarlo cuando lo necesitas."

## 6. Build-order principle

The biggest risk to this product is building the technology first and
trying to add soul afterward. Correct order when designing any new
feature or screen:

1. What should a person *feel* when entrusting something to Transcriptioneer?
2. How does the scribe character behave in this moment?
3. How does the interface look and move?
4. What does "understand" mean for the AI here?
5. Only then: what architecture is needed to realize it?

Technology (Next.js, NestJS, PostgreSQL, pgvector, Redis, OpenAI) is
replaceable. This philosophy is not.
