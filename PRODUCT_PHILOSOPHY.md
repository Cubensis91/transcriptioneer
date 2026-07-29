# The Human Core of Transcriptioneer

This document is the authoritative source for Transcriptioneer's product
philosophy — the human experience the product is trying to create. It governs
every future feature, user flow, AI behavior, interface decision, and piece
of product copy. `ARCHITECTURE.md` remains authoritative for *how the system
is built*; this document is authoritative for *what the system is for and how
it should feel*. When the two seem to pull in different directions, this
document wins on product/UX/AI behavior, and `ARCHITECTURE.md` wins on
technical implementation — the two should rarely conflict, since this
philosophy is layered on top of the approved architecture, not a replacement
for it.

## Transcription is the intake mechanism, not the product

Transcriptioneer is not fundamentally a transcription application. Transcription
is only how content gets in. The real product is helping people preserve,
understand, organize, connect, and revisit the knowledge, ideas, conversations,
and memories they choose to entrust to it.

A user does not upload an audio file because they care about transcription.
They upload it because something inside that audio matters. It might be:

- An important meeting
- A personal idea
- A business decision
- A class
- An interview
- A conversation
- A creative thought
- A voice note recorded while walking
- A memory
- Something they are afraid they might otherwise forget

The system should never treat user content as merely "data to process." It
should treat it as something entrusted to it.

## The core loop

**LISTEN. UNDERSTAND. ORGANIZE. CONNECT. REMEMBER.**

And the central product principle:

> **"Don't just listen. Understand."**
> *"No solo escuché. Entendí."*

## 1. The product should feel like an attentive companion

Transcriptioneer should feel calm, intelligent, attentive, and trustworthy. It
should never feel robotic, mechanical, cold, or unnecessarily corporate. The
product should communicate:

- "I am paying attention."
- "I understand what you are trying to preserve."
- "I will help you make sense of this."
- "I will help you find it again later."

The AI should not constantly try to be funny or overly conversational. Its
personality is:

Calm · Attentive · Thoughtful · Intelligent · Warm without being sentimental ·
Respectful · Honest about uncertainty

It should feel like a highly capable assistant that remembers alongside you.

## 2. The AI should not only extract information

The AI should do more than produce transcriptions, summaries, keywords, and
topics. It should attempt to understand meaning and context.

For example, after processing a meeting, instead of only showing *Summary /
Tasks / Decisions / Topics*, the product might surface **"What seems to
matter here"**:

> "The conversation started around budget, but the main decision appears to
> have been delaying the launch by two weeks."

This is not about inventing information. The AI must never hallucinate. It
must clearly distinguish:

- What was explicitly said
- What was strongly inferred
- What is uncertain

**Principle: understand, but never pretend to know.**

## 3. The product should recognize intent

Different content should feel meaningfully different. For example (illustrative,
not fixed copy):

| Content | Framing |
|---|---|
| A meeting | "Meeting organized" |
| A voice note | "Idea captured" |
| A class | "Learning notes" |
| An interview | "Interview organized" |
| A project discussion | "Decisions and next steps" |

The system should progressively learn to understand the context of what the
user is preserving. Do not force every piece of content into the same
generic "document processing" experience.

## 4. Language should feel human

Avoid unnecessarily mechanical messages such as *"File processed
successfully."* Prefer language that acknowledges the user's intention
(illustrative, not fixed copy):

- "Your conversation is ready."
- "I organized the important parts for you."
- "I found 3 decisions and 5 tasks in this conversation."
- "There is one unresolved question you may want to revisit."
- "Here is what seems to matter most."

The principle: system feedback should feel like meaningful assistance, not
machine status reporting.

## 5. The product should help users discover meaning

Transcriptioneer should occasionally surface useful connections, for example:

- "You mentioned this project in three different conversations."
- "This idea first appeared in a voice note from March."
- "Two documents appear to discuss the same decision."
- "This task was mentioned in your last three meetings and may still be unresolved."

These insights must always be grounded in actual user data. Never fabricate
connections. When confidence is low, communicate uncertainty.

## 6. Trust is a core feature

The user's content may be deeply personal or professionally sensitive.
Therefore:

- Never pretend certainty when uncertain
- Never invent facts
- Never fabricate citations
- Never imply the AI remembers something it does not actually have access to
- Always distinguish between source content and AI interpretation
- Make it easy to trace AI-generated insights back to their source
- Preserve provenance
- Respect privacy
- Treat user content as entrusted information

The user should feel: **"I can trust this system with my information."**

## 7. The product should respect memory

Some content is functional. Some content is meaningful. The architecture
should eventually allow both.

- **Functional**: Tasks, Decisions, Meetings, Projects
- **Meaningful**: Ideas, Personal reflections, Conversations, Memories, Important moments

Do not force meaningful content into sterile productivity categories. The
product should eventually support the idea that **"some things are worth
remembering simply because they matter."**

## 8. The long-term vision

The long-term vision is not *"upload a file and get a transcript."*

The long-term vision is: **"Build a memory of what matters to you."**

A user should eventually be able to ask:

- "When did I first have this idea?"
- "What did we decide about this project?"
- "Where did I talk about this person?"
- "What were the main things I learned this year?"
- "Show me everything connected to this project."
- "What did I say about this six months ago?"

And Transcriptioneer should answer using the user's own trusted knowledge
base. This is why the architecture continues to prioritize: provenance,
source citations, semantic connections, search, entity relationships,
temporal context, user control, and privacy.

## 9. The product decision rule

From this point forward, when implementing a feature, ask:

> Does this merely process information? Or does it help the user understand,
> organize, connect, or remember something meaningful?

**Prefer the latter.**

## 10. Relationship to the existing architecture

This philosophy is layered on top of the architecture and technology choices
already approved through Milestone 2 (`ARCHITECTURE.md`) — it does not
replace or require refactoring any of it: the monorepo, Next.js, NestJS,
PostgreSQL + pgvector, Prisma, Redis + BullMQ, MinIO, the shared packages,
the design system and Design Lab, the security model, and repository-level
user/tenant isolation all remain as designed. Applying this philosophy means
future features (starting with authentication in Milestone 3 and onward) are
*designed* with this human core in mind — not that prior work gets rebuilt.
