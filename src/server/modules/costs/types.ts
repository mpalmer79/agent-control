import type { EnvironmentName } from "@/types/domain";

export interface CostRecordInput {
  agentId?: string;
  modelId?: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  environment: EnvironmentName;
  correlationId: string;
}
