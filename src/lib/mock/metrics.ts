// Derived dashboard metrics from the demo data. Pure functions so the values
// stay consistent with the underlying mock collections.

import {
  demoAgents,
  demoApprovals,
  demoDeployments,
  demoIncidents,
} from "@/lib/mock/demo-data";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { DashboardSummary, MetricCard } from "@/types/metrics";

export function getDashboardSummary(): DashboardSummary {
  const totalAgents = demoAgents.length;
  const activeDeployments = demoDeployments.filter(
    (d) => d.status === "active",
  ).length;
  const pendingApprovals = demoApprovals.filter(
    (a) => a.status === "pending",
  ).length;
  const openIncidents = demoIncidents.filter((i) => i.status === "open").length;
  const estimatedMonthlyCost = demoAgents.reduce(
    (sum, agent) => sum + agent.monthlyCost,
    0,
  );
  const evaluationPassRate =
    demoAgents.reduce((sum, agent) => sum + agent.evaluationPassRate, 0) /
    totalAgents;

  return {
    totalAgents,
    activeDeployments,
    pendingApprovals,
    openIncidents,
    estimatedMonthlyCost,
    evaluationPassRate,
  };
}

export function getDashboardMetricCards(): MetricCard[] {
  const summary = getDashboardSummary();

  return [
    {
      id: "agents",
      label: "Total agents",
      value: String(summary.totalAgents),
      helpText: "Across all environments",
      trend: "up",
      trendLabel: "+1 this week",
      intent: "default",
    },
    {
      id: "deployments",
      label: "Active deployments",
      value: String(summary.activeDeployments),
      helpText: "Currently live versions",
      trend: "flat",
      trendLabel: "No change",
      intent: "default",
    },
    {
      id: "approvals",
      label: "Pending approvals",
      value: String(summary.pendingApprovals),
      helpText: "Awaiting reviewer decision",
      trend: "up",
      trendLabel: "1 new",
      intent: "warning",
    },
    {
      id: "incidents",
      label: "Open incidents",
      value: String(summary.openIncidents),
      helpText: "Require attention",
      trend: "up",
      trendLabel: "1 high severity",
      intent: "destructive",
    },
    {
      id: "cost",
      label: "Estimated monthly cost",
      value: formatCurrency(summary.estimatedMonthlyCost),
      helpText: "Simulated spend across agents",
      trend: "up",
      trendLabel: "Cost spike detected",
      intent: "warning",
    },
    {
      id: "evaluations",
      label: "Evaluation pass rate",
      value: formatPercent(summary.evaluationPassRate),
      helpText: "Average across agents",
      trend: "down",
      trendLabel: "Lowered by 1 agent",
      intent: "success",
    },
  ];
}
