import { failureFromUnknown, success } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/parse";
import { requestPromotionSchema } from "@/lib/validation";
import { correlationIdFromRequest } from "@/lib/observability/correlation";
import { promoteDeployment } from "@/server/modules/deployments/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const correlationId = correlationIdFromRequest(request);
  try {
    const body = await parseJson(request, requestPromotionSchema);
    const result = await promoteDeployment(correlationId, {
      deploymentId: body.deploymentId,
      request: true,
    });
    return success(result, correlationId, {
      status: result.status === "blocked" ? 422 : 200,
    });
  } catch (error) {
    return failureFromUnknown(error, correlationId);
  }
}
