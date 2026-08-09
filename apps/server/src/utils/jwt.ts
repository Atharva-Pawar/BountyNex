import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";

export interface JwtPayload {
  sub: string;
  role: Role;
}

export interface JwtClaims {
  sub: string;
  role: Role;
}

export function signAccessToken(payload: JwtClaims): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtClaims;
  return { sub: decoded.sub, role: decoded.role };
}
