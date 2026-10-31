/**
 * Key2Drive Prisma Client Singleton
 * Path: src/lib/db.ts
 *
 * Ensures a single shared PrismaClient instance across hot-reloading
 * in Next.js development and handles Vercel serverless read-only filesystem
 * by routing SQLite to /tmp/dev.db when running in serverless environments.
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function initializeDatabaseUrl() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDb = "/tmp/dev.db";
    if (!fs.existsSync(tmpDb)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.join(__dirname, "..", "..", "prisma", "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDb);
            break;
          } catch (e) {
            console.error("Failed to copy SQLite database to /tmp:", e);
          }
        }
      }
    }
    if (fs.existsSync(tmpDb)) {
      process.env.DATABASE_URL = `file:${tmpDb}`;
    }
  }
}

initializeDatabaseUrl();

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
