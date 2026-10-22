import { useCallback, useEffect, useRef } from 'react';

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
}

/**
 * Serializes saves per key so rapid, consecutive edits cannot overtake each other.
 *
 * - At most one save is in flight per key; the next one starts after it settles.
 * - Values queued while a save is in flight are coalesced — only the latest one is sent.
 * - `onSuccess` / `onError` run only for the latest value, so a slow response for an
 *   older value never overwrites newer local state.
 */
export function useSerializedSave<T, R>(options: ISerializedSaveOptions<T, R>) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const queuesRef = useRef(new Map<SaveKey, ISaveQueue<T>>());

  return useCallback((key: SaveKey, value: T) => {
    const running = queuesRef.current.get(key);
    if (running) {
      running.next = { value };
      return;
    }
    const queue: ISaveQueue<T> = { next: { value } };
    queuesRef.current.set(key, queue);
    void drainQueue(
      queue,
      () => optionsRef.current,
      () => queuesRef.current.delete(key)
    );
  }, []);
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
