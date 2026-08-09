import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { sendData } from "../middleware/error.js";
import {
  getPlatformStats,
  listAllBounties,
  listAllReports,
  listAuditLog,
  listOrganizations,
  listUsers,
  setOrgVerified,
  setUserSuspended,
} from "../services/admin.service.js";
import { buildPaginationMeta, asyncHandler, parsePagination } from "../utils/http.js";

export const getStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getPlatformStats();
  sendData(res, { stats });
});

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const q = req.query as Record<string, unknown>;
  const { items, total } = await listUsers({
    role: typeof q.role === "string" ? q.role : undefined,
    q: typeof q.q === "string" ? q.q : undefined,
    page,
    limit,
  });
  sendData(res, { items, pagination: buildPaginationMeta(total, page, limit) });
});

export const suspendUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { suspended } = req.body as { suspended: boolean };
  const user = await setUserSuspended(id, suspended, req.user!.id);
  sendData(res, { user: { id: user.id, isSuspended: user.isSuspended } });
});

export const listOrganizationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const q = req.query as Record<string, unknown>;
  const { items, total } = await listOrganizations({
    q: typeof q.q === "string" ? q.q : undefined,
    page,
    limit,
  });
  sendData(res, { items, pagination: buildPaginationMeta(total, page, limit) });
});

export const verifyOrgHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { verified } = req.body as { verified: boolean };
  const org = await setOrgVerified(id, verified, req.user!.id);
  sendData(res, { organization: { id: org.id, isVerified: org.isVerified } });
});

export const listAllBountiesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const q = req.query as Record<string, unknown>;
  const { items, total } = await listAllBounties({
    status: typeof q.status === "string" ? q.status : undefined,
    q: typeof q.q === "string" ? q.q : undefined,
    page,
    limit,
  });
  sendData(res, { items, pagination: buildPaginationMeta(total, page, limit) });
});

export const listAllReportsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const q = req.query as Record<string, unknown>;
  const { items, total } = await listAllReports({
    status: typeof q.status === "string" ? q.status : undefined,
    page,
    limit,
  });
  sendData(res, { items, pagination: buildPaginationMeta(total, page, limit) });
});

export const listAllTransactionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await prisma.blockchainTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { bounty: { select: { title: true } } },
  });
  sendData(res, { items: transactions });
});

export const auditLogHandler = asyncHandler(async (req: Request, res: Response) => {
  const items = await listAuditLog(req.user!.id);
  sendData(res, { items });
});
