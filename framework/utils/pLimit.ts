/** Run at most `concurrency` async tasks at a time. */
export function pLimit(concurrency: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  const dequeue = () => {
    if (active >= concurrency) {
      return;
    }
    const next = queue.shift();
    if (!next) {
      return;
    }
    active += 1;
    next();
  };

  return function limit<Result>(fn: () => Promise<Result>): Promise<Result> {
    return new Promise<Result>((resolve, reject) => {
      queue.push(() => {
        fn()
          .then(resolve, reject)
          .finally(() => {
            active -= 1;
            dequeue();
          });
      });
      dequeue();
    });
  };
}
