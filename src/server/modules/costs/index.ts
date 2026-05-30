import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const costsModule: ModuleDescriptor = {
  name: "costs",
  description:
    "Token usage and estimated spend with per-agent aggregation and budget signals.",
  phase: "Phase 5",
};
