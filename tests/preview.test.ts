import { describe, expect, it } from "vitest";
import { cleanThinkingText, currentActivity, oneLinePreview, outputPreview } from "../shared/preview";
import { tokenizeCode } from "../shared/syntax";
import { formatDenseTime, formatDuration, formatElapsed, formatStepTiming } from "../shared/time";

describe("timeline previews", () => {
  it("shows the latest non-empty reasoning activity without Pi bold markers", () => {
    const cleaned = cleanThinkingText("**Inspecting files**\n\n**Running tests**");
    expect(currentActivity(cleaned)).toBe("Running tests");
  });

  it("uses a fallback while reasoning has no visible activity", () => {
    expect(currentActivity(" \n ")).toBe("Thinking…");
  });

  it("concatenates multiline commands into one line", () => {
    expect(oneLinePreview(" npm test \\\n  && npm run typecheck ")).toBe("npm test \\ && npm run typecheck");
  });

  it("shows the latest five output lines while collapsed", () => {
    expect(outputPreview("1\n2\n3\n4\n5\n6", false)).toEqual({
      text: "2\n3\n4\n5\n6",
      skipped: 1,
    });
  });

  it("normalizes output newlines and includes everything while expanded", () => {
    expect(outputPreview("one\r\ntwo\r\n", true)).toEqual({ text: "one\ntwo", skipped: 0 });
    expect(outputPreview(null, false)).toEqual({ text: "", skipped: 0 });
  });
});

describe("elapsed labels", () => {
  it.each([
    [-1, "0s"],
    [59_999, "59s"],
    [60_000, "1m 00s"],
    [125_000, "2m 05s"],
    [3_661_000, "1h 01m"],
  ])("formats %i milliseconds as %s", (milliseconds, expected) => {
    expect(formatElapsed(milliseconds)).toBe(expected);
  });
});

describe("completed duration labels", () => {
  it.each([
    [2_499, "2s"],
    [2_501, "3s"],
    [59_600, "1m 00s"],
  ])("rounds %i milliseconds to %s", (milliseconds, expected) => {
    expect(formatDuration(milliseconds)).toBe(expected);
  });
});

describe("compact step timing", () => {
  it("uses a relative fallback while collapsed and the clock time while expanded", () => {
    expect(formatStepTiming(null, "14:08:02", false)).toEqual({
      label: "<1s",
      description: "<1s, at 14:08:02",
    });
    expect(formatStepTiming("3s", "14:08:05", true).label).toBe("14:08:05");
  });
});

describe("completion timestamps", () => {
  it("uses a dense local 24-hour time with seconds", () => {
    expect(formatDenseTime(new Date(2026, 8, 25, 7, 4, 9))).toBe("07:04:09");
  });
});

describe("syntax highlighting", () => {
  it("distinguishes code tokens without treating comment markers inside strings as comments", () => {
    expect(tokenizeCode('const answer = \"// ok\"; // note', "example.ts")[0]).toEqual([
      { kind: "keyword", text: "const" },
      { kind: "plain", text: " answer = " },
      { kind: "string", text: '\"// ok\"' },
      { kind: "plain", text: "; " },
      { kind: "comment", text: "// note" },
    ]);
  });
});
