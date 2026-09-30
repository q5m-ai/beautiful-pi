import type { PluginTimelineTransformerContribution } from "@getpaseo/plugin/client";
import { normalizeToolDetail } from "./normalize-tool";

type ToolCallTransformer = PluginTimelineTransformerContribution<"tool_call">["transform"];

export function reportedShellDurationMs(output: string | null): number | null {
  if (!output) return null;
  const matches = [...output.matchAll(/^Wall time:\s*(\d+(?:\.\d+)?) seconds?\s*$/gim)];
  const seconds = Number(matches.at(-1)?.[1]);
  return Number.isFinite(seconds) ? Math.round(seconds * 1_000) : null;
}

export const transformShellToolCall: ToolCallTransformer = ({ item }) => {
  const detail = normalizeToolDetail(item);
  if (detail.type !== "shell") return;

  return {
    items: [
      {
        type: "plugin",
        kind: "beautiful-shell",
        version: 9,
        data: {
          callId: item.callId,
          command: detail.command,
          output: detail.output ?? null,
          cwd: detail.cwd ?? null,
          status: item.status,
          exitCode: detail.exitCode ?? null,
          durationMs: reportedShellDurationMs(detail.output ?? null),
        },
      },
    ],
  };
};
