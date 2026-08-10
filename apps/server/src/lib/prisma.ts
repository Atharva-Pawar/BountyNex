import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env, isTest } from "../config/env.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isTest ? [] : env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (!isTest) {
  globalForPrisma.prisma = prisma;
}
