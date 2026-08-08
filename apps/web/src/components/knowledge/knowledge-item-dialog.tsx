"use client";

import {
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@transcriptioneer/ui";
import type { KnowledgeItem } from "@transcriptioneer/types";

/** Milestone 6: the real, on-screen result of aiAnalysisService — the raw
 * transcript reorganized into Transcriptioneer's ideal categories rather
 * than shown back in the order it was spoken (ARCHITECTURE.md §4/§6). This
 * is deliberately a dialog over the existing dashboard, not a new
 * `/library`-backed route — `/library` is still mock-data-only until
 * Milestone 8+ (PROJECT_STATUS.md), and this needs to show *real* API data
 * the moment analysis finishes. */
export function KnowledgeItemDialog({
  item,
  filename,
  open,
  onOpenChange,
}: {
  item: KnowledgeItem | null;
  filename: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!item) return null;

  const hasEntities = item.people.length > 0 || item.organizations.length > 0 || item.locations.length > 0;
  const hasFindings =
    item.decisions.length > 0 ||
    item.tasks.length > 0 ||
    item.questions.length > 0 ||
    item.openIssues.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <p className="text-xs text-text-subtle">{filename}</p>
          <DialogTitle>{item.title}</DialogTitle>
          <p className="text-sm text-text-muted">{item.summary}</p>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {(item.topics.length > 0 || item.keywords.length > 0 || item.tags.length > 0) && (
            <section className="flex flex-wrap gap-1.5">
              {item.topics.map((t) => (
                <Badge key={`topic-${t}`} variant="accent">
                  {t}
                </Badge>
              ))}
              {item.keywords.map((k) => (
                <Badge key={`kw-${k}`} variant="info">
                  {k}
                </Badge>
              ))}
              {item.tags.map((t) => (
                <Badge key={`tag-${t}`} variant="neutral">
                  #{t}
                </Badge>
              ))}
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-sm font-medium text-text">Resumen</h3>
            <p className="whitespace-pre-line text-sm text-text-muted">{item.detailedSummary}</p>
          </section>

          {hasEntities && (
            <section className="grid gap-4 sm:grid-cols-3">
              {item.people.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Personas</h4>
                  <ul className="flex flex-col gap-1 text-sm text-text">
                    {item.people.map((p) => (
                      <li key={p.name}>
                        <span className="font-medium">{p.name}</span>
                        {p.context && <span className="text-text-subtle"> — {p.context}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {item.organizations.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Organizaciones</h4>
                  <ul className="flex flex-col gap-1 text-sm text-text">
                    {item.organizations.map((o) => (
                      <li key={o.name}>{o.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.locations.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Lugares</h4>
                  <ul className="flex flex-col gap-1 text-sm text-text">
                    {item.locations.map((l) => (
                      <li key={l.name}>{l.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {item.eventDates.length > 0 && (
            <section className="flex flex-col gap-1.5">
              <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Fechas</h4>
              <ul className="flex flex-col gap-1 text-sm text-text">
                {item.eventDates.map((d) => (
                  <li key={d.label + d.rawText}>
                    <span className="font-medium">{d.label}:</span> {d.rawText}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasFindings && (
            <section className="grid gap-4 sm:grid-cols-2">
              {item.decisions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Decisiones</h4>
                  <ul className="list-disc pl-4 text-sm text-text">
                    {item.decisions.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.tasks.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Tareas</h4>
                  <ul className="list-disc pl-4 text-sm text-text">
                    {item.tasks.map((t) => (
                      <li key={t.text}>
                        {t.text}
                        {t.assignee && <span className="text-text-subtle"> ({t.assignee})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {item.questions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Preguntas abiertas</h4>
                  <ul className="list-disc pl-4 text-sm text-text">
                    {item.questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.openIssues.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Problemas abiertos</h4>
                  <ul className="list-disc pl-4 text-sm text-text">
                    {item.openIssues.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {item.facts.length > 0 && (
            <section className="flex flex-col gap-1.5">
              <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Datos puntuales</h4>
              <ul className="list-disc pl-4 text-sm text-text">
                {item.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
          )}

          {item.quotes.length > 0 && (
            <section className="flex flex-col gap-2">
              <h4 className="text-xs font-medium uppercase tracking-wide text-text-subtle">Citas</h4>
              {item.quotes.map((q) => (
                <blockquote key={q.text} className="border-l-2 border-border pl-3 text-sm italic text-text-muted">
                  &ldquo;{q.text}&rdquo;
                  {q.speaker && <span className="not-italic text-text-subtle"> — {q.speaker}</span>}
                </blockquote>
              ))}
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
