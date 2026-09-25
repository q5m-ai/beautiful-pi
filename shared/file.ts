import { z } from "zod";

export const filePreviewSchema = z.object({
  operation: z.enum(["read", "write"]),
  filePath: z.string(),
  content: z.string().nullable(),
  status: z.enum(["running", "completed", "failed", "canceled"]),
});
