import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { z } from "zod";
import { shellPreviewSchema } from "../shared/shell";

type ShellPreviewData = z.output<typeof shellPreviewSchema>;

const PREVIEW_LINES = 5;

function outputPreview(output: string | null, expanded: boolean) {
  const lines = (output ?? "").replace(/\r\n?/g, "\n").trimEnd().split("\n");
  if (lines.length === 1 && !lines[0]) return { text: "", skipped: 0 };
  const skipped = expanded ? 0 : Math.max(0, lines.length - PREVIEW_LINES);
  return { text: lines.slice(skipped).join("\n"), skipped };
}

function statusLabel(data: ShellPreviewData): string {
  if (data.status === "running") return "Running…";
  if (data.status === "failed") return "Failed";
  if (data.status === "canceled") return "Canceled";
  return data.exitCode == null ? "Done" : `Exit ${data.exitCode}`;
}

export function ShellPreview({ item, theme, layout }: PluginTimelineItemProps<ShellPreviewData>) {
  const [expanded, setExpanded] = useState(false);
  const preview = outputPreview(item.data.output, expanded);
  const canToggle = expanded || preview.skipped > 0;
  const styles = useMemo(
    () => ({
      card: {
        overflow: "hidden" as const,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        backgroundColor: theme.colors.surface1,
      },
      header: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 6,
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingTop: 8,
        paddingBottom: 6,
      },
      title: {
        color: theme.colors.foregroundMuted,
        fontSize: 12,
        fontWeight: "600" as const,
      },
      status: {
        color: item.data.status === "failed" ? theme.colors.statusDanger : theme.colors.foregroundMuted,
        fontSize: 11,
        marginLeft: "auto" as const,
      },
      command: {
        color: theme.colors.foreground,
        fontFamily: "monospace",
        fontSize: 13,
        lineHeight: 19,
        paddingHorizontal: layout.compact ? 9 : 11,
        paddingBottom: preview.text ? 8 : 10,
        flexShrink: 1,
      },
      prompt: { color: theme.colors.accent, fontWeight: "700" as const },
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
      <View style={styles.header}>
        <Icon name="SquareTerminal" size={14} color={theme.colors.foregroundMuted} />
        <Text style={styles.title}>Shell</Text>
        <Text style={styles.status}>{statusLabel(item.data)}</Text>
      </View>
      <Text selectable style={styles.command}>
        <Text style={styles.prompt}>$ </Text>
        {item.data.command.trim()}
      </Text>
      {preview.text ? (
        <Pressable
          disabled={!canToggle}
          accessibilityRole={canToggle ? "button" : undefined}
          accessibilityLabel={canToggle ? (expanded ? "Collapse shell output" : "Expand shell output") : undefined}
          onPress={() => setExpanded((value) => !value)}
          style={styles.outputArea}
        >
          {preview.skipped > 0 ? <Text style={styles.hint}>… ({preview.skipped} earlier lines, tap to expand)</Text> : null}
          <Text selectable style={styles.output}>{preview.text}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
