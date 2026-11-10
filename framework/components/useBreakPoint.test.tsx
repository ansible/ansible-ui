import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useBreakpoint, useOrientation, useWindowSize } from './useBreakPoint';

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

  it('reports xs for narrow viewports', () => {
    window.innerWidth = 200;
    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toBe('xs');
  });

  it('reports xxl for very wide viewports', () => {
    window.innerWidth = 2000;
    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toBe('xxl');
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

  it('classifies intermediate window sizes on resize', () => {
    window.innerWidth = 900;
    const { result: size } = renderHook(() => useWindowSize());
    expect(size.current).toBe('md');

    act(() => {
      window.innerWidth = 1300;
      window.dispatchEvent(new Event('resize'));
    });
    expect(size.current).toBe('xl');
  });

  it('evaluates each useBreakpoint branch from initial window width', () => {
    window.innerWidth = 200;
    expect(renderHook(() => useBreakpoint('xs')).result.current).toBe(true);
    expect(renderHook(() => useBreakpoint('sm')).result.current).toBe(false);

    window.innerWidth = 600;
    expect(renderHook(() => useBreakpoint('sm')).result.current).toBe(true);
    expect(renderHook(() => useBreakpoint('md')).result.current).toBe(false);

    window.innerWidth = 800;
    expect(renderHook(() => useBreakpoint('md')).result.current).toBe(true);
    expect(renderHook(() => useBreakpoint('lg')).result.current).toBe(false);

    window.innerWidth = 1100;
    expect(renderHook(() => useBreakpoint('lg')).result.current).toBe(true);
    expect(renderHook(() => useBreakpoint('xl')).result.current).toBe(false);

    window.innerWidth = 1300;
    expect(renderHook(() => useBreakpoint('xl')).result.current).toBe(true);
    expect(renderHook(() => useBreakpoint('xxl')).result.current).toBe(false);

    window.innerWidth = 2000;
    expect(renderHook(() => useBreakpoint('xxl')).result.current).toBe(true);
  });

  it('tracks window orientation', () => {
    window.innerWidth = 1200;
    window.innerHeight = 800;
    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('landscape');

    act(() => {
      window.innerWidth = 400;
      window.innerHeight = 900;
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe('portrait');
  });
});
