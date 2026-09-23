export type LimitFunction = <T>(fn: () => PromiseLike<T> | T) => Promise<T>;

/**
 * Limit concurrent async work (same API as the `p-limit` package).
 */
export function pLimit(concurrency: number): LimitFunction {
  if (concurrency < 1) {
    throw new TypeError('Expected `concurrency` to be a number from 1 and up');
  }

  let activeCount = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()?.();
    }
  };

  const run = async <T>(
    fn: () => PromiseLike<T> | T,
    resolve: (v: T) => void,
    reject: (e: unknown) => void
  ) => {
    activeCount++;
    try {
      resolve(await fn());
    } catch (error) {
      reject(error);
    } finally {
      next();
    }
  };

  return <T>(fn: () => PromiseLike<T> | T) =>
    new Promise<T>((resolve, reject) => {
      const enqueue = () => {
        void run(fn, resolve, reject);
      };
      if (activeCount < concurrency) {
        enqueue();
      } else {
        queue.push(enqueue);
      }
    });
}
