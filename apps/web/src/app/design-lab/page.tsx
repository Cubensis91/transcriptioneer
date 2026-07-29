"use client";

import { AiResultsSection } from "./_sections/ai-results-section";
import { BrandSection } from "./_sections/brand-section";
import { ButtonsSection } from "./_sections/buttons-section";
import { CardsSection } from "./_sections/cards-section";
import { FeedbackSection } from "./_sections/feedback-section";
import { FileStatesSection } from "./_sections/file-states-section";
import { FormElementsSection } from "./_sections/form-elements-section";
import { LabNav } from "./_sections/lab-nav";
import { ModalsSection } from "./_sections/modals-section";
import { NavigationSection } from "./_sections/navigation-section";
import { ResponsiveSection } from "./_sections/responsive-section";
import { ThemeSection } from "./_sections/theme-section";
import { TypographySection } from "./_sections/typography-section";
import { UploadSection } from "./_sections/upload-section";

export default function DesignLabPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-2 border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
          Internal · Milestone 2
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text">Design Lab</h1>
        <p className="max-w-2xl text-sm text-text-muted">
          Every reusable component and state in one place, for development and design review. Not part
          of the product surface end users see.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_12rem]">
        <div className="min-w-0">
          <BrandSection />
          <TypographySection />
          <ButtonsSection />
          <FormElementsSection />
          <CardsSection />
          <FileStatesSection />
          <AiResultsSection />
          <NavigationSection />
          <FeedbackSection />
          <ModalsSection />
          <UploadSection />
          <ResponsiveSection />
          <ThemeSection />
        </div>
        <LabNav />
      </div>
    </div>
  );
}
