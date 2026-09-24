import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { useRevealedText } from "@getpaseo/plugin/client/react-native";
import { View } from "react-native";
import { z } from "zod";
import { Markdown } from "./markdown";

export const thinkingSchema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

type ThinkingData = z.output<typeof thinkingSchema>;

export function Thinking({ item, theme, layout }: PluginTimelineItemProps<ThinkingData>) {
  const text = useRevealedText(item.data.text, item.data.phase);
  return (
    <View accessibilityLabel="Agent thinking">
      <Markdown source={text} theme={theme} compact={layout.compact} />
    </View>
  );
}
