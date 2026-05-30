import { Badge } from "@/components/ui/badge";
import type { OutboxStatus } from "@/types/observability";

const VARIANT: Record<OutboxStatus, "secondary" | "success" | "destructive"> = {
  pending: "secondary",
  published: "success",
  failed: "destructive",
};

const LABEL: Record<OutboxStatus, string> = {
  pending: "Pending",
  published: "Published",
  failed: "Failed",
};

export function OutboxStatusBadge({ status }: { status: OutboxStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
