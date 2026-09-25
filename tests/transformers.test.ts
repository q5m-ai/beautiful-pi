import { describe, expect, it } from "vitest";
import { transformEditToolCall } from "../client/transform-edit";
import { transformFileToolCall } from "../client/transform-file";
import { transformShellToolCall } from "../client/transform-shell";
import { transformGenericToolCall } from "../client/transform-tool";
import { transformTodo } from "../client/transform-todo";

const base = {
  type: "tool_call" as const,
  callId: "call-1",
  name: "tool",
  error: null,
};

describe("tool-call transformers", () => {
  it("transforms shell calls and preserves nullable output", () => {
    const result = transformShellToolCall({
      item: {
        ...base,
        status: "running",
        detail: { type: "shell", command: "npm test", cwd: "/repo" },
      },
      phase: "streaming",
    });

    expect(result?.items).toEqual([
      expect.objectContaining({
        kind: "beautiful-shell",
        version: 9,
        data: {
          callId: "call-1",
          command: "npm test",
          output: null,
          cwd: "/repo",
          status: "running",
          exitCode: null,
          durationMs: null,
        },
      }),
    ]);
  });

  it("uses the shell-reported wall time for completed calls", () => {
    const result = transformShellToolCall({
      item: {
        ...base,
        status: "failed",
        detail: {
          type: "shell",
          command: "sleep 3 && false",
          output: "Wall time: 3.01 seconds\n\nCommand exited with code 1",
          exitCode: 1,
        },
      },
      phase: "complete",
    });

    expect(result?.items[0]).toEqual(expect.objectContaining({
      kind: "beautiful-shell",
      version: 9,
      data: expect.objectContaining({ durationMs: 3_010, status: "failed" }),
    }));
  });

  it("transforms edit calls with their inline diff", () => {
    const result = transformEditToolCall({
      item: {
        ...base,
        status: "completed",
        detail: {
          type: "edit",
          filePath: "client/app.tsx",
          oldString: "old",
          newString: "new",
          unifiedDiff: "-old\n+new",
        },
      },
      phase: "complete",
    });

    expect(result?.items[0]).toEqual(expect.objectContaining({
      kind: "beautiful-edit",
      data: expect.objectContaining({ filePath: "client/app.tsx", status: "completed" }),
    }));
  });

  it.each(["read", "write"] as const)("transforms %s calls", (operation) => {
    const result = transformFileToolCall({
      item: {
        ...base,
        status: "completed",
        detail: { type: operation, filePath: "README.md", content: "hello" },
      },
      phase: "complete",
    });

    expect(result?.items[0]).toEqual(expect.objectContaining({
      kind: "beautiful-file",
      data: { callId: "call-1", operation, filePath: "README.md", content: "hello", status: "completed" },
    }));
  });

  it("renders labeled plain-text tools such as q5m memory as compact cards", () => {
    const result = transformGenericToolCall({
      item: {
        ...base,
        name: "q5m_dev_memory_search",
        status: "completed",
        detail: { type: "plain_text", label: "Q5m memory search", text: "Found a memory" },
      },
      phase: "complete",
    });

    expect(result?.items[0]).toEqual(expect.objectContaining({
      kind: "beautiful-tool",
      data: {
        callId: "call-1",
        label: "Q5m memory search",
        content: "Found a memory",
        icon: "Wrench",
        status: "completed",
      },
    }));
  });

  it.each([
    [{ type: "search" as const, query: "needle", content: "match" }, "Search needle", "Search"],
    [{ type: "fetch" as const, url: "https://example.com", result: "page" }, "Fetch https://example.com", "Globe"],
    [{ type: "worktree_setup" as const, worktreePath: "/tmp/tree", branchName: "feature", log: "ready", commands: [] }, "Set up feature", "GitBranch"],
    [{ type: "sub_agent" as const, description: "Review change", log: "done" }, "Review change", "Bot"],
    [{ type: "plan" as const, text: "Step one" }, "Plan", "ListChecks"],
    [{ type: "unknown" as const, input: { task: "work" }, output: null }, "Tool", "Wrench"],
  ])("renders the remaining tool detail %# as a compact card", (detail, label, icon) => {
    const result = transformGenericToolCall({
      item: { ...base, status: "completed", detail },
      phase: "complete",
    });

    expect(result?.items[0]).toEqual(expect.objectContaining({
      kind: "beautiful-tool",
      data: expect.objectContaining({ label, icon, status: "completed" }),
    }));
  });

  it("leaves unrelated tool calls unchanged", () => {
    const input = {
      item: {
        ...base,
        status: "completed" as const,
        detail: { type: "search" as const, query: "needle" },
      },
      phase: "complete" as const,
    };

    expect(transformShellToolCall(input)).toBeUndefined();
    expect(transformEditToolCall(input)).toBeUndefined();
    expect(transformFileToolCall(input)).toBeUndefined();
  });

  it("preserves the error when a fallback tool fails without output", () => {
    const result = transformGenericToolCall({
      item: {
        ...base,

        status: "failed",
        error: { message: "Memory service unavailable", code: "offline" },
        detail: { type: "plain_text", label: "Q5m memory search" },
      },
      phase: "complete",
    });

    expect(result?.items[0]?.data).toEqual(expect.objectContaining({
      status: "failed",
      content: JSON.stringify({ message: "Memory service unavailable", code: "offline" }, null, 2),
    }));
  });
  it("hides the raw todo tool call when a task-status item is emitted", () => {
    const result = transformGenericToolCall({
      item: {
        ...base,
        name: "todo",
        status: "completed",
        detail: { type: "unknown", input: { op: "done" }, output: null },
      },
      phase: "complete",
    });

    expect(result).toEqual({ items: [] });
  });

  it.each([
    { type: "shell" as const, command: "pwd" },
    { type: "read" as const, filePath: "README.md" },
    { type: "edit" as const, filePath: "README.md" },
    { type: "write" as const, filePath: "README.md" },
  ])("does not override specialized $type cards", (detail) => {
    expect(transformGenericToolCall({
      item: { ...base, status: "completed", detail },
      phase: "complete",
    })).toBeUndefined();
  });
});

describe("todo transformer", () => {
  it("renders task updates through the standard compact card", () => {
    const result = transformTodo({
      item: {
        type: "todo",
        items: [
          { text: "Inspect timeline", completed: true, status: "completed" },
          { text: "Unify task rows", completed: false, status: "in_progress", activeForm: "Unifying task rows" },
        ],
      },
      phase: "complete",
    });

    expect(result?.items).toEqual([
      expect.objectContaining({
        kind: "beautiful-tool",
        version: 8,
        data: {
          callId: null,
          label: "Unifying task rows",
          content: "✓ Inspect timeline\n→ Unify task rows",
          icon: "ListChecks",
          status: "completed",
        },
      }),
    ]);
  });
});
