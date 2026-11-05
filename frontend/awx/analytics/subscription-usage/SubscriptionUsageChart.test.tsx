import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { SubscriptionUsageChart } from './SubscriptionUsageChart';

vi.mock('@ansible/ansible-ui-framework/PageDashboard/usePageChartColors', () => ({
  usePageChartColors: () => ({ blueColor: '#0000ff', redColor: '#ff0000' }),
}));

vi.mock('@ansible/ansible-ui-framework/PageDashboard/PageDashboardChart', () => ({
  PageDashboardChart: ({ groups }: { groups: { label: string }[] }) => (
    <div data-testid="usage-chart">{groups.map((group) => group.label).join(',')}</div>
  ),
}));

const server = setupServer(
  http.get(awxAPI`/host_metric_summary_monthly/*`, () =>
    HttpResponse.json({
      results: [
        {
          id: 1,
          date: '2024-03-01',
          license_capacity: 100,
          license_consumed: 80,
          hosts_added: 1,
          hosts_deleted: 0,
          indirectly_managed_hosts: 0,
        },
      ],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderChart(period: string) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <SubscriptionUsageChart period={{ dateRange: [period] }} />
    </SWRConfig>
  );
}

describe('SubscriptionUsageChart', () => {
  it('renders chart groups after data loads', async () => {
    renderChart('year');
    await waitFor(() => expect(screen.getByTestId('usage-chart')).toBeInTheDocument());
    expect(screen.getByTestId('usage-chart')).toHaveTextContent('Subscriptions consumed');
  });

  it('supports alternate date range filters', async () => {
    renderChart('two_years');
    await waitFor(() => expect(screen.getByTestId('usage-chart')).toBeInTheDocument());
  });
});
