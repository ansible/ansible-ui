/* eslint-disable i18next/no-literal-string */
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import useResizeObserver from '@react-hook/resize-observer';
import { useDashboardGridColumns } from './useDashboardGridColumns';

vi.mock('@react-hook/resize-observer', () => ({ default: vi.fn() }));

function Probe() {
  const { ref, gridColumns } = useDashboardGridColumns();
  return (
    <div>
      <div ref={ref} />
      <span data-testid="columns">{gridColumns}</span>
    </div>
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useDashboardGridColumns', () => {
  test('should derive the column count from the measured width on mount', () => {
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(1600);

    const { getByTestId } = render(<Probe />);

    // (1600 - 56 inset) / (1662 / 24) => 22
    expect(getByTestId('columns')).toHaveTextContent('22');

    clientWidthSpy.mockRestore();
  });

  test('should recompute when the ResizeObserver reports a new width', () => {
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(600);

    const { getByTestId } = render(<Probe />);
    // (600 - 56) / 69.25 => 7
    expect(getByTestId('columns')).toHaveTextContent('7');

    const resizeCallback = vi.mocked(useResizeObserver).mock.calls[0][1];
    act(() => {
      resizeCallback({ contentRect: { width: 2400 } } as ResizeObserverEntry, {} as ResizeObserver);
    });

    // (2400 - 56) / 69.25 => 33
    expect(getByTestId('columns')).toHaveTextContent('33');

    clientWidthSpy.mockRestore();
  });

  test('should ignore a measurement below one column and keep the current count', () => {
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(1600);

    const { getByTestId } = render(<Probe />);
    expect(getByTestId('columns')).toHaveTextContent('22');

    const resizeCallback = vi.mocked(useResizeObserver).mock.calls[0][1];
    act(() => {
      resizeCallback({ contentRect: { width: 0 } } as ResizeObserverEntry, {} as ResizeObserver);
    });
    act(() => {
      resizeCallback({ contentRect: {} } as ResizeObserverEntry, {} as ResizeObserver);
    });

    // transient / hidden measurements are ignored — no flash to one column
    expect(getByTestId('columns')).toHaveTextContent('22');

    clientWidthSpy.mockRestore();
  });
});
