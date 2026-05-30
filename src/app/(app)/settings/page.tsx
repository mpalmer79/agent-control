import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Members and roles, the model registry, and environment configuration."
      phase="Phase 2 onward: Platform configuration"
      summary={[
        { label: "Roles", value: "5" },
        { label: "Models", value: "5" },
        { label: "Environments", value: "3" },
        { label: "Auth", value: "Clerk" },
      ]}
      upcoming={[
        "Members and role-based access control management",
        "Model registry with provider, cost, and risk metadata",
        "Environment configuration for development, staging, and production",
        "Organization-scoped settings with tenant isolation",
      ]}
    />
  );
}
