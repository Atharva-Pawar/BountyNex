import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { sendData } from "../middleware/error.js";
import { login, register, toPublicUser } from "../services/auth.service.js";
import type { RegisterInput } from "../types/auth.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";
import { asyncHandler } from "../utils/http.js";

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterInput;
  const { user, token } = await register(body);
  setAuthCookie(res, token);
  sendData(res, { user: toPublicUser(user) }, 201);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const { user, token } = await login(email, password);
  setAuthCookie(res, token);
  sendData(res, { user: toPublicUser(user) });
});

export const logoutHandler = (_req: Request, res: Response) => {
  clearAuthCookie(res);
  sendData(res, { message: "Logged out" });
};

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      isSuspended: true,
      createdAt: true,
      wallet: { select: { address: true, chainId: true, isActive: true } },
      researcherProfile: { select: { handle: true, reputationScore: true } },
      organization: { select: { id: true, name: true, website: true, isVerified: true, onChainAddress: true } },
    },
  });

  sendData(res, { user });
});
