import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { AwxActiveUserContext } from '../../common/useAwxActiveUser';
import { awxAPI } from '../../common/api/awx-utils';
import { AnalyticsReportBuilder, type AnalyticsReportBuilderProps } from './AnalyticsReportBuilder';

const pageNavigate = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('../components/Chart', () => ({
  Chart: (props: {
    specificFunctions?: {
      labelFormat?: {
        customTooltipFormatting?: (input: { datum: { name?: string; y?: number } }) => string;
      };
      onClick?: { handleClick?: () => void };
    };
  }) => {
    const tip =
      props.specificFunctions?.labelFormat?.customTooltipFormatting?.({
        datum: { name: 'copy', y: 4 },
      }) ?? '';
    props.specificFunctions?.onClick?.handleClick?.();
    return <div data-testid="report-chart">{tip}</div>;
  },
}));

const mainData = {
  report: {
    name: 'Module usage by task',
    description: 'Tasks report',
    tableHeaders: [
      { key: 'name', value: 'Name' },
      { key: 'host_task_count', value: 'Tasks' },
      { key: 'missing_col', value: 'Missing' },
    ],
    layoutProps: {
      dataEndpoint: '/api/tower-analytics/v1/report/module_usage_by_task/',
      optionsEndpoint: '/api/tower-analytics/v1/report/module_usage_by_task_options/',
      availableChartTypes: ['line', 'bar'],
      clickableLinking: true,
      schema: [{ type: 'line', label: 'Tasks' }],
    },
  },
};

const optionsData = {
  quick_date_range: [{ key: 'last_30_days', value: 'Last 30 days' }],
  granularity: [{ key: 'monthly', value: 'Monthly' }],
  group_by: [{ key: 'task', value: 'Task' }],
  sort_options: [
    { key: 'host_task_count', value: 'Host task count' },
    { key: 'total_count', value: 'Total count' },
  ],
  task_id: [{ key: '9', value: 'Copy task' }],
  org_id: [{ key: '1', value: 'Default' }],
};

const tableData = {
  meta: {
    count: 1,
    legend: [
      {
        id: 7,
        name: 'copy',
        host_task_count: 12,
        elapsed: 90,
        extra_field: 'extra-value',
      },
    ],
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
afterEach(() => {
  server.resetHandlers();
  pageNavigate.mockClear();
  window.history.pushState({}, '', '/');
});
afterAll(() => server.close());

function renderBuilder(
  props: Partial<AnalyticsReportBuilderProps> = {},
  entry = '/?sort=-total_count'
) {
  window.history.pushState({}, '', entry);
  return render(
    <AwxActiveUserContext.Provider
      value={{ activeAwxUser: { is_superuser: true, is_system_auditor: false } as never }}
    >
      <PageAlertToasterProvider>
        <MemoryRouter initialEntries={[entry]}>
          <AnalyticsReportBuilder
            report_name="module_usage_by_task"
            main_url={awxAPI`/analytics/report/module_usage_by_task/`}
            navigate={pageNavigate}
            {...props}
          />
        </MemoryRouter>
      </PageAlertToasterProvider>
    </AwxActiveUserContext.Provider>
  );
}

describe('AnalyticsReportBuilder integration', () => {
  it('loads metadata, options, and table data', async () => {
    renderBuilder({}, '/');

    await waitFor(() => expect(screen.getByText('Module usage by task')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(screen.getByTestId('report-chart')).toBeInTheDocument();
    expect(screen.getByText('copy')).toBeInTheDocument();
  });

  it('shows a loading indicator before the report requests resolve', async () => {
    renderBuilder();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Module usage by task')).toBeInTheDocument(), {
      timeout: 10000,
    });
  });

  it('builds filters, clickable cells, chart types, and missing column values', async () => {
    const user = userEvent.setup();
    const processMainData = vi.fn();
    const processOptions = vi.fn();
    const processOptionsRequestPayload = vi.fn();
    const processDataRequestPayload = vi.fn();
    const processTableColumns = vi.fn();
    const rowKeyFn = vi.fn((row: { id: number }) => row.id);

    renderBuilder({
      processMainData,
      processOptions,
      processOptionsRequestPayload,
      processDataRequestPayload,
      processTableColumns,
      rowKeyFn,
    });

    await waitFor(() => expect(screen.getByText('Module usage by task')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(screen.getByText('Tasks report')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(processMainData).toHaveBeenCalled();
    expect(processOptions).toHaveBeenCalled();
    expect(processOptionsRequestPayload).toHaveBeenCalled();
    expect(processDataRequestPayload).toHaveBeenCalled();
    expect(processTableColumns).toHaveBeenCalled();
    expect(screen.getByTestId('report-chart')).toHaveTextContent('total_count for copy');

    await user.click(screen.getByRole('button', { name: 'Bar Chart' }));
    expect(screen.getByRole('button', { name: 'Bar Chart' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.click(screen.getByRole('button', { name: '12' }));
    expect(pageNavigate).toHaveBeenCalled();
  });

  it('renders preview mode and the automation calculator page sizes', async () => {
    renderBuilder({ previewMode: true, report_name: 'automation_calculator' });

    await waitFor(() => expect(screen.getByTestId('report-chart')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(screen.getByTestId('report-chart')).toHaveTextContent('copy');
    expect(screen.getByRole('button', { name: 'Bar Chart' })).toBeInTheDocument();
  });

  it('uses an empty chart type list and still renders the line chart', async () => {
    server.use(
      http.get(awxAPI`/analytics/report/module_usage_by_task/`, () =>
        HttpResponse.json({
          ...mainData,
          report: {
            ...mainData.report,
            name: '',
            description: '',
            layoutProps: {
              ...mainData.report.layoutProps,
              availableChartTypes: [''],
              clickableLinking: false,
              dataEndpoint: '/api/v1/analytics/report/module_usage_by_task/',
              optionsEndpoint: '/custom/options/module_usage_by_task_options/',
            },
          },
        })
      ),
      http.post(
        ({ request }) => request.url.includes('module_usage_by_task_options'),
        () => HttpResponse.json(optionsData)
      ),
      http.post(
        ({ request }) =>
          request.url.includes('module_usage_by_task') && !request.url.includes('options'),
        () => HttpResponse.json(tableData)
      )
    );

    renderBuilder();
    await waitFor(() => expect(screen.getByTestId('report-chart')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(screen.queryByRole('button', { name: 'Bar Chart' })).not.toBeInTheDocument();
  });

  it('keeps the page blank when the data legend is empty', async () => {
    const processTableColumns = vi.fn();
    server.use(
      http.post(awxAPI`/analytics/report/module_usage_by_task/*`, () =>
        HttpResponse.json({ meta: { count: 0, legend: [] } })
      )
    );

    renderBuilder({ processTableColumns });
    await waitFor(() => expect(processTableColumns).toHaveBeenCalled(), { timeout: 10000 });
    expect(screen.queryByText('Module usage by task')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows the options error keyword', async () => {
    server.use(
      http.post(
        ({ request }) => request.url.includes('module_usage_by_task_options'),
        () => HttpResponse.json({ error: { keyword: 'not-found' } }, { status: 500 })
      )
    );

    const view = renderBuilder();
    await waitFor(
      () => {
        expect(screen.getAllByText('Not Found').length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );
    view.unmount();
  }, 20000);

  it('shows an unknown error when the main report request fails', async () => {
    server.use(
      http.get(awxAPI`/analytics/report/module_usage_by_task/`, () => HttpResponse.error())
    );

    const view = renderBuilder();
    await waitFor(
      () => expect(screen.getByText('There was an error on the server.')).toBeInTheDocument(),
      { timeout: 10000 }
    );
    view.unmount();
  });

  it('shows an unauthorized error from the main report body', async () => {
    server.use(
      http.get(awxAPI`/analytics/report/module_usage_by_task/`, () =>
        HttpResponse.json({ error: { keyword: 'unauthorized' } }, { status: 401 })
      )
    );

    const view = renderBuilder();
    await waitFor(
      () =>
        expect(
          screen.getByText('Missing Authentication for Automation Analytics.')
        ).toBeInTheDocument(),
      { timeout: 10000 }
    );
    view.unmount();
  });

  it('reads granularity from the URL into the options payload', async () => {
    const processOptionsRequestPayload = vi.fn();
    renderBuilder({ processOptionsRequestPayload }, '/?granularity=yearly&sort=host_task_count');

    await waitFor(() => expect(screen.getByText('Module usage by task')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(processOptionsRequestPayload).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ granularity: 'yearly' })
    );
  });
});
