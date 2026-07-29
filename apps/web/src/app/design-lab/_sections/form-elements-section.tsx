"use client";

import {
  Checkbox,
  FormField,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@transcriptioneer/ui";
import { Section, SubLabel } from "./section";

export function FormElementsSection() {
  return (
    <Section id="form-elements" title="Form elements">
      <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
        <div>
          <SubLabel>Text input</SubLabel>
          <FormField label="Project name" htmlFor="ff-project" hint="Shown across the dashboard and library.">
            <Input placeholder="Respira" />
          </FormField>
        </div>

        <div>
          <SubLabel>Search input</SubLabel>
          <FormField label="Search" htmlFor="ff-search">
            <SearchInput placeholder="Search your knowledge base…" />
          </FormField>
        </div>

        <div>
          <SubLabel>Textarea</SubLabel>
          <FormField label="Notes" htmlFor="ff-notes" hint="Optional context for this upload.">
            <Textarea placeholder="Add any context worth remembering…" rows={3} />
          </FormField>
        </div>

        <div>
          <SubLabel>Select</SubLabel>
          <FormField label="Project" htmlFor="ff-select">
            <Select defaultValue="respira">
              <SelectTrigger id="ff-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="respira">Respira</SelectItem>
                <SelectItem value="acme">Acme Co.</SelectItem>
                <SelectItem value="procurement">Procurement</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div>
          <SubLabel>Checkbox</SubLabel>
          <div className="flex flex-col gap-2.5 pt-1.5">
            <div className="flex items-center gap-2.5">
              <Checkbox id="ff-check-1" defaultChecked />
              <Label htmlFor="ff-check-1">Notify me when processing completes</Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox id="ff-check-2" />
              <Label htmlFor="ff-check-2">Include in weekly digest</Label>
            </div>
          </div>
        </div>

        <div>
          <SubLabel>Radio</SubLabel>
          <RadioGroup defaultValue="team" className="pt-1.5">
            <div className="flex items-center gap-2.5">
              <RadioGroupItem value="private" id="ff-radio-1" />
              <Label htmlFor="ff-radio-1">Private to me</Label>
            </div>
            <div className="flex items-center gap-2.5">
              <RadioGroupItem value="team" id="ff-radio-2" />
              <Label htmlFor="ff-radio-2">Shared with team</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <SubLabel>Toggle</SubLabel>
          <div className="flex items-center gap-2.5 pt-1.5">
            <Switch id="ff-switch" defaultChecked />
            <Label htmlFor="ff-switch">Speaker detection</Label>
          </div>
        </div>

        <div>
          <SubLabel>File input</SubLabel>
          <FormField label="Attach a file" htmlFor="ff-file">
            <Input type="file" className="file:mr-3 file:rounded-md file:border-0 file:bg-surface-raised file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text" />
          </FormField>
        </div>

        <div>
          <SubLabel>Validation states</SubLabel>
          <div className="flex flex-col gap-4">
            <FormField label="Email" htmlFor="ff-valid" hint="Looks good.">
              <Input defaultValue="elena@respira.dev" />
            </FormField>
            <FormField label="Workspace URL" htmlFor="ff-invalid" error="This URL is already taken.">
              <Input defaultValue="respira" />
            </FormField>
          </div>
        </div>
      </div>
    </Section>
  );
}
