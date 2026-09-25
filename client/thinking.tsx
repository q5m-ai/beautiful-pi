import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon, useRevealedText } from "@getpaseo/plugin/client/react-native";
import { useMemo, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { cleanThinkingText, currentActivity } from "../shared/preview";
import { formatDenseTime, formatStepTiming } from "../shared/time";
import { usePulseOpacity, useStepTiming } from "./running-step";
import { compactTimelineCardSpacing } from "./styles";

export const thinkingSchema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

type ThinkingData = z.output<typeof thinkingSchema>;

export function Thinking({ agentId, item, timestamp, theme, layout }: PluginTimelineItemProps<ThinkingData>) {
  const [expanded, setExpanded] = useState(false);
  const revealedText = useRevealedText(item.data.text, item.data.phase);
  const text = cleanThinkingText(revealedText);
  const running = item.data.phase === "streaming";
  const timing = useStepTiming(`${agentId}:reasoning`, timestamp, running);
  const completionTime = formatDenseTime(timing.completedAt);
  const { label: timingLabel, description: timingDescription } = formatStepTiming(timing.duration, completionTime, expanded);
  const pulseOpacity = usePulseOpacity(running);
  const styles = useMemo(
    () => ({
      container: {
        overflow: "hidden" as const,
        ...compactTimelineCardSpacing,
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
        fontSize: 13,
        letterSpacing: 0.2,
        marginLeft: -1,
      },
      expandedLabel: {
        fontWeight: "600" as const,
      },
      statusArea: {
        alignItems: "center" as const,
        flexDirection: "row" as const,
        gap: 5,
        marginLeft: "auto" as const,
      },
      status: {
        color: theme.colors.foregroundMuted,
        fontSize: 11,
      },
      timestamp: {
        color: theme.colors.foregroundMuted,
        fontFamily: "monospace",
        fontSize: 10,
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
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse reasoning" : "Expand reasoning"}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <Icon name="Brain" size={14} color={theme.colors.foregroundMuted} />
        <Animated.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.label, expanded ? styles.expandedLabel : undefined, { opacity: pulseOpacity }]}
        >
          {expanded ? "Reasoning" : currentActivity(text)}
        </Animated.Text>
        <View style={styles.statusArea}>
          {running ? (
            <>
              <Text accessibilityLabel={`Running ${timing.elapsed}`} style={styles.status}>{timing.elapsed}</Text>
              <Icon name="Timer" size={13} color={theme.colors.foregroundMuted} />
            </>
          ) : (
            <>
              <Text accessibilityLabel={`Completed ${timingDescription}`} style={styles.timestamp}>
                {timingLabel}
              </Text>
              <Icon name="CircleCheck" size={13} color={theme.colors.statusSuccess} />
            </>
          )}
        </View>
        <Icon name={expanded ? "ChevronDown" : "ChevronRight"} size={14} color={theme.colors.foregroundMuted} />
      </Pressable>
      {expanded && text ? <Text selectable style={styles.body}>{text}</Text> : null}
    </View>
  );
}
