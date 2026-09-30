import type { PluginTimelineTransformerContribution } from "@getpaseo/plugin/client";
import { normalizeToolDetail } from "./normalize-tool";

type ToolCallTransformer = PluginTimelineTransformerContribution<"tool_call">["transform"];

export const transformFileToolCall: ToolCallTransformer = ({ item }) => {
  const detail = normalizeToolDetail(item);
  if (detail.type !== "read" && detail.type !== "write") return;

  return {
    items: [
      {
        type: "plugin",
        kind: "beautiful-file",
        version: 10,
        data: {
          callId: item.callId,
          operation: detail.type,
          filePath: detail.filePath,
          content: detail.content ?? null,
          status: item.status,
        },
      },
    ],
  };
};
