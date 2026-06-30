import { act, renderHook } from '@testing-library/react';
import { type RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollControls } from './useScrollControls';

function createMockContainer(overrides?: Record<string, unknown>) {
  const scrollToSpy = vi.fn();
  const scrollBySpy = vi.fn();
  const getBoundingClientRectSpy = vi.fn(() => ({ height: 500 }));
  const el = {
    scrollTop: 0,
    scrollHeight: 2000,
    clientHeight: 500,
    scrollTo: scrollToSpy,
    scrollBy: scrollBySpy,
    getBoundingClientRect: getBoundingClientRectSpy,
    ...overrides,
  } as unknown as HTMLElement;
  return { el, scrollToSpy, scrollBySpy, getBoundingClientRectSpy };
}

describe('useScrollControls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return handleScroll and scroll navigation functions', () => {
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() => useScrollControls(containerRef, false, vi.fn(), 100, true));

    expect(result.current).toHaveProperty('handleScroll');
    expect(result.current).toHaveProperty('scrollToTop');
    expect(result.current).toHaveProperty('scrollToBottom');
    expect(result.current).toHaveProperty('scrollPageDown');
    expect(result.current).toHaveProperty('scrollPageUp');
    expect(typeof result.current.handleScroll).toBe('function');
  });

  it('should disable follow mode when user scrolls up', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollControls(containerRef, true, setIsFollowModeEnabled, 100, true)
    );

    act(() => {
      result.current.handleScroll({
        scrollTop: 500,
        scrollHeight: 2000,
        clientHeight: 500,
      } as HTMLElement);
    });

    setIsFollowModeEnabled.mockClear();

    act(() => {
      result.current.handleScroll({
        scrollTop: 300,
        scrollHeight: 2000,
        clientHeight: 500,
      } as HTMLElement);
    });

    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(false);
  });

  it('should enable follow mode when scrolled to bottom', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollControls(containerRef, false, setIsFollowModeEnabled, 100, true)
    );

    act(() => {
      result.current.handleScroll({
        scrollTop: 1500,
        scrollHeight: 2000,
        clientHeight: 500,
      } as HTMLElement);
    });

    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(true);
  });

  it('should not disable follow mode when scroll height changes (new content)', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollControls(containerRef, true, setIsFollowModeEnabled, 100, true)
    );

    act(() => {
      result.current.handleScroll({
        scrollTop: 1500,
        scrollHeight: 2000,
        clientHeight: 500,
      } as HTMLElement);
    });

    setIsFollowModeEnabled.mockClear();

    act(() => {
      result.current.handleScroll({
        scrollTop: 1400,
        scrollHeight: 2500,
        clientHeight: 500,
      } as HTMLElement);
    });

    expect(setIsFollowModeEnabled).not.toHaveBeenCalledWith(false);
  });

  it('should track scroll position using refs (stable handleScroll reference)', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result, rerender } = renderHook(
      ({ followMode }) =>
        useScrollControls(containerRef, followMode, setIsFollowModeEnabled, 100, true),
      { initialProps: { followMode: false } }
    );

    const firstHandleScroll = result.current.handleScroll;

    rerender({ followMode: true });

    expect(result.current.handleScroll).toBe(firstHandleScroll);
  });

  it('should scrollToTop and disable follow mode', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el, scrollToSpy } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollControls(containerRef, true, setIsFollowModeEnabled, 100, true)
    );

    act(() => {
      result.current.scrollToTop();
    });

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0 });
    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(false);
  });

  it('should scrollToBottom and enable follow mode', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el, scrollToSpy } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollControls(containerRef, false, setIsFollowModeEnabled, 100, true)
    );

    act(() => {
      result.current.scrollToBottom();
    });

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 2000 });
    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(true);
  });

  it('should scrollPageDown by container height minus 48px', () => {
    const { el, scrollBySpy } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() => useScrollControls(containerRef, false, vi.fn(), 100, true));

    act(() => {
      result.current.scrollPageDown();
    });

    expect(scrollBySpy).toHaveBeenCalledWith({ top: 452 });
  });

  it('should scrollPageUp and disable follow mode', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el, scrollBySpy } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollControls(containerRef, true, setIsFollowModeEnabled, 100, true)
    );

    act(() => {
      result.current.scrollPageUp();
    });

    expect(scrollBySpy).toHaveBeenCalledWith({ top: -452 });
    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(false);
  });

  it('should auto-scroll to bottom when follow mode is enabled', () => {
    const { el, scrollToSpy } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    renderHook(() => useScrollControls(containerRef, true, vi.fn(), 100, true));

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 2000 });
  });

  it('should not auto-scroll when follow mode is disabled', () => {
    const { el, scrollToSpy } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    renderHook(() => useScrollControls(containerRef, false, vi.fn(), 100, true));

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('should disable follow mode after ticks at bottom when job is not running', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el } = createMockContainer({
      scrollTop: 1500,
      scrollHeight: 2000,
      clientHeight: 500,
    });
    const containerRef = { current: el } as RefObject<HTMLElement>;

    renderHook(() => useScrollControls(containerRef, true, setIsFollowModeEnabled, 100, false));

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(false);
  });

  it('should handle null containerRef gracefully for scroll navigation', () => {
    const containerRef = { current: null } as RefObject<HTMLElement>;

    const { result } = renderHook(() => useScrollControls(containerRef, false, vi.fn(), 100, true));

    expect(() => {
      act(() => {
        result.current.scrollToTop();
        result.current.scrollToBottom();
        result.current.scrollPageDown();
        result.current.scrollPageUp();
      });
    }).not.toThrow();
  });

  it('should update follow mode ref when prop changes', () => {
    const setIsFollowModeEnabled = vi.fn();
    const { el } = createMockContainer();
    const containerRef = { current: el } as RefObject<HTMLElement>;

    const { result, rerender } = renderHook(
      ({ followMode }) =>
        useScrollControls(containerRef, followMode, setIsFollowModeEnabled, 100, true),
      { initialProps: { followMode: false } }
    );

    act(() => {
      result.current.handleScroll({
        scrollTop: 500,
        scrollHeight: 2000,
        clientHeight: 500,
      } as HTMLElement);
    });

    rerender({ followMode: true });

    setIsFollowModeEnabled.mockClear();

    act(() => {
      result.current.handleScroll({
        scrollTop: 300,
        scrollHeight: 2000,
        clientHeight: 500,
      } as HTMLElement);
    });

    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(false);
  });
});
