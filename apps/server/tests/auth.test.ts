import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api, registerOrganization, registerResearcher, truncateAll } from "./helpers.js";
import { prisma } from "../src/lib/prisma.js";

describe("Authentication", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterEach(async () => {
    await truncateAll();
  });

  describe("POST /api/auth/register", () => {
    it("registers a researcher and sets an auth cookie", async () => {
      const res = await api.post("/api/auth/register").send({
        email: "alice@example.com",
        password: "SuperSecret123!",
        name: "Alice",
        role: "RESEARCHER",
        researcherHandle: "alice_sec",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        email: "alice@example.com",
        role: "RESEARCHER",
      });
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.headers["set-cookie"]?.[0]).toContain("bntnx_token");
    });

    it("registers an organization with its profile", async () => {
      const res = await api.post("/api/auth/register").send({
        email: "acme@example.com",
        password: "SuperSecret123!",
        name: "Jane Doe",
        role: "ORGANIZATION",
        orgName: "Acme Corp",
        orgWebsite: "https://acme.example.com",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe("ORGANIZATION");
    });

    it("rejects a duplicate email", async () => {
      const payload = {
        email: "dup@example.com",
        password: "SuperSecret123!",
        name: "Dup",
        role: "RESEARCHER",
        researcherHandle: "dup_sec",
      };
      await api.post("/api/auth/register").send(payload);
      const res = await api.post("/api/auth/register").send(payload);
      expect(res.status).toBe(409);
    });

    it("rejects organization registration without orgName", async () => {
      const res = await api.post("/api/auth/register").send({
        email: "org2@example.com",
        password: "SuperSecret123!",
        name: "Bob",
        role: "ORGANIZATION",
      });
      expect(res.status).toBe(400);
    });

    it("rejects weak passwords", async () => {
      const res = await api.post("/api/auth/register").send({
        email: "weak@example.com",
        password: "short",
        name: "Weak",
        role: "RESEARCHER",
        researcherHandle: "weak_sec",
      });
      expect(res.status).toBe(400);
    });

    it("rejects invalid roles", async () => {
      const res = await api.post("/api/auth/register").send({
        email: "bad@example.com",
        password: "SuperSecret123!",
        name: "Bad",
        role: "ADMIN",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid credentials", async () => {
      await registerResearcher({ email: "login@example.com", researcherHandle: "login_sec" });
      const res = await api
        .post("/api/auth/login")
        .send({ email: "login@example.com", password: "Password123!" });

      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"]?.[0]).toContain("bntnx_token");
    });

    it("rejects wrong password", async () => {
      await registerResearcher({ email: "wrong@example.com", researcherHandle: "wrong_sec" });
      const res = await api
        .post("/api/auth/login")
        .send({ email: "wrong@example.com", password: "WrongPassword123!" });
      expect(res.status).toBe(401);
    });

    it("rejects unknown email", async () => {
      const res = await api
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "Whatever123!" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("requires authentication", async () => {
      const res = await api.get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns the current user with profile data", async () => {
      const reg = await registerResearcher({ email: "me@example.com", researcherHandle: "me_sec" });
      const cookie = reg.headers["set-cookie"]?.[0];
      const res = await api.get("/api/auth/me").set("Cookie", cookie!);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe("me@example.com");
      expect(res.body.data.user.researcherProfile.handle).toBe("me_sec");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears the auth cookie", async () => {
      const reg = await registerResearcher({ email: "out@example.com", researcherHandle: "out_sec" });
      const cookie = reg.headers["set-cookie"]?.[0];
      const res = await api.post("/api/auth/logout").set("Cookie", cookie!);
      expect(res.status).toBe(200);
      const cleared = res.headers["set-cookie"]?.[0] ?? "";
      expect(cleared).toContain("bntnx_token=;");
      expect(cleared).toContain("Max-Age=0");
    });
  });

  describe("Role authorization", () => {
    it("does not expose the ADMIN role to public registration", async () => {
      const res = await api.post("/api/auth/register").send({
        email: "hacker@example.com",
        password: "SuperSecret123!",
        name: "Hacker",
        role: "ADMIN",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/auth/account", () => {
    it("requires authentication", async () => {
      const res = await api.delete("/api/auth/account");
      expect(res.status).toBe(401);
    });

    it("permanently deletes the account and clears the auth cookie", async () => {
      const reg = await registerResearcher({ email: "gone@example.com", researcherHandle: "gone_sec" });
      const cookie = reg.headers["set-cookie"]?.[0];

      const res = await api.delete("/api/auth/account").set("Cookie", cookie!);
      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"]?.[0] ?? "").toContain("bntnx_token=;");

      const login = await api
        .post("/api/auth/login")
        .send({ email: "gone@example.com", password: "Password123!" });
      expect(login.status).toBe(401);
    });

    it("removes the user and its researcher profile rows", async () => {
      const reg = await registerResearcher({ email: "rows@example.com", researcherHandle: "rows_sec" });
      const cookie = reg.headers["set-cookie"]?.[0];
      const userId = reg.body.data.user.id;

      const res = await api.delete("/api/auth/account").set("Cookie", cookie!);
      expect(res.status).toBe(200);

      expect(await prisma.user.findUnique({ where: { id: userId } })).toBeNull();
      expect(await prisma.researcherProfile.findUnique({ where: { userId } })).toBeNull();
    });

    it("deletes the researcher's own reports and rewards but leaves the organization intact", async () => {
      const researcher = await registerResearcher({ email: "rep@example.com", researcherHandle: "rep_sec" });
      const researcherId = researcher.body.data.user.id;
      const cookie = researcher.headers["set-cookie"]?.[0];

      const org = await registerOrganization({ email: "rep-org@example.com", orgName: "Rep Org" });
      const orgUserId = org.body.data.user.id;
      const orgRow = await prisma.organization.findUnique({ where: { userId: orgUserId } });

      const bounty = await prisma.bounty.create({
        data: {
          title: "Cascade test bounty",
          description: "desc",
          scope: "scope",
          rules: "rules",
          rewardAmountWei: BigInt(100),
          deadline: new Date(Date.now() + 86_400_000),
          status: "ACTIVE",
          organizationId: orgRow!.id,
        },
      });

      const report = await prisma.bugReport.create({
        data: {
          title: "Researcher's report",
          description: "desc",
          severity: "HIGH",
          affectedComponent: "comp",
          stepsToReproduce: "steps",
          bountyId: bounty.id,
          researcherId,
          status: "SUBMITTED",
        },
      });

      await prisma.reward.create({
        data: {
          reportId: report.id,
          bountyId: bounty.id,
          researcherId,
          organizationId: orgRow!.id,
          status: "PENDING",
          amountWei: BigInt(50),
        },
      });

      const res = await api.delete("/api/auth/account").set("Cookie", cookie!);
      expect(res.status).toBe(200);

      expect(await prisma.user.findUnique({ where: { id: researcherId } })).toBeNull();
      expect(await prisma.bugReport.findUnique({ where: { id: report.id } })).toBeNull();
      expect(await prisma.reward.count({ where: { researcherId } })).toBe(0);
      expect(await prisma.bounty.findUnique({ where: { id: bounty.id } })).not.toBeNull();
      expect(await prisma.user.findUnique({ where: { id: orgUserId } })).not.toBeNull();
    });

    it("only affects the authenticated user's account", async () => {
      const keeper = await registerResearcher({ email: "keeper@example.com", researcherHandle: "keeper_sec" });
      const deleter = await registerOrganization({ email: "deleter@example.com", orgName: "Deleter Org" });

      const res = await api
        .delete("/api/auth/account")
        .set("Cookie", deleter.headers["set-cookie"]?.[0]!);
      expect(res.status).toBe(200);

      const login = await api
        .post("/api/auth/login")
        .send({ email: "keeper@example.com", password: "Password123!" });
      expect(login.status).toBe(200);
      expect(login.body.data.user.email).toBe("keeper@example.com");
    });
  });
});
