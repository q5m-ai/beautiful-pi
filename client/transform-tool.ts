import type { PluginTimelineTransformerContribution } from "@getpaseo/plugin/client";

type ToolCallTransformer = PluginTimelineTransformerContribution<"tool_call">["transform"];
type ToolItem = Parameters<ToolCallTransformer>[0]["item"];

type GenericTool = {
  label: string;
  content: string | null;
  icon: "Wrench" | "Search" | "Globe" | "GitBranch" | "Bot" | "ListChecks";
};

function humanize(name: string): string {
  const text = name.replace(/[_.-]+/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Tool";
}

function stringify(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.stack ?? value.message;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function genericTool(item: ToolItem): GenericTool | undefined {
  const detail = item.detail;
  switch (detail.type) {
    case "shell":
    case "read":
    case "edit":
    case "write":
      return;
    case "search":
      return {
        label: `${detail.toolName === "web_search" ? "Search web" : "Search"} ${detail.query}`,
        content: detail.content ?? stringify(detail.webResults ?? detail.filePaths),
        icon: detail.toolName === "web_search" ? "Globe" : "Search",
      };
    case "fetch":
      return { label: `Fetch ${detail.url}`, content: detail.result ?? null, icon: "Globe" };
    case "worktree_setup":
      return { label: `Set up ${detail.branchName}`, content: detail.log, icon: "GitBranch" };
    case "sub_agent":
      return {
        label: detail.description ?? detail.subAgentType ?? humanize(item.name),
        content: detail.log,
        icon: "Bot",
      };
    case "plain_text":
      return {
        label: detail.label ?? humanize(item.name),
        content: detail.text ?? null,
        icon: detail.icon === "brain" ? "Bot" : "Wrench",
      };
    case "plan":
      return { label: "Plan", content: detail.text, icon: "ListChecks" };
    case "unknown":
      return {
        label: humanize(item.name),
        content: stringify(detail.output ?? detail.input),
        icon: "Wrench",
      };
  }
}

export const transformGenericToolCall: ToolCallTransformer = ({ item }) => {
  if (item.name === "todo") return { items: [] };
  const tool = genericTool(item);
  if (!tool) return;

  const failure = item.status === "failed" ? stringify(item.error) : null;
  return {
    items: [
      {
        type: "plugin",
        kind: "beautiful-tool",
        version: 6,
        data: { ...tool, callId: item.callId, content: failure ?? tool.content, status: item.status },
      },
    ],
  };
};
