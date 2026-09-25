import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { formatElapsed } from "../shared/time";

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
