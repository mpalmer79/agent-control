// Agent Control seed CLI.
//
// Loads the demo scenario described in SEED_DATA_PLAN.md into PostgreSQL by
// calling the shared runDemoSeed routine (also used by the guarded demo reset
// endpoint). The data is fictional, contains no secrets, and is idempotent.
//
// Run with: npm run seed (requires DATABASE_URL).

import { PrismaClient } from "@prisma/client";

import { runDemoSeed } from "../src/server/modules/demo/seed-runner";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const counts = await runDemoSeed(prisma);
  console.log("Seed complete", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
