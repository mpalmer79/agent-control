import Link from "next/link";
import { Workflow } from "lucide-react";

import { cn } from "@/lib/utils";

// Links to the trace detail page for a correlation ID.
export function TraceLink({
  correlationId,
  className,
}: {
  correlationId: string;
  className?: string;
}) {
  return (
    <Link
      href={`/traces/${correlationId}`}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline",
        className,
      )}
    >
      <Workflow className="h-3 w-3" aria-hidden="true" />
      {correlationId}
    </Link>
  );
}
