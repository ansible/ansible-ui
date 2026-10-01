import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PageDashboardChart,
  PageDashboardChartVariant,
  PageDashboardChartVariantE,
} from './PageDashboardChart';

const chartProps: Array<Record<string, unknown>> = [];

function findChartSeriesData(node: ReactNode): Array<{ x: string; y: number }> {
  if (!node) {
    return [];
  }
  if (Array.isArray(node)) {
    return (node as ReactNode[]).flatMap((child) => findChartSeriesData(child));
  }
  if (typeof node === 'object' && 'props' in node) {
    const element = node as ReactElement<{
      data?: Array<{ x: string; y: number }>;
      children?: ReactNode;
    }>;
    if (element.props.data) {
      return element.props.data;
    }
    return findChartSeriesData(element.props.children ?? null);
  }
  return [];
}

vi.mock('./PageChartContainer', () => ({
  PageChartContainer: ({
    children,
  }: {
    children: (size: { width: number; height: number }) => ReactNode;
  }) => children({ width: 400, height: 200 }),
}));

vi.mock('@patternfly/react-charts/victory', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-charts/victory')>();
  return {
    ...actual,
    Chart: (props: Record<string, unknown>) => {
      chartProps.push(props);
      return <div data-testid="mock-chart" />;
    },
  };
});

const chartGroups = [
  {
    label: 'Success',
    color: '#3e8635',
    values: [
      { label: '9/29', value: 10 },
      { label: '9/30', value: 11031 },
    ],
  },
  {
    label: 'Failed',
    color: '#c9190b',
    values: [
      { label: '9/29', value: 2 },
      { label: '9/30', value: 65 },
    ],
  },
];

describe('PageDashboardChart', () => {
  beforeEach(() => {
    chartProps.length = 0;
  });

  it.each<[PageDashboardChartVariant]>([
    [PageDashboardChartVariantE.lineChart],
    [PageDashboardChartVariantE.stackedAreaChart],
    [PageDashboardChartVariantE.barChart],
    [PageDashboardChartVariantE.stackedBarChart],
  ])('includes the final categorical point in series data for %s', (variant) => {
    render(<PageDashboardChart groups={chartGroups} variant={variant} yLabel="Job count" />);

    const seriesData = findChartSeriesData(chartProps.at(-1)?.children as ReactNode);
    expect(seriesData).toContainEqual({ x: '9/30', y: 11031 });
  });
});
