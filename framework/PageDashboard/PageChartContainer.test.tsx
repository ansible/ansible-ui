/* eslint-disable i18next/no-literal-string */
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageChartContainer } from './PageChartContainer';

type Observed = {
  element: Element;
  notify: () => void;
};

const observed: Observed[] = [];

describe('PageChartContainer', () => {
  beforeEach(() => {
    observed.length = 0;

    class MockResizeObserver {
      constructor(private readonly resizeCallback: ResizeObserverCallback) {}

      observe = (element: Element) => {
        observed.push({
          element,
          notify: () => {
            this.resizeCallback(
              [{ contentRect: { width: 0, height: 0 } } as ResizeObserverEntry],
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

  it('renders children with container dimensions', () => {
    render(
      <PageChartContainer height={200} className="chart-box">
        {(size) => (
          <span data-testid="size">
            {size.width}x{size.height}
          </span>
        )}
      </PageChartContainer>
    );

    expect(screen.getByTestId('size')).toBeInTheDocument();
    expect(screen.getByTestId('size').parentElement?.parentElement).toHaveClass('chart-box');
  });

  it('updates size when resize observer notifies', () => {
    render(
      <PageChartContainer>
        {(size) => <span data-testid="size">{size.width}</span>}
      </PageChartContainer>
    );

    const chartRoot = observed.at(-1)?.element as HTMLElement;
    Object.defineProperty(chartRoot, 'clientWidth', { configurable: true, value: 320 });
    Object.defineProperty(chartRoot, 'clientHeight', { configurable: true, value: 180 });

    act(() => {
      observed.at(-1)?.notify();
    });

    expect(screen.getByTestId('size')).toHaveTextContent('320');
  });
});
