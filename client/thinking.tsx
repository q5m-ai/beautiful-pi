import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon, useRevealedText } from "@getpaseo/plugin/client/react-native";
import { useMemo, type ReactNode } from "react";
import { Text, View } from "react-native";
import { z } from "zod";

export const thinkingSchema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

type ThinkingData = z.output<typeof thinkingSchema>;

function renderThinkingText(text: string): ReactNode[] {
  return text.split(/(\*\*[\s\S]+?\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <Text key={index} style={{ fontWeight: "700" }}>{part.slice(2, -2)}</Text>;
    }
    return part;
  });
}

export function Thinking({ item, theme, layout }: PluginTimelineItemProps<ThinkingData>) {
  const text = useRevealedText(item.data.text, item.data.phase);
  const styles = useMemo(
    () => ({
      container: {
        gap: 7,
        paddingHorizontal: layout.compact ? 10 : 12,
        paddingVertical: 10,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.accent,
        borderRadius: 8,
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
        lineHeight: 21,
      },
    }),
    [layout.compact, theme],
  );

  return (
    <View style={styles.container} accessibilityLabel="Agent thinking">
      <View style={styles.header}>
        <Icon name="Brain" size={14} color={theme.colors.accent} />
        <Text style={styles.label}>{item.data.phase === "streaming" ? "Thinking…" : "Thought"}</Text>
      </View>
      <Text selectable style={styles.body}>{renderThinkingText(text)}</Text>
    </View>
  );
}
