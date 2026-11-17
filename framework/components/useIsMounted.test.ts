import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useIsMounted, useIsMountedRef } from './useIsMounted';

describe('useIsMounted', () => {
  it('reports mounted while the hook is active', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current).toBe(true);
  });
});

describe('useIsMountedRef', () => {
  it('tracks mounted state in a ref', () => {
    const { result, unmount } = renderHook(() => useIsMountedRef());
    expect(result.current.current.isMounted).toBe(true);
    unmount();
    expect(result.current.current.isMounted).toBe(false);
  });
});
