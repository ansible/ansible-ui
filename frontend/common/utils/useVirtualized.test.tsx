import { act, renderHook } from '@testing-library/react';
import { type RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVirtualizedList } from './useVirtualized';

let resizeObserverCallback: ((entry: ResizeObserverEntry) => void) | undefined;
vi.mock('@react-hook/resize-observer', () => ({
  default: vi.fn((_ref: unknown, cb: (entry: ResizeObserverEntry) => void) => {
    resizeObserverCallback = cb;
  }),
}));

function createMockContainer(overrides?: Record<string, unknown>) {
  const listeners: Record<string, EventListener[]> = {};
  const addEventListenerSpy = vi.fn((event: string, handler: EventListener) => {
    listeners[event] = listeners[event] ?? [];
    listeners[event].push(handler);
  });
  const removeEventListenerSpy = vi.fn((event: string, handler: EventListener) => {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter((h) => h !== handler);
    }
  });
  const mock = {
    scrollTop: 0,
    clientHeight: 500,
    scrollHeight: 2000,
    addEventListener: addEventListenerSpy,
    removeEventListener: removeEventListenerSpy,
    ...overrides,
  };
  const el = mock as unknown as HTMLElement;
  const dispatchScroll = () => {
    listeners['scroll']?.forEach((h) => h(new Event('scroll')));
  };
  return { el, dispatchScroll, addEventListenerSpy, removeEventListenerSpy, mock };
}

describe('useVirtualizedList', () => {
  let rafCallbacks: Array<() => void>;
  let rafIdCounter: number;

  beforeEach(() => {
    rafCallbacks = [];
    rafIdCounter = 1;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      const id = rafIdCounter++;
      rafCallbacks.push(cb as () => void);
      return id;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb());
  }

  it('should return the expected shape', () => {
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    expect(result.current).toHaveProperty('beforeRowsCount');
    expect(result.current).toHaveProperty('beforeRowsHeight');
    expect(result.current).toHaveProperty('visibleItems');
    expect(result.current).toHaveProperty('setRowHeight');
    expect(result.current).toHaveProperty('afterRowsHeight');
  });

  it('should register a passive scroll listener', () => {
    const { el, addEventListenerSpy } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    renderHook(() => useVirtualizedList(containerRef, items));

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    });
  });

  it('should throttle scroll events with requestAnimationFrame', () => {
    const { el, dispatchScroll, mock } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

    renderHook(() => useVirtualizedList(containerRef, items));

    mock.scrollTop = 100;
    dispatchScroll();
    mock.scrollTop = 200;
    dispatchScroll();
    mock.scrollTop = 300;
    dispatchScroll();

    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('should update scroll position after rAF fires', () => {
    const { el, dispatchScroll, mock } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 200 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    const initialBefore = result.current.beforeRowsCount;

    mock.scrollTop = 2000;
    dispatchScroll();

    act(() => {
      flushRaf();
    });

    expect(result.current.beforeRowsCount).toBeGreaterThan(initialBefore);
  });

  it('should allow new rAF after the previous one completes', () => {
    const { el, dispatchScroll } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    renderHook(() => useVirtualizedList(containerRef, items));

    dispatchScroll();
    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      flushRaf();
    });

    dispatchScroll();
    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it('should call onScrollCallback within rAF', () => {
    const { el, dispatchScroll } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];
    const onScrollCallback = vi.fn();

    renderHook(() => useVirtualizedList(containerRef, items, onScrollCallback));

    dispatchScroll();

    expect(onScrollCallback).not.toHaveBeenCalled();

    act(() => {
      flushRaf();
    });

    expect(onScrollCallback).toHaveBeenCalledTimes(1);
    expect(onScrollCallback).toHaveBeenCalledWith(el);
  });

  it('should use latest onScrollCallback via ref', () => {
    const { el, dispatchScroll } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ cb }) => useVirtualizedList(containerRef, items, cb), {
      initialProps: { cb: callback1 },
    });

    rerender({ cb: callback2 });

    dispatchScroll();
    act(() => {
      flushRaf();
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending rAF on cleanup', () => {
    const { el, dispatchScroll } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    const { unmount } = renderHook(() => useVirtualizedList(containerRef, items));

    dispatchScroll();
    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);

    unmount();

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should remove scroll listener on cleanup', () => {
    const { el, removeEventListenerSpy } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    const { unmount } = renderHook(() => useVirtualizedList(containerRef, items));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should calculate visible items correctly', () => {
    const { el } = createMockContainer({ scrollTop: 0, clientHeight: 500 });
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    expect(result.current.visibleItems.length).toBeGreaterThan(0);
    expect(result.current.visibleItems.length).toBeLessThan(items.length);
  });

  it('should handle empty items array', () => {
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() => useVirtualizedList(containerRef, []));

    expect(result.current.visibleItems).toEqual([]);
    expect(result.current.beforeRowsHeight).toBe(0);
    expect(result.current.afterRowsHeight).toBe(0);
  });

  it('should handle null containerRef', () => {
    const containerRef = { current: null } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    expect(result.current.visibleItems.length).toBeGreaterThan(0);
  });

  it('should update row heights via setRowHeight', () => {
    const { el } = createMockContainer({ scrollTop: 0, clientHeight: 200 });
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    act(() => {
      result.current.setRowHeight(0, 40);
      result.current.setRowHeight(1, 40);
    });

    expect(result.current.visibleItems.length).toBeGreaterThan(0);
  });

  it('should work without onScrollCallback', () => {
    const { el, dispatchScroll } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    renderHook(() => useVirtualizedList(containerRef, items));

    dispatchScroll();

    act(() => {
      flushRaf();
    });
  });

  it('should not cancel rAF on cleanup when none is pending', () => {
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    const { unmount } = renderHook(() => useVirtualizedList(containerRef, items));

    unmount();

    expect(globalThis.cancelAnimationFrame).not.toHaveBeenCalled();
  });

  it('should handle ref becoming null in onScroll', () => {
    const { el, dispatchScroll } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    renderHook(() => useVirtualizedList(containerRef, items));

    (containerRef as { current: HTMLElement | null }).current = null;
    dispatchScroll();

    expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('should handle ref becoming null before rAF fires', () => {
    const { el, dispatchScroll } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    const initialVisibleCount = result.current.visibleItems.length;

    dispatchScroll();

    (containerRef as { current: HTMLElement | null }).current = null;

    act(() => {
      flushRaf();
    });

    expect(result.current.visibleItems.length).toBe(initialVisibleCount);
  });

  it('should update minRowHeight when setRowHeight receives a smaller height', () => {
    const { el } = createMockContainer({ scrollTop: 0, clientHeight: 200 });
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    const visibleCountBefore = result.current.visibleItems.length;

    act(() => {
      result.current.setRowHeight(0, 10);
    });

    expect(result.current.visibleItems.length).toBeGreaterThanOrEqual(visibleCountBefore);
  });

  it('should no-op when setRowHeight is called with the same height', () => {
    const { el } = createMockContainer({ scrollTop: 0, clientHeight: 200 });
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    act(() => {
      result.current.setRowHeight(0, 40);
    });

    const visibleAfterFirst = result.current.visibleItems;

    act(() => {
      result.current.setRowHeight(0, 40);
    });

    expect(result.current.visibleItems).toBe(visibleAfterFirst);
  });

  it('should use custom row heights across before/visible/after regions', () => {
    const { el, dispatchScroll, mock } = createMockContainer({
      scrollTop: 3000,
      clientHeight: 200,
    });
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 200 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    act(() => {
      for (let i = 0; i < 200; i++) {
        result.current.setRowHeight(i, 50);
      }
    });

    mock.scrollTop = 3000;
    dispatchScroll();
    act(() => {
      flushRaf();
    });

    expect(result.current.beforeRowsCount).toBeGreaterThan(0);
    expect(result.current.beforeRowsHeight).toBeGreaterThan(0);
    expect(result.current.afterRowsHeight).toBeGreaterThan(0);
  });

  it('should invoke resize observer callback', () => {
    const { el } = createMockContainer({ clientHeight: 300 });
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() => useVirtualizedList(containerRef, items));

    const initialVisibleCount = result.current.visibleItems.length;

    expect(resizeObserverCallback).toBeDefined();

    (el as unknown as Record<string, number>).clientHeight = 600;
    act(() => {
      resizeObserverCallback!({} as ResizeObserverEntry);
    });

    expect(result.current.visibleItems.length).toBeGreaterThanOrEqual(initialVisibleCount);
  });

  it('should handle null containerRef in resize observer callback', () => {
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;
    const items = [{ id: 1 }];

    renderHook(() => useVirtualizedList(containerRef, items));

    (containerRef as { current: HTMLElement | null }).current = null;

    expect(() => {
      act(() => {
        resizeObserverCallback!({} as ResizeObserverEntry);
      });
    }).not.toThrow();
  });
});
