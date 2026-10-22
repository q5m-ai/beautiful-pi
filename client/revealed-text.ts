import * as host from "@getpaseo/plugin/client/react-native";

// Host exports are fixed for the lifetime of the loaded plugin. Select once so
// React's hook order stays stable, including on clients that removed this hook.
export const useRevealedText: (text: string, phase: "streaming" | "complete") => string =
  "useRevealedText" in host && typeof host.useRevealedText === "function"
    ? host.useRevealedText
    : (text) => text;
