import { useLayoutEffect, useRef } from 'react';

type ResizeTarget = React.RefObject<Element | null | undefined> | Element | null | undefined;

/**
 * Observe an element's size changes (replacement for `@react-hook/resize-observer`).
 */
export function useResizeObserver(
  target: ResizeTarget,
  callback: (entry: ResizeObserverEntry) => void,
  options?: ResizeObserverOptions
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    const element =
      target && typeof target === 'object' && 'current' in target ? target.current : target;
    if (!element || !(element instanceof Element)) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        callbackRef.current(entry);
      }
    });

    observer.observe(element, options);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, options?.box]);
}
