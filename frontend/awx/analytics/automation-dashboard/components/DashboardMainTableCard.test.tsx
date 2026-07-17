/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  IToolbarFilter,
  PageAlertToasterProvider,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { DashboardMainTableCard } from './DashboardMainTableCard';
import type { IAutomationDashboardView, IDashboardDetails, IJobTemplate } from '../types';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockUseAwxActiveUser } = vi.hoisted(() => ({
  mockUseAwxActiveUser: vi.fn(),
}));

vi.mock('../../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: mockUseAwxActiveUser,
}));

// ─── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer(
  http.put(/template_metadata\/1\//, () =>
    HttpResponse.json({
      time_taken_manually_execute_minutes: 42,
      time_taken_create_automation_minutes: 60,
    })
  ),
  http.put(/subscription_costs/, async ({ request }) => HttpResponse.json(await request.json()))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockItem: IJobTemplate = {
  id: 1,
  template_name: 'Test Template',
  runs: 5,
  num_hosts: 3,
  time_taken_manually_execute_minutes: 30,
  time_taken_create_automation_minutes: 60,
  elapsed: '1800',
  elapsed_str: '00:30:00',
  automated_costs: 100,
  manual_costs: 200,
  savings: 100,
};

const mockDetails: IDashboardDetails = {
  total_number_of_successful_jobs: 10,
  total_number_of_failed_jobs: 2,
  total_number_of_unique_hosts: 5,
  cost_of_automated_execution: 500,
  cost_of_manual_automation: 1000,
  total_hours_of_automation: 100,
  total_saving: 500,
  total_time_saving: 50,
  total_number_of_host_job_runs: 15,
  total_number_of_job_runs: 12,
  top_projects: [{ id: 1, name: 'Project A', execution_count: 3 }],
  top_users: [{ id: 1, name: 'User A', execution_count: 2 }],
  job_chart: { kind: 'day', items: [{ label: '2024-01-01', value: 1 }] },
  host_chart: { kind: 'day', items: [{ label: '2024-01-01', value: 1 }] },
};

const mockRefresh = vi.fn();

const mockToolbarFilters: IToolbarFilter[] = [
  {
    type: ToolbarFilterType.DateRange,
    key: 'period',
    label: 'Period',
    query: 'period',
    options: [
      { label: 'Last 7 days', value: 'last_7_days' },
      { label: 'Custom', value: 'custom', isCustom: true },
    ],
    placeholder: 'Filter by period',
    isRequired: true,
  },
];

type MainTableView = IAutomationDashboardView['mainTableView'];

function buildMainTableView(overrides: Partial<MainTableView> = {}): MainTableView {
  const base: MainTableView = {
    page: 1,
    setPage: vi.fn(),
    perPage: 10,
    setPerPage: vi.fn(),
    sort: 'template_name',
    setSort: vi.fn(),
    sortDirection: 'asc',
    setSortDirection: vi.fn(),
    filterState: { period: ['last_7_days'] },
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
    itemCount: 1,
    pageItems: [mockItem],
    refresh: vi.fn(),
    limitFiltersToOneOrOperation: true,
    updateItem: vi.fn(),
    error: undefined,
  };
  return { ...base, ...overrides } as MainTableView;
}

function buildProps(overrides: Partial<IAutomationDashboardView> = {}): IAutomationDashboardView {
  return {
    mainTableView: buildMainTableView(),
    toolbarFilters: mockToolbarFilters,
    details: mockDetails,
    detailsError: undefined,
    detailsLoading: false,
    costState: {
      id: 1,
      monthly_subscription_cost: 100,
      engineer_avg_hourly_rate: 50,
      include_template_creation_time_in_costs: false,
    },
    setCostState: vi.fn(),
    loading: false,
    refresh: mockRefresh,
    exportCsv: vi.fn(),
    isFilterStateDefault: true,
    registerClearCallback: vi.fn(),
    ...overrides,
  };
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <SWRConfig
        value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}
      >
        <PageAlertToasterProvider>{children}</PageAlertToasterProvider>
      </SWRConfig>
    </MemoryRouter>
  );
}

function renderCard(props: IAutomationDashboardView = buildProps()) {
  return render(<DashboardMainTableCard {...props} />, { wrapper: Wrapper });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Triggers a debounce-based save: types a value and waits for the debounce (600 ms) to fire.
// Note: tab/blur does NOT trigger the save — the PUT is sent by the debounce after typing stops.
async function triggerInputSave(value = '50') {
  const user = userEvent.setup();
  renderCard();
  const input = screen.getByTestId('time_taken_manually_execute_minutes_1');
  await user.clear(input);
  await user.type(input, value);
  return { user, input };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardMainTableCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefresh.mockResolvedValue(undefined);
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: true } });
  });

  // --- Value cards ---

  test('should render all four value cards by title', () => {
    renderCard();
    expect(screen.getByText('Cost of manual automation')).toBeInTheDocument();
    expect(screen.getByText('Cost of automated execution')).toBeInTheDocument();
    expect(screen.getByText('Total savings/cost avoided')).toBeInTheDocument();
    expect(screen.getByText('Total hours saved/avoided')).toBeInTheDocument();
  });

  test('should display details values in value cards', () => {
    renderCard();
    expect(
      within(screen.getByTestId('cost-manual-automation-card')).getByText('$1,000.00')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('cost-automated-execution-card')).getByText('$500.00')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('total-savings-card')).getByText('$500.00')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('total-hours-saved-card')).getByText(/50 h/)
    ).toBeInTheDocument();
  });

  test('should display 0 in value cards when details has zero values', () => {
    renderCard(
      buildProps({
        details: {
          ...mockDetails,
          cost_of_manual_automation: 0,
          total_saving: 0,
        },
      })
    );
    expect(
      within(screen.getByTestId('cost-manual-automation-card')).getByText('$0.00')
    ).toBeInTheDocument();
    expect(within(screen.getByTestId('total-savings-card')).getByText('$0.00')).toBeInTheDocument();
  });

  test('should display - in all value cards when details is undefined', () => {
    renderCard(buildProps({ details: undefined }));
    expect(
      within(screen.getByTestId('cost-manual-automation-card')).getByText('-')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('cost-automated-execution-card')).getByText('-')
    ).toBeInTheDocument();
    expect(within(screen.getByTestId('total-savings-card')).getByText('-')).toBeInTheDocument();
    expect(within(screen.getByTestId('total-hours-saved-card')).getByText('-')).toBeInTheDocument();
  });

  test('should not render "h" suffix when total_time_saving is 0', () => {
    renderCard(
      buildProps({
        details: {
          ...mockDetails,
          total_time_saving: 0,
        },
      })
    );
    expect(
      within(screen.getByTestId('total-hours-saved-card')).getByText('0', { exact: true })
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('total-hours-saved-card')).queryByText(/0\s*h/)
    ).not.toBeInTheDocument();
  });

  test('should show table columns when loading is false', () => {
    renderCard();
    expect(screen.getByRole('columnheader', { name: /Template Name/i })).toBeInTheDocument();
    expect(document.querySelector('.pf-v6-c-skeleton')).not.toBeInTheDocument();
  });

  // --- Table columns ---

  test('should render all base column headers', () => {
    renderCard();
    expect(screen.getByRole('columnheader', { name: /Template Name/i })).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Number of job executions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Time taken to manually execute/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Running time/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Automated cost/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Manual cost/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Savings/i })).toBeInTheDocument();
  });

  test('should show "time taken to create automation" column when include_template_creation_time_in_costs is true', () => {
    renderCard(
      buildProps({
        costState: {
          id: 1,
          monthly_subscription_cost: 100,
          engineer_avg_hourly_rate: 50,
          include_template_creation_time_in_costs: true,
        },
      })
    );
    expect(
      screen.getByRole('columnheader', { name: /Time taken to create automation/i })
    ).toBeInTheDocument();
  });

  test('should hide "time taken to create automation" column when include_template_creation_time_in_costs is false', () => {
    renderCard();
    expect(
      screen.queryByRole('columnheader', { name: /Time taken to create automation/i })
    ).not.toBeInTheDocument();
  });

  test('should hide "time taken to create automation" column when costState is undefined', () => {
    renderCard(buildProps({ costState: undefined }));
    expect(
      screen.queryByRole('columnheader', { name: /Time taken to create automation/i })
    ).not.toBeInTheDocument();
  });

  // --- Sorting ---

  test('should call setSort when a sortable column header is clicked', async () => {
    const user = userEvent.setup();
    const setSort = vi.fn();
    renderCard(buildProps({ mainTableView: buildMainTableView({ setSort }) }));

    await user.click(screen.getByRole('button', { name: /Number of job executions/i }));

    expect(setSort).toHaveBeenCalledWith('runs');
  });

  test('should call setSortDirection to desc when the active sort column is clicked again', async () => {
    const user = userEvent.setup();
    const setSortDirection = vi.fn();
    renderCard(
      buildProps({
        mainTableView: buildMainTableView({ sort: 'template_name', setSortDirection }),
      })
    );

    await user.click(screen.getByRole('button', { name: /Template Name/i }));

    expect(setSortDirection).toHaveBeenCalledWith('desc');
  });

  // --- Cell rendering ---

  test('should render cell values from pageItems', () => {
    renderCard();
    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('00:30:00')).toBeInTheDocument();
  });

  test('should render elapsed_str (not raw elapsed) in the Running time column', () => {
    renderCard();
    expect(screen.getByText('00:30:00')).toBeInTheDocument();
    expect(screen.queryByText('1800')).not.toBeInTheDocument();
  });

  test('should format automated_costs, manual_costs and savings as currency', () => {
    renderCard();
    // automated_costs (100) and savings (100) both render as $100.00
    expect(screen.getAllByText('$100.00')).toHaveLength(2);
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  test('should render input for time_taken_manually_execute_minutes column', () => {
    renderCard();
    expect(screen.getByTestId('time_taken_manually_execute_minutes_1')).toBeInTheDocument();
  });

  test('should render input for time_taken_create_automation_minutes when column is visible', () => {
    renderCard(
      buildProps({
        costState: {
          id: 1,
          monthly_subscription_cost: 100,
          engineer_avg_hourly_rate: 50,
          include_template_creation_time_in_costs: true,
        },
      })
    );
    expect(screen.getByTestId('time_taken_create_automation_minutes_1')).toBeInTheDocument();
  });

  // --- Superuser vs non-superuser cell rendering ---

  test('should show plain value for time_taken_manually_execute_minutes when not superuser', () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    renderCard();
    expect(screen.queryByTestId('time_taken_manually_execute_minutes_1')).not.toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('should show plain value for time_taken_create_automation_minutes when not superuser and column is visible', () => {
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: false } });
    renderCard(
      buildProps({
        costState: {
          id: 1,
          monthly_subscription_cost: 100,
          engineer_avg_hourly_rate: 50,
          include_template_creation_time_in_costs: true,
        },
      })
    );
    expect(screen.queryByTestId('time_taken_create_automation_minutes_1')).not.toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  // --- Toolbar row ---

  test('should disable export CSV button when loading is true', () => {
    renderCard(buildProps({ loading: true }));
    expect(screen.getByTestId('dashboard-export-button-csv')).toBeDisabled();
  });

  test('should enable export CSV button for superuser with data', () => {
    renderCard();
    expect(screen.getByTestId('export-as-csv')).not.toBeDisabled();
  });

  test('should disable export CSV when itemCount is 0', () => {
    renderCard(buildProps({ mainTableView: buildMainTableView({ itemCount: 0, pageItems: [] }) }));
    expect(screen.getByTestId('dashboard-export-button-csv')).toBeDisabled();
  });

  test('should disable export CSV when a required toolbar filter is missing a value', () => {
    renderCard(buildProps({ mainTableView: buildMainTableView({ filterState: {} }) }));
    expect(screen.getByTestId('dashboard-export-button-csv')).toBeDisabled();
  });

  test('should disable export CSV when mainTableView itemCount is undefined', () => {
    renderCard(
      buildProps({
        mainTableView: buildMainTableView({ itemCount: undefined as unknown as number }),
      })
    );
    expect(screen.getByTestId('dashboard-export-button-csv')).toBeDisabled();
  });

  test('should call exportCsv with reportType when dropdown option is selected', async () => {
    const user = userEvent.setup();
    const exportCsv = vi.fn().mockResolvedValue(undefined);
    renderCard(buildProps({ exportCsv }));

    await user.click(screen.getByTestId('export-as-csv'));
    await user.click(screen.getByRole('menuitem', { name: 'Summary' }));

    await waitFor(() => expect(exportCsv).toHaveBeenCalledWith('summary'));
  });

  // --- Empty state ---

  test('should render empty state when pageItems is empty', () => {
    renderCard(buildProps({ mainTableView: buildMainTableView({ itemCount: 0, pageItems: [] }) }));
    expect(screen.getByText('No automation data yet')).toBeInTheDocument();
  });

  test('should show default empty state when isFilterStateDefault is true, even if a filter is set', () => {
    renderCard(
      buildProps({
        isFilterStateDefault: true,
        mainTableView: buildMainTableView({
          itemCount: 0,
          pageItems: [],
          filterState: { template_name: ['Test'] },
        }),
      })
    );
    expect(screen.getByText('No automation data yet')).toBeInTheDocument();
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });

  test('should show filtered no-results state instead of default empty state when isFilterStateDefault is false', () => {
    const clearAllFilters = vi.fn();
    renderCard(
      buildProps({
        isFilterStateDefault: false,
        mainTableView: buildMainTableView({
          itemCount: 0,
          pageItems: [],
          filterState: { template_name: ['Test'] },
          clearAllFilters,
        }),
      })
    );
    expect(screen.queryByText('No automation data yet')).not.toBeInTheDocument();
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  // --- onTableInputChange: success ---

  test('should show success alert after successful save', async () => {
    await triggerInputSave();
    await waitFor(() =>
      expect(
        screen.getByText(/Template metadata for Test Template updated successfully/i)
      ).toBeInTheDocument()
    );
  });

  test('should call refresh after successful put', async () => {
    await triggerInputSave();
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  test('should show warning alert when refresh fails after successful put', async () => {
    mockRefresh.mockRejectedValueOnce(new Error('Network error'));
    await triggerInputSave();
    await waitFor(() =>
      expect(screen.getByText(/Update saved but failed to refresh view/i)).toBeInTheDocument()
    );
  });

  test('should not trigger put when value is unchanged', async () => {
    const user = userEvent.setup();
    let putCalled = false;
    server.use(
      http.put(/template_metadata\/1\//, () => {
        putCalled = true;
        return HttpResponse.json({});
      })
    );
    renderCard();

    const input = screen.getByTestId('time_taken_manually_execute_minutes_1');
    await user.click(input);
    await user.tab(); // blur without typing — no debounce scheduled, value=30 unchanged

    await new Promise((r) => setTimeout(r, 700));
    expect(putCalled).toBe(false);
  });

  // --- onTableInputChange: network error ---

  test('should show danger alert on network error', async () => {
    server.use(http.put(/template_metadata\/1\//, () => HttpResponse.error()));
    await triggerInputSave();
    await waitFor(() =>
      expect(
        screen.getByText(/Failed to update template metadata for Test Template/i)
      ).toBeInTheDocument()
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  // --- onTableInputChange: validation error (RequestError 422) ---

  test('should show danger alert and render field error on 422 response', async () => {
    server.use(
      http.put(/template_metadata\/1\//, () =>
        HttpResponse.json(
          { time_taken_manually_execute_minutes: ['Value too large.'] },
          { status: 422 }
        )
      )
    );
    await triggerInputSave();
    await waitFor(() =>
      expect(
        screen.getByText(/Failed to update template metadata for Test Template/i)
      ).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.getByText('Value too large.')).toBeInTheDocument());
  });

  test('should clear field error on next successful save after 422', async () => {
    server.use(
      http.put(
        /template_metadata\/1\//,
        () =>
          HttpResponse.json(
            { time_taken_manually_execute_minutes: ['Too large'] },
            { status: 422 }
          ),
        { once: true }
      )
    );
    const { user, input } = await triggerInputSave();
    await waitFor(() => expect(screen.getByText('Too large')).toBeInTheDocument());

    await user.clear(input);
    await user.type(input, '50');
    await waitFor(() => expect(screen.queryByText('Too large')).not.toBeInTheDocument());
  });
});
