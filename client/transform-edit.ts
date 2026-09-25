import type { PluginTimelineTransformerContribution } from "@getpaseo/plugin/client";

type ToolCallTransformer = PluginTimelineTransformerContribution<"tool_call">["transform"];

export const transformEditToolCall: ToolCallTransformer = ({ item }) => {
  if (item.detail.type !== "edit") return;

  return {
    items: [
      {
        type: "plugin",
        kind: "beautiful-edit",
        version: 8,
        data: {
          callId: item.callId,
          filePath: item.detail.filePath,
          oldString: item.detail.oldString ?? null,
          newString: item.detail.newString ?? null,
          unifiedDiff: item.detail.unifiedDiff ?? null,
          status: item.status,
        },
      },
    ],
  };
};
