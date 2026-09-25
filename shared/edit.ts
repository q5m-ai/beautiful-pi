import { z } from "zod";

export const editPreviewSchema = z.object({
  callId: z.string(),
  filePath: z.string(),
  oldString: z.string().nullable(),
  newString: z.string().nullable(),
  unifiedDiff: z.string().nullable(),
  status: z.enum(["running", "completed", "failed", "canceled"]),
});
