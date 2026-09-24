import type { PluginTheme } from "@getpaseo/plugin";
import { useMemo, type ReactNode } from "react";
import { Linking, ScrollView, Text, View, type TextStyle, type ViewStyle } from "react-native";

export type InlineNode =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong" | "emphasis" | "strike"; children: InlineNode[] }
  | { type: "link"; href: string; children: InlineNode[] };

export type MarkdownBlock =
  | { type: "paragraph" | "quote"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "list"; ordered: boolean; start: number; items: string[] }
  | { type: "code"; language?: string; text: string }
  | { type: "rule" };

const FENCE = /^\s*(`{3,}|~{3,})\s*([^\s`]*)?.*$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const LIST_ITEM = /^\s{0,3}([-+*]|(\d+)[.)])\s+(.+)$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const RULE = /^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/;

/** A deliberately small CommonMark-style block parser suited to short reasoning updates. */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const marker = fence[1] ?? "```";
      const language = fence[2] || undefined;
      const content: string[] = [];
      index += 1;
      while (index < lines.length) {
        const candidate = lines[index] ?? "";
        const closing = candidate.match(/^\s*(`{3,}|~{3,})\s*$/)?.[1];
        if (closing?.[0] === marker[0] && closing.length >= marker.length) {
          index += 1;
          break;
        }
        content.push(candidate);
        index += 1;
      }
      blocks.push({ type: "code", language, text: content.join("\n") });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1]?.length ?? 1, text: heading[2] ?? "" });
      index += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    const list = line.match(LIST_ITEM);
    if (list) {
      const ordered = Boolean(list[2]);
      const start = list[2] ? Number(list[2]) : 1;
      const items: string[] = [];
      while (index < lines.length) {
        const item = (lines[index] ?? "").match(LIST_ITEM);
        if (!item || Boolean(item[2]) !== ordered) break;
        items.push(item[3] ?? "");
        index += 1;
      }
      blocks.push({ type: "list", ordered, start, items });
      continue;
    }

    const quote = line.match(QUOTE);
    if (quote) {
      const content: string[] = [];
      while (index < lines.length) {
        const quoted = (lines[index] ?? "").match(QUOTE);
        if (!quoted) break;
        content.push(quoted[1] ?? "");
        index += 1;
      }
      blocks.push({ type: "quote", text: content.join("\n") });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const candidate = lines[index] ?? "";
      if (!candidate.trim()) break;
      if (paragraph.length > 0 && (FENCE.test(candidate) || HEADING.test(candidate) || RULE.test(candidate) || LIST_ITEM.test(candidate) || QUOTE.test(candidate))) break;
      paragraph.push(candidate.trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join("\n") });
  }

  return blocks;
}

function findClosing(source: string, marker: string, from: number): number {
  let at = source.indexOf(marker, from);
  while (at >= 0) {
    let slashes = 0;
    for (let i = at - 1; i >= 0 && source[i] === "\\"; i -= 1) slashes += 1;
    if (slashes % 2 === 0) return at;
    at = source.indexOf(marker, at + marker.length);
  }
  return -1;
}

/** Parse the inline markdown used by paragraphs, headings, quotes, and list rows. */
export function parseInline(source: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let plain = "";
  let index = 0;
  const flush = () => {
    if (plain) nodes.push({ type: "text", value: plain });
    plain = "";
  };

  while (index < source.length) {
    if (source[index] === "\\" && index + 1 < source.length && /[\\`*_[\]~]/.test(source[index + 1] ?? "")) {
      plain += source[index + 1];
      index += 2;
      continue;
    }

    if (source[index] === "`") {
      const run = source.slice(index).match(/^`+/)?.[0] ?? "`";
      const end = findClosing(source, run, index + run.length);
      if (end >= 0) {
        flush();
        nodes.push({ type: "code", value: source.slice(index + run.length, end).replace(/^ | $/g, "") });
        index = end + run.length;
        continue;
      }
    }

    const imageOrLink = source.slice(index).match(/^(!?)\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/i);
    if (imageOrLink) {
      flush();
      const label = imageOrLink[1] ? `Image: ${imageOrLink[2]}` : imageOrLink[2] ?? "";
      nodes.push({ type: "link", href: imageOrLink[3] ?? "", children: parseInline(label) });
      index += imageOrLink[0].length;
      continue;
    }

    const markers: ReadonlyArray<[string, "strong" | "emphasis" | "strike"]> = [
      ["**", "strong"], ["__", "strong"], ["~~", "strike"], ["*", "emphasis"], ["_", "emphasis"],
    ];
    let matched = false;
    for (const [marker, type] of markers) {
      if (!source.startsWith(marker, index)) continue;
      const end = findClosing(source, marker, index + marker.length);
      if (end <= index + marker.length) continue;
      flush();
      nodes.push({ type, children: parseInline(source.slice(index + marker.length, end)) });
      index = end + marker.length;
      matched = true;
      break;
    }
    if (matched) continue;

    plain += source[index];
    index += 1;
  }
  flush();
  return nodes;
}

type Styles = {
  root: ViewStyle;
  paragraph: TextStyle;
  heading: TextStyle;
  quote: ViewStyle;
  quoteText: TextStyle;
  listRow: ViewStyle;
  marker: TextStyle;
  code: ViewStyle;
  codeLabel: TextStyle;
  codeText: TextStyle;
  inlineCode: TextStyle;
  link: TextStyle;
  rule: ViewStyle;
};

function InlineMarkdown({ source, styles }: { source: string; styles: Styles }) {
  const nodes = useMemo(() => parseInline(source), [source]);
  const render = (node: InlineNode, key: string): ReactNode => {
    switch (node.type) {
      case "text": return node.value;
      case "code": return <Text key={key} style={styles.inlineCode}>{node.value}</Text>;
      case "strong": return <Text key={key} style={{ fontWeight: "700" }}>{node.children.map((child, i) => render(child, `${key}-${i}`))}</Text>;
      case "emphasis": return <Text key={key} style={{ fontStyle: "italic" }}>{node.children.map((child, i) => render(child, `${key}-${i}`))}</Text>;
      case "strike": return <Text key={key} style={{ textDecorationLine: "line-through" }}>{node.children.map((child, i) => render(child, `${key}-${i}`))}</Text>;
      case "link": return <Text key={key} accessibilityRole="link" style={styles.link} onPress={() => void Linking.openURL(node.href)}>{node.children.map((child, i) => render(child, `${key}-${i}`))}</Text>;
    }
  };
  return <>{nodes.map((node, index) => render(node, String(index)))}</>;
}

export function Markdown({ source, theme, compact }: { source: string; theme: PluginTheme; compact: boolean }) {
  const styles = useMemo<Styles>(() => ({
    root: { gap: compact ? 6 : 8 },
    paragraph: { color: theme.colors.foregroundMuted, fontSize: 14, lineHeight: 21 },
    heading: { color: theme.colors.foreground, fontWeight: "700", lineHeight: 22 },
    quote: { borderLeftColor: theme.colors.border, borderLeftWidth: 3, paddingLeft: 10 },
    quoteText: { color: theme.colors.foregroundMuted, fontStyle: "italic", fontSize: 14, lineHeight: 21 },
    listRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    marker: { color: theme.colors.foregroundMuted, width: 22, textAlign: "right", fontSize: 14, lineHeight: 21 },
    code: { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 8, padding: 10 },
    codeLabel: { color: theme.colors.foregroundMuted, fontSize: 11, marginBottom: 6 },
    codeText: { color: theme.colors.foreground, fontFamily: "monospace", fontSize: 13, lineHeight: 19 },
    inlineCode: { color: theme.colors.foreground, backgroundColor: theme.colors.surface1, fontFamily: "monospace", fontSize: 13 },
    link: { color: theme.colors.accent, textDecorationLine: "underline" },
    rule: { height: 1, backgroundColor: theme.colors.border, marginVertical: 4 },
  }), [compact, theme]);
  const blocks = useMemo(() => parseMarkdown(source), [source]);

  return (
    <View style={styles.root}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "rule") return <View key={key} style={styles.rule} />;
        if (block.type === "code") return (
          <ScrollView key={key} horizontal style={styles.code} showsHorizontalScrollIndicator={false}>
            <View>
              {block.language ? <Text style={styles.codeLabel}>{block.language}</Text> : null}
              <Text selectable style={styles.codeText}>{block.text}</Text>
            </View>
          </ScrollView>
        );
        if (block.type === "list") return (
          <View key={key}>
            {block.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.listRow}>
                <Text style={styles.marker}>{block.ordered ? `${block.start + itemIndex}.` : "•"}</Text>
                <Text selectable style={[styles.paragraph, { flex: 1 }]}><InlineMarkdown source={item} styles={styles} /></Text>
              </View>
            ))}
          </View>
        );
        if (block.type === "quote") return <View key={key} style={styles.quote}><Text selectable style={styles.quoteText}><InlineMarkdown source={block.text} styles={styles} /></Text></View>;
        const headingSize = block.type === "heading" ? Math.max(15, 21 - block.level) : undefined;
        return <Text key={key} selectable style={block.type === "heading" ? [styles.heading, { fontSize: headingSize }] : styles.paragraph}><InlineMarkdown source={block.text} styles={styles} /></Text>;
      })}
    </View>
  );
}
