import type { PluginTimelineTransformerContribution } from "@getpaseo/plugin/client";

type ToolCallTransformer = PluginTimelineTransformerContribution<"tool_call">["transform"];

export const transformFileToolCall: ToolCallTransformer = ({ item }) => {
  if (item.detail.type !== "read" && item.detail.type !== "write") return;

  return {
    items: [
      {
        type: "plugin",
        kind: "beautiful-file",
        version: 8,
        data: {
          callId: item.callId,
          operation: item.detail.type,
          filePath: item.detail.filePath,
          content: item.detail.content ?? null,
          status: item.status,
        },
      },
    ],
  };
};
