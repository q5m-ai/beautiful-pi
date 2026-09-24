import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon, useRevealedText } from "@getpaseo/plugin/client/react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
  const [expanded, setExpanded] = useState(true);
  const revealedText = useRevealedText(item.data.text, item.data.phase);
  const text = cleanThinkingText(revealedText);
  const canCollapse = item.data.phase === "complete";
  const styles = useMemo(
    () => ({
      container: {
        overflow: "hidden" as const,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.accent,
        borderRadius: 7,
        backgroundColor: theme.colors.surface1,
      },
      header: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 6,
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingVertical: 8,
      },
      label: {
        color: theme.colors.foregroundMuted,
        fontSize: 12,
        fontWeight: "600" as const,
        letterSpacing: 0.2,
      },
      status: {
        color: theme.colors.foregroundMuted,
        fontSize: 11,
        marginLeft: "auto" as const,
      },
      body: {
        color: theme.colors.foregroundMuted,
        fontSize: 14,
        lineHeight: 20,
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingBottom: 8,
      },
    }),
    [layout.compact, theme],
  );

  return (
    <View style={styles.container} accessibilityLabel="Agent reasoning">
      <Pressable
        disabled={!canCollapse}
        accessibilityRole={canCollapse ? "button" : undefined}
        accessibilityLabel={canCollapse ? (expanded ? "Collapse reasoning" : "Expand reasoning") : undefined}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <Icon name="Brain" size={14} color={theme.colors.accent} />
        <Text style={styles.label}>Reasoning</Text>
        <Text style={styles.status}>{canCollapse ? "Done" : "Running…"}</Text>
        {canCollapse ? (
          <Icon name={expanded ? "ChevronDown" : "ChevronRight"} size={14} color={theme.colors.foregroundMuted} />
        ) : null}
      </Pressable>
      {expanded && text ? <Text selectable style={styles.body}>{text}</Text> : null}
    </View>
  );
}
