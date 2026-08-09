import { Router } from "express";
import { Role } from "@prisma/client";
import {
  addEvidenceHandler,
  createReportHandler,
  getReportHandler,
  listMyReportsHandler,
  listOrgReportsHandler,
  updateReportStatusHandler,
  upload,
} from "../controllers/report.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createReportBodySchema,
  listMyReportsQuerySchema,
  reportIdParamsSchema,
  updateReportStatusBodySchema,
} from "../validators/report.validators.js";

export const reportRouter = Router();

reportRouter.post(
  "/",
  authenticate,
  authorize(Role.RESEARCHER),
  validate({ body: createReportBodySchema }),
  createReportHandler,
);

reportRouter.get(
  "/my",
  authenticate,
  authorize(Role.RESEARCHER),
  validate({ query: listMyReportsQuerySchema }),
  listMyReportsHandler,
);

reportRouter.get(
  "/org",
  authenticate,
  authorize(Role.ORGANIZATION),
  validate({ query: listMyReportsQuerySchema }),
  listOrgReportsHandler,
);

reportRouter.get(
  "/:id",
  authenticate,
  validate({ params: reportIdParamsSchema }),
  getReportHandler,
);

reportRouter.patch(
  "/:id/status",
  authenticate,
  authorize(Role.ORGANIZATION),
  validate({ params: reportIdParamsSchema, body: updateReportStatusBodySchema }),
  updateReportStatusHandler,
);

reportRouter.post(
  "/:id/evidence",
  authenticate,
  authorize(Role.RESEARCHER),
  validate({ params: reportIdParamsSchema }),
  upload.single("file"),
  addEvidenceHandler,
);
