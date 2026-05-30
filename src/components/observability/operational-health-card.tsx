import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OperationalHealth } from "@/types/observability";

const LABEL: Record<OperationalHealth["label"], string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  at_risk: "At risk",
};

const ACCENT: Record<OperationalHealth["label"], string> = {
  healthy: "text-success",
  degraded: "text-warning",
  at_risk: "text-destructive",
};

// A summary card showing the computed operational health score and the factors
// that reduced it.
export function OperationalHealthCard({
  health,
}: {
  health: OperationalHealth;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Operational health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-semibold", ACCENT[health.label])}>
            {health.score}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
          <span className={cn("text-sm font-medium", ACCENT[health.label])}>
            {LABEL[health.label]}
          </span>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>{health.openIncidents} open incident(s)</li>
          <li>{health.failedEvaluations} failed evaluation(s)</li>
          <li>{health.pendingOutbox} pending outbox event(s)</li>
          <li>
            {health.budgetWarning
              ? "Budget warning active"
              : "Budget within range"}
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
