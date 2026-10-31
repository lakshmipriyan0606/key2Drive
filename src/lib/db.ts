/**
 * Key2Drive Prisma Client Singleton
 * Path: src/lib/db.ts
 *
 * Ensures a single shared PrismaClient instance across hot-reloading
 * in Next.js development and prevents SQLite connection/lock exhaustion.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
