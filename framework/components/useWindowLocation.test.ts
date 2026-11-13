import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useWindowLocation } from './useWindowLocation';

describe('useWindowLocation', () => {
  it('updates location on push, replace, and popstate', () => {
    const { result } = renderHook(() => useWindowLocation());

    expect(result.current.location).toBeDefined();

    act(() => {
      result.current.push('/next');
    });
    expect(window.location.pathname).toBe('/next');

    act(() => {
      result.current.update('/final');
    });
    expect(window.location.pathname).toBe('/final');

    act(() => {
      window.history.pushState(null, '', '/pop');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.location?.pathname).toBe('/pop');
  });

  it('removes popstate listener on unmount', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWindowLocation());
    unmount();
    expect(removeListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    removeListener.mockRestore();
  });
});
