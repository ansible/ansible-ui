import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '../views/jobs/WorkflowOutput/hooks/useWorkflowOutput';

interface ThrottleOptions {
  limit: number;
  value: WebSocketMessage | undefined;
}

export function useWSThrottle({ value, limit }: ThrottleOptions): WebSocketMessage | undefined {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  const initialValue = useRef(value);

  useEffect(() => {
    if (throttledValue === undefined && value !== undefined) {
      setThrottledValue(value);
      // Restart the throttle timer
      lastRan.current = Date.now();
      return;
    }

    if (value === initialValue.current) {
      setThrottledValue(value);
      return () => {};
    }

    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          lastRan.current = Date.now();
          setThrottledValue(value);
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, limit]);

  if (throttledValue === undefined) {
    return;
  }
  return throttledValue;
}
