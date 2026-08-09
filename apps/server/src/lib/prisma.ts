import { PrismaClient } from "@prisma/client";
import { env, isTest } from "../config/env.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isTest ? [] : env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (!isTest) {
  globalForPrisma.prisma = prisma;
}
