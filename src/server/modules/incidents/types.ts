import type { IncidentSeverity, IncidentStatus } from "@/types/domain";

export type IncidentTrigger =
  | "cost_spike"
  | "error_rate"
  | "bad_prompt_deployment"
  | "provider_outage";

export interface IncidentRecord {
  id: string;
  title: string;
  agentId?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  trigger: IncidentTrigger;
  correlationId: string;
}
