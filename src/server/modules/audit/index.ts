import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const auditModule: ModuleDescriptor = {
  name: "audit",
  description:
    "Append-only audit history linked by correlation IDs, searchable and exportable.",
  phase: "Phase 3 onward",
};
