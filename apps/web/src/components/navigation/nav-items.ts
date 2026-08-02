import { CheckSquare, Home, Library, Network, Settings, Sparkles, SquareKanban } from "lucide-react";

export const navItems = [
  { label: "Panel", href: "/", icon: Home },
  { label: "Biblioteca", href: "/library", icon: Library },
  { label: "Preguntar", href: "/ask", icon: Sparkles },
  { label: "Perspectivas", href: "/insights", icon: CheckSquare },
  { label: "Conexiones", href: "/connections", icon: Network },
  { label: "Proyectos", href: "/projects", icon: SquareKanban },
  { label: "Configuración", href: "/settings", icon: Settings },
] as const;
