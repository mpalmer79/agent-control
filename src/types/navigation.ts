import type { LucideIcon } from "lucide-react";

// A single primary navigation destination in the application shell.
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}
