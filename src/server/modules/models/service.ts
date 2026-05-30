import { load, toDomainEnum } from "@/server/data-source";
import { seedModels } from "@/data/seed";
import { modelRepository } from "@/server/repositories";
import type { RiskLevel } from "@/types/domain";

export interface ModelListItem {
  id: string;
  displayName: string;
  provider: string;
  riskLevel: RiskLevel;
  enabledForProduction: boolean;
}

export function listModels(correlationId: string) {
  // Models are a shared registry, so no organization scoping is required.
  return load<ModelListItem[]>(
    correlationId,
    async () => {
      const rows = await modelRepository.list();
      return rows.map((row) => ({
        id: row.id,
        displayName: row.displayName,
        provider: row.provider.name,
        riskLevel: toDomainEnum<RiskLevel>(row.riskLevel),
        enabledForProduction: row.enabledForProduction,
      }));
    },
    () =>
      seedModels.map((model) => ({
        id: model.key,
        displayName: model.displayName,
        provider: model.providerKey,
        riskLevel: toDomainEnum<RiskLevel>(model.riskLevel),
        enabledForProduction: model.enabledForProduction,
      })),
  );
}
