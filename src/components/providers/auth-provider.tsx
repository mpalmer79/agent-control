import { ClerkProvider } from "@clerk/nextjs";

import { isClerkConfigured } from "@/lib/config/env";

// Wrap the application in ClerkProvider only when Clerk is configured. This
// keeps the static shell reviewable locally without real credentials, while
// enabling full authentication once keys are present.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
