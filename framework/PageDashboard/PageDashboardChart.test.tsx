import type { ReactElement, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageDashboardChart, PageDashboardChartVariantE } from './PageDashboardChart';

vi.mock('@patternfly/react-charts/victory', () => {
  const passthrough = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  const Chart = () => <div data-testid="dashboard-chart" />;
  return {
    Chart,
    ChartArea: passthrough,
    ChartAxis: passthrough,
    ChartBar: passthrough,
    ChartGroup: passthrough,
    ChartLegendTooltip: passthrough,
    ChartLine: passthrough,
    ChartScatter: passthrough,
    ChartStack: passthrough,
    createContainer: () => () => <div data-testid="chart-container" />,
  };
});

vi.mock('../hooks/useResizeObserver', () => ({
  useResizeObserver: vi.fn(),
}));

const groups = [
  {
    label: 'A',
    color: '#00f',
    values: [
      { label: 'Mon', value: 1 },
      { label: 'Tue', value: 2 },
    ],
    link: '/a',
  },
  {
    label: 'B',
    color: '#f00',
    values: [
      { label: 'Mon', value: 0 },
      { label: 'Tue', value: 3 },
    ],
  },
];

function renderChart(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('PageDashboardChart', () => {
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

  it('renders chart and horizontal legend', () => {
    renderChart(<PageDashboardChart id="trend" groups={groups} />);
    expect(screen.getByTestId('dashboard-chart')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('href', '/a');
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('supports axis labels and chart variants', () => {
    renderChart(
      <PageDashboardChart
        groups={groups}
        allowZero
        xLabel="Day"
        yLabel="Count"
        variant={PageDashboardChartVariantE.lineChart}
        onlyIntegerTicks
      />
    );

    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders stacked bar variant', () => {
    renderChart(
      <PageDashboardChart groups={groups} variant={PageDashboardChartVariantE.stackedBarChart} />
    );
    expect(screen.getByTestId('dashboard-chart')).toBeInTheDocument();
  });

  it('renders bar chart variant', () => {
    renderChart(
      <PageDashboardChart groups={groups} variant={PageDashboardChartVariantE.barChart} />
    );
    expect(screen.getByTestId('dashboard-chart')).toBeInTheDocument();
  });
});
