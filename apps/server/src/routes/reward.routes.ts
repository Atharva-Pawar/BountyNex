import { Router } from "express";
import { Role } from "@prisma/client";
import { myRewardsHandler, orgRewardsHandler } from "../controllers/reward.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const rewardRouter = Router();

rewardRouter.get("/my", authenticate, authorize(Role.RESEARCHER), myRewardsHandler);
rewardRouter.get("/org", authenticate, authorize(Role.ORGANIZATION), orgRewardsHandler);
