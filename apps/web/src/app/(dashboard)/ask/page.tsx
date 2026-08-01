"use client";

import { Avatar, Badge, Button, Input } from "@transcriptioneer/ui";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ScribeMark } from "@/components/scribe-mark";
import { TopNav } from "@/components/navigation/top-nav";
import { type ChatMessage, askService } from "@/lib/services/ask-service";

const starterQuestions = [
  "What decisions are still waiting on an owner?",
  "What did Priya say about the SOC 2 report?",
  "Summarize everything about the Q3 roadmap.",
];

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function send(question: string) {
    if (!question.trim() || pending) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: question }]);
    setInput("");
    setPending(true);
    const answer = await askService.ask(question);
    setMessages((m) => [...m, answer]);
    setPending(false);
  }

  return (
    <>
      <TopNav />
      <main className="flex flex-1 flex-col overflow-hidden pb-24 lg:pb-0">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-8">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <ScribeMark animate />
              <div>
                <h1 className="font-display text-xl font-medium text-text">Ask your scribe</h1>
                <p className="mt-1 text-sm text-text-muted">
                  Answers come from what you&apos;ve actually shared with it — with citations.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {starterQuestions.map((q) => (
                  <Button key={q} variant="secondary" size="sm" onClick={() => send(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {m.role === "assistant" ? (
                      <ScribeMark animate={false} className="size-8 shrink-0" />
                    ) : (
                      <Avatar name="Elena Marsh" size="sm" />
                    )}
                    <div
                      className={`flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3 text-sm ${
                        m.role === "user"
                          ? "bg-accent-solid text-text-on-accent"
                          : "bg-surface-raised text-text"
                      }`}
                    >
                      <p className="leading-relaxed">{m.text}</p>
                      {m.citations && m.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
                          {m.citations.map((c) => (
                            <Link key={c.documentId} href={`/library/${c.documentId}`}>
                              <Badge variant="neutral" className="cursor-pointer hover:bg-surface">
                                {c.documentTitle}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {pending && (
                <div className="flex items-center gap-3">
                  <ScribeMark animate className="size-8 shrink-0" />
                  <div className="flex gap-1 rounded-lg bg-surface-raised px-4 py-3">
                    <span className="size-1.5 animate-bounce rounded-full bg-text-subtle [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-text-subtle [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-text-subtle" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-4 sm:px-8"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about what you've shared…"
            aria-label="Ask your scribe"
          />
          <Button type="submit" size="icon" aria-label="Send" disabled={pending}>
            <Send className="size-4" aria-hidden />
          </Button>
        </form>
      </main>
    </>
  );
}
