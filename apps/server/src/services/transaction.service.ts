import { decodeEventLog, type Hash, type Hex } from "viem";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/http.js";
import {
  getContractAbi,
  getContractAddress,
  getPublicClient,
  isBlockchainConfigured,
} from "../blockchain/client.js";
import type { TransactionType, TransactionStatus, Prisma } from "@prisma/client";

export interface RecordTxInput {
  txHash: string;
  type: TransactionType;
  bountyId?: string;
  reportId?: string;
  amountWei?: string;
}

export async function recordTransaction(input: RecordTxInput) {
  const hash = input.txHash.toLowerCase() as Hash;

  const existing = await prisma.blockchainTransaction.findUnique({ where: { txHash: hash } });
  if (existing) return existing;

  const tx = await prisma.blockchainTransaction.create({
    data: {
      txHash: hash,
      chainId: 11155111,
      type: input.type,
      status: "PENDING",
      fromAddress: "0x0000000000000000000000000000000000000000",
      toAddress: getContractAddressSafely(),
      amountWei: input.amountWei ? BigInt(input.amountWei) : null,
      bountyId: input.bountyId ?? null,
      reportId: input.reportId ?? null,
    },
  });

  // Kick off background verification (fire and forget).
  void verifyAndUpdate(hash).catch((err) => {
    console.error(`[blockchain] verification failed for ${hash}`, err);
  });

  return tx;
}

/**
 * Records a transaction on behalf of an authenticated user, validating that
 * the user is allowed to act on the referenced bounty/report.
 */
export async function recordTransactionForUser(
  user: { id: string; role: string },
  input: RecordTxInput,
) {
  if (user.role !== "ORGANIZATION") {
    throw ApiError.forbidden("Only organizations can record blockchain transactions");
  }

  const org = await prisma.organization.findUnique({ where: { userId: user.id } });

  if (input.bountyId) {
    const owned = await prisma.bounty.findFirst({
      where: { id: input.bountyId, organizationId: org?.id },
    });
    if (!owned) throw ApiError.forbidden("You do not own this bounty");
  }

  if (input.reportId && input.type === "REWARD_RELEASE") {
    const report = await prisma.bugReport.findUnique({
      where: { id: input.reportId },
      include: { bounty: true, researcher: { include: { wallet: true } } },
    });
    if (!report) throw ApiError.notFound("Report not found");
    if (report.bounty.organizationId !== org?.id) {
      throw ApiError.forbidden("You do not own this bounty");
    }
    if (report.status !== "ACCEPTED") {
      throw ApiError.badRequest("Only accepted reports can receive a reward");
    }
    if (!report.researcher.wallet) {
      throw ApiError.badRequest("The researcher has not connected a wallet");
    }

    // Pre-create the PENDING reward so the researcher sees it immediately.
    await prisma.reward.upsert({
      where: { reportId: report.id },
      create: {
        reportId: report.id,
        bountyId: report.bountyId,
        researcherId: report.researcherId,
        organizationId: report.bounty.organizationId,
        amountWei: report.rewardWei ?? 0n,
        status: "PENDING",
      },
      update: {},
    });
  }

  return recordTransaction(input);
}

function getContractAddressSafely(): string {
  try {
    return getContractAddress();
  } catch {
    return "0x0000000000000000000000000000000000000000";
  }
}

export async function verifyAndUpdate(txHash: string) {
  if (!isBlockchainConfigured()) {
    throw ApiError.badRequest(
      "Blockchain is not configured. Set RPC_URL_SEPOLIA and BOUNTY_ESCROW_ADDRESS.",
    );
  }

  const hash = txHash.toLowerCase() as Hash;
  const tx = await prisma.blockchainTransaction.findUnique({ where: { txHash: hash } });
  if (!tx) throw ApiError.notFound("Transaction not found");

  const publicClient = getPublicClient();
  const receipt = await publicClient.getTransactionReceipt({ hash });
  const onChainTx = await publicClient.getTransaction({ hash });

  if (receipt.status === "reverted") {
    await prisma.blockchainTransaction.update({
      where: { txHash: hash },
      data: { status: "FAILED", blockNumber: BigInt(receipt.blockNumber) },
    });
    return prisma.blockchainTransaction.findUnique({ where: { txHash: hash } });
  }

  const contractAddress = getContractAddress().toLowerCase();
  const events: Array<{ name: string; args: Record<string, unknown> }> = [];

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== contractAddress) continue;
    try {
      const decoded = decodeEventLog({
        abi: getContractAbi(),
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      });
      const args = (decoded.args ?? {}) as unknown as Record<string, unknown>;
      events.push({ name: decoded.eventName ?? "UNKNOWN", args });
    } catch {
      // ignore unrelated/anonymous logs
    }
  }

  const blockNumber = BigInt(receipt.blockNumber);
  const gasUsed = receipt.gasUsed ? BigInt(receipt.gasUsed) : null;

  const update: Prisma.BlockchainTransactionUpdateInput = {
    status: "CONFIRMED" as TransactionStatus,
    blockNumber,
    gasUsed,
    fromAddress: onChainTx.from ?? "0x0000000000000000000000000000000000000000",
    metadata: { events: jsonSafe(events) } as Prisma.InputJsonValue,
  };

  // ---- Side effects driven by emitted events (source of truth: the chain) ----

  for (const event of events) {
    if (event.name === "BountyCreated") {
      const onChainId = toBigInt(event.args["bountyId"]);
      if (onChainId != null && tx.bountyId) {
        await prisma.bounty.updateMany({
          where: { id: tx.bountyId, onChainId: null },
          data: { onChainId },
        });
      }
    }

    if (event.name === "BountyFunded") {
      const onChainId = toBigInt(event.args["bountyId"]);
      const amount = toBigInt(event.args["amount"]);
      const bounty = onChainId != null ? await prisma.bounty.findFirst({ where: { onChainId } }) : null;
      if (bounty) {
        await prisma.bounty.update({
          where: { id: bounty.id },
          data: { isFunded: true, fundingTxHash: hash },
        });
      }
      if (amount != null) update.amountWei = amount;
    }

    if (event.name === "RewardReleased") {
      const onChainId = toBigInt(event.args["bountyId"]);
      const researcher = typeof event.args["researcher"] === "string" ? (event.args["researcher"] as string) : "";
      const amount = toBigInt(event.args["amount"]);
      let resolvedReportId: string | null = null;

      const bounty = onChainId != null ? await prisma.bounty.findFirst({ where: { onChainId } }) : null;
      if (bounty && researcher) {
        // The report this payout resolves: accepted report on this bounty whose
        // researcher owns this wallet.
        const report = await prisma.bugReport.findFirst({
          where: {
            bountyId: bounty.id,
            status: "ACCEPTED",
            researcher: { wallet: { address: researcher.toLowerCase() } },
          },
        });

        if (report && amount != null) {
          await prisma.$transaction([
            prisma.bugReport.update({
              where: { id: report.id },
              data: { status: "REWARDED", reviewedAt: new Date() },
            }),
            prisma.reward.upsert({
              where: { reportId: report.id },
              create: {
                reportId: report.id,
                bountyId: bounty.id,
                researcherId: report.researcherId,
                organizationId: bounty.organizationId,
                amountWei: amount,
                status: "PAID",
                txHash: hash,
              },
              update: { status: "PAID", txHash: hash, amountWei: amount },
            }),
          ]);
          resolvedReportId = report.id;
        }
      }

      if (resolvedReportId) {
        update.report = { connect: { id: resolvedReportId } };
      }
      if (amount != null) update.amountWei = amount;
    }
  }

  await prisma.blockchainTransaction.update({ where: { txHash: hash }, data: update });

  return prisma.blockchainTransaction.findUnique({ where: { txHash: hash } });
}

/** Coerces a decoded event argument to BigInt when possible. */
function toBigInt(value: unknown): bigint | null {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  return null;
}

/** Prisma Json input cannot contain BigInt or undefined - sanitize deeply. */
function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "undefined") return null;
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = jsonSafe(v);
    }
    return out;
  }
  return value;
}

export async function listTransactions(viewer: { id: string; role: string }, page = 1, limit = 20) {
  const where: Prisma.BlockchainTransactionWhereInput = {};

  if (viewer.role === "ORGANIZATION") {
    const org = await prisma.organization.findUnique({ where: { userId: viewer.id } });
    if (!org) return { items: [], total: 0 };
    where.bounty = { organizationId: org.id };
  } else if (viewer.role === "RESEARCHER") {
    const reportIds = await prisma.bugReport.findMany({
      where: { researcherId: viewer.id },
      select: { id: true },
    });
    where.OR = [{ reportId: { in: reportIds.map((r) => r.id) } }];
  }
  // ADMIN: no restriction

  const [items, total] = await Promise.all([
    prisma.blockchainTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { bounty: { select: { id: true, title: true } } },
    }),
    prisma.blockchainTransaction.count({ where }),
  ]);

  return { items, total };
}

export async function getTransaction(txHash: string) {
  const hash = txHash.toLowerCase();
  const tx = await prisma.blockchainTransaction.findUnique({
    where: { txHash: hash },
    include: {
      bounty: { select: { id: true, title: true } },
      report: { select: { id: true, title: true, status: true } },
    },
  });
  if (!tx) throw ApiError.notFound("Transaction not found");
  return tx;
}
