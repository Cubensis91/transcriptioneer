"use client";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@transcriptioneer/ui";
import { Bell } from "lucide-react";

const mockNotifications = [
  { id: "n-1", text: "Q3 roadmap sync finished transcribing.", time: "5m ago" },
  { id: "n-2", text: "3 new connections found in Vendor security questionnaire.", time: "1h ago" },
  { id: "n-3", text: "Priya Natarajan was mentioned in a document you follow.", time: "yesterday" },
];

export function NotificationsButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-4" aria-hidden />
          <Badge
            variant="error"
            className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
          >
            {mockNotifications.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {mockNotifications.map((n) => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 whitespace-normal py-2">
            <span className="text-sm text-text">{n.text}</span>
            <span className="text-xs text-text-subtle">{n.time}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
