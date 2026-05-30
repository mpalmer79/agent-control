import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const promptsModule: ModuleDescriptor = {
  name: "prompts",
  description:
    "Immutable, versioned prompts with diff and rollback. Edits create new versions.",
  phase: "Phase 3",
};
