import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api, registerOrganization, registerResearcher, truncateAll } from "./helpers.js";

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
});
