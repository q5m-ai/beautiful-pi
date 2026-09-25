import { describe, expect, it } from "vitest";
import { compactTimelineCardSpacing } from "../client/styles";

describe("timeline card spacing", () => {
  it("preserves host leading margins while compacting the trailing gap", () => {
    expect(compactTimelineCardSpacing).toEqual({ marginBottom: -4 });
    expect(compactTimelineCardSpacing).not.toHaveProperty("marginTop");
    expect(compactTimelineCardSpacing).not.toHaveProperty("marginVertical");
  });
});
