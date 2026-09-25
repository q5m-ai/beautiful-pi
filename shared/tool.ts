import { z } from "zod";

export const toolPreviewSchema = z.object({
  label: z.string(),
  content: z.string().nullable(),
  icon: z.enum(["Wrench", "Search", "Globe", "GitBranch", "Bot", "ListChecks"]),
  status: z.enum(["running", "completed", "failed", "canceled"]),
});
