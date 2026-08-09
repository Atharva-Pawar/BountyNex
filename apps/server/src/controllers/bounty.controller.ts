import type { Request, Response } from "express";
import { sendData } from "../middleware/error.js";
import {
  allocateOnChainId,
  createBounty,
  deleteBounty,
  getBounty,
  listBounties,
  setBountyStatus,
  updateBounty,
} from "../services/bounty.service.js";
import { buildPaginationMeta, asyncHandler, parsePagination } from "../utils/http.js";

export const listBountiesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const q = req.query as Record<string, unknown>;
  const mine = q.mine === true;

  if (mine && req.user?.role !== "ORGANIZATION") {
    return sendData(res, { items: [], pagination: buildPaginationMeta(0, page, limit) });
  }

  const filters = {
    q: typeof q.q === "string" ? q.q : undefined,
    status: (q.status as never) ?? undefined,
    severity: (q.severity as never) ?? undefined,
    minReward: typeof q.minReward === "string" ? q.minReward : undefined,
    maxReward: typeof q.maxReward === "string" ? q.maxReward : undefined,
    sort: ((q.sort as string) ?? "newest") as never,
    page,
    limit,
    mine,
    viewerRole: req.user?.role ?? "GUEST",
    viewerId: req.user?.id,
  };

  const { items, total } = await listBounties(filters);
  sendData(res, { items, pagination: buildPaginationMeta(total, page, limit) });
});

export const getBountyHandler = asyncHandler(async (req: Request, res: Response) => {
  const { bounty, isOwner } = await getBounty((req.params as { id: string }).id, req.user);
  sendData(res, { bounty, isOwner });
});

export const createBountyHandler = asyncHandler(async (req: Request, res: Response) => {
  const bounty = await createBounty(req.user!.id, req.body);
  sendData(res, { bounty }, 201);
});

export const updateBountyHandler = asyncHandler(async (req: Request, res: Response) => {
  const bounty = await updateBounty((req.params as { id: string }).id, req.user!.id, req.body);
  sendData(res, { bounty });
});

export const deleteBountyHandler = asyncHandler(async (req: Request, res: Response) => {
  await deleteBounty((req.params as { id: string }).id, req.user!.id);
  sendData(res, { message: "Bounty deleted" });
});

export const setBountyStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const bounty = await setBountyStatus((req.params as { id: string }).id, req.user!.id, req.body.status);
  sendData(res, { bounty });
});

export const allocateOnChainIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const onChainId = await allocateOnChainId((req.params as { id: string }).id, req.user!.id);
  sendData(res, { onChainId: onChainId.toString() });
});
