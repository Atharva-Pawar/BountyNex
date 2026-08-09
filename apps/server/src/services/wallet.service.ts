import { verifyMessage, type Address, type Hex } from "viem";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/http.js";

export function buildVerificationMessage(address: string): string {
  return [
    "BountyNex wallet verification",
    "",
    `Address: ${address}`,
    "",
    "Sign this message to prove you own this wallet.",
    "This does not cost anything and never exposes your private key.",
  ].join("\n");
}

/**
 * Verifies that `signature` was produced by the private key of `address`
 * over the standard verification message, then binds it to the user.
 */
export async function connectWallet(userId: string, address: string, signature: string) {
  const normalized = address.toLowerCase() as Address;

  const isValid = await verifyMessage({
    address: normalized,
    message: buildVerificationMessage(address),
    signature: signature as Hex,
  });

  if (!isValid) throw ApiError.unauthorized("Signature verification failed");

  const wallet = await prisma.wallet.upsert({
    where: { userId },
    create: {
      userId,
      address: normalized,
      chainId: 11155111,
      isActive: true,
    },
    update: {
      address: normalized,
      isActive: true,
    },
  });

  // Keep the org on-chain address in sync for convenience.
  await prisma.organization.updateMany({
    where: { userId },
    data: { onChainAddress: normalized },
  });

  return wallet;
}

export async function getWallet(userId: string) {
  return prisma.wallet.findUnique({ where: { userId } });
}

export async function disconnectWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return null;
  return prisma.wallet.update({ where: { userId }, data: { isActive: false } });
}
