import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../common/api/awx-utils';
import { AnalyticsReportBuilder } from './AnalyticsReportBuilder';

vi.mock('../components/Chart', () => ({
  Chart: () => <div data-testid="report-chart" />,
}));

const mainData = {
  report: {
    name: 'Module usage by task',
    description: 'Tasks report',
    tableHeaders: [{ key: 'name' }, { key: 'host_task_count' }],
    layoutProps: {
      dataEndpoint: '/api/tower-analytics/v1/report/module_usage_by_task/',
      optionsEndpoint: '/api/tower-analytics/v1/report/module_usage_by_task_options/',
      availableChartTypes: ['line'],
      schema: [{ type: 'line', label: 'Tasks' }],
    },
  },
};

const optionsData = {
  quick_date_range: [{ key: 'last_30_days', value: 'Last 30 days' }],
  group_by: [{ key: 'task', value: 'Task' }],
  sort_options: [{ key: 'host_task_count', value: 'Host task count' }],
  org_id: [{ key: '1', value: 'Default' }],
};

const tableData = {
  meta: {
    count: 1,
    legend: [{ id: 1, name: 'copy', host_task_count: 12 }],
  },
};

const server = setupServer(
  http.get(awxAPI`/analytics/report/module_usage_by_task/`, () => HttpResponse.json(mainData)),
  http.post(awxAPI`/analytics/report/module_usage_by_task_options/`, () =>
    HttpResponse.json(optionsData)
  ),
  http.post(awxAPI`/analytics/report/module_usage_by_task/*`, () => HttpResponse.json(tableData))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AnalyticsReportBuilder integration', () => {
  it('loads metadata, options, and table data', async () => {
    render(
      <PageAlertToasterProvider>
        <MemoryRouter>
          <AnalyticsReportBuilder
            report_name="module_usage_by_task"
            main_url={awxAPI`/analytics/report/module_usage_by_task/`}
            navigate={vi.fn()}
          />
        </MemoryRouter>
      </PageAlertToasterProvider>
    );

    await waitFor(() => expect(screen.getByText('Module usage by task')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(screen.getByTestId('report-chart')).toBeInTheDocument();
    expect(screen.getByText('copy')).toBeInTheDocument();
  });
});
