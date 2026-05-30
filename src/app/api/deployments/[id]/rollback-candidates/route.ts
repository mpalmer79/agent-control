import { failureFromUnknown, notFound, success } from "@/lib/api/responses";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { getDeploymentDetail } from "@/server/views";
import { getRollbackCandidates } from "@/server/modules/deployments/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const { id } = await params;
    const { data: deployment } = await getDeploymentDetail(correlationId, id);
    if (!deployment) {
      return notFound("Deployment not found", correlationId);
    }
    // Derive the agent key from the seed deployment id (agentKey-version-env).
    const agentKey = id.split("-")[0] ?? "";
    const { data, source } = await getRollbackCandidates(
      correlationId,
      agentKey,
    );
    return success(data, correlationId, { meta: { source } });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
