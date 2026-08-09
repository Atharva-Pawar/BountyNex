import { z } from "zod";

const severityValues = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"] as const;

// Wei amounts travel as decimal strings to preserve precision beyond JS Number.MAX_SAFE_INTEGER.
const weiString = z
  .string()
  .regex(/^\d+$/, "Amount must be a positive integer string (wei)")
  .refine((v) => BigInt(v) > 0n, "Amount must be greater than zero");

const severitySchema = z
  .object({
    level: z.enum(severityValues),
    rewardWei: weiString,
  })
  .refine((s) => BigInt(s.rewardWei) > 0n, "Each severity reward must be positive");

export const createBountyBodySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(160),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  scope: z.string().min(10, "Scope must be at least 10 characters").max(5000),
  rules: z.string().min(10, "Rules must be at least 10 characters").max(5000),
  rewardAmountWei: weiString,
  deadline: z
    .string()
    .datetime({ offset: true })
    .refine((d) => new Date(d).getTime() > Date.now(), "Deadline must be in the future"),
  severities: z.array(severitySchema).min(1, "At least one severity level is required").max(5),
});

export const updateBountyBodySchema = createBountyBodySchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Provide at least one field to update");

export const bountyIdParamsSchema = z.object({
  id: z.string().uuid("Invalid bounty id"),
});

export const listBountiesQuerySchema = z.object({
  q: z.string().max(160).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED", "DRAFT"]).optional(),
  severity: z.enum(severityValues).optional(),
  minReward: z.string().regex(/^\d+$/).optional(),
  maxReward: z.string().regex(/^\d+$/).optional(),
  sort: z.enum(["newest", "reward_high", "reward_low", "deadline"]).default("newest"),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  mine: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});
