import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isClerkConfigured } from "@/lib/config/env";
import { PRODUCT } from "@/lib/constants/product";
import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = { title: "Sign up" };

// Sign-up route. When Clerk is configured the Clerk SignUp widget is rendered.
// Without credentials a minimal placeholder keeps the route reviewable.
export default async function SignUpPage() {
  if (isClerkConfigured()) {
    const { SignUp } = await import("@clerk/nextjs");
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <SignUp />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">
        Create a {PRODUCT.name} account
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Authentication is provided by Clerk. Configure Clerk environment
        variables to enable sign up. The control plane shell is available for
        review without credentials.
      </p>
      <Button asChild>
        <Link href={ROUTES.dashboard}>Continue to dashboard</Link>
      </Button>
    </div>
  );
}
