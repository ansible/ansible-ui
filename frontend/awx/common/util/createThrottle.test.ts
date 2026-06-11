import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createThrottle } from './createThrottle';

describe('createThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls fn immediately on the first invocation', () => {
    const fn = vi.fn();
    const throttled = createThrottle(fn, 5000);

    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('suppresses rapid calls within the throttle window', () => {
    const fn = vi.fn();
    const throttled = createThrottle(fn, 5000);

    throttled(); // leading call
    throttled();
    throttled();
    throttled();

    // Only the leading call should have fired synchronously
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('fires a trailing call after the throttle window', () => {
    const fn = vi.fn();
    const throttled = createThrottle(fn, 5000);

    throttled(); // leading
    throttled(); // schedules trailing

    vi.advanceTimersByTime(5000);

    // leading + trailing
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('resets and allows a new leading call after the window', () => {
    const fn = vi.fn();
    const throttled = createThrottle(fn, 5000);

    throttled(); // leading
    vi.advanceTimersByTime(5000); // no trailing since only one call

    expect(fn).toHaveBeenCalledTimes(1);

    throttled(); // new leading call
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not schedule a trailing call for a single invocation', () => {
    const fn = vi.fn();
    const throttled = createThrottle(fn, 5000);

    throttled(); // leading only

    vi.advanceTimersByTime(5000);

    // No trailing call — only the leading call fired
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancel() prevents the trailing call', () => {
    const fn = vi.fn();
    const throttled = createThrottle(fn, 5000);

    throttled(); // leading
    throttled(); // schedules trailing
    throttled.cancel();

    vi.advanceTimersByTime(5000);

    // Only the leading call, trailing was cancelled
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
