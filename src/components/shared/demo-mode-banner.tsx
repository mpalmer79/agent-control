import { FlaskConical } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DataSource } from "@/types/views";

// Shown when a page is rendering seed-derived demo data rather than database
// data, so reviewers always know the data source.
export function DemoModeBanner({ source }: { source: DataSource }) {
  if (source === "database") {
    return null;
  }
  return (
    <Alert variant="warning">
      <FlaskConical className="h-4 w-4" />
      <AlertTitle>Demo data</AlertTitle>
      <AlertDescription>
        This view is showing seed-derived demo data with a simulated runtime. No
        database is configured and no live provider calls are made.
      </AlertDescription>
    </Alert>
  );
}
