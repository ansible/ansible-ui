import { afterEach, describe, expect, test, vi } from 'vitest';
import { debounce } from './debounce';

afterEach(() => {
  vi.useRealTimers();
});

describe('debounce', () => {
  test('calls the callback once with the latest arguments', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced('first');
    debounced('last');
    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('last');
  });

  test('cancels the pending callback', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced();
    debounced.clear();
    vi.advanceTimersByTime(200);

    expect(callback).not.toHaveBeenCalled();
  });
});
