import { useEffect, useRef } from 'react';

export function useUserInteraction(throttleMs: number, callback: () => void) {
  const isThrottledRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleInteraction = () => {
      if (isThrottledRef.current) return;

      callbackRef.current();
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
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      isThrottledRef.current = false;
    };
  }, [throttleMs]);
}
