import { createApp } from "./app.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function bootstrap() {
  try {
    const cloudinaryConfigured = configureCloudinary();
    if (cloudinaryConfigured) {
      logger.info("Cloudinary image uploads configured");
    } else {
      logger.warn("Cloudinary is not configured - image uploads will be disabled");
    }
    await prisma.$connect();
    logger.info("Connected to PostgreSQL");

    const server = app.listen(env.PORT, () => {
      logger.info(`BountyNex API listening on http://localhost:${env.PORT}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap server");
    process.exit(1);
  }
}

void bootstrap();
