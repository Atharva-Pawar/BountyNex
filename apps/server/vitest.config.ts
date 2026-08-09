import { defineConfig } from "vitest/config";

const testUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    hookTimeout: 60_000,
    testTimeout: 30_000,
    sequence: {
      concurrent: false,
    },
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: testUrl ?? "",
      JWT_SECRET: "test-secret-at-least-sixteen-characters",
      JWT_COOKIE_NAME: "bntnx_token",
      CLIENT_ORIGIN: "http://localhost:5173",
      PORT: "0",
    },
  },
});
