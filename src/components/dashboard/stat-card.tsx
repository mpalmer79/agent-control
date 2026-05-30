import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricCard } from "@/types/metrics";

const TREND_ICON = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
} as const;

const INTENT_ACCENT: Record<MetricCard["intent"], string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function StatCard({ metric }: { metric: MetricCard }) {
  const TrendIcon = TREND_ICON[metric.trend];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className={cn("text-2xl font-semibold", INTENT_ACCENT[metric.intent])}>
          {metric.value}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendIcon className="h-3 w-3" aria-hidden="true" />
          <span>{metric.trendLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground">{metric.helpText}</p>
      </CardContent>
    </Card>
  );
}
