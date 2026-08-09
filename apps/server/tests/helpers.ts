import type { Server } from "node:http";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

const app = createApp();

export function testServer(): Server {
  return app.listen(0);
}

export async function truncateAll() {
  const tables = [
    "admin_actions",
    "blockchain_transactions",
    "rewards",
    "evidence",
    "bug_reports",
    "bounty_severities",
    "bounties",
    "wallets",
    "researcher_profiles",
    "organizations",
    "users",
  ];
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`)),
  );
}

export const api = request(app);

export async function registerResearcher(
  overrides: Record<string, unknown> = {},
): Promise<{ body: { data: { user: { id: string; email: string } } } }> {
  const res = await api.post("/api/auth/register").send({
    email: `researcher-${Date.now()}@example.com`,
    password: "Password123!",
    name: "Test Researcher",
    role: "RESEARCHER",
    researcherHandle: `researcher_${Date.now().toString(36)}`,
    ...overrides,
  });
  if (res.status !== 201) {
    throw new Error(`registerResearcher failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res;
}

export async function registerOrganization(
  overrides: Record<string, unknown> = {},
): Promise<{ body: { data: { user: { id: string; email: string } } } }> {
  const res = await api.post("/api/auth/register").send({
    email: `org-${Date.now()}@example.com`,
    password: "Password123!",
    name: "Test Org Owner",
    role: "ORGANIZATION",
    orgName: "Test Organization",
    ...overrides,
  });
  if (res.status !== 201) {
    throw new Error(`registerOrganization failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res;
}

export async function loginAs(email: string, password = "Password123!") {
  return api.post("/api/auth/login").send({ email, password });
}
