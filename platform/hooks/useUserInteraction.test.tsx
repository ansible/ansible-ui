<<<<<<< HEAD
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
=======
import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useUserInteraction } from './useUserInteraction';

describe('useUserInteraction', () => {
  it('clears the throttle timer when unmounted', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUserInteraction(1000, callback));

    fireEvent.pointerMove(document);
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
>>>>>>> 54df214c5 (test: cover React Doctor cleanup fixes)
  });
});
