import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useUserInteraction } from './useUserInteraction';

describe('useUserInteraction', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('should invoke callback on pointer movement and throttle subsequent events', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    renderHook(() => useUserInteraction(500, callback));

    document.dispatchEvent(new Event('pointermove'));
    document.dispatchEvent(new Event('pointermove'));

    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    document.dispatchEvent(new Event('pointermove'));

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
