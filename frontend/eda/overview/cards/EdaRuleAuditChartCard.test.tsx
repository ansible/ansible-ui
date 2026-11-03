/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RuleAuditChart } from './EdaRuleAuditChartCard';

vi.mock('@ansible/ansible-ui-framework/PageDashboard/PageDashboardChart', () => ({
  PageDashboardChart: ({
    groups,
  }: {
    groups: { label: string; values: { label: string; value: number }[] }[];
  }) => (
    <div>
      {groups.map((group) => (
        <div key={group.label}>
          {group.label}:{group.values.reduce((sum, item) => sum + item.value, 0)}
        </div>
      ))}
    </div>
  ),
}));

const server = setupServer();

describe('EdaRuleAuditChartCard', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render nothing when there are no fired audits', async () => {
    server.use(http.get(/audit-rules/, () => HttpResponse.json({ count: 0, results: [] })));

    const { container } = render(
      <SWRConfig
        value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}
      >
        <MemoryRouter>
          <RuleAuditChart />
        </MemoryRouter>
      </SWRConfig>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('');
    });
  });

  it('should aggregate successful and failed runs onto the chart', async () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    server.use(
      http.get(/audit-rules/, () =>
        HttpResponse.json({
          count: 3,
          results: [
            { id: 1, status: 'successful', fired_at: yesterday.toISOString() },
            { id: 2, status: 'successful', fired_at: today.toISOString() },
            { id: 3, status: 'failed', fired_at: today.toISOString() },
          ],
        })
      )
    );

    render(
      <SWRConfig
        value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}
      >
        <MemoryRouter>
          <RuleAuditChart />
        </MemoryRouter>
      </SWRConfig>
    );

    await waitFor(() => {
      expect(screen.getByText('Rule Audit')).toBeInTheDocument();
    });
    expect(screen.getByText(/Success:2/)).toBeInTheDocument();
    expect(screen.getByText(/Failed:1/)).toBeInTheDocument();
  });

  it('should ignore audits without a fired_at timestamp', async () => {
    server.use(
      http.get(/audit-rules/, () =>
        HttpResponse.json({
          count: 2,
          results: [
            { id: 1, status: 'successful' },
            { id: 2, status: 'failed' },
          ],
        })
      )
    );

    const { container } = render(
      <SWRConfig
        value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}
      >
        <MemoryRouter>
          <RuleAuditChart />
        </MemoryRouter>
      </SWRConfig>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('');
    });
  });
});
