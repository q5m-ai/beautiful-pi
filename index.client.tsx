import type { PluginClientContext } from "@getpaseo/plugin/client";
import { EditPreview } from "./client/edit";
import { FilePreview } from "./client/file";
import { ShellPreview } from "./client/shell";
import { Thinking, thinkingSchema } from "./client/thinking";
import { transformEditToolCall } from "./client/transform-edit";
import { transformFileToolCall } from "./client/transform-file";
import { transformShellToolCall } from "./client/transform-shell";
import { editPreviewSchema } from "./shared/edit";
import { filePreviewSchema } from "./shared/file";
import { shellPreviewSchema } from "./shared/shell";

export default function contribute(client: PluginClientContext) {
  client.addTimelineTransformer({
    id: "beautiful-thinking",
    query: { itemType: "reasoning" },
    transform: ({ item, phase }) => ({
      items: [
        {
          type: "plugin",
          kind: "beautiful-thinking",
          version: 1,
          data: { text: item.text, phase },
        },
      ],
    }),
  });
  client.addTimelineRenderer({
    kind: "beautiful-thinking",
    version: 1,
    schema: thinkingSchema,
    Component: Thinking,
  });
  client.addTimelineTransformer({
    id: "beautiful-edit",
    query: { itemType: "tool_call" },
    transform: transformEditToolCall,
  });
  client.addTimelineRenderer({
    kind: "beautiful-edit",
    version: 1,
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
    version: 1,
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
    version: 1,
    schema: shellPreviewSchema,
    Component: ShellPreview,
  });
  return () => {};
}
