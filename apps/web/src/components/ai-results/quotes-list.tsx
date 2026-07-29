import { Quote } from "lucide-react";

export function QuotesList({ quotes }: { quotes: { text: string; speaker: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {quotes.map((quote, index) => (
        <figure key={index} className="flex gap-3 rounded-lg bg-surface-raised px-4 py-3">
          <Quote className="mt-0.5 size-4 shrink-0 text-text-subtle" aria-hidden />
          <div>
            <blockquote className="text-sm italic text-text">“{quote.text}”</blockquote>
            <figcaption className="mt-1 text-xs text-text-subtle">— {quote.speaker}</figcaption>
          </div>
        </figure>
      ))}
    </div>
  );
}
