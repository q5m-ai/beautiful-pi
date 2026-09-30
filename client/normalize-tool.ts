import type { PluginTimelineTransformerContribution } from "@getpaseo/plugin/client";
import { z } from "zod";

type ToolItem = Parameters<PluginTimelineTransformerContribution<"tool_call">["transform"]>[0]["item"];
const bashInput = z.object({ command: z.string().min(1), cwd: z.string().nullish() });
const readInput = z.object({ path: z.string().min(1) });

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}

function outputText(value: unknown): string | null {
  if (typeof value === "string") return value;
  const result = record(value);
  if (!result) return null;
  for (const key of ["output", "stdout", "text"]) {
    if (typeof result[key] === "string") return result[key];
  }
  if (!Array.isArray(result.content)) return null;
  const parts = result.content.flatMap((block) => {
    const entry = record(block);
    return entry?.type === "text" && typeof entry.text === "string" ? [entry.text] : [];
  });
  return parts.length ? parts.join("\n") : null;
}

// Pi's mapper rejects nullable optional arguments (timeout, offset, limit).
// Recover only known Pi tools with usable inputs; leave other unknown tools alone.
export function normalizeToolDetail(item: ToolItem): ToolItem["detail"] {
  const detail = item.detail;
  if (detail.type !== "unknown") return detail;
  if (item.name === "bash") {
    const parsed = bashInput.safeParse(detail.input);
    if (!parsed.success) return detail;
    const result = record(detail.output);
    const code = result?.exitCode ?? result?.code;
    return {
      type: "shell",
      command: parsed.data.command,
      cwd: parsed.data.cwd ?? undefined,
      output: outputText(detail.output) ?? undefined,
      exitCode: typeof code === "number" && Number.isFinite(code) ? code : null,
    };
  }
  if (item.name === "read") {
    const parsed = readInput.safeParse(detail.input);
    if (!parsed.success) return detail;
    return { type: "read", filePath: parsed.data.path, content: outputText(detail.output) ?? undefined };
  }
  return detail;
}
