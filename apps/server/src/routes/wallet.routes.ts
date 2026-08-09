import { Router } from "express";
import { connectWalletHandler, deleteWalletHandler, getWalletHandler } from "../controllers/wallet.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const connectBodySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
  signature: z.string().min(2, "Signature is required"),
});

export const walletRouter = Router();

walletRouter.post("/connect", authenticate, validate({ body: connectBodySchema }), connectWalletHandler);
walletRouter.get("/", authenticate, getWalletHandler);
walletRouter.delete("/", authenticate, deleteWalletHandler);
