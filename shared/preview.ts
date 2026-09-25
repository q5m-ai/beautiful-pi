export function cleanThinkingText(text: string): string {
  return text.replace(/\*\*/g, "").trim();
}

export function currentActivity(text: string): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.at(-1) ?? "Thinking…";
}

export function oneLinePreview(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function outputPreview(output: string | null, expanded: boolean, maxLines = 5) {
  const lines = (output ?? "").replace(/\r\n?/g, "\n").trimEnd().split("\n");
  if (lines.length === 1 && !lines[0]) return { text: "", skipped: 0 };
  const skipped = expanded ? 0 : Math.max(0, lines.length - maxLines);
  return { text: lines.slice(skipped).join("\n"), skipped };
}
