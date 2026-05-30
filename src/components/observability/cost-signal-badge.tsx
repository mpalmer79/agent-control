import { Badge } from "@/components/ui/badge";
import type { BudgetSignalLevel } from "@/types/observability";

const VARIANT: Record<
  BudgetSignalLevel,
  "success" | "warning" | "destructive"
> = {
  ok: "success",
  warning: "warning",
  critical: "destructive",
};

const LABEL: Record<BudgetSignalLevel, string> = {
  ok: "Within budget",
  warning: "Approaching budget",
  critical: "Over budget",
};

export function CostSignalBadge({ level }: { level: BudgetSignalLevel }) {
  return <Badge variant={VARIANT[level]}>{LABEL[level]}</Badge>;
}
