import type { EvaluationStatus } from "@/types/domain";

export type EvaluationCategory =
  | "functional"
  | "safety"
  | "cost"
  | "quality"
  | "regression"
  | "format";

export interface EvaluationRunRecord {
  id: string;
  agentVersionId: string;
  suiteName: string;
  category: EvaluationCategory;
  status: EvaluationStatus;
  score?: number;
  passed?: boolean;
}
