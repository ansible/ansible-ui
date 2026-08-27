export type DebouncedFunction<Args extends unknown[]> = ((...args: Args) => void) & {
  clear: () => void;
  flush: () => void;
};

/** Trailing-edge debounce. Matches the `debounce` package API used in this repo (including `.clear()`). */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number
): DebouncedFunction<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Args | undefined;

  const invoke = () => {
    timer = undefined;
    const args = lastArgs;
    lastArgs = undefined;
    if (args) {
      fn(...args);
    }
  };

  const debounced = ((...args: Args) => {
    lastArgs = args;
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(invoke, wait);
  }) as DebouncedFunction<Args>;

  debounced.clear = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = undefined;
    lastArgs = undefined;
  };

  debounced.flush = () => {
    if (timer === undefined) {
      return;
    }
    clearTimeout(timer);
    invoke();
  };

  return debounced;
}

/** Trailing-edge debounce for async functions. Latest call wins; callers share that promise. */
export function pDebounce<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  wait: number
): (...args: Args) => Promise<Result> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending:
    | {
        args: Args;
        promise: Promise<Result>;
        resolve: (value: Result) => void;
        reject: (reason: unknown) => void;
      }
    | undefined;

  return (...args: Args) => {
    if (!pending) {
      let resolve!: (value: Result) => void;
      let reject!: (reason: unknown) => void;
      const promise = new Promise<Result>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      pending = { args, promise, resolve, reject };
    } else {
      pending.args = args;
    }

    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      const current = pending;
      pending = undefined;
      if (!current) {
        return;
      }
      void fn(...current.args).then(current.resolve, current.reject);
    }, wait);

    return pending.promise;
  };
}
