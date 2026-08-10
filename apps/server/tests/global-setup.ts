import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(__dirname, "..");

/**
 * Test database preparation:
 *  - Requires DATABASE_URL_TEST pointing at a disposable Postgres database.
 *  - Applies the schema using `prisma db push --force-reset` so every run
 *    starts from a clean slate.
 */
export default function globalSetup() {
  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    throw new Error(
      "DATABASE_URL_TEST is required to run tests. Set it to a disposable PostgreSQL/Neon database.",
    );
  }

  const env = { ...process.env, DATABASE_URL: testUrl };
  const schemaPath = resolve(serverRoot, "prisma/schema.prisma");
  if (!existsSync(schemaPath)) {
    throw new Error(`Prisma schema not found at ${schemaPath}`);
  }

  execSync(`npx prisma db push --force-reset`, {
    cwd: serverRoot,
    env,
    stdio: "inherit",
  });
}
