import { z } from "zod";

export const reportIdParamsSchema = z.object({
  id: z.string().uuid("Invalid report id"),
});

export const bountyReportListParamsSchema = z.object({
  bountyId: z.string().uuid("Invalid bounty id"),
});

export const createReportBodySchema = z.object({
  bountyId: z.string().uuid("Invalid bounty id"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(30, "Description must be at least 30 characters").max(20_000),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"]),
  affectedComponent: z.string().min(2, "Affected component is required").max(255),
  stepsToReproduce: z.string().min(20, "Steps to reproduce must be detailed").max(10_000),
  proofOfConcept: z.string().max(10_000).optional(),
});

export const updateReportStatusBodySchema = z.object({
  status: z.enum(["UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED"]),
  reviewNote: z.string().max(2000).optional(),
});

export const listMyReportsQuerySchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION", "ACCEPTED", "REJECTED", "REWARDED"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
