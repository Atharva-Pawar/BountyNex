import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? `ERR_${statusCode}`;
    this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, "ERR_VALIDATION", details);
  }

  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError(401, message, "ERR_UNAUTHORIZED");
  }

  static forbidden(message = "You do not have permission to perform this action"): ApiError {
    return new ApiError(403, message, "ERR_FORBIDDEN");
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message, "ERR_NOT_FOUND");
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, "ERR_CONFLICT");
  }
}

export type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

export const asyncHandler =
  (fn: AsyncRouteHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}
