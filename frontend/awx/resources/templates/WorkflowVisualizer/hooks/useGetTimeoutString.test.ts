import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGetTimeoutString } from './useGetTimeoutString';

describe('useGetTimeoutString', () => {
  it('should return 0 min 0 sec for value 0', () => {
    const { result } = renderHook(() => useGetTimeoutString(0));
    expect(result.current).toBe('0 min 0 sec ');
  });

  it('should convert seconds-only values correctly', () => {
    const { result } = renderHook(() => useGetTimeoutString(45));
    expect(result.current).toBe('0 min 45 sec ');
  });

  it('should convert minutes-only values correctly', () => {
    const { result } = renderHook(() => useGetTimeoutString(120));
    expect(result.current).toBe('2 min 0 sec ');
  });

  it('should convert mixed minutes and seconds correctly', () => {
    const { result } = renderHook(() => useGetTimeoutString(150));
    expect(result.current).toBe('2 min 30 sec ');
  });

  it('should handle falsy value (NaN coerced to 0)', () => {
    const { result } = renderHook(() => useGetTimeoutString(NaN));
    expect(result.current).toBe('0 min 0 sec ');
  });
});
