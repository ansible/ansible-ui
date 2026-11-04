import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWSThrottle } from './useWSThrottle';

describe('useWSThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value when defined', () => {
    const message = { type: 'test', payload: 1 };
    const { result } = renderHook(() => useWSThrottle({ value: message, limit: 1000 }));
    expect(result.current).toEqual(message);
  });

  it('updates throttled value after limit elapses', () => {
    const first = { type: 'a', payload: 1 };
    const second = { type: 'b', payload: 2 };
    const { result, rerender } = renderHook(({ value }) => useWSThrottle({ value, limit: 500 }), {
      initialProps: { value: first },
    });
    expect(result.current).toEqual(first);
    rerender({ value: second });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toEqual(second);
  });

  it('returns undefined when throttled value is undefined', () => {
    const { result } = renderHook(() => useWSThrottle({ value: undefined, limit: 500 }));
    expect(result.current).toBeUndefined();
  });
});
