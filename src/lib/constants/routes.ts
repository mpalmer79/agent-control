// Canonical application routes. Keep this as the single source for navigation
// targets so links and the navigation config stay consistent.

export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  walkthrough: "/walkthrough",
  agents: "/agents",
  prompts: "/prompts",
  deployments: "/deployments",
  governance: "/governance",
  evaluations: "/evaluations",
  observability: "/observability",
  incidents: "/incidents",
  traces: "/traces",
  audit: "/audit",
  settings: "/settings",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export type RouteKey = keyof typeof ROUTES;
