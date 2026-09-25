import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

function formatElapsed(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 1) return `${seconds}s`;

  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  if (hours < 1) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function useElapsedLabel(timestamp: Date, running: boolean): string | null {
  const startedAt = timestamp.getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, [running, startedAt]);

  return running ? formatElapsed(now - startedAt) : null;
}

export function usePulseOpacity(running: boolean): Animated.Value {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!running) {
      opacity.stopAnimation();
      opacity.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: false }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, running]);

  return opacity;
}
