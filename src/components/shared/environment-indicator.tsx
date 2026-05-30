import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/config/env";

// Shows the current environment label in the header so reviewers always know
// which environment they are viewing.
export function EnvironmentIndicator() {
  const label = env.environmentLabel;
  const variant = label === "production" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}
