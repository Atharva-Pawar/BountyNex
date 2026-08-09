import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import {
  auditLogHandler,
  getStatsHandler,
  listAllBountiesHandler,
  listAllReportsHandler,
  listAllTransactionsHandler,
  listOrganizationsHandler,
  listUsersHandler,
  suspendUserHandler,
  verifyOrgHandler,
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const idParamsSchema = z.object({ id: z.string().uuid("Invalid id") });

export const adminRouter = Router();

adminRouter.use(authenticate, authorize(Role.ADMIN));

adminRouter.get("/stats", getStatsHandler);

adminRouter.get("/users", listUsersHandler);
adminRouter.patch(
  "/users/:id/suspend",
  validate({ params: idParamsSchema, body: z.object({ suspended: z.boolean() }) }),
  suspendUserHandler,
);

adminRouter.get("/organizations", listOrganizationsHandler);
adminRouter.patch(
  "/organizations/:id/verify",
  validate({ params: idParamsSchema, body: z.object({ verified: z.boolean() }) }),
  verifyOrgHandler,
);

adminRouter.get("/bounties", listAllBountiesHandler);
adminRouter.get("/reports", listAllReportsHandler);
adminRouter.get("/transactions", listAllTransactionsHandler);
adminRouter.get("/audit-log", auditLogHandler);
