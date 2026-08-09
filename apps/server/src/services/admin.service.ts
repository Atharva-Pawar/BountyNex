import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/http.js";

export async function getPlatformStats() {
  const [
    totalUsers,
    usersByRole,
    totalBounties,
    bountiesByStatus,
    totalReports,
    reportsByStatus,
    totalRewardsPaid,
    rewardsPaidWei,
    totalTransactions,
    transactionsByStatus,
    fundedBounties,
    totalDepositedWei,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.bounty.count(),
    prisma.bounty.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.bugReport.count(),
    prisma.bugReport.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.reward.count({ where: { status: "PAID" } }),
    prisma.reward.aggregate({ where: { status: "PAID" }, _sum: { amountWei: true } }),
    prisma.blockchainTransaction.count(),
    prisma.blockchainTransaction.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.bounty.count({ where: { isFunded: true } }),
    prisma.bounty.aggregate({ where: { isFunded: true }, _sum: { rewardAmountWei: true } }),
  ]);

  return {
    users: {
      total: totalUsers,
      byRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count._all])),
    },
    bounties: {
      total: totalBounties,
      funded: fundedBounties,
      byStatus: Object.fromEntries(bountiesByStatus.map((b) => [b.status, b._count._all])),
      totalDepositedWei: totalDepositedWei._sum.rewardAmountWei ?? 0n,
    },
    reports: {
      total: totalReports,
      byStatus: Object.fromEntries(reportsByStatus.map((r) => [r.status, r._count._all])),
    },
    rewards: {
      paidCount: totalRewardsPaid,
      paidWei: rewardsPaidWei._sum.amountWei ?? 0n,
    },
    transactions: {
      total: totalTransactions,
      byStatus: Object.fromEntries(transactionsByStatus.map((t) => [t.status, t._count._all])),
    },
  };
}

export async function listUsers(filters: { role?: string; q?: string; page: number; limit: number }) {
  const where: Prisma.UserWhereInput = {
    ...(filters.role ? { role: filters.role as Role } : {}),
    ...(filters.q
      ? { OR: [{ email: { contains: filters.q, mode: "insensitive" } }, { name: { contains: filters.q, mode: "insensitive" } }] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
        researcherProfile: { select: { handle: true } },
        organization: { select: { name: true, isVerified: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}

export async function setUserSuspended(userId: string, suspended: boolean, adminId: string) {
  if (userId === adminId) throw ApiError.badRequest("You cannot suspend yourself");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: suspended },
  });
  await prisma.adminAction.create({
    data: {
      adminId,
      actionType: "USER_SUSPEND",
      targetType: "User",
      targetId: userId,
      details: { suspended },
    },
  });
  return user;
}

export async function setOrgVerified(orgId: string, verified: boolean, adminId: string) {
  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { isVerified: verified },
  });
  await prisma.adminAction.create({
    data: {
      adminId,
      actionType: "ORG_VERIFY",
      targetType: "Organization",
      targetId: orgId,
      details: { verified },
    },
  });
  return org;
}

export async function listOrganizations(filters: { q?: string; page: number; limit: number }) {
  const where: Prisma.OrganizationWhereInput = filters.q
    ? { OR: [{ name: { contains: filters.q, mode: "insensitive" } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        user: { select: { email: true, isSuspended: true } },
        _count: { select: { bounties: true, rewards: true } },
      },
      orderBy: { user: { createdAt: "desc" } },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.organization.count({ where }),
  ]);

  return { items, total };
}

export async function listAllBounties(filters: { status?: string; q?: string; page: number; limit: number }) {
  const where: Prisma.BountyWhereInput = {
    ...(filters.status ? { status: filters.status as Prisma.BountyWhereInput["status"] } : {}),
    ...(filters.q ? { title: { contains: filters.q, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.bounty.findMany({
      where,
      include: {
        organization: { select: { name: true } },
        _count: { select: { bugReports: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.bounty.count({ where }),
  ]);

  return { items, total };
}

export async function listAllReports(filters: { status?: string; page: number; limit: number }) {
  const where: Prisma.BugReportWhereInput = filters.status
    ? { status: filters.status as Prisma.BugReportWhereInput["status"] }
    : {};

  const [items, total] = await Promise.all([
    prisma.bugReport.findMany({
      where,
      include: {
        bounty: { select: { id: true, title: true } },
        researcher: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.bugReport.count({ where }),
  ]);

  return { items, total };
}

export async function listAuditLog(adminId: string) {
  return prisma.adminAction.findMany({
    where: { adminId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
