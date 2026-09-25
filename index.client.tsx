import type { PluginClientContext } from "@getpaseo/plugin/client";
import { EditPreview } from "./client/edit";
import { FilePreview } from "./client/file";
import { ShellPreview } from "./client/shell";
import { Thinking, thinkingSchema } from "./client/thinking";
import { ToolPreview } from "./client/tool";
import { transformEditToolCall } from "./client/transform-edit";
import { transformFileToolCall } from "./client/transform-file";
import { transformShellToolCall } from "./client/transform-shell";
import { transformTodo } from "./client/transform-todo";
import { transformGenericToolCall } from "./client/transform-tool";
import { editPreviewSchema } from "./shared/edit";
import { filePreviewSchema } from "./shared/file";
import { shellPreviewSchema } from "./shared/shell";
import { toolPreviewSchema } from "./shared/tool";

export default function contribute(client: PluginClientContext) {
  client.addTimelineTransformer({
    id: "beautiful-thinking",
    query: { itemType: "reasoning" },
    transform: ({ item, phase }) => ({
      items: [
        {
          type: "plugin",
          kind: "beautiful-thinking",
          version: 8,
          data: { text: item.text, phase },
        },
      ],
    }),
  });
  client.addTimelineRenderer({
    kind: "beautiful-thinking",
    version: 8,
    schema: thinkingSchema,
    Component: Thinking,
  });
  client.addTimelineTransformer({
    id: "beautiful-todo",
    query: { itemType: "todo" },
    transform: transformTodo,
  });
  client.addTimelineTransformer({
    id: "beautiful-edit",
    query: { itemType: "tool_call" },
    transform: transformEditToolCall,
  });
  client.addTimelineRenderer({
    kind: "beautiful-edit",
    version: 10,
    schema: editPreviewSchema,
    Component: EditPreview,
  });
  client.addTimelineTransformer({
    id: "beautiful-file",
    query: { itemType: "tool_call" },
    transform: transformFileToolCall,
  });
  client.addTimelineRenderer({
    kind: "beautiful-file",
    version: 10,
    schema: filePreviewSchema,
    Component: FilePreview,
  });
  client.addTimelineTransformer({
    id: "beautiful-shell",
    query: { itemType: "tool_call" },
    transform: transformShellToolCall,
  });
  client.addTimelineRenderer({
    kind: "beautiful-shell",
    version: 9,
    schema: shellPreviewSchema,
    Component: ShellPreview,
  });
  client.addTimelineTransformer({
    id: "beautiful-tool",
    query: { itemType: "tool_call" },
    transform: transformGenericToolCall,
  });
  client.addTimelineRenderer({
    kind: "beautiful-tool",
    version: 8,
    schema: toolPreviewSchema,
    Component: ToolPreview,
  });
  return () => {};
}
