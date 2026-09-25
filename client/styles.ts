// Preserve Paseo's context-sensitive leading space (for example after a turn
// header), and only trim the trailing side of each card. Negative vertical
// margins on both sides can erase gaps when adjacent rows are tightly grouped.
export const compactTimelineCardSpacing = {
  marginBottom: -4,
} as const;
