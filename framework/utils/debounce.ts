export type DebouncedFunction<Args extends unknown[]> = {
  (...args: Args): void;
  clear: () => void;
};

export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => unknown,
  wait: number
): DebouncedFunction<Args> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      void callback(...args);
    }, wait);
  };

  debounced.clear = () => {
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
  };

  return debounced;
}
