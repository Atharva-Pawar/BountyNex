import type { Request, Response } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { sendData } from "../middleware/error.js";
import { uploadProfileImage } from "../services/cloudinary.service.js";
import { ApiError, asyncHandler } from "../utils/http.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isVerified: true,
  imageUrl: true,
  researcherProfile: { select: { handle: true, bio: true } },
  organization: {
    select: { id: true, name: true, website: true, description: true, isVerified: true },
  },
} as const;

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio, website, description } = req.body as {
    name?: string;
    bio?: string;
    website?: string;
    description?: string;
  };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: req.user!.id },
      data: { ...(name ? { name } : {}) },
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
  });

  const updated = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: userSelect,
  });

  sendData(res, { user: updated });
});

export const updateProfilePictureHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest("No image provided. Send a file field named 'file'.");
  }

  const { url } = await uploadProfileImage(req.file);

  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: { imageUrl: url },
    select: userSelect,
  });

  sendData(res, { user: updated });
});

export { upload };
