// Seed organization, environments, and users. Realistic but fictional. No real
// customer data and no secrets. Aligns with SEED_DATA_PLAN.md.

export const seedOrganization = {
  slug: "demo-org",
  name: "Northwind AI Platform",
};

export const seedEnvironments = [
  { name: "DEVELOPMENT", description: "Engineering work" },
  { name: "STAGING", description: "Pre-production verification" },
  { name: "PRODUCTION", description: "Live production environment" },
] as const;

export const seedUsers = [
  {
    key: "dana",
    email: "dana.reyes@example.com",
    fullName: "Dana Reyes",
    role: "ADMINISTRATOR",
  },
  {
    key: "alex",
    email: "alex.kim@example.com",
    fullName: "Alex Kim",
    role: "PLATFORM_ENGINEER",
  },
  {
    key: "priya",
    email: "priya.shah@example.com",
    fullName: "Priya Shah",
    role: "REVIEWER",
  },
  {
    key: "sam",
    email: "sam.cole@example.com",
    fullName: "Sam Cole",
    role: "AUDITOR",
  },
  {
    key: "morgan",
    email: "morgan.lee@example.com",
    fullName: "Morgan Lee",
    role: "EXECUTIVE",
  },
] as const;
