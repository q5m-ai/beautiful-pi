import { z } from "zod";

export const shellPreviewSchema = z.object({
  command: z.string(),
  output: z.string().nullable(),
  cwd: z.string().nullable(),
  status: z.enum(["running", "completed", "failed", "canceled"]),
  exitCode: z.number().nullable(),
});
