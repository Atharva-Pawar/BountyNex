import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api, registerOrganization, registerResearcher, truncateAll } from "./helpers.js";

const validBounty = {
  title: "Vulnerability in Authentication Module",
  description:
    "We are looking for security vulnerabilities in our authentication module including session handling, token validation and password reset flows.",
  scope: "https://app.example.com, https://api.example.com, https://admin.example.com",
  rules:
    "Only test against your own accounts. Do not perform DoS attacks. Do not access other users' data.",
  rewardAmountWei: "1000000000000000000", // 1 ETH
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  severities: [
    { level: "CRITICAL", rewardWei: "500000000000000000" },
    { level: "HIGH", rewardWei: "300000000000000000" },
    { level: "MEDIUM", rewardWei: "150000000000000000" },
    { level: "LOW", rewardWei: "50000000000000000" },
  ],
};

describe("Bounties", () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterEach(async () => {
    await truncateAll();
  });

  async function createBountyAsOrg() {
    const reg = await registerOrganization();
    const cookie = reg.headers["set-cookie"]?.[0];
    const res = await api
      .post("/api/bounties")
      .set("Cookie", cookie!)
      .send(validBounty);
    return { cookie, bounty: res.body.data.bounty, res };
  }

  describe("POST /api/bounties", () => {
    it("lets an organization create a draft bounty", async () => {
      const reg = await registerOrganization();
      const cookie = reg.headers["set-cookie"]?.[0];
      const res = await api
        .post("/api/bounties")
        .set("Cookie", cookie!)
        .send(validBounty);

      expect(res.status).toBe(201);
      expect(res.body.data.bounty.status).toBe("DRAFT");
      expect(res.body.data.bounty.severities).toHaveLength(4);
      expect(res.body.data.bounty.rewardAmountWei).toBe("1000000000000000000");
    });

    it("rejects a researcher creating a bounty", async () => {
      const reg = await registerResearcher();
      const cookie = reg.headers["set-cookie"]?.[0];
      const res = await api
        .post("/api/bounties")
        .set("Cookie", cookie!)
        .send(validBounty);
      expect(res.status).toBe(403);
    });

    it("rejects unauthenticated bounty creation", async () => {
      const res = await api.post("/api/bounties").send(validBounty);
      expect(res.status).toBe(401);
    });

    it("rejects severity rewards that exceed the total reward", async () => {
      const reg = await registerOrganization();
      const cookie = reg.headers["set-cookie"]?.[0];
      const res = await api
        .post("/api/bounties")
        .set("Cookie", cookie!)
        .send({
          ...validBounty,
          severities: [
            { level: "CRITICAL", rewardWei: "900000000000000000" },
            { level: "HIGH", rewardWei: "300000000000000000" },
          ],
        });
      expect(res.status).toBe(400);
    });

    it("rejects a past deadline", async () => {
      const reg = await registerOrganization();
      const cookie = reg.headers["set-cookie"]?.[0];
      const res = await api
        .post("/api/bounties")
        .set("Cookie", cookie!)
        .send({ ...validBounty, deadline: new Date(Date.now() - 1000).toISOString() });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/bounties", () => {
    it("returns only published bounties to guests", async () => {
      const { bounty, res } = await createBountyAsOrg();
      expect(res.status).toBe(201);

      // Draft is not visible to guests
      const list = await api.get("/api/bounties");
      expect(list.status).toBe(200);
      expect(list.body.data.items).toHaveLength(0);

      // Once funded + active it becomes public
      const { prisma } = await import("../src/lib/prisma.js");
      await prisma.bounty.update({
        where: { id: bounty.id },
        data: { status: "ACTIVE", isFunded: true },
      });

      const list2 = await api.get("/api/bounties");
      expect(list2.body.data.items).toHaveLength(1);
      expect(list2.body.data.items[0].status).toBe("ACTIVE");
    });

    it("supports search and reward filters", async () => {
      await createBountyAsOrg();
      await createBountyAsOrg();

      const res = await api.get("/api/bounties?q=Authentication");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });
  });

  describe("GET /api/bounties/:id", () => {
    it("hides draft bounties from guests", async () => {
      const { bounty } = await createBountyAsOrg();
      const res = await api.get(`/api/bounties/${bounty.id}`);
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/bounties/:id", () => {
    it("prevents editing another org's bounty", async () => {
      const { bounty } = await createBountyAsOrg();
      const other = await registerOrganization({ email: `other-${Date.now()}@example.com` });
      const otherCookie = other.headers["set-cookie"]?.[0];
      const res = await api
        .patch(`/api/bounties/${bounty.id}`)
        .set("Cookie", otherCookie!)
        .send({ title: "Hijacked title" });
      expect(res.status).toBe(403);
    });

    it("lets the owner update a draft bounty", async () => {
      const { cookie, bounty } = await createBountyAsOrg();
      const res = await api
        .patch(`/api/bounties/${bounty.id}`)
        .set("Cookie", cookie!)
        .send({ title: "Updated authentication bounty" });
      expect(res.status).toBe(200);
      expect(res.body.data.bounty.title).toBe("Updated authentication bounty");
    });
  });

  describe("DELETE /api/bounties/:id", () => {
    it("deletes a draft bounty by owner", async () => {
      const { cookie, bounty } = await createBountyAsOrg();
      const res = await api.delete(`/api/bounties/${bounty.id}`).set("Cookie", cookie!);
      expect(res.status).toBe(200);
    });
  });
});
