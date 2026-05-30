import { FlaskConical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/config/env";

// Indicates that the application is running on seeded demo data with a simulated
// runtime. Rendered only when demo mode is active.
export function DemoModeIndicator() {
  if (!env.demoMode) {
    return null;
  }
  return (
    <Badge variant="warning" className="gap-1">
      <FlaskConical className="h-3 w-3" />
      Demo mode
    </Badge>
  );
}
