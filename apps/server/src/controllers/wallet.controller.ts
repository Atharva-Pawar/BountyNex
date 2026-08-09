import type { Request, Response } from "express";
import { sendData } from "../middleware/error.js";
import {
  buildVerificationMessage,
  connectWallet,
  disconnectWallet,
  getWallet,
} from "../services/wallet.service.js";
import { asyncHandler } from "../utils/http.js";

export const connectWalletHandler = asyncHandler(async (req: Request, res: Response) => {
  const { address, signature } = req.body as { address: string; signature: string };
  const wallet = await connectWallet(req.user!.id, address, signature);
  sendData(res, { wallet, verificationMessage: buildVerificationMessage(address) }, 201);
});

export const getWalletHandler = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await getWallet(req.user!.id);
  sendData(res, { wallet });
});

export const deleteWalletHandler = asyncHandler(async (req: Request, res: Response) => {
  await disconnectWallet(req.user!.id);
  sendData(res, { message: "Wallet disconnected" });
});
