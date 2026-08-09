import type { Request, Response } from "express";
import { sendData } from "../middleware/error.js";
import {
  getTransaction,
  listTransactions,
  recordTransactionForUser,
  verifyAndUpdate,
  type RecordTxInput,
} from "../services/transaction.service.js";
import { buildPaginationMeta, asyncHandler, parsePagination } from "../utils/http.js";

export const recordTxHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RecordTxInput;
  const tx = await recordTransactionForUser(
    { id: req.user!.id, role: req.user!.role },
    input,
  );
  sendData(res, { transaction: tx }, 201);
});

export const listTransactionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { items, total } = await listTransactions(
    { id: req.user!.id, role: req.user!.role },
    page,
    limit,
  );
  sendData(res, { items, pagination: buildPaginationMeta(total, page, limit) });
});

export const getTransactionHandler = asyncHandler(async (req: Request, res: Response) => {
  const hash = (req.params as { hash: string }).hash;
  const tx = await getTransaction(hash);
  sendData(res, { transaction: tx });
});

export const verifyTxHandler = asyncHandler(async (req: Request, res: Response) => {
  const hash = (req.params as { hash: string }).hash;
  const tx = await verifyAndUpdate(hash);
  sendData(res, { transaction: tx });
});
