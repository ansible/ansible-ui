import { afterEach, describe, expect, it, vi } from 'vitest';
import { debounce, pDebounce } from './debounce';

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay invoking the function until wait has elapsed', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('a');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('should invoke only with the latest arguments', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('a');
    debounced('b');
    debounced('c');
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('should cancel a pending call on clear', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('a');
    debounced.clear();
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();
  });

  it('should invoke immediately on flush', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('a');
    debounced.flush();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });
});

describe('pDebounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve with the latest call after wait', async () => {
    vi.useFakeTimers();
    const fn = vi.fn((value: number) => Promise.resolve(value * 2));
    const debounced = pDebounce(fn, 200);

    const first = debounced(1);
    const second = debounced(2);
    expect(first).toBe(second);

    vi.advanceTimersByTime(200);
    await expect(second).resolves.toBe(4);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);
  });
});
