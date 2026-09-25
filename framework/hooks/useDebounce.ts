import { useEffect, useMemo, useRef } from 'react';
import { DebouncedFunction, debounce } from '../utils/debounce';

export function useDebounce<Args extends unknown[]>(
  callback: (...args: Args) => unknown,
  wait: number
): DebouncedFunction<Args> {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debounced = useMemo(
    () => debounce((...args: Args) => callbackRef.current(...args), wait),
    [wait]
  );

  useEffect(() => () => debounced.clear(), [debounced]);

  return debounced;
}
