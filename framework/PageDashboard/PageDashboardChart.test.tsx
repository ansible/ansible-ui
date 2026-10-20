import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

vi.mock('@patternfly/react-charts/victory', () => ({
  Chart: (props: MockChartProps) => (
    <MockChartComponent testId="chart">
      {props.containerComponent}
      {props.children}
    </MockChartComponent>
  ),
  ChartArea: () => <div data-testid="chart-area" />,
  ChartAxis: (props: MockAxisProps) => {
    return (
      <div
        data-testid="chart-axis"
        data-integer-tick={props.tickFormat?.(1)}
        data-decimal-tick={props.tickFormat?.(1.5)}
      />
    );
  },
  ChartBar: () => <div data-testid="chart-bar" />,
  ChartGroup: (props: MockChildrenProps) => <MockChartComponent {...props} testId="chart-group" />,
  ChartLegendTooltip: () => <div data-testid="chart-legend-tooltip" />,
  ChartLine: () => <div data-testid="chart-line" />,
  ChartScatter: (props: MockScatterProps) => (
    <div
      data-testid="chart-scatter"
      data-size-active={props.size?.({ active: true })}
      data-size-inactive={props.size?.({ active: false })}
    />
  ),
  ChartStack: (props: MockChildrenProps) => <MockChartComponent {...props} testId="chart-stack" />,
  createContainer: () => (props: MockContainerProps) => {
    props.labels?.({ datum: { y: 1 } });
    return <MockChartComponent {...props} testId="chart-container" />;
  },
}));

const groups: PageDashboardChartGroup[] = [
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

function renderChart(
  variant?: keyof typeof PageDashboardChartVariantE,
  allowZero?: boolean,
  onlyIntegerTicks?: boolean
) {
  return render(
    <MemoryRouter>
      <PageDashboardChart
        groups={groups}
        variant={variant}
        allowZero={allowZero}
        onlyIntegerTicks={onlyIntegerTicks}
      />
    </MemoryRouter>
  );
}

describe('PageDashboardChart', () => {
  it('filters empty groups and renders the default stacked area chart', () => {
    renderChart();

    expect(screen.getByText('Successful jobs')).toBeInTheDocument();
    expect(screen.queryByText('Empty group')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('chart-area')).toHaveLength(1);
    expect(screen.getAllByTestId('chart-scatter')).toHaveLength(1);
  });

  it('keeps empty groups when allowZero is enabled', () => {
    renderChart(PageDashboardChartVariantE.stackedAreaChart, true);

    expect(screen.getByText('Empty group')).toBeInTheDocument();
  });

  it('supports disabling integer-only tick formatting', () => {
    renderChart(undefined, undefined, false);

    const dependentAxis = screen.getAllByTestId('chart-axis')[1];
    expect(dependentAxis).not.toHaveAttribute('data-integer-tick');
    expect(dependentAxis).not.toHaveAttribute('data-decimal-tick');
  });

  it('filters non-integer dependent-axis ticks by default', () => {
    renderChart();

    const dependentAxis = screen.getAllByTestId('chart-axis')[1];
    expect(dependentAxis).toHaveAttribute('data-integer-tick', '1');
    expect(dependentAxis).toHaveAttribute('data-decimal-tick', '');
  });

  it('uses a larger scatter marker for active points', () => {
    renderChart(PageDashboardChartVariantE.lineChart);

    const scatter = screen.getByTestId('chart-scatter');
    expect(scatter).toHaveAttribute('data-size-active', '6');
    expect(scatter).toHaveAttribute('data-size-inactive', '3');
  });

  it.each([
    [PageDashboardChartVariantE.lineChart, 'chart-line'],
    [PageDashboardChartVariantE.stackedBarChart, 'chart-bar'],
    [PageDashboardChartVariantE.barChart, 'chart-bar'],
  ] as const)('renders the %s variant', (variant, testId) => {
    renderChart(variant);

    expect(screen.getAllByTestId(testId).length).toBeGreaterThan(0);
  });
});
