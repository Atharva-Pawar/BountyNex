import { z } from "zod";

export const updateProfileBodySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  website: z.union([z.string().trim().url("Invalid URL").max(200), z.literal("")]).optional(),
  description: z.string().trim().max(1000).optional(),
}).strict();
