import { describe, expect, it } from "vitest";
import { transformEditToolCall } from "../client/transform-edit";
import { transformFileToolCall } from "../client/transform-file";
import { transformShellToolCall } from "../client/transform-shell";

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
        version: 1,
        data: {
          command: "npm test",
          output: null,
          cwd: "/repo",
          status: "running",
          exitCode: null,
        },
      }),
    ]);
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
      data: { operation, filePath: "README.md", content: "hello", status: "completed" },
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
});
