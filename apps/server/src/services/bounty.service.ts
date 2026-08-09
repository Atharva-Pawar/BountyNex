import type { Bounty, BountySeverity, BountyStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/http.js";

export interface BountySeverityInput {
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  rewardWei: string;
}

export interface CreateBountyInput {
  title: string;
  description: string;
  scope: string;
  rules: string;
  rewardAmountWei: string;
  deadline: string;
  severities: BountySeverityInput[];
}

export interface ListBountyFilters {
  q?: string;
  status?: BountyStatus;
  severity?: BountySeverity["level"];
  minReward?: string;
  maxReward?: string;
  sort?: "newest" | "reward_high" | "reward_low" | "deadline";
  page: number;
  limit: number;
  mine?: boolean;
  viewerRole: string;
  viewerId?: string;
}

function assertSeverityBudget(input: CreateBountyInput) {
  const total = BigInt(input.rewardAmountWei);
  const sum = input.severities.reduce((acc, s) => acc + BigInt(s.rewardWei), 0n);
  if (sum > total) {
    throw ApiError.badRequest(
      "Sum of severity rewards cannot exceed the total bounty reward",
    );
  }
}

export async function createBounty(organizationId: string, input: CreateBountyInput) {
  assertSeverityBudget(input);

  const org = await prisma.organization.findUnique({ where: { userId: organizationId } });
  if (!org) throw ApiError.forbidden("Organization profile required to create bounties");

  return prisma.$transaction(async (tx) => {
    const bounty = await tx.bounty.create({
      data: {
        title: input.title,
        description: input.description,
        scope: input.scope,
        rules: input.rules,
        rewardAmountWei: BigInt(input.rewardAmountWei),
        deadline: new Date(input.deadline),
        status: "DRAFT",
        organizationId: org.id,
        severities: {
          create: input.severities.map((s) => ({
            level: s.level,
            rewardWei: BigInt(s.rewardWei),
          })),
        },
      },
      include: { organization: { select: { id: true, name: true } }, severities: true },
    });

    return bounty;
  });
}

const bountyInclude = {
  organization: { select: { id: true, name: true, isVerified: true } },
  severities: true,
  _count: { select: { bugReports: true } },
} satisfies Prisma.BountyInclude;

export type BountyWithRelations = Prisma.BountyGetPayload<{ include: typeof bountyInclude }>;

export async function listBounties(filters: ListBountyFilters) {
  const where: Prisma.BountyWhereInput = {};

  // Non-owners only see published (non-DRAFT) bounties.
  if (!filters.mine) {
    where.status = { in: ["ACTIVE", "PAUSED", "CLOSED"] };
  }

  if (filters.status) where.status = filters.status;

  if (filters.q) {
    where.OR = [{ title: { contains: filters.q, mode: "insensitive" } }];
  }

  if (filters.severity) {
    where.severities = { some: { level: filters.severity } };
  }

  if (filters.minReward || filters.maxReward) {
    where.rewardAmountWei = {};
    if (filters.minReward) where.rewardAmountWei.gte = BigInt(filters.minReward);
    if (filters.maxReward) where.rewardAmountWei.lte = BigInt(filters.maxReward);
  }

  let orderBy: Prisma.BountyOrderByWithRelationInput[] = [{ createdAt: "desc" }];
  if (filters.sort === "reward_high") orderBy = [{ rewardAmountWei: "desc" }];
  else if (filters.sort === "reward_low") orderBy = [{ rewardAmountWei: "asc" }];
  else if (filters.sort === "deadline") orderBy = [{ deadline: "asc" }];

  const [items, total] = await Promise.all([
    prisma.bounty.findMany({
      where,
      include: bountyInclude,
      orderBy,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.bounty.count({ where }),
  ]);

  return { items, total };
}

export async function getBounty(bountyId: string, viewer?: { role: string; id: string }) {
  const bounty = await prisma.bounty.findUnique({
    where: { id: bountyId },
    include: {
      ...bountyInclude,
      bugReports: {
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
          submittedAt: true,
        },
        take: 20,
      },
    },
  });

  if (!bounty) throw ApiError.notFound("Bounty not found");

  const isOwner = viewer?.role === "ORGANIZATION"
    ? bounty.organizationId === (await resolveOrgId(viewer.id))
    : false;

  if (bounty.status === "DRAFT" && !isOwner) {
    throw ApiError.notFound("Bounty not found");
  }

  return { bounty, isOwner };
}

async function resolveOrgId(userId: string): Promise<string | null> {
  const org = await prisma.organization.findUnique({
    where: { userId },
    select: { id: true },
  });
  return org?.id ?? null;
}

export async function assertBountyOwnership(bountyId: string, organizationId: string) {
  const bounty = await prisma.bounty.findFirst({
    where: { id: bountyId, organizationId },
  });
  if (!bounty) throw ApiError.forbidden("You do not own this bounty");
  return bounty;
}

export async function updateBounty(
  bountyId: string,
  organizationId: string,
  input: Partial<CreateBountyInput>,
) {
  const bounty = await assertBountyOwnership(bountyId, organizationId);
  if (bounty.isFunded && (input.rewardAmountWei || input.deadline || input.severities)) {
    throw ApiError.badRequest(
      "Reward, deadline and severity levels cannot change after the bounty is funded",
    );
  }

  const data: Prisma.BountyUpdateInput = {};
  if (input.title) data.title = input.title;
  if (input.description) data.description = input.description;
  if (input.scope) data.scope = input.scope;
  if (input.rules) data.rules = input.rules;
  if (input.rewardAmountWei) data.rewardAmountWei = BigInt(input.rewardAmountWei);
  if (input.deadline) data.deadline = new Date(input.deadline);

  if (input.severities) {
    if (input.rewardAmountWei) {
      const total = BigInt(input.rewardAmountWei);
      const sum = input.severities.reduce((acc, s) => acc + BigInt(s.rewardWei), 0n);
      if (sum > total) throw ApiError.badRequest("Severity rewards exceed total reward");
    }
    data.severities = {
      deleteMany: {},
      create: input.severities.map((s) => ({ level: s.level, rewardWei: BigInt(s.rewardWei) })),
    };
  }

  return prisma.bounty.update({
    where: { id: bountyId },
    data,
    include: bountyInclude,
  });
}

export async function deleteBounty(bountyId: string, organizationId: string) {
  const bounty = await assertBountyOwnership(bountyId, organizationId);
  if (bounty.status !== "DRAFT") {
    throw ApiError.badRequest("Only draft bounties can be deleted");
  }
  await prisma.bounty.delete({ where: { id: bountyId } });
}

export async function setBountyStatus(
  bountyId: string,
  organizationId: string,
  status: BountyStatus,
) {
  const bounty = await assertBountyOwnership(bountyId, organizationId);

  if (status === "ACTIVE" && !bounty.isFunded) {
    throw ApiError.badRequest("Bounty must be funded before it can be activated");
  }

  return prisma.bounty.update({
    where: { id: bountyId },
    data: { status },
    include: bountyInclude,
  });
}

/**
 * Allocates the next unused on-chain bounty id. The organization uses it as
 * the `bountyId` argument when calling the escrow contract, and the server
 * records it via the BountyCreated event during transaction verification.
 */
export async function allocateOnChainId(bountyId: string, organizationId: string) {
  await assertBountyOwnership(bountyId, organizationId);

  const existing = await prisma.bounty.findUnique({
    where: { id: bountyId },
    select: { onChainId: true },
  });
  if (existing?.onChainId != null) return existing.onChainId;

  const max = await prisma.bounty.aggregate({ _max: { onChainId: true } });
  const next = (max._max.onChainId ?? 0n) + 1n;

  await prisma.bounty.update({ where: { id: bountyId }, data: { onChainId: next } });
  return next;
}
