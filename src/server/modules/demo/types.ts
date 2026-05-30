// The demo module coordinates seeded demo data and the simulated runtime. The
// MVP never makes live provider calls; demo telemetry is generated to match the
// shape of a real runtime so the transition in later phases is seamless.
export interface DemoScenario {
  organizationSlug: string;
  description: string;
}
