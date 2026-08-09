import type { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  isSuspended: boolean;
  walletAddress?: string | null;
  createdAt: Date;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: Role;
  orgName?: string;
  orgWebsite?: string;
  researcherHandle?: string;
}
