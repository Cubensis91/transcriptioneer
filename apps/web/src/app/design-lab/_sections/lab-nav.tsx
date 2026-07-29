"use client";

import { cn } from "@transcriptioneer/ui";
import { useEffect, useState } from "react";

const sections = [
  { id: "brand", label: "Brand" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "form-elements", label: "Form elements" },
  { id: "cards", label: "Cards" },
  { id: "file-states", label: "File states" },
  { id: "ai-results", label: "AI results" },
  { id: "navigation", label: "Navigation" },
  { id: "feedback", label: "Feedback" },
  { id: "modals", label: "Modals & overlays" },
  { id: "upload", label: "Upload" },
  { id: "responsive", label: "Responsive" },
  { id: "theme", label: "Light & dark" },
];

export function LabNav() {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-10% 0px -80% 0px" },
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Design Lab sections" className="hidden lg:block">
      <ul className="sticky top-24 flex flex-col gap-0.5 border-l border-border pl-4">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "block rounded-md px-2 py-1 text-sm transition-colors duration-(--duration-fast)",
                active === section.id ? "font-medium text-accent" : "text-text-muted hover:text-text",
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
