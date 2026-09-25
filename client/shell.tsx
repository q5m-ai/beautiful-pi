import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { useMemo, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import type { z } from "zod";
import { oneLinePreview, outputPreview } from "../shared/preview";
import { shellPreviewSchema } from "../shared/shell";
import { formatDenseTime, formatDuration, formatStepTiming } from "../shared/time";
import { usePulseOpacity, useStepTiming } from "./running-step";
import { compactTimelineCardSpacing } from "./styles";

type ShellPreviewData = z.output<typeof shellPreviewSchema>;

const COMMAND_PREVIEW_LINES = 4;
const LONG_COMMAND_CHARACTERS = 180;

function statusLabel(data: ShellPreviewData, elapsed: string | null): string | null {
  if (data.status === "running") return elapsed ?? "0s";
  if (data.status === "canceled") return "Canceled";
  return null;
}

export function ShellPreview({ agentId, item, timestamp, theme, layout }: PluginTimelineItemProps<ShellPreviewData>) {
  const [sectionExpanded, setSectionExpanded] = useState(false);
  const [commandExpanded, setCommandExpanded] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const command = item.data.command.trim();
  const commandPreview = oneLinePreview(command);
  const running = item.data.status === "running";
  const timing = useStepTiming(`${agentId}:${item.data.callId}`, timestamp, running);
  const completionTime = formatDenseTime(timing.completedAt);
  const reportedDuration = item.data.durationMs === null ? null : formatDuration(item.data.durationMs);
  const { label: timingLabel, description: timingDescription } = formatStepTiming(
    reportedDuration ?? timing.duration,
    completionTime,
    sectionExpanded,
  );
  const pulseOpacity = usePulseOpacity(running);
  const commandNeedsCollapse =
    command.length > LONG_COMMAND_CHARACTERS || command.split("\n").length > COMMAND_PREVIEW_LINES;
  const preview = outputPreview(item.data.output, outputExpanded);

  const canToggleOutput = outputExpanded || preview.skipped > 0;
  const styles = useMemo(
    () => ({
      card: {
        overflow: "hidden" as const,
        ...compactTimelineCardSpacing,
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
      title: {
        color: theme.colors.foregroundMuted,
        flex: 1,
        fontSize: 12,
        fontWeight: "600" as const,
      },
      collapsedCommand: {
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
      commandArea: {
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingBottom: preview.text ? 8 : 10,
      },
      command: {
        color: theme.colors.foreground,
        fontFamily: "monospace",
        fontSize: 13,
        lineHeight: 19,
        flexShrink: 1,
      },
      prompt: { color: theme.colors.accent, fontWeight: "700" as const },
      commandHint: {
        color: theme.colors.foregroundMuted,
        fontSize: 11,
        lineHeight: 16,
        marginTop: 3,
      },
      outputArea: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingVertical: 8,
        backgroundColor: theme.colors.surface2,
      },
      hint: {
        color: theme.colors.foregroundMuted,
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 3,
      },
      output: {
        color: item.data.status === "failed" ? theme.colors.statusDanger : theme.colors.foregroundMuted,
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 18,
        flexShrink: 1,
      },
    }),
    [item.data.status, layout.compact, preview.text, theme],
  );

  return (
    <View style={styles.card} accessibilityLabel="Shell command">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sectionExpanded ? "Collapse shell section" : "Expand shell section"}
        onPress={() => setSectionExpanded((value) => !value)}
        style={styles.header}
      >
        <Icon name="SquareTerminal" size={14} color={theme.colors.accent} />
        <Animated.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[sectionExpanded ? styles.title : styles.collapsedCommand, { opacity: pulseOpacity }]}
        >
          {sectionExpanded ? "Shell" : `$ ${commandPreview}`}
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
            <Text style={styles.status}>{statusLabel(item.data, timing.elapsed)}</Text>
          )}
        </View>
        <Icon name={sectionExpanded ? "ChevronDown" : "ChevronRight"} size={14} color={theme.colors.foregroundMuted} />
      </Pressable>
      {sectionExpanded ? (
        <>
          <Pressable
            disabled={!commandNeedsCollapse}
            accessibilityRole={commandNeedsCollapse ? "button" : undefined}
            accessibilityLabel={commandNeedsCollapse ? (commandExpanded ? "Collapse shell command" : "Expand shell command") : undefined}
            onPress={() => setCommandExpanded((value) => !value)}
            style={styles.commandArea}
          >
            <Text
              selectable
              numberOfLines={commandNeedsCollapse && !commandExpanded ? COMMAND_PREVIEW_LINES : undefined}
              ellipsizeMode="tail"
              style={styles.command}
            >
              <Text style={styles.prompt}>$ </Text>
              {command}
            </Text>
            {commandNeedsCollapse ? (
              <Text style={styles.commandHint}>{commandExpanded ? "Tap to collapse" : "Tap to show full command"}</Text>
            ) : null}
          </Pressable>
          {preview.text ? (
            <Pressable
              disabled={!canToggleOutput}
              accessibilityRole={canToggleOutput ? "button" : undefined}
              accessibilityLabel={canToggleOutput ? (outputExpanded ? "Collapse shell output" : "Expand shell output") : undefined}
              onPress={() => setOutputExpanded((value) => !value)}
              style={styles.outputArea}
            >
              {preview.skipped > 0 ? <Text style={styles.hint}>… ({preview.skipped} earlier lines, tap to expand)</Text> : null}
              <Text selectable style={styles.output}>{preview.text}</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
