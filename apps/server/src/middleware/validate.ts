import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny, ZodSchema } from "zod";
import { ApiError } from "../utils/http.js";

interface Validators {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate({ body, params, query }: Validators) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (params) req.params = params.parse(req.params);
      if (query) req.query = query.parse(req.query);
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
