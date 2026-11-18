import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { userEvent } from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { IFilterState, PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import {
  resetTestSwrCache,
  SwrTestWrapper,
} from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxActiveUserContext } from '../../common/useAwxActiveUser';
import type { ChartSchemaElement } from '@ansible/react-json-chart-builder';
import { AutomationCalculator, AutomationCalculatorInternal } from './AutomationCalculator';

const chartSchema = [{ type: 'line' }] as ChartSchemaElement[];

vi.mock('../components/Chart', () => ({
  Chart: (props: {
    specificFunctions?: {
      labelFormat?: {
        customTooltipFormatting?: (input: { datum: { name?: string; y?: number } }) => string;
      };
    };
  }) => {
    const format = props.specificFunctions?.labelFormat?.customTooltipFormatting;
    const withName = format?.({ datum: { name: 'Deploy app', y: 12.5 } }) ?? '';
    const withoutName = format?.({ datum: { y: 12.5 } }) ?? '';
    return (
      <div data-testid="roi-chart">
        {withName}|{withoutName}
      </div>
    );
  },
}));

const optionsResponse = {
  cluster_id: [{ key: '1', value: 'Default' }],
  org_id: [{ key: '2', value: 'Org' }],
  template_id: [{ key: '3', value: 'Template' }],
  inventory_id: [{ key: '4', value: 'Inventory' }],
  quick_date_range: [{ key: 'roi_last_year', value: 'Last year' }],
  sort_options: [{ key: 'host_count', value: 'Host count' }],
};

const reportResponse = {
  meta: {
    count: 1,
    legend: [
      {
        id: '1',
        name: 'Deploy app',
        enabled: true,
        monetary_gain: 250,
        manual_effort_minutes: 30,
        successful_hosts_total: 2,
        elapsed: 100,
        host_count: 5,
        template_success_rate: 90,
        successful_hosts_savings: 40,
        failed_hosts_total: 0,
        total_count: 3,
        total_org_count: 1,
        total_cluster_count: 1,
        total_inventory_count: 1,
      },
    ],
  },
  monetary_gain_current_page: 250,
  monetary_gain_other_pages: 100,
  cost: { hourly_manual_labor_cost: 50, hourly_automation_cost: 5 },
};

const server = setupServer(
  http.post(awxAPI`/analytics/roi_templates/*`, () => HttpResponse.json(reportResponse)),
  http.post(awxAPI`/analytics/roi_templates_options/`, () => HttpResponse.json(optionsResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetTestSwrCache();
  window.history.pushState({}, '', '/');
});
afterAll(() => server.close());

function renderCalculator() {
  return render(
    <PageAlertToasterProvider>
      <SwrTestWrapper>
        <MemoryRouter initialEntries={['/?sort=host_count']}>
          <AutomationCalculator schema={chartSchema} />
        </MemoryRouter>
      </SwrTestWrapper>
    </PageAlertToasterProvider>
  );
}

function renderInternal() {
  return render(
    <PageAlertToasterProvider>
      <SwrTestWrapper>
        <MemoryRouter initialEntries={['/?sort=host_count&page=1&per_page=10']}>
          <AutomationCalculatorInternal
            schema={chartSchema}
            filterState={{ quick_date_range: ['roi_last_year'], org_id: ['2'] }}
            setFilterState={vi.fn()}
            sortOption={{ label: 'Host count', value: 'host_count' }}
            sortDirection="desc"
            setSortDirection={vi.fn()}
          />
        </MemoryRouter>
      </SwrTestWrapper>
    </PageAlertToasterProvider>
  );
}

describe('AutomationCalculator', () => {
  it('renders toolbar after options load', async () => {
    renderCalculator();
    await waitFor(() => expect(screen.getByText('Cluster')).toBeInTheDocument());
  });

  it('loads ROI data and renders chart and savings', async () => {
    renderInternal();
    await waitFor(() => expect(screen.getByTestId('roi-chart')).toBeInTheDocument());
    expect(screen.getByText('$350.00')).toBeInTheDocument();
    expect(screen.getByText('Deploy app')).toBeInTheDocument();
  });

  it('shows empty state when no templates match filters', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates/*`, () =>
        HttpResponse.json({
          meta: { count: 0, legend: [] },
          monetary_gain_current_page: 0,
          monetary_gain_other_pages: 0,
          cost: { hourly_manual_labor_cost: 0, hourly_automation_cost: 0 },
        })
      )
    );
    renderInternal();
    await waitFor(() => expect(screen.getByText(/No results found/i)).toBeInTheDocument());
  });

  it('displays savings total from loaded ROI templates', async () => {
    renderInternal();
    await waitFor(() => expect(screen.getByText('$350.00')).toBeInTheDocument());
    expect(screen.getByText('Total savings')).toBeInTheDocument();
  });

  it('formats chart tooltips for elapsed, percentage, and currency sort keys', async () => {
    const cases = [
      { value: 'elapsed', label: 'Elapsed', expected: '12.50 seconds' },
      { value: 'template_automation_percentage', label: 'Automation', expected: '12.50%' },
      { value: 'successful_hosts_savings', label: 'Savings', expected: '$12.50' },
      { value: 'failed_hosts_costs', label: 'Failed cost', expected: '$12.50' },
      { value: 'monetary_gain', label: 'Gain', expected: '$12.50' },
    ];

    for (const sortCase of cases) {
      const view = render(
        <PageAlertToasterProvider>
          <SwrTestWrapper>
            <MemoryRouter>
              <AutomationCalculatorInternal
                schema={chartSchema}
                filterState={{}}
                setFilterState={vi.fn()}
                sortOption={sortCase}
                sortDirection="asc"
                setSortDirection={vi.fn()}
              />
            </MemoryRouter>
          </SwrTestWrapper>
        </PageAlertToasterProvider>
      );
      await waitFor(() =>
        expect(screen.getByTestId('roi-chart')).toHaveTextContent(sortCase.expected)
      );
      expect(screen.getByTestId('roi-chart').textContent).toContain('|');
      view.unmount();
    }
  });

  it('shows the analytics disabled state when options fail for a non-admin', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates_options/`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    renderCalculator();
    await waitFor(() =>
      expect(
        screen.getByText('Automation Analytics is currently not enabled to send data.')
      ).toBeInTheDocument()
    );
  });

  it('shows a generic error when options fail for a superuser', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates_options/`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    render(
      <AwxActiveUserContext.Provider value={{ activeAwxUser: { is_superuser: true } as never }}>
        <PageAlertToasterProvider>
          <SwrTestWrapper>
            <MemoryRouter>
              <AutomationCalculator schema={chartSchema} />
            </MemoryRouter>
          </SwrTestWrapper>
        </PageAlertToasterProvider>
      </AwxActiveUserContext.Provider>
    );
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });

  it('shows an error when the ROI report request fails', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates/*`, () => HttpResponse.json({}, { status: 500 }))
    );
    render(
      <AwxActiveUserContext.Provider
        value={{ activeAwxUser: { is_system_auditor: true } as never }}
      >
        <PageAlertToasterProvider>
          <SwrTestWrapper>
            <MemoryRouter>
              <AutomationCalculatorInternal
                schema={chartSchema}
                filterState={{}}
                setFilterState={vi.fn()}
                sortOption={{ label: 'Host count', value: 'host_count' }}
                sortDirection="desc"
                setSortDirection={vi.fn()}
              />
            </MemoryRouter>
          </SwrTestWrapper>
        </PageAlertToasterProvider>
      </AwxActiveUserContext.Provider>
    );
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });

  it('keeps loading while options are in flight', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates_options/`, async () => {
        await delay(200);
        return HttpResponse.json(optionsResponse);
      })
    );
    renderCalculator();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Cluster')).toBeInTheDocument());
  });

  it('stays on the loading state when the saved sort is not an option', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates_options/`, () =>
        HttpResponse.json({
          ...optionsResponse,
          sort_options: [{ key: 'elapsed', value: 'Elapsed' }],
        })
      )
    );
    render(
      <PageAlertToasterProvider>
        <SwrTestWrapper>
          <MemoryRouter initialEntries={['/?sort=missing_sort']}>
            <AutomationCalculator schema={chartSchema} />
          </MemoryRouter>
        </SwrTestWrapper>
      </PageAlertToasterProvider>
    );
    await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument());
    expect(screen.queryByText('Cluster')).not.toBeInTheDocument();
  });

  it('omits filters whose option lists are empty', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates_options/`, () =>
        HttpResponse.json({
          ...optionsResponse,
          cluster_id: [],
          template_id: [],
          inventory_id: [],
          quick_date_range: [],
        })
      )
    );
    renderCalculator();
    await waitFor(() => expect(screen.getByText('Organization')).toBeInTheDocument());
    expect(screen.queryByText('Cluster')).not.toBeInTheDocument();
    expect(screen.queryByText('Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Inventory')).not.toBeInTheDocument();
  });

  it('reads filters, custom dates, and ascending sort from the URL', async () => {
    const bodies: Array<Record<string, unknown>> = [];
    server.use(
      http.post(awxAPI`/analytics/roi_templates_options/`, () =>
        HttpResponse.json({
          ...optionsResponse,
          sort_options: [
            { key: 'host_count', value: 'Host count' },
            { key: 'elapsed', value: 'Elapsed' },
          ],
        })
      ),
      http.post(awxAPI`/analytics/roi_templates/*`, async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(reportResponse);
      })
    );
    window.history.pushState(
      {},
      '',
      '/?clusters=1&orgs=2,8&templates=3&inventories=4&dates=roi_custom,2024-01-01,2024-12-31&sort=-elapsed'
    );
    render(
      <PageAlertToasterProvider>
        <SwrTestWrapper>
          <MemoryRouter>
            <AutomationCalculator schema={chartSchema} />
          </MemoryRouter>
        </SwrTestWrapper>
      </PageAlertToasterProvider>
    );
    await waitFor(() => expect(bodies.length).toBeGreaterThan(0));
    const body = bodies.at(-1);
    expect(body?.cluster_id).toEqual(['1']);
    expect(body?.org_id).toEqual(['2', '8']);
    expect(body?.template_id).toEqual(['3']);
    expect(body?.inventory_id).toEqual(['4']);
    expect(body?.sort_options).toBe('elapsed');
    expect(body?.sort_order).toBe('asc');
  });

  it('sends custom start and end dates from the filter state', async () => {
    const bodies: Array<Record<string, unknown>> = [];
    server.use(
      http.post(awxAPI`/analytics/roi_templates/*`, async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(reportResponse);
      })
    );
    render(
      <PageAlertToasterProvider>
        <SwrTestWrapper>
          <MemoryRouter>
            <AutomationCalculatorInternal
              schema={chartSchema}
              filterState={{
                quick_date_range: ['roi_custom', '2024-01-01', '2024-12-31'],
                org_id: ['2'],
              }}
              setFilterState={vi.fn()}
              sortOption={{ label: 'Elapsed', value: 'elapsed' }}
              sortDirection="asc"
              setSortDirection={vi.fn()}
            />
          </MemoryRouter>
        </SwrTestWrapper>
      </PageAlertToasterProvider>
    );
    await waitFor(() => expect(bodies.at(-1)?.quick_date_range).toBe('roi_custom'));
    expect(bodies.at(-1)?.start_date).toBe('2024-01-01');
    expect(bodies.at(-1)?.end_date).toBe('2024-12-31');
    expect(bodies.at(-1)?.sort_order).toBe('asc');
  });

  it('defaults the sort to host count when the URL has no sort', async () => {
    const bodies: Array<Record<string, unknown>> = [];
    server.use(
      http.post(awxAPI`/analytics/roi_templates/*`, async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(reportResponse);
      })
    );
    render(
      <PageAlertToasterProvider>
        <SwrTestWrapper>
          <MemoryRouter initialEntries={['/']}>
            <AutomationCalculator schema={chartSchema} />
          </MemoryRouter>
        </SwrTestWrapper>
      </PageAlertToasterProvider>
    );
    await waitFor(() => expect(bodies.at(-1)?.sort_options).toBe('host_count'));
    expect(bodies.at(-1)?.sort_order).toBe('desc');
    expect(bodies.at(-1)?.quick_date_range).toBe('roi_last_year');
  });

  it('resets an out-of-range page and clears filters from the empty state', async () => {
    const user = userEvent.setup();
    const bodies: Array<Record<string, unknown>> = [];
    server.use(
      http.post(awxAPI`/analytics/roi_templates/*`, async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({
          meta: { count: 1, legend: [] },
          monetary_gain_current_page: 0,
          monetary_gain_other_pages: 0,
          cost: { hourly_manual_labor_cost: 0, hourly_automation_cost: 0 },
        });
      })
    );
    window.history.pushState({}, '', '/?sort=host_count&page=99&per_page=10');

    function ClearableCalculator() {
      const [filterState, setFilterState] = useState<IFilterState>({
        org_id: ['2'],
        quick_date_range: ['roi_last_year'],
      });
      return (
        <AutomationCalculatorInternal
          schema={chartSchema}
          filterState={filterState}
          setFilterState={setFilterState}
          sortOption={{ label: 'Host count', value: 'host_count' }}
          sortDirection="desc"
          setSortDirection={vi.fn()}
        />
      );
    }

    render(
      <PageAlertToasterProvider>
        <SwrTestWrapper>
          <MemoryRouter>
            <ClearableCalculator />
          </MemoryRouter>
        </SwrTestWrapper>
      </PageAlertToasterProvider>
    );
    await waitFor(() => expect(screen.getByText(/No results found/i)).toBeInTheDocument());
    await waitFor(() => expect(bodies.some((body) => body.offset === '0')).toBe(true));
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    await waitFor(() => expect(bodies.at(-1)?.org_id).toEqual([]));
  });

  it('ignores a report response that is aborted while unmounting', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates/*`, async () => {
        await delay(300);
        return HttpResponse.json(reportResponse);
      })
    );
    const view = renderInternal();
    view.unmount();
    await delay(400);
    expect(screen.queryByText('Deploy app')).not.toBeInTheDocument();
  });
});
