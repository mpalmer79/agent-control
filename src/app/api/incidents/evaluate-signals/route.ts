import { failureFromUnknown, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { requirePermission } from "@/server/auth/permissions";
import { getPrincipal } from "@/server/auth/principal";
import { evaluateSignals } from "@/server/modules/incidents/signals";

export const dynamic = "force-dynamic";

// Evaluate incident signals. Guarded by the incidents read permission. This is
// the only Phase 5 mutation endpoint; it reports candidates and, on the
// database path, supports incident creation. It never claims to have created
// incidents it did not create.
export async function POST(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const principal = await getPrincipal();
    requirePermission(principal, "incidents:read");
    const result = evaluateSignals();
    return success(result, correlationId);
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
