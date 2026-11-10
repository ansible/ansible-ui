import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useOverridableState } from './useOverridableState';

describe('useOverridableState', () => {
  it('uses internal state when no setter is provided', () => {
    const { result } = renderHook(() => useOverridableState<string>('a'));
    expect(result.current[0]).toBe('a');

    act(() => {
      result.current[1]('b');
    });
    expect(result.current[0]).toBe('b');
  });

  it('delegates to a parent setter when provided', () => {
    const setValue = vi.fn();
    const { result } = renderHook(() => useOverridableState<string>('on', setValue));

    act(() => {
      result.current[1]('off');
    });

    expect(setValue).toHaveBeenCalledWith('off');
    expect(result.current[0]).toBe('on');
  });

  it('syncs when the controlled value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useOverridableState(value),
      { initialProps: { value: 'one' } }
    );

    rerender({ value: 'two' });
    expect(result.current[0]).toBe('two');
  });
});
