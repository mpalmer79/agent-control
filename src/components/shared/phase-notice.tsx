import { Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PhaseNoticeProps {
  phase: string;
  children: React.ReactNode;
}

// A consistent notice that states what a page will contain in later phases.
// This keeps placeholder pages honest: they look intentional without pretending
// to be complete.
export function PhaseNotice({ phase, children }: PhaseNoticeProps) {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>{phase}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
