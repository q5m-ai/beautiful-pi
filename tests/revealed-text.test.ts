import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.doUnmock("@getpaseo/plugin/client/react-native");
  vi.resetModules();
});

describe("reasoning text host compatibility", () => {
  it("keeps host pacing when the hook is available", async () => {
    const hostHook = vi.fn((text: string, phase: string) => phase === "complete" ? text : text.slice(0, 3));
    vi.doMock("@getpaseo/plugin/client/react-native", () => ({ useRevealedText: hostHook }));
    const { useRevealedText } = await import("../client/revealed-text");

    expect(useRevealedText).toBe(hostHook);
    expect(useRevealedText("Thinking", "streaming")).toBe("Thi");
    expect(hostHook).toHaveBeenCalledWith("Thinking", "streaming");
    expect(useRevealedText("Thinking", "complete")).toBe("Thinking");
  });

  it.each([{}, { useRevealedText: undefined }, { useRevealedText: null }])(
    "renders live and completed text without a callable host hook (%j)",
    async (exports) => {
      // Model the 0.13 host module, not the older installed SDK declaration.
      vi.doMock("@getpaseo/plugin/client/react-native", () => exports);
      const { useRevealedText } = await import("../client/revealed-text");

      expect(useRevealedText("", "streaming")).toBe("");
      expect(useRevealedText("Thinking", "streaming")).toBe("Thinking");
      expect(useRevealedText("Thinking more", "streaming")).toBe("Thinking more");
      expect(useRevealedText("Finished", "complete")).toBe("Finished");
    },
  );
});
