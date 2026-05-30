import { DemoModeIndicator } from "@/components/shared/demo-mode-indicator";
import { EnvironmentIndicator } from "@/components/shared/environment-indicator";
import { MobileNav } from "@/components/layout/mobile-nav";

// Top header for the application shell. Shows navigation trigger on small
// screens and environment context on the right.
export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <p className="text-sm font-medium text-muted-foreground">
          Control plane
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DemoModeIndicator />
        <EnvironmentIndicator />
      </div>
    </header>
  );
}
