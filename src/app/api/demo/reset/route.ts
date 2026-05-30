import { failureFromUnknown, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { resetDemoData } from "@/server/modules/demo/service";

export const dynamic = "force-dynamic";

// Reset the demo dataset. Guarded so it cannot run in production unless
// explicitly allowed. Returns a typed result describing what happened.
export async function POST(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const result = await resetDemoData(correlationId);
    return success(result, correlationId);
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
