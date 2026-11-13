import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Scrollable, useScrollableState } from './Scrollable';

function ScrollableStateReader() {
  const [state] = useScrollableState();
  return (
    <div data-testid="scroll-state">
      {state.stickyLeft}-{state.stickyTop}
    </div>
  );
}

describe('Scrollable', () => {
  beforeEach(() => {
    class MockResizeObserver {
      constructor(private readonly resizeCallback: ResizeObserverCallback) {}

      observe = (element: Element) => {
        const entry = {
          contentRect: { width: 400, height: 300 },
        } as ResizeObserverEntry;
        act(() => {
          this.resizeCallback([entry], this as unknown as ResizeObserver);
        });
        Object.defineProperty(element, 'clientWidth', { configurable: true, value: 400 });
        Object.defineProperty(element, 'clientHeight', { configurable: true, value: 300 });
      };

      disconnect = vi.fn();
      unobserve = vi.fn();
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders children inside a scrollable region', () => {
    render(
      <Scrollable>
        <div>Scrollable content</div>
      </Scrollable>
    );
    expect(screen.getByText('Scrollable content')).toBeInTheDocument();
  });

  it('provides scrollable context to descendants', () => {
    render(
      <Scrollable>
        <ScrollableStateReader />
      </Scrollable>
    );
    expect(screen.getByTestId('scroll-state')).toHaveTextContent('0-0');
  });

  it('invokes onScroll when the inner region scrolls', () => {
    const onScroll = vi.fn();
    const { container } = render(
      <Scrollable onScroll={onScroll}>
        <div style={{ height: 400 }}>Tall content</div>
      </Scrollable>
    );

    const scrollTarget = [...container.querySelectorAll('div')].find(
      (el) => el.scrollHeight > el.clientHeight || getComputedStyle(el).overflowY === 'auto'
    ) as HTMLElement | undefined;

    expect(scrollTarget).toBeTruthy();
    Object.defineProperties(scrollTarget!, {
      scrollTop: { configurable: true, value: 40, writable: true },
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollHeight: { configurable: true, value: 800 },
      clientHeight: { configurable: true, value: 200 },
      scrollWidth: { configurable: true, value: 800 },
      clientWidth: { configurable: true, value: 200 },
    });
    act(() => {
      scrollTarget!.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    expect(onScroll).toHaveBeenCalled();
  });

  it('shows scroll shadows when content overflows horizontally and vertically', () => {
    const { container } = render(
      <Scrollable marginTop={8} marginBottom={8} marginLeft={4} marginRight={4}>
        <div style={{ width: 1200, height: 800 }}>Large content</div>
      </Scrollable>
    );

    const scrollTarget = container.querySelectorAll('div')[1] as HTMLElement;
    Object.defineProperties(scrollTarget, {
      scrollTop: { configurable: true, value: 50, writable: true },
      scrollLeft: { configurable: true, value: 60, writable: true },
      scrollHeight: { configurable: true, value: 1200 },
      clientHeight: { configurable: true, value: 200 },
      scrollWidth: { configurable: true, value: 1600 },
      clientWidth: { configurable: true, value: 300 },
    });

    act(() => {
      scrollTarget.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    expect(scrollTarget.scrollLeft).toBeGreaterThan(0);
    expect(scrollTarget.scrollTop).toBeGreaterThan(0);
  });
});
