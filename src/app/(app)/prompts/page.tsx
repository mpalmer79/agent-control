import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = { title: "Prompts" };

export default function PromptsPage() {
  return (
    <PlaceholderPage
      title="Prompts"
      description="Versioned prompts treated as production assets, with diff and rollback."
      phase="Phase 3: Control plane modules"
      summary={[
        { label: "Prompts", value: "6" },
        { label: "Versions", value: "18" },
        { label: "Pending review", value: "1" },
        { label: "Immutable", value: "Yes" },
      ]}
      upcoming={[
        "Prompt registry with version history",
        "Immutable prompt versions, where editing creates a new version",
        "Side-by-side version diff review",
        "Rollback to a prior prompt version",
      ]}
    />
  );
}
