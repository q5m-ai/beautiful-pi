import { describe, expect, it } from "vitest";
import { editPreviewSchema } from "../shared/edit";
import { filePreviewSchema } from "../shared/file";
import { shellPreviewSchema } from "../shared/shell";
import { toolPreviewSchema } from "../shared/tool";

describe("timeline item schemas", () => {
  it("accepts valid shell, edit, and file preview payloads", () => {
    expect(shellPreviewSchema.safeParse({
      callId: "call-1",
      command: "npm test",
      output: null,
      cwd: null,
      status: "running",
      exitCode: null,
      durationMs: null,
    }).success).toBe(true);

    expect(editPreviewSchema.safeParse({
      callId: "call-1",
      filePath: "client/app.tsx",
      oldString: null,
      newString: "content",
      unifiedDiff: null,
      status: "completed",
    }).success).toBe(true);

    expect(filePreviewSchema.safeParse({
      callId: "call-1",
      operation: "read",
      filePath: "README.md",
      content: "content",
      status: "completed",
    }).success).toBe(true);

    expect(toolPreviewSchema.safeParse({
      callId: "call-1",
      label: "Q5m memory search",
      content: null,
      icon: "Wrench",
      status: "completed",
    }).success).toBe(true);
  });

  it("rejects unsupported operations and statuses", () => {
    expect(filePreviewSchema.safeParse({
      callId: "call-1",
      operation: "delete",
      filePath: "README.md",
      content: null,
      status: "completed",
    }).success).toBe(false);

    expect(shellPreviewSchema.safeParse({
      callId: "call-1",
      command: "npm test",
      output: null,
      cwd: null,
      status: "pending",
      exitCode: null,
    }).success).toBe(false);
  });
});
