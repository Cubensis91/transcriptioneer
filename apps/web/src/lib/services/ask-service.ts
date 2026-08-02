/**
 * AskService — chat over the knowledge base. Backed by /api/ask (Gemini,
 * grounded in the mock documents server-side) as a temporary stand-in for
 * the real RAG pipeline (POST /api/v1/chat over Chunk embeddings,
 * ARCHITECTURE.md §4/§5). Real citations arrive once that retrieval layer
 * exists — until then, responses carry no citations rather than fake ones.
 */
export type ChatCitation = { documentId: string; documentTitle: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: ChatCitation[];
};

export interface AskService {
  ask(question: string): Promise<ChatMessage>;
}

class GeminiAskService implements AskService {
  async ask(question: string): Promise<ChatMessage> {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "No se pudo obtener una respuesta.");
    }

    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: data.text as string,
    };
  }
}

export const askService: AskService = new GeminiAskService();
