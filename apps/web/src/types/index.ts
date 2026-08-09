export type Role = "GUEST" | "RESEARCHER" | "ORGANIZATION" | "ADMIN";
export type BountyStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";
export type ReportStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "NEEDS_INFORMATION"
  | "ACCEPTED"
  | "REJECTED"
  | "REWARDED";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
export type TransactionStatus = "PENDING" | "CONFIRMED" | "FAILED";
export type TransactionType = "BOUNTY_CREATE" | "BOUNTY_FUND" | "REWARD_RELEASE" | "BOUNTY_STATUS_CHANGE";
export type RewardStatus = "PENDING" | "PAID" | "FAILED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt?: string;
  wallet?: { address: string; chainId: number; isActive: boolean } | null;
  researcherProfile?: { handle: string; reputationScore: number } | null;
  organization?: { id: string; name: string; website?: string; isVerified: boolean; onChainAddress?: string | null } | null;
}

export interface Wallet {
  id: string;
  address: string;
  chainId: number;
  isActive: boolean;
  connectedAt: string;
}

export interface BountySeverity {
  id?: string;
  level: Severity;
  rewardWei: string;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  scope: string;
  rules: string;
  rewardAmountWei: string;
  deadline: string;
  status: BountyStatus;
  onChainId: string | null;
  isFunded: boolean;
  fundingTxHash: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  organization?: { id: string; name: string; isVerified: boolean };
  severities: BountySeverity[];
  _count?: { bugReports: number };
  bugReports?: Array<{ id: string; title: string; severity: Severity; status: ReportStatus; submittedAt: string }>;
  isOwner?: boolean;
}

export interface Evidence {
  id: string;
  reportId: string;
  cloudinaryPublicId: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  uploadedAt: string;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  affectedComponent: string;
  stepsToReproduce: string;
  proofOfConcept: string | null;
  status: ReportStatus;
  rewardWei: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  submittedAt: string;
  bountyId: string;
  researcherId: string;
  bounty?: {
    id: string;
    title: string;
    rewardAmountWei?: string;
    onChainId?: string | null;
    organization?: { id: string; userId: string; name: string };
    severities?: BountySeverity[];
  };
  researcher?: {
    id: string;
    name: string;
    researcherProfile?: { handle: string } | null;
    wallet?: { address: string } | null;
  };
  evidence: Evidence[];
  reward?: Reward | null;
  _count?: { evidence: number };
}

export interface Reward {
  id: string;
  status: RewardStatus;
  amountWei: string;
  txHash: string | null;
  createdAt: string;
  updatedAt: string;
  reportId: string;
  bountyId: string;
  researcherId: string;
  organizationId: string;
  report?: { id: string; title: string; severity: Severity; status: ReportStatus };
  bounty?: { id: string; title: string };
  researcher?: { id: string; name: string };
}

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  chainId: number;
  type: TransactionType;
  status: TransactionStatus;
  fromAddress: string;
  toAddress: string;
  amountWei: string | null;
  blockNumber: string | null;
  gasUsed: string | null;
  metadata: { events?: Array<{ name: string; args: Record<string, unknown> }> } | null;
  bountyId: string | null;
  reportId: string | null;
  createdAt: string;
  updatedAt: string;
  bounty?: { id: string; title: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminStats {
  users: { total: number; byRole: Record<string, number> };
  bounties: { total: number; funded: number; byStatus: Record<string, number>; totalDepositedWei: string };
  reports: { total: number; byStatus: Record<string, number> };
  rewards: { paidCount: number; paidWei: string };
  transactions: { total: number; byStatus: Record<string, number> };
}
