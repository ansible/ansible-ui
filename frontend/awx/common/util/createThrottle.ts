/**
 * Creates a throttled version of a function using leading + trailing edges.
 *
 * Leading edge:  Fires immediately so the UI reflects changes without delay.
 * Trailing edge: Schedules one final call after `ms`, ensuring the last burst
 *                of WebSocket events is captured even if they arrive within
 *                the throttle window.
 *
 * Rapid calls within the window are coalesced into the single trailing call,
 * preventing request pileup from high-frequency WebSocket messages.
 */
export function createThrottle(fn: () => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;

  const throttled = () => {
    const now = Date.now();

    if (now - lastCallTime >= ms) {
      lastCallTime = now;
      fn();
    } else {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        lastCallTime = Date.now();
        timer = null;
        fn();
      }, ms);
    }
  };

  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return throttled;
}
