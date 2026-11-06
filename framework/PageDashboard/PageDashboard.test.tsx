/* eslint-disable i18next/no-literal-string */
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageDashboard } from './PageDashboard';

type Observed = {
  element: Element;
  notify: (width: number) => void;
};

const observed: Observed[] = [];

describe('PageDashboard', () => {
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

  it('should render children', () => {
    render(
      <PageDashboard>
        <div>Dashboard content</div>
      </PageDashboard>
    );
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('should update grid column count when resize observer fires', async () => {
    const { container } = render(
      <PageDashboard>
        <div>Wide</div>
      </PageDashboard>
    );

    const grid = container.querySelector('[style*="grid-template-columns"]') as HTMLElement | null;
    expect(grid).toBeTruthy();

    const gridObservers = observed.filter((o) => o.element === grid);
    const gridObserver = gridObservers.at(-1);
    expect(gridObserver).toBeDefined();

    function columnCountFromGridStyle(style: string) {
      const repeat = /^repeat\((\d+)/.exec(style);
      return repeat ? Number(repeat[1]) : 0;
    }

    act(() => {
      gridObserver!.notify(100);
    });
    expect(columnCountFromGridStyle(grid!.style.gridTemplateColumns)).toBe(1);

    act(() => {
      gridObserver!.notify(4000);
    });
    await waitFor(() => {
      expect(columnCountFromGridStyle(grid!.style.gridTemplateColumns)).toBeGreaterThan(1);
    });
  });
});
