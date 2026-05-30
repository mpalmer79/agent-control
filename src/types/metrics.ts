// Metric shapes used by the dashboard shell.

export type MetricTrend = "up" | "down" | "flat";

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  helpText: string;
  trend: MetricTrend;
  trendLabel: string;
  intent: "default" | "warning" | "success" | "destructive";
}

export interface DashboardSummary {
  totalAgents: number;
  activeDeployments: number;
  pendingApprovals: number;
  openIncidents: number;
  estimatedMonthlyCost: number;
  evaluationPassRate: number;
}
