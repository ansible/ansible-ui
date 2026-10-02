import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useBreakpoint, useWindowSize } from './useBreakPoint';

describe('useBreakPoint', () => {
  const originalWidth = window.innerWidth;

  afterEach(() => {
    window.innerWidth = originalWidth;
  });

  it('derives the window size from the configured breakpoints', () => {
    window.innerWidth = 600;
    const { result } = renderHook(() => useWindowSize());

    expect(result.current).toBe('sm');

    act(() => {
      window.innerWidth = 1000;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe('lg');
  });

  it('reports whether the current window meets a breakpoint', () => {
    window.innerWidth = 600;
    const { result } = renderHook(() => useBreakpoint('md'));

    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 800;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });
});
