import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { api, registerOrganization, registerResearcher, truncateAll } from "./helpers.js";

const validBounty = {
  title: "RCE in File Upload Endpoint",
  description:
    "We seek vulnerabilities in our file upload and processing pipeline including path traversal, malware upload and denial of service vectors.",
  scope: "https://upload.example.com",
  rules:
    "Do not test on production data. Report responsibly and do not exfiltrate user information.",
  rewardAmountWei: "1000000000000000000",
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  severities: [
    { level: "CRITICAL", rewardWei: "500000000000000000" },
    { level: "HIGH", rewardWei: "300000000000000000" },
    { level: "MEDIUM", rewardWei: "150000000000000000" },
    { level: "LOW", rewardWei: "50000000000000000" },
  ],
};

const validReport = {
  title: "Path traversal in upload endpoint",
  description:
    "The file upload endpoint allows path traversal via crafted filenames enabling writes outside the upload directory.",
  severity: "HIGH",
  affectedComponent: "FileUploadService",
  stepsToReproduce:
    "1. Authenticate to the app. 2. Intercept the upload request. 3. Modify the filename to ../../etc/something. 4. Observe the file lands outside the sandbox.",
  proofOfConcept: "curl -X POST -F 'file=@x.txt;filename=../../evil.txt' https://upload.example.com",
};

describe("Bug Reports", () => {
  let orgCookie: string;
  let researcherCookie: string;
  let researcherId: string;
  let bountyId: string;
  let activeBountyId: string;

  beforeEach(async () => {
    await truncateAll();

    const orgReg = await registerOrganization();
    orgCookie = orgReg.headers["set-cookie"]?.[0]!;

    const resReg = await registerResearcher();
    researcherCookie = resReg.headers["set-cookie"]?.[0]!;
    researcherId = resReg.body.data.user.id;

    // Give the researcher a wallet (needed for submissions)
    await prisma.wallet.create({
      data: { address: "0xResearcherWallet0000000000000000000000000001", userId: researcherId },
    });

    // Create an ACTIVE, funded bounty
    const createRes = await api.post("/api/bounties").set("Cookie", orgCookie!).send(validBounty);
    bountyId = createRes.body.data.bounty.id;
    activeBountyId = createRes.body.data.bounty.id;
    await prisma.bounty.update({
      where: { id: activeBountyId },
      data: { status: "ACTIVE", isFunded: true },
    });
  });

  afterEach(async () => {
    await truncateAll();
  });

  describe("POST /api/reports", () => {
    it("submits a report to an active bounty", async () => {
      const res = await api
        .post("/api/reports")
        .set("Cookie", researcherCookie!)
        .send({ ...validReport, bountyId });

      expect(res.status).toBe(201);
      expect(res.body.data.report.status).toBe("SUBMITTED");
    });

    it("rejects guests", async () => {
      const res = await api.post("/api/reports").send({ ...validReport, bountyId });
      expect(res.status).toBe(401);
    });

    it("rejects an organization from submitting reports", async () => {
      const res = await api
        .post("/api/reports")
        .set("Cookie", orgCookie!)
        .send({ ...validReport, bountyId });
      expect(res.status).toBe(403);
    });

    it("rejects reports to draft bounties", async () => {
      const draftRes = await api
        .post("/api/bounties")
        .set("Cookie", orgCookie!)
        .send({ ...validBounty, title: "A different draft bounty program" });
      const draftId = draftRes.body.data.bounty.id;

      const res = await api
        .post("/api/reports")
        .set("Cookie", researcherCookie!)
        .send({ ...validReport, bountyId: draftId });
      expect(res.status).toBe(400);
    });

    it("requires a connected wallet", async () => {
      const resReg2 = await registerResearcher();
      const noWalletCookie = resReg2.headers["set-cookie"]?.[0]!;
      const res = await api
        .post("/api/reports")
        .set("Cookie", noWalletCookie!)
        .send({ ...validReport, bountyId });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/reports/my", () => {
    it("lists reports for the researcher", async () => {
      await api.post("/api/reports").set("Cookie", researcherCookie!).send({ ...validReport, bountyId });
      const res = await api.get("/api/reports/my").set("Cookie", researcherCookie!);
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });
  });

  describe("PATCH /api/reports/:id/status", () => {
    it("lets the organization accept a report and assign a severity reward", async () => {
      const createRes = await api
        .post("/api/reports")
        .set("Cookie", researcherCookie!)
        .send({ ...validReport, bountyId });
      const reportId = createRes.body.data.report.id;

      const res = await api
        .patch(`/api/reports/${reportId}/status`)
        .set("Cookie", orgCookie!)
        .send({ status: "ACCEPTED", reviewNote: "Valid issue, confirmed" });

      expect(res.status).toBe(200);
      expect(res.body.data.report.status).toBe("ACCEPTED");
      expect(res.body.data.report.rewardWei).toBe("300000000000000000");
    });

    it("lets the organization reject a report", async () => {
      const createRes = await api
        .post("/api/reports")
        .set("Cookie", researcherCookie!)
        .send({ ...validReport, bountyId });
      const reportId = createRes.body.data.report.id;

      const res = await api
        .patch(`/api/reports/${reportId}/status`)
        .set("Cookie", orgCookie!)
        .send({ status: "REJECTED", reviewNote: "Out of scope" });
      expect(res.status).toBe(200);
      expect(res.body.data.report.status).toBe("REJECTED");
    });

    it("blocks a researcher from changing status", async () => {
      const createRes = await api
        .post("/api/reports")
        .set("Cookie", researcherCookie!)
        .send({ ...validReport, bountyId });
      const reportId = createRes.body.data.report.id;

      const res = await api
        .patch(`/api/reports/${reportId}/status`)
        .set("Cookie", researcherCookie!)
        .send({ status: "ACCEPTED" });
      expect(res.status).toBe(403);
    });

    it("blocks another org from reviewing", async () => {
      const createRes = await api
        .post("/api/reports")
        .set("Cookie", researcherCookie!)
        .send({ ...validReport, bountyId });
      const reportId = createRes.body.data.report.id;

      const otherOrg = await registerOrganization({ email: `rival-${Date.now()}@example.com` });
      const res = await api
        .patch(`/api/reports/${reportId}/status`)
        .set("Cookie", otherOrg.headers["set-cookie"]?.[0]!)
        .send({ status: "ACCEPTED" });
      expect(res.status).toBe(403);
    });

    it("rejects transitioning a rejected report back to accepted", async () => {
      const createRes = await api
        .post("/api/reports")
        .set("Cookie", researcherCookie!)
        .send({ ...validReport, bountyId });
      const reportId = createRes.body.data.report.id;

      await api
        .patch(`/api/reports/${reportId}/status`)
        .set("Cookie", orgCookie!)
        .send({ status: "REJECTED" });
      const res = await api
        .patch(`/api/reports/${reportId}/status`)
        .set("Cookie", orgCookie!)
        .send({ status: "ACCEPTED" });
      expect(res.status).toBe(400);
    });
  });
});
