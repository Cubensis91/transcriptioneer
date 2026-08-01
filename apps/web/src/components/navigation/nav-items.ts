import { CheckSquare, Home, Library, Network, Settings, Sparkles, SquareKanban } from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Library", href: "/library", icon: Library },
  { label: "Ask", href: "/ask", icon: Sparkles },
  { label: "Insights", href: "/insights", icon: CheckSquare },
  { label: "Connections", href: "/connections", icon: Network },
  { label: "Projects", href: "/projects", icon: SquareKanban },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;
