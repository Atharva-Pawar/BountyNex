import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { sendData } from "../middleware/error.js";
import { asyncHandler } from "../utils/http.js";

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio, website, description } = req.body as {
    name?: string;
    bio?: string;
    website?: string;
    description?: string;
  };

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: req.user!.id },
      data: { ...(name ? { name } : {}) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        researcherProfile: { select: { handle: true, bio: true } },
        organization: {
          select: { id: true, name: true, website: true, description: true, isVerified: true },
        },
      },
    });

    if (req.user!.role === "RESEARCHER" && bio !== undefined) {
      await tx.researcherProfile.update({
        where: { userId: req.user!.id },
        data: { bio: bio || null },
      });
    }

    if (req.user!.role === "ORGANIZATION" && (website !== undefined || description !== undefined)) {
      await tx.organization.update({
        where: { userId: req.user!.id },
        data: {
          ...(website !== undefined ? { website: website || null } : {}),
          ...(description !== undefined ? { description: description || null } : {}),
        },
      });
    }

    return tx.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        researcherProfile: { select: { handle: true, bio: true } },
        organization: {
          select: { id: true, name: true, website: true, description: true, isVerified: true },
        },
      },
    });
  });

  sendData(res, { user: updated });
});
