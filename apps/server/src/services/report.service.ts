import type { EvidenceKind, ReportStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/http.js";
import { uploadEvidence as pushToCloudinary } from "./cloudinary.service.js";

export interface CreateReportInput {
  bountyId: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  affectedComponent: string;
  stepsToReproduce: string;
  proofOfConcept?: string;
}

const TERMINAL = new Set<ReportStatus>(["ACCEPTED", "REJECTED", "REWARDED"]);

const TRANSITIONS: Record<string, ReportStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED"],
  UNDER_REVIEW: ["NEEDS_INFORMATION", "ACCEPTED", "REJECTED"],
  NEEDS_INFORMATION: ["UNDER_REVIEW", "ACCEPTED", "REJECTED"],
  ACCEPTED: ["REWARDED"],
  REJECTED: [],
  REWARDED: [],
};

function canTransition(from: ReportStatus, to: ReportStatus): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export async function createReport(researcherId: string, input: CreateReportInput) {
  const researcher = await prisma.researcherProfile.findUnique({
    where: { userId: researcherId },
  });
  if (!researcher) throw ApiError.forbidden("Researcher profile required to submit reports");

  const wallet = await prisma.wallet.findUnique({ where: { userId: researcherId } });
  if (!wallet || !wallet.isActive) {
    throw ApiError.badRequest("Connect a wallet before submitting a report");
  }

  const bounty = await prisma.bounty.findUnique({ where: { id: input.bountyId } });
  if (!bounty) throw ApiError.notFound("Bounty not found");
  if (bounty.status !== "ACTIVE") {
    throw ApiError.badRequest("Reports can only be submitted to active bounties");
  }
  if (bounty.deadline.getTime() < Date.now()) {
    throw ApiError.badRequest("This bounty has passed its submission deadline");
  }

  return prisma.bugReport.create({
    data: {
      bountyId: input.bountyId,
      researcherId,
      title: input.title,
      description: input.description,
      severity: input.severity,
      affectedComponent: input.affectedComponent,
      stepsToReproduce: input.stepsToReproduce,
      proofOfConcept: input.proofOfConcept ?? null,
    },
    include: { evidence: true },
  });
}

export async function listMyReports(researcherId: string, status?: ReportStatus, page = 1, limit = 12) {
  const where = { researcherId, ...(status ? { status } : {}) };
  const [items, total] = await Promise.all([
    prisma.bugReport.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        bounty: { select: { id: true, title: true, rewardAmountWei: true } },
        reward: true,
        evidence: true,
        _count: { select: { evidence: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bugReport.count({ where }),
  ]);
  return { items, total };
}

export async function listBountyReports(bountyId: string, organizationId: string, status?: ReportStatus) {
  const bounty = await prisma.bounty.findFirst({
    where: { id: bountyId, organizationId },
  });
  if (!bounty) throw ApiError.forbidden("You do not own this bounty");

  return prisma.bugReport.findMany({
    where: { bountyId, ...(status ? { status } : {}) },
    orderBy: { submittedAt: "desc" },
    include: {
      researcher: {
        select: {
          id: true,
          name: true,
          researcherProfile: { select: { handle: true } },
          wallet: { select: { address: true } },
        },
      },
      evidence: true,
      reward: true,
    },
  });
}

export async function listOrgReports(organizationId: string, status?: ReportStatus) {
  const org = await prisma.organization.findUnique({ where: { userId: organizationId } });
  if (!org) throw ApiError.forbidden("Organization profile required");

  return prisma.bugReport.findMany({
    where: { bounty: { organizationId: org.id }, ...(status ? { status } : {}) },
    orderBy: { submittedAt: "desc" },
    include: {
      bounty: { select: { id: true, title: true, rewardAmountWei: true } },
      researcher: {
        select: {
          id: true,
          name: true,
          researcherProfile: { select: { handle: true } },
          wallet: { select: { address: true } },
        },
      },
      evidence: true,
      reward: true,
      _count: { select: { evidence: true } },
    },
  });
}

export async function getReport(reportId: string, viewer: { id: string; role: string }) {
  const report = await prisma.bugReport.findUnique({
    where: { id: reportId },
    include: {
      bounty: {
        include: {
          organization: { select: { id: true, userId: true, name: true } },
          severities: true,
        },
      },
      researcher: {
        select: {
          id: true,
          name: true,
          researcherProfile: { select: { handle: true } },
          wallet: { select: { address: true } },
        },
      },
      evidence: true,
      reward: true,
    },
  });

  if (!report) throw ApiError.notFound("Report not found");

  const isOrg = viewer.role === "ORGANIZATION"
    ? report.bounty.organization.userId === viewer.id
    : false;
  const isOwner = report.researcherId === viewer.id;

  if (!isOrg && !isOwner) throw ApiError.forbidden("You cannot view this report");
  return { report, isOrg, isOwner };
}

export async function updateReportStatus(
  reportId: string,
  organizationId: string,
  status: ReportStatus,
  reviewNote?: string,
) {
  const report = await prisma.bugReport.findUnique({ where: { id: reportId } });
  if (!report) throw ApiError.notFound("Report not found");

  const bounty = await prisma.bounty.findFirst({
    where: { id: report.bountyId, organizationId },
    include: { severities: true },
  });
  if (!bounty) throw ApiError.forbidden("You do not own this bounty");

  if (!canTransition(report.status, status)) {
    throw ApiError.badRequest(`Cannot transition report from ${report.status} to ${status}`);
  }

  const data: Record<string, unknown> = { reviewNote: reviewNote ?? null };

  if (status === "ACCEPTED") {
    const sev = bounty.severities.find((s) => s.level === report.severity);
    data.rewardWei = sev ? sev.rewardWei : bounty.rewardAmountWei;
    data.reviewedAt = new Date();
  }

  if (status === "REJECTED") {
    data.reviewedAt = new Date();
  }

  const updated = await prisma.bugReport.update({
    where: { id: reportId },
    data: { ...data, status },
    include: { bounty: { select: { id: true, title: true } }, evidence: true },
  });

  return updated;
}

export async function addEvidence(
  reportId: string,
  researcherId: string,
  file: Express.Multer.File,
) {
  const report = await prisma.bugReport.findUnique({ where: { id: reportId } });
  if (!report) throw ApiError.notFound("Report not found");
  if (report.researcherId !== researcherId) {
    throw ApiError.forbidden("Only the researcher who submitted this report can add evidence");
  }
  if (TERMINAL.has(report.status)) {
    throw ApiError.badRequest("Cannot add evidence to a resolved report");
  }

  const uploaded = await pushToCloudinary(file);

  return prisma.evidence.create({
    data: {
      reportId,
      cloudinaryPublicId: uploaded.cloudinaryPublicId,
      url: uploaded.url,
      fileName: uploaded.fileName,
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.sizeBytes,
      kind: uploaded.kind as EvidenceKind,
    },
  });
}
