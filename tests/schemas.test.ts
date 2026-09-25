import { describe, expect, it } from "vitest";
import { editPreviewSchema } from "../shared/edit";
import { filePreviewSchema } from "../shared/file";
import { shellPreviewSchema } from "../shared/shell";

describe("timeline item schemas", () => {
  it("accepts valid shell, edit, and file preview payloads", () => {
    expect(shellPreviewSchema.safeParse({
      command: "npm test",
      output: null,
      cwd: null,
      status: "running",
      exitCode: null,
    }).success).toBe(true);

    expect(editPreviewSchema.safeParse({
      filePath: "client/app.tsx",
      oldString: null,
      newString: "content",
      unifiedDiff: null,
      status: "completed",
    }).success).toBe(true);

    expect(filePreviewSchema.safeParse({
      operation: "read",
      filePath: "README.md",
      content: "content",
      status: "completed",
    }).success).toBe(true);
  });

  it("rejects unsupported operations and statuses", () => {
    expect(filePreviewSchema.safeParse({
      operation: "delete",
      filePath: "README.md",
      content: null,
      status: "completed",
    }).success).toBe(false);

    expect(shellPreviewSchema.safeParse({
      command: "npm test",
      output: null,
      cwd: null,
      status: "pending",
      exitCode: null,
    }).success).toBe(false);
  });
});
