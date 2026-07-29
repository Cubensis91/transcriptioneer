import { CheckSquare, Home, Library, MessageCircle, Settings } from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "#", icon: Home },
  { label: "Library", href: "#", icon: Library },
  { label: "Chat", href: "#", icon: MessageCircle },
  { label: "Tasks", href: "#", icon: CheckSquare },
  { label: "Settings", href: "#", icon: Settings },
] as const;
