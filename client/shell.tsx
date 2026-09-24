import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { z } from "zod";
import { shellPreviewSchema } from "../shared/shell";

type ShellPreviewData = z.output<typeof shellPreviewSchema>;

const PREVIEW_LINES = 5;
const COMMAND_PREVIEW_LINES = 4;
const LONG_COMMAND_CHARACTERS = 180;

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
  return "Done";
}

export function ShellPreview({ item, theme, layout }: PluginTimelineItemProps<ShellPreviewData>) {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const [commandExpanded, setCommandExpanded] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const command = item.data.command.trim();
  const commandNeedsCollapse =
    command.length > LONG_COMMAND_CHARACTERS || command.split("\n").length > COMMAND_PREVIEW_LINES;
  const preview = outputPreview(item.data.output, outputExpanded);
  const canCollapse = item.data.status !== "running";
  const canToggleOutput = outputExpanded || preview.skipped > 0;
  const styles = useMemo(
    () => ({
      card: {
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
        disabled={!canCollapse}
        accessibilityRole={canCollapse ? "button" : undefined}
        accessibilityLabel={canCollapse ? (sectionExpanded ? "Collapse shell section" : "Expand shell section") : undefined}
        onPress={() => setSectionExpanded((value) => !value)}
        style={styles.header}
      >
        <Icon name="SquareTerminal" size={14} color={theme.colors.accent} />
        <Text style={styles.title}>Shell</Text>
        <Text style={styles.status}>{statusLabel(item.data)}</Text>
        {canCollapse ? (
          <Icon name={sectionExpanded ? "ChevronDown" : "ChevronRight"} size={14} color={theme.colors.foregroundMuted} />
        ) : null}
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
