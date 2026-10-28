import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useSerializedSave } from './useSerializedSave';

interface IDeferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

function deferred<T>(): IDeferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function resolveCall(call: IDeferred<string>, value: string) {
  await act(async () => {
    call.resolve(value);
    await call.promise;
  });
}

async function rejectCall(call: IDeferred<string>, error: unknown) {
  await act(async () => {
    call.reject(error);
    await call.promise.catch(() => undefined);
  });
}

/** Renders the hook with a save mock whose calls resolve only when the test says so. */
function setup() {
  const pending: IDeferred<string>[] = [];
  const save = vi.fn((_value: string) => {
    const call = deferred<string>();
    pending.push(call);
    return call.promise;
  });
  const onSuccess = vi.fn();
  const onError = vi.fn();
  const { result } = renderHook(() => useSerializedSave({ save, onSuccess, onError }));
  const { enqueue, waitForIdle } = result.current;
  return { enqueue, waitForIdle, save, onSuccess, onError, pending };
}

describe('useSerializedSave', () => {
  test('should save a single value and report success', async () => {
    const { enqueue, save, onSuccess, onError, pending } = setup();

    act(() => enqueue(1, 'a'));
    expect(save).toHaveBeenCalledWith('a');

    await resolveCall(pending[0], 'saved-a');

    expect(onSuccess).toHaveBeenCalledWith('saved-a', 'a');
    expect(onError).not.toHaveBeenCalled();
  });

  test('should keep only one save in flight and coalesce queued values to the latest', async () => {
    const { enqueue, save, onSuccess, pending } = setup();

    act(() => {
      enqueue(1, 'a');
      enqueue(1, 'b');
      enqueue(1, 'c');
    });
    expect(save).toHaveBeenCalledTimes(1);

    await resolveCall(pending[0], 'saved-a');
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save).toHaveBeenLastCalledWith('c');

    await resolveCall(pending[1], 'saved-c');

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith('saved-c', 'c');
  });

  test('should not report an older failure when a newer value is queued', async () => {
    const { enqueue, onSuccess, onError, pending } = setup();

    act(() => {
      enqueue(1, 'a');
      enqueue(1, 'b');
    });
    await rejectCall(pending[0], new Error('old failure'));
    await waitFor(() => expect(pending).toHaveLength(2));
    await resolveCall(pending[1], 'saved-b');

    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith('saved-b', 'b');
  });

  test('should report an error for the latest value', async () => {
    const { enqueue, onSuccess, onError, pending } = setup();
    const error = new Error('failure');

    act(() => enqueue(1, 'a'));
    await rejectCall(pending[0], error);

    expect(onError).toHaveBeenCalledWith(error, 'a');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('should save different keys independently', () => {
    const { enqueue, save } = setup();

    act(() => {
      enqueue(1, 'a');
      enqueue(2, 'b');
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(1, 'a');
    expect(save).toHaveBeenNthCalledWith(2, 'b');
  });

  test('should start a new save immediately after the previous one settled', async () => {
    const { enqueue, save, onSuccess, pending } = setup();

    act(() => enqueue(1, 'a'));
    await resolveCall(pending[0], 'saved-a');
    act(() => enqueue(1, 'b'));

    expect(save).toHaveBeenCalledTimes(2);
    await resolveCall(pending[1], 'saved-b');
    expect(onSuccess).toHaveBeenCalledTimes(2);
  });

  test('should resolve waitForIdle at once when nothing is queued', async () => {
    const { waitForIdle } = setup();

    await expect(waitForIdle()).resolves.toBeUndefined();
  });

  test('should resolve waitForIdle only after the queued value of every key was saved', async () => {
    const { enqueue, waitForIdle, save, pending } = setup();
    act(() => {
      enqueue(1, 'a');
      enqueue(1, 'a2');
      enqueue(2, 'b');
    });
    let idle = false;
    const waiting = waitForIdle().then(() => {
      idle = true;
    });

    await resolveCall(pending[0], 'saved-a');
    expect(save).toHaveBeenLastCalledWith('a2');
    await resolveCall(pending[1], 'saved-b');
    expect(idle).toBe(false);

    await resolveCall(pending[2], 'saved-a2');
    await waiting;
    expect(idle).toBe(true);
  });

  test('should resolve waitForIdle and accept new values when onError throws', async () => {
    const { enqueue, waitForIdle, save, onError, pending } = setup();
    onError.mockImplementationOnce(() => {
      throw new Error('adapter failed');
    });
    act(() => enqueue(1, 'a'));
    const waiting = waitForIdle();

    await rejectCall(pending[0], new Error('boom'));

    await expect(waiting).resolves.toBeUndefined();
    act(() => enqueue(1, 'b'));
    expect(save).toHaveBeenLastCalledWith('b');
  });

  test('should resolve waitForIdle after a failed save', async () => {
    const { enqueue, waitForIdle, pending } = setup();
    act(() => enqueue(1, 'a'));
    const waiting = waitForIdle();

    await rejectCall(pending[0], new Error('boom'));

    await expect(waiting).resolves.toBeUndefined();
  });
});
