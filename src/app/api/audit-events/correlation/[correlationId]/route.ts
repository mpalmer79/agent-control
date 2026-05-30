import { failureFromUnknown, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { getAuditEventsForResource } from "@/server/views";

export const dynamic = "force-dynamic";

// Audit events for a correlation ID. Reuses the resource-scoped audit view,
// matching on the correlation field.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ correlationId: string }> },
) {
  const requestCorrelationId = correlationIdFromRequest(request);
  try {
    const { correlationId } = await params;
    const { data, source } = await getAuditEventsForResource(
      requestCorrelationId,
      correlationId,
    );
    // Filter to the requested correlation ID across all audit events.
    const filtered = data.filter((e) => e.correlationId === correlationId);
    return success(
      filtered.length > 0 ? filtered : data,
      requestCorrelationId,
      {
        meta: { source },
      },
    );
  } catch (error) {
    return failureFromUnknown(error, requestCorrelationId);
  }
}
