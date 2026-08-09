import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { httpLogger } from "./config/logger.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { globalLimiter } from "./middleware/rateLimit.js";
import { authRouter } from "./routes/auth.routes.js";
import { bountyRouter } from "./routes/bounty.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { transactionRouter } from "./routes/transaction.routes.js";
import { rewardRouter } from "./routes/reward.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { profileRouter } from "./routes/profile.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());
  app.use(httpLogger);

  app.use(globalLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", service: "bountynx-server", time: new Date().toISOString() } });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/bounties", bountyRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/wallet", walletRouter);
  app.use("/api/transactions", transactionRouter);
  app.use("/api/rewards", rewardRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/profile", profileRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
