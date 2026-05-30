import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

// A Prisma transaction client. Repository methods that participate in a
// workflow accept this so the same code runs against the base client or inside
// a `prisma.$transaction(...)` callback. This is the first argument of the
// interactive transaction callback.
export type PrismaTransactionClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

// Either the base client or a transaction client. Repository methods default to
// the base client when no transaction is provided.
export type Db = PrismaClient | PrismaTransactionClient;

export function db(tx?: Db): Db {
  return tx ?? prisma;
}
