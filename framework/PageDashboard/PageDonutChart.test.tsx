import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageDashboardDonutCard, PageDonutChart } from './PageDonutChart';

vi.mock('@patternfly/react-charts/victory', () => ({
  ChartDonut: () => <div data-testid="chart-donut" />,
  ChartDonutUtilization: ({ title }: { title?: string }) => (
    <div data-testid="chart-donut-utilization">{title}</div>
  ),
}));

vi.mock('../hooks/useResizeObserver', () => ({
  useResizeObserver: vi.fn(),
}));

describe('PageDonutChart', () => {
  beforeEach(() => {
    class MockResizeObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses ChartDonut when total is greater than zero', () => {
    render(
      <PageDonutChart
        total={5}
        data={[
          { x: 'A', y: 3 },
          { x: 'B', y: 2 },
        ]}
      />
    );
    expect(screen.getByTestId('chart-donut')).toBeInTheDocument();
  });

  it('uses ChartDonutUtilization when total is zero', () => {
    render(<PageDonutChart total={0} data={[]} />);
    expect(screen.getByTestId('chart-donut-utilization')).toHaveTextContent('0');
  });
});

describe('PageDashboardDonutCard', () => {
  it('renders loading skeletons', () => {
    const { container } = render(
      <MemoryRouter>
        <PageDashboardDonutCard
          title="Hosts"
          to="/hosts"
          loading
          items={[
            { label: 'Up', count: 1, color: 'green' },
            { label: 'Down', count: 0, color: 'red' },
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Hosts')).toBeInTheDocument();
    expect(container.querySelector('.pf-v6-c-skeleton')).toBeTruthy();
  });

  it('renders donut chart when not loading', () => {
    render(
      <MemoryRouter>
        <PageDashboardDonutCard
          title="Jobs"
          to="/jobs"
          items={[{ label: 'Success', count: 2, color: 'green' }]}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('chart-donut')).toBeInTheDocument();
  });
});
