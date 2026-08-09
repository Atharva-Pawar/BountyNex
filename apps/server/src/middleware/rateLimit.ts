import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "ERR_TOO_MANY_REQUESTS", message: "Too many requests, please slow down" },
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "ERR_TOO_MANY_REQUESTS",
      message: "Too many authentication attempts, try again later",
    },
  },
});
