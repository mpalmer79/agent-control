import type { RiskLevel } from "@/types/domain";

export interface ModelRecord {
  id: string;
  providerKey: string;
  modelKey: string;
  displayName: string;
  contextWindow: number;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  riskLevel: RiskLevel;
  enabledForProduction: boolean;
}
