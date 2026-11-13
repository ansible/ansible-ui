import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageGrid } from './PageGrid';

type Observed = { element: Element; notify: (width: number) => void };
const observed: Observed[] = [];

describe('PageGrid', () => {
  beforeEach(() => {
    observed.length = 0;
    class MockResizeObserver {
      constructor(private readonly resizeCallback: ResizeObserverCallback) {}
      observe = (element: Element) => {
        observed.push({
          element,
          notify: (width: number) => {
            this.resizeCallback(
              [{ contentRect: { width, height: 0 } } as ResizeObserverEntry],
              this as unknown as ResizeObserver
            );
          },
        });
      };
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders children and adjusts column template on resize', () => {
    const { container } = render(
      <PageGrid size={100} maxColumns={4}>
        <div>Cell</div>
      </PageGrid>
    );

    expect(screen.getByText('Cell')).toBeInTheDocument();
    const grid = container.firstChild as HTMLElement;
    Object.defineProperty(grid, 'clientWidth', { configurable: true, value: 250 });

    const observer = observed.find((o) => o.element === grid);
    act(() => {
      observer?.notify(250);
    });

    expect(grid.style.gridTemplateColumns.split(' ').length).toBeGreaterThan(1);
  });
});
