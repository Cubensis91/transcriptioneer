"use client";

import { Breadcrumbs, Tabs, TabsContent, TabsList, TabsTrigger } from "@transcriptioneer/ui";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SearchInterface } from "@/components/navigation/search-interface";
import { TopNav } from "@/components/navigation/top-nav";
import { Section, SubLabel } from "./section";

export function NavigationSection() {
  return (
    <Section id="navigation" title="Navigation">
      <div className="flex flex-col gap-8">
        <div>
          <SubLabel>Desktop sidebar</SubLabel>
          <div className="h-96 overflow-hidden rounded-lg border border-border">
            <AppSidebar className="h-full" />
          </div>
        </div>

        <div>
          <SubLabel>Top navigation</SubLabel>
          <div className="overflow-hidden rounded-lg border border-border">
            <TopNav />
          </div>
        </div>

        <div>
          <SubLabel>Mobile navigation</SubLabel>
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-lg border border-border">
            <MobileNav />
          </div>
        </div>

        <div>
          <SubLabel>Breadcrumbs</SubLabel>
          <Breadcrumbs
            items={[
              { label: "Library", href: "#" },
              { label: "Respira", href: "#" },
              { label: "Q3 roadmap sync" },
            ]}
          />
        </div>

        <div>
          <SubLabel>Tabs</SubLabel>
          <Tabs defaultValue="transcript" className="max-w-md">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript" className="text-sm text-text-muted">
              Full transcript with speaker segments appears here.
            </TabsContent>
            <TabsContent value="summary" className="text-sm text-text-muted">
              Executive and detailed summaries appear here.
            </TabsContent>
            <TabsContent value="tasks" className="text-sm text-text-muted">
              Extracted action items appear here.
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <SubLabel>Search interface</SubLabel>
          <SearchInterface />
        </div>
      </div>
    </Section>
  );
}
