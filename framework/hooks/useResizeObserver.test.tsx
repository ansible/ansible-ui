import { render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useResizeObserver } from './useResizeObserver';

function TestHost({ onResize }: { onResize: (entry: ResizeObserverEntry) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useResizeObserver(ref, onResize);
  return <div ref={ref} data-testid="resize-target" />;
}

function EmptyRefHost() {
  const ref = useRef<HTMLDivElement>(null);
  useResizeObserver(ref, vi.fn());
  return null;
}

describe('useResizeObserver', () => {
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  let resizeCallback: ResizeObserverCallback;

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();
    resizeCallback = vi.fn();

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('observes the mounted element and forwards resize entries', () => {
    const onResize = vi.fn();
    render(<TestHost onResize={onResize} />);

    const target = document.querySelector('[data-testid="resize-target"]');
    expect(observe).toHaveBeenCalledWith(target, undefined);

    const entry = { contentRect: { width: 320 } } as ResizeObserverEntry;
    resizeCallback([entry], {} as ResizeObserver);
    expect(onResize).toHaveBeenCalledWith(entry);
  });

  test('disconnects when unmounted', () => {
    const onResize = vi.fn();
    const { unmount } = render(<TestHost onResize={onResize} />);
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  test('does not observe when ref is unset', () => {
    render(<EmptyRefHost />);
    expect(observe).not.toHaveBeenCalled();
  });
});
