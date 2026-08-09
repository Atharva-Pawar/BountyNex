import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_COOKIE_NAME: z.string().default("bntnx_token"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default("bountynx-evidence"),
  RPC_URL_SEPOLIA: z.string().optional(),
  CHAIN_ID_SEPOLIA: z.coerce.number().default(11155111),
  BOUNTY_ESCROW_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "BOUNTY_ESCROW_ADDRESS must be a valid address")
    .optional(),
  SEPOLIA_EXPLORER_URL: z.string().default("https://sepolia.etherscan.io"),
  ETHERSCAN_API_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  console.error(`[config] Invalid environment variables:\n${issues}`);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
