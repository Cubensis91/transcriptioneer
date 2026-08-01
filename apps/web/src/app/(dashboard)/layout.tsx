import type { ReactNode } from "react";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full bg-bg">
      <AppSidebar className="hidden lg:flex" />

      <div className="flex min-h-dvh flex-1 flex-col">
        {children}

        <MobileNav className="fixed inset-x-0 bottom-0 lg:hidden" />
      </div>
    </div>
  );
}
