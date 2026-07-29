import { Button } from "@transcriptioneer/ui";
import { Plus } from "lucide-react";
import { Section, SubLabel } from "./section";

export function ButtonsSection() {
  return (
    <Section id="buttons" title="Buttons">
      <div className="flex flex-col gap-6">
        <div>
          <SubLabel>Variants</SubLabel>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </div>
        <div>
          <SubLabel>Sizes</SubLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
          </div>
        </div>
        <div>
          <SubLabel>States</SubLabel>
          <div className="flex flex-wrap gap-3">
            <Button loading>Saving…</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
