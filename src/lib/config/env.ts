// Environment configuration access.
//
// The shell is reviewable without real credentials. Optional variables (Clerk,
// database) are read defensively so local rendering of the static shell does
// not crash when they are absent. Secrets are never logged.

function readOptional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: readOptional("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  environmentLabel: readOptional("NEXT_PUBLIC_ENVIRONMENT") ?? "development",
  demoMode: readOptional("NEXT_PUBLIC_DEMO_MODE") !== "false",
  databaseUrl: readOptional("DATABASE_URL"),
  clerk: {
    publishableKey: readOptional("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    signInUrl: readOptional("NEXT_PUBLIC_CLERK_SIGN_IN_URL") ?? "/sign-in",
    signUpUrl: readOptional("NEXT_PUBLIC_CLERK_SIGN_UP_URL") ?? "/sign-up",
  },
} as const;

// True when Clerk is configured. When false, the shell renders without
// requiring authentication so reviewers can inspect the static UI.
export const isClerkConfigured = (): boolean =>
  Boolean(
    env.clerk.publishableKey && env.clerk.publishableKey.startsWith("pk_"),
  );

// True when a database connection is configured.
export const isDatabaseConfigured = (): boolean => Boolean(env.databaseUrl);
