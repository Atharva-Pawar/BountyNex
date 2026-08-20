import type { User } from "@prisma/client";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import type { RegisterInput } from "../types/auth.js";
import { ApiError } from "../utils/http.js";
import { signAccessToken } from "../utils/jwt.js";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function register(input: RegisterInput): Promise<{ user: User; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const handleTaken =
    input.role === Role.RESEARCHER && input.researcherHandle
      ? await prisma.researcherProfile.findUnique({
          where: { handle: input.researcherHandle },
        })
      : null;
  if (handleTaken) throw ApiError.conflict("This researcher handle is already taken");

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        role: input.role,
        isVerified: input.role === Role.ORGANIZATION ? false : true,
      },
    });

    if (input.role === Role.ORGANIZATION) {
      await tx.organization.create({
        data: {
          userId: created.id,
          name: input.orgName ?? input.name,
          website: input.orgWebsite ?? null,
        },
      });
    }

    if (input.role === Role.RESEARCHER) {
      await tx.researcherProfile.create({
        data: { userId: created.id, handle: input.researcherHandle! },
      });
    }

    return created;
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user, token };
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  if (user.isSuspended) throw ApiError.forbidden("This account has been suspended");

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user, token };
}

export async function deleteAccount(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // `bug_reports.researcher_id` and `rewards.*_id` are RESTRICT, so the user's
    // own submissions must be removed before the user row. Deleting a report
    // cascades to its evidence (CASCADE) and reward (CASCADE) at the database
    // level, which clears the RESTRICT references without network round-trips.
    await tx.bugReport.deleteMany({ where: { researcherId: userId } });

    // Everything else owned by the account cascades from `users.id`: the
    // wallet, researcher profile, organization (and the organization's full
    // bounty tree), and any admin actions. `blockchain_transactions` reference
    // bounties/reports with SET NULL, so their immutable on-chain records are
    // preserved with the FK cleared.
    await tx.user.delete({ where: { id: userId } });
  });
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
  };
}
