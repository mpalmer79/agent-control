import { StatusBadge } from "@/components/shared/status-badge";
import { RISK_LEVEL_INTENT, RISK_LEVEL_LABELS } from "@/lib/constants/status";
import type { RiskLevel } from "@/types/domain";

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  return (
    <StatusBadge
      label={RISK_LEVEL_LABELS[riskLevel]}
      intent={RISK_LEVEL_INTENT[riskLevel]}
    />
  );
}
