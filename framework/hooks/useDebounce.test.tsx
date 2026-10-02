import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useDebounce } from './useDebounce';

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounce', () => {
  test('uses the latest callback', () => {
    vi.useFakeTimers();
    const firstCallback = vi.fn<(value: string) => void>();
    const secondCallback = vi.fn<(value: string) => void>();
    const { result, rerender } = renderHook(({ callback }) => useDebounce(callback, 200), {
      initialProps: { callback: firstCallback },
    });

    void act(() => result.current('value'));
    rerender({ callback: secondCallback });
    void act(() => vi.advanceTimersByTime(200));

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledWith('value');
  });

  test('cancels a pending callback when unmounted', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebounce(callback, 200));

    void act(() => result.current());
    unmount();
    void act(() => vi.advanceTimersByTime(200));

    expect(callback).not.toHaveBeenCalled();
  });
});
