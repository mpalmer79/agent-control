// Build dashboard metric cards from the metrics summary view. Kept in the
// server view layer so both the dashboard and any API consumer share one shape.

import { formatCurrency, formatPercent } from "@/lib/utils";
import type { MetricCard } from "@/types/metrics";
import type { MetricsSummaryView } from "@/types/views";

export function dashboardMetricCards(
  metrics: MetricsSummaryView,
): MetricCard[] {
  return [
    {
      id: "agents",
      label: "Total agents",
      value: String(metrics.totalAgents),
      helpText: `${metrics.activeAgents} active`,
      trend: "flat",
      trendLabel: "Across all environments",
      intent: "default",
    },
    {
      id: "deployments",
      label: "Active deployments",
      value: String(metrics.activeDeployments),
      helpText: "Currently live versions",
      trend: "flat",
      trendLabel: "No change",
      intent: "default",
    },
    {
      id: "approvals",
      label: "Pending approvals",
      value: String(metrics.pendingApprovals),
      helpText: "Awaiting reviewer decision",
      trend: "up",
      trendLabel: "In the queue",
      intent: metrics.pendingApprovals > 0 ? "warning" : "default",
    },
    {
      id: "evaluations",
      label: "Failed evaluations",
      value: String(metrics.failedEvaluations),
      helpText: "Block production promotion",
      trend: metrics.failedEvaluations > 0 ? "up" : "flat",
      trendLabel: "Quality gate",
      intent: metrics.failedEvaluations > 0 ? "destructive" : "success",
    },
    {
      id: "incidents",
      label: "Open incidents",
      value: String(metrics.openIncidents),
      helpText: "Require attention",
      trend: metrics.openIncidents > 0 ? "up" : "flat",
      trendLabel: "Operational",
      intent: metrics.openIncidents > 0 ? "destructive" : "success",
    },
    {
      id: "cost",
      label: "Estimated monthly cost",
      value: formatCurrency(metrics.estimatedMonthlyCost),
      helpText: "Simulated spend across agents",
      trend: "up",
      trendLabel: "Tracked per agent",
      intent: "warning",
    },
    {
      id: "passrate",
      label: "Evaluation pass rate",
      value: formatPercent(metrics.evaluationPassRate),
      helpText: "Average across completed runs",
      trend: "flat",
      trendLabel: "Quality signal",
      intent: "success",
    },
  ];
}
