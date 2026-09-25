import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { useMemo, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import type { z } from "zod";
import { editPreviewSchema } from "../shared/edit";
import { useElapsedLabel, usePulseOpacity } from "./running-step";

type EditPreviewData = z.output<typeof editPreviewSchema>;

function editBody(data: EditPreviewData): string {
  if (data.unifiedDiff?.trim()) return data.unifiedDiff.trimEnd();

  const removed = data.oldString?.split(/\r?\n/).map((line) => `- ${line}`) ?? [];
  const added = data.newString?.split(/\r?\n/).map((line) => `+ ${line}`) ?? [];
  return [...removed, ...added].join("\n") || "No inline diff available.";
}

export function EditPreview({ item, timestamp, theme, layout }: PluginTimelineItemProps<EditPreviewData>) {
  const [expanded, setExpanded] = useState(false);
  const running = item.data.status === "running";
  const elapsed = useElapsedLabel(timestamp, running);
  const pulseOpacity = usePulseOpacity(running);
  const diff = editBody(item.data);
  const styles = useMemo(
    () => ({
      card: {
        overflow: "hidden" as const,
        marginVertical: -4,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.statusWarning,
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
        marginLeft: "auto" as const,
      },
      status: {
        color: theme.colors.foregroundMuted,
        fontSize: 11,
      },
      body: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingVertical: 8,
        backgroundColor: theme.colors.surface2,
      },
      path: {
        color: theme.colors.foreground,
        fontFamily: "monospace",
        fontSize: 12,
        marginBottom: 7,
      },
      diff: {
        color: theme.colors.foregroundMuted,
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 18,
      },
      diffLine: { fontFamily: "monospace" },
      added: { color: theme.colors.statusSuccess },
      removed: { color: theme.colors.statusDanger },
    }),
    [layout.compact, theme],
  );

  return (
    <View style={styles.card} accessibilityLabel="File edit">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse file edit" : "Expand file edit"}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <Icon name="Pencil" size={14} color={theme.colors.statusWarning} />
        <Animated.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[expanded ? styles.title : styles.collapsedTitle, { opacity: pulseOpacity }]}
        >
          {expanded ? "Edit" : `Edit ${item.data.filePath}`}
        </Animated.Text>
        <View style={styles.statusArea}>
          {item.data.status === "completed" ? (
            <Icon name="CircleCheck" size={13} color={theme.colors.statusSuccess} />
          ) : item.data.status === "failed" ? (
            <Icon name="CircleX" size={13} color={theme.colors.statusDanger} />
          ) : item.data.status === "canceled" ? (
            <Text style={styles.status}>Canceled</Text>
          ) : (
            <Text style={styles.status}>{elapsed}</Text>
          )}
        </View>
        <Icon name={expanded ? "ChevronDown" : "ChevronRight"} size={14} color={theme.colors.foregroundMuted} />
      </Pressable>
      {expanded ? (
        <View style={styles.body}>
          <Text selectable style={styles.path}>{item.data.filePath}</Text>
          <Text selectable style={styles.diff}>
            {diff.split("\n").map((line, index) => (
              <Text
                key={`${index}-${line}`}
                style={[
                  styles.diffLine,
                  line.startsWith("+") && !line.startsWith("+++")
                    ? styles.added
                    : line.startsWith("-") && !line.startsWith("---")
                      ? styles.removed
                      : undefined,
                ]}
              >
                {index > 0 ? "\n" : ""}{line}
              </Text>
            ))}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
