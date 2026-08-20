import { Router } from "express";
import {
  deleteAccountHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  registerHandler,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { loginBodySchema, registerBodySchema } from "../validators/auth.validators.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validate({ body: registerBodySchema }), registerHandler);
authRouter.post("/login", authLimiter, validate({ body: loginBodySchema }), loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.delete("/account", authenticate, deleteAccountHandler);
authRouter.get("/me", authenticate, meHandler);
