import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { formatDuration, formatElapsed } from "../shared/time";

const startedAtByKey = new Map<string, number>();

interface StepTiming {
  elapsed: string | null;
  duration: string | null;
  completedAt: Date;
}

export function useStepTiming(key: string, timestamp: Date, running: boolean): StepTiming {
  const timestampMs = timestamp.getTime();
  const [now, setNow] = useState(() => Date.now());
  const [completion, setCompletion] = useState<{ duration: string; completedAt: Date } | null>(null);
  const startedAt = useRef<number | null>(running ? timestampMs : null);
  const wasRunning = useRef(running);

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, [running, timestampMs]);

  useEffect(() => {
    if (running) {
      const cachedStart = startedAtByKey.get(key);
      if (cachedStart === undefined) startedAtByKey.set(key, timestampMs);
      if (!wasRunning.current) startedAt.current = cachedStart ?? timestampMs;
      wasRunning.current = true;
      return;
    }

    const liveStart = startedAt.current ?? startedAtByKey.get(key);
    if (liveStart !== undefined && liveStart !== null) {
      const observedAt = Date.now();
      const completedAtMs = timestampMs > liveStart ? timestampMs : observedAt;
      setCompletion({
        duration: formatDuration(completedAtMs - liveStart),
        completedAt: new Date(completedAtMs),
      });
      startedAtByKey.delete(key);
    }
    wasRunning.current = false;
  }, [key, running, timestampMs]);

  return {
    elapsed: running ? formatElapsed(now - timestampMs) : null,
    duration: completion?.duration ?? null,
    completedAt: completion?.completedAt ?? timestamp,
  };
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
