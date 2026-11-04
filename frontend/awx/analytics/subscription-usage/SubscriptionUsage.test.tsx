/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../common/api/awx-utils';
import { SubscriptionUsage } from './SubscriptionUsage';

vi.mock('@ansible/ansible-ui-framework/PageDashboard/PageDashboardChart', () => ({
  PageDashboardChart: () => <div data-testid="chart" />,
}));

vi.mock('./SubscriptionUsageChart', () => ({
  SubscriptionUsageChart: () => <div data-testid="subscription-usage-chart" />,
}));

const server = setupServer(
  http.get(awxAPI`/settings/system/`, () =>
    HttpResponse.json({ HOST_METRIC_SUMMARY_TASK_LAST_TS: '2024-05-10T12:00:00Z' })
  ),
  http.get(awxAPI`/host_metric_summary_monthly/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPage() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <PageAlertToasterProvider>
        <MemoryRouter>
          <SubscriptionUsage />
        </MemoryRouter>
      </PageAlertToasterProvider>
    </SWRConfig>
  );
}

describe('SubscriptionUsage', () => {
  it('renders subscription usage header and chart', async () => {
    renderPage();
    expect(screen.getByText('Subscription Usage')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('subscription-usage-chart')).toBeInTheDocument());
    expect(screen.getByText(/Last recalculation date/i)).toBeInTheDocument();
  });
});
