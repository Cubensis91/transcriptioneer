import { Section, SubLabel } from "./section";

const breakpoints = [
  { name: "Mobile", width: "< 640px", note: "Bottom tab nav, single-column cards, stacked forms." },
  { name: "Tablet", width: "640–1024px", note: "Two-column card grids, sidebar becomes a drawer." },
  { name: "Desktop", width: "1024–1536px", note: "Persistent sidebar, two–three column grids." },
  { name: "Large desktop", width: "> 1536px", note: "Content max-width caps line length; extra space goes to margins, not wider cards." },
];

export function ResponsiveSection() {
  return (
    <Section
      id="responsive"
      title="Responsive design"
      description="Layouts change structure at each breakpoint rather than shrinking — the clearest example on this page is the desktop sidebar (Navigation section) versus the mobile bottom nav: two different components, not one resized. Resize this window to see the grid below reflow."
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {breakpoints.map((bp) => (
            <div key={bp.name} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-medium text-text">{bp.name}</p>
              <p className="text-xs text-text-subtle">{bp.width}</p>
              <p className="mt-2 text-xs text-text-muted">{bp.note}</p>
            </div>
          ))}
        </div>

        <div>
          <SubLabel>Live reflow demo</SubLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border-strong text-xs text-text-subtle"
              >
                Card {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
