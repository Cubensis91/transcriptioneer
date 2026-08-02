/**
 * Temporary server-side chat endpoint backed by Google AI Studio (Gemini),
 * standing in for the real RAG pipeline (POST /api/v1/chat, ARCHITECTURE.md
 * §4/§5) until that lands. Runs only on the server — the API key never
 * reaches the browser. Grounds answers in the mock knowledge base so the
 * chat feels connected to the rest of the demo data; swap this route for a
 * proxy to the real API once retrieval over Chunk embeddings exists.
 */
import { NextResponse } from "next/server";
import { mockDocuments } from "@/lib/mock-data";

const MODEL = "gemini-flash-latest";

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_AI_API_KEY no está configurada en el servidor." },
      { status: 501 },
    );
  }

  const { question } = (await request.json()) as { question?: string };
  if (!question?.trim()) {
    return NextResponse.json({ error: "Falta la pregunta." }, { status: 400 });
  }

  const knowledgeBase = mockDocuments
    .map((d) => `- "${d.title}" (${d.project}): ${d.summary || "sin resumen todavía"}`)
    .join("\n");

  const systemInstruction =
    "Eres el escriba de Transcriptioneer, un compañero de IA que escucha, entiende y organiza " +
    "el conocimiento del usuario. Respondes en español, de forma cálida, directa y breve. " +
    "Basa tus respuestas en el siguiente conocimiento disponible; si la pregunta no se puede " +
    "responder con él, dilo con honestidad en vez de inventar información. Responde en texto " +
    "plano, sin markdown (sin asteriscos, sin encabezados).\n\n" +
    knowledgeBase;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
        }),
      },
    );

    if (!geminiRes.ok) {
      const detail = await geminiRes.text();
      return NextResponse.json(
        { error: `Gemini respondió con un error (${geminiRes.status}).`, detail },
        { status: 502 },
      );
    }

    const data = await geminiRes.json();
    const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "Gemini no devolvió texto." }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "No se pudo contactar a Gemini." }, { status: 502 });
  }
}
