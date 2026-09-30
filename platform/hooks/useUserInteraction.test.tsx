import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useUserInteraction } from './useUserInteraction';

function dispatchPointerMove() {
  document.dispatchEvent(new Event('pointermove', { bubbles: true }));
}

describe('useUserInteraction', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('should invoke callback on pointer movement and throttle subsequent events', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    renderHook(() => useUserInteraction(500, callback));

    dispatchPointerMove();
    dispatchPointerMove();

    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    dispatchPointerMove();

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('clears the throttle timer when unmounted', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUserInteraction(1000, callback));

    dispatchPointerMove();
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should call the latest callback after rerender', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ cb }) => useUserInteraction(0, cb), {
      initialProps: { cb: first },
    });

    rerender({ cb: second });
    dispatchPointerMove();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
