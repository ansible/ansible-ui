import type { ReactElement, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageDashboardChart, PageDashboardChartVariantE } from './PageDashboardChart';
import type { PageDashboardChartGroup } from './PageDashboardChart';

interface MockChildrenProps {
  children?: ReactNode;
}

interface MockAxisProps {
  tickFormat?: (value: number) => string | number | undefined;
}

interface MockScatterProps {
  size?: (props: { active: boolean }) => number;
}

interface MockContainerProps extends MockChildrenProps {
  labels?: (point: { datum: { y: string | number } }) => string;
}

interface MockChartProps extends MockChildrenProps {
  containerComponent?: ReactNode;
}

function MockChartComponent({ children, testId }: MockChildrenProps & { testId: string }) {
  return <div data-testid={testId}>{children}</div>;
}

vi.mock('@patternfly/react-charts/victory', () => {
  return {
    Chart: (props: MockChartProps) => (
      <MockChartComponent testId="dashboard-chart">
        {props.containerComponent}
        {props.children}
      </MockChartComponent>
    ),
    ChartArea: () => <div data-testid="chart-area" />,
    ChartAxis: (props: MockAxisProps) => (
      <div
        data-testid="chart-axis"
        data-integer-tick={props.tickFormat?.(1)}
        data-decimal-tick={props.tickFormat?.(1.5)}
      />
    ),
    ChartBar: () => <div data-testid="chart-bar" />,
    ChartGroup: (props: MockChildrenProps) => (
      <MockChartComponent {...props} testId="chart-group" />
    ),
    ChartLegendTooltip: () => <div data-testid="chart-legend-tooltip" />,
    ChartLine: () => <div data-testid="chart-line" />,
    ChartScatter: (props: MockScatterProps) => (
      <div
        data-testid="chart-scatter"
        data-size-active={props.size?.({ active: true })}
        data-size-inactive={props.size?.({ active: false })}
      />
    ),
    ChartStack: (props: MockChildrenProps) => (
      <MockChartComponent {...props} testId="chart-stack" />
    ),
    createContainer: () => (props: MockContainerProps) => {
      props.labels?.({ datum: { y: 1 } });
      return <MockChartComponent {...props} testId="chart-container" />;
    },
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

const coverageGroups: PageDashboardChartGroup[] = [
  {
    label: 'Successful jobs',
    color: '#00a00d',
    values: [
      { label: 'Monday', value: 3 },
      { label: 'Tuesday', value: 2 },
    ],
    link: '/jobs',
  },
  {
    label: 'Empty group',
    color: '#707070',
    values: [{ label: 'Monday', value: 0 }],
  },
];

function renderChart(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function renderChartWithOptions(
  variant?: keyof typeof PageDashboardChartVariantE,
  allowZero?: boolean,
  onlyIntegerTicks?: boolean
) {
  return renderChart(
    <PageDashboardChart
      groups={coverageGroups}
      variant={variant}
      allowZero={allowZero}
      onlyIntegerTicks={onlyIntegerTicks}
    />
  );
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

  it('filters empty groups and renders the default stacked area chart', () => {
    renderChartWithOptions();

    expect(screen.getByText('Successful jobs')).toBeInTheDocument();
    expect(screen.queryByText('Empty group')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('chart-area')).toHaveLength(1);
    expect(screen.getAllByTestId('chart-scatter')).toHaveLength(1);
  });

  it('keeps empty groups when allowZero is enabled', () => {
    renderChartWithOptions(PageDashboardChartVariantE.stackedAreaChart, true);

    expect(screen.getByText('Empty group')).toBeInTheDocument();
  });

  it('supports disabling integer-only tick formatting', () => {
    renderChartWithOptions(undefined, undefined, false);

    const dependentAxis = screen.getAllByTestId('chart-axis')[1];
    expect(dependentAxis.dataset.integerTick).toBeUndefined();
    expect(dependentAxis.dataset.decimalTick).toBeUndefined();
  });

  it('filters non-integer dependent-axis ticks by default', () => {
    renderChartWithOptions();

    const dependentAxis = screen.getAllByTestId('chart-axis')[1];
    expect(dependentAxis.dataset.integerTick).toBe('1');
    expect(dependentAxis.dataset.decimalTick).toBe('');
  });

  it('uses a larger scatter marker for active points', () => {
    renderChartWithOptions(PageDashboardChartVariantE.lineChart);

    const scatter = screen.getByTestId('chart-scatter');
    expect(scatter.dataset.sizeActive).toBe('6');
    expect(scatter.dataset.sizeInactive).toBe('3');
  });

  it.each([
    [PageDashboardChartVariantE.lineChart, 'chart-line'],
    [PageDashboardChartVariantE.stackedBarChart, 'chart-bar'],
    [PageDashboardChartVariantE.barChart, 'chart-bar'],
  ] as const)('renders the %s variant', (variant, testId) => {
    renderChartWithOptions(variant);

    expect(screen.getAllByTestId(testId).length).toBeGreaterThan(0);
  });
});
