-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'RESEARCHER', 'ORGANIZATION', 'ADMIN');

-- CreateEnum
CREATE TYPE "BountyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'ACCEPTED', 'REJECTED', 'REWARDED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFORMATIONAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EvidenceKind" AS ENUM ('SCREENSHOT', 'IMAGE', 'VIDEO', 'LOG', 'DOCUMENT', 'POC');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BOUNTY_CREATE', 'BOUNTY_FUND', 'REWARD_RELEASE', 'BOUNTY_STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('USER_UPDATE', 'USER_SUSPEND', 'ORG_VERIFY', 'BOUNTY_MODERATE', 'REPORT_MODERATE', 'DISPUTE_RESOLVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'GUEST',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 11155111,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researcher_profiles" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "bio" TEXT,
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "totalEarnedWei" BIGINT NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "researcher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "onChainAddress" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bounties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "rewardAmountWei" BIGINT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "BountyStatus" NOT NULL DEFAULT 'DRAFT',
    "onChainId" BIGINT,
    "isFunded" BOOLEAN NOT NULL DEFAULT false,
    "fundingTxHash" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bounties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bounty_severities" (
    "id" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "level" "Severity" NOT NULL,
    "rewardWei" BIGINT NOT NULL,

    CONSTRAINT "bounty_severities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "affectedComponent" TEXT NOT NULL,
    "stepsToReproduce" TEXT NOT NULL,
    "proofOfConcept" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'SUBMITTED',
    "rewardWei" BIGINT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bountyId" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "kind" "EvidenceKind" NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "amountWei" BIGINT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportId" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_transactions" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 11155111,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amountWei" BIGINT,
    "blockNumber" BIGINT,
    "gasUsed" BIGINT,
    "metadata" JSONB,
    "bountyId" TEXT,
    "reportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockchain_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" TEXT NOT NULL,
    "actionType" "AdminActionType" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "researcher_profiles_handle_key" ON "researcher_profiles"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "researcher_profiles_userId_key" ON "researcher_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_userId_key" ON "organizations"("userId");

-- CreateIndex
CREATE INDEX "organizations_isVerified_idx" ON "organizations"("isVerified");

-- CreateIndex
CREATE INDEX "bounties_status_idx" ON "bounties"("status");

-- CreateIndex
CREATE INDEX "bounties_deadline_idx" ON "bounties"("deadline");

-- CreateIndex
CREATE INDEX "bounties_organizationId_idx" ON "bounties"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "bounty_severities_bountyId_level_key" ON "bounty_severities"("bountyId", "level");

-- CreateIndex
CREATE INDEX "bug_reports_bountyId_idx" ON "bug_reports"("bountyId");

-- CreateIndex
CREATE INDEX "bug_reports_researcherId_idx" ON "bug_reports"("researcherId");

-- CreateIndex
CREATE INDEX "bug_reports_status_idx" ON "bug_reports"("status");

-- CreateIndex
CREATE INDEX "evidence_reportId_idx" ON "evidence"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "rewards_reportId_key" ON "rewards"("reportId");

-- CreateIndex
CREATE INDEX "rewards_researcherId_idx" ON "rewards"("researcherId");

-- CreateIndex
CREATE INDEX "rewards_status_idx" ON "rewards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_transactions_txHash_key" ON "blockchain_transactions"("txHash");

-- CreateIndex
CREATE INDEX "blockchain_transactions_status_idx" ON "blockchain_transactions"("status");

-- CreateIndex
CREATE INDEX "blockchain_transactions_bountyId_idx" ON "blockchain_transactions"("bountyId");

-- CreateIndex
CREATE INDEX "blockchain_transactions_fromAddress_idx" ON "blockchain_transactions"("fromAddress");

-- CreateIndex
CREATE INDEX "admin_actions_adminId_idx" ON "admin_actions"("adminId");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "researcher_profiles" ADD CONSTRAINT "researcher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounties" ADD CONSTRAINT "bounties_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounty_severities" ADD CONSTRAINT "bounty_severities_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "bug_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "bug_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_transactions" ADD CONSTRAINT "blockchain_transactions_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_transactions" ADD CONSTRAINT "blockchain_transactions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "bug_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

