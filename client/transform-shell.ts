import type { PluginTimelineTransformerContribution } from "@getpaseo/plugin/client";

type ToolCallTransformer = PluginTimelineTransformerContribution<"tool_call">["transform"];

export const transformShellToolCall: ToolCallTransformer = ({ item }) => {
  if (item.detail.type !== "shell") return;

  return {
    items: [
      {
        type: "plugin",
        kind: "beautiful-shell",
        version: 1,
        data: {
          command: item.detail.command,
          output: item.detail.output ?? null,
          cwd: item.detail.cwd ?? null,
          status: item.status,
          exitCode: item.detail.exitCode ?? null,
        },
      },
    ],
  };
};
