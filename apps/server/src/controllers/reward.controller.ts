import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { sendData } from "../middleware/error.js";
import { ApiError, asyncHandler } from "../utils/http.js";

export const myRewardsHandler = asyncHandler(async (req: Request, res: Response) => {
  const rewards = await prisma.reward.findMany({
    where: { researcherId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      report: { select: { id: true, title: true, severity: true, status: true } },
      bounty: { select: { id: true, title: true } },
    },
  });
  sendData(res, { items: rewards });
});

export const orgRewardsHandler = asyncHandler(async (req: Request, res: Response) => {
  const org = await prisma.organization.findUnique({ where: { userId: req.user!.id } });
  if (!org) throw ApiError.forbidden("Organization profile required");

  const rewards = await prisma.reward.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    include: {
      report: { select: { id: true, title: true, severity: true, status: true } },
      bounty: { select: { id: true, title: true } },
      researcher: { select: { id: true, name: true } },
    },
  });
  sendData(res, { items: rewards });
});
