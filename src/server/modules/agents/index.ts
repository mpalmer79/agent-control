import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const agentsModule: ModuleDescriptor = {
  name: "agents",
  description:
    "Agent identity, versions, ownership, status, and risk classification.",
  phase: "Phase 3",
};
