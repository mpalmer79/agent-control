import {
  LayoutDashboard,
  Bot,
  FileText,
  Rocket,
  ShieldCheck,
  Activity,
  ScrollText,
  Settings,
} from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import type { NavItem } from "@/types/navigation";

// Primary navigation for the application shell. Order matches UI_ARCHITECTURE.md.
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
    description: "Operational overview across agents, cost, and risk.",
  },
  {
    label: "Agents",
    href: ROUTES.agents,
    icon: Bot,
    description: "Agent registry, versions, and health.",
  },
  {
    label: "Prompts",
    href: ROUTES.prompts,
    icon: FileText,
    description: "Versioned prompts with diff and rollback.",
  },
  {
    label: "Deployments",
    href: ROUTES.deployments,
    icon: Rocket,
    description: "Promotion and rollback across environments.",
  },
  {
    label: "Governance",
    href: ROUTES.governance,
    icon: ShieldCheck,
    description: "Approvals, policies, and risk controls.",
  },
  {
    label: "Observability",
    href: ROUTES.observability,
    icon: Activity,
    description: "Metrics, incidents, and cost trends.",
  },
  {
    label: "Audit",
    href: ROUTES.audit,
    icon: ScrollText,
    description: "Append-only history of significant actions.",
  },
  {
    label: "Settings",
    href: ROUTES.settings,
    icon: Settings,
    description: "Members, roles, models, and environments.",
  },
];
