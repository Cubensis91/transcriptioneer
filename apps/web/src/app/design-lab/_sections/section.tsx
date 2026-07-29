import type { ReactNode } from "react";

export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border py-12 first:pt-0 last:border-b-0">
      <div className="mb-6 flex flex-col gap-1.5">
        <h2 className="font-display text-2xl font-medium tracking-tight text-text">{title}</h2>
        {description && <p className="max-w-2xl text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function SubLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-subtle">{children}</p>;
}
