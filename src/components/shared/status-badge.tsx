import { Badge } from "@/components/ui/badge";
import type { StatusIntent } from "@/lib/constants/status";

const INTENT_TO_VARIANT: Record<
  StatusIntent,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  default: "outline",
  muted: "secondary",
  success: "success",
  warning: "warning",
  destructive: "destructive",
};

interface StatusBadgeProps {
  label: string;
  intent: StatusIntent;
}

// A status badge that always shows a text label so status is never conveyed by
// color alone, supporting the accessibility requirements in TESTING_STRATEGY.md.
export function StatusBadge({ label, intent }: StatusBadgeProps) {
  return <Badge variant={INTENT_TO_VARIANT[intent]}>{label}</Badge>;
}
