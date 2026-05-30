import { Badge } from "@/components/ui/badge";
import type { EnvironmentName } from "@/types/domain";

const LABELS: Record<EnvironmentName, string> = {
  development: "Development",
  staging: "Staging",
  production: "Production",
};

export function EnvironmentBadge({
  environment,
}: {
  environment: EnvironmentName;
}) {
  const variant = environment === "production" ? "destructive" : "secondary";
  return <Badge variant={variant}>{LABELS[environment]}</Badge>;
}
