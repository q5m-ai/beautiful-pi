import { z } from "zod";

export const shellPreviewSchema = z.object({
  callId: z.string(),
  command: z.string(),
  output: z.string().nullable(),
  cwd: z.string().nullable(),
  status: z.enum(["running", "completed", "failed", "canceled"]),
  exitCode: z.number().nullable(),
  durationMs: z.number().nonnegative().nullable(),
});
