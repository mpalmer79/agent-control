import {
  LayoutDashboard,
  Bot,
  FileText,
  Rocket,
  ShieldCheck,
  ClipboardCheck,
  Activity,
  TriangleAlert,
  ScrollText,
  Workflow,
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
    label: "Evaluations",
    href: ROUTES.evaluations,
    icon: ClipboardCheck,
    description: "Functional, safety, and regression results.",
  },
  {
    label: "Observability",
    href: ROUTES.observability,
    icon: Activity,
    description: "Metrics, provider health, and cost trends.",
  },
  {
    label: "Incidents",
    href: ROUTES.incidents,
    icon: TriangleAlert,
    description: "Open and resolved operational incidents.",
  },
  {
    label: "Audit",
    href: ROUTES.audit,
    icon: ScrollText,
    description: "Append-only history of significant actions.",
  },
  {
    label: "Traces",
    href: ROUTES.traces,
    icon: Workflow,
    description: "Correlation-ID evidence across the platform.",
  },
  {
    label: "Settings",
    href: ROUTES.settings,
    icon: Settings,
    description: "Members, roles, models, and environments.",
  },
];
