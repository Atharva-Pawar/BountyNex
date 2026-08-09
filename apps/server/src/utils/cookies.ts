import type { Response } from "express";
import { env, isProduction } from "../config/env.js";

export const COOKIE_NAME = env.JWT_COOKIE_NAME;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
};

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS });
}
