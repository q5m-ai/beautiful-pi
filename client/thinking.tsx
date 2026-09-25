import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon, useRevealedText } from "@getpaseo/plugin/client/react-native";
import { useMemo, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { useElapsedLabel, usePulseOpacity } from "./running-step";

export const thinkingSchema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

type ThinkingData = z.output<typeof thinkingSchema>;

function cleanThinkingText(text: string): string {
  return text.replace(/\*\*/g, "").trim();
}

function currentActivity(text: string): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.at(-1) ?? "Thinking…";
}

export function Thinking({ item, timestamp, theme, layout }: PluginTimelineItemProps<ThinkingData>) {
  const [expanded, setExpanded] = useState(false);
  const revealedText = useRevealedText(item.data.text, item.data.phase);
  const text = cleanThinkingText(revealedText);
  const running = item.data.phase === "streaming";
  const elapsed = useElapsedLabel(timestamp, running);
  const pulseOpacity = usePulseOpacity(running);
  const styles = useMemo(
    () => ({
      container: {
        overflow: "hidden" as const,
        marginTop: running ? 6 : 0,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.foregroundMuted,
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
        flex: 1,
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
    [layout.compact, running, theme],
  );

  return (
    <View style={styles.container} accessibilityLabel="Agent reasoning">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse reasoning" : "Expand reasoning"}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <Icon name="Brain" size={14} color={theme.colors.foregroundMuted} />
        <Animated.Text numberOfLines={1} ellipsizeMode="tail" style={[styles.label, { opacity: pulseOpacity }]}>
          {currentActivity(text)}
        </Animated.Text>
        <Text style={styles.status}>{running ? elapsed : "Done"}</Text>
        <Icon name={expanded ? "ChevronDown" : "ChevronRight"} size={14} color={theme.colors.foregroundMuted} />
      </Pressable>
      {expanded && text ? <Text selectable style={styles.body}>{text}</Text> : null}
    </View>
  );
}
