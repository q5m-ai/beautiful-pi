export function formatElapsed(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 1) return `${seconds}s`;

  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  if (hours < 1) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function formatDuration(milliseconds: number): string {
  return formatElapsed(Math.round(milliseconds / 1000) * 1000);
}

export function formatStepTiming(duration: string | null, completionTime: string, expanded: boolean) {
  const relativeTime = duration ?? "<1s";
  return {
    label: expanded ? completionTime : relativeTime,
    description: `${relativeTime}, at ${completionTime}`,
  };
}

export function formatDenseTime(timestamp: Date): string {
  const hours = timestamp.getHours().toString().padStart(2, "0");
  const minutes = timestamp.getMinutes().toString().padStart(2, "0");
  const seconds = timestamp.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
