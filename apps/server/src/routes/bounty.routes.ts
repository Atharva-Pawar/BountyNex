import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import {
  allocateOnChainIdHandler,
  createBountyHandler,
  deleteBountyHandler,
  getBountyHandler,
  listBountiesHandler,
  setBountyStatusHandler,
  updateBountyHandler,
} from "../controllers/bounty.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  bountyIdParamsSchema,
  createBountyBodySchema,
  listBountiesQuerySchema,
  updateBountyBodySchema,
} from "../validators/bounty.validators.js";
import { listBountyReportsHandler } from "../controllers/report.controller.js";

const statusBodySchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED", "DRAFT"]),
});

export const bountyRouter = Router();

bountyRouter.get("/", validate({ query: listBountiesQuerySchema }), listBountiesHandler);

bountyRouter.get(
  "/:id",
  validate({ params: bountyIdParamsSchema }),
  getBountyHandler,
);

bountyRouter.post(
  "/",
  authenticate,
  authorize(Role.ORGANIZATION),
  validate({ body: createBountyBodySchema }),
  createBountyHandler,
);

bountyRouter.patch(
  "/:id/status",
  authenticate,
  authorize(Role.ORGANIZATION),
  validate({ params: bountyIdParamsSchema, body: statusBodySchema }),
  setBountyStatusHandler,
);

bountyRouter.patch(
  "/:id",
  authenticate,
  authorize(Role.ORGANIZATION),
  validate({ params: bountyIdParamsSchema, body: updateBountyBodySchema }),
  updateBountyHandler,
);

bountyRouter.delete(
  "/:id",
  authenticate,
  authorize(Role.ORGANIZATION),
  validate({ params: bountyIdParamsSchema }),
  deleteBountyHandler,
);

bountyRouter.get(
  "/:id/reports",
  authenticate,
  authorize(Role.ORGANIZATION),
  validate({ params: bountyIdParamsSchema }),
  listBountyReportsHandler,
);

bountyRouter.post(
  "/:id/onchain",
  authenticate,
  authorize(Role.ORGANIZATION),
  validate({ params: bountyIdParamsSchema }),
  allocateOnChainIdHandler,
);
