import { Router } from "express";
import { z } from "zod";
import {
  getTransactionHandler,
  listTransactionsHandler,
  recordTxHandler,
  verifyTxHandler,
} from "../controllers/transaction.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const recordBodySchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
  type: z.enum(["BOUNTY_CREATE", "BOUNTY_FUND", "REWARD_RELEASE", "BOUNTY_STATUS_CHANGE"]),
  bountyId: z.string().uuid().optional(),
  reportId: z.string().uuid().optional(),
  amountWei: z.string().regex(/^\d+$/).optional(),
});

const hashParamsSchema = z.object({
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
});

export const transactionRouter = Router();

transactionRouter.get("/", authenticate, listTransactionsHandler);

transactionRouter.post("/record", authenticate, validate({ body: recordBodySchema }), recordTxHandler);

transactionRouter.get("/:hash", authenticate, validate({ params: hashParamsSchema }), getTransactionHandler);

transactionRouter.post("/:hash/verify", authenticate, validate({ params: hashParamsSchema }), verifyTxHandler);
