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
  });
});
