import type { PluginTimelineTransformerContribution } from "@getpaseo/plugin/client";

type TodoTransformer = PluginTimelineTransformerContribution<"todo">["transform"];

export const transformTodo: TodoTransformer = ({ item }) => {
  const active = item.items.find((task) => task.status === "in_progress");
  const completed = item.items.filter((task) => task.completed || task.status === "completed").length;
  const label = active?.activeForm?.trim() || active?.text || `Tasks ${completed}/${item.items.length}`;
  const content = item.items
    .map((task) => {
      const marker = task.completed || task.status === "completed" ? "✓" : task.status === "in_progress" ? "→" : "○";
      return `${marker} ${task.text}`;
    })
    .join("\n");

  return {
    items: [
      {
        type: "plugin",
        kind: "beautiful-tool",
        version: 6,
        data: {
          callId: null,
          label,
          content: content || "No tasks",
          icon: "ListChecks",
          status: "completed",
        },
      },
    ],
  };
};
