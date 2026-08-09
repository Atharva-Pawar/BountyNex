import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { ApiError } from "../utils/http.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { COOKIE_NAME } from "../utils/cookies.js";
import { prisma } from "../lib/prisma.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw ApiError.unauthorized("Not authenticated");

    const payload = verifyAccessToken(token);
    if (!payload?.sub) throw ApiError.unauthorized("Invalid token");

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        isSuspended: true,
      },
    });

    if (!user) throw ApiError.unauthorized("User no longer exists");
    if (user.isSuspended) throw ApiError.forbidden("Account suspended");

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}
