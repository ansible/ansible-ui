import { useCallback, useEffect, useMemo, useRef } from 'react';

type SaveKey = string | number;

interface ISerializedSaveOptions<T, R> {
  /** Persists the value; called at most once at a time per key. */
  save: (value: T) => Promise<R>;
  /** Called only for the latest value of a key, after it was saved. */
  onSuccess: (result: R, value: T) => void | Promise<void>;
  /** Called only for the latest value of a key, when saving it failed. */
  onError: (error: unknown, value: T) => void;
}

interface ISaveQueue<T> {
  next?: { value: T };
  /** Settles once this queue has saved its last value and was removed. */
  drained?: Promise<void>;
}

/**
 * Serializes saves per key so rapid, consecutive edits cannot overtake each other.
 *
 * - At most one save is in flight per key; the next one starts after it settles.
 * - Values queued while a save is in flight are coalesced — only the latest one is sent.
 * - `onSuccess` / `onError` run only for the latest value, so a slow response for an
 *   older value never overwrites newer local state.
 * - `waitForIdle` resolves once no save is in flight or queued for any key.
 */
export function useSerializedSave<T, R>(options: ISerializedSaveOptions<T, R>) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const queuesRef = useRef(new Map<SaveKey, ISaveQueue<T>>());

  const enqueue = useCallback((key: SaveKey, value: T) => {
    const running = queuesRef.current.get(key);
    if (running) {
      running.next = { value };
      return;
    }
    const queue: ISaveQueue<T> = { next: { value } };
    queuesRef.current.set(key, queue);
    const removeQueue = () => {
      if (queuesRef.current.get(key) === queue) queuesRef.current.delete(key);
    };
    // Also remove the queue if draining throws (e.g. in onError), so waitForIdle cannot spin;
    // the error is rethrown so it still surfaces instead of being swallowed.
    queue.drained = drainQueue(queue, () => optionsRef.current, removeQueue).catch(
      (error: unknown) => {
        removeQueue();
        throw error;
      }
    );
  }, []);

  const waitForIdle = useCallback(() => waitForQueues(queuesRef.current), []);

  return useMemo(() => ({ enqueue, waitForIdle }), [enqueue, waitForIdle]);
}

/**
 * Waits for every queue to drain, then recurses, since a key can be enqueued again
 * while waiting; resolves only once no queue is left.
 */
async function waitForQueues<T>(queues: Map<SaveKey, ISaveQueue<T>>): Promise<void> {
  if (queues.size === 0) return;
  await Promise.allSettled([...queues.values()].map((queue) => queue.drained ?? Promise.resolve()));
  await waitForQueues(queues);
}

/**
 * Saves the queued value, then recurses while a newer value was queued meanwhile.
 * `onIdle` runs synchronously right after the queue is found empty, so a value
 * enqueued afterwards always starts a new drain instead of being lost.
 */
async function drainQueue<T, R>(
  queue: ISaveQueue<T>,
  getOptions: () => ISerializedSaveOptions<T, R>,
  onIdle: () => void
): Promise<void> {
  const next = queue.next;
  if (!next) {
    onIdle();
    return;
  }
  queue.next = undefined;

  let outcome: { ok: true; result: R } | { ok: false; error: unknown };
  try {
    outcome = { ok: true, result: await getOptions().save(next.value) };
  } catch (error) {
    outcome = { ok: false, error };
  }

  // When a newer value was queued meanwhile, its own save reports the final outcome.
  if (!queue.next) {
    if (outcome.ok) {
      void getOptions().onSuccess(outcome.result, next.value);
    } else {
      getOptions().onError(outcome.error, next.value);
    }
  }
  await drainQueue(queue, getOptions, onIdle);
}
