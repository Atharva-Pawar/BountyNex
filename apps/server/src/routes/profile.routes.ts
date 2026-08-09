import { Router } from "express";
import { updateProfileHandler } from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateProfileBodySchema } from "../validators/profile.validators.js";

export const profileRouter = Router();

profileRouter.patch("/", authenticate, validate({ body: updateProfileBodySchema }), updateProfileHandler);
