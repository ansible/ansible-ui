import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig, type Cache } from 'swr';
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

function createChartCache(): Cache {
  return new Map() as Cache;
}

function renderChart(cache: Cache) {
  return render(
    <SWRConfig
      value={{
        provider: (): Cache => cache,
        dedupingInterval: 0,
        shouldRetryOnError: false,
        revalidateOnMount: true,
      }}
    >
      <MemoryRouter>
        <RuleAuditChart />
      </MemoryRouter>
    </SWRConfig>
  );
}

function firedAudit(id: number, status: 'successful' | 'failed', when: Date) {
  return { id, status, fired_at: when.toISOString() };
}

async function expectLoadedChartThenEmpty(
  emptyResults: { id: number; status: string; fired_at?: string }[]
) {
  const cache = createChartCache();
  const today = new Date();
  server.use(
    http.get(/audit-rules/, () =>
      HttpResponse.json({
        count: 1,
        results: [firedAudit(1, 'successful', today)],
      })
    )
  );

  const loaded = renderChart(cache);
  await waitFor(() => {
    expect(screen.getByText('Rule Audit')).toBeInTheDocument();
  });
  loaded.unmount();

  server.use(
    http.get(/audit-rules/, () =>
      HttpResponse.json({ count: emptyResults.length, results: emptyResults })
    )
  );

  const emptied = renderChart(cache);
  expect(screen.getByText('Rule Audit')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText('Rule Audit')).not.toBeInTheDocument();
    expect(emptied.container).toHaveTextContent('');
  });
}

describe('EdaRuleAuditChartCard', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render nothing when there are no fired audits', async () => {
    await expectLoadedChartThenEmpty([]);
  });

  it('should aggregate successful and failed runs onto the chart', async () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    server.use(
      http.get(/audit-rules/, () =>
        HttpResponse.json({
          count: 3,
          results: [
            firedAudit(1, 'successful', yesterday),
            firedAudit(2, 'successful', today),
            firedAudit(3, 'failed', today),
          ],
        })
      )
    );

    renderChart(createChartCache());

    await waitFor(() => {
      expect(screen.getByText('Rule Audit')).toBeInTheDocument();
    });
    expect(screen.getByText(/Success:2/)).toBeInTheDocument();
    expect(screen.getByText(/Failed:1/)).toBeInTheDocument();
  });

  it('should ignore audits without a fired_at timestamp', async () => {
    await expectLoadedChartThenEmpty([
      { id: 1, status: 'successful' },
      { id: 2, status: 'failed' },
    ]);
  });
});
