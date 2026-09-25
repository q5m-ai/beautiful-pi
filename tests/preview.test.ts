import { describe, expect, it } from "vitest";
import { cleanThinkingText, currentActivity, oneLinePreview, outputPreview } from "../shared/preview";
import { formatElapsed } from "../shared/time";

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
