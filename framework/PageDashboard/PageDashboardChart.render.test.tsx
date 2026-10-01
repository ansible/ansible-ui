import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageDashboardChart, PageDashboardChartVariantE } from './PageDashboardChart';

vi.mock('./PageChartContainer', () => ({
  PageChartContainer: ({
    children,
  }: {
    children: (size: { width: number; height: number }) => ReactNode;
  }) => children({ width: 480, height: 240 }),
}));

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

describe('PageDashboardChart (Victory render)', () => {
  it('should render the last categorical x-axis label from chart data', async () => {
    render(
      <PageDashboardChart
        groups={chartGroups}
        variant={PageDashboardChartVariantE.stackedAreaChart}
        yLabel="Job count"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('9/30')).toBeInTheDocument();
    });
  });
});
