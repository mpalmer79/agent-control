import { PrismaClient } from "@prisma/client";

// Singleton Prisma client.
//
// The client is constructed only when DATABASE_URL is present. This keeps the
// application importable for review and for `next build` when no database is
// configured. If a caller reaches the client without a database configured, a
// clear error is thrown. The service layer always checks isDatabaseConfigured
// before using the client, so this guard is a safety net, not a normal path.
//
// In development the instance is cached on globalThis to avoid exhausting
// connections across hot reloads.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function createUnavailableClient(): PrismaClient {
  // A proxy that throws on first use, so importing this module never fails when
  // DATABASE_URL is absent.
  return new Proxy({} as PrismaClient, {
    get() {
      throw new Error(
        "Database is not configured. Set DATABASE_URL to use Prisma.",
      );
    },
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL ? createClient() : createUnavailableClient());

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma;
}
