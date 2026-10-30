import { useState, useRef, useCallback } from 'react';

export function useCountdown() {
  const [count, setCount] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCountdown = useCallback((
    from: number,
    onTick?: (n: number) => void,
    onComplete?: () => void,
  ) => {
    setIsRunning(true);
    let current = from;
    setCount(current);
    onTick?.(current);

    const tick = () => {
      current -= 1;
      if (current > 0) {
        setCount(current);
        onTick?.(current);
        timeoutRef.current = setTimeout(tick, 1000);
      } else if (current === 0) {
        setCount(0);
        onTick?.(0);
        timeoutRef.current = setTimeout(() => {
          setCount(null);
          setIsRunning(false);
          onComplete?.();
        }, 800);
      }
    };

    timeoutRef.current = setTimeout(tick, 1000);
  }, []);

  const cancelCountdown = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCount(null);
    setIsRunning(false);
  }, []);

  return { count, isRunning, startCountdown, cancelCountdown };
}
