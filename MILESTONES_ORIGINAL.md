# Original Product Vision — Milestones 0–12

This is the founder's original narrative roadmap, written before the
technical implementation plan in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §12
broke the same journey into 17 execution-level milestones. It is preserved
here **verbatim in spirit** as the authoritative record of *why* the project
exists and *where it was always headed* — the emotional and product logic
that `PRODUCT_PHILOSOPHY.md` and `VISUAL_IDENTITY.md` later formalized.

The two numbering schemes do not map 1:1 (this list groups by product
narrative; §12 groups by shippable technical increment — e.g. this
Milestone 5 "AI Pipeline" and Milestone 6 "Knowledge Extraction" roughly
correspond to §12's Milestones 5–7). No forced reconciliation is attempted
here; both stand as independent, valid views of the same project. Current
execution status lives in `PROJECT_STATUS.md`.

---

## Milestone 0 — Product Vision & Architecture ✅

Aquí nació Transcriptioneer. No se escribió código. Se definió:

- la filosofía del producto;
- la arquitectura;
- el stack tecnológico;
- la idea de que la transcripción es solo el punto de entrada.

Fue donde apareció la frase:

> "Transcription is the intake mechanism, not the product."

## Milestone 1 — Foundation ✅

Construir la base. Monorepo. Next.js. NestJS. pnpm. Turborepo. Prisma.
PostgreSQL. pgvector. Redis. MinIO. BullMQ. Health endpoint. Todo lo
necesario para que el proyecto pudiera crecer correctamente.

## Milestone 2 — Design System ✅

No era diseñar pantallas. Era crear el lenguaje visual. Aquí aparecieron:

- `packages/ui`
- Design Lab
- componentes reutilizables
- sistema de tokens
- Tailwind
- Radix
- la identidad visual inicial

Posteriormente evolucionó con:

- el escriba
- la puerta
- la filosofía visual
- la inspiración macOS
- la atmósfera cósmica
- `PRODUCT_PHILOSOPHY.md`
- `VISUAL_IDENTITY.md`

## Milestone 3 — Authentication 🚧

Autenticación real. Usuarios. Organizaciones. Refresh Tokens. Prisma.
Permisos. Base para el trabajo colaborativo. Y aquí venía lo realmente
interesante.

## Milestone 4 — File Intake

Este era uno de mis favoritos. No era simplemente subir archivos. Era
construir el ritual de entrada. El usuario podía entregar:

- MP3
- WAV
- M4A
- MP4
- PDF
- DOCX
- TXT

El escriba comenzaba a trabajar. Receiving. Listening. Understanding.
Connecting. Remembering.

## Milestone 5 — AI Pipeline

Aquí empezaba la magia. OpenAI. Whisper. Structured Outputs. Embeddings.
RAG. Validaciones. BullMQ. Colas. Retries. Todo completamente asíncrono.

## Milestone 6 — Knowledge Extraction

Probablemente el milestone más importante. No mostrar solamente "Esta es tu
transcripción." Sino extraer:

- Personas
- Temas
- Decisiones
- Acciones
- Fechas
- Ideas
- Conceptos
- Relaciones
- Citas
- Contexto

Es decir: entender.

## Milestone 7 — Knowledge Graph

Aquí dejaba de ser una aplicación de transcripción. Cada documento comenzaba
a conectarse con los demás. Por ejemplo:

```
Reunión A
  ↓ habla de Pedro
Pedro aparece también en otra reunión
  ↓ esa reunión menciona Proyecto Atlas
Proyecto Atlas tiene tareas pendientes
  ↓ esas tareas aparecen en otra conversación
```

La IA empezaba a descubrir relaciones que el usuario no había buscado
explícitamente.

## Milestone 8 — Ask Transcriptioneer

Aquí nacía el escriba. No era un chatbot. Era alguien que conocía tu
información. Podías preguntar:

- ¿Qué dijo Carlos sobre el presupuesto hace dos meses?
- ¿Cuándo fue la primera vez que hablamos del proyecto Aurora?
- Resume todas las reuniones donde apareció María.

Y el sistema respondía citando los documentos.

## Milestone 9 — Insights

No esperar preguntas. El sistema comenzaba a descubrir cosas solo. Ejemplos:

- "Has mencionado 'IA' 42 veces este mes."
- "Hay una decisión tomada hace tres semanas que aún no tiene responsable."
- "Estos tres documentos hablan del mismo tema."
- "Encontré contradicciones entre dos reuniones."

Aquí el sistema dejaba de reaccionar y empezaba a aportar valor de forma
proactiva.

## Milestone 10 — Mobile

Android. iOS. Misma filosofía. Mismo backend. Experiencia nativa.

## Milestone 11 — Memory

Este era uno de los hitos más ambiciosos. El conocimiento no desaparecía.
Todo comenzaba a formar una memoria viva. La IA ya no veía documentos
aislados. Veía la historia completa.

## Milestone 12 — The Scribe

El cierre de la visión original. El escriba dejaba de ser un personaje
decorativo. Se convertía en la representación visual de una inteligencia
que: escucha, comprende, organiza, recuerda, y acompaña.

---

## Lo que cambió después

Con el tiempo, la idea se llevó un paso más allá. Ya no hablamos de "hacer
una aplicación de transcripciones". Hablamos de construir una experiencia
donde el usuario siente que entrega un pensamiento a alguien que realmente
lo cuida.

Por eso aparecieron ideas como:

- el escriba encapuchado;
- las hojas que vuelan mientras escribe;
- la gran bandeja central para entregar archivos;
- la puerta como símbolo de entrada al conocimiento;
- la frase: "No solo escuché. Entendí."

Técnicamente, el proyecto sigue siendo un organizador inteligente de
conocimiento. Pero emocionalmente pasó a ser algo más: un lugar donde el
usuario deposita ideas con la expectativa de que alguien — el escriba — las
transforme en conocimiento útil.

Si hubiera que resumir Transcriptioneer hoy en una sola frase, sería esta:

> **Transcriptioneer no almacena archivos; cultiva memoria.**

Esa sigue siendo la esencia de todo el proyecto.
