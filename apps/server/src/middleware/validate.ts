import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny, ZodSchema } from "zod";
import { ApiError } from "../utils/http.js";

interface Validators {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

// Express 5 defines `req.query` as a getter-only accessor, so a plain assignment
// throws `TypeError: Cannot set property query ... which has only a getter`.
// Assign via defineProperty (the accessor is configurable) to store the parsed value.
function assign(req: Request, key: "body" | "params" | "query", value: unknown) {
  try {
    (req as unknown as Record<string, unknown>)[key] = value;
  } catch {
    Object.defineProperty(req, key, {
      value,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  }
}

export function validate({ body, params, query }: Validators) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (body) assign(req, "body", body.parse(req.body));
      if (params) assign(req, "params", params.parse(req.params));
      if (query) assign(req, "query", query.parse(req.query));
      next();
    } catch (err) {
      const zodErr = err as { issues?: Array<{ path: Array<string | number>; message: string }> };
      const details = zodErr.issues?.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      next(ApiError.badRequest("Invalid request data", details));
    }
  };
}

// Re-export for convenience so validators only import zod + this file
export type { ZodTypeAny };
