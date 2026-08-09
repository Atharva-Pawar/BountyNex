import { z } from "zod";

export const registerBodySchema = z
  .object({
    email: z.string().email("A valid email is required").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    name: z.string().min(2, "Name is required").max(120),
    role: z.enum(["RESEARCHER", "ORGANIZATION"], {
      message: "Role must be RESEARCHER or ORGANIZATION",
    }),
    orgName: z.string().min(2, "Organization name is required").max(160).optional(),
    orgWebsite: z.string().url("Organization website must be a valid URL").max(255).optional(),
    researcherHandle: z
      .string()
      .min(3, "Handle must be at least 3 characters")
      .max(40)
      .regex(/^[a-zA-Z0-9_]+$/, "Handle may only contain letters, numbers and underscores")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "ORGANIZATION" && !data.orgName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["orgName"],
        message: "Organization name is required when registering as an organization",
      });
    }
    if (data.role === "RESEARCHER" && !data.researcherHandle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["researcherHandle"],
        message: "A researcher handle is required when registering as a researcher",
      });
    }
  });

export const loginBodySchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});
