import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon, useRevealedText } from "@getpaseo/plugin/client/react-native";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { z } from "zod";

export const thinkingSchema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

type ThinkingData = z.output<typeof thinkingSchema>;

function cleanThinkingText(text: string): string {
  return text.replace(/\*\*/g, "").trim();
}

export function Thinking({ item, theme, layout }: PluginTimelineItemProps<ThinkingData>) {
  const revealedText = useRevealedText(item.data.text, item.data.phase);
  const text = cleanThinkingText(revealedText);
  const styles = useMemo(
    () => ({
      container: {
        gap: 5,
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingVertical: 8,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.accent,
        borderRadius: 7,
        backgroundColor: theme.colors.surface1,
      },
      header: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 6,
      },
      label: {
        color: theme.colors.foregroundMuted,
        fontSize: 12,
        fontWeight: "600" as const,
        letterSpacing: 0.2,
      },
      body: {
        color: theme.colors.foregroundMuted,
        fontSize: 14,
        lineHeight: 20,
      },
    }),
    [layout.compact, theme],
  );

  return (
    <View style={styles.container} accessibilityLabel="Agent reasoning">
      <View style={styles.header}>
        <Icon name="Brain" size={14} color={theme.colors.accent} />
        <Text style={styles.label}>Reasoning</Text>
      </View>
      {text ? <Text selectable style={styles.body}>{text}</Text> : null}
    </View>
  );
}
