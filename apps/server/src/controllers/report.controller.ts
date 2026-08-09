import type { Request, Response } from "express";
import multer from "multer";
import { sendData } from "../middleware/error.js";
import {
  addEvidence,
  createReport,
  getReport,
  listBountyReports,
  listMyReports,
  listOrgReports,
  updateReportStatus,
} from "../services/report.service.js";
import { buildPaginationMeta, asyncHandler, parsePagination } from "../utils/http.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const createReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const report = await createReport(req.user!.id, req.body);
  sendData(res, { report }, 201);
});

export const listMyReportsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const status = (req.query as { status?: string }).status as never;
  const { items, total } = await listMyReports(req.user!.id, status, page, limit);
  sendData(res, { items, pagination: buildPaginationMeta(total, page, limit) });
});

export const listBountyReportsHandler = asyncHandler(async (req: Request, res: Response) => {
  const bountyId = (req.params as { bountyId: string }).bountyId;
  const status = (req.query as { status?: string }).status as never;
  const items = await listBountyReports(bountyId, req.user!.id, status);
  sendData(res, { items });
});

export const listOrgReportsHandler = asyncHandler(async (req: Request, res: Response) => {
  const status = (req.query as { status?: string }).status as never;
  const items = await listOrgReports(req.user!.id, status);
  sendData(res, { items });
});

export const getReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const reportId = (req.params as { id: string }).id;
  const report = await getReport(reportId, { id: req.user!.id, role: req.user!.role });
  sendData(res, { report });
});

export const updateReportStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const reportId = (req.params as { id: string }).id;
  const { status, reviewNote } = req.body as { status: never; reviewNote?: string };
  const updated = await updateReportStatus(reportId, req.user!.id, status, reviewNote);
  sendData(res, { report: updated });
});

export const addEvidenceHandler = asyncHandler(async (req: Request, res: Response) => {
  const reportId = (req.params as { id: string }).id;
  const evidence = await addEvidence(reportId, req.user!.id, req.file!);
  sendData(res, { evidence }, 201);
});

export { upload };
