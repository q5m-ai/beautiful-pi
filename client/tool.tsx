import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { useMemo, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import type { z } from "zod";
import { toolPreviewSchema } from "../shared/tool";
import { formatDenseTime, formatStepTiming } from "../shared/time";
import { usePulseOpacity, useStepTiming } from "./running-step";
import { compactTimelineCardSpacing } from "./styles";

type ToolPreviewData = z.output<typeof toolPreviewSchema>;

export function ToolPreview({ agentId, item, timestamp, theme, layout }: PluginTimelineItemProps<ToolPreviewData>) {
  const [expanded, setExpanded] = useState(false);
  const running = item.data.status === "running";
  const timing = useStepTiming(`${agentId}:${item.data.callId ?? "todo"}`, timestamp, running);
  const completionTime = formatDenseTime(timing.completedAt);
  const { label: timingLabel, description: timingDescription } = formatStepTiming(timing.duration, completionTime, expanded);
  const pulseOpacity = usePulseOpacity(running);
  const styles = useMemo(
    () => ({
      card: {
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
      title: {
        color: theme.colors.foregroundMuted,
        flex: 1,
        fontSize: 12,
        fontWeight: "600" as const,
      },
      collapsedTitle: {
        color: theme.colors.foregroundMuted,
        flex: 1,
        fontFamily: "monospace",
        fontSize: 12,
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
        color: item.data.status === "failed" ? theme.colors.statusDanger : theme.colors.foregroundMuted,
        fontFamily: "monospace",
        fontSize: 10,
      },
      body: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingVertical: 8,
        backgroundColor: theme.colors.surface2,
      },
      content: {
        color: theme.colors.foregroundMuted,
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 18,
      },
    }),
    [item.data.status, layout.compact, theme],
  );

  return (
    <View style={styles.card} accessibilityLabel="Tool call">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse tool call" : "Expand tool call"}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <Icon name={item.data.icon} size={14} color={theme.colors.foregroundMuted} />
        <Animated.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[expanded ? styles.title : styles.collapsedTitle, { opacity: pulseOpacity }]}
        >
          {item.data.label}
        </Animated.Text>
        <View style={styles.statusArea}>
          {item.data.status === "completed" ? (
            <>
              <Text accessibilityLabel={`Completed ${timingDescription}`} style={styles.timestamp}>
                {timingLabel}
              </Text>
              <Icon name="CircleCheck" size={13} color={theme.colors.statusSuccess} />
            </>
          ) : item.data.status === "failed" ? (
            <>
              <Text accessibilityLabel={`Failed ${timingDescription}`} style={styles.timestamp}>
                {timingLabel}
              </Text>
              <Icon name="CircleX" size={13} color={theme.colors.statusDanger} />
            </>
          ) : item.data.status === "canceled" ? (
            <>
              <Text accessibilityLabel={`Canceled ${timingDescription}`} style={styles.timestamp}>
                {timingLabel}
              </Text>
              <Text style={styles.status}>Canceled</Text>
            </>
          ) : (
            <>
              <Text accessibilityLabel={`Running ${timing.elapsed}`} style={styles.status}>{timing.elapsed}</Text>
              <Icon name="Timer" size={13} color={theme.colors.foregroundMuted} />
            </>
          )}
        </View>
        <Icon name={expanded ? "ChevronDown" : "ChevronRight"} size={14} color={theme.colors.foregroundMuted} />
      </Pressable>
      {expanded ? (
        <View style={styles.body}>
          <Text selectable style={styles.content}>{item.data.content ?? "No inline details available."}</Text>
        </View>
      ) : null}
    </View>
  );
}
