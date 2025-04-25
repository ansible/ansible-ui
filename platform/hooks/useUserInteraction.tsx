import { useEffect, useRef } from 'react';

export function useUserInteraction(throttleMs: number, callback: () => void) {
  const isThrottledRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInteraction = () => {
      if (isThrottledRef.current) return;

      callback();
      isThrottledRef.current = true;

      // Clear any existing timeout
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = setTimeout(() => {
        isThrottledRef.current = false;
        timeoutIdRef.current = null;
      }, throttleMs);
    };

    document.addEventListener('pointermove', handleInteraction);

    return () => {
      document.removeEventListener('pointermove', handleInteraction);
    };
  }, [throttleMs, callback]);
}
