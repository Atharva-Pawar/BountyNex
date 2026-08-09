import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/http.js";
import { isProduction } from "../config/env.js";
import { safeJson } from "../utils/serialize.js";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: "ERR_NOT_FOUND", message: "Route not found" },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    const payload = {
      success: false,
      error: { code: err.code, message: err.message, details: err.details ?? undefined },
    };
    res.status(err.statusCode).json(payload);
    return;
  }

  const known = err as {
    name?: string;
    code?: string;
    message?: string;
    meta?: unknown;
  };

  // Prisma known request errors
  if (known?.name === "PrismaClientKnownRequestError") {
    const status =
      known.code === "P2002" ? 409 : known.code === "P2025" ? 404 : 400;
    const message =
      known.code === "P2002"
        ? "A record with the same unique value already exists"
        : known.code === "P2025"
          ? "Record not found"
          : "Database constraint violation";
    res.status(status).json({
      success: false,
      error: { code: `DB_${known.code}`, message, details: known.meta ?? undefined },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");

  res.status(500).json({
    success: false,
    error: {
      code: "ERR_INTERNAL",
      message: isProduction ? "Internal server error" : known?.message ?? "Unknown error",
    },
  });
}

export function sendData(res: Response, data: unknown, status = 200): void {
  res.status(status).set("Content-Type", "application/json").send(safeJson({ success: true, data }));
}
